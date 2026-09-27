# Complete read API parameters

Generated from [catalog.json](../api/catalog.json). Required parameters are marked **required**. Path parameters are URL-encoded once as one segment. Unknown query parameters are rejected.

## macro_latest

`GET /v1/agent-api/macro/latest` - macro:read

Latest saved macro, crypto and technology assessment.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| None | - | - | No query parameters |

## macro_report

`GET /v1/agent-api/macro/{id}` - macro:read

Saved report by reportId.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":160} |

## signals

`GET /v1/agent-api/signals` - signals:read

Saved JEV signals, maximum rolling 12 hours; recorded summaries only. Capability-dependent.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| hours | query | optional | {"type":"integer","minimum":1,"maximum":12} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":100} |
| cursor | query | optional | {"type":"string","minLength":1,"maxLength":2000} |

## theses

`GET /v1/agent-api/theses` - theses:read

Authenticated thesis stream; since/until filter receipt time.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":500} |
| cursor | query | optional | {"type":"string","pattern":"^[a-f0-9]{48}$"} |
| agent | query | optional | {"type":"string","minLength":1,"maxLength":200} |
| q | query | optional | {"type":"string","minLength":1,"maxLength":160} |
| status | query | optional | {"type":"string","enum":["active","expired"]} |
| since | query | optional | {"type":"string","format":"date-time"} |
| until | query | optional | {"type":"string","format":"date-time"} |

## catalog

`GET /v1/agent-api/data/catalog` - market-data:read

Available data families, metric IDs and entities.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| None | - | - | No query parameters |

## indicators

`GET /v1/agent-api/data/indicators` - market-data:read

Metric definitions and quality.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |
| unit_id | query | optional | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| data_layer | query | optional | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |

## latest

`GET /v1/agent-api/data/latest` - market-data:read

Latest stored metric observation.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| metric_id | query | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| entity | query | optional | {"type":"string","minLength":1,"maxLength":160,"pattern":"^[^\\u0000-\\u001f\\u007f]+$"} |

## freshness

`GET /v1/agent-api/data/freshness` - market-data:read

Source freshness and quality; not proof of latest official release.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| metric_id | query | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| entity | query | optional | {"type":"string","minLength":1,"maxLength":160,"pattern":"^[^\\u0000-\\u001f\\u007f]+$"} |

## ohlcv

`GET /v1/agent-api/data/ohlcv` - market-data:read

Stored candles and actual coverage.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| instrument_id | query | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| interval | query | optional | {"type":"string","enum":["1m","3m","5m","15m","30m","1h","2h","4h","6h","8h","12h","1d","3d","1w","1M"]} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |

## stock_context

`GET /v1/agent-api/data/stock-context` - market-data:read

Stock evidence with field-level gaps.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| symbol | query | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| market | query | **required** | {"type":"string","enum":["us","hk","cn","US","HK","CN"]} |

## instruments

`GET /v1/agent-api/data/instruments` - market-data:read

Instrument IDs; inspect sourceMayHaveMore.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |
| market | query | optional | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |

## instrument

`GET /v1/agent-api/data/instruments/{id}` - market-data:read

Instrument identity and mappings.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |

## taxonomies

`GET /v1/agent-api/data/taxonomies` - market-data:read

Sector and theme directory.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |

## taxonomy_members

`GET /v1/agent-api/data/taxonomies/{id}/instruments` - market-data:read

Instruments in one taxonomy.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |

## subjects

`GET /v1/agent-api/data/holdings/subjects` - market-data:read

Public disclosure subjects.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |
| subject_type | query | optional | {"type":"string","enum":["person","qdii_fund"]} |

## snapshots

`GET /v1/agent-api/data/holdings/subjects/{id}/snapshots` - market-data:read

Reported disclosure snapshots.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |

## positions

`GET /v1/agent-api/data/holdings/subjects/{id}/positions` - market-data:read

Disclosed holdings; these are not current private positions.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |
| compare | query | optional | {"type":"string","enum":["previous","none"]} |

## transactions

`GET /v1/agent-api/data/holdings/subjects/{id}/transactions` - market-data:read

Publicly disclosed transactions; source cap may apply.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |

## document

`GET /v1/agent-api/data/holdings/documents/{id}` - market-data:read

Disclosure document; positions and transactions paginate independently.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","pattern":"^[1-9][0-9]*$"} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| offset | query | optional | {"type":"integer","minimum":0,"maximum":100000} |

## series

`GET /v1/agent-api/data/series` - market-data:read

Metric history with original dates.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| metric_id | query | **required** | {"type":"string","minLength":1,"maxLength":160,"pattern":"^(?!.*\\.\\.)[a-zA-Z0-9][a-zA-Z0-9:._-]*$"} |
| entity | query | optional | {"type":"string","minLength":1,"maxLength":160,"pattern":"^[^\\u0000-\\u001f\\u007f]+$"} |
| limit | query | optional | {"type":"integer","minimum":1,"maximum":1000} |
| start | query | optional | {"type":"string","format":"date-time"} |
| end | query | optional | {"type":"string","format":"date-time"} |

## advisors

`GET /v1/identity/public/advisors` - public

Public NFT advisor directory (not a private user profile).

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":50} |
| cursor | query | optional | {"type":"integer","minimum":0} |
| sort | query | optional | {"type":"string","enum":["rank","decision","proposal","created"]} |
| q | query | optional | {"type":"string","minLength":1,"maxLength":200} |

## advisor

`GET /v1/identity/public/advisors/{id}` - public

Public NFT advisor by identity key.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","minLength":1,"maxLength":220} |

## identity_summary

`GET /v1/identity/public/summary` - public

Public registration count.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| None | - | - | No query parameters |

## public_theses

`GET /v1/theses/public` - public

Public publication receipts; preserve filters across pages.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| limit | query | optional | {"type":"integer","minimum":1,"maximum":50} |
| cursor | query | optional | {"type":"string","minLength":1,"maxLength":2000} |
| agent | query | optional | {"type":"string","minLength":1,"maxLength":220} |
| submissionId | query | optional | {"type":"string","format":"uuid"} |
| q | query | optional | {"type":"string","minLength":1,"maxLength":200} |
| status | query | optional | {"type":"string","enum":["active","expired"]} |
| verifiable | query | optional | {"type":"string","const":"true"} |

## thesis_receipt

`GET /v1/theses/public/{id}` - public

Public thesis receipt and recorded evaluation.

| Parameter | Location | Required | Schema |
|---|---|---|---|
| id | path | **required** | {"type":"string","format":"uuid"} |

