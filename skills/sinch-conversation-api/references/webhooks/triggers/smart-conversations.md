# Smart Conversations Triggers

← [Back to Conversation API SKILL.md](../../../SKILL.md)

**Sections:** [Overview](#overview) | [Prerequisites](#prerequisites) | [SMART_CONVERSATION](#smart_conversation) | [MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION](#message_inbound_smart_conversation_redaction) | [Key Points](#key-points)

## Overview

Smart Conversations triggers deliver AI analysis results and redacted message content when Sinch's Smart Conversations feature is enabled. Smart Conversations uses machine learning to analyze message content for sentiment, intent, PII, offensive content, and more. These triggers require Smart Conversations to be enabled on your Conversation API app.

The two Smart Conversations triggers are:

- `SMART_CONVERSATION` — AI analysis results for messages
- `MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION` — Redacted message content (PII removed)

## Prerequisites

Smart Conversations must be enabled on your Conversation API app. Contact Sinch support to enable this feature, as it's not available by default.

## SMART_CONVERSATION

### Overview

Delivers AI-powered analysis of message content, including sentiment, intent classification, PII detection, offensive language detection, and custom entity extraction. Analysis is performed on all inbound messages when Smart Conversations is enabled.

### When It Fires

- Inbound message received from contact (after `MESSAGE_INBOUND`)
- Analysis completed by Smart Conversations engine (typically 100-500ms after message received)
- Only fires for messages where analysis completes successfully

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:25:00.456Z",
  "project_id": "PROJECT123",
  "smart_conversation_notification": {
    "message_id": "01H9876543...",
    "conversation_id": "01H5555555...",
    "contact_id": "01H3333333...",
    "analysis": {
      "sentiment": {
        "score": -0.65,
        "label": "NEGATIVE",
        "confidence": 0.89
      },
      "intent": {
        "primary": "order_status_inquiry",
        "confidence": 0.92,
        "secondary": ["refund_request"]
      },
      "pii_detected": true,
      "pii_entities": [
        {
          "type": "EMAIL",
          "text": "john.doe@example.com",
          "start": 45,
          "end": 66
        },
        {
          "type": "PHONE_NUMBER",
          "text": "555-1234",
          "start": 85,
          "end": 93
        }
      ],
      "offensive_content": {
        "detected": false,
        "confidence": 0.95
      },
      "language": "en",
      "categories": ["customer_support", "order_inquiry"]
    }
  }
}
```

### Analysis Fields

| Field                        | Description                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| `sentiment.score`            | Sentiment score from -1.0 (very negative) to +1.0 (very positive) |
| `sentiment.label`            | `POSITIVE`, `NEGATIVE`, or `NEUTRAL`                              |
| `sentiment.confidence`       | Confidence score (0.0 to 1.0)                                     |
| `intent.primary`             | Primary intent classification                                     |
| `intent.confidence`          | Confidence in primary intent                                      |
| `intent.secondary`           | Array of possible secondary intents                               |
| `pii_detected`               | Boolean indicating if PII was found                               |
| `pii_entities`               | Array of detected PII items with type and location                |
| `offensive_content.detected` | Boolean indicating if offensive content detected                  |
| `language`                   | Detected language code (ISO 639-1)                                |
| `categories`                 | Array of message category classifications                         |

### PII Entity Types

- `EMAIL` — Email addresses
- `PHONE_NUMBER` — Phone numbers
- `CREDIT_CARD` — Credit card numbers
- `SSN` — Social Security Numbers
- `PASSPORT` — Passport numbers
- `DRIVER_LICENSE` — Driver's license numbers
- `PERSON_NAME` — Person names
- `ADDRESS` — Physical addresses
- `DATE_OF_BIRTH` — Dates of birth
- `BANK_ACCOUNT` — Bank account numbers

### Common Use Cases

1. **Content Moderation** — Detect and filter offensive language
2. **Sentiment Routing** — Route negative sentiment messages to senior agents
3. **Intent Routing** — Auto-route messages to departments based on intent
4. **PII Compliance** — Detect sensitive information for GDPR/HIPAA compliance
5. **Analytics** — Aggregate sentiment and intent data for business insights

## MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION

### Overview

Delivers a redacted version of inbound messages with PII automatically removed or masked. This trigger fires in addition to `MESSAGE_INBOUND` and provides a sanitized message that's safe to store or process without PII compliance concerns.

### When It Fires

- Inbound message with PII detected (after PII detection analysis completes)
- Only fires if PII was found in the message
- Fires shortly after `MESSAGE_INBOUND` (typically 100-500ms later)

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:25:30.789Z",
  "project_id": "PROJECT123",
  "message": {
    "id": "01H9876543...",
    "conversation_id": "01H5555555...",
    "contact_id": "01H3333333...",
    "channel": "WHATSAPP",
    "direction": "TO_APP",
    "contact_message": {
      "text_message": {
        "text": "Hi, my email is [EMAIL_REDACTED] and my phone is [PHONE_REDACTED]. Can you help with order #12345?"
      }
    },
    "channel_identity": {
      "channel": "WHATSAPP",
      "identity": "46732001122",
      "app_id": "01H1234567..."
    },
    "accept_time": "2024-06-15T14:25:30.789Z",
    "metadata": "{\"redacted\":true,\"original_message_id\":\"01H9876543...\"}"
  }
}
```

