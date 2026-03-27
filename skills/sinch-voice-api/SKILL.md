---
name: sinch-voice-api
description: Build voice apps with Sinch Voice REST API. Use for phone calls, text-to-speech (TTS), IVR menus, DTMF input, conference calling, call recording, call forwarding, answering machine detection (AMD), SIP routing, WebSocket audio streaming, and SVAML call control.
metadata:
  author: Sinch
  version: 1.0.0
---

# Sinch Voice API

## Overview

The Sinch Voice API lets you make, receive, and control voice calls programmatically via REST. It uses **SVAML** (Sinch Voice Application Markup Language) to define call flows through callback events.

## Agent Instructions

Before generating code, you MUST ask the user:

1. **Approach** — SDK or direct API calls (curl/fetch/requests)?
   - [Node.js SDK Reference](https://developers.sinch.com/docs/voice/sdk/node/syntax-reference.md)
   - [Python SDK Reference](https://developers.sinch.com/docs/voice/sdk/py/syntax-reference.md)
   - [Java SDK Reference](https://developers.sinch.com/docs/voice/sdk/java/syntax-reference.md)
   - [.NET SDK Reference](https://developers.sinch.com/docs/voice/sdk/dotnet/syntax-reference.md)
2. **Language** — Node.js, Python, Java, .NET, curl?

When generating SDK code, fetch the corresponding SDK reference page for accurate method signatures, or use the bundled examples:
- [Node.js examples](references/examples/nodejs.md) | [Python examples](references/examples/python.md) | [Java examples](references/examples/java.md) | [.NET examples](references/examples/dotnet.md)

When generating direct API calls, use the [Voice API Reference (Markdown)](https://developers.sinch.com/docs/voice/api-reference/voice.md) for request/response schemas.

## Getting Started

### Authentication

See the [sinch-authentication](../sinch-authentication/SKILL.md) skill. The Voice API uses **Application Key + Application Secret** (not project-level OAuth2).

- **Basic Auth**: `Authorization: Basic base64(APPLICATION_KEY:APPLICATION_SECRET)`
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

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip3 install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First API Call: TTS Callout

```bash
curl -X POST "https://calling.api.sinch.com/calling/v1/callouts" \
  -H "Content-Type: application/json" \
  -u "YOUR_APPLICATION_KEY:YOUR_APPLICATION_SECRET" \
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
  applicationKey: "YOUR_APPLICATION_KEY",
  applicationSecret: "YOUR_APPLICATION_SECRET",
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

For more examples, see [Callouts Reference](https://developers.sinch.com/docs/voice/api-reference/voice/callouts/callouts) or [bundled examples](references/examples/).

## Key Concepts

### SVAML (Sinch Voice Application Markup Language)

SVAML controls call flow. Every SVAML response has:

- **instructions** (array): Multiple tasks — play audio, record, set cookies
- **action** (object): Exactly ONE routing/control action

Full reference: [SVAML Actions](https://developers.sinch.com/docs/voice/api-reference/svaml#actions) | [SVAML Instructions](https://developers.sinch.com/docs/voice/api-reference/svaml#instructions) | [Bundled SVAML Reference](references/svaml.md)

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

### Callback Events

| Event | Trigger | SVAML Response |
|-------|---------|----------------|
| **ICE** | Call received by Sinch platform | Yes |
| **ACE** | Call answered by callee | Yes |
| **DiCE** | Call disconnected | No (fire-and-forget, logging only) |
| **PIE** | DTMF/voice input from `runMenu` | Yes |
| **Notify** | Notification (e.g., recording finished) | No |

See [Callbacks Reference](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice) for event schemas, or [bundled callbacks reference](references/callbacks.md) for full field tables and JSON examples.

### Callout Types

| Method | Use Case |
|--------|----------|
| `ttsCallout` | Call and play synthesized speech. Supports `text` or advanced `prompts` (`#tts[]`, `#ssml[]`, `#href[]`) |
| `conferenceCallout` | Call and connect to a conference room |
| `customCallout` | Full SVAML control with inline ICE/ACE/PIE |

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

## Executable Scripts

Bundled Node.js scripts (no external dependencies, uses Basic Auth):

```bash
export SINCH_APPLICATION_KEY="your-app-key"
export SINCH_APPLICATION_SECRET="your-app-secret"
export SINCH_VOICE_REGION="global"  # optional
```

| Script | Description | Example |
|--------|-------------|--------|
| `make_tts_call.cjs` | TTS callout | `node scripts/make_tts_call.cjs --to +14045005000 --text "Hello"` |
| `make_conference_call.cjs` | Conference callout | `node scripts/make_conference_call.cjs --to +14045005000 --conference-id myRoom` |
| `get_call_info.cjs` | Get call details | `node scripts/get_call_info.cjs --call-id CALL_ID` |
| `list_numbers.cjs` | List voice numbers | `node scripts/list_numbers.cjs` |

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
14. **Conference DTMF options.** `conferenceDtmfOptions` on `conferenceCallout`/`connectConf` with modes: `ignore` (default), `forward`, `detect` (sends PIE).
15. **`cli` is required for TTS callouts to connect.** The API accepts a TTS callout without a `cli` parameter and returns a call ID, but the call will never reach the destination. The `cli` is the number displayed as the incoming caller — use your verified number or your Dashboard-assigned number, in E.164 format (e.g., `"+14151112223333"`). To test, register on the [Sinch Dashboard](https://dashboard.sinch.com) and use the free number assigned to your app. See [Assign your number](https://developers.sinch.com/docs/voice/getting-started#2-assign-your-number-and-get-your-credentials).

## Links

- [Voice API Reference (Markdown)](https://developers.sinch.com/docs/voice/api-reference/voice.md)
- [Voice API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/voice/api-reference/voice.yaml?download)
- [SVAML Actions](https://developers.sinch.com/docs/voice/api-reference/svaml#actions) | [SVAML Instructions](https://developers.sinch.com/docs/voice/api-reference/svaml#instructions)
- [Callbacks](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice) | [Callouts](https://developers.sinch.com/docs/voice/api-reference/voice/callouts/callouts)
- [Authentication](https://developers.sinch.com/docs/voice/api-reference/authentication.md) | [Callback Signing](https://developers.sinch.com/docs/voice/api-reference/authentication/callback-signed-request.md)
- [Node.js SDK Reference](https://developers.sinch.com/docs/voice/sdk/node/syntax-reference.md)
- [Python SDK Reference](https://developers.sinch.com/docs/voice/sdk/py/syntax-reference.md)
- [Java SDK Reference](https://developers.sinch.com/docs/voice/sdk/java/syntax-reference.md)
- [.NET SDK Reference](https://developers.sinch.com/docs/voice/sdk/dotnet/syntax-reference.md)
- [Voice Tutorials](https://developers.sinch.com/docs/voice/tutorials)
- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core) | [npm: @sinch/voice](https://www.npmjs.com/package/@sinch/voice)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
