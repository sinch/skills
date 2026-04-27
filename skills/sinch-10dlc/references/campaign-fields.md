# Campaign Registration Fields

Full field reference for `POST /v1/projects/{projectId}/campaignRegistrations:submit`.

## Example Request

```bash
curl -X POST \
  "https://us10dlc.numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/campaignRegistrations:submit" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "BEXAMPLE",
    "useCase": "MARKETING",
    "campaignName": "Acme Order Notifications",
    "description": "Acme Corp sends order delivery notifications to customers who opted in during checkout at acme.com. Messages include tracking links and estimated delivery times.",
    "messageFlow": "Customers opt in by checking a consent checkbox during checkout at acme.com/checkout. The checkbox reads: I agree to receive order updates via SMS from Acme Corp.",
    "sample1": "Acme Corp: Your order #1234 has shipped! Track at https://acme.com/track/1234. Reply STOP to stop.",
    "sample2": "Acme Corp: Your package is out for delivery today. Reply STOP to stop.",
    "sample3": "Acme Corp: Your order has been delivered. Rate your experience at https://acme.com/feedback. Reply STOP to stop.",
    "optInMessage": "Acme Corp: You are now subscribed to order updates. ~2 msgs/order. Msg & data rates may apply. Reply HELP for help, STOP to stop.",
    "helpMessage": "Acme Corp: For help, email support@acme.com or call 1-800-555-0100. Reply STOP to stop.",
    "stopMessage": "Acme Corp: You have been unsubscribed and will no longer receive messages from Acme Corp.",
    "optinKeywords": "START,YES",
    "optoutKeywords": "STOP,QUIT,CANCEL",
    "helpKeywords": "HELP,INFO",
    "embeddedLink": true,
    "embeddedPhone": false,
    "numberPool": false,
    "ageGated": false,
    "directLending": false,
    "affiliateMarketing": false,
    "subscriberOptIn": true,
    "subscriberOptOut": true,
    "subscriberHelp": true,
    "autoRenewal": true
  }'
```

## Required String Fields

### Identity

- `brandId` — TCR brand ID from Step 2 (e.g., `BEXAMPLE`). Not user input — comes from the brand registration response.
- `useCase` — One of the use case enums from Key Concepts in [SKILL.md](../SKILL.md) (e.g., `MARKETING`, `2FA`, `CUSTOMER_CARE`).
- `campaignName` — Internal name for tracking in the Sinch dashboard. Not sent to TCR. (maxLength: 128). Listed as required by the API despite the docs calling it "optional".

### Descriptions

These three fields are the most common rejection points. Be specific and detailed.

- `description` — Explains the campaign's purpose to TCR reviewers: who is sending, who receives, what content, and why. (minLength: 40, maxLength: 4096)
- `messageFlow` — Describes **how users opt in** to receive messages: the specific mechanism and where it happens (e.g., "Users check a consent box during checkout at acme.com/checkout"). This is about the enrollment process, not the message content. (minLength: 40, maxLength: 2048)
- `optInMessage` — The **actual SMS text** sent to confirm opt-in. Must include brand name, message frequency, "Msg & data rates may apply", and HELP/STOP instructions. (minLength: 20, maxLength: 255)

### Sample Messages (`sample1`–`sample4`)

Separate string fields (not an array). Must be realistic and match the stated use case.

- `sample1`: **required**, minLength: 20, maxLength: 1024. Must include brand name and "Reply STOP to stop".
- `sample2`, `sample3`: **required**, maxLength: 1024 (no minLength). Must include brand name and "Reply STOP to stop".
- `sample4`: **optional**, maxLength: 1024. Use for `MIXED` campaigns to cover additional sub-use-cases.

**"Realistic" means:** samples must look like actual messages a subscriber would receive — not templates or pseudocode. Use concrete values, not placeholders like `{order_id}` or `{{name}}`. TCR reviewers check that samples match the declared use case and contain the brand name and opt-out language.

> **Bad:** `"{BrandName}: Your order {order_id} shipped. {tracking_url}. Reply STOP to stop."`
> **Good:** `"Acme Corp: Your order #1234 has shipped! Track at https://acme.com/track/1234. Reply STOP to stop."`

### Keyword and Response Messages

- `helpMessage` — brand name and additional contact info, e.g., email/phone (minLength: 20, maxLength: 255)
- `stopMessage` — must confirm unsubscription and include the brand name (minLength: 20, maxLength: 255)
- `optinKeywords` — opt-in keywords, comma-separated, no spaces (e.g., `"START,YES"`, maxLength: 255)
- `optoutKeywords` — opt-out keywords, comma-separated, no spaces (e.g., `"STOP,QUIT,CANCEL"`, maxLength: 255). API defaults: `STOP, QUIT, END, CANCEL, UNSUBSCRIBE` — only specify if adding custom keywords
- `helpKeywords` — help keywords, comma-separated, no spaces (e.g., `"HELP,INFO"`, maxLength: 255). API default: `HELP` — only specify if adding custom keywords

## Required Boolean Flags

All required. Defaults shown where applicable.

| Field | Default | When to override |
|---|---|---|
| `autoRenewal` | `true` | Set `false` for short-lived campaigns (e.g., one-time event). Campaign expires after 3 months if not renewed. |
| `subscriberOptIn` | `true` | Set `false` only for machine-to-machine (M2M) use cases with no human subscribers. Almost always `true`. |
| `subscriberOptOut` | `true` | Set `false` only for M2M. Must be `true` whenever human subscribers receive messages. |
| `subscriberHelp` | `true` | Set `false` only for M2M. Must be `true` whenever human subscribers receive messages. |
| `embeddedLink` | `false` | Set `true` if any sample message contains a URL. Public URL shorteners (bit.ly, tinyurl) are not allowed. |
| `embeddedPhone` | `false` | Set `true` if any sample message contains a phone number. |
| `numberPool` | `false` | Set `true` only if the campaign sends from more than 50 phone numbers. |
| `ageGated` | `false` | Set `true` if content relates to alcohol, tobacco, cannabis, or other age-restricted goods/services. |
| `directLending` | `false` | Set `true` only if the sender is a financial institution doing first-party lending. |
| `affiliateMarketing` | **none** | **Must be explicitly set.** Set `true` if messages promote third-party products/services. Set `false` if the brand only promotes its own. |

## Optional Fields

- `subUseCases` — required only for `MIXED` use case; select 2-5 from: `2FA`, `ACCOUNT_NOTIFICATION`, `CUSTOMER_CARE`, `DELIVERY_NOTIFICATION`, `FRAUD_ALERT`, `HIGHER_EDUCATION`, `MARKETING`, `POLLING_VOTING`, `PUBLIC_SERVICE_ANNOUNCEMENT`, `SECURITY_ALERT`
- `terms_and_conditions_link` — URL to terms and conditions page (maxLength: 255)
- `privacy_policy_link` — URL to privacy policy page (maxLength: 255)
- `attachments` — set to `true` to delay submission until documents are uploaded (default: `false`)
- `vertical` — **deprecated**, no longer captured by the API; do not use
