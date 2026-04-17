---
name: sinch-number-lookup-api
description: Looks up phone number details via Sinch Number Lookup API. Use when checking carrier, line type, porting status, SIM swap, VoIP detection, or reassigned number detection (RND) for fraud prevention or routing decisions.
metadata:
  author: Sinch
  version: 1.0.2
  category: Numbers
  tags: number-lookup, carrier, line-type, sim-swap, voip-detection, fraud-prevention
  uses:
    - sinch-authentication
    - sinch-sdks
---

# Sinch Number Lookup API

## Overview

Queries phone numbers for carrier, line type, porting, SIM swap, VoIP detection, and reassigned number detection. Used for fraud prevention, routing, and data enrichment. One number per request — no batch endpoint.

## Agent Instructions

Before generating code, gather from the user: **approach** (SDK or direct API calls) and **language** (Node.js, Python, Java, .NET/C#, curl). Do not assume defaults.

When the user chooses **SDK**, refer to [sinch-sdks](../sinch-sdks/SKILL.md) for installation, client initialization, and language-specific references. Note: Number Lookup is only supported in **Node.js** and **Python** (partial) SDKs — for Java and .NET, use direct HTTP calls.

## Getting Started

### Authentication

See [sinch-authentication](../sinch-authentication/SKILL.md) for full setup.

### Base URL

`https://lookup.api.sinch.com`

**Endpoint:** `POST /v2/projects/{PROJECT_ID}/lookups`

### First API Call

```bash
curl -X POST \
  "https://lookup.api.sinch.com/v2/projects/{PROJECT_ID}/lookups" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{
    "number": "+12025550134",
    "features": ["LineType", "SimSwap", "VoIPDetection", "RND"],
    "rndFeatureOptions": { "contactDate": "2025-01-01" }
  }'
```

For SDK setup (Node.js, Python, Java, .NET), see the [Getting Started Guide](https://developers.sinch.com/docs/number-lookup-api-v2/getting-started).

## Request

| Field | Type | Required | Notes |
|---|---|---|---|
| `number` | string | Yes | Single E.164 number (with `+` prefix) |
| `features` | string[] | No | `LineType` (default), `SimSwap`, `VoIPDetection` (alpha), `RND` (alpha) |
| `rndFeatureOptions.contactDate` | string | If `RND` requested | `YYYY-MM-DD` format |

**Critical:** If `features` is omitted, only `LineType` is returned. You must explicitly request `SimSwap`, `VoIPDetection`, or `RND`.

## Response

Flat object (not an array). Each feature populates its own sub-object; unrequested features are `null`.

**Top-level fields:** `number`, `countryCode` (ISO 3166-1 alpha-2), `traceId`

**`line` object:**

| Field | Type | Values |
|---|---|---|
| `carrier` | string | Carrier name, e.g. `"T-Mobile USA"` |
| `type` | string enum | `Landline`, `Mobile`, `VoIP`, `Special`, `Freephone`, `Other` |
| `mobileCountryCode` | string | MCC, e.g. `"310"` |
| `mobileNetworkCode` | string | MNC, e.g. `"260"` |
| `ported` | boolean | Whether ported |
| `portingDate` | string | ISO 8601 datetime |
| `error` | object\|null | Per-feature error (`status`, `title`, `detail`, `type`) |

**`simSwap` object:**

| Field | Type | Values |
|---|---|---|
| `swapped` | boolean | Whether SIM swap occurred |
| `swapPeriod` | string enum | `Undefined`, `SP4H`, `SP12H`, `SP24H`, `SP48H`, `SP5D`, `SP7D`, `SP14D`, `SP30D`, `SPMAX` |
| `error` | object\|null | Per-feature error |

**`voIPDetection` object (alpha):**

| Field | Type | Values |
|---|---|---|
| `probability` | string enum | `Unknown`, `Low`, `Likely`, `High` -- **not numeric** |
| `error` | object\|null | Per-feature error |

**`rnd` object (alpha):**

| Field | Type | Values |
|---|---|---|
| `disconnected` | boolean | Disconnected after `contactDate` |
| `error` | object\|null | Per-feature error |

For full response schemas, see the [API Reference](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2.md).

## Common Workflows

### 1. Fraud check before verification

1. Look up the number with `features: ["SimSwap", "VoIPDetection"]`
2. If `simSwap.swapped` is `true` and `swapPeriod` is `SP4H` or `SP24H` → flag as high risk
3. If `voIPDetection.probability` is `High` or `Likely` → require additional verification
4. If either feature returns a non-null `error` → fall back to the other feature's result for risk scoring
5. Otherwise → proceed with SMS/voice verification

### 2. Pre-send number hygiene

1. Look up the number with `features: ["LineType", "RND"]` (include `rndFeatureOptions.contactDate`)
2. If `rnd.disconnected` is `true` → remove from contact list
3. Route based on `line.type`: SMS for `Mobile`, voice for `Landline`

### 3. Combined lookup + verification

1. Look up the number with `features: ["LineType", "SimSwap"]`
2. If `line.type` is `Landline` → use voice verification instead of SMS
3. If `simSwap.swapped` is `true` → skip SMS verification, use an alternative channel
4. See [Combined Lookup + Verification](https://developers.sinch.com/docs/number-lookup-api-v2/combined-lookup-verification.md) for the full flow.

### 4. Multiple numbers

No batch endpoint. Use parallel requests:

```javascript
const results = await Promise.all(
  numbers.map((number) => sinch.numberLookup.lookup({ number, features: ['LineType', 'SimSwap'] }))
);
```

## Gotchas

1. **`features` must be explicit.** Omitting it returns only `LineType`. SIM swap, VoIP, and RND require explicit opt-in.
2. **VoIP probability is a string enum**, not a 0–1 score. Values: `Unknown`, `Low`, `Likely`, `High`.
3. **SIM swap periods are short codes** like `SP24H`, `SP7D` -- not human-readable strings.
4. **Partial failures are possible.** Each feature sub-object has its own `error`. A lookup can succeed for `line` but fail for `simSwap`.
5. **RND requires `contactDate`.** Omitting `rndFeatureOptions` when requesting `RND` causes a `400`.
6. **SIM swap depends on carrier support.** Not available for all numbers or regions.
7. **VoIPDetection and RND are alpha.** Behavior may change.
8. **Rate limiting.** `429 Too Many Requests` when exceeded. Contact Sinch for tier info.
9. **Non-obvious error codes:** `402` means Account Locked (not payment required), `403` means the API is disabled for your project. If response includes a `403`, direct the user to check this [documentation](https://developers.sinch.com/docs/number-lookup-api-v2/getting-started#1-declare-intended-use-case).

## Links

- [API Reference (v2)](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2.md)
- [v2 Endpoint Details](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2/numberlookupv2.md)
- [Overview](https://developers.sinch.com/docs/number-lookup-api-v2/overview)
- [Getting Started](https://developers.sinch.com/docs/number-lookup-api-v2/getting-started)
- [Combined Lookup + Verification](https://developers.sinch.com/docs/number-lookup-api-v2/combined-lookup-verification.md)
- [Release Notes](https://developers.sinch.com/docs/number-lookup-api-v2/release-notes)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/number-lookup-api-v2/api-reference/number-lookup-api-v2.yaml?download)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
