---
name: sinch-verification
description: Verify phone numbers via SMS, Flashcall, Phone Call, or Data with Sinch Verification API. Use when implementing user phone verification flows.
---

# Sinch Verification API

## Overview

The Sinch Verification API lets you verify phone numbers through multiple methods: SMS PIN codes, Flashcalls (missed call verification), Phone Calls (voice OTP), and Data verification. It is commonly used for user registration, two-factor authentication, and number ownership confirmation.

**Base URL:** `https://verification.api.sinch.com`

**API Version:** v1

**Auth:** Application Key + Secret (unique to Verification API -- does NOT use project-level OAuth2)

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

The Verification API uses Application Key and Application Secret from your Sinch dashboard application. This is different from other Sinch APIs that use project-level OAuth2.

**Basic Auth (testing/prototyping only):**

```bash
curl -X POST https://verification.api.sinch.com/verification/v1/verifications \
  -H 'Content-Type: application/json' \
  -u YOUR_application_key:YOUR_application_secret \
  -d '{
    "identity": { "type": "number", "endpoint": "+12025550134" },
    "method": "sms"
  }'
```

Basic auth is rate-limited and intended for testing only.

**Application Signed Request (production):**

For production, sign requests using HMAC-SHA256 with your Application Secret. The string-to-sign includes: HTTP method, content MD5, content type, timestamp (x-timestamp header), and request path.

The `Authorization` header format: `Application YOUR_application_key:BASE64(HMAC-SHA256(YOUR_decoded_application_secret, string_to_sign))`

The Application Secret must be **base64-decoded** before use as the HMAC key.

### SDK Setup

**Node.js:**

```bash
npm install @sinch/sdk-core
# or standalone:
npm install @sinch/verification
```

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  applicationKey: 'YOUR_application_key',
  applicationSecret: 'YOUR_application_secret',
});

const verificationService = sinch.verification;
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
    application_key="YOUR_application_key",
    application_secret="YOUR_application_secret",
)
```

**Java:**

```java
import com.sinch.sdk.SinchClient;

var config = Configuration.builder()
    .setApplicationKey("YOUR_application_key")
    .setApplicationSecret("YOUR_application_secret")
    .build();

var sinchClient = new SinchClient(config);
var verification = sinchClient.verification();
```

**.NET:**

```csharp
var sinch = new SinchClient(projectId, keyId, keySecret);
var verificationClient = sinch.Verification("YOUR_application_key", "YOUR_application_secret");
```

### First API Call -- Start SMS Verification

```bash
curl -X POST https://verification.api.sinch.com/verification/v1/verifications \
  -H 'Content-Type: application/json' \
  -u YOUR_application_key:YOUR_application_secret \
  -d '{
    "identity": { "type": "number", "endpoint": "+12025550134" },
    "method": "sms"
  }'
```

**Node.js SDK:**

```javascript
const response = await sinch.verification.verifications.startSms({
  identity: { type: 'number', endpoint: '+12025550134' },
  method: 'sms',
});
console.log(response.id); // Verification ID
```

## Key Concepts

- **Verification Methods**:
  - `sms` -- Sends a PIN code via SMS. User enters the code to verify.
  - `flashcall` -- Places a call that is immediately hung up. The caller ID contains the verification code. Android only.
  - `callout` -- Places a voice call that reads a verification code aloud via text-to-speech.
  - `seamless` -- Data verification using the mobile data connection. No user interaction needed. Limited carrier support.
- **Identity**: Always `{ "type": "number", "endpoint": "+E164_NUMBER" }`.
- **Verification ID**: Returned when starting a verification. Used to report the code.
- **Report**: After the user enters the code, you report it back to Sinch to confirm verification.
- **Callbacks**: Sinch can send webhook callbacks on verification events. Callbacks are signed with your Application Key and Secret.

## Common Patterns

### Start SMS Verification

```bash
curl -X POST https://verification.api.sinch.com/verification/v1/verifications \
  -H 'Content-Type: application/json' \
  -u {applicationKey}:{applicationSecret} \
  -d '{
    "identity": { "type": "number", "endpoint": "+12025550134" },
    "method": "sms"
  }'
