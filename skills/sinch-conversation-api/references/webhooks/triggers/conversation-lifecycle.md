# Conversation Lifecycle Triggers

← [Back to Conversation API SKILL.md](../../../SKILL.md)

**Sections:** [Overview](#overview) | [CONVERSATION_START](#conversation_start) | [CONVERSATION_STOP](#conversation_stop) | [CONVERSATION_DELETE](#conversation_delete) | [Key Points](#key-points)

## Overview

Conversation lifecycle triggers notify you when conversations are created, ended, or deleted. These triggers help you track conversation sessions, manage conversation state, and perform cleanup or analytics when conversations conclude.

The three lifecycle triggers are:

- `CONVERSATION_START` — New conversation initiated
- `CONVERSATION_STOP` — Conversation ended/closed
- `CONVERSATION_DELETE` — Conversation deleted from system

## CONVERSATION_START

### When It Fires

- First message sent or received in a conversation (inbound or outbound)
- New conversation explicitly created via API
- Conversation created when contact first interacts with your app

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:20:00.123Z",
  "project_id": "PROJECT123",
  "conversation_start_notification": {
    "conversation": {
      "id": "01H5555555...",
      "app_id": "01H1234567...",
      "contact_id": "01H3333333...",
      "last_received": "2024-06-15T14:20:00.000Z",
      "active_channel": "WHATSAPP",
      "active": true,
      "metadata": "",
      "active_channel_senders": [
        {
          "channel_identity": {
            "channel": "WHATSAPP",
            "identity": "46732001122"
          }
        }
      ]
    }
  }
}
```

### Key Fields

| Field                                 | Description                               |
| ------------------------------------- | ----------------------------------------- |
| `conversation.id`                     | Unique conversation identifier            |
| `conversation.contact_id`             | Contact participating in the conversation |
| `conversation.active_channel`         | Channel the conversation started on       |
| `conversation.active`                 | Always `true` for new conversations       |
| `conversation.metadata`               | Custom metadata (if set)                  |
| `conversation.active_channel_senders` | Active channel endpoints                  |

### Common Use Cases

1. **Conversation Analytics** — Track when new conversations begin for volume metrics
2. **Agent Assignment** — Route new conversations to available customer service agents
3. **CRM Integration** — Create conversation records in external CRM systems
4. **Session Initialization** — Set up conversation context in your application state
5. **Welcome Messages** — Trigger automated welcome messages (though you can also do this by detecting first `MESSAGE_INBOUND`)
6. **Channel Tracking** — Log which channel initiated the conversation

## CONVERSATION_STOP

### When It Fires

- Conversation explicitly stopped via API (`PATCH /v1/projects/{project_id}/conversations/{conversation_id}` with `active: false`)
- Automatic timeout after inactivity (configurable per app)
- Manual closure by agent or system

Note: Does not fire automatically when user stops messaging; you must explicitly stop the conversation.

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T16:45:30.456Z",
  "project_id": "PROJECT123",
  "conversation_stop_notification": {
    "conversation": {
      "id": "01H5555555...",
      "app_id": "01H1234567...",
      "contact_id": "01H3333333...",
      "last_received": "2024-06-15T16:30:00.000Z",
      "active_channel": "WHATSAPP",
      "active": false,
      "metadata": "issue_resolved",
      "active_channel_senders": [
        {
          "channel_identity": {
            "channel": "WHATSAPP",
            "identity": "46732001122"
          }
        }
      ]
    }
  }
}
```

### Key Fields

| Field                        | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `conversation.active`        | Always `false` for stopped conversations         |
| `conversation.last_received` | Timestamp of last message                        |
| `conversation.metadata`      | Use to store closure reason or resolution status |

### Common Use Cases

1. **Conversation Analytics** — Calculate conversation duration and resolution time
2. **Agent Release** — Free up agents by marking conversations as complete
3. **Follow-up Triggers** — Schedule follow-up surveys or feedback requests
4. **Reporting** — Generate conversation summary reports
5. **Archival** — Archive conversation data to long-term storage
6. **Session Cleanup** — Clear in-memory conversation state or caches

## CONVERSATION_DELETE

### When It Fires

- Conversation explicitly deleted via API (`DELETE /v1/projects/{project_id}/conversations/{conversation_id}`)
- Never fires automatically; must be triggered by explicit API call

### Callback Structure

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T18:00:00.789Z",
  "project_id": "PROJECT123",
  "conversation_delete_notification": {
    "conversation_id": "01H5555555..."
  }
}
```

### Key Fields

| Field             | Description                    |
| ----------------- | ------------------------------ |
| `conversation_id` | ID of the deleted conversation |

Note: The callback only includes the conversation ID, not full conversation details, since the conversation is already deleted.

### Common Use Cases

1. **Cleanup Synchronization** — Remove conversation records from external databases
2. **Audit Logging** — Log conversation deletion events for compliance
3. **Cache Invalidation** — Clear cached conversation data from application caches
4. **GDPR Compliance** — Track deletion requests for data privacy compliance
5. **Reference Cleanup** — Remove conversation references from related records (tickets, notes, etc.)

## Key Points

### CONVERSATION_START

1. **First Touchpoint** — Fires on the very first message (inbound or outbound) in a new conversation
2. **Unique per Conversation** — Each conversation ID only fires this trigger once
3. **Active Channel** — The `active_channel` shows which channel initiated the conversation
4. **Contact Association** — Always associated with a single `contact_id`; group conversations not supported

### CONVERSATION_STOP

5. **Manual Stop Required** — Does not fire automatically; you must call the API to stop the conversation
6. **Reactivation** — Stopped conversations can be reactivated by setting `active: true` again (will fire `CONVERSATION_START` again)
7. **Active Field** — Check `conversation.active` to differentiate from `CONVERSATION_START` notifications

### CONVERSATION_DELETE

8. **Permanent Action** — Deletion is permanent; the conversation cannot be recovered
9. **Minimal Payload** — Only includes `conversation_id`; retrieve full conversation details before deletion if needed
10. **Manual Deletion Only** — Never fires automatically; always requires explicit API call

### General

11. **Metadata Tracking** — Use `metadata` field to store conversation context (e.g., ticket ID, order number, closure reason)
12. **Channel Switching** — If a conversation switches channels (e.g., RCS → SMS fallback), the lifecycle triggers still reference the same conversation ID
13. **Message History** — Stopping or deleting a conversation removes it from active queries but doesn't necessarily delete message history (depends on retention settings)
