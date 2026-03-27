# EVENT_INBOUND Trigger

← [Back to Conversation API SKILL.md](../../../SKILL.md)

## Overview

The `EVENT_INBOUND` trigger fires when your Conversation API app receives an inbound event from a contact on a channel. Events are non-message interactions such as typing indicators, composing notifications, payment status updates, and shortlink activations. Unlike messages, events typically don't require a direct response but provide context about user activity.

## When It Fires

- Contact starts composing a message (typing indicator)
- Payment initiated through WhatsApp Pay or similar channel features
- Shortlink clicked by a recipient
- Channel-specific events (varies by channel)

## Callback Structure

The webhook callback contains an `event` object with these key fields:

| Field                   | Type      | Description                                               |
| ----------------------- | --------- | --------------------------------------------------------- |
| `id`                    | string    | Unique event identifier                                   |
| `conversation_id`       | string    | Conversation this event belongs to                        |
| `contact_id`            | string    | Contact who triggered the event                           |
| `channel`               | string    | Channel the event came from (e.g., `WHATSAPP`, `RCS`)     |
| `direction`             | string    | Always `TO_APP` for inbound events                        |
| `contact_event`         | object    | The event payload (for events initiated by contact)       |
| `contact_message_event` | object    | Message-related event payload (for events about messages) |
| `accept_time`           | timestamp | When Sinch received the event                             |
| `channel_identity`      | object    | Channel-specific sender information                       |

### Event Types

**Composing Events (Typing Indicators):**

```json
{
  "contact_event": {
    "composing_event": {}
  }
}
```

**Payment Status Events:**

```json
{
  "contact_message_event": {
    "generic_event": {
      "payload": {
        "payment_status": "PENDING"
      }
    },
    "message_id": "01HXXX..."
  }
}
```

**Shortlink Activation Events:**

```json
{
  "contact_message_event": {
    "generic_event": {
      "payload": {
        "shortlink_id": "abc123xyz"
      }
    },
    "message_id": "01HXXX..."
  }
}
```

## Common Use Cases

1. **Real-Time Presence Indicators** — Show "typing..." or "composing" indicators in customer service dashboards
2. **Payment Tracking** — Monitor WhatsApp Pay transaction status (pending, completed, failed)
3. **Link Analytics** — Track when recipients click on shortlinks in your messages
4. **Engagement Metrics** — Measure recipient interaction beyond just read receipts
5. **Context for Agents** — Display composing indicators to customer service agents so they know to wait for the customer's message
6. **Abandoned Checkout** — Detect when a user starts a payment but doesn't complete it

## Example Callback Payload

### Composing Event (Typing Indicator)

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:30:45.123Z",
  "event_time": "2024-06-15T14:30:44.890Z",
  "project_id": "PROJECT123",
  "event": {
    "id": "01H9876543...",
    "conversation_id": "01H5555555...",
    "contact_id": "01H3333333...",
    "channel": "WHATSAPP",
    "direction": "TO_APP",
    "contact_event": {
      "composing_event": {}
    },
    "channel_identity": {
      "channel": "WHATSAPP",
      "identity": "46732001122",
      "app_id": "01H1234567..."
    },
    "accept_time": "2024-06-15T14:30:45.123Z"
  }
}
```

Other event types (payment status, shortlink activation) use `contact_message_event.generic_event.payload` with channel-specific data. Structure follows the same top-level envelope.

## Key Points

1. **Channel Support Varies** — Not all channels support all event types; composing events are supported by WhatsApp and RCS but not SMS
2. **No Response Required** — Events are informational; you typically don't send a message in response to an event
3. **Composing Event Timing** — Composing events are sent while the user is actively typing, not when they finish
4. **Payment Events** — WhatsApp Pay events require special business account setup and are only available in supported countries
5. **Event vs Message** — Events use the `event` top-level field, not `message`; check `contact_event` or `contact_message_event` for payload
6. **Shortlink Tracking** — Shortlink events require you to use Sinch's URL shortening service when sending messages
7. **Generic Event Payload** — Some events use `generic_event` with a flexible `payload` object containing channel-specific data
8. **Event Persistence** — Events are typically transient and not stored in conversation history like messages are
9. **Rate Limiting** — Be prepared to handle high-frequency composing events during active conversations
10. **Cross-Channel Events** — The same event type may have different payload structures on different channels; always check the channel field
