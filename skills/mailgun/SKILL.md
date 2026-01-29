---
name: sinch-mailgun
description: Build with Mailgun Email API for sending, receiving, and tracking email. Use when working with Mailgun domains, messages, templates, webhooks, events, or routes.
---

# Mailgun Email API

Mailgun (by Sinch) is a powerful email API for sending, receiving, and tracking email. It supports both REST API and SMTP relay for transactional and bulk email.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

All API requests use HTTP Basic Auth:
- **Username:** `api`
- **Password:** Your Mailgun Private API key

Find your API key: Mailgun Dashboard > Account Settings > API Keys > Private API Key.

There are two types of API keys:
- **Primary Account API Key** -- full access to all endpoints and domains
- **Domain Sending Keys** -- restricted to POST on `/messages` and `/messages.mime` for a specific domain

```bash
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages
```

### Base URLs (Regions)

Mailgun operates in US and EU regions. Use the correct base URL for your domain's region:

| Service               | US Endpoint            | EU Endpoint               |
|-----------------------|------------------------|---------------------------|
| REST API              | api.mailgun.net        | api.eu.mailgun.net        |
| Outgoing SMTP         | smtp.mailgun.org       | smtp.eu.mailgun.org       |
| Inbound SMTP (Routes) | mxa.mailgun.org       | mxa.eu.mailgun.org        |
| Open/Click Tracking   | mailgun.org            | eu.mailgun.org            |

### First API Call: Send an Email

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='Sender <sender@YOUR_DOMAIN>' \
  -F to='recipient@example.com' \
  -F subject='Hello from Mailgun' \
  -F text='This is a test email sent via Mailgun API.'
```

Successful response:
```json
{
  "id": "<message-id@YOUR_DOMAIN>",
  "message": "Queued. Thank you."
}
```

### Send HTML Email

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='Sender <sender@YOUR_DOMAIN>' \
  -F to='recipient@example.com' \
  -F subject='Hello' \
  -F html='<h1>Hello</h1><p>HTML email via Mailgun.</p>'
```

### SDKs

Official SDKs are available for many languages. For Node.js:

```bash
npm install mailgun.js form-data
```

```javascript
const Mailgun = require('mailgun.js');
const formData = require('form-data');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: 'YOUR_API_KEY',
  // For EU: url: 'https://api.eu.mailgun.net'
});

mg.messages.create('YOUR_DOMAIN', {
  from: 'Sender <sender@YOUR_DOMAIN>',
  to: ['recipient@example.com'],
  subject: 'Hello from Mailgun',
  text: 'Testing Mailgun!',
  html: '<h1>Testing Mailgun!</h1>'
})
.then(msg => console.log(msg))
.catch(err => console.error(err));
```

## Key Concepts

### Domains

- **Sandbox domain** -- provided on signup (e.g., `sandboxXXX.mailgun.org`). Limited to authorized recipients only.
- **Custom domain** -- your own domain, requires DNS verification (SPF, DKIM, MX records).
- Each domain has its own settings, tracking, and credentials.

### Sending Methods

- **REST API** -- POST form data to `/v3/{domain}/messages`. Supports `from`, `to`, `cc`, `bcc`, `subject`, `text`, `html`, attachments, headers, tags, and variables.
- **SMTP** -- Standard SMTP relay via `smtp.mailgun.org` (port 587, TLS). Credentials are per-domain.
- **MIME** -- POST raw MIME to `/v3/{domain}/messages.mime`.

### Templates

Store reusable HTML templates in Mailgun. Reference by name when sending:

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='sender@YOUR_DOMAIN' \
  -F to='recipient@example.com' \
  -F subject='Welcome' \
  -F template='welcome-template' \
  -F h:X-Mailgun-Variables='{"name": "John"}'
```

### Webhooks

Receive real-time HTTP POST notifications for email events. Supported event types:
- `delivered`, `opened`, `clicked`, `unsubscribed`
- `complained`, `bounced` (permanent/temporary)
- `failed`, `stored`

### Events API

Query email events programmatically:

```bash
curl -s --user 'api:YOUR_API_KEY' \
  "https://api.mailgun.net/v3/YOUR_DOMAIN/events?event=delivered&limit=10"
