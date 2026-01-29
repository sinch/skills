---
name: sinch-provisioning-api
description: Manage WhatsApp senders, RCS agents, templates, and webhooks programmatically with the Sinch Provisioning API for Conversation API channels.
---

# Sinch Provisioning API

## Overview

The Sinch Provisioning API lets you programmatically set up and manage senders, templates, and webhooks for messaging channels used with the Conversation API. Primary use cases include WhatsApp Business sender provisioning, WhatsApp template management, RCS sender management, and webhook configuration.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

The Provisioning API supports two auth methods:

**OAuth 2.0 (recommended for production):**

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_KEY_ID:YOUR_KEY_SECRET
```

Use returned `access_token` as `Authorization: Bearer <token>` (valid ~1 hour).

**Basic Auth (testing only — heavily rate limited):**

```bash
-u YOUR_KEY_ID:YOUR_KEY_SECRET
```

Credentials required:
- **Project ID** — from the Sinch Build Dashboard Project Settings page
- **Key ID** — generated during access key creation
- **Key Secret** — shown once at creation time (save immediately)

### Base URL

```
https://provisioning.api.sinch.com
```

The Provisioning API is not regionalized (unlike the Conversation API).

### SDK Installation

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First API Call — List WhatsApp Senders

**curl:**

```bash
curl -X GET "https://provisioning.api.sinch.com/v1/projects/$PROJECT_ID/senders" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Node.js SDK:**

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
});

// List all senders in the project
const senders = await sinch.provisioning.whatsappSenders.list({
  projectId: 'YOUR_PROJECT_ID',
});
console.log(senders);
```

## Key Concepts

### WhatsApp Senders

A WhatsApp Sender (also called a Business Profile or WhatsApp channel) represents your business identity on WhatsApp. You must provision a sender before sending WhatsApp messages via the Conversation API.

**Sender lifecycle:**
1. Create sender via Meta Embedded Sign-Up flow
2. Verify the sender phone number
3. Register the sender
4. Sender becomes ACTIVE and ready for messaging

**Key endpoints:**

| Operation | Method | Path |
|-----------|--------|------|
| List senders | GET | `/v1/projects/{projectId}/senders` |
| Create sender | POST | `/v1/projects/{projectId}/senders` |
| Get sender | GET | `/v1/projects/{projectId}/senders/{senderId}` |
| Update sender | PUT | `/v1/projects/{projectId}/senders/{senderId}` |
| Delete sender | DELETE | `/v1/projects/{projectId}/senders/{senderId}` |
| Register sender | POST | `/v1/projects/{projectId}/senders/{senderId}:register` |
| Verify sender | POST | `/v1/projects/{projectId}/senders/{senderId}:verify` |
| List activities | GET | `/v1/projects/{projectId}/senders/{senderId}/activities` |
| Add comment | POST | `/v1/projects/{projectId}/senders/{senderId}/comments` |

### WhatsApp Templates

Manage WhatsApp message templates that must be approved by Meta before use.

**Key endpoints:**

| Operation | Method | Path |
|-----------|--------|------|
| List templates | GET | `/v1/projects/{projectId}/senders/{senderId}/templates` |
| Create template | POST | `/v1/projects/{projectId}/senders/{senderId}/templates` |
| Get template | GET | `/v1/projects/{projectId}/senders/{senderId}/templates/{templateId}` |
| Delete template | DELETE | `/v1/projects/{projectId}/senders/{senderId}/templates/{templateId}` |

Template categories: `MARKETING`, `UTILITY`, `AUTHENTICATION`.

### RCS Senders

Manage RCS Agent identities for the RCS channel.

**Key endpoints:**

| Operation | Method | Path |
|-----------|--------|------|
| List RCS senders | GET | `/v1/projects/{projectId}/rcs/senders` |
| Get RCS sender | GET | `/v1/projects/{projectId}/rcs/senders/{senderId}` |

### Webhooks

Provisioning API webhooks notify your server about sender and template status changes.

**Key endpoints:**

| Operation | Method | Path |
|-----------|--------|------|
| List webhooks | GET | `/v1/projects/{projectId}/webhooks` |
| Create webhook | POST | `/v1/projects/{projectId}/webhooks` |
| Get webhook | GET | `/v1/projects/{projectId}/webhooks/{webhookId}` |
| Update webhook | PUT | `/v1/projects/{projectId}/webhooks/{webhookId}` |
| Patch webhook | PATCH | `/v1/projects/{projectId}/webhooks/{webhookId}` |
| Delete webhook | DELETE | `/v1/projects/{projectId}/webhooks/{webhookId}` |

### Webhook Triggers

**WhatsApp Sender triggers:**
- `WHATSAPP_SENDER_ACTIVE`
- `WHATSAPP_SENDER_INACTIVE`
- `WHATSAPP_SENDER_ERROR`
- `WHATSAPP_SENDER_PENDING_VERIFICATION`
- `WHATSAPP_SENDER_REJECTED`
- `WHATSAPP_SENDER_QUALITY_RATING_CHANGED`
- `WHATSAPP_SENDER_DAILY_LIMIT_CHANGED`
- `WHATSAPP_SENDER_COMMENT_ADDED`

**WhatsApp Template triggers:**
- `WHATSAPP_TEMPLATE_APPROVED`
- `WHATSAPP_TEMPLATE_REJECTED`
- `WHATSAPP_TEMPLATE_DELETED`
- `WHATSAPP_TEMPLATE_STATUS_UPDATED`
- `WHATSAPP_TEMPLATE_CATEGORY_UPDATED`
- `WHATSAPP_TEMPLATE_CATEGORY_FUTURE_UPDATE`
- `WHATSAPP_TEMPLATE_QUALITY_SCORE_UPDATED`
- `WHATSAPP_TEMPLATE_COMMENT_ADDED`

Use `ALL` to subscribe to every trigger type.

## Common Patterns

### Create a Provisioning Webhook

```bash
curl -X POST "https://provisioning.api.sinch.com/v1/projects/$PROJECT_ID/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "url": "https://your-server.com/provisioning-webhook",
    "triggers": ["WHATSAPP_TEMPLATE_APPROVED", "WHATSAPP_TEMPLATE_REJECTED"],
    "secret": "your_webhook_signing_secret"
  }'
