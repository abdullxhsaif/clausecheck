# Build Playbook — ClauseCheck

Lessons and repeatable steps from building and shipping ClauseCheck.

## What worked

- **Keyless AI first.** Defaulting `/api/generate` to Pollinations means no secret AI key is required to ship. The endpoint still accepts an optional user-supplied key header for higher quality.
- **JWKS token verification.** Verifying Firebase ID tokens against Google's public JWKS with `jose` avoids needing a Firebase service-account secret on the server entirely.
- **Decrease-only Firestore rules.** Enforcing `credits <= old` and `plan` unchanged in security rules stops client-side tampering without a backend.
- **Structured-JSON prompt.** Forcing the model to return a strict JSON schema (with a tolerant extractor that strips code fences) made the UI trivial to render.
- **esbuild parse/bundle check.** When the full dependency install is slow, `esbuild --bundle` with deps externalized catches syntax and import errors in under a second.

## Gotchas

- Background shell processes don't persist across independent shell calls; long installs must finish inside one call or be delegated to the cloud build (Vercel).
- Pollinations occasionally wraps JSON in prose or code fences — always extract the outermost `{...}` and `JSON.parse` defensively.
- LinkedIn's photo upload input lives in shadow DOM; traverse shadow roots to find `input[type=file]` before uploading.

## Repeatable sequence

1. Scaffold config → components → pages → API.
2. Parse/bundle check with esbuild.
3. Push to GitHub via browser web editor (or scoped PAT for the initial multi-file push).
4. Import to Vercel; add public env vars one per field; deploy.
5. Configure Firebase (auth providers, Firestore, rules, authorized domains).
6. Create Stripe products + Payment Links; wire URLs into env.
7. Test live twice; fix; redeploy.
8. Launch on LinkedIn with two images; add portfolio card.
