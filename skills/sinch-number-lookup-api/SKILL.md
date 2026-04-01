---
name: sinch-number-lookup-api
description: Looks up phone number details via Sinch Number Lookup API. Use when checking carrier, line type, porting status, SIM swap, VoIP detection, or reassigned number detection (RND) for fraud prevention, routing decisions, number intelligence, or phone number validation.
metadata:
  author: Sinch
  version: 1.0.0
---

# Sinch Number Lookup API

## Overview

Queries phone numbers for carrier, line type, porting, SIM swap, VoIP detection, and reassigned number detection. Used for fraud prevention, routing, and data enrichment. One number per request — no batch endpoint.

**Auth:** OAuth2 bearer token (recommended) or HTTP Basic (`keyId:keySecret`, testing only). See [sinch-authentication](../sinch-authentication/SKILL.md) for setup.

## Getting Started

Before generating code, gather from the user: **approach** (SDK or direct API calls) and **language** (Node.js, Python, Java, .NET/C#, curl). Do not assume defaults.

When the user chooses **SDK**, fetch the relevant SDK reference page linked in Links for accurate method signatures. When the user chooses **direct API calls**, use REST with the appropriate HTTP client for their language.

| Language | Package                        | Install                       |
| -------- | ------------------------------ | ----------------------------- |
| Node.js  | `@sinch/sdk-core`              | `npm install @sinch/sdk-core` |
| Java     | `com.sinch.sdk:sinch-sdk-java` | Maven dependency (see below)  |
| Python   | `sinch`                        | `pip install sinch`           |
| .NET     | `Sinch`                        | `dotnet add package Sinch`    |

#### Java Maven dependency

Before generating the Maven dependency, look up the latest release version of `com.sinch.sdk:sinch-sdk-java` on [Maven Central](https://central.sonatype.com/artifact/com.sinch.sdk/sinch-sdk-java) and use that version.

```xml
<dependency>
    <groupId>com.sinch.sdk</groupId>
    <artifactId>sinch-sdk-java</artifactId>
    <version>LATEST_VERSION</version>
</dependency>
```

### Base URL

- **v2 (current):** `https://lookup.api.sinch.com`
- **v1 (legacy):** `https://number-lookup.api.sinch.com` (no OAuth2, no projectId)

### Endpoint

`POST /v2/projects/{projectId}/lookups`

### First API Call (curl)

```bash
curl -X POST \
  "https://lookup.api.sinch.com/v2/projects/$PROJECT_ID/lookups" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "number": "+12025550134",
    "features": ["LineType", "SimSwap", "VoIPDetection", "RND"],
    "rndFeatureOptions": { "contactDate": "2025-01-01" }
  }'
```

For HTTP Basic auth (testing only), replace the `Authorization` header with `-u YOUR_KEY_ID:YOUR_KEY_SECRET`.

### First API Call (Node.js)

```javascript
const fetch = require("cross-fetch");

const PROJECT_ID = process.env.SINCH_PROJECT_ID;
const KEY_ID = process.env.SINCH_KEY_ID;
const KEY_SECRET = process.env.SINCH_KEY_SECRET;

const response = await fetch(
  `https://lookup.api.sinch.com/v2/projects/${PROJECT_ID}/lookups`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
    },
    body: JSON.stringify({
      number: "+12025550134",
      features: ["LineType", "SimSwap"],
    }),
  },
);
const data = await response.json();
console.log(data.line.type); // e.g. "Mobile"
console.log(data.simSwap.swapped); // e.g. false
```

### Request

| Field                           | Type     | Required           | Notes                                                                   |
| ------------------------------- | -------- | ------------------ | ----------------------------------------------------------------------- |
| `number`                        | string   | Yes                | Single E.164 number (with `+` prefix)                                   |
| `features`                      | string[] | No                 | `LineType` (default), `SimSwap`, `VoIPDetection` (alpha), `RND` (alpha) |
| `rndFeatureOptions.contactDate` | string   | If `RND` requested | `YYYY-MM-DD` format                                                     |

### Response

Flat object (not an array). Each feature populates its own sub-object; unrequested features are `null`.

**Top-level fields:** `number`, `countryCode` (ISO 3166-1 alpha-2), `traceId`

**`line` object:**

| Field               | Type         | Values                                                        |
| ------------------- | ------------ | ------------------------------------------------------------- |
| `carrier`           | string       | Carrier name, e.g. `"T-Mobile USA"`                           |
| `type`              | string enum  | `Landline`, `Mobile`, `VoIP`, `Special`, `Freephone`, `Other` |
| `mobileCountryCode` | string       | MCC, e.g. `"310"`                                             |
| `mobileNetworkCode` | string       | MNC, e.g. `"260"`                                             |
| `ported`            | boolean      | Whether ported                                                |
| `portingDate`       | string       | ISO 8601 datetime                                             |
| `error`             | object\|null | Per-feature error (`status`, `title`, `detail`, `type`)       |

**`simSwap` object:**

| Field        | Type         | Values                                                                                    |
| ------------ | ------------ | ----------------------------------------------------------------------------------------- |
| `swapped`    | boolean      | Whether SIM swap occurred                                                                 |
| `swapPeriod` | string enum  | `Undefined`, `SP4H`, `SP12H`, `SP24H`, `SP48H`, `SP5D`, `SP7D`, `SP14D`, `SP30D`, `SPMAX` |
| `error`      | object\|null | Per-feature error                                                                         |

**`voIPDetection` object (alpha):**

| Field         | Type         | Values                             |
| ------------- | ------------ | ---------------------------------- |
| `probability` | string enum  | `Unknown`, `Low`, `Likely`, `High` |
| `error`       | object\|null | Per-feature error                  |

**`rnd` object (alpha):**

| Field          | Type         | Values                           |
| -------------- | ------------ | -------------------------------- |
| `disconnected` | boolean      | Disconnected after `contactDate` |
| `error`        | object\|null | Per-feature error                |

## Key Concepts

**Features** — Each lookup can request one or more features: `LineType` (default), `SimSwap`, `VoIPDetection` (alpha), `RND` (alpha). Unrequested features return `null`.
**E.164 format** — Numbers must include the `+` prefix (e.g., `+12025550134`).
**RND (Reassigned Number Detection)** — Checks if a number was disconnected after a given `contactDate`. Alpha feature.

## Common Patterns

### Fraud check before verification

1. Look up the number with `features: ["SimSwap", "VoIPDetection"]`
2. If `simSwap.swapped` is `true` and `swapPeriod` is `SP4H` or `SP24H` → flag as high risk
3. If `voIPDetection.probability` is `High` or `Likely` → require additional verification
4. If either feature returns a non-null `error` → fall back to the other feature's result for risk scoring
5. Otherwise → proceed with SMS/voice verification

### Pre-send number hygiene

1. Look up with `features: ["LineType", "RND"]` (include `rndFeatureOptions.contactDate`)
2. If `rnd.disconnected` is `true` → remove from contact list
3. Route based on `line.type`: SMS for `Mobile`, voice for `Landline`

### Combined lookup + verification

1. Look up with `features: ["LineType", "SimSwap"]`
2. If `line.type` is `Landline` → use voice verification instead of SMS
3. If `simSwap.swapped` is `true` → skip SMS verification, use an alternative channel
4. See [Combined Lookup + Verification](https://developers.sinch.com/docs/number-lookup-api-v2/combined-lookup-verification.md) for the full flow.

### Multiple numbers (parallel)

No batch endpoint. Use parallel requests:

```javascript
async function lookupNumber(number, features) {
  const resp = await fetch(
    `https://lookup.api.sinch.com/v2/projects/${PROJECT_ID}/lookups`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
      },
      body: JSON.stringify({ number, features }),
    },
  );
  return resp.json();
}

