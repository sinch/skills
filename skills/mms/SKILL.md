---
name: sinch-mms
description: Send MMS media messages via Sinch Conversation API. Covers image, video, audio support, file size limits, and US/Canada/Australia availability.
---

# Sinch MMS Channel (Conversation API)

## Overview

MMS (Multimedia Messaging Service) is available as a channel through the Sinch Conversation API. MMS extends SMS with support for images, video, audio, and other media. MMS is currently available in the United States, Canada, and Australia only.

## Getting Started

### Prerequisites

1. A Sinch account with Conversation API access.
2. A service plan with an MMS-capable number (US/CA/AU long code or toll-free).
3. A Conversation API app created in the same region as your service plan.
4. Access key credentials (Key ID + Key Secret) and your Project ID.

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

### First API Call — Send an MMS Image

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
          "channel": "MMS",
          "identity": "+15551234567"
        }]
      }
    },
    "message": {
      "media_message": {
        "url": "https://example.com/product-photo.jpg"
      }
    },
    "channel_properties": {
      "MMS_SENDER": "+15559876543"
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
          channel: 'MMS',
          identity: '+15551234567',
        }],
      },
    },
    message: {
      media_message: {
        url: 'https://example.com/product-photo.jpg',
      },
    },
    channel_properties: {
      MMS_SENDER: '+15559876543',
    },
  },
});
```

## Key Concepts

### Supported Media Types

| Media Type | Common Formats | Notes |
|------------|---------------|-------|
| Image | JPEG, PNG, GIF, BMP | Most widely supported |
| Video | MP4, 3GPP | Quality may be reduced for delivery |
| Audio | MP3, WAV, AMR | Limited carrier support |
| vCard | VCF | Contact cards |
| Text | Plain text | Included as message body |

All media files must serve a valid `Content-Type` header. Files using `application/octet-stream` may be rejected.

### File Size Limits

Sinch recommends keeping media files **under 1 MB** for reliable delivery. Carrier-specific limits vary:

| Number Type | Typical Max Size | Notes |
|-------------|-----------------|-------|
| Long code | ~1 MB | Varies by carrier |
| Toll-free | ~1 MB | Varies by carrier |
| Short code | Varies by operator | Transcoding not supported |
| 10DLC | Varies by operator | Transcoding not supported |

- The Conversation API accepts files up to 100 MB, but carriers impose lower limits.
- Base64 encoding increases file size by ~37%. Factor this into size calculations.
- If a video exceeds carrier limits, quality is reduced automatically. If it still does not fit, it falls back to SMS.

### Card Messages via MMS

MMS natively supports card messages:
- The card `title` becomes the MMS Subject line (max 80 characters, 40 recommended).
- The title is not duplicated in the message body.
- Media in card messages is optional.

```json
{
  "message": {
    "card_message": {
      "title": "Your Order Has Shipped",
      "description": "Track your delivery at the link below.",
      "media_message": {
        "url": "https://example.com/shipping-confirmation.jpg"
      }
    }
  }
}
```

### Unsupported Message Types (Transcoded to Text)

The following Conversation API message types are not natively supported on MMS and are transcoded to plain text:
- **Choice messages** (buttons/quick replies)
- **Carousel messages**
- **Location messages**

### MMS Channel Properties

| Property | Description |
|----------|-------------|
| `MMS_SENDER` | The sender phone number for the MMS message |

## Common Patterns

### Send Image with Text Description

Use a card message to combine an image with text content:

```json
{
  "app_id": "YOUR_APP_ID",
  "recipient": {
    "identified_by": {
      "channel_identities": [{
        "channel": "MMS",
        "identity": "+15551234567"
      }]
    }
  },
  "message": {
    "card_message": {
      "title": "Flash Sale!",
      "description": "50% off everything today only. Visit example.com/sale",
      "media_message": {
        "url": "https://example.com/sale-banner.jpg"
      }
    }
  },
  "channel_properties": {
    "MMS_SENDER": "+15559876543"
  }
}
```

### MMS with SMS Fallback

```json
{
  "app_id": "YOUR_APP_ID",
  "channel_priority_order": ["MMS", "SMS"],
  "recipient": {
    "identified_by": {
      "channel_identities": [
        { "channel": "MMS", "identity": "+15551234567" },
        { "channel": "SMS", "identity": "+15551234567" }
      ]
    }
  },
  "message": {
    "media_message": {
      "url": "https://example.com/coupon.jpg"
    }
  },
  "channel_properties": {
    "MMS_SENDER": "+15559876543",
    "SMS_SENDER": "+15559876543"
  }
}
```

### Send Video Message

```json
{
  "message": {
    "media_message": {
      "url": "https://example.com/product-demo.mp4"
    }
  }
}
```

Keep video under 1 MB for best deliverability. The API may compress video to fit carrier limits.

## Gotchas and Best Practices

1. **US, Canada, and Australia only.** MMS is not available in other countries. Use WhatsApp or RCS for international media messaging.

2. **Keep files under 1 MB.** While the API accepts up to 100 MB, carrier limits are typically ~1 MB. Oversized media is compressed or rejected.

3. **Base64 overhead.** Binary content encoded with Base64 produces files ~37% larger. A 750 KB image becomes ~1 MB after encoding, potentially exceeding carrier limits.

4. **Content-Type headers required.** Media URLs must return a valid `Content-Type` header (e.g., `image/jpeg`, `video/mp4`). Generic `application/octet-stream` headers may cause rejection.

5. **Media URLs must be publicly accessible.** MMS carriers fetch media from the URL you provide. URLs behind authentication or corporate firewalls will fail.

6. **Short code MMS limitations.** Transcoding is not supported on US Short Codes. Size limits vary by operator and change without notice.

7. **10DLC MMS limitations.** Transcoding is not supported on 10DLC numbers. Carrier-specific size limits apply.

8. **Video quality reduction.** Delivery success takes precedence over quality. Video may be compressed significantly. For high-quality video, send a link via SMS instead.

9. **Rich messages degrade.** Carousels, choices, and location messages are transcoded to plain text on MMS. Test what recipients actually see.

10. **Region must match.** Your Conversation API app must be in the same region as your MMS-capable service plan.

11. **No read receipts.** Unlike RCS and WhatsApp, MMS does not provide read receipts. You may receive delivery confirmations from some carriers.

## Links

- [MMS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/mms.md)
- [MMS Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/mms/set-up)
- [MMS Message Support](https://developers.sinch.com/docs/conversation/channel-support/mms/message-support)
- [Media Message Type](https://developers.sinch.com/docs/conversation/message-types/media-message.md)
- [Card Message Type](https://developers.sinch.com/docs/conversation/message-types/card-message.md)
- [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation.md)
- [MMS API (standalone)](https://developers.sinch.com/docs/mms/api-reference/sendmms.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