```

Response:

```json
{
  "id": "1234567890",
  "method": "sms",
  "sms": { "template": "Your verification code is {{CODE}}" }
}
```

```javascript
const result = await sinch.verification.verifications.startSms({
  identity: { type: 'number', endpoint: '+12025550134' },
  method: 'sms',
});
```

### Report SMS Verification Code

```bash
curl -X PUT \
  'https://verification.api.sinch.com/verification/v1/verifications/number/+12025550134' \
  -H 'Content-Type: application/json' \
  -u {applicationKey}:{applicationSecret} \
  -d '{
    "method": "sms",
    "sms": { "code": "1234" }
  }'
```

```javascript
const result = await sinch.verification.verifications.reportSmsById('VERIFICATION_ID', {
  method: 'sms',
  sms: { code: '1234' },
});
```

### Report by Verification ID (alternative)

```bash
curl -X PUT \
  'https://verification.api.sinch.com/verification/v1/verifications/id/{verificationId}' \
  -H 'Content-Type: application/json' \
  -u {applicationKey}:{applicationSecret} \
  -d '{
    "method": "sms",
    "sms": { "code": "1234" }
  }'
```

### Start Flashcall Verification

```bash
curl -X POST https://verification.api.sinch.com/verification/v1/verifications \
  -H 'Content-Type: application/json' \
  -u {applicationKey}:{applicationSecret} \
  -d '{
    "identity": { "type": "number", "endpoint": "+12025550134" },
    "method": "flashcall"
  }'
```

```javascript
const result = await sinch.verification.verifications.startFlashcall({
  identity: { type: 'number', endpoint: '+12025550134' },
  method: 'flashcall',
});
```

### Start Phone Call (Callout) Verification

```bash
curl -X POST https://verification.api.sinch.com/verification/v1/verifications \
  -H 'Content-Type: application/json' \
  -u {applicationKey}:{applicationSecret} \
  -d '{
    "identity": { "type": "number", "endpoint": "+12025550134" },
    "method": "callout"
  }'
```

```javascript
const result = await sinch.verification.verifications.startCallout({
  identity: { type: 'number', endpoint: '+12025550134' },
  method: 'callout',
});
```

### Get Verification Status

```bash
curl -X GET \
  'https://verification.api.sinch.com/verification/v1/verifications/id/{verificationId}' \
  -u {applicationKey}:{applicationSecret}
```

```bash
# Or by number:
curl -X GET \
  'https://verification.api.sinch.com/verification/v1/verifications/number/+12025550134' \
  -u {applicationKey}:{applicationSecret}
```

## Gotchas and Best Practices

1. **Authentication is different from other Sinch APIs.** Verification uses Application Key + Secret, not project-level OAuth2. Do not mix these up.
2. **Use Application Signed Requests in production.** Basic auth is heavily rate-limited for verification endpoints. The limits can change without warning.
3. **Base64-decode the secret before signing.** The Application Secret in the dashboard is base64-encoded. Decode it before using it as the HMAC key.
4. **Flashcall is Android only.** It requires the app to read the incoming caller ID, which is only reliably possible on Android.
5. **Method availability varies by country.** Not all methods work in all regions. SMS is the most widely available. Flashcall coverage is limited.
6. **Verification codes expire.** Codes have a limited validity window. If the user takes too long, you must start a new verification.
7. **Report by ID or by number.** You can report using the verification ID or the phone number. Using the ID is more precise.
8. **Callback signing.** All Sinch-initiated callbacks are signed. Verify the signature in production to prevent spoofed callbacks.
9. **Rate limiting.** Avoid starting multiple verifications for the same number in quick succession. Implement backoff in your client.
10. **Seamless/Data verification has limited support.** It works only on specific mobile carriers and requires the device to be on mobile data (not Wi-Fi).

## Links

- [Verification API Reference](https://developers.sinch.com/docs/verification/api-reference/verification)
- [Getting Started Guide](https://developers.sinch.com/docs/verification/getting-started)
- [Authentication Guide](https://developers.sinch.com/docs/verification/api-reference/authentication)
- [Application Signed Requests](https://developers.sinch.com/docs/verification/api-reference/authentication/application-signed-request)
- [Callback Signing](https://developers.sinch.com/docs/verification/api-reference/authentication/callback-signed-request)
- [Node.js SDK Reference](https://developers.sinch.com/docs/verification/sdk/node/syntax-reference)
- [Java SDK Reference](https://developers.sinch.com/docs/verification/sdk/java/syntax-reference/)
- [.NET SDK Reference](https://developers.sinch.com/docs/verification/sdk/dotnet/syntax-reference/)
- [@sinch/verification on npm](https://www.npmjs.com/package/@sinch/verification)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
