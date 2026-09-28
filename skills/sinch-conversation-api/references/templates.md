> **Not a schema.** This file describes when to use Template Management, its base URLs,
> endpoints, and pitfalls. For payload shape (field names, nesting, encodings, enums), refer
> to the canonical `developers.sinch.com` docs linked from the parent [SKILL.md](../SKILL.md)
> before writing code or prose that states payload structure.

# Template Management API Reference

Manages **omni-channel templates** — pre-defined message formats with dynamic parameters, multiple languages, and channel-specific overrides (e.g., WhatsApp-approved templates).

**Use V2 exclusively** — V1 reached end-of-life on January 31, 2026.

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

A template combines an `id`, `version`, `default_translation`, and one or more `translations` (each keyed by BCP-47 `language_code`, carrying `variables` and one message-type body). Field names, nesting, and enums must come from the authoritative [Templates V2 API](https://developers.sinch.com/docs/conversation/api-reference/template/templates-v2.md) doc — do not lift them from this file.

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
4. **Omni-channel vs channel-specific confusion.** This API manages omni-channel templates. Channel-specific templates (like Meta-approved WhatsApp templates) are separate.
5. **WhatsApp requires approved templates outside service window.** Reference these in an omni-channel template with WhatsApp `channel_template_overrides` field.
6. **Variable key format.** Use `${key_name}` syntax. Key must match `variables` array.
7. **Parameter mapping for overrides.** `parameter_mappings` maps channel-specific keys to omni-channel variable keys.

## Links

- [Managing Templates](https://developers.sinch.com/docs/conversation/templates.md)
- [Template API Overview](https://developers.sinch.com/docs/conversation/api-reference/template.md)
- [Templates V2 API](https://developers.sinch.com/docs/conversation/api-reference/template/templates-v2.md)
- [WhatsApp Template Messages](https://developers.sinch.com/docs/conversation/channel-support/whatsapp/template-support.md)
- [Sinch Dashboard Message Composer](https://dashboard.sinch.com/convapi/message-composer)
