import { jwtVerify, createRemoteJWKSet } from 'jose'

// Verify Firebase ID tokens against Google's public JWKS — no service account needed.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
)

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID

// simple in-memory rate limiter (per warm instance)
const hits = new Map()
function rateLimited(uid) {
  const now = Date.now()
  const windowMs = 60_000
  const max = 12
  const arr = (hits.get(uid) || []).filter((t) => now - t < windowMs)
  arr.push(now)
  hits.set(uid, arr)
  return arr.length > max
}

// --- Server-side credit enforcement via the Firestore REST API ---------------
// Uses the caller's own Firebase ID token as the bearer, so no service-account
// secret is needed and Firestore security rules still apply (read own doc;
// decrease-only credit updates). This keeps credit limits enforced on the
// backend — the client counter alone can be bypassed by calling this endpoint
// directly.
function userDocUrl(uid) {
  return `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/clausecheck_users/${uid}`
}

async function getCredits(uid, idToken) {
  const res = await fetch(userDocUrl(uid), {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (res.status === 404) return { missing: true }
  if (!res.ok) return { error: true }
  const doc = await res.json()
  const f = doc?.fields?.credits
  const raw = f?.integerValue ?? f?.doubleValue ?? '0'
  return { credits: Math.floor(Number(raw)) || 0 }
}

async function setCredits(uid, idToken, credits) {
  await fetch(`${userDocUrl(uid)}?updateMask.fieldPaths=credits`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { credits: { integerValue: String(credits) } } }),
  })
}

const SYSTEM_PROMPT = `You are ClauseCheck, an expert contract and Terms-of-Service analyst.
Analyze the agreement text the user provides and return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "documentType": "string (e.g. 'SaaS Terms of Service', 'Employment Agreement')",
  "overallRisk": "low" | "medium" | "high",
  "summary": "2-3 sentence plain-English overview",
  "clauses": [
    {
      "title": "short clause name",
      "severity": "low" | "medium" | "high",
      "quote": "the relevant phrase or paraphrase from the document",
      "explanation": "plain-English why this matters to the signer",
      "suggestion": "concrete negotiation or action tip"
    }
  ]
}
Flag 3-8 of the most important clauses. Focus on: auto-renewal, liability caps, indemnity, arbitration/class-action waivers, data/IP rights, termination, unilateral changes, hidden fees, non-compete. Keep each explanation and suggestion concise (1-2 sentences). Be accurate and neutral. If text is not a contract, set overallRisk "low" and explain in summary.`

async function callPollinations(userPrompt, apiKey) {
  const body = {
    model: 'openai',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    // Force a single clean JSON object and give it enough room so a full
    // 3-8 clause analysis is never truncated mid-response (the cause of the
    // previous "unexpected response" 502s). reasoning_effort keeps the model
    // from spending the token budget on hidden reasoning.
    response_format: { type: 'json_object' },
    max_tokens: 8000,
    reasoning_effort: 'low',
  }
  const headers = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (res.ok) {
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  }
  // fallback to GET endpoint
  const enc = encodeURIComponent(`${SYSTEM_PROMPT}\n\nDOCUMENT:\n${userPrompt}`)
  const res2 = await fetch(`https://text.pollinations.ai/${enc}?model=openai&json=true`)
  return res2.ok ? await res2.text() : ''
}

// Balance any unclosed strings/objects/arrays so a slightly truncated
// response can still be parsed. Trailing incomplete tokens are dropped.
function repairJson(s) {
  let inStr = false, esc = false
  const stack = []
  let safe = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === '"') { inStr = false; safe = i + 1 }
      continue
    }
    if (c === '"') inStr = true
    else if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']')
    else if (c === '}' || c === ']') { stack.pop(); safe = i + 1 }
    else if (c === ',') safe = i // drop the incomplete item after the last comma
  }
  let out = s.slice(0, safe)
  // rebuild the open-structure stack for the trimmed string
  inStr = false; esc = false
  const st2 = []
  for (let i = 0; i < out.length; i++) {
    const c = out[i]
    if (inStr) {
      if (esc) esc = false
      else if (c === '\\') esc = true
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === '{' || c === '[') st2.push(c === '{' ? '}' : ']')
    else if (c === '}' || c === ']') st2.pop()
  }
  if (inStr) out += '"'
  for (let i = st2.length - 1; i >= 0; i--) out += st2[i]
  return out
}

function extractJson(text) {
  if (!text) return null
  let t = text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim()
  const start = t.indexOf('{')
  if (start === -1) return null
  t = t.slice(start)
  const end = t.lastIndexOf('}')
  const candidate = end !== -1 ? t.slice(0, end + 1) : t
  try {
    return JSON.parse(candidate)
  } catch {
    try {
      return JSON.parse(repairJson(t))
    } catch {
      return null
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) {
      res.status(401).json({ error: 'Missing auth token' })
      return
    }
    if (!PROJECT_ID) {
      res.status(500).json({ error: 'Server is misconfigured (missing project id).' })
      return
    }
    let uid
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${PROJECT_ID}`,
        audience: PROJECT_ID,
      })
      uid = payload.sub
    } catch {
      res.status(401).json({ error: 'Invalid token' })
      return
    }
    if (rateLimited(uid)) {
      res.status(429).json({ error: 'Too many requests. Slow down a moment.' })
      return
    }

    const { text } = req.body || {}
    if (!text || typeof text !== 'string' || text.trim().length < 40) {
      res.status(400).json({ error: 'Please paste at least a paragraph of contract text.' })
      return
    }

    // Enforce credits on the server before spending any inference.
    const bal = await getCredits(uid, token)
    if (bal.missing) {
      res.status(403).json({ error: 'Account not found. Please reload and sign in again.' })
      return
    }
    if (bal.error) {
      res.status(502).json({ error: 'Could not verify your credit balance. Please try again.' })
      return
    }
    if (bal.credits <= 0) {
      res.status(402).json({ error: 'You’re out of credits. Upgrade to keep analyzing.' })
      return
    }

    const clipped = text.slice(0, 16000)
    const userKey = req.headers['x-user-ai-key'] || undefined

    const raw = await callPollinations(clipped, userKey)
    const parsed = extractJson(raw)
    if (!parsed || !Array.isArray(parsed.clauses)) {
      res.status(502).json({ error: 'The analyzer returned an unexpected response. Please try again.' })
      return
    }

    // Decrement only after a successful analysis. Rules permit decrease-only
    // updates, so this succeeds with the user's own token.
    const creditsLeft = Math.max(0, bal.credits - 1)
    try { await setCredits(uid, token, creditsLeft) } catch { /* non-fatal */ }

    res.status(200).json({ ...parsed, creditsLeft })
  } catch (e) {
    res.status(500).json({ error: 'Server error analyzing document.' })
  }
}
