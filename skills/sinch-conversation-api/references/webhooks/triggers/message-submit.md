# MESSAGE_SUBMIT Trigger

← [Back to Conversation API SKILL.md](../../../SKILL.md)

## Overview

The `MESSAGE_SUBMIT` trigger fires when your message is successfully submitted to a channel provider, before final delivery confirmation. This is an early-stage notification that the message has left Sinch's systems and is in transit to the recipient. It's distinct from `MESSAGE_DELIVERY` which provides later-stage delivery status updates.

## When It Fires

- Immediately after your message is successfully submitted to the channel provider (e.g., WhatsApp, SMS aggregator)
- Fires before the message is delivered to the recipient's device
- Does not fire if message submission fails (e.g., invalid format, unauthorized sender)

## Callback Structure

The webhook callback contains a `message_submit_notification` object with these key fields:

| Field                                | Type   | Description                                                    |
| ------------------------------------ | ------ | -------------------------------------------------------------- |
| `submitted_message`                  | object | Details about the submitted message                            |
| `submitted_message.message_id`       | string | ID of the submitted message                                    |
| `submitted_message.conversation_id`  | string | Conversation the message belongs to                            |
| `submitted_message.channel`          | string | Channel the message was submitted to (e.g., `WHATSAPP`, `SMS`) |
| `submitted_message.contact_id`       | string | Contact who will receive the message                           |
| `submitted_message.metadata`         | string | Metadata attached to the message                               |
| `submitted_message.channel_identity` | object | Channel-specific recipient information                         |

## Common Use Cases

1. **Early Confirmation** — Provide immediate feedback that a message has been accepted by the channel, before waiting for delivery confirmation
2. **Message Tracking** — Log message submission for audit trails and debugging
3. **Rate Limiting** — Track submission rates to channels to stay within sending limits
4. **Asynchronous Flows** — Trigger follow-up actions immediately after submission without waiting for delivery
5. **Channel Analytics** — Monitor which channels messages are being submitted to for capacity planning
6. **Debugging** — Identify when messages are submitted but not delivered by comparing submit and delivery webhooks

## Example Callback Payload

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:24:30.456Z",
  "event_time": "2024-06-15T14:24:30.123Z",
  "project_id": "PROJECT123",
  "message_submit_notification": {
    "submitted_message": {
      "message_id": "01H9876543...",
      "conversation_id": "01H5555555...",
      "channel": "WHATSAPP",
      "channel_identity": {
        "channel": "WHATSAPP",
        "identity": "46732001122",
        "app_id": "01H1234567..."
      },
      "contact_id": "01H3333333...",
      "metadata": "order_confirmation_12345"
    }
  }
}
```

### Example: SMS Submission

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T15:10:45.789Z",
  "project_id": "PROJECT123",
  "message_submit_notification": {
    "submitted_message": {
      "message_id": "01H8888888...",
      "conversation_id": "01H5555555...",
      "channel": "SMS",
      "channel_identity": {
        "channel": "SMS",
        "identity": "15551234567",
        "app_id": "01H1234567..."
      },
      "contact_id": "01H3333333...",
      "metadata": "appointment_reminder_2024-06-20"
    }
  }
}
```

### Example: RCS Submission

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T16:20:00.123Z",
  "project_id": "PROJECT123",
  "message_submit_notification": {
    "submitted_message": {
      "message_id": "01H7777777...",
      "conversation_id": "01H5555555...",
      "channel": "RCS",
      "channel_identity": {
        "channel": "RCS",
        "identity": "15551234567",
        "app_id": "01H1234567..."
      },
      "contact_id": "01H3333333...",
      "metadata": ""
    }
  }
}
```

## Key Points

1. **Not a Delivery Guarantee** — This trigger only confirms submission to the channel, not that the message reached the recipient's device
2. **Comes Before Delivery** — Fires before `MESSAGE_DELIVERY` callbacks; use both to track the full message lifecycle
3. **Channel-Specific** — The `channel` field shows which specific channel the message was submitted to (useful for multi-channel apps)
4. **No Status Field** — Unlike `MESSAGE_DELIVERY`, there's no `status` field; submission is always successful when this trigger fires
5. **Metadata Passthrough** — The `metadata` field from your original send request is included, enabling correlation with your internal systems
6. **One Submit Per Message** — Each message triggers this callback exactly once (unlike delivery reports which can have multiple status updates)
7. **Not for Failed Submissions** — If message submission fails (e.g., invalid recipient), this trigger doesn't fire; check API response or error logs instead
8. **Contact ID Included** — Use `contact_id` to identify the recipient in your system, especially for multi-contact conversations
9. **Limited Use Case** — Most apps only need `MESSAGE_DELIVERY`; use `MESSAGE_SUBMIT` only if you specifically need early-stage confirmation
10. **Channel Identity** — The `channel_identity` shows the exact channel endpoint (e.g., specific phone number for SMS, WhatsApp ID for WhatsApp)
