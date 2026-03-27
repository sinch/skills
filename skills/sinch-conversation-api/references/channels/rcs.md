# RCS Channel Reference

← [Back to Conversation API SKILL.md](../../SKILL.md)

RCS (Rich Communication Services) enables rich, branded messaging in the native device messaging app — including rich cards, carousels, suggested actions, media messages, location messages, read receipts, and typing indicators. When a device does not support RCS, configure automatic fallback to SMS.

## Prerequisites

1. A provisioned RCS Sender Agent (request via Sinch — requires carrier approval).
2. A Conversation API app in the same region as your RCS Agent.
3. At least one webhook configured for delivery reports and inbound messages.

## SDK Reference

- [Node.js](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## RCS Agents

An RCS Agent is your business identity on RCS — includes brand name, logo, description, and verification status. Agents must be approved by carriers before use. Provisioning is handled through Sinch.

## Message Types

| Message Type | When to Use                     | Key Indicators in User Prompt                                    |
| ------------ | ------------------------------- | ---------------------------------------------------------------- |
| **Text**     | Simple text messages            | "send a message", no special formatting                          |
| **Media**    | Images, videos, PDFs            | "send an image", "share a photo", file/media URLs                |
| **Choice**   | Interactive buttons/suggestions | "with options", "with buttons", "choose between"                 |
| **Card**     | Rich card with image + buttons  | "rich card", "card with image", "product card"                   |
| **Carousel** | Multiple swipeable cards        | "carousel", "swipeable cards", "multiple products"               |
| **Location** | Share coordinates/map           | "send location", "share coordinates", "map"                     |
| **Template** | Pre-defined reusable messages   | "use template", "send template"                                  |

**Detection logic:** Check for structural keywords (carousel, card, buttons) → media indicators → location indicators → default to text.

## Rich Cards

Title max 200 chars, description max 2000 chars. See [Card Message](https://developers.sinch.com/docs/conversation/message-types/card-message.md).

## Carousels

2-10 swipeable cards. 1 card renders standalone. Up to 3 outer choices below. See [Carousel Message](https://developers.sinch.com/docs/conversation/message-types/carousel-message.md).

## Choice Messages

Interactive suggestions as chips: suggested replies and suggested actions (open URL, dial, show location, share location, create calendar event). See [Choice Message](https://developers.sinch.com/docs/conversation/message-types/choice-message.md).

## Media Messages

Images, videos, audio, PDFs. Up to 100 MB. Formats: JPEG, PNG, MP4, GIF, PDF. Auto-detected from URL. See [Media Message](https://developers.sinch.com/docs/conversation/message-types/media-message.md).

## Location Messages

Transcoded to text with a location choice button on RCS. See [Location Message](https://developers.sinch.com/docs/conversation/message-types/location-message.md).

## Channel-Specific Properties

| Property                              | Description                                           |
| ------------------------------------- | ----------------------------------------------------- |
| `RCS_WEBVIEW_MODE`                    | Size of webview for OpenUrl actions                   |
| `RCS_CARD_ORIENTATION`                | Orientation of rich card                              |
| `RCS_CARD_THUMBNAIL_IMAGE_ALIGNMENT`  | Image preview alignment in rich card                  |

## Capability Check

Check if a device supports RCS before sending: `POST /v1/projects/{project_id}/capability:query` with `channel: "RCS"`. Result delivered via webhook `CAPABILITY` trigger. See [Capability trigger](../webhooks/triggers/capability.md).

## Channel Fallback (RCS to SMS)

Set `channel_priority_order: ["RCS", "SMS"]` and include both channel identities. Add `SMS_SENDER` in `channel_properties`. Fallback triggers `SWITCHING_CHANNEL` delivery report. See [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md).

## Typing Indicators

Send `composing_event` via `POST /events:send` with `channel: "RCS"`. See [Events API](https://developers.sinch.com/docs/conversation/api-reference/conversation/events.md).

## Code Examples (by message type)

- **Text**: [Text Message](https://developers.sinch.com/docs/conversation/message-types/text-message.md)
- **Card**: [Card Message](https://developers.sinch.com/docs/conversation/message-types/card-message.md)
- **Carousel**: [Carousel Message](https://developers.sinch.com/docs/conversation/message-types/carousel-message.md)
- **Choice**: [Choice Message](https://developers.sinch.com/docs/conversation/message-types/choice-message.md)
- **Media**: [Media Message](https://developers.sinch.com/docs/conversation/message-types/media-message.md)
- **Location**: [Location Message](https://developers.sinch.com/docs/conversation/message-types/location-message.md)
- **Template**: [Template Messages](https://developers.sinch.com/docs/conversation/message-types.md)
- **List**: [List Message](https://developers.sinch.com/docs/conversation/message-types/list-message.md)

For SDK examples, see the [SDK Reference](#sdk-reference) links above.

## RCS Gotchas

1. **Carrier and device support varies.** RCS is not universally available. Always configure SMS fallback.
2. **Agent provisioning takes time.** Carrier review can take days or weeks.
3. **Media dimensions matter.** Rich card media must fit predefined heights. Use 4:3 (960x720) for best results.
4. **Carousel truncation.** Cards share uniform height. Long content is truncated.
5. **No template system.** Unlike WhatsApp, RCS does not require pre-approved templates.
6. **Read receipts are native.** RCS provides read receipts automatically.
7. **Rich messages degrade on non-RCS.** Carousels sent via SMS fallback become plain text. Test fallback rendering.
8. **Media caching.** URLs cached up to 28 days. Rename files to force refresh.

## Links

- [RCS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/rcs.md)
- [RCS Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/rcs/set-up.md)
- [RCS Message Support](https://developers.sinch.com/docs/conversation/channel-support/rcs/message-support.md)
- [RCS Message Types](https://developers.sinch.com/docs/conversation/message-types.md)
