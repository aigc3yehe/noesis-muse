# NOESIS for Muse

An independent, English-language connection kit for people using the **Muse consumer app**. Ask Muse to investigate macro conditions, compare financial evidence, or review recent meme-token signals using NOESIS research APIs.

This is a custom-connector setup kit, not a Muse Code plugin, an official Meta integration, or a directory listing. It includes API definitions, practical analysis guides, and an optional local wallet authorization page. It runs no AI model, trading engine, collector or scheduler.

## Start here

1. Download this repository as a ZIP and extract it, or clone it. Keep the folder intact.
2. Open Muse and provide the public GitHub repository link with the message below. Ask it to read [MUSE.md](MUSE.md), [openapi.json](openapi.json), and the linked guides. If it cannot follow repository links, attach these documents and the relevant analysis guide instead.
3. Connect with your **existing ERC-8004 Agent NFT** using [the wallet guide](docs/connect.md). The optional helper needs Node.js 22+ and your own wallet; Codex is not required. An NFT that is not yet enrolled can be enrolled separately in the helper. It does not create an NFT.
4. Enter the resulting 15-minute token into a **dedicated secure connector credential field**, using Bearer authentication. Never paste the token into Muse chat. If your Muse account does not offer custom connectors or a secure credential field, stop before transferring credentials; this package cannot enable missing Muse features.
5. Ask for one small research query, verify that Muse actually calls NOESIS, then start your analysis. Repeat wallet authorization after token expiry.

Paste this message into Muse along with the repository link:

> Set up NOESIS as a custom research connector using this repository. Read MUSE.md, openapi.json, docs/connect.md, docs/api-reference.md, docs/api-parameters.md, and docs/authentication.md. Use the macro and meme guides when relevant. Connect only to https://noesis.run, using my NFT-authorized short-lived token through your secure connector credential setup. Never ask me to paste credentials into chat. Start with the public research protocol, then perform one authenticated macro query after I configure the credential. Do not claim connection success until the authenticated request succeeds. Do not enable publishing, trading, background polling, or automatic signing.

## What you can ask

- "Summarize the saved macro outlook. Separate facts, interpretations, conflicting evidence and stale data."
- "Review the latest 12 hours of JEV signals. Shortlist at most three meme candidates only where their identities are clear."
- "Compare these two assets using available price, volume and liquidity evidence. Mark missing coverage."
- "Read this public thesis and assess what would invalidate it. Do not publish anything."

The APIs expose stored research and available data. A signal is a research lead, not a return probability or an execution instruction. Meme-specific price, holder, social and liquidity coverage is **not guaranteed**; the connector must check the current catalog and report missing data.

## Contents

| File or folder | Purpose |
|---|---|
| [MUSE.md](MUSE.md) | Agent-facing setup and operating instructions |
| [openapi.json](openapi.json) | 25 read operations, 3 public protocols and credential revocation |
| [api/](api/) | Parameter catalog, public protocol references, authentication and optional participation schemas |
| [docs/](docs/) | Connection, full API guide, macro/meme methods, examples and privacy boundaries |
| [helper/](helper/) | Dependency-free local wallet authorization page |
| [tests/](tests/) | Isolated tests with fake wallets and fake upstream responses |
| [scripts/](scripts/) | Rebuild API documents, verify the shareable package, create an archive |

## Local commands

From inside the extracted folder:

```sh
node helper/server.mjs
```

Open the printed local address in your own wallet-enabled browser. It listens only on loopback, uses a dynamically assigned port, and stores no identity, signature or token on disk. Read [security and data handling](docs/privacy.md) before connecting.

Maintainer checks (no dependencies to install):

```sh
node scripts/generate-api.mjs
node --test tests/*.test.mjs
node scripts/verify.mjs
python3 scripts/package.py
```

## Sharing and current acceptance

Upload this complete folder to its own GitHub repository. Follow [distribution.md](docs/distribution.md); no backend repository, credentials or installed user state is required. An optional static landing page is included for GitHub Pages. A GitHub link provides the documents; it does not automatically configure or authorize every Muse account.

See [verification.md](docs/verification.md) for the exact tested boundary. Live Muse custom-connector setup and a real NFT signature require the recipient's Muse account and wallet. They must not be inferred from offline test results.

Meta describes [custom connectors](https://www.meta.com/en-gb/help/artificial-intelligence/1687253048996149/) separately from the reviewed [Connector Platform directory](https://muse.ai/platform). This package is independent of Meta and NOESIS. The MIT license covers the package, not the underlying service data or trademarks.