### Redaction Format

PII is replaced with standardized tokens:

- `[EMAIL_REDACTED]` — Email addresses
- `[PHONE_REDACTED]` — Phone numbers
- `[CREDIT_CARD_REDACTED]` — Credit card numbers
- `[SSN_REDACTED]` — Social Security Numbers
- `[NAME_REDACTED]` — Person names
- `[ADDRESS_REDACTED]` — Physical addresses
- `[DOB_REDACTED]` — Dates of birth
- `[BANK_ACCOUNT_REDACTED]` — Bank account numbers

### Common Use Cases

1. **GDPR Compliance** — Store redacted messages instead of originals to minimize PII exposure
2. **Training Data** — Use redacted messages for ML training without privacy concerns
3. **Audit Logs** — Log redacted messages for compliance audits
4. **Third-Party Integration** — Share redacted messages with external systems safely

## Key Points

### SMART_CONVERSATION

1. **Feature Flag Required** — Smart Conversations must be enabled on your app; contact Sinch support
2. **Async Analysis** — Fires 100-500ms after `MESSAGE_INBOUND`; don't rely on it for immediate responses
3. **Confidence Scores** — Always check confidence scores before acting on analysis results
4. **Language Support** — Analysis quality varies by language; English has best support
5. **Cost** — Smart Conversations may incur additional charges; check with Sinch
6. **Sentiment Scale** — Ranges from -1.0 (very negative) to +1.0 (very positive); 0.0 is neutral

### MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION

7. **Conditional Firing** — Only fires if PII was detected in the message
8. **Original Still Delivered** — `MESSAGE_INBOUND` delivers original message; this trigger delivers redacted version
9. **Storage Strategy** — Consider storing only redacted versions for compliance
10. **Irreversible** — Redaction is one-way; PII cannot be recovered from redacted messages
11. **Token Format** — Use standardized tokens for easy identification of redacted content

### General

12. **Combined Use** — Use both triggers together: analysis for routing/escalation, redaction for storage
13. **Real-Time Actions** — Use `SMART_CONVERSATION` for real-time routing decisions
14. **Long-Term Storage** — Use `MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION` for compliant data retention
15. **False Positives** — PII detection may have false positives; review periodically
16. **Custom Intents** — Intent classifications can be customized; work with Sinch to train custom models
17. **Privacy by Design** — Redaction happens automatically; no PII ever leaves Sinch unprotected when using redacted messages
