---
name: sinch-number-lookup
description: Look up phone number details with Sinch Number Lookup API. Use when checking carrier, line type, porting status, SIM swap, or VoIP detection.
---

# Sinch Number Lookup API

## Overview

The Sinch Number Lookup API provides detailed information about phone numbers, including carrier, line type, porting status, SIM swap detection, and VoIP probability. It is used for fraud prevention, communication routing, data enrichment, and verifying number validity before sending messages or calls.

**Base URL:** `https://lookup.api.sinch.com`

**API Version:** v2

**Auth:** OAuth2 (recommended) or HTTP Basic (testing only)

**Important:** Sinch Number Lookup is not a traditional HLR lookup. It uses data derived from national regulators, providing consistent results about how numbers are assigned to operators. This does not confirm a number is currently active, only that it is allocated.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

**OAuth2 (production):**

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_key_id:YOUR_key_secret
```

Use the returned `access_token` as a Bearer token:

```bash
curl -X POST https://lookup.api.sinch.com/v2/projects/{projectId}/lookups \
  -H 'Authorization: Bearer YOUR_access_token' \
  -H 'Content-Type: application/json' \
  -d '{ "numbers": ["+12025550134"] }'
```

**Basic Auth (testing only):**

```bash
curl -X POST https://lookup.api.sinch.com/v2/projects/{projectId}/lookups \
  -H 'Content-Type: application/json' \
  -u YOUR_key_id:YOUR_key_secret \
  -d '{ "numbers": ["+12025550134"] }'
```

### SDK Setup

**Node.js:**

```bash
npm install @sinch/sdk-core
```

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_project_id',
  keyId: 'YOUR_key_id',
  keySecret: 'YOUR_key_secret',
});
```

**Python:**

```bash
pip install sinch
```

```python
from sinch import SinchClient

sinch_client = SinchClient(
    key_id="YOUR_key_id",
    key_secret="YOUR_key_secret",
    project_id="YOUR_project_id",
)
```

**Java:** Add Maven dependency `com.sinch.sdk:sinch-sdk-java`.

**.NET:** `dotnet add package Sinch`

### First API Call -- Look Up a Number

```bash
curl -X POST \
  'https://lookup.api.sinch.com/v2/projects/{projectId}/lookups' \
  -H 'Content-Type: application/json' \
  -u YOUR_key_id:YOUR_key_secret \
  -d '{
    "numbers": ["+12025550134"]
  }'
```

**Node.js SDK:**

```javascript
const result = await sinch.numberLookup.lookup({
  numbers: ['+12025550134'],
});
console.log(result);
```

## Key Concepts

- **Line Type**: The category of the phone number -- `Mobile`, `Fixed`, `VoIP`, `Pager`, `Unknown`, etc.
- **Carrier**: The network operator the number is assigned to.
- **MCC (Mobile Country Code)**: Identifies the country of the mobile network.
- **MNC (Mobile Network Code)**: Identifies the specific mobile network within a country.
- **Porting Status**: Whether a number has been ported from one carrier to another, plus the porting date.
- **SIM Swap Detection**: Indicates whether a SIM swap has occurred recently. Includes the swap period. Useful for fraud detection.
- **VoIP Detection**: Probability score indicating whether the number is a VoIP number. Useful for risk assessment.
- **Disconnected Status**: Whether the number is currently disconnected from a network.
- **Regulator Data vs. HLR**: Sinch uses national regulator data, not live HLR queries. Results show how a number is assigned, not whether it is currently active on the network.

## Common Patterns

### Single Number Lookup

```bash
curl -X POST \
  'https://lookup.api.sinch.com/v2/projects/{projectId}/lookups' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "numbers": ["+12025550134"]
  }'
```

Example response:

