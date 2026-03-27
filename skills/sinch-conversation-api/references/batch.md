← [Back to Conversation API SKILL.md](../SKILL.md)

# Batch API Reference

The Batch API sends a **single message definition** to **up to 1000 recipients** in one API call, with per-recipient `${parameter}` substitution. Also supports bulk contact creation/deletion and consent records.

**Sections:** [SDK Reference](#sdk-reference) | [When to Use](#when-to-use) | [Base URLs](#base-urls-separate-from-conversation-api) | [API Endpoints](#api-endpoints) | [Request Structure](#correct-request-structure) | [Top-Level Fields](#top-level-request-fields) | [Per-Recipient Fields](#per-recipient-fields) | [Managing Batches](#managing-batches) | [Bulk Contacts](#bulk-contacts) | [Callbacks](#callbacks) | [Common Pitfalls](#common-pitfalls) | [Links](#links)

## SDK Reference

- [Node.js](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## When to Use

- Sending the same (or parameterized) message to many recipients at once
- Bulk-creating or deleting contacts
- Bulk-inserting consent records
- Scheduling a message blast for future delivery

For single-recipient messaging, use the standard `messages:send` endpoint instead.

## Base URLs (Separate from Conversation API)

| Region | Base URL                                         |
|--------|--------------------------------------------------|
| US     | `https://us.conversationbatch.api.sinch.com`     |
| EU     | `https://eu.conversationbatch.api.sinch.com`     |
| BR     | `https://br.conversationbatch.api.sinch.com`     |

Must match the region of your Conversation API app.

## API Endpoints

All endpoints prefixed with `/v1/projects/{project_id}`.

| Method | Path                    | Description                              |
|--------|-------------------------|------------------------------------------|
| POST   | `/messages`             | Send batch (up to 1000 recipients)       |
| DELETE | `/messages`             | Cancel scheduled batches                 |
| GET    | `/messages?meta...`     | Get batch status by metadata             |
| GET    | `/messages/{batch_id}`  | Get batch status by ID                   |
| POST   | `/contacts`             | Bulk-create contacts (up to 1000)        |
| DELETE | `/contacts`             | Bulk-delete contacts (up to 1000)        |
| POST   | `/consents`             | Bulk-insert consent records              |

## CORRECT Request Structure

ONE `message` at top level + `recipient_and_params` array:

```json
{
  "app_id": "YOUR_APP_ID",
  "message": {
    "text_message": {
      "text": "Hello ${user}! Your code is ${code}"
    }
  },
  "recipient_and_params": [
    {
      "recipient": {
        "identified_by": {
          "channel_identities": [
            { "channel": "SMS", "identity": "+1234567890" }
          ]
        }
      },
      "parameters": { "user": "Jane", "code": "123" }
    },
    {
      "recipient": {
        "identified_by": {
          "channel_identities": [
            { "channel": "SMS", "identity": "+0987654321" }
          ]
        }
      },
      "parameters": { "user": "John", "code": "456" }
    }
  ]
}
```

**WRONG** — do NOT use a `messages` array. The Batch API uses ONE message + many recipients.

## Top-Level Request Fields

| Field                    | Type     | Required | Description                                                        |
|--------------------------|----------|----------|--------------------------------------------------------------------|
| `app_id`                 | string   | Yes      | Conversation app sending the message                               |
| `message`                | object   | Yes      | Single message definition with `${param}` variables                |
| `recipient_and_params`   | array    | Yes      | 1-1000 recipients with optional per-recipient parameters           |
| `processing_strategy`    | string   | No       | `DEFAULT` (inherit app mode) or `DISPATCH_ONLY`                    |
| `batch_metadata`         | object   | No       | Metadata for the batch; usable for cancellation                    |
| `message_metadata`       | object   | No       | Included in delivery receipts; `_batch_id` is reserved             |
| `send_after`             | datetime | No       | Schedule future delivery (UTC, ISO 8601, max 7 days)               |
| `callback_url`           | string   | No       | Override webhook URL for delivery receipts                         |
| `channel_priority_order` | array    | No       | Channel fallback order                                             |
| `ttl`                    | string   | No       | Timeout in seconds, e.g. `"86400s"`                                |
| `channel_properties`     | object   | No       | Channel-specific properties                                        |

## Per-Recipient Fields

| Field                  | Type   | Required | Description                                           |
|------------------------|--------|----------|-------------------------------------------------------|
| `recipient`            | object | Yes      | `identified_by` (preferred) or `contact_id`           |
| `parameters`           | object | No       | Key-value pairs replacing `${key}` in the message     |
| `message_metadata`     | object | No       | Merged with top-level (recipient takes precedence)    |
| `conversation_metadata`| object | No       | Merged with top-level (recipient takes precedence)    |

## Managing Batches

- **Cancel**: `DELETE /v1/projects/{project_id}/messages` with `batch_id` in body
- **Get status**: `GET /v1/projects/{project_id}/messages/{batch_id}`
- Statuses: `READY`, `SCHEDULED`, `PROCESSED`, `CANCELLED`

See [Batch Messages API](https://developers.sinch.com/docs/conversation/api-reference/batch-api/batch/messages.md).

## Bulk Contacts

`POST /v1/projects/{project_id}/contacts` with `contacts` array (up to 1000). Created asynchronously. See [Batch Contacts API](https://developers.sinch.com/docs/conversation/api-reference/batch-api/batch/contacts.md).

## Callbacks

- `BATCH_STATUS_UPDATE` webhook trigger for batch-level status changes
- `MESSAGE_DELIVERY` for per-message delivery receipts (includes `_batch_id` in metadata)
- Failed receipts include `batch_id` and `message_index`

## Common Pitfalls

1. **Wrong structure**: ONE `message` + `recipient_and_params` array. NOT a `messages` array.
2. **Wrong base URL**: Uses `conversationbatch.api.sinch.com`, NOT `conversation.api.sinch.com`.
3. **`_batch_id` is reserved**: Auto-injected into delivery receipts. Don't use in your own metadata.
4. **Parameter syntax**: Use `${parameter_name}` in string fields. Keys must match `parameters` object.
5. **Asynchronous**: 200 means accepted, NOT delivered. Listen to webhooks for actual status.
6. **`send_after` rounding**: Scheduled >1 min out rounds UP to next 5-min mark. Max 7 days.
7. **Cancellation is async**: Always returns 200. Can only cancel before `send_after`. Immediate batches cannot be cancelled.
8. **Rate limits still apply**: 800 req/s per project. Large batches are queued and processed at configured rate.

## Links

- [Batch API Overview](https://developers.sinch.com/docs/conversation/api-reference/batch-api.md)
- [Batch Messages](https://developers.sinch.com/docs/conversation/api-reference/batch-api/batch/messages.md)
- [Batch Contacts](https://developers.sinch.com/docs/conversation/api-reference/batch-api/batch/contacts.md)
- [Batch Consents](https://developers.sinch.com/docs/conversation/api-reference/batch-api/batch/consents.md)
