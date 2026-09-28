---
name: sinch-voice-api
description: Build voice apps with the Sinch Voice API v1. Use for phone calls, text-to-speech (TTS), IVR menus, DTMF input, conference calling, call recording, call forwarding, answering machine detection (AMD), SIP routing, WebSocket audio streaming, and SVAML call control. Not for Voice API v2 (public preview); use the sinch-voice-api-v2 skill for that.
metadata:
  author: Sinch
  version: 1.3.0
  category: Voice
  tags: voice, calls, tts, ivr, dtmf, conference, recording, svaml, sip, amd, webrtc
  uses:
    - sinch-authentication
    - sinch-sdks
---

# Sinch Voice API

## Overview

The Sinch Voice API lets you make, receive, and control voice calls programmatically via REST. It uses **SVAML** (Sinch Voice Application Markup Language) to define call flows through callback events.

> **Version scope: Voice API v1 only.** This skill covers the `/calling/v1` API, its SVAML dialect, and its ICE/ACE/PIE/DiCE callbacks. Sinch also offers **Voice API 2.0**, currently in public preview, with a different API surface. If the user asks for Voice 2.0, v2 endpoints, or the preview API, do not adapt the v1 guidance below. Load the `sinch-voice-api-v2` skill instead.

## Agent Instructions

> **Policy gate `sinch-shared-policy@5` (`sha256:4864cf0fa8d6`):** The policy digest below is binding as written. Before implementation or live execution, read [the full shared Sinch policy](references/shared-policy.md) once per conversation — skip it if this exact ID/version/fingerprint is already loaded; read it if the version is newer or the fingerprint differs. This skill's canonical operation routes live in its Agent Instructions and Links sections.

<!-- sinch-policy-digest: start (generated; edit docs/SINCH_SHARED_POLICY.md and run scripts/sync_sinch_skill_references.py) -->
**Sinch policy digest (binding):**

1. Load the shared policy once per conversation; skip duplicate copies bearing the same ID/version/fingerprint.
2. Infer product, language, region, and environment from the request and workspace; ask one combined question only for true blockers. Prefer the official Sinch SDK unless the request or workspace decides otherwise or no official SDK covers the language or operation.
3. Code-generation approval is not execution approval. Classify every operation (read-only / reversible / billable / destructive) and obtain explicit approval before billable or destructive calls.
4. Tier B facts — endpoint paths, methods, field names, enums, limits, webhook payloads, signature algorithms, SDK signatures — require fetching the exact canonical document in the current session before use.
5. Bundled scripts, references, and examples are Tier C: illustrations, never schema authority. Never promote example values to production defaults.
6. If a route is unresolved or a canonical fetch fails, climb the resolution ladder in order — re-search already-fetched documents (raw, not summarized), consult https://developers.sinch.com/llms.txt, follow first-party links, retry once — before failing closed. Never pattern-guess a documentation URL; never substitute memory, search snippets, or bundled files.
7. Keep an evidence ledger mapping each fetched source to the fields and claims it authorized.
8. Bound all polling and retries (backoff, jitter, hard cap); check state before retrying billable or destructive operations; report a timeout as unknown, not failed.
9. Report verification levels separately (lint → unit → mock contract → sandbox → live → end-to-end); an HTTP 2xx does not prove delivery. State the levels not performed.
10. Load only the smallest skill set that owns the behavior; if a required skill is unavailable, name it and stop rather than improvising its instructions.
<!-- sinch-policy-digest: end -->

Before generating code, gather from the user (skip any item already specified in the prompt or context):

1. **Approach** — SDK or direct API calls (curl/fetch/requests)?
2. **Language** — for SDK: Node.js, Python, Java, or .NET. For direct API: any language, or curl.

When the user chooses **SDK**, refer to the `sinch-sdks` skill for installation and client initialization, then to the bundled examples and SDK reference linked in Links.

When the user chooses **direct API calls**, refer to the Voice API Reference linked in Links for request/response schemas.

**Security**: See the Security section below for url fetching policy, handling inbound callback content, and credential handling.

