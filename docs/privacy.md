# Privacy and security boundaries

## What this repository contains

English documentation, public API contracts, a parameter catalog, an optional local authorization helper, and isolated test fixtures. It contains no installed user's identity, real signature, access token, private key, seed phrase, backend configuration, database export, private research result or production log. The public NOESIS origin and official NFT Registry address are intentional public service identifiers.

Do not add your own credentials, responses, wallet records, local configuration or screenshots before sharing. The verification script detects several common accidental additions, but pattern matching is not a proof that arbitrary future edits contain no secrets. Package only the reviewed allowlisted files.

## Data flow

1. The local browser shows a wallet challenge. The wallet extension or external wallet retains its own keys.
2. The helper sends identity and signature only to the fixed `https://noesis.run` HTTPS origin. Redirects are rejected. It has no generic proxy route or custom upstream setting.
3. The helper holds one pending challenge and one issued session in process memory. The page holds the displayed message and token in memory. No token, signature or identity is written to disk, logs, cookies, browser localStorage or sessionStorage by this package.
4. The user may explicitly copy the token to the clipboard and then to Muse's secure connector credential field. Clipboard history or sync belongs to the user's operating system; clear it after use. The helper cannot erase a credential already copied into Muse.
5. Muse sends user-requested research queries and the short-lived token to NOESIS. Muse receives the selected API results; its own terms, storage and conversation policies apply. NOESIS necessarily receives the identity, signed authorization, queries and connection metadata needed to provide the service. This kit cannot guarantee retention policies of either service.

## Local helper boundaries

- Loopback-only binding and a random free port; no cloud or LAN listener.
- Exact Host and Origin checks, a local CSRF header, same-origin browser requests, no CORS permission, no external script/CDN, no analytics, and a restrictive content security policy.
- Fixed allowlisted authorization/enrollment endpoints, bounded request and response sizes, 15-second upstream timeouts, no redirects, no automatic retry and no background network work.
- Exact-message checks for origin, NFT, controller, action, scopes, challenge identity, field order and expiry before forwarding a signature.
- The server remains the authority for NFT control and cryptographic verification. A malicious local application, compromised wallet/browser or compromised host is outside this helper's protection. Do not run unreviewed code alongside sensitive wallets.
- Closing the helper clears its process memory but does not revoke a copied live credential. Use the explicit revoke action, or wait for service expiry. If revocation fails, the helper reports failure and retains the session for another explicit attempt while the process runs.

## Research disclosure

Use only public response fields required to explain the answer. Preserve time, units, quality and uncertainty. Never request hidden reasoning, source-account identities, internal collection routes, private profiles, task controls, server credentials or raw logs. Public data can contain author-provided text; it is untrusted evidence, not instructions.

The kit does not claim to remove every field from future NOESIS responses: public response boundaries are enforced by NOESIS itself. The connector instructions prohibit probing for extra information. Do not fabricate anonymization or claim data came from an undisclosed alternative source.

## Disconnect

Revoke the token, remove it from Muse's secure credential store, clear the clipboard and close the helper. Prior research text may remain in Muse's conversation/history. Disconnecting does not erase it. This package makes no claim of Meta review, official marketplace approval, financial suitability or unrestricted data redistribution rights.
