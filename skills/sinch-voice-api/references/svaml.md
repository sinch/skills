# SVAML Reference

## Contents

- [Actions by Callback](#actions-by-callback)
- [Instructions by Callback](#instructions-by-callback)
- [Action Reference](#action-reference): hangup, continue, connectPstn, connectMxp, connectConf, connectSip, connectStream, runMenu, park
- [Instruction Reference](#instruction-reference): playFiles, say, sendDtmf, setCookie, answer, startRecording, stopRecording
- [Prompt Formats](#prompt-formats)

SVAML (Sinch Voice Application Markup Language) controls call flow. Every SVAML response contains:

- **instructions** (array): Zero or more tasks executed in order
- **action** (object): Exactly ONE routing/control action

```json
{
  "instructions": [ ... ],
  "action": { "name": "actionName", ... }
}
```

## Actions by Callback

Not all actions are available in every callback response:

| Action | ICE | ACE | PIE |
|--------|-----|-----|-----|
| `hangup` | ✅ | ✅ | ✅ |
| `continue` | — | ✅ | ✅ |
| `connectPstn` | ✅ | — | ✅ |
| `connectMxp` | ✅ | — | — |
| `connectConf` | ✅ | ✅ | ✅ |
| `connectSip` | ✅ | — | ✅ |
| `connectStream` | ✅ | — | — |
| `runMenu` | ✅ | ✅ | ✅ |
| `park` | ✅ | — | — |

## Instructions by Callback

| Instruction | ICE | ACE | PIE |
|-------------|-----|-----|-----|
| `playFiles` | ✅ | ✅ | ✅ |
| `say` | ✅ | ✅ | ✅ |
| `sendDtmf` | ✅ | — | ✅ |
| `setCookie` | ✅ | ✅ | ✅ |
| `answer` | ✅ | — | — |
| `startRecording` | ✅ | ✅ | ✅ |
| `stopRecording` | ✅ | ✅ | ✅ |

---

## Action Reference

### hangup

Terminates the call.

```json
{ "action": { "name": "hangup" } }
```

### continue

Continues call setup without rerouting. ACE/PIE only.

```json
{ "action": { "name": "continue" } }
```

### connectPstn

Connects to a PSTN number.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"connectPstn"` |
| `number` | string | No | E.164 number to connect to. If omitted, uses the called extension |
| `cli` | string | No | Override caller ID. Use `"private"` to withhold |
| `maxDuration` | integer | No | Max call duration in seconds (max 14400) |
| `dialTimeout` | integer | No | Max seconds to wait for answer before TIMEOUT |
| `locale` | string | No | TTS locale (default: `"en-US"`) |
| `dtmf` | string | No | DTMF tones to play when answered. `0-9`, `#`, `w` (500ms pause) |
| `suppressCallbacks` | boolean | No | Suppress ACE and DiCE callbacks |
| `indications` | string | No | Country code for ringback tone (e.g., `"us"`, `"se"`, `"uk"`) |
| `amd` | object | No | Answering Machine Detection. `{ "enabled": true }` |

```json
{
  "action": {
    "name": "connectPstn",
    "number": "+461234567890",
    "cli": "+460987654321",
    "maxDuration": 3000,
    "dialTimeout": 10,
    "locale": "en-US",
    "amd": { "enabled": true }
  }
}
```

### connectMxp

Connects to a Sinch SDK (in-app) endpoint.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"connectMxp"` |
| `destination` | object | Yes | `{ "type": "username", "endpoint": "userId" }` |
| `callHeaders` | array | No | Custom headers: `[{ "key": "k", "value": "v" }]` |

```json
{
  "action": {
    "name": "connectMxp",
    "destination": { "type": "username", "endpoint": "johndoe" },
    "callHeaders": [{ "key": "foo", "value": "bar" }]
  }
}
```

### connectConf

Connects to a conference room.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"connectConf"` |
| `conferenceId` | string | Yes | Conference identifier (max 64 chars) |
| `conferenceDtmfOptions` | object | No | DTMF handling: `{ "mode": "ignore"|"forward"|"detect" }` |
| `moh` | string | No | Music on hold for first participant: `"ring"` |

```json
{
  "action": {
    "name": "connectConf",
    "conferenceId": "myConference",
    "moh": "ring"
  }
}
```

### connectSip

Connects to a SIP endpoint.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"connectSip"` |
| `destination` | object | Yes | `{ "type": "Sip", "endpoint": "user@sip.example.com" }` |
| `maxDuration` | integer | No | Max call duration in seconds (max 14400) |
| `cli` | string | No | Override caller ID. Use `"private"` to withhold |
| `transport` | string | No | `"UDP"` (default), `"TCP"`, or `"TLS"` |
| `suppressCallbacks` | boolean | No | Suppress ACE and DiCE callbacks |
| `callHeaders` | array | No | Private SIP headers |
| `moh` | string | No | Music on hold if SIP call is placed on hold |

```json
{
  "action": {
    "name": "connectSip",
    "destination": { "type": "Sip", "endpoint": "46708000000@sip.foo.com" },
    "maxDuration": 3000,
    "transport": "tls"
  }
}
```

### connectStream

Connects to a WebSocket server for real-time audio streaming.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"connectStream"` |
| `destination` | object | Yes | `{ "type": "Websocket", "endpoint": "wss://..." }` |
| `streamingOptions` | object | No | `{ "version": 1, "sampleRate": 44100 }` |
| `maxDuration` | integer | No | Max duration in seconds (max 14400) |
| `callHeaders` | array | No | Custom headers sent in initial WebSocket message |

```json
{
  "action": {
    "name": "connectStream",
    "destination": { "type": "Websocket", "endpoint": "wss://yourcompany.com/ws" },
    "streamingOptions": { "version": 1, "sampleRate": 44100 },
    "maxDuration": 3600
  }
}
```

### runMenu

IVR menu with DTMF/voice input collection. Triggers PIE callback on input.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"runMenu"` |
| `barge` | boolean | No | Allow input during prompt playback (default: `true`) |
| `locale` | string | No | TTS locale. Required if `enableVoice` is `true` |
| `mainMenu` | string | No | ID of the first menu to play |
| `enableVoice` | boolean | No | Enable speech input in addition to DTMF |
| `menus` | array | No | Menu definitions (see below) |

**Menu object:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Menu identifier. One menu must have `id: "main"` |
| `mainPrompt` | string | Prompt to play: `#tts[...]`, `#ssml[...]`, or `#href[url]` |
| `repeatPrompt` | string | Prompt on invalid/no input |
| `repeats` | integer | Number of times to repeat on timeout |
| `maxDigits` | integer | Max DTMF digits to collect |
| `timeoutMills` | integer | Timeout in ms (default: 5000) |
| `maxTimeoutMills` | integer | Max timeout for multi-digit input |
| `options` | array | `[{ "dtmf": 1, "action": "return(value)" | "menu(menuId)" }]` |

```json
{
  "action": {
    "name": "runMenu",
    "barge": true,
    "mainMenu": "main",
    "menus": [
      {
        "id": "main",
        "mainPrompt": "#tts[Press 1 for support or 2 to continue.]",
        "options": [
          { "dtmf": 1, "action": "return(support)" },
          { "dtmf": 2, "action": "menu(sub)" }
        ]
      },
      {
        "id": "sub",
        "mainPrompt": "#tts[Enter your 4-digit PIN.]",
        "maxDigits": 4,
        "timeoutMills": 10000,
        "options": [
          { "dtmf": 1, "action": "menu(main)" }
        ]
      }
    ]
  }
}
```

### park

Parks the call with looping hold prompt.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"park"` |
| `locale` | string | No | TTS locale |
| `introPrompt` | string | No | Played once when parked: `#tts[...]` or `#ssml[...]` |
| `holdPrompt` | string | No | Loops until unparked or `maxDuration` reached |
| `maxDuration` | integer | No | Max hold time in seconds |

```json
{
  "action": {
    "name": "park",
    "introPrompt": "#tts[Please hold.]",
    "holdPrompt": "#tts[Your call is important to us.]",
    "maxDuration": 180
  }
}
```

---

## Instruction Reference

### playFiles

Plays IVR files, TTS, or SSML.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"playFiles"` |
| `ids` | array | Yes | File URLs, `#tts[text]`, or `#ssml[commands]` |
| `locale` | string | No | Required for TTS/SSML |

```json
{ "name": "playFiles", "ids": ["#tts[Welcome]"], "locale": "en-US" }
```

### say

Synthesizes and plays text-to-speech. Max 600 characters (contact support to increase).

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"say"` |
| `text` | string | No | The message to speak |
| `locale` | string | No | TTS locale |

```json
{ "name": "say", "text": "Hello from Sinch!", "locale": "en-US" }
```

### sendDtmf

Sends DTMF tones. Valid characters: `0-9`, `#`, `w` (500ms pause).

```json
{ "name": "sendDtmf", "value": "ww1234#w#" }
```

### setCookie

Persists key-value state across callback events within the same call session.

```json
{ "name": "setCookie", "key": "step", "value": "greeting_done" }
```

### answer

Forces the call to be answered (starts billing). Place before `playFiles` if playing audio on an unanswered call.

```json
{ "name": "answer" }
```

### startRecording

Begins recording the call.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Must be `"startRecording"` |
| `options.destinationUrl` | string | No | URL to upload recording |
| `options.credentials` | string | No | Credentials for upload |
| `options.format` | string | No | Recording format |
| `options.notificationEvents` | boolean | No | Send Notify event when recording finishes |
| `options.transcriptionOptions.enabled` | boolean | No | Enable auto-transcription |
| `options.transcriptionOptions.locale` | string | No | Transcription locale (e.g., `"en-US"`) |

```json
{
  "name": "startRecording",
  "options": {
    "destinationUrl": "s3://bucket/recordings/",
    "credentials": "accesskey:secretkey",
    "notificationEvents": true,
    "transcriptionOptions": { "enabled": true, "locale": "en-US" }
  }
}
```

### stopRecording

Stops the active recording.

```json
{ "name": "stopRecording" }
```

---

## Prompt Formats

Use these within `playFiles.ids`, `runMenu` prompts, and `park` prompts:

| Format | Syntax | Example |
|--------|--------|---------|
| Text-to-speech | `#tts[text]` | `#tts[Welcome to support.]` |
| SSML | `#ssml[commands]` | `#ssml[<speak><break time="1s"/>Hello</speak>]` |
| Audio file URL | `#href[url]` | `#href[https://example.com/greeting.wav]` |

## Links

- [SVAML Actions Reference](https://developers.sinch.com/docs/voice/api-reference/svaml#actions)
- [SVAML Instructions Reference](https://developers.sinch.com/docs/voice/api-reference/svaml#instructions)
- [Voice Locales (TTS languages)](https://developers.sinch.com/docs/voice/api-reference/voice-locales)
