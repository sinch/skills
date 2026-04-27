# 10DLC Registration Workflow — Detailed Steps

Complete reference for the 6-step 10DLC registration workflow. See the main [SKILL.md](../SKILL.md) for overview and summary.

## Step 1: Register the Brand

Gather from the user: company name, brand name, organization type (`brandEntityType`), EIN (`taxIdCorporate`), tax ID country, address (street, city, state, postal code, country), website (`webAddress`), company email, business contact email, contact person (first name, last name, phone, email), vertical, display name, and whether this is a public company (stock exchange/symbol).

The request body uses **nested objects**: `companyDetails`, `financialDetails`, and `contactDetails`. See the curl example in [SKILL.md Getting Started](../SKILL.md#getting-started) for the full structure.

**Required enums (inside `financialDetails`):**
- `brandEntityType` (default: `PUBLIC`): `PUBLIC` (publicly traded), `PRIVATE` (privately held), `CHARITY_NON_PROFIT` (registered nonprofit/charity)
- `brandVerticalType` — pick the one that best matches the company's primary industry:
  - Tech/Comms: `TECHNOLOGY`, `COMMUNICATION`
  - Finance/Insurance: `FINANCIAL`, `INSURANCE`
  - Healthcare: `HEALTHCARE`
  - Retail/Hospitality: `RETAIL`, `HOSPITALITY`
  - Professional services (legal, accounting, consulting): `PROFESSIONAL`
  - Property: `REAL_ESTATE`, `CONSTRUCTION`
  - Public sector: `GOVERNMENT`, `POLITICAL`, `NGO`
  - Education: `EDUCATION`
  - Energy/Agriculture/Manufacturing: `ENERGY`, `AGRICULTURE`, `MANUFACTURING`
  - Transport/Postal: `TRANSPORTATION`, `POSTAL`
  - HR/Staffing: `HUMAN_RESOURCES`
  - Media/Entertainment/Gambling: `ENTERTAINMENT`, `GAMBLING`
  - Legal: `LEGAL`

  When unclear, ask the user. The vertical does not affect approval but must be accurate.
- `exchange`: A free-form string field (not an enum). Use an empty string `""` for private/nonprofit companies. For public companies, pass the exchange name (e.g., `"NYSE"`, `"NASDAQ"`, `"AMEX"`, `"TSX"`, `"LSE"`).

See [Register a Brand](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_createbrandregistrationrequest.md) for request/response details.

**Success:** Response includes `brandRegistrationId`. Save it for all subsequent steps.

## Step 2: Wait for Brand Approval

Registration is **asynchronous** — it takes minutes to days. There are **no webhooks**; you must poll.

```bash
curl -X GET \
  "https://us10dlc.numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/brandRegistrations/$BRAND_REGISTRATION_ID" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN"
```

Example response:
```json
{
  "brandRegistrationId": "01JGR7TNKQ7Y3GHMAXAMPLEID",
  "brandId": "BEXAMPLE",
  "brandRegistrationStatus": "APPROVED",
  "brandRegistrationType": "FULL",
  "identityStatus": "VERIFIED",
  "displayName": "Acme Corp 10DLC",
  "companyDetails": {
    "companyName": "Acme Corp",
    "brandName": "Acme",
    "country": "US",
    "webAddress": "https://acme.com"
  },
  "financialDetails": {
    "brandEntityType": "PRIVATE",
    "brandVerticalType": "TECHNOLOGY",
    "taxIdCorporate": "12-3456789"
  },
  "contactDetails": {
    "firstName": "Jane",
    "lastName": "Doe",
    "phoneNumber": "+14155550100"
  }
}
```

See [Check Brand Registration Status](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_getbrandregistrationrequest.md) for full response details.

**Decision tree:**
- Status `APPROVED` → proceed to Step 3
- Status `IN_PROGRESS` → poll again (see polling strategy below)
- Status `DRAFT` → brand was created via dashboard but not yet submitted; submit it to proceed
- Status `UPGRADE` → brand is being upgraded from SIMPLIFIED to FULL; poll again until it resolves
- Status `REJECTED` → check [brand feedback](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_getbrandregistrationfeedback.md) for rejection reason, then fix and re-register

Common rejection categories: `TAX_ID` (EIN mismatch), `STOCK_SYMBOL` (stock info mismatch), `GOVERNMENT_ENTITY`, `NONPROFIT`.

**Polling strategy:**
- Poll every **60 minutes** — not more often. There are no rate-limit headers, but aggressive polling has no benefit since TCR review is manual.
- `SIMPLIFIED` brands typically resolve in **minutes to a few hours**.
- `FULL` brands typically resolve in **1–5 business days**; some verticals (GOVERNMENT, POLITICAL) may take longer.
- Set a maximum polling window: stop automated polling after **7 days** and prompt the user to check manually or contact Sinch support.
- If the API returns an HTTP error (5xx or timeout), use exponential backoff (wait 5 min, 10 min, 20 min, then resume hourly) rather than retrying immediately.

## Step 3: Qualify the Campaign (Pre-check)

Before creating a campaign, verify requirements and estimated fees:

```bash
curl -X GET \
  "https://us10dlc.numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/campaignRegistrations:qualify?brandId=$BRAND_ID&useCase=MARKETING" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN"
```

`useCase` is **optional** — omit it to get qualification data for all use cases at once (useful when the user hasn't decided yet).

Check the response for `monthlyFee`, `setupFee`, `mnoMetadata` (per-carrier restrictions and throughput), and `minSubUseCases`/`maxSubUseCases` (required sub-use-case count for `MIXED` campaigns). If any carrier shows the campaign as unsupported, reconsider the use case before proceeding.

See [Qualify a Campaign](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_qualifybrandbyusecase.md) for full response details.

## Step 4: Create the Campaign

Gather from the user: use case (`useCase` — one of the enums in Key Concepts), campaign name, description of who sends and receives, sample messages (realistic, matching use case), opt-in flow description (`messageFlow`), HELP/STOP/opt-in messages and keywords, and boolean flags. You also need the `brandId` from Step 2's response.

**CRITICAL — campaigns are rejected for vague descriptions.**

> **Bad:** "We send texts to customers about their orders."
> **Good:** "Acme Corp sends order delivery notifications to customers who opted in during checkout at acme.com. Messages include tracking links and estimated delivery times."

Key points:
- `description` and `messageFlow` each have a 40-character minimum — be specific and detailed
- `sample1`–`sample3` are required (separate string fields, not an array); `sample4` is optional
- `affiliateMarketing` has **no default** — must be explicitly set to `true` or `false`
- All keyword fields (`optinKeywords`, `optoutKeywords`, `helpKeywords`) are comma-separated with no spaces

For the full field reference, constraints, and a complete curl example, see [Campaign Registration Fields](campaign-fields.md). For the raw API schema, see [Create a Campaign (API reference)](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_createtcrcampaign.md).

**Success:** Response includes `campaignRegistrationId` (Sinch ULID format — not the TCR campaign ID, which is assigned after TCR approval).

## Step 5: Upload Supporting Documents (if required)

Set `attachments: true` when creating the campaign (Step 4) to delay submission until documents are uploaded.

- **Endpoint:** `POST /v1/projects/{projectId}/uploadCampaignFiles:submit`
- **Required fields:** `campaignInternalId` (the `campaignRegistrationId` from Step 4), `submitCampaign` (boolean)
- **File object:** `fileName`, `fileContent` (base64-encoded), `fileCategory` (integer enum: 1=PRIVACY_POLICY, 2=TERMS_AND_CONDITIONS, 3=CALL_TO_ACTION, 4=OPT_IN, 5=MMS)
- **Limits:** max 10MB per file, max 5 files per category
- **Workflow:** set `submitCampaign: false` for all but the last file, then `submitCampaign: true` on the final upload to submit the campaign

See [Upload Supporting Documents](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_uploadcampaignfiles.md) for request/response details.

## Step 6: Wait for Campaign Approval

Same async pattern as brand: poll and wait. No webhooks.

See [Check Campaign Status](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_getcampaign.md) for request/response details.

Campaign status flow: `SINCH_REVIEW` → `SINCH_APPROVED` → `SUBMITTED` → `APPROVED` / `ACTIVE` (or `SINCH_REJECTED` / `REJECTED` / `SUBMISSION_FAILED` at various stages).

**Polling strategy:**
- Poll every **60 minutes**.
- Campaigns typically take **1–7 business days** to reach a final status (Sinch internal review + TCR review).
- Stop automated polling after **14 days** and advise the user to contact Sinch support.
- On API errors, apply exponential backoff as described in Step 2.

**Once approved**, you can send A2P SMS on US 10-digit long codes through Sinch. To send messages, see the [sinch-conversation-api](../sinch-conversation-api/SKILL.md) skill.
