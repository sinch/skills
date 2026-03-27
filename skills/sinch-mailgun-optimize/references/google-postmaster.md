# Google Postmaster Tools — Endpoint Reference

Base path: `/v1/reputationanalytics/gpt/`

Requires domain verification with Google Postmaster Tools before data becomes available.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/reputationanalytics/gpt/domains` | GET | All domains — daily records for every tracked domain |
| `/v1/reputationanalytics/gpt/domains/{domain}` | GET | Single domain — daily records for one domain |
| `/v1/reputationanalytics/gpt/domains_list` | GET | List tracked domain names (no metric data) |
| `/v1/reputationanalytics/gpt/domainsfbl` | GET | Feedback loop data — all domains |
| `/v1/reputationanalytics/gpt/domainsfbl/{domain}` | GET | Feedback loop data — single domain |
| `/v1/reputationanalytics/gpt/addresses` | GET | All addresses — daily records |
| `/v1/reputationanalytics/gpt/addresses/{address}` | GET | Single address — daily records |
| `/v1/reputationanalytics/gpt/addresses_list` | GET | List tracked addresses (no metric data) |

> The API has 5 additional endpoints not listed here. Fetch the [OpenAPI spec](https://documentation.mailgun.com/_spec/docs/inboxready/api-reference/optimize/inboxready.yaml?download) for the full list.

## Common Query Parameters

All data endpoints accept these required query parameters:

- `offset` (integer) — record number to begin pagination
- `limit` (integer) — number of records to return
- `timeRangeStart` (integer) — Unix timestamp start filter
- `timeRangeEnd` (integer) — Unix timestamp end filter

## Response Model (Domain Record)

Each record in the `data[]` array contains:

- `name` (string) — domain name
- `reputation` (int) — Google's domain reputation score
- `user_reported_spam_ratio` (float) — percentage of mail reported as spam
- `spf_success_ratio` (float) — SPF authentication pass rate
- `dkim_success_ratio` (float) — DKIM authentication pass rate
- `dmarc_success_ratio` (float) — DMARC alignment pass rate
- `inbound_encryption_ratio` (float) — TLS encryption rate
- `delivery_error_ratio` (float) — delivery error rate
- `delivery_errors[]` — array of `{ error_class, error_type, error_ratio }`
- `ip_counts[]` — array of `{ reputation, total }` per IP reputation band
- `feedback_loops[]` — array of `{ id, spam_ratio }` per FBL identifier
- `date` (datetime, nullable) — date of the record

## Links

- API docs: https://documentation.mailgun.com/docs/inboxready/api-reference/optimize/inboxready/google-postmaster-tools
