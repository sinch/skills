---
name: sinch-voice-api
description: Build voice apps with Sinch Voice REST API. Use for making/receiving calls, IVR menus, TTS, conference calling, call recording, and SVAML call control.
---

# Sinch Voice API

## Overview

The Sinch Voice API lets you make, receive, and control voice calls programmatically via REST. It uses **SVAML** (Sinch Voice Application Markup Language) to define call flows through callback events. You can place outbound calls (callouts), handle incoming calls with IVR logic, bridge to PSTN or SIP, record calls, and run conference rooms.

Key capabilities:
- **Callouts**: Text-to-speech (TTS), conference, and custom callouts to phone numbers or app users
- **Call control**: Respond to callback events with SVAML to route, play audio, collect DTMF, record, and more
- **Conferences**: Create and manage multi-party conference calls
- **Number masking**: Connect two parties without revealing their real phone numbers

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

The Voice API uses **Application Key + Application Secret** (not project-level OAuth2). Find these in the Sinch Dashboard under your Voice app.

Two auth methods are supported:

**Basic Authentication** (simplest):
```
Authorization: Basic base64(APPLICATION_KEY:APPLICATION_SECRET)
```

**Signed Requests** (production recommended):
Uses HMAC-SHA256 signing with your Application Secret. The signature covers the HTTP verb, Content-MD5, content type, timestamp headers, and canonicalized resource.

### Base URLs

The Voice API uses regional endpoints. Choose the closest to your users:

| Region | Base URL |
|--------|----------|
| Global (default) | `https://calling.api.sinch.com/calling/v1` |
| North America | `https://calling-use1.api.sinch.com/calling/v1` |
| Europe | `https://calling-euc1.api.sinch.com/calling/v1` |
| Southeast Asia 1 | `https://calling-apse1.api.sinch.com/calling/v1` |
| Southeast Asia 2 | `https://calling-apse2.api.sinch.com/calling/v1` |
| South America | `https://calling-sae1.api.sinch.com/calling/v1` |

### SDK Installation

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` |
| Node.js (standalone) | `@sinch/voice` | `npm install @sinch/voice` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First API Call: Text-to-Speech Callout

**curl:**
```bash
curl -X POST "https://calling.api.sinch.com/calling/v1/callouts" \
  -H "Content-Type: application/json" \
  -u "YOUR_APPLICATION_KEY:YOUR_APPLICATION_SECRET" \
  -d '{
    "method": "ttsCallout",
    "ttsCallout": {
      "destination": {
        "type": "number",
        "endpoint": "+14045005000"
      },
      "cli": "+14045001000",
      "locale": "en-US",
      "text": "Hello! This is a test call from Sinch."
    }
  }'
```

**Node.js SDK:**
```javascript
const { SinchClient } = require('@sinch/sdk-core');

const sinchClient = new SinchClient({
  applicationKey: process.env.SINCH_APPLICATION_KEY,
  applicationSecret: process.env.SINCH_APPLICATION_SECRET,
});

async function makeTtsCall() {
  const response = await sinchClient.voice.callouts.tts({
    ttsCalloutRequestBody: {
      method: 'ttsCallout',
      ttsCallout: {
        destination: {
          type: 'number',
          endpoint: '+14045005000',
        },
        cli: '+14045001000',
        locale: 'en-US',
        text: 'Hello! This is a test call from Sinch.',
      },
    },
  });
  console.log('Call ID:', response.callId);
}

