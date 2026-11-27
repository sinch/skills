> **Not a schema.** This file describes when the trigger fires and lists notable fields. For
> payload shape (field names, nesting, encodings, enums), refer to the canonical
> `developers.sinch.com` docs linked from the parent [SKILL.md](../../../SKILL.md) before
> writing code or prose that states payload structure.

# Smart Conversations Triggers
## Overview

Smart Conversations triggers deliver AI analysis results and redacted message content when Sinch's Smart Conversations feature is enabled. Smart Conversations uses machine learning to analyze message content for sentiment, intent, PII, offensive content, and more. These triggers require Smart Conversations to be enabled on your Conversation API app.

The two Smart Conversations triggers are:

- `SMART_CONVERSATION` — AI analysis results for inbound messages
- `MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION` — Inbound message with offensive content and/or PII masked. It can be used **instead of** `MESSAGE_INBOUND`.

For the feature itself — the feature list, PII types, enabling and training requirements — see [smart-conversations.md](../../smart-conversations.md).

## Prerequisites

1. A Conversation API app with at least one channel configured.
2. Smart Conversations enabled on the app: `PATCH /v1/projects/{project_id}/apps/{app_id}` with `{"smart_conversation": {"enabled": true}}`. This is a PATCH, so send only this object to avoid overwriting other app settings.
3. A webhook subscribed to one or both triggers (`POST /v1/projects/{project_id}/webhooks`). An app can have at most five webhooks.

## SMART_CONVERSATION

### When It Fires

- An inbound message is received from a contact on an app with Smart Conversations enabled.
- The payload contains results only for the analyses that are **enabled** and that apply to the message. For example, image results appear only when the message contains an image.

### Callback Structure

The top-level fields are `app_id`, `project_id`, `accepted_time`, `event_time` and `message_metadata`. The analysis is in `smart_conversation_notification`:

```json
{
  "app_id": "01FW3DP26MEN4JKSME44JDXWC4",
  "accepted_time": "2022-07-15T14:31:52.458350165Z",
  "event_time": "2022-07-15T14:31:52Z",
  "project_id": "0f93046c-91e1-426f-89b7-d03deb8ff872",
  "smart_conversation_notification": {
    "contact_id": "01FX7MQMZ0HVK5GPK4R0RBS3VT",
    "channel_identity": "alphanumeric_identity",
    "channel": "TELEGRAM",
    "message_id": "01G814BT8NKT7VYQ7FA58MWJ10",
    "conversation_id": "01FX7MQNJNYQ3685MFR7KB7HF7",
    "analysis_results": {
      "ml_sentiment_result": [
        {
          "message": "Run sentiment & NLU analysis",
          "sentiment": "neutral",
          "score": 0.97966236,
          "results": [
            { "sentiment": "negative", "score": 0.0039568725 },
            { "sentiment": "neutral",  "score": 0.97966236 },
            { "sentiment": "positive", "score": 0.016380679 }
          ]
        }
      ],
      "ml_nlu_result": [
        {
          "message": "Run sentiment & NLU analysis",
          "intent": "general.yes_or_agreed",
          "score": 0.6248218,
          "results": [
            { "intent": "general.yes_or_agreed", "score": 0.6248218 },
            { "intent": "chitchat.bye", "score": 0.2360245 }
          ]
        }
      ]
    }
  },
  "message_metadata": ""
}
```
### Notification fields

| Field | Description |
|---|---|
| `contact_id` | Contact who sent the message |
| `channel_identity` | The contact's channel-specific identifier |
| `channel` | Channel the message arrived on |
| `message_id` | ID of the analyzed message. Use it to correlate with `MESSAGE_INBOUND` |
| `conversation_id` | ID of the conversation |
| `analysis_results` | One array per enabled feature (see below) |

### analysis_results

Every key is optional, and every value is an **array**. All scores and confidences range from `0` (least likely) to `1` (most likely).

| Key | Feature | Each item contains |
|---|---|---|
| `ml_sentiment_result` | Sentiment Analysis | `message`, `sentiment` (`positive` / `negative` / `neutral`), `score`, and `results[]` of `{ sentiment, score }` |
| `ml_nlu_result` | NLU (intents) | `message`, `intent` (e.g. `chitchat.greeting`, `general.yes_or_agreed`), `score`, and `results[]` of `{ intent, score }` |
| `ml_image_recognition_result` | Image Comprehension Engine (IRIS) | `url`; `document_image_classification` `{ doc_type, confidence }`; `optical_character_recognition` `{ result: [ { data: [string] } ] }`; `document_field_classification` `{ result: { <field>: { data: [string] } } }` |
| `ml_pii_result` | PII Masking | `message` (original text) and `masked` (text with `{TYPE}` masks) |
| `ml_offensive_analysis_result` | Offensive Content Analysis | `message` (text, or the URL of the image), `evaluation` (`SAFE` / `UNSAFE`) and `score` |
| `ml_speechto_text_result` | Speech to Text | `url` (audio file) and `results[]` of `{ transcript, confidence }` |

