---
name: sinch-mailgun-optimize
description: Build with Mailgun Optimize (InboxReady) API for email deliverability tools. Use when testing inbox placement, monitoring blocklists, classifying bounces, or checking email health.
---

# Mailgun Optimize (InboxReady)

Mailgun Optimize (by Sinch), formerly InboxReady, is a suite of email deliverability tools. It helps you stay out of the spam folder, monitor sender reputation, test inbox placement, track blocklists, classify bounces, and measure email health scores.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

All API requests use HTTP Basic Auth (same as Mailgun):
- **Username:** `api`
- **Password:** Your Mailgun Private API key

```bash
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/...
```

### Base URL

```
https://api.mailgun.net/
```

The OpenAPI specification is available at:
https://documentation.mailgun.com/docs/inboxready/api-reference/optimize/inboxready

### First API Call: List Monitored Domains

```bash
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/domains
```

## Key Concepts

### Domains

Register and manage domains for reputation monitoring. Domains are the foundation for all Optimize tools including blocklist monitoring, bounce classification, spam trap monitoring, and Google Postmaster Tools integration.

```bash
# Register a domain for monitoring
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inboxready/domains \
  -H "Content-Type: application/json" \
  -d '{"domain": "yourdomain.com"}'

# List monitored domains
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/domains
```

### Inbox Placement Testing

Test where your emails land (inbox, spam, tabs, or missing) across major mailbox providers. Inbox placement uses seed testing -- sending your email to a set of seed addresses monitored by Mailgun.

**Creating a test** requires:
- `subject` (required) -- the email subject line
- One of: `html` (raw HTML content) or `url` (URL to fetch HTML from)
- All other properties are optional

**Test lifecycle:**
1. Create a test with subject + HTML/URL
2. Mailgun sends to seed addresses
3. Poll test status -- clients move through `processing` > `completed` (or `bounced`)
4. Retrieve results with screenshots and inbox/spam placement data

### IP Blocklist Monitoring

Monitor whether your sending IPs appear on major blocklists. Getting blocklisted can severely impact deliverability.

**Monitored blocklists include:**
- SpamCop
- CBL (Composite Blocking List)
- Spamhaus SBL, PBL, XBL
- Barracuda
- Senderscore BL

### Domain Blocklist Monitoring

Monitor your sending domains against domain-specific blocklists for an additional layer of reputation protection.

**Monitored domain blocklists include:**
- Spamhaus DBL
- URIBL
- SURBL

### Spam Trap Monitoring

Identify spam trap hits within your email lists. Spam traps are email addresses specifically designed to catch senders with poor list hygiene. Hitting spam traps damages sender reputation.

Types of spam traps:
- **Pristine traps** -- addresses that never belonged to real users
- **Recycled traps** -- abandoned addresses repurposed as traps
- **Typo traps** -- common misspellings of popular domains

### Bounce Classification

Classify bounced messages by sending domain and mailbox provider/spam filter. Helps identify problems with your sending that could lower reputation.

```bash
# Get bounce classifications for a domain
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/bounces?domain=yourdomain.com
```

Pull individual bounce logs for more details on specific messages causing bounces.

### Google Postmaster Tools

Integration with Google Postmaster Tools provides insights into Gmail-specific performance:
- Spam rates for Gmail recipients
- Domain reputation with Gmail
- IP reputation
- Authentication success rates (SPF, DKIM, DMARC)
- Encryption stats

### Microsoft SNDS (Smart Network Data Services)

Get data and insights into how Microsoft email services (Outlook, Hotmail) handle your emails:
- Spam filtering decisions
- IP status and reputation
- Trap hit data

### Email Health Score

An overall score (0-100) assessing your email program's health and IP reputation, similar to a credit score. Available at account, domain, IP, and subaccount levels.

```bash
# Get email health score
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/healthscore
```

### Alerts

Receive notifications for critical deliverability issues such as blocklist additions or reputation drops. Configure alerts to act swiftly on problems.

## Common Patterns

### Run an Inbox Placement Test

```bash
# 1. Create a test
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inboxready/tests \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test: March Newsletter",
    "html": "<html><body><h1>March Newsletter</h1><p>Content here...</p></body></html>"
  }'

# Response includes test_id
# { "test_id": "abc123", ... }

# 2. Check test status (poll until completed)
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/tests/abc123

# Response shows clients in: completed, processing, or bounced arrays

# 3. Get detailed results with screenshots
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/tests/abc123/results

# 4. Reprocess screenshots if needed (free of charge)
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inboxready/tests/abc123/reprocess \
  -H "Content-Type: application/json" \
  -d '{"clients": ["gmail", "outlook"]}'
```

### Monitor Blocklists

