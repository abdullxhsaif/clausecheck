# Changelog

## [1.1.0] — 2026-07-23

### Security
- **Server-side credit enforcement (fixes paywall bypass).** `/api/generate` now
  reads the caller's credit balance from Firestore (via the REST API, using the
  user's own ID token as bearer — no service-account secret) and rejects requests
  with `402` when credits are exhausted. Previously credits were only enforced in
  the client, so an authenticated user could call the endpoint directly for
  unlimited analyses. Credits are decremented server-side only after a successful
  analysis, and the authoritative balance is returned to the client.

### Added
- **Analysis history.** Each successful analysis is persisted to the
  `clausecheck_users/{uid}/analyses` subcollection, and the dashboard shows a
  "Recent analyses" list (document type, flag count, overall risk, relative time).
  This delivers the "Analysis history" capability previously advertised on Pricing.

### Changed
- `AuthContext` now exposes `syncCredits(n)` to mirror the server-authoritative
  balance; the client no longer decrements credits locally.

## [1.0.0] — 2026-07-11

Initial release.

### Added
- Landing page with hero, features, how-it-works, and CTA sections.
- Email/Password + Google authentication via Firebase; GitHub/Facebook buttons wired with graceful `auth/operation-not-allowed` handling.
- `AuthContext` with `onAuthStateChanged`, auto-provisioning of the Firestore user doc (5 free credits).
- Analyzer dashboard: paste-to-analyze, sample loader, skeleton loader, empty/error states, credit decrement.
- `/api/generate` serverless function: Firebase ID-token verification against Google JWKS (jose), keyless Pollinations AI, structured-JSON clause output, per-instance rate limiting.
- Pricing page with monthly/yearly toggle and Stripe Payment Link checkout (prefilled email).
- Premium sidebar dashboard (credits progress bar, upgrade CTA, sign-out) with mobile drawer.
- Route-level code splitting (`React.lazy`), Firebase/React vendor chunk splitting, instant boot spinner.
- SEO metadata, Open Graph, favicon, `robots.txt`, `sitemap.xml`.
- Firestore security rules (decrease-only credits, plan-locked updates).
