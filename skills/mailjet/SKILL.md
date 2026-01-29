---
name: sinch-mailjet
description: Build with Mailjet Email API for transactional and marketing email. Use when working with Mailjet Send API v3.1, templates, contacts, campaigns, or SMTP relay.
---

# Mailjet Email API

Mailjet (by Sinch) is an email delivery platform providing both REST API and SMTP relay for transactional and marketing email. The Send API v3.1 is the current recommended version.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

All API requests use HTTP Basic Auth:
- **Username:** Your API Key (public key)
- **Password:** Your API Secret Key (private key)

Find both keys at: https://app.mailjet.com/account/api_keys

Both keys are generated automatically when your account is created.

```bash
curl -s --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3.1/send \
  -H 'Content-Type: application/json' \
  -d '...'
```

### Base URL

```
https://api.mailjet.com/
```

The API is versioned by endpoint:
- Send API: `/v3.1/send`
- Management resources: `/v3/` (contacts, lists, templates, statistics, etc.)

### First API Call: Send an Email (v3.1)

```bash
curl -s -X POST \
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3.1/send \
  -H 'Content-Type: application/json' \
  -d '{
    "Messages": [
      {
        "From": {
          "Email": "sender@yourdomain.com",
          "Name": "Your Name"
        },
        "To": [
          {
            "Email": "recipient@example.com",
            "Name": "Recipient Name"
          }
        ],
        "Subject": "Hello from Mailjet!",
        "TextPart": "Welcome to Mailjet!",
        "HTMLPart": "<h3>Welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3>"
      }
    ]
  }'
```

Successful response:
```json
{
  "Messages": [
    {
      "Status": "success",
      "To": [
        {
          "Email": "recipient@example.com",
          "MessageUUID": "123",
          "MessageID": 456,
          "MessageHref": "https://api.mailjet.com/v3/message/456"
        }
      ]
    }
  ]
}
```

### SDKs

**Node.js** (`node-mailjet`):

```bash
npm install node-mailjet
```

```javascript
const Mailjet = require('node-mailjet');

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const request = mailjet
  .post('send', { version: 'v3.1' })
  .request({
    Messages: [
      {
        From: { Email: 'sender@yourdomain.com', Name: 'Sender' },
        To: [{ Email: 'recipient@example.com', Name: 'Recipient' }],
        Subject: 'Hello from Mailjet',
        TextPart: 'Welcome!',
        HTMLPart: '<h3>Welcome to Mailjet!</h3>'
      }
    ]
  });

request
  .then(result => console.log(result.body))
  .catch(err => console.error(err.statusCode, err.message));
```

Other official SDKs: PHP, Python, Ruby, Java, Go, C#.

## Key Concepts

### Send API v3.1 vs v3

- **v3.1** (recommended): JSON payload with `Messages` array. Better error reporting, supports bulk sending in one call, returns per-message status.
- **v3** (legacy): Simpler flat JSON payload. Single message per call. Still supported but lacks v3.1 features.

### Message Properties (v3.1)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `From` | Object | Yes* | `{ "Email": "...", "Name": "..." }` |
| `To` | Array | Yes | `[{ "Email": "...", "Name": "..." }]` |
| `Cc` | Array | No | Carbon copy recipients (same format as To) |
| `Bcc` | Array | No | Blind carbon copy recipients |
| `Subject` | String | No | Email subject line |
| `TextPart` | String | Yes* | Plain text body |
| `HTMLPart` | String | Yes* | HTML body |
| `TemplateID` | Integer | Yes* | Stored template ID (alternative to TextPart/HTMLPart) |
| `TemplateLanguage` | Boolean | No | Enable Mailjet template language |
| `Variables` | Object | No | Variables for template personalization |
| `Attachments` | Array | No | Base64-encoded file attachments |
| `InlinedAttachments` | Array | No | Inline images (reference via `cid:`) |
| `CustomID` | String | No | Custom identifier for tracking |
| `EventPayload` | String | No | Payload passed to webhook events |

*At minimum: `From` + (`TextPart` and/or `HTMLPart`) OR `TemplateID`.

### Templates

Create templates via API or dashboard. Use `TemplateID` when sending:

```bash
curl -s -X POST \
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3.1/send \
  -H 'Content-Type: application/json' \
  -d '{
    "Messages": [
      {
        "From": { "Email": "sender@yourdomain.com" },
        "To": [{ "Email": "recipient@example.com" }],
        "TemplateID": 12345,
        "TemplateLanguage": true,
        "Subject": "Welcome!",
        "Variables": {
          "name": "John",
          "order_id": "ORD-123"
        }
      }
    ]
  }'
```

### Contacts and Contact Lists

- **Contacts** -- `/v3/contact` -- automatically created when you send to a new address
- **Contact Lists** -- `/v3/contactslist` -- group contacts for campaigns
- **Manage subscriptions** -- `/v3/contactslist/{list_id}/managecontact`