```bash
# Check IP blocklist status
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/blocklists/ip?ip=192.0.2.1

# Check domain blocklist status
curl --user 'api:YOUR_API_KEY' \
  https://api.mailgun.net/v1/inboxready/blocklists/domain?domain=yourdomain.com
```

### Set Up Alerts

```bash
# Configure blocklist alert
curl --user 'api:YOUR_API_KEY' \
  -X POST https://api.mailgun.net/v1/inboxready/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blocklist",
    "webhook_url": "https://yourapp.com/webhooks/blocklist"
  }'
```

### Review Bounce Classifications

```bash
# Get bounce classification summary
curl --user 'api:YOUR_API_KEY' \
  "https://api.mailgun.net/v1/inboxready/bounces?domain=yourdomain.com&start=2024-01-01&end=2024-01-31"
```

## Gotchas and Best Practices

1. **Seed list requirements** -- Inbox placement tests use Mailgun's seed addresses. You send your email to these seeds; do not use your own addresses. The seed list is provided when you create a test.
2. **Test frequency** -- Run inbox placement tests regularly (weekly for active senders, before major campaigns). Do not run too many tests simultaneously as it can skew results.
3. **Screenshot availability** -- Test result URLs are generated before screenshots complete. Check the `status` field to confirm the screenshot is ready. A missing file returns `403 Forbidden`.
4. **Test result retention** -- Inbox placement test results (including screenshots) are retained for 90 days from test creation.
5. **Reprocessing** -- If screenshots look incorrect, use the reprocess endpoint at no extra cost. Only request reprocessing for specific clients that need it.
6. **Blocklist response time** -- When you detect a blocklist listing, act quickly. Most blocklists have delisting request processes. Check the specific blocklist's website for their procedure.
7. **Spam trap mitigation** -- If spam traps are detected, do not try to identify the specific trap addresses. Instead, clean your entire list using email validation and implement double opt-in.
8. **Health score interpretation** -- Scores above 80 are good. Between 60-80 needs improvement. Below 60 requires immediate attention to sending practices.
9. **Google Postmaster setup** -- Google Postmaster Tools integration requires domain verification with Google first. Mailgun then pulls the data via API.
10. **Bounce monitoring cadence** -- Review bounce classifications daily or weekly. Persistent bounces to the same provider indicate a systemic issue (IP reputation, content filtering, or authentication problems).

## API Reference

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/inboxready/domains` | GET/POST | List/register monitored domains |
| `/v1/inboxready/tests` | POST | Create inbox placement test |
| `/v1/inboxready/tests/{id}` | GET | Get test status and info |
| `/v1/inboxready/tests/{id}/results` | GET | Get detailed test results |
| `/v1/inboxready/tests/{id}/reprocess` | POST | Reprocess test screenshots |
| `/v1/inboxready/blocklists/ip` | GET | Check IP blocklist status |
| `/v1/inboxready/blocklists/domain` | GET | Check domain blocklist status |
| `/v1/inboxready/bounces` | GET | Get bounce classifications |
| `/v1/inboxready/spamtraps` | GET | Get spam trap data |
| `/v1/inboxready/healthscore` | GET | Get email health score |
| `/v1/inboxready/alerts` | GET/POST | Manage alerts |
| `/v1/inboxready/postmaster` | GET | Google Postmaster data |
| `/v1/inboxready/snds` | GET | Microsoft SNDS data |

### Inbox Placement Test Request

```json
{
  "subject": "Test email subject",
  "html": "<html>Email content</html>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Email subject line |
| `html` | string | Yes* | Raw HTML email content |
| `url` | string | Yes* | URL to fetch HTML from |

*One of `html` or `url` is required.

### Test Status Response

```json
{
  "test_id": "abc123",
  "subject": "Test email subject",
  "submission": 1704067200,
  "completed": [{"client": "gmail", ...}],
  "processing": [{"client": "yahoo", ...}],
  "bounced": []
}
```

## Links

- Documentation: https://documentation.mailgun.com/docs/inboxready
- API Overview: https://documentation.mailgun.com/docs/inboxready/onboarding-ir
- OpenAPI Spec: https://documentation.mailgun.com/docs/inboxready/api-reference/openapi-final.yaml
- Product Page: https://www.mailgun.com/products/optimize/
- Help Center: https://help.mailgun.com/hc/en-us/categories/4418985551131-Mailgun-Optimize
- Blocklist Monitoring Setup: https://help.mailgun.com/hc/en-us/articles/4444485202075
- Spam Traps Guide: https://help.mailgun.com/hc/en-us/articles/4413151071515
- Mailgun Dashboard: https://app.mailgun.com
- LLMs.txt (full docs index): https://developers.sinch.com/llms.txt
