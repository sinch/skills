> **Summary — not the spec.** This file orients you and links to the authoritative
> `developers.sinch.com` doc; it may lag, omit fields, or simplify nesting. Do **not**
> copy field names, nesting, encodings, or enums from here into shipped code without
> confirming them in the linked doc. See "Source of Truth" in this skill's SKILL.md.

# Conversation webhooks (Node.js)

Reference for handling inbound Conversation API webhooks in a function. Loaded on-demand from
[SKILL.md](../SKILL.md). This covers the **functions-specific glue** — how inbound webhooks
route to your handler and the typed helpers for reading events. For outbound message bodies
(channels, templates, rich cards, carousels), see the **sinch-conversation-api** skill.

**Simple approach** — export a handler function; body shape depends on the event, so narrow it before use:

```typescript
export async function conversationWebhook(context, request) {
  const body = request.body; // MESSAGE_INBOUND, MESSAGE_DELIVERY, etc. — narrow on body.event
  return { statusCode: 200, body: { ok: true } };
}
```

**Structured approach** — extend `ConversationController` and override the events you need; the webhook path (`/webhook/conversation`) is wired for you:

```typescript
import type { MessageInboundEvent } from '@sinch/functions-runtime';
import { ConversationController, getText } from '@sinch/functions-runtime';

class Bot extends ConversationController {
  async handleMessageInbound(event: MessageInboundEvent): Promise<void> {
    const text = getText(event);
    if (!text) return;
    await this.conversation?.messages.send({
      sendMessageRequestBody: this.reply(event, `Echo: ${text}`),
    });
  }
}
```

**Override methods** (all `async ... : Promise<void>`, all optional): `handleMessageInbound(event: MessageInboundEvent)`, `handleMessageDelivery(event: MessageDeliveryEvent)`, `handleEventInbound(event: EventInboundEvent)`, `handleConversationStart(event: ConversationStartEvent)`, `handleConversationStop(event: ConversationStopEvent)`.

**Reply helpers** — `this.reply(inbound, text)` builds a reply body from an inbound event (auto-fills the sender); `this.createMessage()` and `this.createReply(inbound)` return a `ConversationMessageBuilder` for more control. Static equivalents outside a controller: `ConversationMessage`, `textReply`, `createSms`, `createWhatsApp`, `createMessenger`, `createChannelMessage`, all exported from `@sinch/functions-runtime`.

**Event helpers** (all take the event, all exported from `@sinch/functions-runtime`):

| Helper | Returns |
|---|---|
| `getText(event)` | `string \| undefined` |
| `getMedia(event)` | media properties or `undefined` |
| `getPostbackData(event)` | postback data or `undefined` |
| `getContactId(event)` | `string \| undefined` |
| `getConversationId(event)` | `string \| undefined` |
| `getChannel(event)` | `string \| undefined` — `"SMS"`, `"WHATSAPP"`, etc. |
| `getIdentity(event)` | `string \| undefined` — sender's phone/PSID |
| `getTo(event)` | `string \| undefined` — your Sinch number |
| `getLocation(event)` | location data or `undefined` |
| `isTextMessage(event)` / `isMediaMessage(event)` / `isPostback(event)` | `boolean` |

**Routing:** the webhook path is `/webhook/conversation` (export name `conversationWebhook`), NOT `/conversation`. The `/webhook/<service>` prefix is special-cased to `<service>Webhook` camelCase.

## Links

- [Handlers (URL-to-export mapping)](https://developers.sinch.com/docs/functions/functions/concepts/handlers.md)
- [Build an SMS responder](https://developers.sinch.com/docs/functions/functions/guides/build-an-sms-responder.md)
