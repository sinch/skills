> **Summary — not the spec.** This file orients you to a CLI command family. The
> authoritative source for exact flags and argument order is `sinch <cmd> --help` on
> the installed binary; the linked `developers.sinch.com` docs are authoritative for
> concepts but may lag the shipped CLI. Do **not** copy a flag name, argument order, or
> enum value from here into a shipped script without confirming it against `--help`.
> See "Source of Truth" in this skill's SKILL.md.

# Numbers and Porting CLI

Reference for `sinch numbers` (account-wide phone number inventory) and `sinch porting` (move numbers in/out of Sinch). Loaded on-demand from [SKILL.md](../SKILL.md).

## Phone numbers (`sinch numbers`)

These commands prompt for filters by default. Pass the filter flags or `--non-interactive` in scripts.

```bash
# Search available numbers (subcommands: search, check, rent, rent-any)
sinch numbers available search --region US --type LOCAL --capabilities SMS VOICE --non-interactive
sinch numbers available check +12025551234
sinch numbers available rent +12025551234 --force               # billable
sinch numbers available rent-any --region US --type LOCAL --force   # billable; US LOCAL only

# List numbers you already rent
sinch numbers active list --region US --non-interactive
sinch numbers active list --region US --json                    # { "activeNumbers": [...] }

# Get details + update configuration
sinch numbers active get +15551234567
sinch numbers active update +15551234567 \
  --display-name "Main Line" \
  --voice-app app_abc123 \
  --sms-service-plan sps_xyz

# Release a number
sinch numbers active release +15551234567 --force

# List supported regions
sinch numbers regions list --types MOBILE
```

**Region codes** are ISO country codes: `US`, `GB`, `SE`, etc. **Number types:** `LOCAL`, `MOBILE`, `TOLL_FREE`. **Capabilities:** `SMS`, `VOICE` (repeatable). Note `search` uses `-c, --capabilities` and `-s, --size`; `active list` uses `-c, --capability` and `-l, --limit`.

`rent` confirms unless `-f, --force` is given; `--non-interactive` alone does not skip the confirmation. `rent` flags: `--sms-service-plan`, `--sms-campaign` (US 10DLC), `--voice-app`, `--voice-type RTC|EST|FAX`, `--trunk-id` (EST), `--callback-url`, `--data-file` (KYC answers). Interactively, the CLI offers pickers for the service plan, campaign and Voice app.

**Function projects (since 0.9.1).** Run inside a Sinch Functions project directory, `rent`, `rent-any` and the interactive search record the rented number in `sinch.json` as `createdResources`. The next `sinch functions deploy` ties it to the function, so deleting the function releases the number. `sinch numbers active release` removes the entry. A number bought through a KYC order is not recorded, nothing is written outside a project directory, and a failed write only warns on stderr; the rental itself still succeeds. Tell the user before renting inside a project folder that the number will be released along with the function.

### `[docs required]` numbers and KYC orders (`sinch numbers order`)

Search results tag numbers whose region needs supporting documentation with `[docs required]`. If a rental is rejected for that, `rent` switches to the guided KYC order flow. An order **reserves** numbers (30 minutes to 48 hours), collects the region's questionnaire and attachments, and goes to human compliance review; numbers activate only if it passes.

```bash
sinch numbers order create --region AU --type MOBILE        # interactive questionnaire
sinch numbers order create --region AU --type MOBILE -q 1 --data-file kyc.json --non-interactive --force
sinch numbers order resume <orderId>                        # continue or fix a failed questionnaire
sinch numbers order get <orderId>                           # state, time left, reviewer feedback
sinch numbers order list                                    # orders created on THIS machine only
```

- **A reservation cannot be cancelled.** The confirmation before `order create` is the last reversible moment — ask the user first.
- The questionnaire is fetched from the API at run time; `--data-file` entries line up positionally with its sections. Run once interactively to learn the order.
- `order list` is local: the API cannot list orders, so orders made elsewhere need their ID.

## Porting (`sinch porting`)

Port existing phone numbers from another carrier into Sinch. The porting tree has five subgroups: `check`, `config`, `orders`, `documents`, `activation`.

```bash
# Check if numbers are portable to Sinch
sinch porting check +15551234567 +15551234568

# Project-level porting configuration (contact info, webhook, default port times)
sinch porting config get
sinch porting config update

# Port-in orders
sinch porting orders create                    # interactive
sinch porting orders list
sinch porting orders get <order-id>
sinch porting orders update <order-id>
sinch porting orders cancel <order-id>
sinch porting orders add-note <order-id>

# Supporting documents
sinch porting documents upload <order-id> --file ./loa.pdf
sinch porting documents get <order-id> <doc-id>

# Activation (final step — switch traffic to the ported numbers)
sinch porting activation list <order-id>       # list activation groups
sinch porting activation activate <order-id>   # activate (optionally by group)
```

### Typical port-in flow

1. **Check portability** — `sinch porting check +15551234567` confirms the number can be ported
2. **Update config** — `sinch porting config update` sets your contact info and status webhook
3. **Create order** — `sinch porting orders create` starts a port-in (interactive)
4. **Upload documents** — `sinch porting documents upload <order-id> --file <path>` for any supporting paperwork the losing carrier requires
5. **Wait for approval** — monitor `sinch porting orders get <order-id>`
6. **Activate** — `sinch porting activation activate <order-id>` switches traffic to the ported numbers

All porting commands support `--json` for machine-readable output and OAuth2 credentials from `sinch auth login`.

## Related

- [CLI skill](../SKILL.md) — full CLI overview
- [Numbers CLI docs](https://developers.sinch.com/docs/functions/cli/commands/numbers.md)
- [Porting CLI docs](https://developers.sinch.com/docs/functions/cli/commands/porting.md)
- [Sinch Numbers API](https://developers.sinch.com/docs/numbers.md)
