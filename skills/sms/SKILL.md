---
name: sinch-sms
description: Send and receive SMS messages via Sinch Conversation API. Covers encoding, concatenation, opt-out, sender IDs, and country-specific rules.
---

# Sinch SMS Channel (Conversation API)

## Overview

SMS is a core channel of the Sinch Conversation API. Using the Conversation API's unified message format, you can send SMS messages alongside other channels (WhatsApp, RCS, etc.) with the same API call structure. The API handles SMS-specific details like encoding detection and message concatenation automatically.

## Getting Started

### Prerequisites

1. A Sinch account with access to the Conversation API (sign up at the Sinch Build Dashboard).
2. A service plan with at least one virtual number assigned.
3. A Conversation API app created in the same region as your service plan.
4. An access key (Key ID + Key Secret) and your Project ID.

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

**OAuth 2.0 (production):**

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_KEY_ID:YOUR_KEY_SECRET
```

Use the returned `access_token` as `Authorization: Bearer <token>`.

**Basic Auth (testing only):** `-u KEY_ID:KEY_SECRET` (heavily rate limited).

### Base URL

| Region | Base URL |
|--------|----------|
| US | `https://us.conversation.api.sinch.com` |
| EU | `https://eu.conversation.api.sinch.com` |
| BR | `https://br.conversation.api.sinch.com` |

### SDK Installation

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` + `@sinch/sms` | `npm install @sinch/sdk-core` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First API Call — Send an SMS

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
        "text": "Hello from Sinch SMS!"
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
        text: 'Hello from Sinch SMS!',
      },
    },
    channel_properties: {
      SMS_SENDER: '+15559876543',
    },
  },
});
```

## Key Concepts

### Character Encoding

The API auto-detects encoding based on message characters:

| Encoding | Max chars per SMS | Max chars per part (multipart) |
|----------|-------------------|-------------------------------|
| GSM 7-bit | 160 | 153 |
| UCS-2 (Unicode) | 70 | 67 |

- GSM 7-bit covers standard Latin characters, digits, and common symbols.
- Any character outside GSM 7-bit (accented chars, CJK, emoji) triggers UCS-2, halving capacity.
- A single emoji forces the entire message to UCS-2.

### Auto Encoding

Auto Encoding reduces message parts by transliterating special characters (e.g., smart quotes to straight quotes, currency symbols to ASCII equivalents). Emojis and CJK characters are not converted. Contact your Sinch account manager to enable this feature.

### Concatenated Messages

When a message exceeds single-SMS limits, it is split into multiple parts. Each part includes a User Data Header (UDH) that consumes bytes, reducing usable characters per part. The `SMS_MAX_NUMBER_OF_MESSAGE_PARTS` channel property controls the maximum number of parts.

### SMS Channel Properties

Set these under `channel_properties` in your message request:

| Property | Description |
|----------|-------------|
| `SMS_SENDER` | The sender number or alphanumeric sender ID |
| `SMS_MAX_NUMBER_OF_MESSAGE_PARTS` | Max concatenated parts allowed (integer) |

### Sender ID Types

| Type | Description | Example |
|------|-------------|---------|
| Long code | Standard phone number | `+15551234567` |
| Short code | 5-6 digit number | `12345` |
| Alphanumeric | Brand name (1-way only) | `MyBrand` |
| Toll-free | Toll-free number | `+18001234567` |
| 10DLC | US registered local number | `+15551234567` |

### Opt-Out Handling

- Opt-out keywords (STOP, UNSUBSCRIBE, etc.) are processed by Sinch automatically for US/Canada numbers.
- Inbound opt-out messages are delivered via webhook as Mobile Originated (MO) messages.
- You must honor opt-outs and maintain your own suppression list for compliance.
- Re-opt-in typically requires the user to send a keyword like START.

## Common Patterns

### Send SMS with Explicit Sender

```json
{
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
      "text": "Your verification code is 123456"
    }
  },
  "channel_properties": {
    "SMS_SENDER": "+15559876543",
    "SMS_MAX_NUMBER_OF_MESSAGE_PARTS": "3"
  }
}
```

### SMS as Fallback Channel

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
      "text": "Your order has shipped!"
    }
  }
}
```

### Receive Inbound SMS (Webhook Payload)

Configure a webhook with the `MESSAGE_INBOUND` trigger. Inbound SMS arrives as:

```json
{
  "app_id": "YOUR_APP_ID",
  "accepted_time": "2025-01-15T10:00:00Z",
  "message": {
    "contact_message": {
      "text_message": {
        "text": "STOP"
      }
    }
  },
  "channel_identity": {
    "channel": "SMS",
    "identity": "+15551234567"
  }
}
```

## Gotchas and Best Practices

1. **Region must match.** Your Conversation API app must be in the same region as your SMS service plan. Mismatched regions cause errors and missing delivery receipts.

2. **Encoding surprises.** A single non-GSM character (like a smart quote from copy-paste) forces UCS-2 encoding, doubling the message parts. Sanitize input or enable Auto Encoding.

3. **Sender ID rules vary by country.** Alphanumeric sender IDs are not supported in the US or Canada. Some countries require pre-registered sender IDs. Check Sinch's country-specific documentation.

4. **10DLC registration is required.** US A2P messaging over local numbers requires 10DLC brand and campaign registration. Unregistered traffic will be filtered.

5. **Short code limitations.** US short codes require a dedicated provisioning process and carrier approval. They cannot send MMS via Conversation API.

6. **Concatenation costs.** Each SMS part is billed separately. A 161-character GSM message costs 2 SMS credits. Monitor message length carefully.

7. **Opt-out compliance.** US/Canada regulations (TCPA, CASL) require honoring opt-outs. Sinch handles standard keywords automatically, but you must also respect custom opt-outs from your webhook data.

8. **Delivery receipts are not guaranteed.** Some carriers do not return delivery receipts. Handle `UNKNOWN` delivery status gracefully.

9. **Rate limits.** Conversation API is limited to 800 requests/second per project across all channels.

## Links

- [SMS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/sms/)
- [SMS Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/sms/set-up/)
- [SMS Channel Properties](https://developers.sinch.com/docs/conversation/channel-support/sms/properties/)
- [SMS Message Support](https://developers.sinch.com/docs/conversation/channel-support/sms/message-support)
- [Character Encoding](https://developers.sinch.com/docs/sms/resources/message-info/character-support)
- [Auto Encoding](https://developers.sinch.com/docs/sms/resources/message-info/auto-encoding)
- [SMS API Reference](https://developers.sinch.com/docs/sms/api-reference/sms)
- [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
