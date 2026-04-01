---
name: sinch-mailgun-validate
description: Build with Mailgun Validate API for email verification and list hygiene. Use when validating email addresses, checking email deliverability, running bulk validation jobs, previewing list health, or cleaning an email list.
metadata:
  author: Sinch
  version: 1.0.0
---

# Mailgun Validate API

## Overview

Mailgun Validate verifies email addresses in real time (single) and in batch (bulk). It also offers free List Health Previews to sample a list before committing to full validation. Used for signup fraud prevention, list hygiene, and deliverability optimization.

**Auth:** HTTP Basic Auth — username `api`, password your Mailgun Private API key. See [sinch-authentication](../sinch-authentication/SKILL.md) for setup.

## Getting Started

Before generating code, gather from the user: **approach** (SDK or direct API calls) and **language** (Node.js, Python, Java, PHP, Ruby, Go, curl). Do not assume defaults.

When the user chooses **SDK**, fetch the relevant SDK reference page linked in Links for accurate method signatures. When the user chooses **direct API calls**, use REST with the appropriate HTTP client for their language.

| Language | Package                    | Install                                                                |
| -------- | -------------------------- | ---------------------------------------------------------------------- |
| Node.js  | `mailgun.js`               | `npm install mailgun.js`                                               |
| Java     | `com.mailgun:mailgun-java` | Maven dependency (see below)                                           |
| Python   | `mailgun`                  | `pip install mailgun-python`                                           |
| PHP      | `mailgun/mailgun-php`      | `composer require mailgun/mailgun-php symfony/http-client nyholm/psr7` |
| Ruby     | `mailgun-ruby`             | `gem install mailgun-ruby`                                             |
| Go       | `mailgun-go/v5`            | `go get github.com/mailgun/mailgun-go/v5`                              |

#### Java Maven dependency

