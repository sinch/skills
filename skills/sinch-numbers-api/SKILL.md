---
name: sinch-numbers-api
description: "Search, rent, manage, and release phone numbers with the Sinch Numbers API. Use when listing active numbers, searching available numbers, renting or releasing numbers, updating number configuration (SMS/voice/callback), managing emergency addresses, or checking available regions."
metadata:
  author: Sinch
  version: 1.0.0
---

# Sinch Numbers API

The Numbers API lets you search, activate, manage, and release phone numbers — the prerequisite for SMS, Voice, and Conversation APIs.

## Instructions

### Step 1: Choose approach

- **SDK project?** Default to SDK if `@sinch/sdk-core` (Node), `sinch` (Python), or `com.sinch.sdk` (Java) is present.
- **Direct HTTP?** Use curl/fetch with Basic auth.

For SDK code, read the correct reference before generating any code:

| Language | Reference | SDK docs |
|----------|-----------|----------|
| TypeScript/Node.js | [references/typescript.md](references/typescript.md) | [Syntax reference](https://developers.sinch.com/docs/numbers/sdk/node/syntax-reference) |
| Python | [references/python.md](references/python.md) | [Syntax reference](https://developers.sinch.com/docs/numbers/sdk/py/syntax-reference) |
| Java | [references/java.md](references/java.md) | [Syntax reference](https://developers.sinch.com/docs/numbers/sdk/java/syntax-reference) |

For direct HTTP calls, see [Numbers API Reference](https://developers.sinch.com/docs/numbers/api-reference/numbers.md).

### Step 2: Authenticate

See [sinch-authentication](../sinch-authentication/SKILL.md) for full setup. Use Basic auth (`-u KEY_ID:KEY_SECRET`) for quick starts, OAuth2 for production.

### Step 3: Verify connectivity

```bash
curl -X GET "https://numbers.api.sinch.com/v1/projects/{PROJECT_ID}/activeNumbers?regionCode=US&type=LOCAL&pageSize=10" \
  -u {KEY_ID}:{KEY_SECRET}
```

A 200 response confirms credentials and project access.

## Workflows

### Search and rent a number

1. `GET /availableRegions` — discover valid `regionCode` values
2. `GET /availableNumbers?regionCode={code}&type={type}` — search (both params **required**)
3. Pick a number → `POST /availableNumbers/{phoneNumber}:rent` with config body
4. `GET /activeNumbers/{phoneNumber}` — confirm activation

Use `POST /availableNumbers:rentAny` to skip step 3 (US LOCAL numbers only).

### Safe retries for billable operations

Before retrying any potentially billable action (for example `:rent`, `:rentAny`, or `:release`) after an incomplete/uncertain response:

1. Check current state first using a read endpoint (`GET /activeNumbers/{phoneNumber}` or `GET /activeNumbers` with filters)
2. Retry only if the verification shows the prior action did not succeed
3. If state is ambiguous, prefer listing active numbers and matching on `phoneNumber` before issuing another billable request

### Update number configuration

1. `GET /activeNumbers/{phoneNumber}` — check current config
2. `PATCH /activeNumbers/{phoneNumber}` — set `displayName`, `smsConfiguration`, or `voiceConfiguration`
3. To unlink, send empty string `""` in `servicePlanId` or `campaignId`

### Release a number

`POST /activeNumbers/{phoneNumber}:release`

### Fetch all numbers to JSON

Run `node scripts/get_numbers.cjs --output numbers.json` (uses `SINCH_PROJECT_ID`, `SINCH_KEY_ID`, `SINCH_KEY_SECRET` env vars). Supports `--region` and `--type` filters.

### Emergency addresses

Use the emergency address endpoints on active numbers: `GET`, `provision`, `deprovision`, `validate`. See [API reference](https://developers.sinch.com/docs/numbers/api-reference/numbers.md).

### Number orders (KYC-regulated regions)

Use the `numberOrders` endpoints: `lookupNumberRequirements` → `createNumberOrder` → upload registration/attachments → `submit`. See [API reference](https://developers.sinch.com/docs/numbers/api-reference/numbers.md).

### Imported numbers

A separate API at `https://imported.numbers.api.sinch.com` handles importing non-Sinch numbers (DCA) and hosting orders. See [API reference](https://developers.sinch.com/docs/numbers/api-reference/numbers.md).

## Gotchas

- **Param names differ between endpoints**: `GET /activeNumbers` uses `capability` (singular) and `pageSize`. `GET /availableNumbers` uses `capabilities` (plural) and `size` (single page, no pagination).
- **`type` defaults to `MOBILE`** — omitting it returns only MOBILE numbers, not all types.
- **Always set `pageSize` explicitly** on `GET /activeNumbers` — no documented default.
- **`rentAny` is US LOCAL only** — use `:rent` for other types/regions.
- **Do not blindly retry billable actions** — if output is incomplete, verify state via `GET /activeNumbers/{phoneNumber}` (or list + filter) before retrying `:rent`, `:rentAny`, or `:release`.
- **Never pass both config objects unnecessarily** — sending empty `voiceConfiguration` when you only need SMS will error.
- **Unlink before relinking** — a number must be detached from its current service/campaign before attaching to a new one.
- **`campaignId` is US-only** — required for 10DLC, irrelevant elsewhere.
- **`scheduledProvisioning`/`scheduledVoiceProvisioning`** are objects (with `status`, `lastUpdatedTime`, `errorCodes`), not strings. Status values: `PROVISIONING_STATUS_UNSPECIFIED`, `WAITING`, `IN_PROGRESS`, `FAILED`.
- **`voiceConfiguration` is a discriminated union** on `type`: `RTC` → `appId`, `EST` → `trunkId`, `FAX` → `serviceId`.
- **Callback config** (`PATCH /callbackConfiguration`) sets only `hmacSecret` for HMAC-SHA1 signature verification — it does **not** set a callback URL.
- **Callback IP allowlist**: `54.76.19.159`, `54.78.194.39`, `54.155.83.128`.

## Links

- [Numbers API docs](https://developers.sinch.com/docs/numbers/)
- [Numbers API reference (Markdown)](https://developers.sinch.com/docs/numbers/api-reference/numbers.md)
- [Numbers OpenAPI spec](https://developers.sinch.com/_bundle/docs/numbers/api-reference/numbers.yaml?download)
- [Sinch dashboard — Access keys](https://dashboard.sinch.com/settings/access-keys)
