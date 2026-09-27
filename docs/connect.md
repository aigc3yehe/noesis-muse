# Connect NOESIS to Muse

## Requirements

- A Muse account with custom-connector capability and a dedicated secure credential field that can send a Bearer header. Availability and UI can vary; this kit does not bypass account restrictions.
- An existing ERC-8004 NFT on the network and Registry advertised by the live NOESIS protocol, currently Robinhood Chain 4663 and Registry `0x8004a169fb4a3325136eb29fa0ceb6d2e539a432`.
- Access to the current NFT holder's trusted wallet. An NFT operator approval, human website login or payment agentWallet does not prove control.
- For the optional local helper: Node.js 22 or newer and a normal browser with your own wallet extension. A contract wallet can use the external-signature field if its deployed ERC-1271 signing workflow is compatible.

## Step 1: Give Muse the documents

Share the public GitHub repository URL and the setup message in README.md. Ask Muse to read MUSE.md and openapi.json. The JSON is an API description, not an official Muse installation manifest. If Muse asks for an API description URL, use the raw URL for openapi.json from your own published repository, or its GitHub Pages URL. Never use the GitHub HTML file viewer URL as though it returned raw JSON.

The service URL is always `https://noesis.run`. Publishing these files does not host or replace NOESIS. Do not enter the GitHub URL or the local helper address as the API server.

## Step 2: Authorize in your own wallet

Open a terminal in the extracted folder and run:

```sh
node helper/server.mjs
```

Open the printed address in your normal wallet-enabled browser. It uses a free loopback port and does not start a database, research process or trading service.

1. Enter your Agent NFT ID and click **Connect browser wallet**. Verify that the connected address is the NFT holder. If using an external wallet, enter that holder address manually.
2. Click **Prepare research access**. If NOESIS returns `IDENTITY_NOT_ENROLLED` or `ADVISOR_NOT_REGISTERED`, use **Enroll my existing NFT first**, review and sign that separate enrollment message, then prepare research access again. Enrollment does not mint an NFT or require a human binding.
3. Read the exact service origin, identity, holder, scopes and expiry. Click **Sign reviewed message in wallet** and approve only that EIP-191 message. For a contract/external wallet, sign the displayed exact UTF-8 message in your trusted wallet and submit its signature through the dedicated field.
4. The page receives a token that expires after at most 15 minutes. It does not receive or request a private key, seed phrase or transaction signature.

The helper supports enrollment of an existing NFT only. If you have no compatible NFT, obtain one separately through the official registry and your own wallet. Do not use example identities or remint an existing NFT solely to use this kit. Network transaction fees are separate from this package.

## Step 3: Configure the secure credential

In Muse's custom-connector setup, choose Bearer authentication and put the copied token into the dedicated credential field. If the UI builds the header automatically, enter only the token. If it explicitly requests the full header, use `Authorization: Bearer <token>` in that secure field.

Never paste it into conversation, an instruction document, a URL, a GitHub secret intended for unrelated automation, or a screenshot. Clear your clipboard after pasting. If Muse can only accept credentials as chat text, **do not continue**; use the guides without authenticated calls until a secure connection method is available.

Muse's help center documents custom connectors and secure credential storage, but does not promise this exact NFT flow or a fixed API import UI. Actual connector acceptance must be verified on the recipient's account. Do not claim an automatic OAuth connection: this version has no OAuth server, redirect callback, refresh token or permanent connector grant.

## Step 4: Verify one read

Ask: "Read the NOESIS research protocol, then retrieve the latest macro report. Tell me the report ID and completion time."

The authenticated response must succeed. A protocol page alone is public and does not prove authentication. `REPORT_NOT_AVAILABLE` means that report is missing; it is not a successful macro read. An authenticated catalog response can independently verify access when macro data is unavailable.

## Expiry and disconnect

When the token expires, stop reads and repeat authorization. There is no silent renewal. The service rechecks NFT control on every research read. Transferring the NFT, including transferring it away and back, can invalidate existing authorization.

Click **Revoke access and clear** in the helper, or ask Muse to revoke the current session, before disconnecting. Remove the credential in Muse too. The helper cannot delete Muse's stored credential or conversation history. Closing the browser or terminal alone leaves an already-issued credential usable until service expiry. The helper does not save tokens for recovery after restart.

## Troubleshooting

| Symptom | Action |
|---|---|
| No custom connector or secure field | Stop before transferring a credential; this is a Muse capability requirement. |
| No browser wallet detected | Open the printed URL in your wallet browser, or use the external signature option. |
| Wrong NFT holder / `WALLET_CHANGED` | Select the current holding account and prepare a new challenge. |
| `UNSUPPORTED_IDENTITY` | Check the chain and Registry in the current public protocol. |
| `UNSUPPORTED_PROTOCOL` / `UNSAFE_RESPONSE` | Stop signing. The protocol differs from this reviewed client; update and review the kit. |
| `REVOKE_EXISTING_SESSION_FIRST` | Revoke the helper's previous session before creating another. This also applies after page reload. |
| `WAIT_BEFORE_NEXT_REQUEST` | Wait at least 2.1 seconds; do not click repeatedly. |
| Wallet declined | No session was created by that signature. Prepare again when ready. |
| Session response lost | Prepare a new challenge; do not replay the research session exchange. |
| Enrollment result uncertain | A fresh enrollment can reconcile the existing identity; never mint a new NFT as a retry. |
| 429 | Follow Retry-After; if absent, wait at least 60 seconds. |
| Chain verification unavailable | Report the failure and retry later; never bypass NFT checks. |

Source: [Meta's connector help](https://www.meta.com/en-gb/help/artificial-intelligence/1687253048996149/). This guide describes this kit's intended workflow, not a verified screenshot-by-screenshot Muse onboarding flow.
