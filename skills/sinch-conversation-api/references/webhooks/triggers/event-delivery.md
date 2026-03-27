# EVENT_DELIVERY Trigger

← [Back to Conversation API SKILL.md](../../../SKILL.md)

## Overview

The `EVENT_DELIVERY` trigger fires when there's a delivery status update for an event your app sent to a contact. Events are non-message interactions such as composing indicators or typing notifications. This trigger works similarly to `MESSAGE_DELIVERY` but is specifically for events rather than messages.

## When It Fires

- Event successfully delivered to the channel
- Event delivery failed
- Event queued on the channel

Note: Most channels don't support app-initiated events, so this trigger is rarely used in practice. WhatsApp and RCS are the primary channels that support sending events from apps to contacts.

## Callback Structure

The webhook callback contains an `event_delivery_report` object with these key fields:

| Field              | Type   | Description                                                  |
| ------------------ | ------ | ------------------------------------------------------------ |
| `event_id`         | string | ID of the event this status update is for                    |
| `conversation_id`  | string | Conversation the event belongs to                            |
| `status`           | string | Delivery status (`DELIVERED`, `FAILED`, `QUEUED_ON_CHANNEL`) |
| `channel_identity` | object | Channel-specific recipient information                       |
| `contact_id`       | string | Contact who should receive the event                         |
| `reason`           | object | Error details (if status is `FAILED`)                        |
| `metadata`         | string | Metadata attached to the original event                      |

### Status Values

| Status              | Description                                   |
| ------------------- | --------------------------------------------- |
| `QUEUED_ON_CHANNEL` | Event submitted to channel, awaiting delivery |
| `DELIVERED`         | Event delivered successfully                  |
| `FAILED`            | Event delivery failed                         |

### Reason Object (for FAILED status)

| Field         | Type   | Description                      |
| ------------- | ------ | -------------------------------- |
| `code`        | string | High-level error category        |
| `description` | string | Human-readable error description |
| `sub_code`    | string | Detailed error code              |

## Common Use Cases

1. **Event Tracking** — Monitor delivery of composing indicators or typing events (rare use case)
2. **Debugging Event Sending** — Identify when events fail to deliver to specific channels
3. **Channel Capability Testing** — Determine which channels successfully support event delivery

Note: Since most apps don't send events (they send messages), this trigger is rarely needed. Most implementations only use `MESSAGE_DELIVERY` and ignore `EVENT_DELIVERY`.

## Example Callback Payload

### Success: Event Delivered

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:30:45.456Z",
  "event_time": "2024-06-15T14:30:45.123Z",
  "project_id": "PROJECT123",
  "event_delivery_report": {
    "event_id": "01H9876543...",
    "conversation_id": "01H5555555...",
    "status": "DELIVERED",
    "channel_identity": {
      "channel": "WHATSAPP",
      "identity": "46732001122",
      "app_id": "01H1234567..."
    },
    "contact_id": "01H3333333...",
    "metadata": "",
    "processing_mode": "CONVERSATION"
  }
}
```

### Failure: Unsupported on Channel

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:31:00.789Z",
  "project_id": "PROJECT123",
  "event_delivery_report": {
    "event_id": "01H8888888...",
    "conversation_id": "01H5555555...",
    "status": "FAILED",
    "channel_identity": {
      "channel": "SMS",
      "identity": "15551234567",
      "app_id": "01H1234567..."
    },
    "contact_id": "01H3333333...",
    "reason": {
      "code": "UNSUPPORTED_CONTENT",
      "description": "SMS does not support sending events",
      "sub_code": "CHANNEL_LIMITATION"
    },
    "processing_mode": "CONVERSATION"
  }
}
```

### Queued on Channel

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T15:00:00.123Z",
  "project_id": "PROJECT123",
  "event_delivery_report": {
    "event_id": "01H7777777...",
    "conversation_id": "01H5555555...",
    "status": "QUEUED_ON_CHANNEL",
    "channel_identity": {
      "channel": "RCS",
      "identity": "15551234567",
      "app_id": "01H1234567..."
    },
    "contact_id": "01H3333333...",
    "metadata": "",
    "processing_mode": "CONVERSATION"
  }
}
```

## Key Points

1. **Rarely Used** — Most apps never send events, only receive them via `EVENT_INBOUND`, making this trigger uncommon
2. **Limited Channel Support** — Only WhatsApp and RCS support app-initiated events; SMS, MMS, and most other channels don't
3. **No Read Receipts** — Unlike messages, events don't have a `READ` status; only `DELIVERED` or `FAILED`
4. **Composing Indicators** — The main use case is sending "agent is typing" indicators in customer service applications
5. **Event Types** — Currently, only composing/typing events can be sent by apps; other event types are receive-only
6. **Lightweight** — Events don't count against message quotas and aren't stored in conversation history
7. **Optional Monitoring** — You can safely ignore this trigger if your app doesn't send events; focus on `MESSAGE_DELIVERY` instead
