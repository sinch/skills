> **Summary — not the spec.** This file orients you to a CLI command family. The
> authoritative source for exact flags and argument order is `sinch <cmd> --help` on
> the installed binary; the linked `developers.sinch.com` docs are authoritative for
> concepts but may lag the shipped CLI. Do **not** copy a flag name, argument order, or
> enum value from here into a shipped script without confirming it against `--help`.
> See "Source of Truth" in this skill's SKILL.md.

# Voice CLI — calls and services

Reference for the `sinch voice` command tree. Loaded on-demand from [SKILL.md](../SKILL.md).

`sinch voice` targets Voice API v2. The older Voice API v1 lives under `sinch voice v1` and is covered at the end of this file. Every command supports `--json`.

v2 has no voice-application concept and no application key: `sinch voice calls` and `sinch voice services` authenticate with the project Access Key pair that `sinch auth login` stores. Inbound routing is a **service** — a number is bound to one by its RTC application id, which is the service id.

## Services — inbound call routing

A service holds the webhook URL that inbound calls for its numbers are posted to. A function opts into v2 routing by declaring `VOICE_SERVICE_ID`; `sinch functions deploy` then makes the same `services update` call for you.

```bash
sinch voice services list                              # services in this project
sinch voice services get <service-id>                  # one service, with its full callBehavior
sinch voice services create --name "Support IVR"       # prompts for what it needs
sinch voice services create --name "Support IVR" --webhook-url https://fn-abc123.functions.sinch.com
sinch voice services update <service-id> --webhook-url https://fn-abc123.functions.sinch.com
sinch voice services delete <service-id> --force
```

