> **Not a schema.** This file describes when to use Consent Management, how it is enabled, and
> its pitfalls. For payload shape (field names, nesting, encodings, enums), refer to the
> canonical `developers.sinch.com` docs linked from the parent [SKILL.md](../SKILL.md) before
> writing code or prose that states payload structure.

# Consent Management Reference

Consent Management is an optional, **per-app** add-on. It inspects inbound (MO) messages for opt-in/opt-out **keywords**, records the result in consent lists, sends an auto-reply, fires `OPT_IN`/`OPT_OUT` callbacks, and — in one of its two modes — blocks outbound (MT) messages to opted-out recipients.

## When to Use

- Handling `STOP` / `START` / `UNSUBSCRIBE` keywords and other opt-out flows
- Building or auditing a suppression list for a Conversation API app
- Deciding between Sinch-side blocking and application-side enforcement
- Diagnosing missing or duplicated `OPT_IN` / `OPT_OUT` callbacks
- Choosing `message_content_type` on outbound messages

Without Consent Management enabled, a text such as `STOP` is **only a regular inbound message** — it fires `MESSAGE_INBOUND`, not `OPT_OUT`, and your application must detect it.

## Consent Lists

Opt-out data is stored in lists that decide whether a message can be sent:

| List | Blocks | Applies to messages with |
|---|---|---|
| `OPT_OUT_ALL` | All message types (standard opt-out) | Any message |
| `OPT_OUT_MARKETING` | Marketing messages only | `message_content_type: CONTENT_MARKETING` |
| `OPT_OUT_NOTIFICATION` | Notification messages only | `message_content_type: CONTENT_NOTIFICATION` |

`message_content_type` is optional on outbound messages, but **set it** — it is how the system tells marketing from notification traffic. A message sent with no content type is evaluated against `OPT_OUT_ALL` only.

## Processing Types (Restriction Modes)

| | **Primary** | **Secondary** |
|---|---|---|
| Sinch blocks MT to opted-out recipients | **Yes** | **No** |
| Auto-reply sent | Yes | Yes |
| `OPT_IN` / `OPT_OUT` callbacks | Yes | Yes |
| Your responsibility | Handle callbacks as needed | **You must** stop sending, from the callbacks |

**Primary-mode timing:** the blocklist refreshes **every 10 minutes**, so blocking can begin up to 10 minutes after the opt-out keyword is detected — messages sent in that window can still be delivered. **Removal** from the blocklist on opt-in is immediate.

## Enabling It (Provisioning API)

Consent Management is set when the Conversation API app is created, through the Provisioning API **Create bundle** endpoint. There is no Conversation API endpoint for it.

```
POST https://provisioning.api.sinch.com/v1/projects/{projectId}/bundles
```

`convApp.consentManagerSettings.mode` takes:

| `mode` | Effect |
|---|---|
| `PRIMARY` | Consent Management on; Sinch blocks MT to opted-out recipients |
| `SECONDARY` | Consent Management on; no blocking — your app acts on the callbacks |
| `DISABLED` | Consent Management off |

Request fields, nesting, and enums must come from the authoritative [Create bundle](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/bundles/bundlesbundlescontroller_create_v1.md) doc — do not lift them from this file. Notable points:

- `region` is `US`, `EU` or `BR`, and must match the region the app will be used in.
- Either `convApp.name` or the root `name` must be set, or the request fails.
- `convApp.webhooks[]` defines the new app's Conversation API webhooks. Include the `OPT_IN` and `OPT_OUT` triggers — **Secondary mode depends on them**.
- `mode` is required inside `consentManagerSettings`.
- The root `webhooks[]` are Provisioning API webhooks. Subscribe `BUNDLE_DONE` to learn when provisioning finished.
- The response is `201` with `state` of `IN_PROGRESS` / `DONE` / `FAILED`. It is usually still `IN_PROGRESS`, so wait for `BUNDLE_DONE` rather than treating the response as final.

Illustrative shape only — fetch the canonical doc before writing the real payload:

```jsonc
{
  "name": "...",
  "region": "EU",
  "convApp": {
    "name": "...",
    "webhooks": [ { "target": "...", "secret": "...", "triggers": ["MESSAGE_INBOUND", "OPT_IN", "OPT_OUT"] } ],
    "consentManagerSettings": { "mode": "PRIMARY" }
  },
  "webhooks": [ { "target": "...", "secret": "...", "triggers": ["BUNDLE_DONE"] } ]
}
```

