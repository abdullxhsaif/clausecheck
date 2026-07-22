import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ScanLine, Sparkles, Loader2, RotateCcw, FileWarning, Info, History, FileText } from 'lucide-react'
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore'
import Sidebar from '../components/Sidebar.jsx'
import AnalysisResult from '../components/AnalysisResult.jsx'
import ResultSkeleton from '../components/ResultSkeleton.jsx'
import RiskBadge from '../components/RiskBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { auth, db } from '../lib/firebase.js'

const SAMPLE = `This Agreement renews automatically for successive 12-month terms unless Customer provides written notice of non-renewal at least 90 days prior to the end of the then-current term. Company may modify these terms at any time in its sole discretion. Customer waives any right to participate in a class action and agrees to binding arbitration. Company's total liability shall not exceed the fees paid in the prior one (1) month.`

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Dashboard() {
  const { profile, syncCredits } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  const credits = profile?.credits ?? 0
  const noCredits = credits <= 0

  const loadHistory = useCallback(async (uid) => {
    try {
      const q = query(
        collection(db, 'clausecheck_users', uid, 'analyses'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const snap = await getDocs(q)
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      /* history is best-effort */
    }
  }, [])

  useEffect(() => {
    const uid = auth?.currentUser?.uid
    if (uid) loadHistory(uid)
  }, [loadHistory])

  const analyze = async () => {
    setError('')
    if (text.trim().length < 40) { setError('Please paste at least a paragraph of contract text.'); return }
    if (noCredits) { setError('You’re out of credits. Upgrade to keep analyzing.'); return }
    const currentUser = auth?.currentUser
    if (!currentUser) { setError('Your session has expired — please sign in again.'); return }
    setLoading(true)
    setResult(null)
    try {
      const callApi = async (forceRefresh) => {
        const token = await currentUser.getIdToken(forceRefresh)
        return fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text }),
        })
      }
      // A cached ID token can be briefly stale; if the server rejects it,
      // force a refresh and retry once before surfacing an auth error.
      let res = await callApi(false)
      if (res.status === 401) res = await callApi(true)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
      // Mirror the server-authoritative credit balance.
      if (typeof data.creditsLeft === 'number') syncCredits(data.creditsLeft)
      // Persist a lightweight history record (rules allow create for own docs).
      try {
        await addDoc(collection(db, 'clausecheck_users', currentUser.uid, 'analyses'), {
          documentType: data.documentType || 'Document',
          overallRisk: data.overallRisk || 'low',
          clauseCount: Array.isArray(data.clauses) ? data.clauses.length : 0,
          createdAt: Date.now(),
        })
        loadHistory(currentUser.uid)
      } catch { /* non-fatal */ }
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setText(''); setResult(null); setError('') }

  return (
    <div className="min-h-screen flex bg-[#0b1120]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-5 h-16 border-b border-white/10 sticky top-0 bg-[#0b1120] z-30">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu className="w-6 h-6" /></button>
          <span className="font-bold">Analyzer</span>
          <span className="text-sm text-brand-300 font-semibold">{credits} left</span>
        </div>

        <div className="max-w-3xl mx-auto px-5 py-8">
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-extrabold">Analyze a document</h1>
          </div>
          <p className="text-gray-400 mb-6">Paste a contract or Terms of Service. ClauseCheck flags what matters.</p>

          <div className="card p-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your contract, lease, NDA, or Terms of Service here…"
              rows={9}
              className="w-full resize-y rounded-lg bg-white/5 border border-white/10 p-4 text-gray-100 placeholder-gray-500 focus:border-brand-400 outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
              <div className="flex gap-2 text-sm">
                <button onClick={() => setText(SAMPLE)} className="text-brand-300 hover:text-brand-200">Try a sample</button>
                <span className="text-gray-600">·</span>
                <button onClick={reset} className="text-gray-400 hover:text-white inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Clear</button>
              </div>
              <button
                onClick={analyze}
                disabled={loading || noCredits}
                className="px-5 py-2.5 rounded-lg bg-brand-500 text-[#0b1120] font-semibold hover:bg-brand-400 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
          </div>

          {noCredits && (
            <div className="mt-4 card p-4 flex items-start gap-3 border-amber-500/30">
              <FileWarning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">You’re out of credits. <Link to="/pricing" className="text-brand-300 font-semibold">Upgrade your plan</Link> to keep analyzing.</p>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-8">
            {loading && <ResultSkeleton />}
            {!loading && result && <AnalysisResult data={result} />}
            {!loading && !result && !error && (
              <div className="text-center text-gray-500 py-12">
                <Info className="w-8 h-8 mx-auto mb-3 opacity-60" />
                Your analysis will appear here.
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="mt-10">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                <History className="w-4 h-4 text-brand-400" /> Recent analyses
              </h2>
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="card px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm text-gray-200 truncate">{h.documentType || 'Document'}</span>
                      <span className="text-xs text-gray-500 shrink-0">· {h.clauseCount || 0} flags</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <RiskBadge level={h.overallRisk} />
                      <span className="text-xs text-gray-500">{h.createdAt ? timeAgo(h.createdAt) : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-10 text-xs text-gray-600 text-center">
            ClauseCheck provides informational analysis only and is not a substitute for legal advice.
          </p>
        </div>
      </main>
    </div>
  )
}