**`create` flags:** `--name <name>`, `--description <text>`, `--webhook-url <url>` (setting it sets the service's call behavior to `WEBHOOK`), `--json`, `--non-interactive`

**`update` flags:** `--webhook-url <url>` (required)

**`delete` flags:** `--force`, `--json`, `--non-interactive`. The service id is optional; omit it and the CLI prompts. Deleting a service stops inbound calls for every function routed through it.

Without `--webhook-url`, `create` makes a service whose inbound calls reach nothing; the command warns and prints the `services update` line to fix it. Run inside a function's project directory, `services create` records the new service in `sinch.json` as `createdResources` (since 0.9.1), so the next `sinch functions deploy` ties it to the function and deleting the function releases it; `services delete` removes the entry. Outside a project directory nothing is written, and a failed write only warns.

## Calls — place, inspect and control calls

```bash
# List and inspect
sinch voice calls list --service-id <id> --call-result IN_PROGRESS
sinch voice calls get <call-id>                        # call ID is a ULID

# Place a call
sinch voice calls create +15551234567 --from +15559876543          # answered by the service webhook
sinch voice calls create +15551234567 --say "Hello from Sinch" --tts-voice Emma
sinch voice calls create +15551234567 --flow @ivr.json             # raw v2 command list (inline, @file, or - for stdin)
sinch voice calls create +15551234567 --stream wss://example.com/media --sample-rate 16000
sinch voice calls create +15551234567 --relay <endpoint> --tts-voice <name> --stt-language en-US

# Call two parties and bridge them
sinch voice calls bridge +15551234567 +15551234568 --from +15559876543

# Control a live call
sinch voice calls patch <session-id> --call-name origin --dial +15551234569 --end-leg origin
echo '[{"command":"hangup"}]' | sinch voice calls patch <call-id> --flow -
sinch voice calls hangup <target> --leg caller
```

**`list` flags:** `--service-id <id>`, `--from <number>`, `--to <number>`, `--call-type <type>` (`PHONE`, `SIP`, `STREAM`, `VOICE_RELAY`), `--call-result <result>` (`QUEUED`, `INITIATED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`, `NO_ANSWER`, `CANCEL`, `BUSY`, `FAILED`), `--start-time <iso>`, `--end-time <iso>`, `-l, --limit <number>`, `--page <number>`

**`create` flags:** `--from <origin>`, `--stream <endpoint>`, `--relay <endpoint>`, `--say [text]`, `--flow <source>`, `--sample-rate <hz>`, `--tts-voice <name>`, `--stt-language <tag>`, `--no-interruptions`, `--header <key=value>` (repeatable), `--bridge-name <name>`, `--timeout <seconds>`, `--max-duration <seconds>`, `--service-id <id>`, `--dry-run`, `--non-interactive`

`--stream`, `--relay`, `--say` and `--flow` are mutually exclusive; with none of them the call goes to the service webhook. `--say` is the v2 counterpart of `voice v1 callouts tts`. Voice v2 drops a call whose SAY message is over 600 characters without an error: `--say` splits longer text between sentences (a single sentence over 600 fails before calling), and `--flow` rejects it with exit `64`. `--stream` / `--relay` need a full `ws://` / `wss://` URL.

**`bridge` flags:** `--from <origin>`, `--bridge-name <name>`, `--timeout <seconds>`, `--max-duration <seconds>`, `--service-id <id>`, `--dry-run`

**`patch` flags:** `--call-name <name>`, `--dial <destination>`, `--end-leg <name>`, `--dial-leg <name>`, `--bridge-name <name>`, `--from <origin>`, `--timeout <seconds>`, `--flow <source>`, `--dry-run`

**`hangup` flags:** `--call-name <name>`, `--leg <name>` (repeatable), `--dry-run`

`patch` runs commands against a call that is already up — adding a party to it with `--dial`, or sending raw v2 commands with `--flow`; exactly one of the two is required. Voice v1 has no equivalent. Since 0.9.0 the leg `--dial` creates is unnamed unless you pass `--dial-leg <name>` (it used to be named `transfer`). Always pass `--end-leg`: if the dialed party never answers, nothing else runs and the remaining caller sits on a billed call.

**Identifiers:** `calls create` and `calls bridge` return a **session ID**; `calls get` takes a **call ID** (ULID) from `calls list`. Address a live call as `patch <call-id>` or `patch <session-id> --call-name <leg>`.

**SIP destinations:** v2 requires the scheme (`sip:agent@pbx.example.com`); v1 callouts require a bare address. Copying one form into the other tree fails without a clear error. Use `--dry-run` on any of `create`, `bridge`, `patch` and `hangup` to print the request without sending it.

## Voice v1 (legacy)

`sinch voice v1` is the previous tree: applications, callouts, calls and conferences. These commands require a Voice Application Key and Secret, which `sinch auth login` does not collect. Pass `-a, --app-key <key>` (accepted by every v1 command since 0.7.0) or set `SINCH_APPLICATION_KEY` / `SINCH_APPLICATION_SECRET`. A v1 command with no application key exits `64`.

```bash
# Applications — callback URLs and number assignments
sinch voice v1 applications callbacks get
sinch voice v1 applications callbacks set https://fn-abc123.functions.sinch.com --fallback https://backup.example.com
sinch voice v1 applications numbers list
sinch voice v1 applications numbers assign +15551234567 --capability voice
sinch voice v1 applications numbers unassign +15551234567

# Callouts — place outbound calls
sinch voice v1 callouts tts +15551234567 "Your package is arriving today" --voice en-US --cli +15559876543
sinch voice v1 callouts conference +15551234567 room-42 --greeting "Joining the sales call" --moh music1
sinch voice v1 callouts custom +15551234567 --ice @./ice-payload.json

# Calls — query and control in-progress calls
sinch voice v1 calls get <call-id>
sinch voice v1 calls hangup <call-id>
sinch voice v1 calls update <call-id> --svaml @./svaml.json
sinch voice v1 calls manage-leg <call-id> --leg caller --svaml @./say.json

# Conferences — rooms and participants
sinch voice v1 conferences get room-42
sinch voice v1 conferences kick room-42 <call-id>
sinch voice v1 conferences kick-all room-42 --yes
sinch voice v1 conferences manage room-42 <call-id> --hold --moh music1
```

**TTS callout flags:** `--voice <locale>`, `--cli <number>`, `--dtmf <seq>`, `--domain pstn|mxp`, `--enable-ace`, `--enable-dice`, `--enable-pie`

**Conference callout flags:** `--cli`, `--greeting`, `--locale`, `--moh ring|music1|music2|music3`, `--max-duration`, `--dtmf`, `--domain`

**Custom callout flags:** `--ice <svaml|@file>`, `--ace <svaml|@file>`, `--pie <svaml|@file>`, `--cli`, `--dtmf`, `--max-duration` (at least one of `--ice`, `--ace`, or `--pie` is required)

**`conferences manage`** action flags (exactly one required): `--mute`, `--unmute`, `--hold`, `--resume`. Use `--moh <music>` with `--hold`. Participants are identified by their per-leg call ID from `conferences get`, not by phone number. To play audio or speak text to a participant, use `sinch voice v1 calls manage-leg` instead — those hit a different SDK method.

`sinch voice v1 applications numbers` manages the numbers attached to a specific Voice application. For the account-wide number inventory (search, rent, release), use `sinch numbers` — see [numbers-and-porting.md](numbers-and-porting.md).

## Related

- [CLI skill](../SKILL.md) — full CLI overview
- [numbers-and-porting.md](numbers-and-porting.md) — account-wide phone number inventory
- [Voice CLI docs](https://developers.sinch.com/docs/functions/cli/commands/voice.md)
