# MESSAGE_DELIVERY Trigger

← [Back to Conversation API SKILL.md](../../../SKILL.md)

**Sections:** [Overview](#overview) | [When It Fires](#when-it-fires) | [Callback Structure](#callback-structure) | [Common Use Cases](#common-use-cases) | [Example Callback Payload](#example-callback-payload) | [Key Points](#key-points)

## Overview

The `MESSAGE_DELIVERY` trigger fires when there's an update to the delivery status of a message your app sent to a contact. This trigger provides real-time feedback on whether messages were successfully delivered, read, or failed, enabling you to track message lifecycle and handle delivery failures.

## When It Fires

- Message queued on the channel (initial acknowledgment)
- Message delivered to the recipient's device
- Message read by the recipient (if channel supports read receipts)
- Message delivery failed
- Message switched to a fallback channel (if configured)

## Callback Structure

The webhook callback contains a `message_delivery_report` object with these key fields:

| Field              | Type   | Description                                 |
| ------------------ | ------ | ------------------------------------------- |
| `message_id`       | string | ID of the message this status update is for |
| `conversation_id`  | string | Conversation the message belongs to         |
| `status`           | string | Delivery status (see values below)          |
| `channel_identity` | object | Channel-specific recipient information      |
| `contact_id`       | string | Contact who should receive the message      |
| `reason`           | object | Error details (if status is `FAILED`)       |
| `metadata`         | string | Metadata attached to the original message   |
| `processing_mode`  | string | Processing mode used                        |

### Status Values

| Status              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `QUEUED_ON_CHANNEL` | Message submitted to channel, awaiting delivery      |
| `DELIVERED`         | Message delivered to recipient's device              |
| `READ`              | Message read by recipient (WhatsApp, RCS only)       |
| `FAILED`            | Message delivery failed permanently                  |
| `SWITCHING_CHANNEL` | Message failed on one channel, switching to fallback |

### Reason Object (for FAILED status)

| Field         | Type   | Description                      |
| ------------- | ------ | -------------------------------- |
| `code`        | string | High-level error category        |
| `description` | string | Human-readable error description |
| `sub_code`    | string | Detailed error code              |

**Common Error Codes:**

- `RECIPIENT_NOT_REACHABLE` — Contact doesn't exist or is unavailable on the channel
- `RECIPIENT_NOT_OPTED_IN` — Contact hasn't opted in (required for some channels)
- `OUTSIDE_ALLOWED_SENDING_WINDOW` — WhatsApp 24-hour window expired, must use template
- `CHANNEL_FAILURE` — Channel provider error
- `MEDIA_NOT_REACHABLE` — Media URL inaccessible or invalid
- `UNSUPPORTED_CONTENT` — Channel doesn't support the message type
- `REJECTED_BY_CHANNEL` — Channel rejected the message (e.g., policy violation)

## Common Use Cases

1. **Delivery Tracking** — Monitor which messages were successfully delivered for analytics and reporting
2. **Failure Handling** — Detect failed messages and retry with different content or fallback channels
3. **Read Receipts** — Track when recipients read messages (for engagement metrics)
4. **User Notifications** — Notify agents when messages are delivered or fail in customer service platforms
5. **SLA Compliance** — Measure message delivery times and success rates for service level agreements
6. **Channel Optimization** — Identify channels with high failure rates and adjust routing logic
7. **Billing Reconciliation** — Track delivered messages for accurate billing

## Example Callback Payload

### Success: Message Delivered

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:25:10.456Z",
  "event_time": "2024-06-15T14:25:09.123Z",
  "project_id": "PROJECT123",
  "message_delivery_report": {
    "message_id": "01H9876543...",
    "conversation_id": "01H5555555...",
    "status": "DELIVERED",
    "channel_identity": {
      "channel": "WHATSAPP",
      "identity": "46732001122",
      "app_id": "01H1234567..."
    },
    "contact_id": "01H3333333...",
    "metadata": "order_confirmation_12345",
    "processing_mode": "CONVERSATION"
  }
}
```

### Failure

Same structure with `status: "FAILED"` and a `reason` object:
- `reason.code` — e.g. `RECIPIENT_NOT_REACHABLE`, `OUTSIDE_ALLOWED_SENDING_WINDOW`
- `reason.sub_code` — e.g. `UNDELIVERABLE_DESTINATION`, `CHANNEL_POLICY_VIOLATION`
- `reason.description` — human-readable explanation

### Channel Switching

Status `SWITCHING_CHANNEL` indicates fallback to an alternative channel. Includes `reason` explaining why the primary channel failed.

## Key Points

1. **Multiple Status Updates** — A single message may trigger multiple callbacks: `QUEUED_ON_CHANNEL` → `DELIVERED` → `READ`
2. **Read Receipts Limited** — Only WhatsApp and RCS support `READ` status; most channels only confirm delivery
3. **Failure Reasons** — Always check `reason.code` and `reason.sub_code` to understand why delivery failed
4. **Retry Logic** — For transient failures (like `CHANNEL_FAILURE`), implement retry logic; for permanent failures (like `RECIPIENT_NOT_REACHABLE`), don't retry
5. **WhatsApp Session Window** — The `OUTSIDE_ALLOWED_SENDING_WINDOW` error means you must use approved WhatsApp templates instead of free-form messages
6. **Channel Fallback** — If you configured fallback channels, `SWITCHING_CHANNEL` indicates automatic failover to an alternative channel
7. **Metadata Tracking** — Use the `metadata` field to correlate delivery reports with your internal systems (e.g., order IDs, ticket numbers)
8. **Processing Mode** — `CONVERSATION` mode manages channel selection automatically; `DISPATCH` mode sends to specific channels without fallback
9. **Timing Variations** — Delivery times vary by channel; SMS is typically instant, WhatsApp can take seconds, RCS may be delayed if recipient is offline
10. **No Delivery Guarantee** — `DELIVERED` means delivered to the device, not that the user saw it; only `READ` confirms user engagement