makeTtsCall();
```

## Key Concepts

### SVAML (Sinch Voice Application Markup Language)

SVAML is the call control markup language used to instruct the Sinch platform how to handle a call. A SVAML response contains two parts:

- **instructions** (array): Tasks to perform during the call (play audio, start recording, set cookies). You can include multiple instructions.
- **action** (object): How to route/control the call. Only ONE action per SVAML response.

Example SVAML response:
```json
{
  "instructions": [
    { "name": "playFiles", "ids": ["welcome_message.wav"], "locale": "en-US" },
    { "name": "say", "text": "Press 1 for sales.", "locale": "en-US" }
  ],
  "action": {
    "name": "runMenu",
    "menus": [
      {
        "id": "main",
        "mainPrompt": "#tts[Press 1 for sales, 2 for support]",
        "options": [
          { "dtmf": "1", "action": "menu(sales)" },
          { "dtmf": "2", "action": "menu(support)" }
        ]
      }
    ]
  }
}
```

### SVAML Actions (one per response)

| Action | Description |
|--------|-------------|
| `connectPstn` | Connect the call to a PSTN phone number |
| `connectMxp` | Connect to a Sinch SDK (in-app) endpoint |
| `connectConf` | Connect to a conference room by conferenceId |
| `connectSip` | Connect to a SIP endpoint |
| `runMenu` | Play an IVR menu and collect DTMF input |
| `park` | Park (hold) the call |
| `hangup` | Terminate the call |

### SVAML Instructions (multiple per response)

| Instruction | Description |
|-------------|-------------|
| `playFiles` | Play audio files, TTS via `#tts[]`, or SSML via `#ssml[]` |
| `say` | Synthesize and play text-to-speech |
| `sendDtmf` | Send DTMF tones |
| `setCookie` | Set a cookie value carried across callback events in the session |
| `answer` | Force-answer the call before connecting (starts billing) |
| `startRecording` | Begin recording the call |
| `stopRecording` | Stop an active recording |

### Callback Events

Your backend receives these HTTP POST callbacks during a call lifecycle. Respond with SVAML to control the call.

| Event | Trigger | Supports SVAML Response |
|-------|---------|------------------------|
| **ICE** (Incoming Call Event) | Call received by Sinch platform | Yes (instructions + action) |
| **ACE** (Answered Call Event) | Call answered by callee | Yes (instructions + action) |
| **DiCE** (Disconnected Call Event) | Call disconnected | No (only hangup action) |
| **PIE** (Prompt Input Event) | DTMF input received from runMenu | Yes (instructions + action) |
| **Notify** | Generic notification (e.g., recording finished) | No |

### Callout Types

| Type | Method | Use Case |
|------|--------|----------|
| TTS Callout | `ttsCallout` | Place a call and play synthesized speech |
| Conference Callout | `conferenceCallout` | Place a call and connect to a conference room |
| Custom Callout | `customCallout` | Place a call with full SVAML control (ICE/ACE inline) |

## Common Patterns

### IVR Menu with DTMF Input

Handle ICE callback with a runMenu action:

**curl (ICE callback response):**
```json
{
  "instructions": [
    { "name": "answer" }
  ],
  "action": {
    "name": "runMenu",
    "barge": true,
    "menus": [
      {
        "id": "main",
        "mainPrompt": "#tts[Welcome. Press 1 for sales, 2 for support, or 3 to leave a message.]",
        "repeatPrompt": "#tts[Please make a selection.]",
        "maxDigits": 1,
        "timeoutMills": 10000,
        "options": [
          { "dtmf": "1", "action": "return(sales)" },
          { "dtmf": "2", "action": "return(support)" },
          { "dtmf": "3", "action": "return(voicemail)" }
        ]
      }
    ]
  }
}
```

### Conference Calling

**Node.js SDK:**
```javascript
async function startConferenceCall(phoneNumber, conferenceId) {
  const response = await sinchClient.voice.callouts.conference({
    conferenceCalloutRequestBody: {
      method: 'conferenceCallout',
      conferenceCallout: {
        destination: {
          type: 'number',
          endpoint: phoneNumber,
        },
        cli: '+14045001000',
        conferenceId: conferenceId,
        greeting: 'You are joining the team standup.',
        mohClass: 'ring',
      },
    },
  });
  return response.callId;
}
```

### Call Recording

Return this SVAML in your ACE callback to start recording:
```json
{
  "instructions": [
    {
      "name": "startRecording",
      "options": {
        "destinationUrl": "s3://your-bucket/recordings/",
        "credentials": "your-s3-credentials",
        "notificationEvents": true
      }
    }
  ],
  "action": {
    "name": "continue"
  }
}
```

