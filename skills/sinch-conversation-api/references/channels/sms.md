# SMS Channel Reference

← [Back to Conversation API SKILL.md](../../SKILL.md)

SMS is a core channel of the Sinch Conversation API. The API handles SMS-specific details like encoding detection and message concatenation automatically.

## Prerequisites

1. A service plan with at least one virtual number assigned.
2. A Conversation API app created in the same region as your service plan.

## SDK Reference

- [Node.js](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## Character Encoding

The API auto-detects encoding based on message characters:

| Encoding        | Max chars per SMS | Max chars per part (multipart) |
| --------------- | ----------------- | ------------------------------ |
| GSM 7-bit       | 160               | 153                            |
| UCS-2 (Unicode) | 70                | 67                             |

- GSM 7-bit covers standard Latin characters, digits, and common symbols.
- Any character outside GSM 7-bit (accented chars, CJK, emoji) triggers UCS-2, halving capacity.
- A single emoji forces the entire message to UCS-2.

### Auto Encoding

Reduces message parts by transliterating special characters (e.g., smart quotes to straight quotes). Emojis and CJK characters are not converted. Contact your Sinch account manager to enable.

## Concatenated Messages

When a message exceeds single-SMS limits, it is split into parts. Each part includes a UDH that reduces usable characters. Control max parts with `SMS_MAX_NUMBER_OF_MESSAGE_PARTS`.

## SMS Channel Properties

Set under `channel_properties` in your message request:

| Property                          | Description                                 |
| --------------------------------- | ------------------------------------------- |
| `SMS_SENDER`                      | Sender number or alphanumeric sender ID     |
| `SMS_MAX_NUMBER_OF_MESSAGE_PARTS` | Max concatenated parts allowed (integer)    |
| `SMS_FLASH_MESSAGE`               | Whether this is a flash SMS message         |

## Sender ID Types

| Type         | Description                | Example        |
| ------------ | -------------------------- | -------------- |
| Long code    | Standard phone number      | `+15551234567` |
| Short code   | 5-6 digit number           | `12345`        |
| Alphanumeric | Brand name (1-way only)    | `MyBrand`      |
| Toll-free    | Toll-free number           | `+18001234567` |
| 10DLC        | US registered local number | `+15551234567` |

## Opt-Out Handling

- Opt-out keywords (STOP, UNSUBSCRIBE, etc.) can be processed by Sinch automatically for US/Canada numbers when consent management is active.
- Inbound opt-out messages are delivered via webhook as Mobile Originated (MO) messages.
- You must honor opt-outs and maintain your own suppression list for compliance.
- Re-opt-in typically requires the user to send a keyword like START.

## Message Examples

- **Send SMS / Fallback patterns** — See [Messages API Reference](https://developers.sinch.com/docs/conversation/api-reference/conversation/messages.md). Set `channel` to `SMS` and include `SMS_SENDER` in `channel_properties`. For fallback, add `channel_priority_order` array.
- **Inbound SMS handling** — See [MESSAGE_INBOUND trigger](../webhooks/triggers/message-inbound.md). Opt-out keywords (STOP) arrive as `contact_message.text_message`.

## Code Examples

- [Node.js SDK](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python SDK](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java SDK](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET SDK](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## SMS Gotchas

1. **Encoding surprises.** A single non-GSM character forces UCS-2 encoding, doubling message parts. Sanitize input or enable Auto Encoding.
2. **Sender ID rules vary by country.** Alphanumeric sender IDs are not supported in the US or Canada. Some countries require pre-registered sender IDs.
3. **10DLC registration is required.** US A2P messaging over local numbers requires 10DLC brand and campaign registration. Unregistered traffic will be filtered.
4. **Short code limitations.** US short codes require dedicated provisioning and carrier approval. Cannot send MMS via Conversation API.
5. **Concatenation costs.** Each SMS part is billed separately. A 161-character GSM message costs 2 SMS credits.
6. **Opt-out compliance.** US/Canada regulations (TCPA, CASL) require honoring opt-outs. Sinch handles standard keywords automatically when consent management is active.
7. **Delivery receipts are not guaranteed.** Some carriers do not return delivery receipts. Handle `UNKNOWN` status gracefully.

## Links

- [SMS Channel Overview](https://developers.sinch.com/docs/conversation/channel-support/sms.md)
- [SMS Setup Guide](https://developers.sinch.com/docs/conversation/channel-support/sms/set-up.md)
- [SMS Channel Properties](https://developers.sinch.com/docs/conversation/channel-support/sms/properties.md)
- [SMS Message Support](https://developers.sinch.com/docs/conversation/channel-support/sms/message-support.md)
- [Character Encoding](https://developers.sinch.com/docs/sms/resources/message-info/character-support.md)
- [Auto Encoding](https://developers.sinch.com/docs/sms/resources/message-info/auto-encoding.md)
