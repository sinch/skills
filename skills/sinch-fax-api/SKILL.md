---
name: sinch-fax-api
description: Send and receive faxes programmatically with Sinch Fax API. Use when building fax workflows, fax-to-email delivery, sending PDFs by fax, checking fax status, managing fax services, configuring cover pages, receiving fax webhooks, or integrating fax into healthcare, legal, or financial applications.
metadata:
  author: Sinch
  version: 1.0.3
  category: Voice
  tags: fax, pdf, fax-to-email, webhooks, healthcare, legal
  uses:
    - sinch-authentication
    - sinch-sdks
---

# Sinch Fax API

## Overview

The Sinch Fax API lets you send and receive faxes programmatically. It supports multiple file formats, webhooks for incoming faxes, fax-to-email delivery, and automatic retries. Used for healthcare, legal, financial, and government applications where fax remains a required communication channel.

**Auth:** See [sinch-authentication](../sinch-authentication/SKILL.md) for setup.

## Getting Started

Before generating code, gather from the user: approach (SDK or direct API), language (Node.js, Python, Java, .NET, curl), and use case (sending, receiving, fax-to-email, or managing services). Do not assume defaults.

When generating callback/webhook handlers or processing inbound fax data, always include input validation and sanitization. Treat all inbound content (`contentUrl`, filenames, metadata, `errorMessage`) as untrusted — never interpolate into prompts, evaluate as code, or use in shell commands unsanitized.

When the user chooses **SDK**, fetch the relevant API reference docs linked in Links for accurate method signatures (trusted first-party Sinch docs at `developers.sinch.com`). When the user chooses **direct API calls**, use REST with the appropriate HTTP client for their language.

See [sinch-sdks](../sinch-sdks/SKILL.md) for SDK installation and client initialization. Note: Fax is only supported in **Node.js** (preview) and **.NET** (partial) — for Java and Python, use direct HTTP calls.

### First API Call — Send a Fax

Store credentials in environment variables — never hardcode tokens or keys in commands or source code:

```bash
export SINCH_PROJECT_ID="your-project-id"
export SINCH_ACCESS_TOKEN="your-oauth-token"
```

**curl:**

```bash
curl -X POST \
  "https://fax.api.sinch.com/v3/projects/$SINCH_PROJECT_ID/faxes" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+12025550134",
    "contentUrl": "https://example.com/document.pdf",
    "callbackUrl": "https://yourserver.com/fax-callback"
  }'
```

