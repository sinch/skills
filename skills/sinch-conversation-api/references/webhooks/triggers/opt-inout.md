> **Not a schema.** This file describes when the trigger fires and lists notable fields. For
> payload shape (field names, nesting, encodings, enums), refer to the canonical
> `developers.sinch.com` docs linked from the parent [SKILL.md](../../../SKILL.md) before
> writing code or prose that states payload structure.

# OPT_IN and OPT_OUT Triggers

## Overview

The `OPT_IN` and `OPT_OUT` triggers deliver a callback when a contact's opt-in or opt-out is registered for a Conversation API app. There are two sources:

1. **Consent Management** (the main source): an optional per-app feature. It detects opt-in/opt-out **keywords** in inbound (MO) messages, records them in consent lists, sends an auto-reply, and then fires these triggers. For the feature itself — consent lists, modes, enabling, keywords and fees — see [consent-management.md](../../consent-management.md).
2. **Channel-native opt-in/opt-out**: on channels that have their own opt-in/opt-out notification types (for example Viber Business Messages, `VIBERBM`).

Without Consent Management, a text such as `STOP` on SMS does **not** fire these triggers. It arrives only as a normal `MESSAGE_INBOUND`.

## When They Fire (Consent Management)

Consent Management must be enabled on the app. It is set when the app is provisioned through the Provisioning API (`convApp.consentManagerSettings.mode`: `PRIMARY` or `SECONDARY`; `DISABLED` turns it off).

A trigger fires when an inbound message:

- **exactly matches** a configured opt-in or opt-out keyword. The keyword must be the whole message: `STOP` matches, `stop now please` does not.
- Matching is **case-insensitive** (`Stop`, `STOP` and `stoP` all match).

Default keywords (English, Spanish and Portuguese) are used unless custom ones are configured. Some English examples:

| List | Opt-out | Opt-in |
|---|---|---|
| `OPT_OUT_ALL` | `STOP`, `UNSUBSCRIBE` | `START`, `SUBSCRIBE` |
| `OPT_OUT_MARKETING` | `STOP MARKETING`, `UNSUBSCRIBE MARKETING` | `START MARKETING`, `SUBSCRIBE MARKETING` |
| `OPT_OUT_NOTIFICATION` | `STOP NOTIFICATION`, `UNSUBSCRIBE NOTIFICATION` | `START NOTIFICATION`, `SUBSCRIBE NOTIFICATION` |

When a keyword matches, these steps happen in order:

1. The opt-in or opt-out is recorded in the relevant consent list.
2. An auto-reply is sent to the contact. It is billed as a normal MT message.
3. The `OPT_IN` or `OPT_OUT` callback is delivered to every webhook subscribed to that trigger.

### Behavior by mode

| | `PRIMARY` | `SECONDARY` |
|---|---|---|
| Callback fired | Yes | Yes |
| Sinch blocks MT to opted-out recipients | **Yes**. The blocklist refreshes every 10 minutes, so blocking can start up to 10 minutes after the opt-out. Opt-in removal is immediate | **No**. Your application must stop sending, based on the callback |

### WhatsApp business-scoped user IDs

On WhatsApp, a consent keyword can be registered for several identities of the same contact: `phone_number`, `user_id` and `parent_user_id`, whichever are present. **Each registered identity fires its own callback.** Expect several `OPT_OUT` callbacks for one WhatsApp opt-out, and suppress every identity you receive.

## Callback Structure

The top-level fields are `app_id`, `project_id`, `accepted_time` and `event_time`. The details are in `opt_in_notification` (for `OPT_IN`) or `opt_out_notification` (for `OPT_OUT`).

```json
{
  "app_id": "01EB37HMH1M6SV18ASNS3G135H",
  "accepted_time": "2021-06-08T07:54:03.165316Z",
  "event_time": "2021-06-08T07:54:02.112Z",
  "project_id": "",
  "opt_out_notification": {
    "contact_id": "01EKA07N79THJ20WSN6AS30TMW",
    "channel": "VIBERBM",
    "identity": "123456789",
    "status": "OPT_OUT_SUCCEEDED",
    "request_id": "01F7N9TEH11X7B15XQ6VBR04G7",
    "processing_mode": "CONVERSATION"
  }
}
```

`OPT_IN` uses the same structure, with `opt_in_notification` and `OPT_IN_*` statuses.

### Key Fields

| Field        | Type   | Description                                    |
| ------------ | ------ | ---------------------------------------------- |
| `contact_id` | string | Contact who opted in/out                       |
| `channel`    | string | Channel where opt action occurred              |
| `identity`   | string | Channel-specific identity (e.g., phone number) |
| `status`     | string | `OPT_IN_SUCCEEDED` or `OPT_OUT_SUCCEEDED`      |

### Status values

| `OPT_IN` | `OPT_OUT` | Meaning |
|---|---|---|
| `OPT_IN_SUCCEEDED` | `OPT_OUT_SUCCEEDED` | Registration succeeded |
| `OPT_IN_FAILED` | `OPT_OUT_FAILED` | Registration failed. See `error_details` |
| `OPT_IN_STATUS_UNSPECIFIED` | `OPT_OUT_STATUS_UNSPECIFIED` | The underlying channel doesn't support opt-in/opt-out |

## Subscribing

Add `OPT_IN` and/or `OPT_OUT` to the triggers of a webhook, either in `convApp.webhooks` when provisioning or with `POST /v1/projects/{project_id}/webhooks`. An app can have at most five webhooks.

## Common Use Cases

1. **Compliance Management** — Update subscription status when contacts opt in/out via channel UI
2. **CRM Synchronization** — Sync opt-in/opt-out status with external CRM or marketing platforms
3. **Suppression Lists** — Add opted-out contacts to suppression lists to prevent future messaging
4. **Permission Tracking** — Maintain audit trail of consent changes for GDPR/TCPA compliance
5. **Re-engagement Prevention** — Prevent sending marketing messages to opted-out contacts

## Key Points

1. **Consent Management is what makes keyword opt-outs fire these triggers.** Without it, `STOP` and similar texts are just `MESSAGE_INBOUND` messages, and you must detect them yourself.
2. **Exact, whole-message match only.** Free-text requests such as "please stop texting me" do not fire the trigger.
3. **Enforcement depends on the mode.** In `PRIMARY` mode Sinch blocks MT messages, but only after a delay of up to 10 minutes. In `SECONDARY` mode Sinch never blocks, so your application must.
4. **Failure statuses exist.** Handle `*_FAILED` and `*_STATUS_UNSPECIFIED`, not just `*_SUCCEEDED`.
5. **Deduplicate on `request_id`.** Webhooks are retried, so make the handler idempotent.
6. **`contact_id` is empty in `DISPATCH` mode.** Use `channel` + `identity` as the key.
7. **WhatsApp can produce several callbacks per opt-out** (one per identity).
8. **Opt-outs can be partial.** `OPT_OUT_MARKETING` and `OPT_OUT_NOTIFICATION` only block messages sent with the matching `message_content_type` (`CONTENT_MARKETING` / `CONTENT_NOTIFICATION`). A message with no content type falls under `OPT_OUT_ALL`.
9. **Contacts can opt in and out repeatedly.** Store the latest state per identity, ordered by `event_time`.

## Canonical Sources

- [Callbacks: Opt-in / Opt-out](https://developers.sinch.com/docs/conversation/callbacks.md)
- [Consent Management](https://developers.sinch.com/docs/conversation/consent-management.md)
- [WhatsApp business-scoped user IDs](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/user-id)
- [Provisioning API: Create bundle](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/bundles/bundlesbundlescontroller_create_v1)

