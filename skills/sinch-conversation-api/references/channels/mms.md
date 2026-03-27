# MMS Channel Reference

← [Back to Conversation API SKILL.md](../../SKILL.md)

MMS (Multimedia Messaging Service) extends SMS with support for images, video, audio, PDFs and other media. Available in the **United States, Canada, and Australia** only.

## Prerequisites

1. A service plan with an MMS-capable number (US/CA/AU long code or toll-free).
2. A Conversation API app in the same region as your service plan.
3. MMS channel setup requires: Account ID, API key, default originator or short code, username and password.

## SDK Reference

- [Node.js](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## Supported Media Types

| Media Type | Common Formats      | Notes                               |
|------------|---------------------|-------------------------------------|
| Image      | JPEG, PNG, GIF, BMP | Most widely supported               |
| Video      | MP4, 3GPP           | Quality may be reduced for delivery |
| Audio      | MP3, WAV, AMR       | Limited carrier support             |
| vCard      | VCF                 | Contact cards                       |
| Text       | Plain text          | Included as message body            |
| PDF        | PDF                 | Included as URL                     |

All media files must serve a valid `Content-Type` header. `application/octet-stream` may be rejected.

## File Size Limits

Keep media **under 1 MB** for reliable delivery.

| Number Type | Typical Max | Notes                           |
|-------------|-------------|----------------------------------|
| Long code   | ~1 MB       | Varies by carrier                |
| Toll-free   | ~1 MB       | Varies by carrier                |
| Short code  | Varies      | Transcoding not supported        |
| 10DLC       | Varies      | Transcoding not supported        |

The API accepts up to 100 MB, but carriers impose lower limits. Base64 encoding adds ~37% size overhead.

## MMS Channel Properties

| Property               | Description                                              |
|------------------------|----------------------------------------------------------|
| `MMS_SENDER`           | Sender phone number                                      |
| `MMS_STRICT_VALIDATION`| Validate media against best practices (default: false)   |

## Card Messages via MMS

Card `title` becomes the MMS Subject line (max 80 chars, 40 recommended). Title is not duplicated in body.

## Unsupported Message Types (Transcoded to Text)

- Choice messages (buttons/quick replies)
- Carousel messages
- Location messages

## Message Examples

- **Send MMS / Fallback patterns** — See [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md). Set `channel` to `MMS` and include `MMS_SENDER` in `channel_properties`. For fallback, add `channel_priority_order` array with both `MMS` and `SMS` channel identities.
- **MMS message support details** — See [MMS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/mms.md).

## MMS Gotchas

1. **US, Canada, and Australia only.** Use WhatsApp, RCS, or SMS for international media messaging.
2. **Keep files under 1 MB.** Carrier limits are ~1 MB. Oversized media is compressed or rejected.
3. **Base64 overhead.** Binary content encoded with Base64 produces files ~37% larger.
4. **Content-Type headers required.** Media URLs must return valid MIME types. Generic `application/octet-stream` may be rejected.
5. **Media URLs must be publicly accessible.** URLs behind auth or firewalls fail.
6. **Short code/10DLC MMS limitations.** Transcoding not supported. Size limits vary by operator.
7. **Video quality reduction.** Video may be compressed significantly. For high-quality video, send a link via SMS.
8. **Rich messages degrade.** Carousels, choices, and location are transcoded to plain text.
9. **No read receipts.** MMS does not provide read receipts. Some carriers return delivery confirmations.

## Links

- [MMS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/mms.md)
- [MMS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/mms.md)
- [Media Message Type](https://developers.sinch.com/docs/conversation/message-types/media-message.md)
