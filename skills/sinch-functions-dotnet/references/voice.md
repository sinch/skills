> **Summary — not the spec.** This file orients you and links to the authoritative
> `developers.sinch.com` doc; it may lag, omit fields, or simplify nesting. Do **not**
> copy field names, nesting, encodings, or enums from here into shipped code without
> confirming them in the linked doc. See "Source of Truth" in this skill's SKILL.md.

# Voice v2 call model (C#)

The event → override → injected builder model, the live-leg rule, and the non-obvious
behaviours that aren't visible from the types. Loaded on-demand from [SKILL.md](../SKILL.md).
For the full `CommandBuilder`/`Client` method set and argument shapes, use the XML docs shipped
in the `Sinch.Functions.Runtime` NuGet package (IntelliSense), or the
[C# runtime guide](https://developers.sinch.com/docs/functions/functions/runtimes/csharp.md)
— this file is not a method catalogue. Realtime and SIP agents are covered in SKILL.md's
"AI voice agents", not repeated here.

## The model

`SinchVoiceController` routes each CloudEvent to a virtual `On*` method; override only the ones
you answer. Each gets a `CommandBuilder` already primed with the call — chain commands onto it
and return it (it converts to `CallFlow` implicitly), never hand-write the JSON.

| Event | Override | Can return |
|---|---|---|
| `call.incoming` | `OnIncoming(Call, CommandBuilder)` | A `CallFlow` or `CallFlow.None` |
| `call.answered` | `OnAnswered(Call, CommandBuilder)` | A `CallFlow` or `CallFlow.None` |
| `call.menu` | `OnMenu(Call, MenuInput?, CommandBuilder)` | A `CallFlow` or `CallFlow.None` |
| `call.webhook.<name>` | `OnWebhook(string, Call, CommandBuilder)` | A `CallFlow` or `CallFlow.None` |
| `call.hangup`, `call.failed` | `OnCompleted(string, Call)` | Nothing — the call already ended |
| anything else | `OnOther(string, Call, CommandBuilder)` | A `CallFlow` or `CallFlow.None` |

Each has an `...Async` twin (`OnCompletedAsync` returns `Task`). Anything not overridden
defaults to `CallFlow.None`, which answers `204`.

## The live-leg rule

`BridgeTo` and every `Dial*` verb (`DialPhone`, `DialSip`, `DialStream`, `DialRelay`,
`DialAgent`) **never answer the call** — answering commits billing and forfeits ringback, so an
inbound call that should be answered first says so explicitly with `Answer()`. Because the
builder is primed with the call, the dial verbs fill in what would otherwise be hand-written:
the leg name, the bridge, the teardown when either side hangs up, and a `From` default.
`BridgeToOptions.OnNoAnswer` covers busy, rejected, timed-out and failed at once.

## Non-obvious behaviours

- **`Say` + `Hangup` rides on `onFinish`** — TTS/audio plays out before the leg tears down; a
  `Hangup()` right after `Say()` does not cut the message off.
- **`Amd` is all-or-nothing** — one result for the whole detection window, not a stream of
  partial signals.
- **`Dial*` doesn't answer** — see the live-leg rule above.
- **`Webhook()` blocks** the flow until the named webhook resolves as `call.webhook.<name>` in
  `OnWebhook`.
- **`'voice-relay'` has no `'relay'` alias** — the Node runtime's `realtimeAgent` provider is
  spelled `'voice-relay'`; the C# equivalent is `UseVoiceRelay()`.
- **`CallName`, `WebhookName`, `RecordingName` must be unique for the whole session**, ended
  legs included; a flow that repeats across requests (e.g. a menu the caller retries) must vary
  them rather than reuse the same literal.
- **Dial helpers default the leg name and it repeats within a reply** — `DialPhone`/`BridgeTo`/
  `Dial*` default the leg name (destination, agent, stream, relay), and a second dial in the same
  reply gets `destination-2`, not a new name. Pass `legName` to control it, e.g. when dialling
  again from a later `OnWebhook` reply.
- **Plain `TransferTo*` sends no `CallName` unless you pass one, and Voice v2 does not end the
  other leg on hangup by itself.** A dial issued from the webhook reply is wired by the runtime
  (the caller's hangup ends the dialled leg), but a transfer issued from a later reply is not —
  pass a leg name and hang that leg up yourself once the caller's call completes in
  `OnCompleted`. Built-in realtime agents name their transfer leg `transfer-1` and do this
  already; only one transfer per call is supported.
- **Voice webhooks are served at the function root and `/webhook/voice` only** — no other path.

## Examples

**IVR menu:**

```csharp
protected override CallFlow OnIncoming(Call call, CommandBuilder builder) =>
    builder
        .Answer()
        .Menu("main", m => m
            .Prompt("Press 1 for sales, 2 for support.")
            .MaxLength(1)
            .AddOption("1", c => c.Say("Connecting to sales.").DialPhone("+15551111111"))
            .AddOption("2", c => c.Say("Connecting to support.").DialPhone("+15552222222"))
            .OnFail(c => c.Say("Goodbye!").Hangup()));
```

**Agent handoff:**

```csharp
protected override CallFlow OnIncoming(Call call, CommandBuilder builder) =>
    builder.Answer().DialAgent(AgentProvider.ElevenLabs, "+15550001234");
```

## Links

- [Voice API 2.0 documentation](https://developers.sinch.com/docs/voice-2.0)
- `sinch-voice-api-v2` skill — REST contract and body shapes