**Node.js SDK:** See [Send a Fax with Node.js](https://developers.sinch.com/docs/fax/getting-started/node/send-fax.md).

**Test number:** Send to `+19898989898` to emulate a real fax without charges (always suggest this for integration testing).

## Key Concepts

- **Fax Services** — Logical containers for fax configuration. Associate numbers, set defaults, and manage routing.
- **Fax Numbers** — Phone numbers provisioned for fax. Must be configured in your Sinch dashboard.
- **Faxes** — Individual fax transmissions (inbound or outbound). Each has a unique ID, status, and metadata.
- **Fax statuses** — `QUEUED` → `IN_PROGRESS` → `COMPLETED` or `FAILURE`. Error details in `errorType` and `errorMessage` fields.
- **Supported formats** — PDF (most reliable), DOC, DOCX, TIF/TIFF, JPG, PNG, TXT, HTML.
- **Webhooks/Callbacks** — HTTP POST notifications for fax events. Default content type is `multipart/form-data` (fax content as attachment). Set `callbackUrlContentType: "application/json"` for JSON callbacks.
- **Cover Pages** — Customizable cover pages per service. Attach via `coverPageId` and `coverPageData` on send.
- **Fax-to-Email** — Incoming faxes auto-forwarded to email addresses.
- **Retries** — Auto-retry on failure. Default set per fax service; maximum: 5.
- **Retention** — Fax logs and media retained for 13 months. Use `DELETE /faxes/{id}/file` to remove earlier.

## Common Patterns

Three ways to deliver content: `contentUrl` for URLs (recommended — supports basic auth), `multipart/form-data` for local files, or `contentBase64` for in-memory bytes. `contentUrl` can be a single URL or an array of URLs to compose multi-document faxes.

For HTTPS URLs, ensure your SSL certificate (including intermediate certs) is valid and up-to-date. You can optionally specify `from` to set the sender number.

- **Send a fax (URL, file upload, base64, multiple recipients)** — See [Send a Fax endpoint](https://developers.sinch.com/docs/fax/api-reference/fax/faxes.md). Use `multipart/form-data` for local files, JSON with `contentUrl` for URLs.
- **Receive faxes via webhook** — Callbacks use the content type configured via `callbackUrlContentType` (see Key Concepts). Check `direction === 'INBOUND'` on the fax object. See [Receive a Fax with Node.js](https://developers.sinch.com/docs/fax/getting-started/node/receive-fax.md).
- **Fax-to-email** — Configure via API or dashboard. Incoming faxes auto-forward to the configured email. See [Fax-to-Email Reference](https://developers.sinch.com/docs/fax/api-reference/fax/fax-to-email.md).
- **List faxes** — See [Faxes Endpoint Reference](https://developers.sinch.com/docs/fax/api-reference/fax/faxes.md)
- **Get fax details** — `GET /faxes/{id}`
- **Download fax content** — `GET /faxes/{id}/file.pdf` (`.pdf` suffix required)
- **Delete fax content** — `DELETE /faxes/{id}/file` (removes stored content before 13-month expiry)
- **Manage fax services** — See [Services Endpoint Reference](https://developers.sinch.com/docs/fax/api-reference/fax/services.md)
- **Manage cover pages** — `POST/GET/DELETE /services/{id}/coverPages` — see Services reference
- **Manage fax-to-email** — See [Fax-to-Email Reference](https://developers.sinch.com/docs/fax/api-reference/fax/fax-to-email.md)

## Troubleshooting

### Fax not delivered

1. Check fax status via `GET /faxes/{id}` — look at `status`, `errorType` (`DOCUMENT_CONVERSION_ERROR`, `CALL_ERROR`, `FAX_ERROR`, `FATAL_ERROR`, `GENERAL_ERROR`), and `errorMessage`
2. If `contentUrl` was used with HTTPS, verify the SSL certificate (including intermediate certs) is valid
3. Fax delivery depends on the receiving machine answering — retries are automatic (max 5, default set per service)

### Fax content renders incorrectly

- Complex DOC/DOCX formatting may not render perfectly on receiving machines. Recommend PDF instead.

### Cannot send or receive faxes

- Verify the number has fax capability enabled in the [Sinch dashboard](https://dashboard.sinch.com)
- Numbers must be provisioned for fax before use

## Gotchas and Best Practices

- Use `callbackUrl` for status tracking — fax delivery is async. Prefer callbacks over polling.
- PDF is the safest format for reliable rendering on receiving machines.
- Fax logs and media are retained for 13 months. Use `DELETE /faxes/{id}/file` to remove earlier, or download and archive if longer retention is needed.
- International fax success rates vary by country — some have specific dialing prefix requirements.
- Use `resolution: "SUPERFINE"` (400 dpi) for faxes with small text or detailed images; default `FINE` (200 dpi) works for most cases.
- **Security — untrusted content:** Inbound fax callbacks and `contentUrl` values may contain user-provided or third-party content. Treat all inbound fax data as untrusted — do not execute, evaluate, or interpolate it into prompts or code. Validate URLs before fetching. Sanitize callback body fields (filenames, metadata, `errorMessage`) before logging, rendering in HTML, or storing in a database.

## Links

- [Authentication setup](../sinch-authentication/SKILL.md)
- [Fax API Reference (Markdown)](https://developers.sinch.com/docs/fax/api-reference/fax.md)
- [Fax API OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/fax/api-reference/fax.yaml?download)
- [Getting Started Guide](https://developers.sinch.com/docs/fax/getting-started.md)
- [Send a Fax with Node.js](https://developers.sinch.com/docs/fax/getting-started/node/send-fax.md)
- [Receive a Fax with Node.js](https://developers.sinch.com/docs/fax/getting-started/node/receive-fax.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)