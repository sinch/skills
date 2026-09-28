> **Summary — not the spec.** This file orients you and links to the authoritative
> `developers.sinch.com` doc; it may lag, omit fields, or simplify nesting. Do **not**
> copy field names, nesting, encodings, or enums from here into shipped code without
> confirming them in the linked doc. See "Source of Truth" in this skill's SKILL.md.

# Conversation webhooks (C#)

Reference for `SinchConversationController` and related helpers. Loaded on-demand from
[SKILL.md](../SKILL.md). This covers the **functions-specific glue** — how inbound webhooks
route to your controller and the typed helpers for reading events. For outbound message bodies
(channels, templates, rich cards, carousels), see the **sinch-conversation-api** skill.

## SinchConversationController

Extend this base class to handle inbound Conversation API webhooks (SMS, WhatsApp, RCS, Messenger, etc.). All handler methods are **optional** — override only the events you need; unhandled events default to returning `Ok()`. The webhook route (`webhook/conversation`) is wired for you.

```csharp
using SinchFunctions.Utils;
using Sinch.Conversation.Hooks;

public class MyConversationController(FunctionContext context, IConfiguration configuration, ILogger<MyConversationController> logger)
    : SinchConversationController(context, configuration, logger)
{
    public override async Task<IActionResult> MessageInbound(MessageInboundEvent callback)
    {
        var text = callback.GetText();
        if (text == "hello")
            await Context.Conversation!.Messages.Send(Reply(callback, "Hi there!"));
        return Ok();
    }
}
```

**Available override methods:**

| Method | Fired when |
|---|---|
| `MessageInbound(MessageInboundEvent)` | A user sends a message (most common) |
| `MessageDelivery(MessageDeliveryReceiptEvent)` | Delivery status changes (QUEUED → DELIVERED / FAILED) |
| `EventInbound(InboundEvent)` | Typing indicators, read receipts, etc. |
| `ConversationStart(ConversationStartEvent)` | New conversation created |
| `ConversationStop(ConversationStopEvent)` | Conversation ended |

## Extension methods on `MessageInboundEvent`

All in the `SinchFunctions.Utils` namespace:

```csharp
using SinchFunctions.Utils;

callback.GetText();             // string?
callback.GetMedia();            // MediaMessage?
callback.GetPostbackData();     // postback button data
callback.GetContactId();        // string? — Sinch contact ID
callback.GetConversationId();   // string?
callback.GetChannel();          // string? — "SMS", "WHATSAPP", "MESSENGER", etc.
callback.GetIdentity();         // string? — sender's phone/PSID
callback.GetTo();               // string? — your Sinch number
callback.GetLocation();         // LocationMessage?

callback.IsTextMessage();       // bool
callback.IsMediaMessage();      // bool
callback.IsPostback();          // bool
```

## Sending replies

The base class's `Reply(inbound, text)` builds a reply from an inbound event, auto-filling `app_id`, recipient channel/identity, and sender ID:

```csharp
await Context.Conversation!.Messages.Send(Reply(callback, "Thanks for your message!"));
```

Other base-class helpers: `CreateMessage()`, `CreateMessage(inbound)`. Static equivalents outside a controller (namespace `SinchFunctions.Utils`): `ConversationMessage.TextReply(inbound, text, from)`, `ConversationMessage.CreateSms(appId, to, text, sender)`, `ConversationMessage.CreateWhatsApp(appId, to, text)`.

One controller handles every channel — dispatch on `callback.GetChannel()` (`"SMS"`, `"WHATSAPP"`, `"MESSENGER"`, ...) when the reply needs to differ per channel; otherwise ignore it and let `Reply()` route back on the same one.

## Required environment variables

`CONVERSATION_APP_ID`, plus the project credentials (`PROJECT_ID`, `PROJECT_ID_API_KEY`, `PROJECT_ID_API_SECRET`) and `CONVERSATION_REGION` (`"US"` default, `"EU"`, `"BR"`) — see the **sinch-authentication** and **sinch-conversation-api** skills. Store secrets via `sinch secrets add CONVERSATION_APP_ID your-app-id`.

## Related

- [context-services.md](context-services.md) — Cache / Storage / Database
- [Build an SMS responder guide](https://developers.sinch.com/docs/functions/functions/guides/build-an-sms-responder.md)
- [Conversation API callbacks](https://developers.sinch.com/docs/conversation/callbacks.md)
