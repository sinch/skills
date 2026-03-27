# CAPABILITY Trigger

← [Back to Conversation API SKILL.md](../../../SKILL.md)

**Sections:** [Overview](#overview) | [When It Fires](#when-it-fires) | [Callback Structure](#callback-structure) | [Common Use Cases](#common-use-cases) | [Example Callback Payload](#example-callback-payload) | [Key Points](#key-points)

## Overview

The `CAPABILITY` trigger fires when an asynchronous capability check completes. Capability checks determine whether a contact can receive messages on specific channels (e.g., whether a phone number supports WhatsApp or RCS). This trigger is used when you initiate a capability lookup via the API and need to receive the results asynchronously.

## When It Fires

- Asynchronous capability check completes after being initiated via API
- Response received from channel provider about contact's channel availability
- Typically 1-10 seconds after capability check initiated

## Callback Structure

The webhook callback contains a `capability_notification` object with these key fields:

| Field                          | Type   | Description                                            |
| ------------------------------ | ------ | ------------------------------------------------------ |
| `request_id`                   | string | ID from your capability check request                  |
| `contact_id`                   | string | Contact whose capabilities were checked                |
| `channel`                      | string | Channel that was checked (e.g., `WHATSAPP`, `RCS`)     |
| `identity`                     | string | Channel-specific identity checked (e.g., phone number) |
| `capability_status`            | string | Result of the capability check                         |
| `channel_recipient_identities` | array  | Available recipient identities for the channel         |

### Capability Status Values

| Status               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `CAPABILITY_FULL`    | Contact fully supports the channel               |
| `CAPABILITY_PARTIAL` | Contact has limited capability on the channel    |
| `NO_CAPABILITY`      | Contact does not support the channel             |
| `CAPABILITY_UNKNOWN` | Unable to determine capability (transient error) |

### Channel Recipient Identities

When `capability_status` is `CAPABILITY_FULL` or `CAPABILITY_PARTIAL`, this array contains the available channel identities:

```json
"channel_recipient_identities": [
  {
    "channel_identity": {
      "channel": "WHATSAPP",
      "identity": "46732001122"
    },
    "display_name": "John Doe"
  }
]
```

## Common Use Cases

1. **Channel Routing Decisions** — Determine which channels to use for a contact before sending a message
2. **RCS Fallback Logic** — Check if a contact supports RCS before attempting to send rich messages, fallback to SMS if not
3. **WhatsApp Availability** — Verify if a phone number has a WhatsApp account
4. **Channel Preference Updates** — Update contact's preferred channel based on capability results
5. **Bulk Channel Detection** — Check capabilities for large contact lists asynchronously
6. **Real-Time Capability Updates** — Keep contact channel capabilities current in your database
7. **User Registration** — During signup, check which channels the user's phone number supports

## Example Callback Payload

### Full Capability (WhatsApp Available)

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:25:30.456Z",
  "project_id": "PROJECT123",
  "capability_notification": {
    "request_id": "01H9876543...",
    "contact_id": "01H3333333...",
    "channel": "WHATSAPP",
    "identity": "46732001122",
    "capability_status": "CAPABILITY_FULL",
    "channel_recipient_identities": [
      {
        "channel_identity": {
          "channel": "WHATSAPP",
          "identity": "46732001122"
        },
        "display_name": "John Doe"
      }
    ]
  }
}
```

### No Capability (RCS Not Available)

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:26:00.789Z",
  "project_id": "PROJECT123",
  "capability_notification": {
    "request_id": "01H8888888...",
    "contact_id": "01H3333333...",
    "channel": "RCS",
    "identity": "15551234567",
    "capability_status": "NO_CAPABILITY",
    "channel_recipient_identities": []
  }
}
```

### Unknown Capability (Transient Error)

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:27:00.123Z",
  "project_id": "PROJECT123",
  "capability_notification": {
    "request_id": "01H7777777...",
    "contact_id": "01H3333333...",
    "channel": "VIBER",
    "identity": "46732001122",
    "capability_status": "CAPABILITY_UNKNOWN",
    "channel_recipient_identities": []
  }
}
```

### Partial Capability (Limited Features)

```json
{
  "app_id": "01H1234567...",
  "accepted_time": "2024-06-15T14:28:00.456Z",
  "project_id": "PROJECT123",
  "capability_notification": {
    "request_id": "01H6666666...",
    "contact_id": "01H3333333...",
    "channel": "RCS",
    "identity": "15551234567",
    "capability_status": "CAPABILITY_PARTIAL",
    "channel_recipient_identities": [
      {
        "channel_identity": {
          "channel": "RCS",
          "identity": "15551234567"
        }
      }
    ]
  }
}
```

## Key Points

1. **Asynchronous Only** — This trigger is for async capability checks; synchronous checks return immediately in API response
2. **Request ID Correlation** — Use `request_id` to correlate webhook callback with your original capability check request
3. **Channel-Specific** — Each capability check is for a single channel; to check multiple channels, make multiple requests
4. **Contact State** — Store capability results in your contact database to avoid repeated checks
5. **Transient Nature** — Capabilities can change (user installs/uninstalls WhatsApp); re-check periodically for critical flows
6. **Unknown Status Handling** — `CAPABILITY_UNKNOWN` can happen due to network issues or channel provider problems; retry or fallback to alternative channel
7. **Partial Capability** — `CAPABILITY_PARTIAL` means some channel features available but not all; typically safe to treat as available
8. **Display Name** — Some channels (like WhatsApp) return the contact's display name in `channel_recipient_identities`
9. **Performance** — Capability checks take 1-10 seconds; use async checks for better user experience in real-time flows
10. **Rate Limits** — Channel providers may rate limit capability checks; implement caching and exponential backoff