## How Keyword Matching Works

- **Exact match only** — the keyword must be the entire message. `stop` matches; `stop now please` does not.
- **Case-insensitive** — `Stop`, `STOP` and `stoP` all match.
- Free-text requests ("please stop texting me") are **not** caught.

On a match, in order: the consent list is updated → an auto-reply is sent to the end user → the `OPT_IN` or `OPT_OUT` callback is delivered.

## Default Keywords and Auto-Replies

Defaults exist in English, Spanish and Portuguese. English:

| List | Opt-out | Opt-in |
|---|---|---|
| ALL | `STOP`, `UNSUBSCRIBE` | `START`, `SUBSCRIBE` |
| MARKETING | `STOP MARKETING`, `UNSUBSCRIBE MARKETING` | `START MARKETING`, `SUBSCRIBE MARKETING` |
| NOTIFICATION | `STOP NOTIFICATION`, `UNSUBSCRIBE NOTIFICATION` | `START NOTIFICATION`, `SUBSCRIBE NOTIFICATION` |

Spanish uses `DETENER` / `SALIR` (out) and `VOLVER` / `RECIBIR` (in); Portuguese uses `PARAR` / `CANCELAR` (out) and `VOLTAR` / `RECEBER` (in), each with the same `MARKETING` / `NOTIFICAÇÃO` suffixes. For the complete per-language keyword and auto-reply text, fetch [Consent Management](https://developers.sinch.com/docs/conversation/consent-management.md).

## Customization

Keywords and auto-replies can be customized per language (ISO language code), but **there is currently no API for doing so.** The Create bundle endpoint only sets the consent `mode`, so apps enabled through the API use the defaults above. **Do not suggest or invent an endpoint for keyword or auto-reply customization.**

## Callbacks

Consent events arrive on the `OPT_IN` and `OPT_OUT` webhook triggers. For when they fire, the payload fields, status enums, and the WhatsApp multiple-callback case, see [webhooks/triggers/opt-inout.md](webhooks/triggers/opt-inout.md) and the canonical [Callbacks & Webhooks](https://developers.sinch.com/docs/conversation/callbacks.md) doc.

In **Secondary** mode these callbacks are your only signal — the app must record the opt-out and stop sending.

## WhatsApp Business-Scoped User IDs

Meta's WhatsApp Usernames feature introduces business-scoped user IDs, which appear as `user_id` and `parent_user_id` alongside `phone_number`.

The consent logic is unchanged; what changes is which identities get registered. When a WhatsApp consent keyword is detected, **each identity present is registered individually**, and each registration produces **its own callback**. Expect several `OPT_OUT` callbacks for one WhatsApp opt-out, and key the suppression list on all of them. Field presence and rollout status: [WhatsApp User ID](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/user-id.md).

## Fees

- Processed MO messages: **no extra charge**.
- Auto-reply messages: charged as normal **MT** messages.

## Gotchas and Best Practices

- **Always set `message_content_type`** so marketing/notification opt-outs are honored precisely instead of collapsing to `OPT_OUT_ALL`.
- **Primary mode is not instant.** Up to 10 minutes of send-through is expected after an opt-out; don't treat a delivered message in that window as a bug.
- **Secondary mode blocks nothing.** If the app isn't acting on callbacks, opted-out recipients keep receiving messages.
- **Deduplicate on `request_id`.** Webhooks are retried — make handlers idempotent.
- **`contact_id` is empty in `DISPATCH` mode.** Key records on `channel` + `identity` instead.
- **Handle non-success statuses.** `*_FAILED` and `*_STATUS_UNSPECIFIED` exist; the latter means the channel doesn't support opt-in/opt-out notifications.
- **Missing callbacks:** check that `OPT_IN`/`OPT_OUT` are among the webhook's triggers, that the app's mode is not `DISABLED`, and that the channel supports those notification types.
- Consent lists can also be read and bulk-populated through public endpoints — see the [Conversation API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation.md) and the Batch API `POST /consents` endpoint in [batch.md](batch.md).

## Canonical Sources

- [Consent Management](https://developers.sinch.com/docs/conversation/consent-management.md)
- [Provisioning API: Create bundle](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/bundles/bundlesbundlescontroller_create_v1.md)
- [Callbacks & Webhooks](https://developers.sinch.com/docs/conversation/callbacks.md)
- [WhatsApp business-scoped user IDs](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/user-id.md)