const results = await Promise.all(
  numbers.map((n) => lookupNumber(n, ["LineType", "SimSwap"])),
);
```

## Gotchas and Best Practices

- **`features` must be explicit.** Omitting it returns only `LineType`. SIM swap, VoIP, and RND require explicit opt-in.
- **VoIP probability is a string enum**, not a 0–1 score. Values: `Unknown`, `Low`, `Likely`, `High`.
- **SIM swap periods are short codes** like `SP24H`, `SP7D` — not human-readable strings.
- **Partial failures are possible.** Each feature sub-object has its own `error`. A lookup can succeed for `line` but fail for `simSwap`.
- **RND requires `contactDate`.** Omitting `rndFeatureOptions` when requesting `RND` causes a `400`.
- **SIM swap depends on carrier support.** Not available for all numbers or regions.
- **VoIPDetection and RND are alpha.** Behavior may change.
- Use OAuth2 in production. Cache tokens (expire in ~1 hour). Never use Basic Auth in production.
- Load credentials from environment variables. Never hardcode.
- **Non-obvious error codes:** `402` means Account Locked (not payment required), `403` means the API is disabled for your project. If response includes a `403`, direct the user to check this [documentation](https://developers.sinch.com/docs/number-lookup-api-v2/getting-started#1-declare-intended-use-case).
- **Rate limiting.** `429 Too Many Requests` when exceeded. Contact Sinch for tier info.

## Links

- [Authentication setup](../sinch-authentication/SKILL.md)
- [Overview](https://developers.sinch.com/docs/number-lookup-api-v2/overview)
- [Getting Started](https://developers.sinch.com/docs/number-lookup-api-v2/getting-started)
- [API Reference (v2)](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2.md)
- [v2 Endpoint Details](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2/numberlookupv2.md)
- [Combined Lookup + Verification](https://developers.sinch.com/docs/number-lookup-api-v2/combined-lookup-verification.md)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/number-lookup-api-v2/api-reference/number-lookup-api-v2.yaml?download)
- [v1 API Reference](https://developers.sinch.com/docs/number-lookup-api/api-reference/number-lookup) (legacy)
- [Release Notes](https://developers.sinch.com/docs/number-lookup-api-v2/release-notes)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
- [Node.js SDK](https://developers.sinch.com/docs/sdks/node)
- [Python SDK](https://developers.sinch.com/docs/sdks/python)
- [Java SDK](https://developers.sinch.com/docs/sdks/java)
- [.NET SDK](https://developers.sinch.com/docs/sdks/dotnet)
- [Dashboard](https://dashboard.sinch.com)
