# ClauseCheck — AI Contract & Terms Risk Analyzer

**Live demo:** https://clausecheck-orcin.vercel.app

ClauseCheck reads contracts and Terms of Service for you. Paste any agreement and it flags the risky clauses in plain English, scores their severity, and tells you what to negotiate — no legalese required.

## Why

Most people sign contracts, leases, NDAs, and Terms of Service without reading the fine print — and the clauses that actually cost or bind you (auto-renewal, liability caps, arbitration, IP assignment) are buried. ClauseCheck surfaces them in seconds.

## Features

- **Clause-by-clause analysis** — paste any agreement, get every risky clause surfaced.
- **Severity scoring** — each flag rated low / medium / high, plus an overall document risk.
- **Plain-English explanations** — what the clause means for you, without the jargon.
- **Negotiation tips** — a concrete suggestion for every flag.
- **Auth** — Email/Password + Google (GitHub / Facebook wired, enable when ready).
- **Usage credits** — 5 free analyses; Pro and Team plans via Stripe.
- **Premium responsive UI** — sidebar dashboard, mobile drawer, skeleton loaders, empty/error states.

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS (JavaScript, no TypeScript)
- **Auth & data:** Firebase Authentication + Firestore
- **AI:** Serverless `/api/generate` proxy (keyless Pollinations by default; optional user key)
- **Payments:** Stripe Payment Links
- **Hosting:** Vercel

## Architecture

```
Browser (React SPA)
  |  Firebase ID token
  v
/api/generate  (Vercel serverless)
  |  verifies token against Google JWKS (jose) — no service account
  v
Pollinations AI  -> structured JSON (clauses, severity, tips)
```

Firestore stores a per-user document: `{ email, plan, credits, createdAt }`. Security rules allow a user to read/create their own doc and only *decrease* credits (plan unchanged), preventing client-side credit or plan tampering. Token verification uses Google's public JWKS, so no Firebase service-account secret is ever needed on the server.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full breakdown.

## Getting started

> **No credentials are committed to this repo.** All config is read from environment variables, so you provide your own values in a local `.env` file (never committed).

```bash
git clone https://github.com/abdullxhsaif/clausecheck.git
cd clausecheck
npm install
cp .env.example .env    # then fill in the values below
npm run dev             # http://localhost:5173
```

Build for production with `npm run build` (output in `dist/`).

### Environment variables

Create a `.env` from `.env.example` and fill these in. All are **public** client values (safe to expose in the browser bundle) — the Firebase web keys are protected by Firestore security rules and authorized domains, not by secrecy.

| Variable | Where to get it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings → your web app → SDK config |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |
| `VITE_STRIPE_PRICE_PRO_MONTHLY` / `_YEARLY` | Stripe → Payment Links |
| `VITE_STRIPE_PRICE_TEAM_MONTHLY` / `_YEARLY` | Stripe → Payment Links |

On Vercel, add these same variables under **Project → Settings → Environment Variables**, then redeploy.

## Plans

| Plan | Price | Analyses |
|---|---|---|
| Free | $0 | 5 total |
| Pro | $15/mo ($144/yr) | 150 / month |
| Team | $49/mo ($468/yr) | 600 / month |

## Roadmap

- PDF / DOCX upload and parsing
- Side-by-side clause comparison across document versions
- Saved analysis history and shareable reports
- Team workspaces with role-based access

## Disclaimer

ClauseCheck provides informational analysis only and is **not** a substitute for professional legal advice.

## License

MIT