### Connect to PSTN (Call Forwarding)

ICE callback response to forward an incoming call:
```json
{
  "instructions": [],
  "action": {
    "name": "connectPstn",
    "number": "+14045009000",
    "locale": "en-US",
    "maxDuration": 3600,
    "dialTimeout": 30,
    "cli": "+14045001000",
    "indications": "us"
  }
}
```

### Manage an Active Call (Play TTS Mid-Call)

```bash
curl -X PATCH "https://calling.api.sinch.com/calling/v1/calls/id/CALL_ID" \
  -H "Content-Type: application/json" \
  -u "YOUR_APPLICATION_KEY:YOUR_APPLICATION_SECRET" \
  -d '{
    "instructions": [
      { "name": "say", "text": "Your meeting starts in 5 minutes.", "locale": "en-US" }
    ],
    "action": { "name": "continue" }
  }'
```

## Gotchas and Best Practices

1. **Callback URL must be publicly accessible.** The Sinch platform sends HTTP POST requests to your callback URL. Use a tool like ngrok for local development. Configure the callback URL in the Sinch Dashboard under your Voice app settings.

2. **Only ONE action per SVAML response.** You can include multiple instructions, but exactly one action. If you need sequential actions, use callback chaining (e.g., ICE -> ACE -> PIE).

3. **ACE callbacks are NOT sent for in-app calls.** ACE is only triggered for PSTN and SIP call destinations, not for `connectMxp` (app-to-app) calls.

4. **DiCE is fire-and-forget.** The DiCE callback does not support SVAML instructions. It only accepts the `hangup` action. Use it for logging and cleanup only.

5. **Regional endpoints matter.** Using the wrong regional endpoint increases latency. Choose the endpoint closest to your users. You can set the region per service category in the SDK:
   ```javascript
   sinchClient.voice.calls.setRegion(VoiceRegion.EUROPE);
   ```

6. **SVAML instruction ordering matters.** Instructions execute in array order. Place `answer` before `playFiles` if you need the call answered before playing audio. Place `startRecording` before the action that connects the call.

7. **Max call duration is 14400 seconds (4 hours).** Set `maxDuration` on `connectPstn` to enforce shorter limits. Calls exceeding this are automatically disconnected.

8. **Callback signing for security.** In production, validate the HMAC-SHA256 signature on incoming callbacks to ensure they originate from Sinch. The signature is in the `Authorization` header.

9. **Cookie persistence across events.** Use the `setCookie` instruction to carry state between ICE, ACE, PIE, and DiCE events within the same call session. Cookies are simple key-value pairs.

10. **connectMxp does not support recording.** Call recording via `startRecording` is not available when using the `connectMxp` action.

## Links

- [Voice API Reference](https://developers.sinch.com/docs/voice/api-reference/voice)
- [Voice API Overview](https://developers.sinch.com/docs/voice/api-reference/voice/overview/)
- [SVAML Actions Reference](https://developers.sinch.com/docs/voice/api-reference/svaml/actions)
- [SVAML Instructions Reference](https://developers.sinch.com/docs/voice/api-reference/svaml/instructions)
- [Callbacks Reference](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks)
- [Callouts Reference](https://developers.sinch.com/docs/voice/api-reference/voice/callouts)
- [Node.js SDK Reference](https://developers.sinch.com/docs/voice/sdk/node/syntax-reference)
- [Authentication Guide](https://developers.sinch.com/docs/voice/api-reference/authentication)
- [Callback Signing](https://developers.sinch.com/docs/voice/api-reference/authentication/callback-signed-request)
- [Voice API Tutorials](https://developers.sinch.com/docs/voice/tutorials/callout-callback-node)
- [GitHub: Voice Webhook Sample (Node.js)](https://github.com/sinch/voice-api-webhook-nodejs)
- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core)
- [npm: @sinch/voice](https://www.npmjs.com/package/@sinch/voice)
- [Voice API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/voice/api-reference/voice.yaml?download)
- [Voice API Reference (Markdown)](https://developers.sinch.com/docs/voice/api-reference/voice.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