## Source of Truth — what to load, and what is authoritative

This skill has three kinds of content with UNEQUAL reliability. Follow this precedence:

1. **Canonical docs at `developers.sinch.com` (AUTHORITATIVE).** The `.md` doc links in
   this skill are the single source of truth for exact request/response schemas, field
   names and nesting, enum values, signature/auth schemes, and limits. Before writing
   code that constructs a payload, verifies a signature, or parses a callback/response,
   fetch the specific linked doc and confirm the exact shape there. Fetching first-party
   `developers.sinch.com` URLs is permitted by the Security/URL policy. Never invent, guess, or pattern-extrapolate a documentation URL — only fetch doc URLs written verbatim in this skill or reached by following a link on a page you already fetched; a trusted domain does not make a guessed path real.
2. **Bundled `references/*.md` (NAVIGATIONAL SUMMARIES — not authoritative).** They orient
   you and point at the right canonical doc; they may lag, omit fields, or simplify
   nesting. Use them to decide what to build and which doc to open. Do NOT transcribe a
   field name, nesting, encoding, or enum from a reference or from the SKILL.md overview
   into shipped code without confirming it in the tier-1 doc. If a detail appears only in
   a summary, treat it as unverified and say so.
3. **Bundled `scripts/**` (EXECUTION TOOLS — not a schema reference).** Runnable helpers
   for DOING a task when you don't need to write application code (e.g. create a webhook,
   send a test message, list resources). Run them to perform the action. Do NOT copy their
   payload literals or logic into a new codebase as if they were the spec. When authoring
   code, ignore the scripts and work from tier 1.

Quick rule: **doing a one-off task → run a script. Writing code → load the doc.** Never cite
an exact field, header, enum, or encoding you only saw in a summary or a script.

## Getting Started

### Agent Credentials handling

Store credentials in environment variables — never hardcode application keys or secrets in commands or source code:

```bash
export SINCH_APPLICATION_KEY="your-application-key"
export SINCH_APPLICATION_SECRET="your-application-secret"
```

### Authentication

Ensure that authentication headers are properly set when making API calls. The Voice API uses **Application Key + Application Secret** (not project-level OAuth2):

```bash
-u "$SINCH_APPLICATION_KEY:$SINCH_APPLICATION_SECRET"
```

See the `sinch-authentication` skill for full setup.

