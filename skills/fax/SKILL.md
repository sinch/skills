---
name: sinch-fax
description: Send and receive faxes programmatically with Sinch Fax API. Use when building fax workflows, fax-to-email, or integrating fax into applications.
---

# Sinch Fax API

## Overview

The Sinch Fax API lets you send and receive faxes programmatically. It supports multiple file formats, webhooks for incoming faxes, fax-to-email delivery, and automatic retries. It is used for healthcare, legal, financial, and government applications where fax remains a required communication channel.

**Base URL:** `https://fax.api.sinch.com`

**API Version:** v3

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
curl -X POST https://fax.api.sinch.com/v3/projects/{projectId}/faxes \
  -H 'Authorization: Bearer YOUR_access_token' \
  -H 'Content-Type: application/json' \
  -d '{ "to": "+12025550134", "contentUrl": "https://example.com/doc.pdf" }'
```

**Basic Auth (testing only):**

```bash
curl -u YOUR_key_id:YOUR_key_secret \
  https://fax.api.sinch.com/v3/projects/{projectId}/faxes
```

### SDK Setup

**Node.js:**

```bash
npm install @sinch/sdk-core
# or standalone:
npm install @sinch/fax
```

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_project_id',
  keyId: 'YOUR_key_id',
  keySecret: 'YOUR_key_secret',
});

const faxService = sinch.fax;
```

**Standalone @sinch/fax:**

```javascript
import { FaxService } from '@sinch/fax';

const faxService = new FaxService({
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

### First API Call -- Send a Fax

```bash
curl -X POST \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes' \
  -H 'Content-Type: application/json' \
  -u YOUR_key_id:YOUR_key_secret \
  -d '{
    "to": "+12025550134",
    "contentUrl": "https://example.com/document.pdf",
    "callbackUrl": "https://yourserver.com/fax-callback"
  }'
```

**Node.js SDK:**

```javascript
const response = await sinch.fax.faxes.send({
  sendFaxRequestBody: {
    to: '+12025550134',
    contentUrl: 'https://example.com/document.pdf',
    callbackUrl: 'https://yourserver.com/fax-callback',
  },
});
console.log(response.id); // Fax ID
```

**Test fax number:** Send to `+19898989898` to emulate a real fax without charges.

## Key Concepts

- **Fax Services**: Logical containers for fax configuration. Associate numbers, set defaults, and manage routing.
- **Fax Numbers**: Phone numbers provisioned for fax. Must be configured in your Sinch dashboard for fax capability.
- **Faxes**: Individual fax transmissions (inbound or outbound). Each has a unique ID, status, and metadata.
- **Content Types**: Supported file formats -- PDF, DOC, DOCX, TIF/TIFF, JPG, PNG, TXT, HTML, and URLs.
- **Content URL**: A publicly accessible URL from which Sinch fetches the document to fax.
- **Fax-to-Email**: Incoming faxes can be automatically forwarded to email addresses.
- **Webhooks/Callbacks**: HTTP callbacks notify your server of fax events (sent, received, failed).
- **Retries**: Failed faxes are automatically retried. Default: 3 retries. Maximum: 5.
- **Retention**: Sinch retains fax logs and media for 13 months.

## Common Patterns

### Send a Fax via Content URL

```bash
curl -X POST \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "to": "+12025550134",
    "contentUrl": "https://example.com/invoice.pdf",
    "callbackUrl": "https://yourserver.com/fax-status"
  }'
```

```javascript
const result = await sinch.fax.faxes.send({
  sendFaxRequestBody: {
    to: '+12025550134',
    contentUrl: 'https://example.com/invoice.pdf',
    callbackUrl: 'https://yourserver.com/fax-status',
  },
});
```

### Send a Fax with File Upload (multipart)

```bash
curl -X POST \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes' \
  -u {keyId}:{keySecret} \
  -F 'to=+12025550134' \
  -F 'file=@/path/to/document.pdf;type=application/pdf' \
  -F 'callbackUrl=https://yourserver.com/fax-status'
```

### Send a Fax with Base64 Content

```bash
curl -X POST \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "to": "+12025550134",
    "contentBase64": "JVBERi0xLjQK...",
    "contentType": "application/pdf",
    "callbackUrl": "https://yourserver.com/fax-status"
  }'
```

### Send Fax to Multiple Recipients

```bash
curl -X POST \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "to": ["+12025550134", "+12025550135"],
    "contentUrl": "https://example.com/report.pdf"
  }'
```

```javascript
const result = await sinch.fax.faxes.send({
  sendFaxRequestBody: {
    to: ['+12025550134', '+12025550135'],
    contentUrl: 'https://example.com/report.pdf',
  },
});
```

### List Sent Faxes

```bash
curl -X GET \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes' \
  -u {keyId}:{keySecret}
