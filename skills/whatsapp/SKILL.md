---
name: sinch-whatsapp
description: Send WhatsApp Business messages via Sinch Conversation API. Covers templates, 24-hour session window, media messages, and Meta approval flows.
---

# Sinch WhatsApp Channel (Conversation API)

## Overview

WhatsApp Business messaging is available through the Sinch Conversation API. You can send text, media, template, and interactive messages to WhatsApp users using the same unified API format as other channels. WhatsApp has strict rules around messaging windows and template approval that differ from SMS.

## Getting Started

### Prerequisites

1. A Sinch account with Conversation API access.
2. A provisioned WhatsApp Business sender (set up via Sinch Build Dashboard or Provisioning API).
3. Meta-approved WhatsApp templates for outbound messaging outside the 24-hour window.
4. A Conversation API app in the correct region.

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

**OAuth 2.0 (production):**

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_KEY_ID:YOUR_KEY_SECRET
```

Use returned `access_token` as `Authorization: Bearer <token>`.

### Base URL

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

### First API Call — Send a WhatsApp Text Message

Requires an open 24-hour session window (user must have messaged you first).

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
          "channel": "WHATSAPP",
          "identity": "+15551234567"
        }]
      }
    },
    "message": {
      "text_message": {
        "text": "Thanks for reaching out! How can we help?"
      }
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
          channel: 'WHATSAPP',
          identity: '+15551234567',
        }],
      },
    },
    message: {
      text_message: {
        text: 'Thanks for reaching out! How can we help?',
      },
    },
  },
});
```

## Key Concepts

### 24-Hour Customer Service Window

- A user sending a message to your business opens a 24-hour session window.
- Each new user message resets the 24-hour timer.
- Within the window, you can send freeform messages (text, media, interactive).
- Outside the window, you must use an approved template message.
- You can never send a freeform message outside the window, even with opt-in.

### Template Messages (HSM)

Templates are pre-approved message formats registered with Meta. Required for:
- First outbound contact (no open window)
- Re-engaging users after the 24-hour window closes
- Marketing, utility, and authentication use cases

**Sending a template message:**

```bash
curl -X POST "https://us.conversation.api.sinch.com/v1/projects/$PROJECT_ID/messages:send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "app_id": "YOUR_APP_ID",
    "recipient": {
      "identified_by": {
        "channel_identities": [{
          "channel": "WHATSAPP",
          "identity": "+15551234567"
        }]
      }
    },
    "message": {
      "template_message": {
        "channel_template": {
          "WHATSAPP": {
            "template_id": "your_template_name",
            "language_code": "en",
            "body": {
              "parameters": [
                { "default": "John" },
                { "default": "12345" }
              ]
            }
          }
        }
      }
    }
  }'
```

Note: `template_id` corresponds to the template **name**, not the numeric identifier.

### Template Approval Process

1. Create templates via the Sinch Build Dashboard or Provisioning API.
2. Templates are submitted to Meta for review.
3. Meta approves or rejects (typically within 24 hours, can take longer).
4. Only approved templates can be used for messaging.
5. Templates have categories: MARKETING, UTILITY, AUTHENTICATION.

### Opt-In Requirements

- All marketing, utility, and authentication conversations require user opt-in.
- Opt-in can be collected via any channel (SMS, web form, email, in-app).
- Permanent opt-in allows sending templates outside the 24-hour window.
- Opt-in does NOT allow freeform messages outside the window.

### Message Types Supported

| Type | Inside Window | Outside Window |
|------|--------------|----------------|
| Text | Yes | No (template only) |
| Media (image, video, document, audio) | Yes | Via template |
| Interactive (buttons, lists) | Yes | Via template |
| Location | Yes | No |
| Sticker | Yes | No |
| Template | Yes | Yes |

### Media Specifications

| Media Type | Formats | Max Size |
|------------|---------|----------|
| Image | JPEG, PNG | 5 MB |
| Video | MP4 (H.264 + AAC) | 16 MB |
| Audio | AAC, MP4, AMR, MPEG, OGG (opus) | 16 MB |
| Document | Any valid MIME type | 100 MB |
| Sticker | WebP | 100 KB |

## Common Patterns

### Send a Media Message (Inside Window)

```json
{
  "app_id": "YOUR_APP_ID",
  "recipient": {
    "identified_by": {
      "channel_identities": [{
        "channel": "WHATSAPP",
        "identity": "+15551234567"
      }]
    }
  },
  "message": {
    "media_message": {
      "url": "https://example.com/receipt.pdf"
    }
  }
}
```

### WhatsApp with SMS Fallback

```json
{
  "app_id": "YOUR_APP_ID",
  "channel_priority_order": ["WHATSAPP", "SMS"],
  "recipient": {
    "identified_by": {
      "channel_identities": [
        { "channel": "WHATSAPP", "identity": "+15551234567" },
        { "channel": "SMS", "identity": "+15551234567" }
      ]
    }
  },
  "message": {
    "text_message": {
      "text": "Your appointment is confirmed for tomorrow at 2 PM."
    }
  },
  "channel_properties": {
    "SMS_SENDER": "+15559876543"
  }
}
```

### Handle Inbound WhatsApp Message (Webhook)

```json
{
  "app_id": "YOUR_APP_ID",
  "message": {
    "contact_message": {
      "text_message": {
        "text": "Hi, I need help with my order"
      }
    }
  },
  "channel_identity": {
    "channel": "WHATSAPP",
    "identity": "+15551234567"
  }
}
```

## Gotchas and Best Practices

1. **Session window is strict.** Sending a freeform message outside the 24-hour window returns an error. Always check window status or use templates for outbound-initiated conversations.

2. **Template name vs ID.** The `template_id` field in the API expects the template **name** (e.g., `order_confirmation`), not the numeric ID from Meta.

3. **Template rejection.** Meta may reject templates for vague content, promotional language in utility templates, or policy violations. Allow time for re-submission.

4. **Per-message pricing model.** WhatsApp uses per-message pricing. Marketing and authentication templates are charged on delivery. Utility templates are free within a session window.

5. **Rate limits.** WhatsApp enforces its own rate limits based on your business quality rating and tier. New numbers start at a low tier (1K messages/day) and scale up with good quality.

6. **Quality rating matters.** Users can report or block your business. Too many reports lower your quality rating, reducing sending limits. Monitor quality in Meta Business Manager.

7. **Opt-in is mandatory.** Sending without proper opt-in risks account suspension. Document your opt-in collection method.

8. **Media URLs must be publicly accessible.** WhatsApp fetches media from the URL you provide. URLs behind authentication or firewalls will fail.

9. **Region matching.** Your Conversation API app must be in the same region as your WhatsApp sender configuration.

10. **Template parameters are positional.** Parameters in templates are indexed by position, not name. Ensure the order matches the template definition.

## Links

- [WhatsApp Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/whatsapp)
- [WhatsApp Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/set-up)
- [WhatsApp Template Support](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/template-support)
- [WhatsApp Message Support](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/message-support/)
- [Provisioning API — WhatsApp Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-templates)
- [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
