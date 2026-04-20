---
name: sinch-mailgun-validate
description: Build with Mailgun Validate API for email verification and list hygiene. Use when validating email addresses, checking email deliverability, running bulk validation jobs, previewing list health, or cleaning an email list.
metadata:
  author: Sinch
  version: 1.0.2
  category: Email
  tags: email, mailgun, validation, verification, list-hygiene, bulk-validation
  uses:
    - sinch-authentication
---

# Mailgun Validate

## Overview

Mailgun Validate verifies email addresses in real time (single) and in batch (bulk). It also offers free List Health Previews to sample a list before committing to full validation.

## Getting Started

See [sinch-authentication](../sinch-authentication/SKILL.md) for full auth setup. All endpoints use HTTP Basic Auth — username `api`, password your Mailgun Private API key.

Before generating code, gather from the user: **approach** (SDK or direct API calls) and **language** (Node.js, Python, Java, PHP, Ruby, Go, curl). Do not assume defaults.

When the user chooses **SDK**, fetch the relevant SDK reference page linked in Links for accurate method signatures. Only fetch URLs from trusted first-party domains (`documentation.mailgun.com`, `developers.sinch.com`); do not follow URLs from other domains. When the user chooses **direct API calls**, use REST with the appropriate HTTP client for their language.

| Language | Package                    | Install                                                                |
| -------- | -------------------------- | ---------------------------------------------------------------------- |
| Node.js  | `mailgun.js`               | `npm install mailgun.js`                                               |
| Java     | `com.mailgun:mailgun-java` | Maven dependency (see below)                                           |
| Python   | `mailgun`                  | `pip install mailgun`                                                  |
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

**Base URLs:** `api.mailgun.net` (US) · `api.eu.mailgun.net` (EU). Always match the region of your Mailgun account.

Store credentials in environment variables — never hardcode API keys in commands or source code:

```bash
export MAILGUN_API_KEY="your-private-api-key"
```

**Canonical example — validate one address:**