```

### Create a WhatsApp Template

```bash
curl -X POST "https://provisioning.api.sinch.com/v1/projects/$PROJECT_ID/senders/$SENDER_ID/templates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "order_confirmation",
    "language": "en",
    "category": "UTILITY",
    "components": [
      {
        "type": "BODY",
        "text": "Hi {{1}}, your order {{2}} has been confirmed and will arrive by {{3}}."
      }
    ]
  }'
```

### Check Sender Status

```bash
curl -X GET "https://provisioning.api.sinch.com/v1/projects/$PROJECT_ID/senders/$SENDER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Verify Webhook Signatures

Provisioning API webhooks can be signed with a secret. Verify the HMAC signature on incoming webhook payloads to ensure authenticity.

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}
```

## Gotchas and Best Practices

1. **Pricing plan required for WhatsApp.** You must agree to the WhatsApp Pricing Plan in the Sinch Dashboard before using the Provisioning API for WhatsApp senders and templates.

2. **Template approval is asynchronous.** Templates are submitted to Meta for review. Approval typically takes hours but can take days. Use webhooks (`WHATSAPP_TEMPLATE_APPROVED` / `WHATSAPP_TEMPLATE_REJECTED`) to track status.

3. **Template names are immutable.** Once created, a template name cannot be changed. Choose descriptive, versioned names (e.g., `order_confirm_v2`).

4. **Sender verification is multi-step.** Creating a sender is not enough. You must also verify and register it before it becomes ACTIVE.

5. **Webhook triggers must be unique.** Each webhook requires a non-empty, unique list of triggers. Duplicate triggers across webhooks for the same project are not allowed.

6. **Use webhook secrets.** Always configure a signing secret for webhooks and verify HMAC signatures to prevent spoofed callbacks.

7. **Not regionalized.** Unlike the Conversation API, the Provisioning API uses a single global endpoint (`provisioning.api.sinch.com`). However, the senders and apps you provision are region-specific.

8. **RCS provisioning is limited.** RCS sender management via API is primarily read-only. Agent creation requires coordination with Sinch and carrier approval.

9. **OAuth tokens expire.** Access tokens last ~1 hour. Implement token refresh logic for long-running provisioning scripts.

10. **Rate limits apply.** Basic Auth is heavily rate limited. Always use OAuth 2.0 for automated provisioning workflows.

## Links

- [Provisioning API Introduction](https://developers.sinch.com/docs/provisioning-api/api-reference.md)
- [WhatsApp Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-senders.md)
- [WhatsApp Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-templates.md)
- [RCS Senders](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-senders.md)
- [Webhooks](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/webhooks.md)
- [Getting Started with WhatsApp Provisioning](https://developers.sinch.com/docs/provisioning-api/getting-started/whatsapp.md)
- [Provisioning API Reference](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api.md)
- [Release Notes](https://developers.sinch.com/docs/provisioning-api/release-notes.md)
- [Provisioning API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/provisioning/api-reference/provisioning.yaml?download)
- [Provisioning API Reference (Markdown)](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
