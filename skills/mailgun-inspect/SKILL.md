---
name: sinch-mailgun-inspect
description: Build with Mailgun Inspect API for email pre-send quality control. Use when previewing emails across clients, checking accessibility, validating links or images.
---

# Mailgun Inspect

Mailgun Inspect (by Sinch) is an email pre-send quality control tool that ensures your emails are optimized for delivery, readability, and accessibility before they reach recipients. It provides email previews, accessibility testing, link validation, image validation, and code analysis.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

All API requests use HTTP Basic Auth (same as Mailgun Send):
- **Username:** `api`
- **Password:** Your Mailgun Private API key

Obtain your API key:
1. Log in to your Mailgun Dashboard
2. Navigate to Account Settings > API Keys
3. Copy your Private API Key

```bash
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inspect/...
```

### Base URLs

Mailgun Inspect supports both US and EU regions:

| Region | Endpoint              |
|--------|-----------------------|
| US     | api.mailgun.net       |
| EU     | api.eu.mailgun.net    |

### First API Call: Accessibility Test

Submit HTML content for accessibility analysis:

```bash
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/accessibility \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Hello World</h1><img src=\"logo.png\"></body></html>",
    "encoded": false
  }'
```

The `encoded` field indicates whether the `html` value is Base64-encoded (`true`) or raw HTML (`false`).

## Key Concepts

### Email Previews

Generate previews of your email across various email clients and devices. See how your email renders in Gmail, Outlook, Apple Mail, and other popular clients before sending.

**API endpoint:** `/v1/inspect/preview`

Typical workflow:
1. Submit your email HTML to create a preview request
2. Poll for preview results (rendering takes time)
3. Retrieve rendered screenshots for each client

### Accessibility Testing

Check your emails against accessibility standards (WCAG) to ensure content is inclusive for all users, including those using screen readers or assistive technologies.

**API endpoint:** `/v1/inspect/accessibility`

Checks include:
- Alt text on images
- Color contrast ratios
- Semantic HTML structure
- Language attributes
- Table accessibility
- Link text clarity

### Link Validation

Verify the validity and status of all links within your email. Detect broken URLs, redirects, and potentially malicious links before sending.

**API endpoint:** `/v1/inspect/links`

```bash
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/links \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><a href=\"https://example.com\">Click here</a></body></html>",
    "encoded": false
  }'
```

### Image Validation

Check image properties such as dimensions, file size, and availability. Catch rendering issues caused by missing, oversized, or improperly formatted images.

**API endpoint:** `/v1/inspect/images`

```bash
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/images \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><img src=\"https://example.com/logo.png\" alt=\"Logo\"></body></html>",
    "encoded": false
  }'
```

### Code Analysis

Analyze your email HTML/CSS for compatibility issues across email clients. Identify CSS properties or HTML elements that may not render correctly in specific clients.

**API endpoint:** `/v1/inspect/code`

## Common Patterns

### Full Pre-Send Quality Check

Run all checks on an email before sending:

```bash
# 1. Check accessibility
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/accessibility \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...</html>", "encoded": false}'

# 2. Validate links
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/links \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...</html>", "encoded": false}'

# 3. Validate images
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/images \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...</html>", "encoded": false}'

# 4. Analyze code compatibility
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/code \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...</html>", "encoded": false}'
```

### Base64-Encoded HTML

For complex HTML with special characters, use Base64 encoding:

```bash
# Encode HTML
HTML_BASE64=$(echo -n '<html><body><h1>Hello</h1></body></html>' | base64)

curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inspect/accessibility \
  -H "Content-Type: application/json" \
  -d "{\"html\": \"$HTML_BASE64\", \"encoded\": true}"
```

### CI/CD Integration

Add Inspect checks to your deployment pipeline to catch email issues before they go live:

```bash
#!/bin/bash
# Pre-send email validation script
API_KEY="YOUR_API_KEY"
HTML_FILE="email-template.html"
HTML_CONTENT=$(cat "$HTML_FILE" | base64)

# Run accessibility check
RESULT=$(curl -s --user "api:$API_KEY" \
  -X POST https://api.mailgun.net/v1/inspect/accessibility \
  -H "Content-Type: application/json" \
  -d "{\"html\": \"$HTML_CONTENT\", \"encoded\": true}")

echo "Accessibility results: $RESULT"
# Parse and fail build if critical issues found
```

## Gotchas and Best Practices

1. **Content-Type** -- All Inspect API requests use `application/json` (not form data like Mailgun Send).
2. **HTML encoding** -- Set `"encoded": true` when passing Base64-encoded HTML, `false` for raw HTML strings. Raw HTML in JSON must have quotes and special characters properly escaped.
3. **Rendering differences** -- Email client rendering varies significantly. Gmail strips `<style>` tags, Outlook uses Word's rendering engine, and Apple Mail has good CSS support. Always preview across multiple clients.
4. **Preview generation time** -- Email previews are not instant. Poll the results endpoint after submitting a preview request.
5. **Same authentication** -- Inspect uses the same Mailgun API key and Basic Auth as the Send API. No separate credentials needed.
6. **Region consistency** -- Use the same region (US or EU) endpoint as your Mailgun Send account.
7. **Accessibility standards** -- Focus on WCAG 2.1 Level AA compliance: alt text for images, sufficient color contrast (4.5:1 ratio for normal text), semantic headings, and descriptive link text.
8. **Image best practices** -- Always include `alt` attributes, keep image file sizes under 200KB each, and total email size under 100KB (excluding images) for optimal delivery.
9. **Link validation limits** -- Large emails with many links may take longer to validate. Consider batching if you have hundreds of links.
10. **Postman collection** -- A Postman collection is available for testing: https://www.postman.com/inspect-team/mailgun-inspect/overview

## API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/inspect/accessibility` | POST | Run accessibility analysis |
| `/v1/inspect/links` | POST | Validate all links in HTML |
| `/v1/inspect/images` | POST | Validate all images in HTML |
| `/v1/inspect/code` | POST | Analyze HTML/CSS compatibility |
| `/v1/inspect/preview` | POST | Generate email client previews |

### Request Body (all endpoints)

```json
{
  "html": "<html>Your email content</html>",
  "encoded": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `html` | string | Yes | Email HTML content (raw or Base64) |
| `encoded` | boolean | Yes | `true` if html is Base64-encoded |

## Links

- Documentation: https://documentation.mailgun.com/docs/inspect
- API Overview: https://documentation.mailgun.com/docs/inspect/api-reference/api-overview
- OpenAPI Spec: https://documentation.mailgun.com/docs/inspect/api-reference/openapi-final.yaml
- Postman Collection: https://www.postman.com/inspect-team/mailgun-inspect/overview
- Mailgun Dashboard: https://app.mailgun.com
- Sign Up: https://www.mailgun.com/products/inspect/#form
- Help Center: https://help.mailgun.com
- Mailgun LLMs.txt: https://documentation.mailgun.com/llms.txt
- LLMs.txt (full docs index): https://developers.sinch.com/llms.txt
