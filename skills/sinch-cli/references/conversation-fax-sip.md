> **Summary — not the spec.** This file orients you to a CLI command family. The
> authoritative source for exact flags and argument order is `sinch <cmd> --help` on
> the installed binary; the linked `developers.sinch.com` docs are authoritative for
> concepts but may lag the shipped CLI. Do **not** copy a flag name, argument order, or
> enum value from here into a shipped script without confirming it against `--help`.
> See "Source of Truth" in this skill's SKILL.md.

# Conversation, Fax, and SIP Trunking CLI

Reference for `sinch conversation` (omnichannel messaging), `sinch fax`, and `sinch sip` (Elastic SIP Trunking). Loaded on-demand from [SKILL.md](../SKILL.md).

## Conversation messaging (`sinch conversation`)

Send SMS, WhatsApp, RCS, and other messages through the unified Conversation API. SMS is sent via `sinch conversation send --channel SMS`, **not** a separate `sinch sms` command.

**Region (since 0.9.0).** A Conversation app lives in one region: `us`, `eu` or `br`. Every `sinch conversation` command takes `--region us|eu|br`; without it the CLI uses the profile's `conversationRegion` (`sinch config set conversationRegion eu`), asks when it can prompt, and otherwise falls back to `us` silently. Pass `--region` in scripts that touch EU or BR apps. `apps list` queries all three regions (each app shows its `region`) unless `--region` is given.

**Channels.** The CLI checks which channels the app has configured and fails fast on `--channel` for a channel the app lacks.

```bash
# Interactive wizard — prompts for channel, recipient, message type
sinch conversation send

# Direct SMS
sinch conversation send +15551234567 "Hello from Sinch" --channel SMS

# WhatsApp with media
sinch conversation send +15551234567 \
  --channel WHATSAPP \
  --media https://example.com/image.jpg \
  --caption "Check this out"

# Template message
sinch conversation send +15551234567 \
  --channel WHATSAPP \
  --type template \
  --template welcome_template \
  --params '{"name":"Alice"}'

# Raw JSON escape hatch for any message structure
sinch conversation send +15551234567 -c WHATSAPP \
  --json-message '{"text_message":{"text":"hi"}}'
```

**Channels:** `SMS`, `WHATSAPP`, `MESSENGER`, `INSTAGRAM`, `VIBER`, `TELEGRAM`, `RCS`, `LINE`

**Message types:** `text`, `media`, `template`, `card`, `carousel`, `choice`, `location`, `list`

### Management commands

```bash
sinch conversation apps list                       # all regions; --region to narrow
sinch conversation apps create "My App" --region eu --sms-plan <servicePlanId>   # token from SINCH_SMS_TOKEN
sinch conversation apps update <id> --display-name "New name"   # sends only the fields you pass
sinch conversation apps get <id>                   # get app details
sinch conversation apps delete <id>                # delete an app

sinch conversation contacts --limit 20             # list contacts
sinch conversation conversations --state ACTIVE    # list conversations by state
sinch conversation messages list --channel WHATSAPP
sinch conversation messages get <id>               # get a specific message
sinch conversation messages delete <id> --force    # asks to confirm otherwise; exit 66 with no terminal
sinch conversation messages update <id> --metadata <json>

sinch conversation webhooks list --app app_abc     # list webhooks for an app
sinch conversation webhooks create                 # interactive
sinch conversation webhooks update <id>
sinch conversation webhooks delete <id>

sinch conversation templates list                  # list message templates
sinch conversation templates get <id>              # with translations
sinch conversation templates create                # interactive
sinch conversation templates delete <id>
```

## Fax (`sinch fax`)