### Campaigns

Send marketing campaigns using either:
- **Drafts** -- create via `/v3/campaigndraft`, then send
- **Send API** -- set `CustomCampaign` property on messages

### Webhooks (Event API)

Receive real-time notifications at your URL for events:
- `sent`, `open`, `click`, `bounce`, `spam`, `blocked`, `unsub`

Configure via dashboard or API at `/v3/eventcallbackurl`.

### Statistics

Query sending statistics via `/v3/statcounters`:
- Message counts, open/click rates, bounces, spam reports
- Filter by time period, campaign, contact list

### SMTP Relay

Use Mailjet as an SMTP relay server:
- **Server:** `in-v3.mailjet.com`
- **Port:** 587 (STARTTLS) or 465 (SSL/TLS)
- **Username:** Your API Key
- **Password:** Your Secret Key

## Common Patterns

### Send Bulk Messages

Package multiple messages in the `Messages` array:

```bash
curl -s -X POST \
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3.1/send \
  -H 'Content-Type: application/json' \
  -d '{
    "Messages": [
      {
        "From": { "Email": "sender@yourdomain.com" },
        "To": [{ "Email": "alice@example.com" }],
        "Subject": "Hello Alice",
        "TextPart": "Hi Alice!"
      },
      {
        "From": { "Email": "sender@yourdomain.com" },
        "To": [{ "Email": "bob@example.com" }],
        "Subject": "Hello Bob",
        "TextPart": "Hi Bob!"
      }
    ]
  }'
```

Each message gets its own status in the response.

### Send with Attachments

```bash
curl -s -X POST \
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3.1/send \
  -H 'Content-Type: application/json' \
  -d '{
    "Messages": [
      {
        "From": { "Email": "sender@yourdomain.com" },
        "To": [{ "Email": "recipient@example.com" }],
        "Subject": "With attachment",
        "TextPart": "See attached file.",
        "Attachments": [
          {
            "ContentType": "text/plain",
            "Filename": "readme.txt",
            "Base64Content": "SGVsbG8gV29ybGQh"
          }
        ]
      }
    ]
  }'
```

Attachment size limit: **15 MB**.

### Sandbox Mode

Test API calls without actually sending emails:

```json
{
  "Messages": [{ ... }],
  "SandboxMode": true
}
```

### Manage a Contact List

```bash
# Create a contact list
curl -s -X POST \
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3/contactslist \
  -H 'Content-Type: application/json' \
  -d '{ "Name": "My Newsletter" }'

# Add a contact to the list
curl -s -X POST \
  --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
  https://api.mailjet.com/v3/contactslist/{list_id}/managecontact \
  -H 'Content-Type: application/json' \
  -d '{
    "Email": "subscriber@example.com",
    "Name": "Subscriber",
    "Action": "addnoforce"
  }'
```

## Gotchas and Best Practices

1. **Sender verification** -- You must verify your sender email address or domain before sending. Unverified senders will be rejected.
2. **v3 vs v3.1 differences** -- v3.1 uses `Messages` array wrapper and structured `From`/`To` objects. v3 uses flat properties (`FromEmail`, `FromName`, `Recipients`). Do not mix formats.
3. **PUT acts like PATCH** -- All Mailjet `PUT` requests behave like `PATCH`: only specified properties are updated, others are unchanged.
4. **Recipients visibility** -- In v3.1, all `To` recipients see each other. For private sends, create separate message objects in the `Messages` array.
5. **Rate limits** -- Vary by plan. Free tier: 200 emails/day, 6,000/month. Check response headers for limit info.
6. **Pagination** -- List endpoints default to 10 results. Use `Limit` (max 1000) and `Offset` query parameters. Use `Sort` for ordering.
7. **Auto-created contacts** -- Sending to a new email address automatically creates a contact in your Mailjet account.
8. **Content-Type** -- Send API v3.1 requires `Content-Type: application/json`. Do not use form data.
9. **Template language** -- Set `"TemplateLanguage": true` to enable variable substitution (`{{var:name}}`). Without this flag, variables are not processed.
10. **Error handling** -- v3.1 returns per-message status. Always check each `Messages[].Status` for `"success"` or `"error"` with detailed error info.

## Links

- Developer Docs: https://dev.mailjet.com/
- Send API v3.1 Guide: https://dev.mailjet.com/email/guides/send-api-v31/
- API Reference: https://dev.mailjet.com/email/reference/overview/
- Template Language: https://dev.mailjet.com/email/template-language/
- SMTP Relay: https://dev.mailjet.com/smtp-relay/overview/
- Dashboard: https://app.mailjet.com
- Sign Up: https://app.mailjet.com/signup
- Status Page: https://mailjet.statuspage.io
- Node.js SDK: https://www.npmjs.com/package/node-mailjet
- LLMs.txt (full docs index): https://developers.sinch.com/llms.txt
