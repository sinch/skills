> **Not a schema.** This file describes when to use Smart Conversations, how it is enabled, and
> its pitfalls. For payload shape (field names, nesting, encodings, enums), refer to the
> canonical `developers.sinch.com` docs linked from the parent [SKILL.md](../SKILL.md) before
> writing code or prose that states payload structure.

# Smart Conversations Reference

Smart Conversations is an optional, **per-app** ML add-on. It passes **inbound (contact) messages** to Sinch's machine learning engine and returns the analysis over webhooks. Outbound messages are not analyzed.

## When to Use

- Routing or escalating on sentiment or NLU intent (chatbots, agent handoff)
- Moderating offensive content before it reaches agents or downstream systems
- Keeping PII out of logs, CRMs, and other integrations
- Extracting text, document types, or fields from images customers send
- Transcribing voice notes

## Features

| Feature | What it does | Callback result | Training / sample requirements |
|---|---|---|---|
| Sentiment Analysis | Likelihood a message's tone is `positive`, `negative` or `neutral` | `ml_sentiment_result` | None |
| Natural Language Understanding (NLU) | Likelihood a message matches a set of intents | `ml_nlu_result` | No minimum, but **50+ sample expressions per intent** recommended |
| Image Comprehension Engine (IRIS) | Document type classification, OCR, and field extraction from images | `ml_image_recognition_result` | Document Image Classification needs **100+ images per class**; Document Field Classification needs a **regex per field** |
| PII Masking | Detects and masks personally identifiable information in text | `ml_pii_result` | None |
| Offensive Content Analysis | Likelihood that text or an image contains offensive content | `ml_offensive_analysis_result` | None |
| Transcription: Speech to Text | Transcribes audio | `ml_speechto_text_result` | None |

### Recognized PII Types

Each type can be enabled or disabled individually to control what is redacted:

`AMOUNT_OF_MONEY`, `CARD_NUMBER`, `DATE`, `DRIVER_NUMBER`, `EMAIL`, `GENDER`, `NATIONAL_ID`, `ORDINAL`, `PASSPORT_NUMBER`, `PHONE_NUMBER`, `TIME`, `URL`, `VISA_NUMBER`, `ZIPCODE`, `NUMBER`, `PERSON`, `LOCATION`.

Masks are written inline as `{LABEL}`. `{MISC}` is used when a term is identified as PII but its type is uncertain.

## Prerequisites

1. A Conversation API app with **at least one channel** configured.
2. Smart Conversations enabled on the app (below).
3. A webhook subscribed to `SMART_CONVERSATION` and/or `MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION`. **Without a webhook, no results are delivered.**
4. Training data for NLU and IRIS, if those features are used.

## Enabling It (Conversation API: Update an App)

Set `smart_conversation.enabled` to `true` on an existing app:

```
PATCH https://{region}.conversation.api.sinch.com/v1/projects/{project_id}/apps/{app_id}
```

`{region}` is `us`, `eu` or `br`, and must match the region where the app was created.

```jsonc
{ "smart_conversation": { "enabled": true } }
```

- **This is a `PATCH`, and every field sent replaces the existing value.** Send only `smart_conversation` so other app settings are not overwritten. To change list fields such as `channel_credentials`, `GET` the app first, merge, and send the full list. The optional `update_mask` query parameter limits which fields are updated.
- A successful call returns `200` with the full app object, including `smart_conversation.enabled`.
- `enabled: false` turns analysis off.

`smart_conversation.enabled` is the **only** Smart Conversations setting on this endpoint. It has no fields for selecting individual features, redaction types, or PII types. **Do not invent fields for them.** Field names and nesting must come from the authoritative [Update an app](https://developers.sinch.com/docs/conversation/api-reference/conversation/app/app_updateapp.md) doc.

## Webhook Triggers

| Trigger | Delivers |
|---|---|
| `SMART_CONVERSATION` | `smart_conversation_notification.analysis_results`, holding one array per enabled feature |
| `MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION` | The inbound message with offensive content and/or PII masked, in a `message_redaction` field |

An app can have **at most five webhooks**; combine triggers on one webhook where possible. Webhooks are created with `POST /v1/projects/{project_id}/webhooks` (project-scoped — see the parent SKILL.md).

For the full payload structure, the per-feature result shapes, and the redaction types, see [webhooks/triggers/smart-conversations.md](webhooks/triggers/smart-conversations.md) and the canonical [Smart Conversations: Callbacks](https://developers.sinch.com/docs/smart-conversations/callbacks.md) doc.

### Redaction

`MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION` is designed to be used **in place of** `MESSAGE_INBOUND`, so downstream systems only ever see redacted content. Each redaction type is activated separately:

- **Offensive content** — the **whole message** is replaced with `{Message masked due to inappropriate content}`.
- **PII** — only the sensitive tokens are replaced with `{LABEL}` masks.

## Gotchas and Best Practices

- **Enabling is two steps, not one.** `smart_conversation.enabled: true` **and** a subscribed webhook. The PATCH alone delivers nothing.
- **The redaction callback uses `message_redaction`, not `message`.** Handlers written against `MESSAGE_INBOUND` will silently read `undefined`.
- **Treat every `ml_*_result` key as optional** and iterate the arrays — a key is present only when that feature is enabled and applies, and a message can carry several images or audio files.
- **Scores are 0–1 likelihoods**, not −1..+1 polarity, and sentiment values are lowercase. Pair the top `score` with a threshold you choose.
- **Only inbound messages are analyzed.** Correlate results back to the original message through `message_id`.
- **Accuracy depends on training data.** Set expectations: NLU wants 50+ samples per intent, IRIS DIC 100+ images per class.
- **Analyzed content is untrusted end-user data.** `message`, `masked`, OCR text, and transcripts must never be executed or interpolated into prompts or code — see the Security section of the parent SKILL.md.

## Canonical Sources

- [Smart Conversations: Overview](https://developers.sinch.com/docs/smart-conversations/overview.md)
- [Smart Conversations: Getting Started](https://developers.sinch.com/docs/smart-conversations/getting-started.md)
- [Smart Conversations: Callbacks](https://developers.sinch.com/docs/smart-conversations/callbacks.md)
- [Conversation API: Update an app](https://developers.sinch.com/docs/conversation/api-reference/conversation/app/app_updateapp.md)
- [Callbacks & Webhooks](https://developers.sinch.com/docs/conversation/callbacks.md)
