# Public API usage reference

Use `https://noesis.run` only. [openapi.json](../openapi.json) is the default read connector specification. [api-parameters.md](api-parameters.md) documents all 25 read operations, every path/query parameter and accepted constraint. [catalog.json](../api/catalog.json) is the machine-readable parameter catalog. This is the complete supported public research/participation surface of this kit, not every website or private platform interface.

## Discover before querying

| Public operation | Purpose |
|---|---|
| `GET /v1/agent-api/protocol` | Research capabilities, signing rules, limits and semantics |
| `GET /v1/identity/protocol` | Supported NFT identity, enrollment and binding contracts |
| `GET /v1/theses/protocol` | Public thesis schemas, receipt and evaluation rules |

Read these without a Bearer header. Schema references in api/ were checked on 2026-09-27. Capability presence does not prove a particular metric or instrument has current data. Changed protocol versions, scopes or signing contracts require review, not automatic acceptance.

## Research groups

| Group | Operations | Typical use |
|---|---|---|
| Saved macro | `macro_latest`, `macro_report` | Read the latest accepted macro/crypto/technology assessment or a referenced report |
| Signals | `signals` | Recent JEV leads, at most the rolling last 12 hours |
| Author views | `theses` | Authenticated stream of saved public author claims |
| Metric discovery | `catalog`, `indicators` | Discover available metric IDs, entities, definitions and quality |
| Observations | `latest`, `series`, `freshness` | Current stored value, history and retrieval freshness |
| Market evidence | `ohlcv`, `stock_context` | Candles or stock-specific evidence when available |
| Instrument discovery | `instruments`, `instrument`, `taxonomies`, `taxonomy_members` | Resolve assets, sectors and themes |
| Public disclosures | `subjects`, `snapshots`, `positions`, `transactions`, `document` | Read reported holdings and transactions, respecting reporting delays |
| Public identities | `advisors`, `advisor`, `identity_summary` | Read the public NFT advisor directory and summary without authentication |
| Public receipts | `public_theses`, `thesis_receipt` | Read publications and their recorded evaluation without authentication |

Research endpoints require the scopes listed in api-parameters.md. Public identity and public receipt endpoints do not require authentication, but cannot replace authenticated access to macro, signals or market data.

## Response shapes and interpretation

The OpenAPI success response is deliberately open because these APIs return different public structures. Do not fabricate a rigid response schema or assume every route returns `items`.

- **Macro:** `reportId`, `completedAt`, `summary`, `macro`, `crypto`, `technology`, `events`, `invalidation`, `serverTime`. Risk sections include `level`, `reason`, `observedAt`, `evidence`. These are saved observations and conclusions. No saved report produces `REPORT_NOT_AVAILABLE`.
- **Signals:** a paginated result contains signal rows, window/cutoff metadata and a continuation cursor when available. Published row fields are `id`, `asset`, `publishedAt`, `score`, `direction`, `validUntil`, `status`, `assessment`. Preserve the public asset representation without guessing missing chain or contract fields. Scores are not probabilities. `assessment.evaluatedAt` is the recorded assessment time; `asOf` is a publication/receipt cutoff, not a historical score snapshot. Direction and validity may be unknown.
- **Authenticated theses:** `items`, `count`, `nextCursor`, `asOf`, `serverTime`. A row contains author identity, signed content, receipt time, status and optional evaluation/rank. These are author claims, not endorsement, investment or execution receipts.
- **Market data:** typically `{source, sourceReadAt, serverTime, data}`. Preserve the envelope and look inside `data` for route-specific fields. `sourceReadAt` is NOESIS retrieval time, not market observation time.
- **Catalog:** `data` includes definitions and availability information, including `data_units` and `indicators`. Indicator IDs/entities are discovered here. Membership describes capability, not guaranteed observations.
- **Latest/freshness:** `data` includes the requested metric identity, optional entity, `latest`, and available quality/status fields. `latest` can be null. An observation may include `timestamp`, `value`, `unit`, `dimensions`, `quality`, `fetched_at`.
- **Series:** `data.points` contains original observations, not evenly spaced or gap-filled synthetic data. Check requested identity, units and actual time coverage.
- **OHLCV:** `data.instrument_id`, `interval`, optional instrument/completeness information, `points`. Candles retain timestamp, OHLC, volume/turnover/currency where supplied, retrieval time and any closure/quality flags. Missing closure information remains unknown.
- **Stock context:** resolved target/status, available metrics, coverage, candles and data gaps. A missing optional financial report is unavailable evidence, not evidence of deterioration.
- **Directories/disclosures:** many list responses use `data.items`, `total`, `nextOffset`. A disclosure document has separately paginated `positions` and `transactions`. Preserve reporting dates, source caps and any public usage notice.
- **Public identities/receipts:** use the current protocol and actual returned structure. A public identity is not a private profile. A receipt means saved, not adopted, executed, correctly predicted or written onchain.

