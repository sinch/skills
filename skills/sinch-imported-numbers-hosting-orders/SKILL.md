---
name: sinch-imported-numbers-hosting-orders
description: Import, host, qualify, and text-enable phone numbers for Sinch SMS using the Imported Numbers and Hosting Orders API. Use when importing non-Sinch numbers as DCA, creating hosting orders, qualifying numbers for text-enablement, managing LOA workflows, or checking hosting order status.
metadata:
  author: Sinch
  version: 1.0.2
  category: Numbers
  tags: imported-numbers, hosting-orders, text-enablement, dca, loa
  uses:
    - sinch-authentication
---

# Sinch Imported Numbers & Hosting Orders

## Overview

The Imported Numbers and Hosting Orders API imports non-Sinch phone numbers for use with Sinch SMS without porting. It manages the lifecycle from qualification through text-enablement, including LOA generation and carrier OSR updates.

## Agent Instructions

Before generating code, ask the user these clarifying questions:

1. **Goal** — What do you need?
   - Import a number (single or bulk)?
   - Qualify numbers for text-enablement?
   - Text-enable qualified numbers?
   - Check status of an existing order?
2. **LOA type** (if text-enabling) — Are you a **direct Sinch customer**, a **reseller**, or do you have a **blanket LOA**?
3. **Number type** (if text-enabling) — Standard or **Toll-Free**?
4. **Language** — curl, Node.js SDK, Python, Java?

Wait for answers, then follow the matching workflow below.

## Decision Tree

```
User wants to work with imported numbers →
├─ Import numbers
│  ├─ Single number    → Workflow A (Import Number)
│  └─ Bulk (≤5)        → Workflow B (Bulk Import via Hosting Order)
├─ Qualify numbers     → Workflow C (Qualify → email invoices)
├─ Text-enable numbers
│  ├─ Standard numbers → Workflow D (Text-Enable)
│  └─ Toll-Free        → Workflow D variant (TF endpoint)
├─ Check order status  → Workflow E (Hosting Order Status)
└─ Manage numbers      → Workflow F (CRUD operations)
```

## Critical Rules

1. **E.164 format required.** All phone numbers must include leading `+` (e.g., `+12025550134`).
2. **Qualification requires manual review.** After `addNumbers`, the user must email invoices to `orders@sinch.com`. Takes 1–3 business days.
3. **Unlink before relinking.** To change service plan or campaign, first set both to empty string `""`, then set new values in a separate request.
4. **Hosting orders are async.** Poll order status or set `callbackUrl` per-request.
5. **List hosting orders requires all four params:** `states`, `type`, `servicePlanId`, `campaignId` are all required.
6. **`migrateToSinchTmo`** is read-only on responses. Exception: writable in `hostingOrders:importNumbers` requests.

## Getting Started

### Authentication

See [sinch-authentication](../sinch-authentication/SKILL.md) for full auth setup. This API uses **OAuth2 client credentials** (production) or **Basic Auth** (testing only, rate-limited).

**Base URL:** `https://imported.numbers.api.sinch.com`

**Region:** US and CA only. Single global endpoint (not regionalized).

### First API Call — Import a Number

```bash
curl -X POST \
  "https://imported.numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/importedNumbers" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+11234567890",
    "regionCode": "US",
    "displayName": "My Number",
    "smsConfiguration": {
      "servicePlanId": "$SERVICE_PLAN_ID",
      "campaignId": "$CAMPAIGN_ID"
    },
    "callbackUrl": "https://example.com/callback"
  }'
```

## Key Concepts

- **Imported Number** — Non-Sinch number enabled for SMS via Sinch as DCA. Linked to a service plan and optionally a 10DLC campaign.
- **Qualified Number** — Number that passed eligibility review. States: `ELIGIBLE_CHECK_PENDING` → `ELIGIBLE` / `NOT_ELIGIBLE` → `VERIFICATION_PENDING` → `VERIFIED` / `VERIFICATION_FAILED` / `VERIFICATION_BLOCKED` → `HOSTING_IN_PROGRESS` → `HOSTING_DONE` / `HOSTING_FAILED`.
- **Hosting Order** — Async provisioning tracker. States: `DRAFT` → `SUBMITTED` → `WAITING_FOR_LOA_SIGNATURE` → `IN_PROGRESS` → `COMPLETED` / `REJECTED`. Type: `IMPORT` or `TYPE_TEXT_ENABLE`.
- **LOA** — Letter of Authorization for text-enablement. Three types: `directLoaInfo`, `resellerLoaInfo`, `blanketLoaInfo` (empty `{}`).
- **Service Plan ID** — Links number to SMS service. **Campaign ID** — Links to 10DLC campaign (US A2P).
- **OSR Update** — Carrier-level record update. Schedulable via `scheduledOsrUpdateTime`.

## Workflows

### Workflow A: Import Single Number

Ask for: `phoneNumber`, `regionCode`, `servicePlanId`. Optional: `campaignId`, `displayName`, `callbackUrl`.

- [ ] 1. Import number via `POST /importedNumbers`
- [ ] 2. Verify: `GET /importedNumbers/{phoneNumber}`

