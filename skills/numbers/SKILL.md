---
name: sinch-numbers
description: Manage phone numbers with Sinch Numbers API. Use when purchasing, searching, configuring, or releasing virtual numbers for SMS and Voice.
---

# Sinch Numbers API

## Overview

The Sinch Numbers API lets you search for, purchase, configure, and release virtual phone numbers. Numbers are the foundation for SMS and Voice services -- you must acquire a number before sending messages or making calls.

**Base URL:** `https://numbers.api.sinch.com`

**API Version:** v1

**Auth:** OAuth2 (recommended) or HTTP Basic (testing only)

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

**OAuth2 (production):** Exchange project credentials for a bearer token.

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_key_id:YOUR_key_secret
```

Use the returned `access_token` as a Bearer token in subsequent requests.

**Basic Auth (testing only):** Use Key ID as username and Key Secret as password. Rate-limited; do not use in production.

```bash
curl -u YOUR_key_id:YOUR_key_secret \
  https://numbers.api.sinch.com/v1/projects/YOUR_project_id/activeNumbers
```

### SDK Setup

**Node.js:**

```bash
npm install @sinch/sdk-core
# or standalone:
npm install @sinch/numbers
```

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_project_id',
  keyId: 'YOUR_key_id',
  keySecret: 'YOUR_key_secret',
});

const numbersService = sinch.numbers;
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

### First API Call -- Search Available Numbers

```bash
curl -X GET \
  'https://numbers.api.sinch.com/v1/projects/YOUR_project_id/availableNumbers?regionCode=US&type=LOCAL' \
  -H 'Content-Type: application/json' \
  -u YOUR_key_id:YOUR_key_secret
```

**Node.js SDK:**

```javascript
const response = await sinch.numbers.availableNumbers.list({
  regionCode: 'US',
  type: 'LOCAL',
});
console.log(response.availableNumbers);
```

## Key Concepts

- **Available Numbers**: Numbers in the Sinch inventory you can rent. Search by region, type, capabilities, and pattern.
- **Active Numbers**: Numbers currently rented to your project. You pay monthly fees for active numbers.
- **Number Types**: `LOCAL`, `TOLL_FREE`, `MOBILE`. Availability varies by country.
- **Capabilities**: `SMS`, `VOICE`, or both. Specified when renting.
- **Regions**: Numbers are tied to specific countries/regions via ISO 3166-1 alpha-2 `regionCode`.
- **Callback Configuration**: Project-level default callback URL for number-related events.
- **E.164 Format**: All phone numbers must be in E.164 format (e.g., `+12025550134`).

## Common Patterns

### Search Available Numbers

```bash
curl -X GET \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/availableNumbers?regionCode=US&type=LOCAL&capabilities=SMS' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret}
```

```javascript
const available = await sinch.numbers.availableNumbers.list({
  regionCode: 'US',
  type: 'LOCAL',
  capabilities: ['SMS'],
});
```

### Rent a Specific Number

```bash
curl -X POST \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/availableNumbers/+12025550134:rent' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "smsConfiguration": {
      "servicePlanId": "YOUR_servicePlanId"
    },
    "callbackUrl": "https://yourserver.com/callback"
  }'
```

```javascript
const rented = await sinch.numbers.availableNumbers.rent('+12025550134', {
  smsConfiguration: {
    servicePlanId: 'YOUR_servicePlanId',
  },
  callbackUrl: 'https://yourserver.com/callback',
});
```

### Rent Any Number Matching Criteria

```bash
curl -X POST \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/availableNumbers:rentAny' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "regionCode": "US",
    "type": "LOCAL",
    "capabilities": ["SMS"],
    "smsConfiguration": {
      "servicePlanId": "YOUR_servicePlanId",
      "campaignId": "YOUR_campaignId"
    }
  }'
```

```javascript
const rented = await sinch.numbers.availableNumbers.rentAny({
  regionCode: 'US',
  type: 'LOCAL',
  capabilities: ['SMS'],
  smsConfiguration: {
    servicePlanId: 'YOUR_servicePlanId',
    campaignId: 'YOUR_campaignId',
  },
});
```

### List Active Numbers

```bash
curl -X GET \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/activeNumbers?regionCode=US&type=LOCAL' \
  -u {keyId}:{keySecret}
```

```javascript
const active = await sinch.numbers.activeNumbers.list({
  regionCode: 'US',
  type: 'LOCAL',
});
```

### Update Number Configuration

```bash
curl -X PATCH \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/activeNumbers/+12025550134' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "callbackUrl": "https://newserver.com/callback",
    "smsConfiguration": {
      "servicePlanId": "NEW_servicePlanId"
    }
  }'
```

```javascript
const updated = await sinch.numbers.activeNumbers.update('+12025550134', {
  callbackUrl: 'https://newserver.com/callback',
  smsConfiguration: {
    servicePlanId: 'NEW_servicePlanId',
  },
});
```

### Release a Number

```bash
curl -X POST \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/activeNumbers/+12025550134:release' \
  -u {keyId}:{keySecret}
```

```javascript
const released = await sinch.numbers.activeNumbers.release('+12025550134');
```

### List Available Regions

```bash
curl -X GET \
  'https://numbers.api.sinch.com/v1/projects/{projectId}/availableRegions' \
  -u {keyId}:{keySecret}
```

## Gotchas and Best Practices

1. **Use OAuth2 in production.** Basic auth is rate-limited and intended for testing only. Token lifetime is typically one hour.
2. **E.164 format required.** All numbers must include the `+` prefix and country code (e.g., `+12025550134`).
3. **Number availability varies by region.** Not all types (LOCAL, TOLL_FREE, MOBILE) are available in all countries.
4. **Regulatory requirements.** Some regions require identity documentation before numbers can be provisioned.
5. **Do not add unused configuration objects.** When renting, only include `smsConfiguration` or `voiceConfiguration` if you need that capability. Including an empty or unused config object causes errors.
6. **`rentAny` is limited.** Currently `rentAny` works only for US LOCAL numbers.
7. **Number porting takes time.** Porting existing numbers into Sinch can take days to weeks depending on the carrier and region.
8. **Monthly billing.** Active numbers incur monthly charges. Release numbers you no longer need.
9. **Callback URLs.** Configure callbacks at the number level or project level. Number-level overrides project-level.
10. **US 10DLC requirement.** For US A2P SMS, numbers must be associated with an approved 10DLC campaign via `campaignId`.

## Links

- [Numbers API Reference](https://developers.sinch.com/docs/numbers/api-reference/numbers)
- [Getting Started Guide](https://developers.sinch.com/docs/numbers/getting-started)
- [Node.js SDK Reference](https://developers.sinch.com/docs/numbers/sdk/node/syntax-reference/)
- [Python SDK Reference](https://developers.sinch.com/docs/numbers/sdk/python/syntax-reference/)
- [Java SDK Reference](https://developers.sinch.com/docs/numbers/sdk/java/syntax-reference/)
- [.NET SDK Reference](https://developers.sinch.com/docs/numbers/sdk/dotnet/syntax-reference/)
- [@sinch/numbers on npm](https://www.npmjs.com/package/@sinch/numbers)
- [Numbers API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/numbers/api-reference/numbers.yaml?download)
- [Numbers API Reference (Markdown)](https://developers.sinch.com/docs/numbers/api-reference/numbers.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
