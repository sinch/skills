# MESSAGE_INBOUND Trigger

← [Back to Conversation API SKILL.md](../../../SKILL.md)

## Overview

The `MESSAGE_INBOUND` trigger fires when your Conversation API app receives an inbound message from a contact on any channel (SMS, WhatsApp, RCS, etc.). This is the primary trigger for building conversational applications that respond to customer messages.

## When It Fires

- A contact sends a message to your app through any connected channel
- The message can be text, media, location, choice response, or other channel-specific message types
- Fires in near real-time when Sinch receives the message from the channel

## Callback Structure

The webhook callback contains a `message` object with these key fields:

| Field              | Type      | Description                                                    |
| ------------------ | --------- | -------------------------------------------------------------- |
| `id`               | string    | Unique message identifier                                      |
| `conversation_id`  | string    | Conversation this message belongs to                           |
| `contact_id`       | string    | Contact who sent the message                                   |
| `channel`          | string    | Channel the message came from (e.g., `WHATSAPP`, `SMS`, `RCS`) |
| `direction`        | string    | Always `TO_APP` for inbound messages                           |
| `contact_message`  | object    | The actual message content                                     |
| `metadata`         | string    | Optional metadata attached to the message                      |
| `accept_time`      | timestamp | When Sinch received the message                                |
| `channel_identity` | object    | Channel-specific sender information                            |

### Contact Message Types

The `contact_message` field contains the message payload. The structure varies by message type:

**Text Message:**

```json
{
  "text_message": {
    "text": "Hello, I need help with my order"
  }
}
```

**Media Message:**

```json
{
  "media_message": {
    "url": "https://example.com/image.jpg",
    "thumbnail_url": "https://example.com/thumb.jpg"
  }
}
```

**Location Message:**

```json
{
  "location_message": {
    "title": "My Location",
    "label": "Home",
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

**Choice Response Message (from buttons/quick replies):**

```json
{
  "choice_response_message": {
    "message_id": "01HXXX...",
    "postback_data": "buy_product_123"
  }
}
```

**Reply Message (quoted/threaded reply):**

```json
{
  "reply_message": {
    "message_id": "01HXXX...",
    "text_message": { "text": "Thanks!" }
  }
}
```

## Common Use Cases

1. **Customer Service Chatbots** — receive customer inquiries and respond with automated messages or agent routing
2. **Order Status Requests** — process keywords like "STATUS" and send order updates
3. **Lead Generation** — capture inbound messages from marketing campaigns and create leads in your CRM
4. **Two-Way Conversations** — enable bidirectional messaging flows for support, sales, or notifications
5. **Message Analysis** — process inbound messages for sentiment analysis, intent classification, or keyword detection
6. **Opt-In Collection** — capture consent messages (e.g., "YES") to opt users into promotional messaging

## Example Callback Payload

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:23:45.123Z",
  "event_time": "2024-06-15T14:23:44.890Z",
  "project_id": "PROJECT123",
  "message": {
    "id": "01H9876543...",
    "conversation_id": "01H5555555...",
    "contact_id": "01H3333333...",
    "channel": "WHATSAPP",
    "direction": "TO_APP",
    "contact_message": {
      "text_message": {
        "text": "Hi, I need help with my order #12345"
      }
    },
    "channel_identity": {
      "channel": "WHATSAPP",
      "identity": "46732001122",
      "app_id": "01H1234567..."
    },
    "conversation_channel": "WHATSAPP",
    "accept_time": "2024-06-15T14:23:45.123Z",
    "sender_id": "46732001122"
  },
  "message_metadata": ""
}
```

The `contact_message` field varies by type — see Contact Message Types above for `media_message`, `location_message`, `choice_response_message`, and `reply_message` structures.

## Key Points

1. **Universal Trigger** — Works across all channels (SMS, WhatsApp, RCS, MMS, Viber, Messenger, etc.)
2. **Message Type Handling** — Check `contact_message` for the specific message type and handle accordingly
3. **Button/Quick Reply Responses** — Use `choice_response_message` to capture user selections with `postback_data`
4. **Media Processing** — For `media_message`, download the media from the provided URL (may require authentication for some channels)
5. **Conversation Context** — Use `conversation_id` to maintain context across multiple messages
6. **Contact Identification** — Use `contact_id` (persistent) or `channel_identity.identity` (channel-specific) to identify the sender
7. **Response Timing** — Respond to inbound messages promptly, especially on channels like WhatsApp that enforce 24-hour session windows
8. **Error Handling** — Not all channels support all message types; handle unsupported message types gracefully
9. **Metadata** — Check `metadata` field for any custom data you attached to the conversation or contact
10. **Channel Specifics** — Different channels have different capabilities; `channel` field helps you adapt responses accordingly
