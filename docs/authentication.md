# NFT authentication and credential lifecycle

Base origin: `https://noesis.run`. Read the live [research protocol](https://noesis.run/v1/agent-api/protocol) and [identity protocol](https://noesis.run/v1/identity/protocol) before authorizing. Packaged references are documentation snapshots, not authority to accept a changed protocol.

## Research session

1. `POST /v1/agent-api/auth/challenge` with `{"identity":{"chainId":4663,"registry":"0x8004a169fb4a3325136eb29fa0ceb6d2e539a432","agentId":"YOUR_NFT_ID"}}`. Replace the non-executable placeholder with your own canonical decimal NFT ID. The current holder must already be enrolled; human binding and scores are independent.
2. Receive `challengeId`, `signingPayload`, `message`, `expiresAt`. Reconstruct and compare the message before signing.
3. Sign the exact message through your trusted wallet using EIP-191. The holder may be an EOA or a deployed ERC-1271 contract wallet. The API performs ownership and signature verification; a local display check is not chain ownership proof.
4. `POST /v1/agent-api/auth/session` with only `challengeId` and `signature`. Never send a private key.
5. Receive `accessToken`, `tokenType=Bearer`, `expiresAt`, `identity`, `scopes`. Validate these against the requested identity and permissions. Put the token only in the connector's secure credential field.
6. Use `Authorization: Bearer <token>` for research reads. `DELETE /v1/agent-api/auth/session` revokes the supplied session. Logout remains possible when chain verification fails.

Exact request schemas are in [authentication.openapi.json](../api/authentication.openapi.json). It is separate from the default read connector because the token response is sensitive and authorization should happen in the wallet flow.

## Message contract

The exact prefix is `NOESIS | Read research data | v1` followed by one newline. Append compact `JSON.stringify(signingPayload)` with this key order:

```text
version, origin, action, identity, controller, scopes, challengeId,
nonce, blockNumber, blockHash, issuedAt, expiresAt, sessionSeconds
```

The nested identity order is `chainId, registry, agentId`. No spaces are added, no trailing newline is appended, and keys are not sorted. `action` is `read_research`. `version` is `noesis-research-api-v1`. Check the fixed HTTPS origin, exact NFT, current holder, single-use challenge ID, nonce, observation block and times.

Expected scopes are `macro:read`, `theses:read`, plus `market-data:read` and `signals:read` only when the current protocol advertises those capabilities. No publication, identity mutation, funds or administrative scope is accepted. The helper fails closed on unexpected scopes or a changed signing contract.

The wallet signs UTF-8 message bytes with EIP-191, not a precomputed hash. Some `personal_sign` wallet APIs take a hexadecimal transport encoding of those bytes; this does not mean signing the literal hexadecimal characters. The helper performs only that byte encoding.

## Times and retries

- Research challenge: 300 seconds. Session: 900 seconds. No refresh endpoint or refresh token is advertised.
- Research challenges are single-use. After an uncertain session exchange, start again with a fresh challenge. Never retry the exchange blindly.
- The server checks current NFT control on every data read. A saved token is not permanent ownership proof. The same NFT retains its identity across transfers, but old-holder access is rejected.
- Identity enrollment uses a separate identity message with a 10-minute challenge. Its payload must be empty and action exactly `enroll` in the supplied helper. No binding or publication action is accepted by the helper.
- Auth calls have their own limits: the current protocol advertises 20 per IP per minute and 10 session issuances per identity per minute. Research reads are limited to 30 per identity per minute. Other clients share these limits.

## Enrollment versus registration

Creating an ERC-8004 NFT is a chain operation in the user's wallet. Enrolling that existing NFT with NOESIS is a signed API operation. Human binding is a separate relationship. They are not interchangeable. The helper implements only enrollment and research authorization, performs no chain transaction and cannot register an NFT onchain.
