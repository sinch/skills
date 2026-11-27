# Onboarding: SMS to US recipients

> Navigational guide, not schema authority. It orders the onboarding phases and names the skill that owns each step. Endpoints, payloads, enum values, fees, and limits come from the canonical documents those skills link, fetched in the current session: start from [Conversation API getting started](https://developers.sinch.com/docs/conversation/getting-started.md), [SMS channel set-up](https://developers.sinch.com/docs/conversation/channel-support/sms/set-up.md), and [callbacks](https://developers.sinch.com/docs/conversation/callbacks.md). `{{VARIABLES}}` are defined in [inputs.md](../inputs.md).

**Scope:** application-to-person SMS to US (+1) numbers over the SMS channel of the Conversation API, from free trial to a live 10DLC sender. Not covered: toll-free numbers, short codes, Canada, MMS (`sinch-mms`). Use the Conversation API, not the legacy SMS API.

The agent adapter says how to ask at each checkpoint, where secrets and webhooks live, and how to report state. Run the phases in order. Finish a phase, report it, and ask the phase-transition checkpoint; never start the next phase until the user picks it.

## Phases at a glance

Show this to the user in the first reply, in plain words:

1. **Connect your account** — save your access keys and check they work. Nothing is sent.
2. **Send a test text** to a verified phone.
3. **Receive a reply** — set up a webhook so you can text back and see it arrive.
4. **Handle STOP and HELP** — the opt-out and help replies US carriers require.
5. **Explore** (optional) — other things the same credentials can do.
6. **Upgrade** your account to message real customers.
7. **Register for US texting (10DLC)** — your brand (your business) and campaign (what you'll text about).
8. **Get your number and go live.**

When `ACCOUNT_STATUS` is `trial`, also say how many days are left (`DAYS_LEFT`), and say clearly if the trial has ended: sends stop working until the user upgrades.

## Trial rules (phases 1–5)

- Send only from the trial number (`SENDER_NUMBER`), and only to numbers in `VERIFIED_DESTINATIONS`. A trial account can only send to verified numbers: numbers the user owns and has verified in the dashboard under [Numbers > Verified numbers](https://dashboard.sinch.com/numbers/verified-numbers) (see [SMS troubleshooting](https://developers.sinch.com/docs/sms/api-reference/troubleshooting.md)). The phone number the user signed up with is verified automatically ([account status](https://developers.sinch.com/docs/voice-2.0/accounts.md)). Every test message and every inbound reply in phases 2 to 5 is therefore between Sinch and the user's own phones.
- Before each send, check the destination is in `VERIFIED_DESTINATIONS`. Only numbers the user owns can be verified; do not suggest verifying anyone else's.
- Do not buy numbers or submit registrations on a trial; those calls fail.
- Never let the user think a trial number can message the general public.

## Phase 1 — Connect your account (read-only)

This phase needs a Sinch account. If the user has none, run step 0 (account and sign-up) in [SKILL.md](../../SKILL.md) first, then start here.

1. Summarize what is already known, in three lines: who the user sends from, who they can send to, and when the trial ends. Mark a value that is not known yet as "found after we connect" (sender) or "asked at the end of this phase" (verified numbers) rather than asking for it now.
2. Run the adapter's **access key** checkpoint.
3. Prove the credentials with one read-only authenticated call: get the Conversation API app `APP_ID` in project `PROJECT_ID`, or list numbers in the project. Resolve any missing `APP_ID` or `SENDER_NUMBER` from this response (see inputs.md). Owners: `sinch-authentication`, `sinch-conversation-api`.
4. On 401 or 403, ask **Connection failed**: "I re-saved the keys, try again" | "Help me make a new key" | "I'm stuck".
5. End the phase. Ask **Phase 1 → 2**: "Send a test text to {{first verified destination}}" | "Explain what happens next" | "Not now".

## Phase 2 — Send a test text (billable)

1. Check the destination against `VERIFIED_DESTINATIONS` before sending. If it is not listed, do not send; go to **Unverified destination** below.
2. Ask **Message text**: "Send the default text" | "I'll write my own" | "I'm stuck". Then the **Before any paid call** checkpoint.
3. Send one SMS through the Conversation API from `SENDER_NUMBER` to the destination, using `APP_ID` in `APP_REGION`. Every send sets the `SMS_SENDER` channel property to `SENDER_NUMBER`; a new account has no default sender ([SMS properties](https://developers.sinch.com/docs/conversation/channel-support/sms/properties.md)). Owner: `sinch-sms`.
4. Report the message ID. The send response means accepted, not delivered. If a delivery receipt can only be captured through a webhook, say so; Phase 3 sets it up.
5. Ask **Did it arrive**: "Yes, it arrived" | "Not yet, give it a minute" | "Nothing after 2 minutes, check what's wrong" | "I'm stuck". On a timeout, check the message status before any resend.
6. End the phase. Ask **Phase 2 → 3**: "Set up receiving (the webhook)" | "Send another test first" | "Not now".

### Unverified destination

Tell the user plainly that the number is not verified, and which option applies right now:

1. **Verify it** (free) — when fewer than `MAX_VERIFIED_DESTINATIONS` are verified, or the limit is unknown: the user adds the number in the dashboard's testing tools and confirms it with the PIN Sinch texts to it. Then retry.
2. **Upgrade to message anyone** — when the limit is reached, or the user wants to reach real customers. Be honest that upgrading is not enough on its own: Phases 7 and 8 (registration, a purchased number, and the wiring) come before sending to unverified US numbers.

Ask: "I verified it, retry the send" | "Show me how to upgrade" | "Cancel".

## Phase 3 — Receive a reply (webhook)

Before starting, say what it unlocks: "Once the webhook is set up, you can text back from your phone and see the reply arrive."

1. Tell the user what the webhook receives: Sinch callbacks carry message content and contact details such as phone numbers ([callbacks](https://developers.sinch.com/docs/conversation/callbacks.md)). On the trial these come only from the user's own verified phones. Before going live, the user must tell the people who text their number how their messages are handled and stored, and the webhook should keep only the fields the app needs. Do not point the webhook at a public test service such as a request bin; it would expose that data.
2. Stand up a public HTTPS endpoint that accepts POST and returns 200 quickly, where the adapter says webhooks run.
3. List the webhooks already in the project and report any that also receive inbound messages; they may double-handle STOP. Ask **Existing webhooks**: "Leave them" | "Update it to point here" | "Delete {{id}}" (one option per webhook; confirm again before deleting — destructive).
4. Register the webhook for the app with triggers for inbound messages and delivery receipts (`MESSAGE_INBOUND`, `MESSAGE_DELIVERY`, and `EVENT_INBOUND` if available — confirm names against the callbacks doc). Observed: the project-level webhooks route works where an app-scoped route returned 501; confirm the route in the canonical reference. Owner: `sinch-conversation-api`.
5. Generate a random webhook secret, store it in the adapter's secret store, and verify the signature on every callback. Reject unsigned or mis-signed requests, and prove it by sending one unsigned POST and showing it is rejected. Owner: `sinch-conversation-api`.
6. Ask **Reply test**: tell the user to reply to the test text from their phone, then "I sent a reply" | "I didn't get the original text" | "I'm stuck". After "I sent a reply", show what arrived (sender, body, timestamp, contact ID) and the delivery receipt from Phase 2 before asking anything else. If nothing arrived: "Check again" | "Help me troubleshoot" | "I'm stuck".
7. If the webhook does not fire, check the registration, that the endpoint is reachable, and that it returns 200, before changing anything else.
8. End the phase. Ask **Phase 3 → 4**: "Handle STOP and HELP" | "Send another test first" | "Not now".

## Phase 4 — Handle STOP and HELP (required for US)

Carriers audit this; it is not optional. Implement it in the Phase 3 webhook.

1. Inspect each inbound body, trimmed and case-insensitive.
2. **Opt-out** (STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT): mark the number opted out in the integration's own store, send exactly one confirmation, and never send to it again until it opts back in.
3. **Help** (HELP, INFO): reply with the brand name, what the messages are, a support contact, and "Reply STOP to unsubscribe."
4. **Opt back in** (START, UNSTOP, YES): clear the opt-out and confirm once.
5. Every send path checks the opt-out store first.
6. Show the user the opt-out store. Ask **Inbound test**, one round at a time, showing what arrived after each answer: "I sent STOP" | "I sent START" | "I sent a normal reply" | "Nothing arrived on my phone". Prove that STOP returned a confirmation and that a follow-up send to that number is blocked by the code, then that START restores sending.
7. Sinch can also process standard keywords when consent management is active; check the setting with `sinch-sms`, and keep the integration's own store either way.
8. End the phase. Ask **Phase 4 → 5**: "Explore what else I can do" | "Walk me through upgrading" | "Keep testing on the trial".

## Phase 5 — Explore (optional)

Offer these, with each one's cost, and demo the one the user picks (each paid call through **Before any paid call**):

- Delivery and read receipts on outbound messages.
- Two-way conversation: replying in the same contact thread.
- Number lookup on a destination number (carrier, line type) — `sinch-number-lookup-api`.
- Verification: send and check a PIN over SMS — `sinch-verification-api`.
- Other Conversation API channels on the same app — `sinch-conversation-api`.

Then explain what going live requires (Phases 6–8) before the user spends anything. Ask **Phase 5 → 6**: "Walk me through upgrading" | "Keep testing on the trial".

## Phase 6 — Upgrade (user action, billable)

1. Explain what the upgrade unlocks and what still follows (registration, number, wiring). State costs per the `COSTS` rule in inputs.md.
2. Ask **Upgrade**, with the dashboard link and the cost breakdown inside the question: "I upgraded, check my account" | "Explain the costs again" | "Not yet" | "I'm stuck".
3. Verify the upgrade with a read-only call before Phase 7, and update `ACCOUNT_STATUS`.
4. Ask **Phase 6 → 7**: "Start US registration (10DLC)" | "Not now".

## Phase 7 — Register for 10DLC (billable, non-refundable, slow)

Owner: `sinch-10dlc`. Load it now and fetch its canonical pages before building any request.

1. Before collecting anything, tell the user that these business details (including the EIN, address, and contact details) are sent to Sinch and to the US carriers' registry to review the registration. Then collect all business information in one pass before any call. Multiple-choice fields go through the question tool (legal entity type, vertical, campaign use case, monthly volume range, whether texts contain links, phone numbers, or promotions). Free-text fields go in one chat message as a fill-in list: legal company name, brand or DBA name, EIN and issuing country, registered address, website, support email and phone, how people opt in and where carriers can see it, sample messages, HELP and STOP replies.
2. Draft the carrier-facing text (use case description, opt-in description, samples). Ask **Carrier text approval**: "Looks good, save it" | "Edit something first" | "Explain what carriers check".
3. Show the full brand summary. Ask **Submit brand** with the confirmed fee: "Submit brand ({{brand fee}}, non-refundable)" | "Edit something first". Then submit the campaign the same way. Campaigns cannot be edited after submission.
4. Approval takes time. Poll brand and campaign status with a bounded loop (backoff, jitter, cap), and use status callbacks only if `sinch-10dlc`'s canonical docs show them. Do not resubmit while pending. Ask **Waiting on carriers**: "Check the status now" | "What happens while I wait?".
5. On rejection, fetch the feedback, explain the reason plainly, and ask **Rejected**: "Help me fix it" | "Explain the rejection more" | "I'm stuck".
6. When the brand is verified and the campaign approved, ask **Phase 7 → 8**: "Get my number and go live" | "Not now".

## Phase 8 — Get your number and go live (billable)

1. Search for US local numbers (read-only). Ask **Pick a number**: one option per number found (3–4), each with its monthly cost, plus "Try a different area code". Then **Before any paid call**, then rent it. Owner: `sinch-numbers-api`.
2. Resolve `SERVICE_PLAN_ID` (ask once: "I'll type it in" | "Help me find it in the dashboard").
3. Wire the number: attach it to the approved campaign (`sinch-10dlc`), set its SMS configuration to the service plan (`sinch-numbers-api`), and make it a sender for the app (`sinch-sms`). Read each resource back to confirm.
4. Update `SENDER_NUMBER` to the new number, in the one config place.
5. Send one real message from the new number (**Before any paid call**), with STOP/HELP handling live. Ask **First live text**: "It arrived, we're live" | "Nothing arrived" | "I'm stuck". Confirm the delivery receipt.

## Shared checkpoints

- **Before any paid call** — state the item, its confirmed cost, and what it sends to Sinch (for a message: the recipient number and the text, which also pass through the carriers) inside the question: "Yes, spend it" | "Skip this step" | "Explain the cost first". Proceed only on "Yes, spend it".
- Every checkpoint also offers "I'm stuck / need help with this step".

## Done when

- [ ] Credentials stored in the adapter's secret store and proven with a read-only call.
- [ ] A test text delivered to a verified number, with its delivery receipt.
- [ ] A signed-only webhook receives inbound messages and delivery receipts.
- [ ] STOP, HELP, and START work and are proven with real replies.
- [ ] After go-live: brand verified, campaign approved, number rented and wired, one live message delivered.
- [ ] Verification levels reached and not reached are stated.

## Rules

- Never invent IDs; resolve them per inputs.md.
- Never send to an opted-out number. Promotional messages carry "Reply STOP to opt out".
- After each step, report the ID you got back and the next concrete action; if the action is the user's, ask it as a checkpoint.