```

### Routes

Inbound email processing rules. Match incoming messages by recipient pattern or header expression, then forward, store, or execute webhooks.

### Suppressions

Manage bounces, unsubscribes, and complaints lists per domain:
- `/v3/{domain}/bounces`
- `/v3/{domain}/unsubscribes`
- `/v3/{domain}/complaints`

### Mailing Lists

Create and manage mailing lists for batch sending:
- `/v3/lists` -- create, update, delete lists
- `/v3/lists/{address}/members` -- manage members

### Tags

Tag messages for tracking and analytics grouping. Add via `o:tag` parameter when sending.

## Common Patterns

### Send with Personalization (Batch Sending)

Use recipient variables for per-recipient personalization in a single API call:

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='sender@YOUR_DOMAIN' \
  -F to='alice@example.com,bob@example.com' \
  -F subject='Hello %recipient.first_name%' \
  -F text='Hello %recipient.first_name%, your code is %recipient.code%' \
  -F recipient-variables='{"alice@example.com":{"first_name":"Alice","code":"ABC"},"bob@example.com":{"first_name":"Bob","code":"XYZ"}}'
```

### Track Opens and Clicks

Enable tracking per message or at domain level:

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='sender@YOUR_DOMAIN' \
  -F to='recipient@example.com' \
  -F subject='Tracked email' \
  -F html='<p>Click <a href="https://example.com">here</a></p>' \
  -F o:tracking='yes' \
  -F o:tracking-clicks='yes' \
  -F o:tracking-opens='yes'
```

### Schedule Email Delivery

```bash
curl -s --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages \
  -F from='sender@YOUR_DOMAIN' \
  -F to='recipient@example.com' \
  -F subject='Scheduled' \
  -F text='This will arrive later.' \
  -F o:deliverytime='Thu, 13 Oct 2024 18:00:00 +0000'
```

## Gotchas and Best Practices

1. **Sandbox domain restrictions** -- Only pre-authorized recipients can receive email from sandbox domains. Add recipients in the Mailgun dashboard before sending.
2. **Domain verification** -- Custom domains require DNS records (SPF TXT, DKIM TXT, MX for inbound). Verification can take minutes to hours depending on DNS propagation.
3. **US vs EU region** -- Domains are region-bound. Always use the matching API base URL (`api.mailgun.net` for US, `api.eu.mailgun.net` for EU). Message data never leaves its region.
4. **Rate limits** -- API returns `429` when rate-limited. Check `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers. Implement exponential backoff.
5. **Content type** -- The Messages API uses `multipart/form-data` (not JSON). Use `-F` flags in curl, not `-d` with JSON.
6. **Date format** -- Use RFC-2822 format for dates. Avoid abbreviated timezone names (EST, CET); use numerical offsets (+0500) or UTC.
7. **Batch sending limit** -- Up to 1,000 recipients per API call using recipient variables.
8. **Suppression lists** -- Mailgun automatically suppresses bounced/unsubscribed/complained addresses. Sending to suppressed addresses silently drops the message.
9. **API key security** -- Never expose your primary API key in client-side code. Use Domain Sending Keys for restricted access.
10. **IP warmup** -- New dedicated IPs need gradual volume increase to build sender reputation.

## API Reference

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/{domain}/messages` | POST | Send email |
| `/v3/{domain}/messages.mime` | POST | Send raw MIME |
| `/v3/{domain}/events` | GET | Query events |
| `/v3/domains` | GET/POST | List/create domains |
| `/v3/domains/{domain}/verify` | PUT | Verify domain DNS |
| `/v3/{domain}/templates` | GET/POST | Manage templates |
| `/v3/{domain}/webhooks` | GET/POST/PUT/DELETE | Manage webhooks |
| `/v3/{domain}/bounces` | GET/POST/DELETE | Manage bounces |
| `/v3/{domain}/unsubscribes` | GET/POST/DELETE | Manage unsubscribes |
| `/v3/routes` | GET/POST/PUT/DELETE | Manage routes |
| `/v3/lists` | GET/POST | Manage mailing lists |
| `/v3/{domain}/tags` | GET/DELETE | Manage tags |

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (check `message` in response) |
| 401 | Unauthorized (bad API key) |
| 403 | Forbidden (valid key, no access) |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

## Links

- Documentation: https://documentation.mailgun.com/docs/mailgun/
- API Reference: https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview
- Dashboard: https://app.mailgun.com
- Sign Up: https://signup.mailgun.com/new/signup
- Help Center: https://help.mailgun.com
- SDKs: https://documentation.mailgun.com/docs/mailgun/sdk-reference/
- Status Page: https://status.mailgun.com
- LLMs.txt (full docs index): https://developers.sinch.com/llms.txt
