---
name: sinch-10dlc
description: Register US 10DLC brands and campaigns with Sinch. Use when setting up A2P SMS messaging on 10-digit long codes in the United States.
---

# Sinch 10DLC Registration API

## Overview

10DLC (10-Digit Long Code) is the US system for Application-to-Person (A2P) SMS messaging using standard 10-digit phone numbers. Before sending A2P SMS in the US, you must register your brand and campaign with The Campaign Registry (TCR) via Sinch's Registration API.

**Base URL:** `https://us10dlc.api.sinch.com`

**API Version:** v1

**Auth:** OAuth2 (recommended) or HTTP Basic (testing only)

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
curl -H "Authorization: Bearer YOUR_access_token" \
  https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations
```

**Basic Auth (testing only):**

```bash
curl -u YOUR_key_id:YOUR_key_secret \
  https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations
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

### First API Call -- List Brand Registrations

```bash
curl -X GET \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations' \
  -u YOUR_key_id:YOUR_key_secret
```

## Key Concepts

- **Brand**: The company or entity sending messages. Must be registered with TCR before creating campaigns. Brand ID starts with "B" (e.g., `BESINCH`).
- **Campaign**: A specific messaging use case tied to a brand. Defines what messages are sent, to whom, and why.
- **TCR (The Campaign Registry)**: Industry body that manages 10DLC registrations. Sinch submits to TCR on your behalf.
- **Vetting**: Verification process for brands. Two types:
  - **Simplified Registration**: Basic brand verification only.
  - **Full Registration**: Complete vetting that grants higher throughput.
- **Trust Score**: TCR assigns a trust score to brands based on vetting. Higher scores unlock higher message throughput.
- **Use Case**: The type of messaging (e.g., marketing, customer care, account notifications). Each campaign must declare a use case.
- **CSP (Campaign Service Provider)**: Sinch acts as your CSP, handling TCR submission and carrier registration.

## Common Patterns

### Register a Brand

```bash
curl -X POST \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "displayName": "Acme Corp",
    "organizationType": "PRIVATE_PROFIT",
    "registrationType": "FULL",
    "ein": "12-3456789",
    "altBusinessId": "",
    "companyName": "Acme Corporation",
    "website": "https://acme.example.com",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "email": "admin@acme.example.com",
    "phone": "+12125551234",
    "vertical": "TECHNOLOGY",
    "stockExchange": "NONE",
    "stockSymbol": ""
  }'
```

### Check Brand Registration Status

```bash
curl -X GET \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations/{brandRegistrationId}' \
  -u {keyId}:{keySecret}
```

### List All Brand Registrations

```bash
curl -X GET \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations' \
  -u {keyId}:{keySecret}
```

### Get Brand Vetting Info

```bash
curl -X GET \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations/{brandRegistrationId}/vettingInfo' \
  -u {keyId}:{keySecret}
```

### Upgrade Brand from Simplified to Full

```bash
curl -X POST \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/brandRegistrations/{brandRegistrationId}/upgrade' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret}
```

### Create a Campaign

```bash
curl -X POST \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/campaigns' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "brandId": "BYOURBRAND",
    "useCase": "MIXED",
    "description": "Acme Corp sends order confirmations and delivery updates to customers who opted in via our website.",
    "sampleMessages": [
      "Your order #12345 has been confirmed. Reply STOP to opt out.",
      "Your package is out for delivery. Track at https://acme.example.com/track"
    ],
    "messageFlow": "Customers opt in during checkout by checking a consent box.",
    "helpMessage": "Reply HELP for support or visit https://acme.example.com/help",
    "optOutMessage": "You have been unsubscribed. No more messages will be sent.",
    "embeddedLink": true,
    "embeddedPhone": false,
    "numberPool": false,
    "ageGated": false,
    "directLending": false
  }'
```

### Check Campaign Registration Status

```bash
curl -X GET \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/campaigns/{campaignId}' \
  -u {keyId}:{keySecret}
```

### Upload Supporting Documents for Campaign

```bash
curl -X POST \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/campaigns/{campaignId}/documents' \
  -H 'Content-Type: multipart/form-data' \
  -u {keyId}:{keySecret} \
  -F 'file=@/path/to/document.pdf' \
  -F 'submit=true'
```

Set `submit=false` for all uploads except the final one. Set `submit=true` on the last file to submit the campaign for review.

### Qualify Campaign (Check Requirements)

```bash
curl -X POST \
  'https://us10dlc.api.sinch.com/v1/projects/{projectId}/campaigns:qualify' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "brandId": "BYOURBRAND",
    "useCase": "MIXED"
  }'
```

## Gotchas and Best Practices

1. **Registration is asynchronous.** Brand and campaign registrations may take minutes to days. Poll the status endpoint (Sinch suggests every hour) until status is `Approved` or `Rejected`.
2. **No webhooks for status changes.** You must poll. There is no callback/webhook for registration state transitions.
3. **Campaign IDs are not TCR campaign IDs.** Sinch returns a ULID-format campaign ID. The TCR campaign ID is assigned after approval and TCR submission.
4. **Trust score determines throughput.** Higher vetting scores unlock more messages per second. Full registration yields higher scores than simplified.
5. **Rejection feedback.** Use the brand feedback endpoint to understand rejection reasons. Common categories: `TAX_ID` (EIN mismatch), `STOCK_SYMBOL` (stock info mismatch).
6. **Required for US A2P SMS.** All US A2P messaging on 10-digit long codes requires 10DLC registration. Without it, messages may be blocked by carriers.
7. **Campaign description must be specific.** Describe who sends, who receives, and why. Vague descriptions lead to rejection.
8. **Sample messages required.** Provide realistic examples that match your declared use case.
9. **Opt-in/opt-out compliance.** Include clear opt-in flow description and STOP/HELP message handling per CTIA guidelines.
10. **Three registration options.** (a) Sinch as CSP handles everything, (b) You are CSP and get numbers from Sinch, (c) You are CSP and import your own numbers.
11. **Dashboard alternative.** You can also register brands and campaigns through the Sinch Build Dashboard UI if you prefer not to use the API.
12. **Carrier fees.** Campaign registration involves fees determined by the brand and use case. Use the `campaign:qualify` endpoint to check requirements before submitting.

## Links

- [10DLC Registration API Reference](https://developers.sinch.com/docs/10dlc-registration.md)
- [10DLC Registration Overview](https://developers.sinch.com/docs/10dlc-registration.md)
- [Brand Registration API Reference](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration.md)
- [Campaign Registration API Reference](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration.md)
- [10DLC Registration Options (Community)](https://community.sinch.com/t5/10DLC/10DLC-Registration-Options-Overview/ta-p/12422)
- [What is 10DLC Messaging (Blog)](https://sinch.com/blog/what-is-10dlc/)
- [10DLC FAQ](https://sinch.com/blog/10dlc-faq/)
- [Numbers API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/numbers/api-reference/numbers.yaml?download)
- [10DLC Registration API Reference (Markdown)](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