```json
{
  "results": [
    {
      "number": "+12025550134",
      "type": "Mobile",
      "carrier": {
        "name": "Verizon Wireless",
        "mobileCountryCode": "311",
        "mobileNetworkCode": "480"
      },
      "ported": {
        "status": "ported",
        "date": "2023-06-15"
      },
      "simSwap": {
        "swapped": true,
        "swapPeriod": "LESS_THAN_24_HOURS"
      },
      "voip": {
        "probability": 0.05
      },
      "disconnected": false
    }
  ]
}
```

```javascript
const result = await sinch.numberLookup.lookup({
  numbers: ['+12025550134'],
});
console.log(result.results[0].type);     // "Mobile"
console.log(result.results[0].carrier);  // { name: "Verizon Wireless", ... }
```

### Batch Lookup (Multiple Numbers)

```bash
curl -X POST \
  'https://lookup.api.sinch.com/v2/projects/{projectId}/lookups' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "numbers": [
      "+12025550134",
      "+12025550135",
      "+447911123456"
    ]
  }'
```

```javascript
const result = await sinch.numberLookup.lookup({
  numbers: ['+12025550134', '+12025550135', '+447911123456'],
});
result.results.forEach((entry) => {
  console.log(`${entry.number}: ${entry.type} - ${entry.carrier?.name}`);
});
```

### Fraud Detection with SIM Swap

```javascript
const result = await sinch.numberLookup.lookup({
  numbers: ['+12025550134'],
});

const simSwap = result.results[0].simSwap;
if (simSwap?.swapped && simSwap.swapPeriod === 'LESS_THAN_24_HOURS') {
  console.log('WARNING: Recent SIM swap detected. High fraud risk.');
  // Block or require additional verification
}
```

### VoIP Detection for Risk Scoring

```javascript
const result = await sinch.numberLookup.lookup({
  numbers: ['+12025550134'],
});

const voipProbability = result.results[0].voip?.probability ?? 0;
if (voipProbability > 0.8) {
  console.log('Number is likely VoIP. Apply additional verification.');
}
```

## Gotchas and Best Practices

1. **Not a live HLR lookup.** Sinch uses regulator data, not real-time mobile network queries. A number appearing in results does not mean it is currently active.
2. **Cost per lookup.** Each lookup is billed. Batch requests with multiple numbers in a single call are more efficient than individual calls.
3. **Rate limiting.** The API has tiered rate limits. Contact Sinch to understand your tier and request increases if needed.
4. **Accuracy for ported numbers.** Ported numbers show the current carrier after porting, with a porting date when available. There may be a delay after recent ports.
5. **SIM swap data is not universal.** SIM swap detection depends on carrier support and is not available for all numbers or regions.
6. **VoIP probability is a score, not binary.** Values range from 0 to 1. Set your own threshold based on risk tolerance.
7. **E.164 format required.** All numbers must include the `+` prefix and country code.
8. **Use OAuth2 in production.** Basic auth is rate-limited and for testing only.
9. **Combined lookup and verification.** Sinch offers a combined Number Lookup + Verification flow for enhanced fraud detection. See the combined lookup docs.
10. **Response fields vary by number.** Not all fields are populated for every number. Always handle missing/null fields gracefully.

## Links

- [Number Lookup API v2 Reference](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2.md)
- [Number Lookup API Overview](https://developers.sinch.com/docs/number-lookup-api/overview)
- [Getting Started Guide](https://developers.sinch.com/docs/number-lookup-api/getting-started)
- [Combined Lookup and Verification](https://developers.sinch.com/docs/number-lookup-api-v2/combined-lookup-verification.md)
- [Number Lookup API Reference](https://developers.sinch.com/docs/number-lookup-api-v2.md)
- [Number Lookup v2 Endpoint](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2/numberlookupv2.md)
- [Number Lookup API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/number-lookup-api-v2/api-reference/number-lookup-api-v2.yaml?download)
- [Number Lookup API Reference (Markdown)](https://developers.sinch.com/docs/number-lookup-api-v2/api-reference/number-lookup-v2.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
