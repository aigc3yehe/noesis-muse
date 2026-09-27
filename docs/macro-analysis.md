# A simple macro-financial research method

Purpose: turn available observations into an explicit, conditional explanation. This is a reasoning guide, not a model forecast, an allocation rule or an instruction to trade. All inference happens in the user's Muse runtime; NOESIS supplies saved research and available data.

## 1. Define the decision and horizon

State the region, asset class, currency, and relevant horizon. A weekly liquidity question differs from a three-hour meme move. Use the user's horizon; ask for clarification only when it materially changes which evidence to read.

## 2. Read the saved context once

Use `macro_latest`. Record `reportId`, `completedAt`, each section's `observedAt`, the public risk assessments, events and invalidation conditions. Label these as **saved NOESIS analysis**. Do not present them as your freshly verified conclusions or as current merely because the endpoint says latest.

If the report is unavailable or old relative to the task, say so. Unknown risk is not normal risk. A publication schedule is not proof that the newest report completed.

## 3. Choose two or three relevant evidence axes

Discover available metrics with `catalog`, then select only those relevant to the question. Do not assume every example below exists in the catalog.

| Question | Possible evidence when available | Reasoning check |
|---|---|---|
| Is financing becoming easier or tighter? | Policy rates, yields, dollar measures, funding/liquidity indicators | Separate rate level from change and market expectations from actual decisions. |
| Is activity improving or weakening? | Growth, employment, spending or business activity series | Compare the same definition/frequency and distinguish revisions from new activity. |
| Is inflation pressure changing? | Price measures and their components | Separate level, monthly change and annual change; base effects can differ from new momentum. |
| Is risk demand broad or concentrated? | Breadth, volatility, credit or flow observations | One narrow asset move does not prove broad participation. |
| What is specific to crypto? | Available funding, derivatives, stablecoin or spot observations | Distinguish spot from derivatives and aggregate flows from one venue's sample. |

Use `latest` and, when needed, a short `series` for the chosen metrics. Use `freshness` only when retrieval quality needs clarification. Catalog membership and a recent retrieval time do not prove the latest official release was collected.

## 4. Compare like with like

- Keep market observation time, publication/release time, report completion time and retrieval time separate. A date attached to a macro observation is not necessarily its release timestamp.
- Keep units and denominators explicit. Percentage change and percentage-point change differ. Basis points equal percentage-point change multiplied by 100.
- For two comparable, nonzero-base observations, percentage change is `(new / old - 1) * 100`. Reject incomparable currencies, entities, definitions or frequencies; show the actual dates and time gap.
- Do not interpolate across missing samples without explicitly calling it an assumption. Never replace missing observations with zero.
- Separate correlation, a plausible mechanism and evidence of causation. A policy event followed by an asset move does not alone establish causality.

## 5. Build and challenge one explanation

Example structure: "Available observations suggest tighter financing over this interval, which could constrain risk demand. However, the observed breadth/flow evidence is mixed, so the effect on this asset remains conditional."

Find at least one counter-observation or plausible alternative explanation. Repeated summaries of the same report are not independent confirmation. If a critical axis is absent, lower the specificity of the conclusion instead of manufacturing confidence.

## 6. State conditions, not a fabricated probability

Describe a base interpretation, one alternative, and what evidence would change the view. A scenario is hypothetical, not a forecast or a maximum-loss bound. Do not assign numerical probabilities or price targets without an explicit supported method. Optional missing earnings data is a gap, not an automatic penalty.

## Compact output

```text
Question / horizon / currency:
Saved NOESIS view: report ID, completion time and source observation times
Observed facts: values, units, dates and API operations
Interpretation: what these facts support and why
Counterevidence / alternative explanation:
Coverage and missing information:
Conditions that would change the view:
Next checks: at most two
```

Keep saved conclusions, directly observed facts and your inference visibly distinct. A research answer does not imply a trade, an allocation decision or a guarantee of correctness.
