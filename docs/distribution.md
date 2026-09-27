# Share this folder independently

This directory is self-contained. It does not import a backend checkout, depend on the existing Codex plugin, or require installed user state. The optional helper uses only Node.js built-in modules and the local files in helper/.

## GitHub upload

1. Create a dedicated repository of your choice. Upload the contents of this folder at its root, retaining README.md, MUSE.md, llms.txt, openapi.json, api/, docs/, helper/, tests/, scripts/, package.json, LICENSE and .gitignore.
2. Do not include credentials, personal configuration, logs, generated API responses, local state, release archives inside release archives, or another project's Git history.
3. Keep the repository public if you want Muse users to read its documents without a separate GitHub authorization. A private repository requires a user-controlled access method.
4. Send the repository link and the README setup message. The recipient configures their own Muse connector and proves control of their own NFT.
5. Optionally enable GitHub Pages for the repository root. index.html is a static documentation landing page; relative links work under a repository subpath. It neither hosts the API nor performs wallet authorization. The wallet helper must be run locally.

No hardcoded repository owner, account name or GitHub URL needs editing. GitHub's raw-file link or the Pages URL can expose openapi.json where Muse accepts an API description URL. A GitHub link is not automatic installation, authorization or a Meta directory listing.

## Verify and package

Run from this directory:

```sh
node scripts/generate-api.mjs
node --test tests/*.test.mjs
node scripts/verify.mjs
python3 scripts/package.py
```

The package command validates the folder and writes a ZIP and SHA-256 file inside release/. It uses a fixed list of distributable files and rejects unexpected files elsewhere in the folder. Inspect verification output and archive contents before publishing. The archive contains a single noesis-muse/ top-level directory.

## Updates

The public API is versioned independently of the package. Compare new live protocol versions and capability flags with api/ before editing. Do not embed a runtime API response containing a user identity or credential as an example. Rebuild OpenAPI and parameter documentation after a reviewed catalog/schema change, rerun checks, and update docs/verification.md with actual evidence.

MIT permission covers the integration code/docs. It does not grant rights to underlying NOESIS data, Meta services, third-party data, logos or trademarks. Preserve any public usage notices returned by the service.

## Official directory

The kit is suitable for a custom-connector pilot. A separate submission to the [Muse Connector Platform](https://muse.ai/platform) requires Meta's review and end-to-end acceptance. A smooth long-lived connection would require a separately designed NFT-aware delegated authorization service; this version deliberately preserves the existing 15-minute signature-based session contract.
