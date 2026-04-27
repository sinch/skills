---
name: sinch-number-order-api
description: Guides the multi-step Number Order workflow for purchasing phone numbers with KYC compliance via the Sinch Numbers API. Use when buying, ordering, provisioning, or activating Sinch numbers in countries that require KYC registration, regulatory compliance, or identity verification. Triggers on "number order", "KYC", "number registration", "phone number purchase", or "number provisioning".
metadata:
  author: Sinch
  version: 1.0.3
  category: Numbers
  tags: number-order, kyc, phone-number, purchase, provisioning, registration
  uses:
    - sinch-authentication
---

# Number Order API

Order phone numbers with KYC compliance through a guided multi-step workflow. Required in countries where number purchases need identity verification.

## Agent Instructions

This is a **sequential, fragile workflow** — steps must be followed in order. Do not combine API calls. Step 2 may be skipped if the user already has a specific E.164 number.

Before starting, collect from the user:

1. **Country** — ISO 3166-1 alpha-2 region code (e.g. `AU`, `DE`, `BR`)
2. **Number type** — `MOBILE`, `LOCAL`, or `TOLL_FREE`
3. **Specific number or quantity?** — E.164 phone number, or quantity + criteria
4. **SMS or Voice?**
   - SMS → needs `servicePlanId` (+ `campaignId` for US 10DLC)
   - Voice → needs `type` (`RTC`/`EST`/`FAX`) + corresponding ID (`appId`/`trunkId`/`serviceId`)

For authentication setup, see the [authentication skill](../sinch-authentication/SKILL.md).

## Workflow

Execute in order. Report state to the user after each step.

- [ ] **Step 1 — Lookup requirements**: `POST /v1/projects/{projectId}/numberOrders:lookupNumberRequirements` with `regionCode` + `numberType`. Save the response — it defines KYC `fields` schema and `attachments` (with `id`, `mandatory`, `allowedMimeTypes`, `allowedDocumentTypes`). Tell the user what's needed.
- [ ] **Step 2 — Search available numbers** *(skip if user has a specific number)*: `GET /v1/projects/{projectId}/availableNumbers?regionCode=XX&type=YY`. Optional filters: `capabilities`, `numberPattern.pattern`, `numberPattern.searchPattern`, `size`. Present results and let user choose.
- [ ] **Step 3 — Create order**: `POST /v1/projects/{projectId}/numberOrders:createNumberOrder`. Use `numberOrderOption` (specific phones) **or** `quantityOrderOption` (criteria-based) — never both. Save `idNumberOrder` and `expireTime` from response.
- [ ] **Step 4 — Submit registration**: `PUT /v1/projects/{projectId}/numberOrders/{numberOrderId}/registration`. Populate `requestDetails.data` using the schema from Step 1. Returns 400 on validation errors — fix and retry. Use `GET /v1/projects/{projectId}/numberOrders/{numberOrderId}/registration` to review.
- [ ] **Step 5 — Upload attachments** *(if Step 1 returned mandatory attachments)*: `POST /v1/projects/{projectId}/numberOrders/{numberOrderId}/attachments/{attachmentId}` as `multipart/form-data`. Check `allowedMimeTypes` before uploading.
- [ ] **Step 6 — Submit order**: `POST /v1/projects/{projectId}/numberOrders/{numberOrderId}/submit`. State becomes `IN_REVIEW`.

> **The 48-hour clock starts at Step 3.** Steps 4–6 must complete before the order expires.

Check status anytime: `GET /v1/projects/{projectId}/numberOrders/{numberOrderId}`

### Order States

`CREATED` → `IN_REVIEW` → `COMPLETED` | `REJECTED` | `EXPIRED` | `BLOCKED` | `NUMBER_ORDER_STATE_UNSPECIFIED`

## Canonical Example — Lookup Requirements (Step 1)

Base URL: `https://numbers.api.sinch.com`. Auth: OAuth2 bearer token (recommended) or Basic.

Store credentials in environment variables — never hardcode tokens or keys in commands or source code:

```bash
export SINCH_PROJECT_ID="your-project-id"
export SINCH_ACCESS_TOKEN="your-oauth-token"
```

```bash
curl -X POST \
  "https://numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/numberOrders:lookupNumberRequirements" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"regionCode": "AU", "numberType": "MOBILE"}'
```

For all other endpoints, request/response schemas, and field-level details, see the [Number Order API Reference](https://developers.sinch.com/docs/numbers/api-reference/numbers/number-order.md).

## Error Recovery

- **Step 3 fails (number unavailable)** — go back to Step 2, pick a different number, and retry Step 3.
- **Step 4 returns 400** — read the error response, fix the `data` fields, and PUT again. No need to recreate the order.
- **Order expires** — start over from Step 1. The `idNumberOrder` is no longer valid.
- **Order rejected** — check the rejection reason in the GET response, correct KYC data, and create a new order.

## Gotchas

- **48-hour expiry** — reservation starts at order creation (Step 3), not at submission.
- **Country-specific KYC** — the `data` schema varies per country. Always use Step 1 output — never hardcode.
- **Attachments are conditional** — only required when Step 1 says `mandatory: true`.
- **Registration validation is synchronous** — Step 4 returns 400 immediately on bad data.
- **E.164 required** — phone numbers must include the `+` prefix.
- **Auth is Key ID / Key Secret** — not the project ID.
- **`callbackUrl`** — optional on order creation. Allowlist IPs: `54.76.19.159`, `54.78.194.39`, `54.155.83.128`.

## Common Patterns

- **Simple number purchase (KYC country)** — Steps 1–6 in order. Most common flow.
- **Bulk number purchase** — Use `quantityOrderOption` in Step 3 with criteria instead of specific numbers.
- **Check order status** — `GET /v1/projects/{projectId}/numberOrders/{numberOrderId}` to poll for state transitions.
- **Retry after rejection** — Check rejection reason, correct KYC data, create a new order from Step 1.

## Links

- [Number Order API Reference (.md)](https://developers.sinch.com/docs/numbers/api-reference/numbers/number-order.md)
- [Numbers API Reference (.md)](https://developers.sinch.com/docs/numbers/api-reference/numbers.md)
- [OpenAPI Spec](https://developers.sinch.com/_bundle/docs/numbers/api-reference/numbers.yaml?download)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
