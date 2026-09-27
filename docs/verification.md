# Verification record

Package: 0.1.0. Review date: 2026-09-27.

## Completed checks

- Read the three live public NOESIS protocol endpoints. The research protocol advertises macro, theses, signals and 16 market-data routes. JEV is configured and capped at the rolling last 12 hours.
- Matched the documented public research routes to the packaged OpenAPI and parameter catalog. The default connector has 25 read operations, three public protocol operations and credential revocation. Authentication and four optional signed participation operations have separate specifications.
- Ran isolated Node tests covering message tampering, NFT identity and controller checks, scope escalation, expiry, key ordering, session validation, explicit enrollment, fixed upstream routes, Host/Origin/CSRF protection, one-time session exchange, rate-limit error handling, response-size limits and failed revocation recovery. All upstream authorization responses and signatures in these tests are synthetic; none are sent to NOESIS.
- Opened the real local helper in a browser and verified that the page loads, reaches its ready state, presents the NFT/wallet fields, starts with signing and token-copy actions disabled, and displays the secure-credential/expiry guidance. No wallet connection, signing or enrollment was attempted during this page inspection.
- Verified that a real unauthenticated macro read is rejected with HTTP 401 / AUTH_REQUIRED. This checks the authentication boundary, not authorized data access.
- Checked the allowlisted distribution files for CJK text, common credential patterns, private network addresses, personal absolute paths, unexpected files, symlinks and broken local Markdown links. The final archive is rebuilt from that allowlist and its bytes are compared with the reviewed files.

Run `node --test tests/*.test.mjs` and `node scripts/verify.mjs` for current test and file counts; they are not inferred from this document.

## Not claimed

- No real NFT holder signature, enrollment, token issuance or authenticated research result was used in development.
- No consumer Muse account was configured and no secure-credential UI, API import, authenticated read or token renewal was accepted end to end inside Muse.
- No GitHub repository was created or published, and no Meta directory application was submitted.
- No backend code, service deployment, database, account, scheduler or funds were changed.
- No complete audit of third-party service retention policies or future repository edits is implied by a local pattern scan.

## Recipient acceptance

On the recipient's own Muse account: confirm custom-connector availability and a secure Bearer credential field; authorize an existing NFT with their own wallet; verify one successful authenticated macro or catalog response; inspect timestamps and coverage; revoke the token and confirm subsequent reads are denied. Do not expose credentials in screenshots or conversations while recording acceptance.

Until that acceptance is completed, describe this release as a **prepared and locally tested custom-connector kit**, not an officially approved or universally verified Muse integration.
