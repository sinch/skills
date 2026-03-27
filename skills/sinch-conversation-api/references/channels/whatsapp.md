# WhatsApp Channel Reference

← [Back to Conversation API SKILL.md](../../SKILL.md)

WhatsApp Business messaging is available through the Sinch Conversation API. Send text, media, template, and interactive messages using the unified API format. WhatsApp has strict rules around messaging windows and template approval.

## Prerequisites

1. A provisioned WhatsApp Business sender (via Sinch Build Dashboard or Provisioning API).
2. Meta-approved WhatsApp templates for outbound messaging outside the 24-hour window.
3. A Conversation API app in the correct region.

## SDK Reference

- [Node.js](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## 24-Hour Customer Service Window

- A user sending a message to your business opens a 24-hour window.
- Each new user message resets the 24-hour timer.
- Within the window: send freeform messages (text, media, interactive).
- Outside the window: **must** use an approved template message.
- Freeform messages outside the window always fail, even with opt-in.

## Template Messages

Templates are pre-approved message formats registered with Meta. Required for:
- First outbound contact (no open window)
- Re-engaging after 24-hour window closes
- Marketing, utility, and authentication use cases

`template_id` is the template **name**, not the numeric identifier. See [WhatsApp Template Support](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/template-support.md) and [references/templates.md](../templates.md) for structure and examples.

Template components: header (text, media, document), body, footer, buttons (quick reply, CTA, copy code), interactive elements. Each component may use placeholders fulfilled via `parameters`.

### Template Approval Process

1. Create templates via Sinch Build Dashboard or Provisioning API.
2. Templates are submitted to Meta for review.
3. Meta approves or rejects (typically within 24 hours).
4. Categories: MARKETING, UTILITY, AUTHENTICATION.

## Opt-In Requirements

- All marketing, utility, and authentication conversations require user opt-in.
- Opt-in can be collected via any channel (SMS, web form, email, in-app).
- Permanent opt-in allows sending templates outside the window.
- Opt-in does NOT allow freeform messages outside the window.

## Message Types

| Type                                  | Inside Window | Outside Window |
| ------------------------------------- | ------------- | -------------- |
| Text                                  | Yes           | No             |
| Media (image, video, document, audio) | Yes           | No             |
| Interactive (buttons, lists)          | Yes           | No             |
| Location                              | Yes           | No             |
| Sticker                               | Yes           | No             |
| Template                              | Yes           | Yes            |

## Media Specifications

| Media Type | Formats                         | Max Size |
| ---------- | ------------------------------- | -------- |
| Image      | JPEG, PNG                       | 5 MB     |
| Video      | MP4 (H.264 + AAC)               | 16 MB    |
| Audio      | AAC, MP4, AMR, MPEG, OGG (opus) | 16 MB    |
| Document   | Any valid MIME type             | 100 MB   |
| Sticker    | WebP                            | 100 KB   |

## Message Examples

- **Send WhatsApp text / Fallback patterns** — See [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md). Set `channel` to `WHATSAPP`. For fallback, add `channel_priority_order` and include `SMS_SENDER` in `channel_properties`.
- **WhatsApp message support details** — See [WhatsApp Message Support](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/message-support.md).

## WhatsApp Gotchas

1. **Customer Service Window is strict.** Freeform messages outside 24h always fail. Use templates.
2. **Template name vs ID.** `template_id` expects the template **name**, not numeric ID.
3. **Template rejection.** Meta may reject for vague content, promotional language in utility templates, or policy violations.
4. **Per-message pricing.** Marketing and authentication templates charged on delivery. Utility templates free within session.
5. **Rate limits.** Enforced by WhatsApp based on quality rating and tier. New numbers start at 1K messages/day.
6. **Quality rating matters.** User reports/blocks lower your rating, reducing sending limits. Monitor in Meta Business Manager.
7. **Opt-in is mandatory.** Sending without opt-in risks account suspension.
8. **Media URLs must be publicly accessible.** URLs behind auth or firewalls fail.
9. **Template parameters are positional.** Indexed by position, not name. Ensure order matches definition.

## Links

- [WhatsApp Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/whatsapp.md)
- [WhatsApp Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/set-up.md)
- [WhatsApp Template Support](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/template-support.md)
- [WhatsApp Message Support](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/message-support.md)
- [Provisioning API — WhatsApp Templates](https://developers.sinch.com/docs/provisioning-api/api-reference/provisioning-api/whatsapp-templates.md)
