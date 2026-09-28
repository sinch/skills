> **Not a schema.** This file inventories runnable examples and explains when to use
> them. For payload shapes, refer to the canonical `developers.sinch.com` docs linked
> from the parent [SKILL.md](../SKILL.md) before writing code or prose that states payload structure.

# Bundled scripts

Runnable Node.js examples under `scripts/`. All read credentials from the environment variables documented in [SKILL.md](../SKILL.md#agent-credentials-handling).

Run any script with:

```bash
node skills/sinch-conversation-api/scripts/<path>.cjs [args]
```

Each script prints a short usage hint when invoked with `--help`.

## Common

| Script | Purpose |
|--------|---------|
| `common/sinch_client.cjs` | Shared helper that constructs an authenticated `SinchClient` from env vars. Imported by the other scripts — not a standalone entry point. |
| `common/list_messages.cjs` | List recent messages for a project. Useful for verifying sends and inspecting delivery state. |

## Channel send scripts (moved)

Channel-specific send scripts are bundled with the channel skills:

- SMS: `sinch-sms` — `scripts/send_sms.cjs`
- RCS: `sinch-rcs` — `scripts/send_text.cjs`, `send_card.cjs`, `send_carousel.cjs`, `send_choice.cjs`, `send_location.cjs`, `send_calendar.cjs`, `send_media.cjs`, `send_template.cjs`

## Webhooks

| Script | Purpose |
|--------|---------|
| `webhooks/create_webhook.cjs` | Register a webhook on an app (set `target`, `target_type: HTTP`, and `triggers`). Posts to the project-scoped `POST /v1/projects/{project_id}/webhooks` with `app_id` in the body — not to `/apps/{app_id}/webhooks`, which is list-only. |
| `webhooks/list_webhooks.cjs` | List all webhooks registered on an app. |
| `webhooks/get_webhook.cjs` | Fetch a single webhook by ID. |
| `webhooks/update_webhook.cjs` | Update an existing webhook's target, triggers, or secret. |
| `webhooks/delete_webhook.cjs` | Delete a webhook by ID. |
| `webhooks/test_webhook_triggers.cjs` | Trigger a test callback for one or more webhook triggers. Useful for validating handler implementations end-to-end. |

## Notes

- Scripts target the region in `SINCH_REGION` (default `us`). It must match the region the Conversation API app was created in.
- Scripts are intentionally small and read-mostly, they are to be used as runnable on-demand scripts, not reference implementations.
- For batch sending and template management, see [batch.md](batch.md) and [templates.md](templates.md) — those flows use different base URLs and are not covered by these scripts.