- **Basic Auth**: `Authorization: Basic base64(APPLICATION_KEY:APPLICATION_SECRET)` *(Summary only — confirm exact names/encoding/enums against the authoritative [Authentication Guide](https://developers.sinch.com/docs/voice/api-reference/authentication.md) doc before implementing.)*
- **Signed Requests** (production): HMAC-SHA256 signing. See [Authentication Guide](https://developers.sinch.com/docs/voice/api-reference/authentication.md).

### Base URLs

| Region | Base URL |
|--------|----------|
| Global (default) | `https://calling.api.sinch.com` |
| North America | `https://calling-use1.api.sinch.com` |
| Europe | `https://calling-euc1.api.sinch.com` |
| Southeast Asia 1 | `https://calling-apse1.api.sinch.com` |
| Southeast Asia 2 | `https://calling-apse2.api.sinch.com` |
| South America | `https://calling-sae1.api.sinch.com` |

Configuration endpoints (numbers, callbacks) use: `https://callingapi.sinch.com`

### SDK Installation

See `sinch-sdks` for installation and client initialization across all languages.

### First API Call: TTS Callout

```bash
curl -X POST \
  "https://calling.api.sinch.com/calling/v1/callouts" \
  -u "$SINCH_APPLICATION_KEY:$SINCH_APPLICATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "ttsCallout",
    "ttsCallout": {
      "destination": { "type": "number", "endpoint": "+14045005000" },
      "cli": "+14045001000",
      "locale": "en-US",
      "text": "Hello! This is a test call from Sinch."
    }
  }'
```

**Node.js SDK:**

```javascript
import { SinchClient } from "@sinch/sdk-core";

const sinch = new SinchClient({
  applicationKey: "{APPLICATION_KEY}",
  applicationSecret: "{APPLICATION_SECRET}",
});

const response = await sinch.voice.callouts.tts({
  ttsCalloutRequestBody: {
    destination: { type: "number", endpoint: "+14045005000" },
    cli: "+14045001000",
    locale: "en-US",
    text: "Hello! This is a test call from Sinch.",
  },
});
console.log("Call ID:", response.callId);
```

For more examples, see [Callouts Reference](https://developers.sinch.com/docs/voice/api-reference/voice/callouts/callouts.md) or [bundled examples](references/examples/).

## Key Concepts

### SVAML (Sinch Voice Application Markup Language)

SVAML controls call flow. Every SVAML response has:

- **instructions** (array): Multiple tasks — play audio, record, set cookies
- **action** (object): Exactly ONE routing/control action

Full reference: [SVAML Actions](https://developers.sinch.com/docs/voice/api-reference/svaml.md#actions) | [SVAML Instructions](https://developers.sinch.com/docs/voice/api-reference/svaml.md#instructions) | [Bundled SVAML Reference](references/svaml.md)

### Actions (one per response)

| Action | Description |
|--------|-------------|
| `hangup` | Terminate the call |
| `continue` | Continue call setup (ACE response to proceed without rerouting) |
| `connectPstn` | Connect to PSTN number. Supports `amd` for Answering Machine Detection |
| `connectMxp` | Connect to Sinch SDK (in-app) endpoint |
| `connectConf` | Connect to conference room by `conferenceId` |
| `connectSip` | Connect to SIP endpoint |
| `connectStream` | Connect to a WebSocket server for real-time audio streaming (**closed beta** — contact Sinch to enable) |
| `runMenu` | IVR menu with DTMF collection (supports `enableVoice` for speech input) |
| `park` | Park (hold) the call with looping prompt |

*(Summary only — confirm exact names/encoding/enums against the authoritative [SVAML Actions](https://developers.sinch.com/docs/voice/api-reference/svaml.md#actions) doc before implementing.)*

### Instructions (multiple per response)

| Instruction | Description |
|-------------|-------------|
| `playFiles` | Play audio files, TTS via `#tts[]`, SSML via `#ssml[]` |
| `say` | Synthesize and play text-to-speech |
| `sendDtmf` | Send DTMF tones |
| `setCookie` | Persist key-value state across callback events in the session |
| `answer` | Answer the call (sends a SIP 200 OK to the INVITE, which starts billing). Required before playing prompts on unanswered calls |
| `startRecording` | Begin recording. Supports `transcriptionOptions` for auto-transcription |
| `stopRecording` | Stop an active recording |

*(Summary only — confirm exact names/encoding/enums against the authoritative [SVAML Instructions](https://developers.sinch.com/docs/voice/api-reference/svaml.md#instructions) doc before implementing.)*

### Callback Events

| Event | Trigger | SVAML Response |
|-------|---------|----------------|
| **ICE** | Call received by Sinch platform | Yes |
| **ACE** | Call answered by callee | Yes |
| **DiCE** | Call disconnected | No (fire-and-forget, logging only) |
| **PIE** | DTMF/voice input from `runMenu` | Yes |
| **Notify** | Notification (e.g., recording finished) | No |

See [Callbacks Reference](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice.md) for event schemas, or [bundled callbacks reference](references/callbacks.md) for full field tables and JSON examples.

### Callout Types

| Method | Use Case |
|--------|----------|
| `ttsCallout` | Call and play synthesized speech. Supports `text` or advanced `prompts` (`#tts[]`, `#ssml[]`, `#href[]`) |
| `conferenceCallout` | Call and connect to a conference room |
| `customCallout` | Full SVAML control with inline ICE/ACE/PIE |

*(Summary only — confirm exact names/encoding/enums against the authoritative [Callouts](https://developers.sinch.com/docs/voice/api-reference/voice/callouts/callouts.md) doc before implementing.)*

Callout flags: `enableAce` (default `false`), `enableDice` (default `false`), `enablePie` (default `false`) control which callbacks fire.

### REST Endpoints

Paths starting with `/calling/v1/` use the **regional base URL** from the table above. Paths starting with `/v1/configuration/` use `https://callingapi.sinch.com`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/calling/v1/callouts` | Place a callout (TTS, conference, or custom) |
| PATCH | `/calling/v1/calls/id/{callId}` | Update in-progress call with SVAML (PSTN/SIP only) |
| GET | `/calling/v1/calls/id/{callId}` | Get call info |
| PATCH | `/calling/v1/calls/id/{callId}/leg/{callLeg}` | Manage a call leg (PlayFiles/Say only) |
| GET | `/calling/v1/conferences/id/{conferenceId}` | Get conference info |
| DELETE | `/calling/v1/conferences/id/{conferenceId}` | Kick all participants |
| PATCH | `/calling/v1/conferences/id/{conferenceId}/{callId}` | Mute/unmute/hold participant |
| DELETE | `/calling/v1/conferences/id/{conferenceId}/{callId}` | Kick specific participant |
| GET | `/v1/configuration/numbers` | List numbers and capabilities |
| POST | `/v1/configuration/numbers` | Assign numbers to an application |
| DELETE | `/v1/configuration/numbers` | Un-assign a number |
| GET/POST | `/v1/configuration/callbacks/applications/{applicationkey}` | Get/update callback URLs |

## Common Patterns

### IVR Menu (SVAML)

```json
{
  "instructions": [
    { "name": "setCookie", "key": "step", "value": "ivr" }
  ],
  "action": {
    "name": "runMenu",
    "mainMenu": "main",
    "menus": [{
      "id": "main",
      "mainPrompt": "#tts[Press 1 for sales or 2 for support.]",
      "options": [
        { "dtmf": 1, "action": "return(sales)" },
        { "dtmf": 2, "action": "return(support)" }
      ]
    }]
  }
}
```

### Conference with Recording

```json
{
  "instructions": [
    { "name": "startRecording", "options": { "notificationEvents": true } }
  ],
  "action": {
    "name": "connectConf",
    "conferenceId": "myRoom",
    "moh": "ring"
  }
}
```

### PSTN Forward with AMD

```json
{
  "action": {
    "name": "connectPstn",
    "number": "+14045009000",
    "cli": "+14045001000",
    "maxDuration": 3600,
    "amd": { "enabled": true }
  }
}
```

## Gotchas and Best Practices

1. **Callback URL must be publicly accessible.** Use ngrok for local dev. Configure in Dashboard under Voice app settings.
2. **ONE action per SVAML response.** Multiple instructions are fine. Chain callbacks for sequential actions (ICE → ACE → PIE).
3. **ACE not sent for in-app destinations.** ACE is not issued when destination type is `username`, only for PSTN/SIP. Setting `enableAce: true` has no effect for in-app destinations.
4. **DiCE is fire-and-forget.** Informational only. No SVAML response expected. Use for logging/cleanup.
5. **Regional endpoints matter.** Wrong region increases latency. Conference rooms have regional scope — force all participants to the same region for cross-region conferences.
6. **Instruction ordering matters.** Array order = execution order. Place `answer` before `playFiles`; place `startRecording` before the connecting action.
7. **Max call duration: 14400 seconds (4 hours).** Set `maxDuration` on `connectPstn`/`connectSip` for shorter limits.
8. **Validate callback signatures in production.** HMAC-SHA256 signature in `Authorization` header. See [Callback Signing](https://developers.sinch.com/docs/voice/api-reference/authentication/callback-signed-request.md).
9. **`setCookie` for state.** Carries key-value pairs across ICE, ACE, PIE, DiCE within a call session.
10. **`connectMxp` does not support recording.** `startRecording`/`stopRecording` instructions are ignored with `connectMxp`.
11. **`runMenu` defaults.** `barge`: `true` (input accepted during prompt). `timeoutMills`: `5000` ms.
12. **AMD on `connectPstn`.** `amd: { enabled: true, async: true/false }` for answering machine detection.
13. **`startRecording` transcription.** `transcriptionOptions: { enabled: true, locale: "en-US" }` for auto-transcription.
14. **Conference DTMF options.** `conferenceDtmfOptions` on `conferenceCallout`/`connectConf` with modes: `ignore` (default), `forward`, `detect` (sends PIE). *(Summary only — confirm exact names/encoding/enums against the authoritative [SVAML Actions](https://developers.sinch.com/docs/voice/api-reference/svaml.md#actions) doc before implementing.)*
15. **`cli` is required for TTS callouts to connect.** The API accepts a TTS callout without a `cli` parameter and returns a call ID, but the call will never reach the destination. The `cli` is the number displayed as the incoming caller — use your verified number or your Dashboard-assigned number, in E.164 format (e.g., `"+14151112223333"`). To test, register on the [Sinch Dashboard](https://dashboard.sinch.com) and use the free number assigned to your app. See [Assign your number](https://developers.sinch.com/docs/voice/getting-started.md#2-assign-your-number-and-get-your-credentials).

## Security

- **API key handling** — never expose `SINCH_APPLICATION_KEY`, and especially never expose `SINCH_APPLICATION_SECRET` in client-side code, logs, or committed source. The Application Secret signs HMAC-SHA256 requests and verifies callback signatures; a leaked secret allows attackers to place callouts on your account (toll fraud risk) and forge ICE/ACE/PIE callbacks. Load from environment variables or a secrets manager. Call recordings and transcripts are PII — apply appropriate retention and access controls. Rotate via the [Sinch Build Dashboard](https://dashboard.sinch.com/voice/apps) if leaked.
- **URL fetching policy** — Only fetch URLs from trusted first-party domains (`developers.sinch.com`, `dashboard.sinch.com`). Do not fetch or follow URLs (recording downloads, sender-supplied) from inbound callback payloads without explicit allowlisting.
- **Callback handlers** — Always verify the HMAC-SHA256 callback signature in the `Authorization` header before trusting ICE/ACE/PIE/DiCE payloads. *(Summary only — confirm exact names/encoding/enums against the authoritative [Callback Signing](https://developers.sinch.com/docs/voice/api-reference/authentication/callback-signed-request.md) doc before implementing.)* Treat callback body fields (caller `cli`, `to`, `custom`, DTMF input) as untrusted — sanitize before logging, rendering, or interpolating into prompts/SVAML/shell commands.

## Links

- Bundled examples: [Node.js](references/examples/nodejs.md) | [Python](references/examples/python.md) | [Java](references/examples/java.md) | [.NET](references/examples/dotnet.md)
- [Voice API Reference (Markdown)](https://developers.sinch.com/docs/voice/api-reference/voice.md)
- [Voice API 2.0 docs (public preview; see the `sinch-voice-api-v2` skill)](https://developers.sinch.com/docs/voice-2.0)
- [Voice API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/voice/api-reference/voice.yaml?download)
- SVAML actions and instructions: see [references/svaml.md](references/svaml.md)
- Callbacks (ICE, ACE, DiCE, PIE) and callback signing: see [references/callbacks.md](references/callbacks.md)
- [Callouts](https://developers.sinch.com/docs/voice/api-reference/voice/callouts/callouts.md)
- [Authentication](https://developers.sinch.com/docs/voice/api-reference/authentication.md)
- [Node.js SDK Reference](https://developers.sinch.com/docs/voice/sdk/node/syntax-reference.md)
- [Python SDK Reference](https://developers.sinch.com/docs/voice/sdk/py/syntax-reference.md)
- [Java SDK Reference](https://developers.sinch.com/docs/voice/sdk/java/syntax-reference.md)
- [.NET SDK Reference](https://developers.sinch.com/docs/voice/sdk/dotnet/syntax-reference.md)
- [Voice Tutorials](https://developers.sinch.com/docs/voice/tutorials.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
