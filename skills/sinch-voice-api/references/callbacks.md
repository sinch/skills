> **Not a schema.** This file describes when each Voice callback (ICE, ACE, DiCE, PIE, notify)
> fires and lists notable fields. For payload shape (field names, nesting, encodings, enums),
> refer to the canonical `developers.sinch.com` docs linked from the parent
> [SKILL.md](../SKILL.md) before writing code or prose that states payload structure.

# Voice API Callback Events

## Contents

- [Common Fields](#common-fields)
- [ICE — Incoming Call Event](#ice--incoming-call-event)
- [ACE — Answered Call Event](#ace--answered-call-event)
- [DiCE — Disconnected Call Event](#dice--disconnected-call-event)
- [PIE — Prompt Input Event](#pie--prompt-input-event)
- [Notify Event](#notify-event)
- [AMD — Answering Machine Detection](#amd--answering-machine-detection)

The Sinch platform sends callback events as POST requests to your configured callback URL. Events that accept SVAML must return a valid SVAML response. Events that don't accept SVAML (DiCE, Notify) are fire-and-forget — return `200 OK` with empty body.

## Common Fields

All callback events include these base fields:

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type: `ice`, `ace`, `dice`, `pie`, `notify` |
| `callId` | string | Unique call identifier |
| `version` | integer | API version |
| `custom` | string | Custom data passed with the call |
| `applicationKey` | string | Your application key |

*(Summary only — confirm exact names/encoding/enums against the authoritative [ICE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice) doc before implementing.)*

Call-related events (ICE, ACE, DiCE) also include:

| Field | Type | Description |
|-------|------|-------------|
| `callResourceUrl` | string | URL to manage this call via REST |
| `timestamp` | string | ISO 8601 timestamp |

*(Summary only — confirm exact names/encoding/enums against the authoritative [ICE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice) doc before implementing.)*

---

## ICE — Incoming Call Event

Fired when a call reaches the Sinch platform. **Requires SVAML response.**

### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `cli` | string | Caller ID (E.164) |
| `to` | object | Destination: `{ "type": "number"|"username"|"sip"|"did", "endpoint": "..." }` |
| `domain` | string | `"pstn"` or `"mxp"` |
| `originationType` | string | Origin domain |
| `duration` | integer | Call duration in seconds |
| `rdnis` | string | Redirected Dialled Number Identification Service |
| `callHeaders` | array | Headers from SDK client: `[{ "key": "k", "value": "v" }]` |
| `userRate` | object | `{ "currencyId": "USD", "amount": 0.01 }` |

*(Summary only — confirm exact names/encoding/enums against the authoritative [ICE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice) doc before implementing.)*

### Example Request

```json
{
  "event": "ice",
  "callId": "aaa11111222233334444555566667777",
  "callResourceUrl": "https://calling-euc1.api.sinch.com/calling/v1/calls/id/aaa11111222233334444555566667777",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": 1,
  "custom": "",
  "applicationKey": "00000000-0000-0000-0000-000000000000",
  "cli": "+15551000001",
  "to": { "type": "number", "endpoint": "+15551000002" },
  "domain": "pstn",
  "originationType": "pstn",
  "userRate": { "currencyId": "USD", "amount": 0.0 }
}
```

### Example SVAML Response

```json
{
  "instructions": [
    { "name": "say", "text": "Welcome to our service.", "locale": "en-US" }
  ],
  "action": {
    "name": "connectPstn",
    "number": "+15551000003",
    "cli": "+15551000001"
  }
}
```

---

## ACE — Answered Call Event

Fired when the callee answers. **Requires SVAML response.** Not sent for in-app (`username`) destinations, even with `enableAce: true`.

### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `amd` | object | Answering Machine Detection result (if AMD was enabled). See AMD section below |

### Example Request

```json
{
  "event": "ace",
  "callId": "aaa11111222233334444555566667777",
  "callResourceUrl": "https://calling-euc1.api.sinch.com/calling/v1/calls/id/aaa11111222233334444555566667777",
  "timestamp": "2024-01-15T10:30:05Z",
  "version": 1,
  "custom": "",
  "applicationKey": "00000000-0000-0000-0000-000000000000"
}
```

### Example SVAML Responses

**Continue the call (no rerouting):**
```json
{ "action": { "name": "continue" } }
```

**Play a menu:**
```json
{
  "instructions": [
    { "name": "startRecording", "options": { "notificationEvents": true } }
  ],
  "action": {
    "name": "runMenu",
    "mainMenu": "main",
    "menus": [
      {
        "id": "main",
        "mainPrompt": "#tts[Press 1 for sales or 2 for support.]",
        "options": [
          { "dtmf": 1, "action": "return(sales)" },
          { "dtmf": 2, "action": "return(support)" }
        ]
      }
    ]
  }
}
```

---

## DiCE — Disconnected Call Event

Fired when the call ends. **Fire-and-forget — no SVAML response.** Return `200 OK`. Use for logging, cleanup, and billing reconciliation.

### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `reason` | string | Disconnect reason (see table below) |
| `result` | string | `"ANSWERED"`, `"BUSY"`, `"NOANSWER"`, `"FAILED"`, `"N/A"` |
| `duration` | integer | Call duration in seconds |
| `debit` | object | `{ "currencyId": "USD", "amount": 0.05 }` — actual cost |
| `userRate` | object | Per-minute rate |
| `to` | object | Destination |
| `from` | string | Caller info |
| `callHeaders` | array | Headers from SDK client |

*(Summary only — confirm exact names/encoding/enums against the authoritative [DiCE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/dice) doc before implementing.)*

### Disconnect Reasons

| Reason | Description |
|--------|-------------|
| `CALLERHANGUP` | Caller hung up |
| `CALLEEHANGUP` | Callee hung up |
| `TIMEOUT` | Exceeded configured timeout |
| `CANCEL` | Call was canceled |
| `BUSY` | Callee line busy |
| `NOANSWER` | No answer |
| `BLOCKED` | Call blocked |
| `MANAGERHANGUP` | Call manager terminated |
| `NOCREDITPARTNER` | Insufficient credit |
| `CONGESTION` | No available routes |
| `GENERALERROR` | Unspecified error |
| `CALLBACKERROR` | Callback URL error |
| `USERNOTFOUND` | User not found |
| `OTHERPEERANSWERED` | Another instance answered |

*(Summary only — confirm exact names/encoding/enums against the authoritative [DiCE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/dice) doc before implementing.)*

### Example Request

```json
{
  "event": "dice",
  "callId": "aaa11111222233334444555566667777",
  "timestamp": "2024-01-15T10:35:00Z",
  "version": 1,
  "custom": "",
  "applicationKey": "00000000-0000-0000-0000-000000000000",
  "reason": "CALLEEHANGUP",
  "result": "ANSWERED",
  "duration": 295,
  "debit": { "currencyId": "USD", "amount": 0.05 },
  "userRate": { "currencyId": "USD", "amount": 0.01 }
}
```

---

## PIE — Prompt Input Event

Fired when a `runMenu` action collects input. **Requires SVAML response.**

### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `menuResult` | object | The collected input (see below) |

### menuResult Object

| Field | Type | Description |
|-------|------|-------------|
| `menuId` | string | ID of the menu that triggered the event |
| `type` | string | `"return"`, `"sequence"`, `"timeout"`, `"hangup"`, `"invalidinput"`, `"error"` |
| `value` | string | The collected value (e.g., `"support"` for `return(support)`, or DTMF digits for `sequence`) |
| `inputMethod` | string | `"dtmf"` or `"voice"` |

*(Summary only — confirm exact names/encoding/enums against the authoritative [PIE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/pie) doc before implementing.)*

### Example Request

```json
{
  "event": "pie",
  "callId": "aaa11111222233334444555566667777",
  "timestamp": "2024-01-15T10:30:10Z",
  "version": 1,
  "applicationKey": "00000000-0000-0000-0000-000000000000",
  "menuResult": {
    "menuId": "main",
    "type": "return",
    "value": "support",
    "inputMethod": "dtmf"
  }
}
```

### Example SVAML Response

```json
{
  "instructions": [
    { "name": "say", "text": "Connecting you to support.", "locale": "en-US" }
  ],
  "action": {
    "name": "connectPstn",
    "number": "+15551000003",
    "cli": "+15551000001"
  }
}
```

---

## Notify Event

Fired for notifications (e.g., recording finished, AMD result for async mode). **Fire-and-forget — no SVAML response.**

### Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Notification type (e.g., `"recording_finished"`, `"transcription_complete"`) |
| `destination` | string | URL of the generated recording/transcription file |
| `amd` | object | AMD result (for async AMD mode) |

### Example Request

```json
{
  "event": "notify",
  "callId": "aaa11111222233334444555566667777",
  "version": 1,
  "applicationKey": "00000000-0000-0000-0000-000000000000",
  "type": "recording_finished",
  "destination": "https://storage.example.com/recordings/aaa11111.wav"
}
```

---

## AMD — Answering Machine Detection

When `amd: { enabled: true }` is set on `connectPstn`, the ACE event includes an `amd` field:

| Field | Type | Description |
|-------|------|-------------|
| `amd.status` | string | `"human"`, `"machine"`, `"notsure"`, `"hangup"` |
| `amd.reason` | string | `"longgreeting"`, `"initialsilence"`, etc. |
| `amd.duration` | integer | Time taken for detection (ms) |

*(Summary only — confirm exact names/encoding/enums against the authoritative [ACE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ace) doc before implementing.)*

For **async AMD** (`amd: { enabled: true, async: true }`), the initial ACE has `amd.status: "inprogress"`. The final result comes in a Notify event.

## Links

- [ICE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ice)
- [ACE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/ace)
- [DiCE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/dice)
- [PIE Callback](https://developers.sinch.com/docs/voice/api-reference/voice/callbacks/pie)
- [Callback Signing](https://developers.sinch.com/docs/voice/api-reference/authentication/callback-signed-request.md)
