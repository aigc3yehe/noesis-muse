# A simple meme-token research method

JEV signals identify recent research leads. They do not establish that a token is safe, liquid, fairly valued, tradable or likely to rise. This kit has no trading authority and cannot obtain missing social/holder information through hidden interfaces.

## 1. Establish the market backdrop

Read `macro_latest` once if broader conditions matter to the user's horizon. Preserve the age and scope of that saved report. Macro risk is context, not a rule that every token must move in the same direction.

## 2. Discover a small set of candidates

Read `signals` with `hours=12&limit=20`, or a narrower requested window between 1 and 12 hours. Do not query older history by manipulating the cursor. Identify what is actually a meme candidate; signals can cover other asset types.

Keep at most three candidates for detailed review. Use the public direction, score, activity/assessment fields and times as recorded. Score is not probability or expected return. Multiple similar records may reflect one event. IDs can change after a service restart, so do not infer new events solely from a new ID.

No results means no records in the queried window/sample, not proof there are no opportunities or that the market is safe.

## 3. Resolve the exact asset

Use chain plus contract address (or Solana Mint) where available, supported by instrument identity and public mappings. Preserve case where the chain requires it. An identical ticker is not identity evidence. The Agent NFT's chain is not the token's chain.

If the signal and available catalog do not establish the exact asset, request the user's chain/address or leave it unresolved. Never attach another same-ticker token's candles, holders or liquidity to it. Wrapped assets, underlying assets and different-chain tokens remain distinct.

## 4. Read only relevant available evidence

| Area | What to check | What not to infer |
|---|---|---|
| Price structure | Same-asset candles, interval, closure status, actual time coverage | An unfinished candle is not a confirmed breakout. |
| Activity | Available comparable volume/turnover observations and period | A larger raw number across different periods or venues is not comparable growth. |
| Liquidity | Current, correctly scoped liquidity/quote data if explicitly available | Volume, order-book depth and LP TVL are not interchangeable; no liquidity data means execution is unknown. |
| Holders | Public, verified identity and concentration observations only if available | A few sampled wallets are not the whole holder population or evidence of coordinated buying. |
| Narrative | Public author claims from `theses` or `public_theses`, clearly attributed | Claims, reposts and agreement are not independent verification. |
| Contract risk | Verified public information when actually available | A known contract address alone is not a security audit, sellability check or permission review. |

The research API does not promise social-news feeds, unrestricted chain scans, a holder-distribution endpoint or executable quotes. Do not invent these capabilities. Discover metrics via `catalog` and instruments via the directory. If no correctly identified candle series exists, report that price confirmation is unavailable.

Use 1-3 relevant follow-up queries per candidate, rather than exhausting all endpoints. Do not scrape internal source names or attempt to identify the originator of opaque signal data.

## 5. Separate time and validity

- `publishedAt` anchors the public signal window. `assessment.evaluatedAt` can be a different time. `validUntil` may be absent.
- `status=expired` concerns stated validity, not whether a forecast was right. Unknown validity stays unknown.
- The first-page cutoff does not freeze future scoring updates. Paginated results are not a historical backtest dataset.
- Stale or incomplete data can support a historical observation, not a present claim about entry quality.

## 6. Give a conditional research conclusion

Use labels such as **unresolved identity**, **insufficient evidence**, **watch for confirmation**, or **available evidence supports this limited interpretation**. Explain the concrete evidence behind the label. Never generate a buy order, position size, leverage, guaranteed stop outcome or return probability from the signal score.

Describe the strongest opposing evidence, the missing checks and an observable invalidation condition. If liquidity or identity is unknown, say that execution suitability is unknown. Do not make missing financial reports an automatic negative score.

## Suggested comparison

| Candidate | Identity confidence | Signal and times | Supporting evidence | Counterevidence / gaps | Conditional conclusion |
|---|---|---|---|---|---|
| User-selected asset | Exact chain/address or unresolved | Recorded fields only | Comparable observations | Missing coverage explicitly | Research view, no execution claim |

This table is a template, not actual market data. Attribute author theses; do not turn them into platform endorsements. Any optional published thesis requires a separate user review and signature.
