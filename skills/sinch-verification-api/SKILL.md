---
name: sinch-verification-api
description: Verify phone numbers via SMS, Flashcall, Phone Call, Data (seamless carrier-level), or WhatsApp with Sinch Verification API. Use when implementing user phone verification, OTP, two-factor authentication, or number ownership confirmation flows.
metadata:
  author: Sinch
  version: 1.0.1
  category: Verification
  tags: verification, otp, sms, flashcall, 2fa, phone-verification, whatsapp
  uses:
    - sinch-authentication
---

# Sinch Verification API

## Overview

The Sinch Verification API verifies phone numbers through SMS OTP, Flashcall (missed call CLI), Phone Call (spoken OTP), Data (carrier-level), and WhatsApp OTP. Used for registration, 2FA, and number ownership confirmation.

**Base URL:** `https://verification.api.sinch.com`  
**URL path prefix:** `/verification/v1/`  
**Auth:** Application Key + Secret (NOT project-level OAuth2 — see [Authentication Guide](https://developers.sinch.com/docs/verification/api-reference/authentication.md))

## Agent Instructions

Before generating code, you **MUST** ask the user:

1. **Which verification method?** — `sms`, `flashcall`, `callout`, `seamless`, or `whatsapp`
2. **SDK or direct HTTP?** — If SDK, which language?

Do not assume defaults or skip these questions. Wait for answers before generating code.

For SDK syntax and setup, see [sinch-sdks](../sinch-sdks/SKILL.md). For direct HTTP, use the [API Reference (Markdown)](https://developers.sinch.com/docs/verification/api-reference/verification.md) for request/response schemas.

## Getting Started

### Authentication

See [sinch-authentication](../sinch-authentication/SKILL.md) skill for dashboard setup.

The Verification API uses **Application Key + Application Secret** (from your Sinch dashboard app), not project-level OAuth2. Three auth methods are supported:

| Method | Use for |
|--------|---------|
| [Application Signed Request](https://developers.sinch.com/docs/verification/api-reference/authentication/application-signed-request.md) | Secure authentication method for production traffic |
| [Basic Auth](https://developers.sinch.com/docs/verification/api-reference/authentication/basic-authentication.md) | Simple method for prototyping and trying out API calls |
| [Public Auth](https://developers.sinch.com/docs/verification/api-reference/authentication/public-authentication.md) | Insecure environments (end user's device). Android/iOS SDK only, requires callback webhook |

Minimum auth level is configurable in the Sinch Dashboard — requests below that level are rejected. See the [Authentication Guide](https://developers.sinch.com/docs/verification/api-reference/authentication.md) for signing details.

### SDK Setup

See [sinch-sdks](../sinch-sdks/SKILL.md) for installation and client initialization across all languages. All SDKs initialize with `applicationKey` + `applicationSecret` (not project credentials).

### Canonical Example — Start SMS Verification

```bash
# Uses Basic Auth (-u) for simplicity. Use Application Signed Requests in production.
curl -X POST https://verification.api.sinch.com/verification/v1/verifications \
  -H 'Content-Type: application/json' \
  -u {APPLICATION_KEY}:{APPLICATION_SECRET} \
  -d '{
    "identity": { "type": "number", "endpoint": "+12025550134" },
    "method": "sms"
  }'
```

Response includes `id` (verification ID), `sms.template`, `sms.interceptionTimeout`, and `_links` with localized URLs for status/report actions.

## Key Concepts

### Verification Methods

| Method | Value | Behavior |
|--------|-------|----------|
| SMS | `sms` | Sends OTP via SMS. User enters code. |
| FlashCall | `flashcall` | Missed call — caller ID is the OTP. Auto-intercepted on Android; manual entry on iOS/JS. |
| Phone Call | `callout` | PSTN call dictates an OTP code. User enters the code into the app (same flow as SMS). |
| Data | `seamless` | Carrier-level verification via mobile data. No user interaction. Requires account manager to enable. |
| WhatsApp | `whatsapp` | Sends OTP via WhatsApp message. User enters code. |

### Core Model

- **Identity**: Always `{ "type": "number", "endpoint": "+E164_NUMBER" }`
- **Verification ID**: Returned on start. Used to report code or query status.
- **Reference**: Optional unique tracking string in start request. Queryable via status endpoint.
- **Statuses**: `PENDING` | `SUCCESSFUL` | `FAIL` | `DENIED` | `ABORTED` | `ERROR`
- **Failure reasons** (most common): `Invalid code`, `Expired`, `Fraud`, `Blocked`, `Denied by callback`. Full list in the [API Reference](https://developers.sinch.com/docs/verification/api-reference/verification.md).

## API Endpoints

All endpoints documented in the [Verification API Reference](https://developers.sinch.com/docs/verification/api-reference/verification.md).

### Start Verification

`POST /verification/v1/verifications`

Set `method` to `sms`, `flashcall`, `callout`, `seamless`, or `whatsapp`. Optional fields:
- `reference` — unique tracking string, passed to all events
- `custom` — arbitrary text (max 4096 chars), passed to all events
- `Accept-Language` header — controls SMS language (default `en-US`)

Method-specific options (backend-originated signed requests only): `smsOptions`, `flashCallOptions`, `calloutOptions`, `whatsappOptions`. See the [API Reference](https://developers.sinch.com/docs/verification/api-reference/verification.md) for full schemas.

### Report Verification

Report by identity: `PUT /verification/v1/verifications/number/{endpoint}`  
Report by ID: `PUT /verification/v1/verifications/id/{id}`

Body includes `method` and a method-specific object with the user's input:
- SMS / Phone Call / WhatsApp: `{ "method": "sms", "sms": { "code": "1234" } }` (replace method name + key accordingly)
- FlashCall: `{ "method": "flashcall", "flashCall": { "cli": "+46000000000" } }` — the `cli` is the **full international caller ID** from the incoming missed call

### Get Verification Status

By ID: `GET /verification/v1/verifications/id/{id}`  
By method + number: `GET /verification/v1/verifications/{method}/number/{endpoint}`  
By reference: `GET /verification/v1/verifications/reference/{reference}`

**Note:** The by-identity endpoint requires `{method}` in the path — it is NOT `/verifications/number/{endpoint}`.

## Common Patterns

### Standard Verification Flow

1. **Start** — `POST /verification/v1/verifications` with identity + method → receive verification `id`
2. **Report** — User receives code/call → `PUT /verification/v1/verifications/id/{id}` with the code/CLI
3. **Check status** — `GET /verification/v1/verifications/id/{id}` → confirm `SUCCESSFUL`

If the code expires or verification fails, you **cannot re-report** — start a new verification.

### Webhooks (Callbacks)

For production flows, configure a callback URL in the Sinch Dashboard. The API sends:

- **VerificationRequestEvent** — fired when a verification starts. Respond with `action: allow` or `action: deny` to approve/reject.
- **VerificationResultEvent** — fired when a verification completes (success or failure). Use for logging, analytics, or triggering downstream actions.

Callbacks are signed — verify signatures using [Callback Signing](https://developers.sinch.com/docs/verification/api-reference/authentication/callback-signed-request.md).

## Gotchas and Best Practices

1. **Auth is Application Key + Secret, not OAuth2.** Do not use project-level credentials.
2. **Use Application Signed Requests in production.** Application auth protects integrity of a request
3. **Base64-decode the secret before signing.** The dashboard value is base64-encoded.
4. **FlashCall auto-intercepts on Android only.** iOS/JS users must manually enter the incoming number. Android SDK is required to intercept calls.
5. **Method availability varies by country.** SMS is the most widely available.
6. **Codes expire.** Configurable via `smsOptions.expiry`. Start a new verification if expired — you cannot re-report on a completed/expired verification.
7. **Report by ID is more precise** than reporting by phone number.
8. **Rate limit:** avoid rapid re-verification of the same number. Implement backoff.
9. **Data verification requires account manager** and mobile data (not Wi-Fi).
10. **SMS language may be overridden** by carrier compliance (e.g., US shortcode requirements).

## Links

- [Verification API Reference (Markdown)](https://developers.sinch.com/docs/verification/api-reference/verification.md)
- [Verification OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/verification/api-reference/verification.yaml?download)
- [Authentication Guide](https://developers.sinch.com/docs/verification/api-reference/authentication.md)
- [Application Signed Requests](https://developers.sinch.com/docs/verification/api-reference/authentication/application-signed-request.md)
- [Callback Signing](https://developers.sinch.com/docs/verification/api-reference/authentication/callback-signed-request.md)
- [Getting Started Guide](https://developers.sinch.com/docs/verification/getting-started.md)
- [Node.js SDK Reference](https://developers.sinch.com/docs/verification/sdk/node/syntax-reference.md)
- [Python SDK Reference](https://developers.sinch.com/docs/verification/sdk/py/syntax-reference.md)
- [Java SDK Reference](https://developers.sinch.com/docs/verification/sdk/java/syntax-reference.md)
- [.NET SDK Reference](https://developers.sinch.com/docs/verification/sdk/dotnet/syntax-reference.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
