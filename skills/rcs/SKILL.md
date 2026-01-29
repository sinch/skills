---
name: sinch-rcs
description: Send Rich Communication Services (RCS) messages via Sinch Conversation API. Rich cards, carousels, suggested actions, and SMS fallback.
---

# Sinch RCS Channel (Conversation API)

## Overview

RCS (Rich Communication Services) is a next-generation messaging channel available through the Sinch Conversation API. RCS enables rich, branded messaging experiences in the native device messaging app -- including rich cards, carousels, suggested actions, read receipts, and typing indicators. When a recipient's device does not support RCS, you can configure automatic fallback to SMS.

## Getting Started

### Prerequisites

1. A Sinch account with Conversation API access.
2. A provisioned RCS Sender Agent (request via Sinch -- requires carrier approval).
3. A Conversation API app created in the same region as your RCS Agent.
4. At least one webhook configured for delivery reports and inbound messages.

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

### First API Call — Send an RCS Text Message

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
          "channel": "RCS",
          "identity": "+15551234567"
        }]
      }
    },
    "message": {
      "text_message": {
        "text": "Welcome to our service! How can we help you today?"
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
          channel: 'RCS',
          identity: '+15551234567',
        }],
      },
    },
    message: {
      text_message: {
        text: 'Welcome to our service! How can we help you today?',
      },
    },
  },
});
```

## Key Concepts

### RCS Agents

An RCS Agent is your business identity on RCS. It includes your brand name, logo, description, and verification status. Agents must be approved by carriers before use. Provisioning is handled through Sinch.

### Rich Cards

Rich cards combine media, text, and interactive elements in a single message:
- Must include an image or video
- Optional: title, description, up to 4 suggested replies/actions

**Media specifications:**
- Image: aspect ratio 4:3, optimal 960x720 px, max 1 MB
- Video: aspect ratio 4:3, max 5 MB
- Thumbnail: 605x452 px, recommended max 100 KB

```json
{
  "message": {
    "card_message": {
      "title": "Summer Sale",
      "description": "50% off all items this weekend!",
      "media_message": {
        "url": "https://example.com/sale-banner.jpg"
      },
      "choices": [
        {
          "text_message": { "text": "Shop Now" },
          "postback_data": "shop_summer_sale"
        },
        {
          "text_message": { "text": "Learn More" },
          "postback_data": "learn_more_sale"
        }
      ]
    }
  }
}
```

### Carousels

Carousels display 2-10 swipeable cards in a single message. Each card follows the rich card format.

- 1 card renders as a standalone card message.
- 2-10 cards render as a carousel.
- Up to 3 outer choices (rendered below the carousel).
- Card height is uniform; content may be truncated if it exceeds the height.

```json
{
  "message": {
    "carousel_message": {
      "cards": [
        {
          "title": "Product A",
          "description": "$29.99",
          "media_message": {
            "url": "https://example.com/product-a.jpg"
          },
          "choices": [{
            "text_message": { "text": "Buy" },
            "postback_data": "buy_product_a"
          }]
        },
        {
          "title": "Product B",
          "description": "$39.99",
          "media_message": {
            "url": "https://example.com/product-b.jpg"
          },
          "choices": [{
            "text_message": { "text": "Buy" },
            "postback_data": "buy_product_b"
          }]
        }
      ],
      "choices": [{
        "text_message": { "text": "View All Products" },
        "postback_data": "view_all"
      }]
    }
  }
}
```

### Suggested Actions and Replies

RCS supports interactive suggestions that appear as chips below the message:

- **Suggested replies** — predefined text responses (max 25 characters). Easier to process than freeform text.
- **Suggested actions** — trigger native device features:
  - Open URL
  - Dial phone number
  - Show location on map
  - Share location
  - Create calendar event

**Limits:**
- Standalone message: max 11 suggestion chips
- Rich card / carousel card: max 4 suggestion chips

```json
{
  "message": {
    "choice_message": {
      "text_message": {
        "text": "How would you like to proceed?"
      },
      "choices": [
        {
          "text_message": { "text": "Call Us" },
          "postback_data": "call"
        },
        {
          "text_message": { "text": "Visit Website" },
          "postback_data": "website"
        },
        {
          "text_message": { "text": "Get Directions" },
          "postback_data": "directions"
        }
      ]
    }
  }
}
```

### Channel Fallback (RCS to SMS)

Configure `channel_priority_order` to fall back to SMS when RCS is unavailable:

```json
{
  "app_id": "YOUR_APP_ID",
  "channel_priority_order": ["RCS", "SMS"],
  "recipient": {
    "identified_by": {
      "channel_identities": [
        { "channel": "RCS", "identity": "+15551234567" },
        { "channel": "SMS", "identity": "+15551234567" }
      ]
    }
  },
  "message": {
    "text_message": {
      "text": "Your order #12345 has shipped!"
    }
  },
  "channel_properties": {
    "SMS_SENDER": "+15559876543"
  }
}
```

When fallback occurs, you receive a delivery report with `SWITCH_ON_CHANNEL` status.

## Common Patterns

### Send a Rich Card (Node.js)

```javascript
const response = await sinch.conversation.messages.send({
  sendMessageRequestBody: {
    app_id: 'YOUR_APP_ID',
    recipient: {
      identified_by: {
        channel_identities: [{
          channel: 'RCS',
          identity: '+15551234567',
        }],
      },
    },
    message: {
      card_message: {
        title: 'Order Confirmed',
        description: 'Your order #12345 will arrive by Friday.',
        media_message: {
          url: 'https://example.com/order-confirmation.jpg',
        },
        choices: [
          {
            text_message: { text: 'Track Order' },
            postback_data: 'track_12345',
          },
        ],
      },
    },
  },
});
```

### Delivery Report-Based Fallback

Enable in your Conversation API app settings. When no positive delivery report (DELIVERED or READ) is received for RCS, the API automatically attempts the next channel in priority order.

## Gotchas and Best Practices

1. **Carrier and device support varies.** RCS is not universally available. Coverage depends on the carrier, device, and OS. Always configure SMS fallback for critical messages.

2. **Agent provisioning takes time.** RCS Agent approval involves carrier review. Plan for days or weeks, not hours.

3. **Region must match.** Your Conversation API app must be in the same region as your RCS Agent. Mismatched regions cause errors and missing delivery receipts.

4. **Media dimensions matter.** Rich card media must fit predefined heights. Mismatched aspect ratios cause cropping. Use 4:3 (960x720) for best results.

5. **Carousel truncation.** Cards in a carousel share a uniform height. Long descriptions or titles may be truncated. Keep content concise.

6. **Fallback billing.** Both the RCS attempt and SMS fallback may be billed. Factor this into cost planning.

7. **Suggested reply length.** Max 25 characters per suggested reply. Longer text is truncated on the device.

8. **No template system.** Unlike WhatsApp, RCS does not require pre-approved templates. You can send any content at any time (within carrier guidelines).

9. **Read receipts are native.** RCS provides read receipts automatically. Use them to track engagement without additional infrastructure.

10. **Rich messages degrade on non-RCS.** If you send a carousel to SMS fallback, the Conversation API transcodes it to plain text. Test what the fallback looks like.

## Links

- [RCS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/rcs.md)
- [RCS Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/rcs/set-up.md)
- [RCS Message Support](https://developers.sinch.com/docs/conversation/channel-support/rcs/message-support.md)
- [RCS Senders (Provisioning API)](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/rcs-senders.md)
- [Conversation API Fallback](https://developers.sinch.com/docs/conversation/overview.md)
- [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
