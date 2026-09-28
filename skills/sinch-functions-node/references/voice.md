> **Summary — not the spec.** This file orients you and links to the authoritative
> `developers.sinch.com` doc; it may lag, omit fields, or simplify nesting. Do **not**
> copy field names, nesting, encodings, or enums from here into shipped code without
> confirming them in the linked doc. See "Source of Truth" in this skill's SKILL.md.

# Voice v2 call model (Node.js)

The event → handler → injected builder model, the live-leg rule, and the non-obvious
behaviours that aren't visible from the types. Loaded on-demand from [SKILL.md](../SKILL.md).
For the full `CommandBuilder`/`VoiceClient` method set and argument shapes, use IntelliSense
against the `.d.ts` JSDoc under `node_modules/@sinch/functions-runtime/dist`, or the
[Node.js runtime guide](https://developers.sinch.com/docs/functions/functions/runtimes/nodejs.md)
— this file is not a method catalogue. Agent handoff and realtime agents are covered in
SKILL.md's "Connecting a call to an AI agent" and "Realtime AI voice agents", not repeated here.

## The model

`onCall` maps each CloudEvent to a lifecycle handler and hands it `(call, builder, context, request)`.
`call` is flat and typed per slot; `builder` is a `CommandBuilder` already primed with the call —
chain commands onto it and return it, never hand-write the JSON.

| Event | `onCall` handler | Can return |
|---|---|---|
| `call.incoming` | `incoming` | A flow (commands to run) or nothing (`204`) |
| `call.answered` | `answered` | A flow or nothing |
| `call.menu`, `call.webhook.*` | `manage` | A flow or nothing |
| `call.hangup`, `call.failed` | `completed` | Nothing — the call already ended |
| anything unclaimed | `fallback` | A flow or nothing |
| a named `webhook` command | the matching entry in the `webhooks` map | A flow or nothing |

## The live-leg rule

`bridgeTo` and every `dial*` verb (`dialPhone`, `dialSip`, `dialStream`, `dialRelay`, `dialAgent`)
**never answer the call** — answering commits billing and forfeits ringback, so an inbound call
that should be answered first says so explicitly with `answer()`. Because the builder is primed
with the call, the dial verbs fill in what would otherwise be hand-written: the leg name, the
bridge, the teardown on either side hanging up, and a `from` default. `onNoAnswer` covers busy,
rejected, timed-out and failed at once, and takes a whole flow.

## Non-obvious behaviours

- **`say` + `hangup` rides on `onFinish`** — TTS/audio plays out before the leg tears down; a
  `hangup()` right after `say()` does not cut the message off.
- **`amd` is all-or-nothing** — one result for the whole detection window, not a stream of
  partial signals.
- **`dial*` doesn't answer** — see the live-leg rule above.
- **`webhook()` blocks** the flow until the named webhook resolves as `call.webhook.<name>` in
  the `manage` handler.
- **`'voice-relay'` has no `'relay'` alias** — `realtimeAgent`'s Voice Relay provider is spelled
  `'voice-relay'`; a template still using `'relay'` fails to compile.
- **`callName`, `webhookName`, `recordingName` must be unique for the whole session**, ended
  legs included; a flow that repeats across requests (e.g. a menu the caller retries) must vary
  them rather than reuse the same literal.
- **Dial helpers default the leg name and it repeats within a reply** — `dialPhone`/`bridgeTo`/
  `dial*` default the leg name (destination, agent, stream, relay), and a second dial in the same
  reply gets `destination-2`, not a new name. Pass `legName` to control it, e.g. when dialling
  again from a later `manage`/webhook reply.
- **Plain `transferTo*` sends no `callName` unless you pass one, and Voice v2 does not end the
  other leg on hangup by itself.** A dial issued from the webhook reply is wired by the runtime
  (the caller's `onHangup` ends the dialled leg), but a transfer issued from a later reply is
  not — pass `legName` and hang that leg up yourself once the caller's call completes. Built-in
  realtime agents name their transfer leg `transfer-1` and do this already; only one transfer per
  call is supported.
- **Voice webhooks are served at the function root and `/webhook/voice` only** — no other path.

## Examples

**IVR menu:**

```typescript
import { onCall } from '@sinch/functions-runtime/voice';

export const voiceWebhook = onCall({
  incoming: (call, builder) =>
    builder
      .answer()
      .menu('main', (m) =>
        m
          .prompt('Press 1 for sales, 2 for support.')
          .maxLength(1)
          .option('1', (c) => c.say('Connecting to sales.').dialPhone('+15551111111'))
          .option('2', (c) => c.say('Connecting to support.').dialPhone('+15552222222'))
          .onFail((c) => c.say('Goodbye!').hangup()),
      ),
});
```

**Agent handoff:**

```typescript
import { onCall } from '@sinch/functions-runtime/voice';

export const voiceWebhook = onCall({
  incoming: (call, builder) => builder.answer().dialAgent('grok', '+15550001234'),
});
```

## Links

- [Voice API 2.0 documentation](https://developers.sinch.com/docs/voice-2.0)
- `sinch-voice-api-v2` skill — REST contract and body shapes
