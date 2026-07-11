# Changelog

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