```

```javascript
const faxes = await sinch.fax.faxes.list();
faxes.result.forEach((fax) => {
  console.log(`${fax.id}: ${fax.status} - ${fax.to}`);
});
```

### Get Fax Details

```bash
curl -X GET \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes/{faxId}' \
  -u {keyId}:{keySecret}
```

```javascript
const fax = await sinch.fax.faxes.get('FAX_ID');
console.log(fax.status, fax.numberOfPages);
```

### Download Fax Content

```bash
curl -X GET \
  'https://fax.api.sinch.com/v3/projects/{projectId}/faxes/{faxId}/file' \
  -u {keyId}:{keySecret} \
  -o received_fax.pdf
```

### Handle Incoming Fax (Webhook)

Set up a webhook endpoint to receive incoming fax notifications:

```javascript
// Express.js webhook handler
app.post('/fax-webhook', (req, res) => {
  const event = req.body;

  if (event.event === 'INCOMING_FAX') {
    console.log('Incoming fax from:', event.from);
    console.log('Fax ID:', event.faxId);
    console.log('Pages:', event.numberOfPages);
    // Download the fax content via the API
  }

  res.status(200).send('OK');
});
```

### Configure Fax-to-Email

```bash
curl -X POST \
  'https://fax.api.sinch.com/v3/projects/{projectId}/services/{serviceId}/emails' \
  -H 'Content-Type: application/json' \
  -u {keyId}:{keySecret} \
  -d '{
    "email": "faxes@yourcompany.com",
    "phoneNumber": "+12025550134"
  }'
```

### List Fax-to-Email Configurations

```bash
curl -X GET \
  'https://fax.api.sinch.com/v3/projects/{projectId}/services/{serviceId}/emails' \
  -u {keyId}:{keySecret}
```

### Manage Fax Services

```bash
# List services
curl -X GET \
  'https://fax.api.sinch.com/v3/projects/{projectId}/services' \
  -u {keyId}:{keySecret}

# Get a specific service
curl -X GET \
  'https://fax.api.sinch.com/v3/projects/{projectId}/services/{serviceId}' \
  -u {keyId}:{keySecret}
```

## Gotchas and Best Practices

1. **Supported file formats.** PDF, DOC, DOCX, TIF, TIFF, JPG, PNG, TXT, and HTML. PDF is the most reliable. Complex formatting in DOC/DOCX may not render perfectly.
2. **Content URL must be publicly accessible.** If using `contentUrl`, the URL must be reachable by Sinch servers. Authenticated or private URLs will fail.
3. **Test with +19898989898.** Send to this number to simulate a fax without charges. Useful for integration testing.
4. **Fax number provisioning.** You must provision and configure numbers for fax capability in the Sinch dashboard before sending or receiving.
5. **Retries are automatic.** Default is 3 retries, maximum 5. Fax delivery depends on the receiving machine answering.
6. **International fax considerations.** International fax delivery has varying success rates. Some countries have specific dialing requirements.
7. **Use callbacks for status tracking.** Fax delivery is asynchronous. Set a `callbackUrl` to receive delivery status updates rather than polling.
8. **13-month retention.** Fax logs and media are retained for 13 months. Download and archive content if you need longer retention.
9. **Multipart vs JSON.** Use `multipart/form-data` for file uploads. Use `application/json` with `contentUrl` or `contentBase64` for URL-based or base64-encoded content.
10. **Regional routing.** Sinch has a global server that routes calls to the appropriate region automatically, but you can specify a region by prefixing the base URL with a region code.
11. **All timestamps are UTC.** Date and time fields in API responses are in UTC unless otherwise specified.
12. **Node.js SDK is preview.** The `@sinch/fax` package is currently in preview. It works but is not yet recommended for production.

## Links

- [Fax API Reference](https://developers.sinch.com/docs/fax/api-reference/fax.md)
- [Getting Started Guide](https://developers.sinch.com/docs/fax/getting-started.md)
- [Send a Fax with Node.js](https://developers.sinch.com/docs/fax/getting-started/node/send-fax.md)
- [Receive a Fax with Node.js](https://developers.sinch.com/docs/fax/getting-started/node/receive-fax.md)
- [Faxes Endpoint Reference](https://developers.sinch.com/docs/fax/api-reference/fax/faxes.md)
- [Services Endpoint Reference](https://developers.sinch.com/docs/fax/api-reference/fax/services.md)
- [Fax-to-Email Reference](https://developers.sinch.com/docs/fax/api-reference/fax/fax-to-email.md)
- [@sinch/fax on npm](https://www.npmjs.com/package/@sinch/fax)
- [Sinch Fax Product Page](https://sinch.com/apis/fax-api/)
- [Fax API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/fax/api-reference/fax.yaml?download)
- [Fax API Reference (Markdown)](https://developers.sinch.com/docs/fax/api-reference/fax.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
