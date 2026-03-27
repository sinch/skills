← [Back to Conversation API SKILL.md](../SKILL.md)

# Template Management API Reference

Manages **omni-channel templates** — pre-defined message formats with dynamic parameters, multiple languages, and channel-specific overrides (e.g., WhatsApp-approved templates).

**Use V2 exclusively** — V1 reached end-of-life on January 31, 2026.

**Sections:** [SDK Reference](#sdk-reference) | [When to Use](#when-to-use) | [Base URLs](#base-urls-separate-from-conversation-api) | [API Endpoints](#api-endpoints-v2) | [Key Concepts](#key-concepts) | [Template Structure](#template-structure) | [Creating Templates](#creating-templates) | [Updating Templates](#updating-templates) | [Translation Types](#translation-message-types) | [Channel-Specific](#channel-specific-templates-not-managed-here) | [Common Pitfalls](#common-pitfalls) | [Links](#links)

## SDK Reference

- [Node.js](https://developers.sinch.com/docs/conversation/sdk/node/syntax-reference.md)
- [Python](https://developers.sinch.com/docs/conversation/sdk/python/syntax-reference.md)
- [Java](https://developers.sinch.com/docs/conversation/sdk/java/syntax-reference.md)
- [.NET](https://developers.sinch.com/docs/conversation/sdk/dotnet/syntax-reference.md)

## When to Use

- Creating, updating, listing, or deleting omni-channel message templates
- Setting up multi-language template translations
- Configuring channel-specific template overrides (e.g., WhatsApp template references)

## Base URLs (Separate from Conversation API)

Templates use a separate base URL (`template.api.sinch.com`). Region-locked — templates can only be used by apps in the same region.

| Region | Base URL                             |
|--------|--------------------------------------|
| US     | `https://us.template.api.sinch.com`  |
| EU     | `https://eu.template.api.sinch.com`  |
| BR     | `https://br.template.api.sinch.com`  |

## API Endpoints (V2)

All endpoints prefixed with `/v2/projects/{project_id}`.

| Method | Path                                       | Description                |
|--------|--------------------------------------------|----------------------------|
| GET    | `/templates`                               | List all templates         |
| POST   | `/templates`                               | Create a template          |
| GET    | `/templates/{template_id}`                 | Get a template             |
| PUT    | `/templates/{template_id}`                 | Update (include `version`) |
| DELETE | `/templates/{template_id}`                 | Delete a template          |
| GET    | `/templates/{template_id}/translations`    | List translations          |

## Key Concepts

| Concept                      | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| Omni-channel template        | Uses Conversation API generic message format. Works across all channels.    |
| Channel-specific template    | Stored by the channel itself (e.g., WhatsApp-approved). Referenced, not managed here. |
| Translation                  | Language-specific version keyed by BCP-47 code (e.g., `en-US`, `fr`).      |
| Variable                     | Dynamic placeholder (`${name}`). Defined with `key` and `preview_value`.   |
| Channel template override    | Per-channel override replacing omni-channel template for that channel.     |

## Template Structure

```json
{
  "id": "01F8MECHZX3TBDSZ7XRADM79XE",
  "description": "Order confirmation template",
  "version": 1,
  "default_translation": "en-US",
  "translations": [
    {
      "language_code": "en-US",
      "version": "1",
      "variables": [
        { "key": "customer_name", "preview_value": "Jane Doe" },
        { "key": "order_number", "preview_value": "ORD-12345" }
      ],
      "text_message": {
        "text": "Hi ${customer_name}, your order ${order_number} has been confirmed!"
      }
    }
  ]
}
```

## Creating Templates

`POST /v2/projects/{project_id}/templates` — see [Templates V2 API](https://developers.sinch.com/docs/conversation/api-reference/template/templates-v2.md) for full request/response details.

Key patterns:
- **Simple text**: Set `text_message` in a translation with `${variable}` placeholders
- **WhatsApp override**: Add `channel_template_overrides.WHATSAPP.template_reference` pointing to an approved Meta template, with `parameter_mappings` linking channel-specific keys to omni-channel variable keys. On WhatsApp: uses the approved channel-specific template. On all other channels: uses the generic message.
- **Multi-language**: Add multiple translations with different `language_code` values

## Updating Templates

`PUT /v2/projects/{project_id}/templates/{template_id}` — include current `version` (optimistic concurrency). PUT fully replaces the template.

## Translation Message Types

Each translation supports one of: `text_message`, `card_message`, `carousel_message`, `choice_message`, `location_message`, `media_message`, `template_message`, `list_message`.

Plus: `channel_template_overrides`, `variables`, `language_code`, `version`.

## Channel-Specific Templates (NOT Managed Here)

| Channel   | Template Type              | Management                                    |
|-----------|----------------------------|-----------------------------------------------|
| WhatsApp  | WhatsApp Message Templates | Created via Dashboard/Provisioning API, approved by Meta |
| KakaoTalk | AlimTalk Templates         | Registered by Sinch, approved by KakaoTalk    |
| WeChat    | WeChat Templates           | Pre-defined by WeChat, added via admin portal |

Reference these via `channel_template_overrides`, but cannot create/modify them here.

## Common Pitfalls

1. **V1 is past EOL.** Use V2 (`/v2/projects/...`) exclusively.
2. **Region locking.** Templates created in US can only be used by US apps.
3. **Version conflicts on update.** Must pass current `version`. Concurrent updates fail.
4. **Omni-channel vs channel-specific confusion.** This API manages omni-channel templates. WhatsApp templates (Meta-approved) are separate.
5. **WhatsApp requires approved templates outside service window.** Use omni-channel template with WhatsApp override.
6. **Variable key format.** Use `${key_name}` syntax. Key must match `variables` array.
7. **Parameter mapping for overrides.** `parameter_mappings` maps channel-specific keys to omni-channel variable keys.

## Links

- [Managing Templates](https://developers.sinch.com/docs/conversation/templates.md)
- [Template API Overview](https://developers.sinch.com/docs/conversation/api-reference/template.md)
- [Templates V2 API](https://developers.sinch.com/docs/conversation/api-reference/template/templates-v2.md)
- [WhatsApp Template Messages](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/template-support.md)
- [Sinch Dashboard Message Composer](https://dashboard.sinch.com/convapi/message-composer)
