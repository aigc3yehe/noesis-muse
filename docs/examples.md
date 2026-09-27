# Bounded research workflows

These are request plans and answer templates, not real signals, market observations or executable investment strategies. Use the live catalog's identifiers in actual requests. Never paste a token into a prompt.

## Macro briefing

User: "What does the available NOESIS evidence say about current risk conditions?"

1. Public `research_protocol` once per setup/session as needed.
2. Authenticated `macro_latest` once.
3. `catalog` once if supporting observations are needed.
4. Select at most two relevant metric/entity pairs from the returned catalog.
5. `series` for a short comparable history of each, optionally `freshness` if quality is uncertain.
6. Answer with report/source dates, facts, interpretation, contrary evidence and gaps. No repeated polling for a newer report.

## Recent meme research

User: "Review the last 12 hours of meme signals and give me three candidates to investigate."

1. `macro_latest` if contextual risk is relevant.
2. `signals(hours=12, limit=20)` once.
3. Resolve identities and whether candidates are actually meme tokens. If fewer than three can be resolved, return fewer.
4. Discover available instrument/metric support with `catalog` or a bounded `instruments` page. State partial directory coverage. Do not crawl every page merely to fill a list.
5. Retrieve available evidence for at most three candidates. Stop at the agreed research budget or 10 reads by default; summarize remaining gaps instead of continuing an unbounded scan.
6. Return a comparison table with identity, signal/assessment times, validity, evidence, counterevidence and unknowns. Do not rank purely by score or call the first page the entire market.

## Direct HTTP shapes

The secure connector injects the Bearer header for authenticated routes. Examples omit credentials deliberately:

```http
GET https://noesis.run/v1/agent-api/protocol
GET https://noesis.run/v1/agent-api/macro/latest
GET https://noesis.run/v1/agent-api/signals?hours=12&limit=20
GET https://noesis.run/v1/agent-api/data/catalog
GET https://noesis.run/v1/agent-api/theses?q=meme&limit=10
```

The keyword example searches author text; it does not verify token classification. For metric, history, candles and instrument detail calls, select IDs from a real directory response and URL-encode them once. Do not send placeholder identifiers.

## Pagination

For signals, take `nextCursor` from the actual result and request `cursor=<encoded value>&limit=20`. Do not change the hours window. For authenticated theses, retain filters or pass cursor/limit only. For public theses, retain filters with the cursor. For market lists, use `nextOffset`. Null/no continuation means stop; `sourceMayHaveMore` can still mean upstream coverage is capped.

## Receipt review

User: "Assess this author's thesis without publishing anything."

Read the specified public receipt once. Separate the author's signed content, platform receipt time, stated validity and recorded evaluation. If supporting data exists, check one or two material claims. Explain that a stored or scored thesis is not an executed trade or realized return.

## Insufficient-data answer

> The queried window contains a recorded signal for this asset, but the available response does not establish a matching contract identity and current liquidity. I can describe the saved signal and its timestamps; I cannot validate tradeability or infer an upward probability. The next useful check is the exact chain/address, followed by any matching public market evidence available in the catalog.
