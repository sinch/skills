# Onboarding: SMS outside the US

> Navigational guide, not schema authority. It orders the onboarding phases and names the skill that owns each step. Endpoints, payloads, enum values, fees, country rules, and limits come from the canonical documents those skills link, fetched in the current session: start from [Conversation API getting started](https://developers.sinch.com/docs/conversation/getting-started.md) and [SMS channel set-up](https://developers.sinch.com/docs/conversation/channel-support/sms/set-up.md). `{{VARIABLES}}` are defined in [inputs.md](../inputs.md).

**Scope:** application-to-person SMS to recipients outside the US over the SMS channel of the Conversation API, from free trial to a live sender. US recipients use [us.md](us.md). Canada is not covered yet; apply neither guide to Canadian traffic.

The trial phases are the same as in the US guide. Run them from [us.md](us.md), with the differences below, then the go-live phases here. The agent adapter says how to ask at each checkpoint, where secrets and webhooks live, and how to report state.

## Extra input

| Variable | Launcher label | If missing |
|----------|----------------|------------|
| `DESTINATION_COUNTRIES` | countries, destination countries | Infer from the verified numbers and the request; ask once if unclear. |

## Phases at a glance

1. **Connect your account** — us.md Phase 1, unchanged.
2. **Send a test text** — us.md Phase 2, unchanged.
3. **Receive a reply** — us.md Phase 3, unchanged.
4. **Handle opt-outs** — us.md Phase 4, adapted: keep the opt-out store and STOP/HELP handling, but follow each destination country's opt-out and consent rules. Do not tell the user the US keyword list is what their countries require.
5. **Explore** (optional) — us.md Phase 5, unchanged.
6. **Upgrade** — us.md Phase 6, without the 10DLC mention.
7. **Choose senders per country** — below.
8. **Get numbers when needed and go live** — below.

## Phase 7 — Choose senders per country

Owner: `sinch-sms`. For each entry in `DESTINATION_COUNTRIES`:

1. Choose between an **alphanumeric sender ID** (brand name, one-way only) and a **number** (two-way). Two-way traffic needs a number.
2. Check whether the country requires the sender ID to be pre-registered. Registration can take days; tell the user before promising a go-live date.
3. Ask **Sender per country**, one country per question: "Alphanumeric sender ({{brand}})" | "A number (two-way)" | "Explain the difference" | "I'm stuck".
4. Submit any required registration only after **Before any paid call** when it has a fee, and report its status.
5. Ask **Phase 7 → 8**: "Set up my senders and go live" | "Not now".

## Phase 8 — Get numbers when needed and go live (billable)

1. For each country that needs a number, search (read-only), ask **Pick a number** with each option's monthly cost, then **Before any paid call**, then rent it. Some countries require KYC documents; use `sinch-number-order-api` for those. Before collecting them, tell the user the documents (such as business registration or ID) are sent to Sinch and the number's regulator or carrier for review, and handle them as sensitive: upload them only through the API or dashboard, and never paste them into chat, logs, or the repository. Owner: `sinch-numbers-api`.
2. Resolve `SERVICE_PLAN_ID`, assign each number to the service plan, and make each sender available to the app. Read each resource back to confirm.
3. Keep a per-country sender map in the one config place, and set the `SMS_SENDER` channel property from it on every send ([SMS properties](https://developers.sinch.com/docs/conversation/channel-support/sms/properties.md)).
4. Send one real message per destination country (**Before any paid call** each, which names what is sent: the recipient number and the text go to Sinch and the carriers), only to a number the user owns or whose owner agreed to receive the test, and confirm each delivery receipt. A sender that works in one country may be replaced, filtered, or blocked in another.

## Done when

- [ ] us.md Phases 1–5 done-items, with opt-out handling adapted per country.
- [ ] A sender chosen for every destination country; any required registration submitted, with its status reported.
- [ ] Numbers, where needed, rented and assigned to the service plan.
- [ ] One live message per destination country delivered, with its receipt.
- [ ] Verification levels reached and not reached are stated.

## Global gotchas

- Non-GSM characters switch the message to UCS-2, which shortens each part and raises the cost. See `sinch-sms` for encoding and message parts.
- The app and the service plan must be in the same region, or the SMS channel reports errors.