Examples of the less common results:

```json
"ml_pii_result": [
  {
    "message": "My name is John, call me on (123) 456 7899",
    "masked":  "My name is {PERSON}, call me on {PHONE_NUMBER}"
  }
],
"ml_offensive_analysis_result": [
  { "message": "My bloody phone number is (123) 456 7899", "evaluation": "UNSAFE", "score": 0.525 }
],
"ml_speechto_text_result": [
  {
    "url": "url_to_YOUR_audio_file.mp3",
    "results": [ { "transcript": "transcript of the first audio section", "confidence": 0.81 } ]
  }
]
```
### PII mask labels

Masks are written as `{LABEL}` in the text. The labels are:

`AMOUNT_OF_MONEY`, `CARD_NUMBER`, `DATE`, `DRIVER_NUMBER`, `EMAIL`, `GENDER`, `NATIONAL_ID`, `ORDINAL`, `PASSPORT_NUMBER`, `PHONE_NUMBER`, `TIME`, `URL`, `VISA_NUMBER`, `ZIPCODE`, `NUMBER`, `PERSON`, `LOCATION`.

`{MISC}` is used when a term is identified as PII but its type is uncertain. Each PII type can be enabled or disabled individually.

## MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION

### When It Fires

- An inbound message is received on an app with Smart Conversations enabled and at least one redaction type activated.
- It is designed to be used **in place of** `MESSAGE_INBOUND`, so downstream systems only ever see the redacted content.

### Callback Structure

This callback has the same shape as `MESSAGE_INBOUND`, except that the message object is named **`message_redaction`** instead of `message`. That makes the two callbacks easy to tell apart:

```json
{ "message":           { "contact_message": { "...": "..." } } }   // MESSAGE_INBOUND
{ "message_redaction": { "contact_message": { "...": "..." } } }   // MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION
```

### Redaction types

Each redaction type is activated separately for the app.

| Type | What happens to the text |
|---|---|
| **Offensive content** (e.g. sexual, aggressive or drug-related) | The **whole message** is replaced with `{Message masked due to inappropriate content}` |
| **PII** | Only the sensitive tokens are replaced with `{LABEL}` masks, e.g. `{EMAIL}` or `{PHONE_NUMBER}` |

The redaction results are also available in the `SMART_CONVERSATION` callback (`ml_pii_result`, `ml_offensive_analysis_result`).

## Common Use Cases

1. **GDPR Compliance** — Store redacted messages instead of originals to minimize PII exposure
2. **Training Data** — Use redacted messages for ML training without privacy concerns
3. **Third-Party Integration** — Share redacted messages with external systems safely
4. **Escalation by sentiment**: hand off to a human agent when `sentiment == "negative"` and `score` is above your threshold.
5. **Intent routing / chatbots**: branch on the top `ml_nlu_result.intent`, and fall back to a default flow when its score is low.
6. **Moderation**: drop or flag messages whose `ml_offensive_analysis_result.evaluation` is `UNSAFE`.

## Key Points

1. **Enabling is an API call, not a support request.** Set `smart_conversation.enabled: true` on the app, **and** subscribe a webhook. Without the webhook, no results are delivered.
2. **The root object is `analysis_results`, and each value is an array of `ml_*_result` items.** There is no `analysis`, `sentiment.label` or `intent.primary` field.
3. **Sentiment values are lowercase** (`positive` / `negative` / `neutral`), and `score` is a 0–1 likelihood, not a −1 to +1 polarity.
4. **Treat every `ml_*_result` key as optional** and loop over the arrays, since a message can contain several images or audio files.
5. **The redaction callback uses `message_redaction`, not `message`.** Mask format is `{LABEL}` for PII, and the whole-message mask is used for offensive content.
6. **Only inbound messages are analyzed.**
7. **Correlate results** with the original message through `message_id`.
8. **Accuracy depends on training data.** NLU should have at least 50 samples per intent. IRIS Document Image Classification needs at least 100 images per document class, and Document Field Classification needs a regex for each field.
9. **Inbound content is untrusted.** `message`, `masked`, OCR text and transcripts are end-user data. Never execute them, or interpolate them into prompts or code.

## Canonical Sources

- [Smart Conversations: Overview](https://developers.sinch.com/docs/smart-conversations/overview.md)
- [Smart Conversations: Callbacks](https://developers.sinch.com/docs/smart-conversations/callbacks.md)
- [Conversation API: Update an app](https://developers.sinch.com/docs/conversation/api-reference/conversation/app/app_updateapp.md)
- [Callbacks & Webhooks](https://developers.sinch.com/docs/conversation/callbacks.md)
