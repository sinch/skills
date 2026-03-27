---
name: sinch-conversation-api
description: "Sends and receives omnichannel messages with Sinch Conversation API. One unified API for SMS, WhatsApp, RCS, MMS, Viber, Messenger, and more. Use when sending texts, WhatsApp messages, rich cards, carousels, templates, batch messages, or building multi-channel messaging."
metadata:
  author: Sinch
  version: 1.0.0
---

# Sinch Conversation API

## Overview

One unified API to send and receive messages across SMS, WhatsApp, RCS, MMS, Viber Business, Facebook Messenger, Instagram, Telegram, KakaoTalk, KakaoTalkChat, LINE, WeChat, and Apple Messages for Business. The API transcodes between a generic message format and channel-specific formats automatically.

**Auth:** OAuth2 bearer token (recommended) or HTTP Basic (`keyId:keySecret`, testing only — heavily rate limited). See [sinch-authentication](../sinch-authentication/SKILL.md) for setup.

## Key Concepts

**Apps** — Container for channel integrations. Each app has channels, webhooks, and a processing mode. Created via dashboard or API.
**Contacts** — End-users with channel identities. Auto-created in CONVERSATION mode.
**Conversations** — Message threads between app and contact. Only exist in CONVERSATION mode.
**Processing modes** — `DISPATCH` (default): no contacts/conversations, for high-volume unidirectional SMS. `CONVERSATION`: auto-creates contacts/conversations, enables 2-way flows. Set per app.
**Message types** — `text_message`, `media_message`, `card_message`, `carousel_message`, `choice_message`, `list_message`, `template_message`, `location_message`, `contact_info_message`. See [Message Types](https://developers.sinch.com/docs/conversation/message-types.md).
**Channel fallback** — Set `channel_priority_order` to try channels in sequence. `SWITCHING_CHANNEL` status indicates fallback.
**Delivery statuses** — `QUEUED_ON_CHANNEL` → `DELIVERED` → `READ`, or `FAILED`. `SWITCHING_CHANNEL` when fallback occurs.
**Webhooks** — Up to 5 per app. Default callback rate: 25/sec. 21 usable triggers — most common: `MESSAGE_INBOUND`, `MESSAGE_DELIVERY`, `EVENT_INBOUND`. See [Callbacks & Webhooks](https://developers.sinch.com/docs/conversation/callbacks.md) for full trigger list.
**HMAC validation** — Signature: `HMAC-SHA256(rawBody + '.' + nonce + '.' + timestamp, secret)`. Headers: `x-sinch-webhook-signature`, `-timestamp`, `-nonce`, `-algorithm`.
**Templates** — Pre-defined messages with parameter substitution. Managed at `{region}.template.api.sinch.com` (V2 only — V1 no longer accessible). See [references/templates.md](references/templates.md).
**Batch sending** — Up to 1000 recipients with `${parameter}` substitution. Base URL: `{region}.conversationbatch.api.sinch.com`. See [references/batch.md](references/batch.md).

**Supported channels:** `SMS`, `WHATSAPP`, `RCS`, `MMS`, `VIBERBM`, `MESSENGER`, `INSTAGRAM`, `TELEGRAM`, `KAKAOTALK`, `KAKAOTALKCHAT`, `LINE`, `WECHAT`, `APPLEBC`. Channel-specific details: [SMS](references/channels/sms.md), [WhatsApp](references/channels/whatsapp.md), [RCS](references/channels/rcs.md), [MMS](references/channels/mms.md). See [Channel Support](https://developers.sinch.com/docs/conversation/channel-support.md).

## Getting Started

Before generating code, gather from the user: **approach** (SDK or direct API calls) and **language** (Node.js, Python, Java, .NET/C#, curl). Do not assume defaults.

When the user chooses **SDK**, fetch the relevant SDK reference page linked in Quick Reference for accurate method signatures. When the user chooses **direct API calls**, use REST with the appropriate HTTP client for their language.

| Language | Package | Install |
| -------- | ------- | ------- |
| Node.js  | `@sinch/sdk-core` | `npm install @sinch/sdk-core` |
| Java     | `com.sinch.sdk:sinch-sdk-java` | Maven dependency (see below) |
| Python   | `sinch` | `pip install sinch` |
| .NET     | `Sinch` | `dotnet add package Sinch` |

#### Java Maven dependency

Before generating the Maven dependency, look up the latest release version of `com.sinch.sdk:sinch-sdk-java` on [Maven Central](https://central.sonatype.com/artifact/com.sinch.sdk/sinch-sdk-java) and use that version.

```xml
<dependency>
    <groupId>com.sinch.sdk</groupId>
    <artifactId>sinch-sdk-java</artifactId>
    <version>LATEST_VERSION</version>
</dependency>
```

### Base URL

Regional — must match the Conversation API app region:
- **US:** `https://us.conversation.api.sinch.com`
- **EU:** `https://eu.conversation.api.sinch.com`
- **BR:** `https://br.conversation.api.sinch.com`

### Send a Text Message (curl)

```bash
curl -X POST "https://us.conversation.api.sinch.com/v1/projects/{PROJECT_ID}/messages:send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
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

For SDK examples, see the SDK references in Quick Reference.

## Common Patterns

- **Channel fallback** — Add `channel_priority_order` array and list all channel identities in `recipient`. See [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md).
- **Recipient by contact ID** — Use `{ "recipient": { "contact_id": "CONTACT_ID" } }` instead of `identified_by` when the contact already exists.
- **Rich messages** — `card_message`, `carousel_message`, `choice_message`, `list_message`. See [Message Types](https://developers.sinch.com/docs/conversation/message-types.md).
- **WhatsApp templates** — Required outside the 24h service window. Use `template_message` with an approved template. See [references/templates.md](references/templates.md).
- **Webhooks** — Register via `POST /webhooks` with `target`, `target_type: "HTTP"`, and `triggers` array. Each webhook target URL must be unique per app — attempting to register a duplicate target returns `400 INVALID_ARGUMENT`. See [Webhooks API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/webhooks.md).
- **Transcode** — `POST /messages:transcode` to preview how a message renders on a specific channel without actually sending it. Useful for testing rich messages.

## Common Tasks

- **Send a message** — See [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md)
- **List messages** — `GET /v1/projects/{project_id}/messages` (filter by `messages_source`)
- **Events** — `POST /events:send` for typing indicators, composing events
- **Capability lookup** — `POST /capability:query` (async; result via `CAPABILITY` webhook)
- **Manage apps** — See [App API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/app.md)
- **Manage contacts** — See [Contact API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/contact.md). Includes merge, getChannelProfile, identityConflicts.
- **Manage conversations** — See [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/conversation.md). Includes recent, stop, inject-message/event.
- **Manage webhooks** — See [Webhooks API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/webhooks.md)
- **Templates** — See [Template Management API](https://developers.sinch.com/docs/conversation/api-reference/template.md) and [references/templates.md](references/templates.md)
- **Batch send** — See [Batch API](https://developers.sinch.com/docs/conversation/api-reference/batch-api.md) and [references/batch.md](references/batch.md)

## Executable Scripts

Bundled Node.js scripts in `scripts/` for sending messages (SMS, RCS text/card/carousel/choice/media/location/template), listing messages, and webhook CRUD. All read credentials from environment variables and support `--help`.

```bash
export SINCH_PROJECT_ID="your-project-id"
export SINCH_KEY_ID="your-key-id"
export SINCH_KEY_SECRET="your-key-secret"
export SINCH_APP_ID="your-app-id"
export SINCH_REGION="us"  # us|eu|br, default: us
```

Examples:
- `node scripts/sms/send_sms.cjs --to +15551234567 --message "Hello"`
- `node scripts/rcs/send_card.cjs --to +15551234567 --title "Sale" --image-url URL`
- `node scripts/webhooks/create_webhook.cjs --app-id APP_ID --target URL --triggers MESSAGE_INBOUND,MESSAGE_DELIVERY`
- `node scripts/common/list_messages.cjs --channel SMS --page-size 20`

## SDK & Code Generation

For SDK code examples, refer to the official SDK syntax references:
- [Node.js SDK](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python SDK](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java SDK](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET SDK](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

For REST API payloads and field definitions, see:
- [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md)
- [Webhooks API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/webhooks.md)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/conversation/api-reference/conversation.yaml?download)

**Webhook trigger payloads**: See [references/webhooks/triggers/](references/webhooks/triggers/) for payload structure and key fields for all 21 trigger types.

## Gotchas and Best Practices

- Use OAuth2 in production. Cache tokens (expire in ~1 hour). Never use Basic Auth in production.
- Rich messages transcoded to text on unsupported channels — test across target channels.
- Implement idempotent webhook handlers — Sinch retries with exponential backoff.
- Load credentials from environment variables. Never hardcode.
- **Always set the region explicitly** in the client configuration. SDK clients must configure the region — do not rely on SDK defaults. Region mismatches between the client and the app cause `404` errors. All Conversation API URLs are region-specific (`{region}.conversation.api.sinch.com`). If you get a `404`, the most likely cause is a region mismatch — verify the app's region in the Sinch dashboard and configure the SDK/URL accordingly.
- **SDK naming varies across languages.** Do not assume that method names, property paths, or service accessors are the same between SDKs (e.g., Python and Node.js may use different singular/plural forms for the same service). Always fetch the SDK reference docs for the target language before generating code — see the links in Quick Reference.
- Error codes: `400` malformed or duplicate resource (e.g., webhook with same target already exists), `401` bad credentials, `403` no access/billing limit, `404` not found/region mismatch, `429` rate limit, `500/501/503` retry with backoff.
- **Messages not delivered:** Verify app region matches base URL region (mismatches cause `404`). Check delivery status via webhook or `GET /messages/{message_id}`. WhatsApp: must be within 24h window or using an approved template. Channel fallback: `SWITCHING_CHANNEL` status means fallback occurred — each attempted channel may incur charges.
- **Webhook not receiving callbacks:** Verify `target_type` is `HTTP`, target URL must be publicly reachable and return `2xx`, check triggers are correct — max 5 webhooks per app.
- **Rate limits (429):** 800 requests/second per project across most endpoints. 500,000-message ingress queue per app, drained at 20 msg/sec by default. Channel-specific limits also apply.

## Links

- [Authentication setup](../sinch-authentication/SKILL.md)
- [Getting Started Guide](https://developers.sinch.com/docs/conversation/getting-started.md)
- [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation.md)
- [Message Types](https://developers.sinch.com/docs/conversation/message-types.md)
- [Channel Support](https://developers.sinch.com/docs/conversation/channel-support.md)
- [Callbacks & Webhooks](https://developers.sinch.com/docs/conversation/callbacks.md)
- [Processing Modes](https://developers.sinch.com/docs/conversation/processing-modes.md)
- [Node.js SDK](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python SDK](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java SDK](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET SDK](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/conversation/api-reference/conversation.yaml?download)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