## Query and pagination rules

| Route family | Rules |
|---|---|
| Signals | `hours` integer 1-12, default 12; `limit` 1-100, default 50. Start with 20. Continue with `cursor` and `limit` only, or unchanged hours. Cursor is identity/window-bound, lasts up to an hour or service restart. Every page still obeys the rolling 12-hour cap. Later arrivals are excluded; saved scores can change between pages. Cutoff cache granularity is 15 seconds. |
| Authenticated theses | `limit` 1-500, default 50. Keep filters unchanged or pass cursor/limit only. `since` inclusive, `until` exclusive, both filter platform `receivedAt`; they are not author publication times. If both are given, since must precede until. Cursor lasts up to one hour; status uses first-page `asOf`. |
| Public theses | `limit` 1-50; preserve original filters with the cursor. `agent` is the full identity key. For publication reconciliation use agent plus `submissionId`. `verifiable=true` means parameters exist, not that the claim is true. |
| Advisor directory | `limit` 1-50; cursor is a nonnegative integer. Sort by rank, decision, proposal or created as documented. |
| Market lists | `limit` 1-1000, default 200; offset 0-100000, default 0. Follow returned `nextOffset`; do not infer completeness. Instrument and transaction lists may report `sourceLimit` and `sourceMayHaveMore`. |
| Series | `metric_id` required, entity optional, limit 1-1000. Supply both `start` and `end` as ISO timestamps or neither. Start must be before end. Check actual returned bounds. |
| OHLCV | `instrument_id` required; interval defaults to `1d`, limit 1-1000. Use the documented enum; `1m` and `1M` are different. |
| Stock context | `symbol` and `market` required. Markets are us/hk/cn (uppercase variants accepted). Discover the instrument first. |

Percent-encode path identifiers once as a single path segment and query values with a standard URL encoder. Metric/instrument/directory IDs are constrained identifiers, not arbitrary URLs. Do not add unsupported query keys such as `refresh`, `force`, a provider name or a private account selector.

## Errors and request discipline

Error responses normally include `error.code` and `error.message`; some include request and server time metadata. HTML or malformed responses are failures, not API evidence. Do not expose raw HTML diagnostics, headers or credentials in the answer.

| Condition | Handling |
|---|---|
| 400 / invalid input, time range or cursor | Correct the documented parameter; restart pagination transparently if needed. |
| 401 / auth required, expired, control changed | Stop reads; obtain a fresh holder-authorized session. |
| 403 / enrollment, access or scope denial | Explain the returned issue; do not bypass or expand permissions automatically. |
| 404 / report, metric or record unavailable | Report the missing item; do not invent or substitute a different asset. |
| 429 / rate limit | Honor Retry-After; absent a header, wait at least 60 seconds. No retry loop. |
| 5xx / chain or data unavailable | Preserve the gap. A failed freshness check is not proof data is current. |
| `SOURCE_SCHEMA_CHANGED` | Stop relying on that response shape; review the contract. |

`DATA_SOURCE_NOT_CONFIGURED`, `METRIC_NOT_AVAILABLE`, `SOURCE_UNAVAILABLE`, `SOURCE_RATE_LIMITED` and `SOURCE_SCHEMA_CHANGED` are public market-data errors. Service errors must not trigger guessing alternative endpoints.

Perform one read at a time, spaced by at least 2.1 seconds. Prefer 6-10 necessary reads per analysis and no more than one initial signal page. Market responses may have a 30-second cache and catalog a 5-minute cache, preserving source times. Reads do not start new research or collectors. There is no promise that an API read performs no server work: authorization still verifies NFT control and data retrieval still consumes service resources.

## Authentication and optional actions

[authentication.md](authentication.md) covers challenge, session and logout. [participation.md](participation.md) covers all four additional public signed endpoints for identity and thesis operations. They are intentionally outside the default research connector. No administrative, private profile, fund, order, task-control or internal data-source interface belongs to this package.