```bash
# One-time setup
sinch config set fax serviceID=<your-service-id>
sinch config set fax senderNumber=+15551234567

# Send a fax from a file
sinch fax send --to +12025550134 --file ./document.pdf

# Send from URL
sinch fax send --to +12025550134 --content-url https://example.com/doc.pdf

# Track status
sinch fax status <fax-id> --wait --timeout 600
sinch fax status <fax-id> --watch --interval 5
sinch fax get <fax-id>

# List configured fax services (verify setup)
sinch fax services list

# List and download
sinch fax list --json                          # { "faxes": [...] }
sinch fax download <fax-id> -o out.pdf          # -o - writes the PDF to stdout
sinch fax delete-content <fax-id> --force      # destructive

# Services, fax-to-email, cover pages
sinch fax services get|create|update|delete|numbers ...
sinch fax emails list|add|update|delete|numbers ...
sinch fax cover-pages list|get|add|delete ...

# Receive incoming fax events locally (no tunnel; --url sets the service webhook, restored on Ctrl+C)
sinch fax listen --port 3000 --url https://<public-forwarding-url>
```

Commands that need a service use `--service-id`, then the configured default, then an API lookup (which fails without a prompt if there are several services). `fax send` takes repeatable `--to`, `--file` and `--content-url`, plus `--from`, `--header-text`, `--resolution FINE|SUPERFINE`. `fax listen` changes the service's webhook content type to JSON, and that change is not reverted.

**Supported file types:** PDF, TIF, TIFF, DOC, DOCX, TXT, HTML, HTM, JPG, PNG (CLI max 20 MB).

### Fax status flags

| Flag | Description |
|---|---|
| `--wait` | Poll until the fax completes or fails |
| `--timeout <seconds>` | Timeout for `--wait` (default: 300) |
| `--watch` | Continuously poll and redisplay status |
| `--interval <seconds>` | Poll interval for `--watch` (default: 5) |

## Elastic SIP Trunking (`sinch sip`)

Manage SIP trunks, endpoints, ACLs, call history, trunk credential-list assignment, and country dialing permissions.

```bash
# Manage SIP trunks
sinch sip trunks list
sinch sip trunks create --name "main-trunk" --host-name sip.example.com
sinch sip trunks update <trunk-id> --caller-id
sinch sip trunks delete <trunk-id> --force   # exit 66 with no terminal and no --force

# Endpoints (registered SIP devices)
sinch sip endpoints list --json
sinch sip endpoints create
sinch sip endpoints update <endpoint-id>
sinch sip endpoints delete <endpoint-id>

# ACLs (IP allowlists)
sinch sip acls list
sinch sip acls create
sinch sip acls update <acl-id>
sinch sip acls delete <acl-id>

# Trunk ACL and credential list assignment
sinch sip trunks acls add <trunk-id> <acl-id>
sinch sip trunks acls remove <trunk-id> <acl-id>
sinch sip trunks credential-lists update <trunk-id> <cred-list-id...>

# Which trunks use a credential list (the only credential-lists subcommand;
# the CLI cannot list, create or delete credential lists)
sinch sip credential-lists trunks <cred-list-id>

# Call history (--from/--to are phone numbers, not dates; --date picks the period)
sinch sip calls list --trunk-id <id> --date 2026-11 --direction INBOUND --page-size 50
sinch sip calls get <call-id>

# Country dialing permissions
sinch sip countries list
sinch sip countries get US
sinch sip countries enable CA
sinch sip countries disable '*'      # quote * so the shell does not expand it
```

`sip trunks credential-lists update` **replaces** the trunk's whole set with the IDs you pass, so include every list the trunk should keep.

All SIP subcommands support `--json`. Create and update commands support `--non-interactive` for CI/CD use.

## Related

- [CLI skill](../SKILL.md) — full CLI overview
- [Conversation commands docs](https://developers.sinch.com/docs/functions/cli/commands/conversation.md)
- [Fax commands docs](https://developers.sinch.com/docs/functions/cli/commands/fax.md)
- [SIP commands docs](https://developers.sinch.com/docs/functions/cli/commands/sip-trunking.md)
- [Conversation API](https://developers.sinch.com/docs/conversation.md)
- [Elastic SIP Trunking](https://developers.sinch.com/docs/est.md)
