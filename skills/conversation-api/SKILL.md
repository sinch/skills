---
name: sinch-conversation-api
description: Build omnichannel messaging with Sinch Conversation API. One unified API to send and receive messages on SMS, WhatsApp, RCS, MMS, Viber, Messenger, and more.
---

# Sinch Conversation API

## Overview

The Sinch Conversation API is an omnichannel messaging platform that provides a single, unified API to send and receive messages across SMS, WhatsApp, RCS, MMS, Viber Business, Facebook Messenger, Instagram, Telegram, KakaoTalk, LINE, WeChat, and more.

Key value: write one API call, reach customers on any channel. The API handles transcoding between a generic message format and channel-specific formats automatically.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

The API supports two auth methods:

**OAuth 2.0 (recommended for production):**

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_KEY_ID:YOUR_KEY_SECRET
```

Response returns `access_token` (valid ~1 hour). Use as `Authorization: Bearer <access_token>`.

**Basic Auth (testing only — heavily rate limited):**

```bash
-u YOUR_KEY_ID:YOUR_KEY_SECRET
```

You need three credentials from the Sinch Build Dashboard:
- **Project ID** — found on the Project Settings page
- **Key ID** — generated when creating an access key
- **Key Secret** — shown once during access key creation (save it immediately)

### Base URL

The API is regional. Use the region matching your Conversation API app:

| Region | Base URL |
|--------|----------|
| US | `https://us.conversation.api.sinch.com` |
| EU | `https://eu.conversation.api.sinch.com` |
| BR | `https://br.conversation.api.sinch.com` |

### SDK Installation

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` + `@sinch/conversation` | `npm install @sinch/sdk-core` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First API Call — Send a Text Message

**curl:**

```bash
curl -X POST "https://us.conversation.api.sinch.com/v1/projects/$PROJECT_ID/messages:send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "app_id": "YOUR_APP_ID",
    "recipient": {
      "identified_by": {
        "channel_identities": [{
          "channel": "SMS",
          "identity": "+15551234567"
        }]
      }
    },
    "message": {
      "text_message": {
        "text": "Hello from Sinch Conversation API!"
      }
    },
    "channel_properties": {
      "SMS_SENDER": "+15559876543"
    }
  }'
```

**Node.js SDK:**

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
});

const response = await sinch.conversation.messages.send({
  sendMessageRequestBody: {
    app_id: 'YOUR_APP_ID',
    recipient: {
      identified_by: {
        channel_identities: [{
          channel: 'SMS',
          identity: '+15551234567',
        }],
      },
    },
    message: {
      text_message: {
        text: 'Hello from Sinch Conversation API!',
      },
    },
    channel_properties: {
      SMS_SENDER: '+15559876543',
    },
  },
});
```

## Key Concepts

### Apps
A Conversation API app is the top-level container. Each app can have multiple channel integrations (SMS, WhatsApp, RCS, etc.). Created via the Sinch Build Dashboard or API.

### Contacts
A contact represents an end-user. Each contact can have multiple channel identities (phone number for SMS, WhatsApp number, etc.). Contacts are scoped to a project.

### Conversations
A conversation is a thread between your app and a contact. Conversations track message history and state across channels.

### Messages
Messages use a generic format that the API transcodes per channel:
- **Text message** — plain text
- **Media message** — image, video, audio, document
- **Card message** — rich card with media, title, description, and buttons
- **Carousel message** — multiple cards in a swipeable layout
- **Choice message** — buttons/quick replies
- **Template message** — pre-approved templates (required for WhatsApp outside 24h window)
- **Location message** — geographic coordinates

### Channels
Supported channels: `SMS`, `WHATSAPP`, `RCS`, `MMS`, `VIBER`, `MESSENGER`, `INSTAGRAM`, `TELEGRAM`, `KAKAOTALK`, `LINE`, `WECHAT`.

### Webhooks
Webhooks deliver callbacks to your server for:
- **Message delivery reports** — status updates (QUEUED, DELIVERED, READ, FAILED)
- **Inbound messages** — messages from contacts
- **Events** — typing indicators, contact events, conversation events

### Channel Priority and Fallback
Set `channel_priority_order` to attempt channels in order. If delivery fails on one channel, the API falls back to the next. You receive a `SWITCH_ON_CHANNEL` delivery report when fallback occurs.

```json
{
  "channel_priority_order": ["RCS", "WHATSAPP", "SMS"],
  "recipient": {
    "identified_by": {
      "channel_identities": [
        { "channel": "RCS", "identity": "+15551234567" },
        { "channel": "WHATSAPP", "identity": "+15551234567" },
        { "channel": "SMS", "identity": "+15551234567" }
      ]
    }
  }
}
```

## Common Patterns

### Identify Recipient by Contact ID

```json
{
  "recipient": {
    "contact_id": "CONTACT_ID"
  }
}
```

### Send a Media Message

```json
{
  "message": {
    "media_message": {
      "url": "https://example.com/image.jpg"
    }
  }
}
```

### Send a Card Message

```json
{
  "message": {
    "card_message": {
      "title": "Welcome!",
      "description": "Check out our latest offer.",
      "media_message": {
        "url": "https://example.com/promo.jpg"
      },
      "choices": [
        {
          "text_message": { "text": "Learn More" },
          "postback_data": "learn_more"
        }
      ]
    }
  }
}
```

### Register a Webhook

```bash
curl -X POST "https://us.conversation.api.sinch.com/v1/projects/$PROJECT_ID/webhooks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "app_id": "YOUR_APP_ID",
    "target": "https://your-server.com/webhook",
    "target_type": "HTTP",
    "triggers": [
      "MESSAGE_DELIVERY",
      "MESSAGE_INBOUND",
      "EVENT_INBOUND"
    ]
  }'
```

## Gotchas and Best Practices

1. **Region must match.** Your Conversation API app must be in the same region as your service plans and channel configurations. Mismatched regions cause silent failures.

2. **Rate limits.** Projects are limited to 800 requests/second across all apps and endpoints. Sustained overuse causes queue saturation.

3. **OAuth tokens expire in ~1 hour.** Cache and refresh tokens proactively. Never use Basic Auth in production.

4. **Channel transcoding is automatic but lossy.** Rich messages (cards, carousels) sent to channels that do not support them are transcoded to text. Test across target channels.

5. **Webhook reliability.** Implement idempotent webhook handlers. Sinch may retry failed deliveries.

6. **Fallback billing.** When fallback triggers, you may be billed for each channel attempted. Configure fallback deliberately.

7. **Do not hardcode credentials.** Load `projectId`, `keyId`, and `keySecret` from environment variables.

## Links

- [Getting Started](https://developers.sinch.com/docs/conversation/getting-started.md)
- [API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation.md)
- [Key Concepts](https://developers.sinch.com/docs/conversation/keyconcepts.md)
- [Message Types](https://developers.sinch.com/docs/conversation/message-types.md)
- [Channel Support](https://developers.sinch.com/docs/conversation/channel-support.md)
- [Callbacks](https://developers.sinch.com/docs/conversation/callbacks.md)
- [Node.js SDK (GitHub)](https://github.com/sinch/sinch-sdk-node)
- [Node.js SDK Reference](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Conversation API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/conversation/api-reference/conversation.yaml?download)
- [Conversation API Reference (Markdown)](https://developers.sinch.com/docs/conversation/api-reference/conversation.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