Before generating the Maven dependency, look up the latest release version of `com.mailgun:mailgun-java` on [Maven Central](https://central.sonatype.com/artifact/com.mailgun/mailgun-java) and use that version.

```xml
<dependency>
    <groupId>com.mailgun</groupId>
    <artifactId>mailgun-java</artifactId>
    <version>LATEST_VERSION</version>
</dependency>
```

### Base URL

- **US:** `https://api.mailgun.net`
- **EU:** `https://api.eu.mailgun.net`

Always match the region of the user's Mailgun account. US and EU data do not cross.

### Endpoints

| Operation                | Method          | Path                                     |
| ------------------------ | --------------- | ---------------------------------------- |
| Single validation        | `GET` or `POST` | `/v4/address/validate`                   |
| Create preview           | `POST`          | `/v4/address/validate/preview/{list_id}` |
| Get preview status       | `GET`           | `/v4/address/validate/preview/{list_id}` |
| Promote preview to bulk  | `PUT`           | `/v4/address/validate/preview/{list_id}` |
| Delete preview           | `DELETE`        | `/v4/address/validate/preview/{list_id}` |
| List all previews        | `GET`           | `/v4/address/validate/preview`           |
| Create bulk job          | `POST`          | `/v4/address/validate/bulk/{list_id}`    |
| Get bulk status/download | `GET`           | `/v4/address/validate/bulk/{list_id}`    |
| Cancel/delete bulk job   | `DELETE`        | `/v4/address/validate/bulk/{list_id}`    |
| List all bulk jobs       | `GET`           | `/v4/address/validate/bulk`              |

### First API Call — Single Validation (curl)

```bash
curl --user 'api:YOUR_API_KEY' \
  "https://api.mailgun.net/v4/address/validate?address=recipient@example.com"
```

Response:

```json
{
  "address": "recipient@example.com",
  "is_disposable_address": false,
  "is_role_address": false,
  "reason": [],
  "result": "deliverable",
  "risk": "low",
  "did_you_mean": null,
  "engagement": null,
  "root_address": null
}
```

### First API Call — Bulk Validation (curl)

```bash
curl --user 'api:YOUR_API_KEY' \
  "https://api.mailgun.net/v4/address/validate/bulk/my_list" \
  -F 'file=@/path/to/emails.csv'
```

Response:

```json
{
  "id": "my_list",
  "message": "The validation job was submitted."
}
```

Poll status with `GET /v4/address/validate/bulk/my_list` until `status` is `uploaded`, then download results from `download_url.csv` / `download_url.json`.

### Request (Single Validation)

| Field             | Type    | Required | Notes                                                       |
| ----------------- | ------- | -------- | ----------------------------------------------------------- |
| `address`         | string  | Yes      | Email address to validate (max 512 chars)                   |
| `provider_lookup` | boolean | No       | Set `false` to skip provider checks (faster, less accurate) |

### Response (Single Validation)

| Field                   | Type         | Values                                                                |
| ----------------------- | ------------ | --------------------------------------------------------------------- |
| `address`               | string       | The validated email address                                           |
| `result`                | string enum  | `deliverable`, `undeliverable`, `do_not_send`, `catch_all`, `unknown` |
| `risk`                  | string enum  | `low`, `medium`, `high`, `unknown`                                    |
| `is_disposable_address` | boolean      | Whether the address is disposable/temporary                           |
| `is_role_address`       | boolean      | Whether the address is a role address (`info@`, `support@`)           |
| `reason`                | string[]     | Reason codes for the result                                           |
| `did_you_mean`          | string\|null | Typo suggestion (e.g., `gmail.com` for `gmial.com`)                   |
| `engagement`            | object\|null | `engaged` (bool), `engagement` (string), `is_bot` (bool)              |
| `root_address`          | string\|null | Root address if sub-addressing detected                               |

### Bulk Validation File Requirements

- CSV must have header row with `email` or `email_address` column
- File must be UTF-8 or ASCII, under 25 MB, no `@` in list name
- `created_at` is an RFC 2822 date string (e.g., `"Tue, 26 Feb 2019 21:30:03 GMT"`)
- Preview `created_at` is a unix timestamp (different format from bulk)
- Response wrapped in a `"preview"` key for preview endpoints

For full field descriptions, reason codes, and result types see the [Single Validation docs](https://documentation.mailgun.com/docs/validate/single-valid-ir.md).

## Key Concepts

**Result** — Primary verdict on an address: `deliverable`, `undeliverable`, `do_not_send`, `catch_all`, `unknown`. Independent from risk.
**Risk** — Threat level: `low`, `medium`, `high`, `unknown`. A `deliverable` address can still be `high` risk (e.g., spam trap).
**Disposable address** — Temporary/throwaway email provider. Block at signup.
**Role address** — Generic mailbox like `info@`, `support@`. Fine for transactional, risky for marketing.
**Engagement** — Behavioral data: contract customers get `High Engager`, `Engager`, `Bot`, `Complainer`, `Disengaged`, `No data`; self-service get boolean `engaging`/`is_bot`. See [Engagement docs](https://documentation.mailgun.com/docs/validate/validate_engagement.md).
**List Health Preview** — Free, non-destructive sample assessment of a list. Returns deliverability/risk ratios as percentages. Max 10 parallel jobs. Status: `preview_processing` → `preview_complete`.
**Bulk Validation** — Full validation of an uploaded CSV/gzip file (max 25 MB). Max 5 parallel jobs. Lifecycle: `created` → `processing` → `completed` → `uploading` → `uploaded` (or `failed`). Results available via `download_url.csv` / `download_url.json` when status is `uploaded`.

## Common Patterns

- **Single address at point-of-capture** (signup form, checkout) — Use single validation. Check `result` and `risk`. Block or warn on `do_not_send`, `high` risk, or `is_disposable_address`. Surface `did_you_mean` to users for typo correction.
- **Existing list, unknown quality** — Run a free List Health Preview first (`POST /v4/address/validate/preview/{list_id}`). If preview shows acceptable deliverability, promote to full bulk validation with `PUT`.
- **Known-good list, full validation needed** — Skip preview, go straight to bulk validation (`POST /v4/address/validate/bulk/{list_id}`). Poll GET until status is `uploaded`. Download results and suppress `undeliverable`, `do_not_send`, and `high` risk addresses. Retrieve download URLs promptly (they expire).
- **Interpreting result + risk together** — Both axes are independent:
  - `deliverable` + `high` risk → suppress (possible spam trap)
  - `catch_all` → domain accepts everything, treat as medium risk
  - Role addresses → fine for transactional, avoid for marketing

## Gotchas and Best Practices

- **Preview before bulk.** Previews are free. Always preview first to avoid wasting credits on a bad list.
- **Result ≠ risk.** Both must be checked. A `deliverable` + `high` risk address should still be suppressed.
- **Catch-all domains.** `catch_all` means the mailbox may not exist. Treat as medium risk.
- **Disposable/role addresses.** Block disposables at signup. Avoid marketing sends to role addresses.
- **Region consistency.** US and EU data do not cross. Match the region of your Mailgun Send account.
- **`did_you_mean`.** Surface typo suggestions to end users at signup time — do not silently auto-correct.
- **Download URLs expire.** Retrieve bulk results promptly after status reaches `uploaded`.
- **Max parallel jobs.** 10 for previews, 5 for bulk. Exceeding returns an error.
- **Rate limiting.** `429 Too Many Requests` on single validation — back off and retry.
- Load credentials from environment variables. Never hardcode API keys.

## Links

- [Authentication setup](../sinch-authentication/SKILL.md)
- [Single Validation](https://documentation.mailgun.com/docs/validate/single-valid-ir.md) — field reference, reason codes, result types
- [Bulk Validation](https://documentation.mailgun.com/docs/validate/bulk-valid-ir.md) — job lifecycle, response schema
- [List Health Preview](https://documentation.mailgun.com/docs/validate/bulk_valid_preview.md) — preview workflow, response schema
- [Engagement](https://documentation.mailgun.com/docs/validate/validate_engagement.md) — behavior types, contract vs self-service
- [OpenAPI Spec](https://documentation.mailgun.com/docs/validate/oas/openapi-validate-final.md) — full endpoint reference
- [API Overview / Auth](https://documentation.mailgun.com/docs/validate/api-overview.md) — base URLs, authentication
- [Node.js SDK](https://documentation.mailgun.com/docs/mailgun/sdk/nodejs_sdk)
- [Java SDK](https://documentation.mailgun.com/docs/mailgun/sdk/java_sdk)
- [Python SDK](https://documentation.mailgun.com/docs/mailgun/sdk/python_sdk)
- [PHP SDK](https://documentation.mailgun.com/docs/mailgun/sdk/php_sdk)
- [Ruby SDK](https://documentation.mailgun.com/docs/mailgun/sdk/ruby_sdk)
- [Go SDK](https://documentation.mailgun.com/docs/mailgun/sdk/go_sdk)
- [Mailgun Dashboard](https://app.mailgun.com)
- [Mailgun LLMs.txt](https://documentation.mailgun.com/llms.txt) — full docs index for AI agents