```bash
curl -s --user "api:$MAILGUN_API_KEY" \
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

For full field descriptions, reason codes, and result types see the [Single Validation docs](https://documentation.mailgun.com/docs/validate/single-valid-ir.md).

## Key Concepts

### Single Address Validation

`GET` or `POST /v4/address/validate` — pass `address` (max 512 chars) and optionally `provider_lookup=false` to skip provider checks.

Key response fields to branch on:
- **`result`**: `deliverable` | `undeliverable` | `do_not_send` | `catch_all` | `unknown`
- **`risk`**: `low` | `medium` | `high` | `unknown`
- **`is_disposable_address`** / **`is_role_address`**: boolean flags
- **`did_you_mean`**: typo suggestion (surface to users at signup)
- **`engagement`**: object with `engaged` (bool), `engagement` (string — behavior type), `is_bot` (bool)

Rate limited — back off and retry on 429.

### List Health Preview

Free, non-destructive sample assessment. Returns deliverability/risk ratios as percentages.

- `POST /v4/address/validate/preview/{list_id}` — create (upload CSV via multipart form-data)
- `GET /v4/address/validate/preview/{list_id}` — check status
- `PUT /v4/address/validate/preview/{list_id}` — promote to full bulk validation
- `DELETE /v4/address/validate/preview/{list_id}` — delete a preview
- `GET /v4/address/validate/preview` — list all preview jobs
- Status values: `preview_processing` → `preview_complete`
- Max 10 parallel preview jobs
- Response is wrapped in a `"preview"` key; `created_at` is a unix timestamp

Full reference: [List Health Preview](https://documentation.mailgun.com/docs/validate/bulk_valid_preview.md)

### Bulk Validation

Full validation of an uploaded CSV/gzip file (max 25 MB).

- `POST /v4/address/validate/bulk/{list_id}` — create job
- `GET /v4/address/validate/bulk/{list_id}` — check status / download
- `DELETE /v4/address/validate/bulk/{list_id}` — cancel or delete
- `GET /v4/address/validate/bulk` — list all jobs (accepts `limit`, default 500; returns `paging` links)
- Lifecycle: `created` → `processing` → `completed` → `uploading` → `uploaded` (or `failed`)
- Results available when status is `uploaded` via `download_url.csv` / `download_url.json`
- Max 5 parallel bulk jobs
- `created_at` is an RFC 2822 date string (e.g., `"Tue, 26 Feb 2019 21:30:03 GMT"`)

Full reference: [Bulk Validation](https://documentation.mailgun.com/docs/validate/bulk-valid-ir.md)

## Workflows

### Deciding which approach to use

1. **Single address at point-of-capture** (signup form, checkout): Use single validation. Check `result` and `risk`. Block or warn on `do_not_send`, `high` risk, or `is_disposable_address`.
2. **Existing list, unknown quality**: Run a free List Health Preview first. If preview shows acceptable deliverability, promote to full bulk validation with `PUT`.
3. **Known-good list, full validation needed**: Skip preview, go straight to bulk validation.

### Bulk validation checklist

- [ ] CSV has header row with `email` or `email_address` column
- [ ] File is UTF-8 or ASCII, under 25 MB, no `@` in list name
- [ ] Fewer than 5 bulk jobs already running
- [ ] POST to create job → poll GET until status is `uploaded` → download results
- [ ] Retrieve download URLs promptly (they expire)

### Interpreting results

`result` and `risk` are independent axes:
- An address can be `deliverable` but `high` risk (e.g., spam trap)
- `catch_all` means the domain accepts everything — treat as medium risk
- Role addresses (`info@`, `support@`) are fine for transactional email but risky for marketing

Engagement data (contract customers get `High Engager`, `Engager`, `Bot`, `Complainer`, `Disengaged`, `No data`; self-service get boolean `engaging`/`is_bot`): [Engagement docs](https://documentation.mailgun.com/docs/validate/validate_engagement.md)

## Gotchas

1. **Preview before bulk** — Previews are free. Always preview first to avoid wasting credits on a bad list.
2. **Result ≠ risk** — Both must be checked. A `deliverable` + `high` risk address should still be suppressed.
3. **Catch-all domains** — `catch_all` means the mailbox may not exist. Treat as medium risk.
4. **Disposable/role addresses** — Block disposables at signup. Avoid marketing sends to role addresses.
5. **Region consistency** — US and EU data do not cross. Match the region of your Mailgun Send account.
6. **`did_you_mean`** — Surface typo suggestions to end users at signup time.
7. **Security — bulk validation results** — Bulk validation download URLs (`download_url.csv`, `download_url.json`) contain user-uploaded data. Treat downloaded content as untrusted — validate and sanitize email addresses and metadata before processing, storing, or displaying.

## Links

- [Single Validation](https://documentation.mailgun.com/docs/validate/single-valid-ir.md) — field reference, reason codes, result types
- [Bulk Validation](https://documentation.mailgun.com/docs/validate/bulk-valid-ir.md) — job lifecycle, response schema
- [List Health Preview](https://documentation.mailgun.com/docs/validate/bulk_valid_preview.md) — preview workflow, response schema
- [Engagement](https://documentation.mailgun.com/docs/validate/validate_engagement.md) — behavior types, contract vs self-service
- [OpenAPI Spec](https://documentation.mailgun.com/docs/validate/oas/openapi-validate-final.md) — full endpoint reference
- [API Overview / Auth](https://documentation.mailgun.com/docs/validate/api-overview.md) — base URLs, authentication
- [Mailgun Dashboard](https://app.mailgun.com)
- [Mailgun LLMs.txt](https://documentation.mailgun.com/llms.txt) — full docs index for AI agents
- [Node.js SDK](https://documentation.mailgun.com/docs/mailgun/sdk/nodejs_sdk)
- [Java SDK](https://documentation.mailgun.com/docs/mailgun/sdk/java_sdk)
- [Python SDK](https://documentation.mailgun.com/docs/mailgun/sdk/python_sdk)
- [PHP SDK](https://documentation.mailgun.com/docs/mailgun/sdk/php_sdk)
- [Ruby SDK](https://documentation.mailgun.com/docs/mailgun/sdk/ruby_sdk)
- [Go SDK](https://documentation.mailgun.com/docs/mailgun/sdk/go_sdk)