> Numbers with their own NNID must complete [NNID provisioning](https://community.sinch.com/t5/10DLC/How-can-you-provision-a-Network-Number-ID-NNID/ta-p/7040) first.

**API docs**: [Import number](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/imported-numbers/importnumberservice_importnumber.md) → [Get imported number](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/imported-numbers/importnumberservice_getimportednumber.md)

### Workflow B: Bulk Import via Hosting Order

Ask for: `numbers` (list, max 5), `regionCode`, `servicePlanId`. Optional: `campaignId`, `callbackUrl`, `migrateToSinchTmo`.

- [ ] 1. Create hosting order via `POST /hostingOrders:importNumbers`
- [ ] 2. Track: `GET /hostingOrders/{orderId}` — wait for `COMPLETED`
- [ ] 3. Verify: `GET /hostingOrders/{orderId}/numbers` — check per-number status

> **Limit:** 5 numbers per request by default. Contact account manager to increase.

**API docs**: [Import numbers](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/hostingorderservice_importnumbers.md) → [Get order](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/hostingorderservice_gethostingorder.md) → [List order numbers](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/hostingorderservice_listhostingordernumbers.md)

### Workflow C: Qualify Numbers

Ask for: list of `phoneNumbers` (E.164).

- [ ] 1. Submit batch via `POST /qualifiedNumbers:addNumbers` (body: `{"phoneNumbers": [...]}`)
- [ ] 2. **Remind user:** "Email invoices for these numbers to orders@sinch.com — qualification won't proceed without them."
- [ ] 3. Track: `GET /qualifiedNumbers/{phoneNumber}` — wait for `ELIGIBLE` state
- [ ] 4. If ownership verification required: run voice challenge (see Workflow F)

**API docs**: [Create batch](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberservice_batchcreatequalifiednumbers.md) → [Get qualified number](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberservice_getqualifiednumber.md)

### Workflow D: Text-Enable Numbers

Ask for: `numbers` (list, max 500), `regionCode`, `servicePlanId`, and LOA info. Optional: `campaignId`, `nnid`, `scheduledOsrUpdateTime`, `callbackUrl`.

**Determine LOA type:**
- **Direct customer** → `directLoaInfo` (authorized person, address, voice carrier)
- **Reseller** → `resellerLoaInfo` (business name + authorized person, address, voice carrier)
- **Blanket LOA** → `blanketLoaInfo: {}` (pre-approved with account manager)

- [ ] 1. Text-enable via `POST /qualifiedNumbers:textEnableNumbers` (or `POST /hostingOrders:textEnableNumbers` for full order response)
- [ ] 2. LOA sent to authorized person's email for e-signature — **confirm email is correct before submitting**
- [ ] 3. Track hosting order: `GET /hostingOrders/{orderId}`

For **Toll-Free**, use `POST /qualifiedNumbers:textEnableTollFreeNumbers` or `POST /hostingOrders:textEnableTollFreeNumbers` instead.

**API docs**: [Text-enable (qualified)](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberservice_textenablenumbers.md) · [Text-enable (hosting order)](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/textenablenumbers.md) · [TF (qualified)](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberstextenabletollfreenumbers.md) · [TF (hosting order)](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/textenabletollfreenumbers.md)

### Workflow E: Check Hosting Order Status

- [ ] 1. List orders: `GET /hostingOrders?states=...&type=...&servicePlanId=...&campaignId=...` (all four required)
- [ ] 2. Get specific: `GET /hostingOrders/{orderId}`
- [ ] 3. Get report: `GET /hostingOrders/{orderId}/report` (shows totals for OSR, SMS provisioned, campaign linked)
- [ ] 4. Drill into numbers: `GET /hostingOrders/{orderId}/numbers`

**API docs**: [List orders](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/hostingorderservice_listhostingorders.md) · [Get order](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/hostingorderservice_gethostingorder.md) · [Get report](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/gethostingorderreport.md) · [List order numbers](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/hosting-orders/hostingorderservice_listhostingordernumbers.md)

### Workflow F: Manage Numbers & Verification

**Imported numbers:** list, get, update, delete via `/importedNumbers` and `/importedNumbers/{phoneNumber}`.

**Qualified numbers:** list (requires `states` param), get, delete via `/qualifiedNumbers`.

**Voice challenge** (ownership verification):
- [ ] 1. `POST /qualifiedNumbers/{phone}:sendVoiceChallenge` — triggers voice call with code
- [ ] 2. `POST /qualifiedNumbers/{phone}:verifyVoiceChallenge` — body: `{"code": "1234"}`

**API docs**: [List imported](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/imported-numbers/importnumberservice_listimportednumbers.md) · [Update imported](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/imported-numbers/importnumberservice_updateimportednumber.md) · [Delete imported](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/imported-numbers/importnumberservice_deleteimportednumber.md) · [List qualified](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberservice_listqualifiednumbers.md) · [Send challenge](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberservice_sendvoicechallenge.md) · [Verify challenge](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting/qualified-numbers/qualifiednumberservice_verifyvoicechallenge.md)

## Callbacks

Callback URLs are set **per-request** via `callbackUrl` on import and text-enable operations (not project-level). Configure HMAC signing via `PATCH /callbackConfiguration` with `{"hmacSecret": "..."}` — verifies payloads via `X-Sinch-Signature` header.

See [references/callbacks.md](references/callbacks.md) for full payload schema, event types, and failure codes.

**Allowlist these IPs:** `54.76.19.159`, `54.78.194.39`, `54.155.83.128`

## Gotchas and Best Practices

- **Bulk import limit:** `hostingOrders:importNumbers` allows **5 numbers** by default. Use `POST /importedNumbers` for single numbers.
- **Text-enable limit:** Up to **500 numbers** per request.
- **409 Conflict** means the number is already imported. Check with `GET /importedNumbers/{phoneNumber}` first.
- **Hosting order states:** `SUBMITTED` → `WAITING_FOR_LOA_SIGNATURE` → `IN_PROGRESS` → `COMPLETED` / `REJECTED`.

## Links

- [API Reference](https://developers.sinch.com/docs/numbers/api-reference/imported-hosting.md)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/numbers/api-reference/imported-hosting.yaml?download)
- [NNID Provisioning](https://community.sinch.com/t5/10DLC/How-can-you-provision-a-Network-Number-ID-NNID/ta-p/7040)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
