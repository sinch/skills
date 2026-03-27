---
name: sinch-10dlc
description: Registers US 10DLC brands and campaigns with Sinch for A2P SMS messaging. Use when the user needs to set up, check status of, or troubleshoot 10DLC registration for US SMS sending on 10-digit long codes. Do NOT use for non-US messaging or toll-free/short code registration.
metadata:
  author: Sinch
  version: 1.0.0
---

# Sinch 10DLC Registration

## Overview

10DLC (10-Digit Long Code) is the required US registration system for Application-to-Person (A2P) SMS on standard 10-digit phone numbers. You must register a **brand** (the sending company) and a **campaign** (the messaging use case) with The Campaign Registry (TCR) via Sinch before sending any US A2P SMS.

## Agent Instructions

Before writing code, determine the user's goal:

1. **What do you need?** Register a brand, register a campaign, check status, or troubleshoot a rejection?
2. **Do you already have a brand ID?** If yes, skip to Step 3 (qualify) or Step 4 (campaign).
3. **Registration type?** `SIMPLIFIED` (faster, lower throughput, $10) or `FULL` (recommended for production, $50)?

This API is REST-only — there is no SDK wrapper. Use curl, `fetch`, `axios`, `requests`, or equivalent HTTP clients.

## Getting Started

**Auth:** HTTP Basic (`keyId:keySecret`) or OAuth2 bearer token. All examples use Basic auth. See [sinch-authentication](../sinch-authentication/SKILL.md) for setup.

**First API call — register a brand:**

```bash
curl -X POST https://us10dlc.numbers.api.sinch.com/v1/projects/{PROJECT_ID}/brandRegistrations:submit \
  -u {KEY_ID}:{KEY_SECRET} \
  -H "Content-Type: application/json" \
  -d '{
    "brandRegistrationType": "FULL",
    "displayName": "Acme Corp 10DLC",
    "companyDetails": {
      "companyName": "Acme Corp",
      "brandName": "Acme",
      "companyEmail": "support@acme.com",
      "businessContactEmail": "admin@acme.com",
      "country": "US",
      "state": "CA",
      "city": "San Francisco",
      "streetAddress": "123 Main St",
      "postalCode": "94105",
      "webAddress": "https://acme.com"
    },
    "financialDetails": {
      "brandEntityType": "PRIVATE",
      "brandVerticalType": "TECHNOLOGY",
      "taxIdCountry": "US",
      "taxIdCorporate": "12-3456789",
      "stockSymbol": "",
      "exchange": ""
    },
    "contactDetails": {
      "firstName": "Jane",
      "lastName": "Doe",
      "phoneNumber": "+14155550100",
      "email": "admin@acme.com"
    }
  }'
```

## Key Concepts

**Brand** — The company sending messages. Must be registered first. ID starts with `B` (e.g., `BESINCH`).
**Campaign** — A messaging use case tied to a brand. Defines what, to whom, and why.
**TCR** — The Campaign Registry. Sinch submits to TCR on your behalf as your CSP.
**Registration type** (`brandRegistrationType`) — `SIMPLIFIED` (basic, lower throughput, $10) or `FULL` (complete vetting, higher throughput, $50). Default is `SIMPLIFIED`. Prefer `FULL` for production.
**Trust score** — Assigned by TCR after vetting. Higher score = more messages per second. This is a TCR concept; the Sinch API does not return it in the brand response.
**Use case** — The campaign's messaging purpose. Use cases are categorized as Standard or Special, with different vetting requirements and fees.

Standard Use Cases: 2FA, ACCOUNT_NOTIFICATION, CUSTOMER_CARE, DELIVERY_NOTIFICATION, FRAUD_ALERT, HIGHER_EDUCATION, MARKETING, POLLING_VOTING, PUBLIC_SERVICE_ANNOUNCEMENT, SECURITY_ALERT.

Special Use Cases: AGENTS_FRANCHISES, CARRIER_EXEMPT, CHARITY, EMERGENCY, K12_EDUCATION, POLITICAL, PROXY, SOCIAL, SWEEPSTAKE.

Mixed/Low Volume: LOW_VOLUME or MIXED can be used for campaigns that combine multiple standard use cases but have low traffic requirements.
**CSP** — Campaign Service Provider. Sinch typically acts as your CSP, managing the registration process. It's also possible for you to register as your own CSP directly with TCR and use Sinch for number provisioning and connectivity, though this is a more advanced setup.

## Workflow: Complete 10DLC Setup

Follow these steps in order. Each step depends on the previous one succeeding.

### Step 1: Register the Brand

Gather from the user: company name, brand name, organization type (`brandEntityType`), EIN (`taxIdCorporate`), tax ID country, address (street, city, state, postal code, country), website (`webAddress`), company email, business contact email, contact person (first name, last name, phone, email), vertical, display name, and whether this is a public company (stock exchange/symbol).

The request body uses **nested objects**: `companyDetails`, `financialDetails`, and `contactDetails`. See the curl example in Getting Started for the full structure.

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

### Step 2: Wait for Brand Approval

Registration is **asynchronous** — it takes minutes to days. There are **no webhooks**; you must poll.

```bash
curl https://us10dlc.numbers.api.sinch.com/v1/projects/{PROJECT_ID}/brandRegistrations/{BRAND_REGISTRATION_ID} \
  -u {KEY_ID}:{KEY_SECRET}
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

### Step 3: Qualify the Campaign (Pre-check)

Before creating a campaign, verify requirements and estimated fees:

```bash
curl "https://us10dlc.numbers.api.sinch.com/v1/projects/{PROJECT_ID}/campaignRegistrations:qualify?brandId={BRAND_ID}&useCase=MARKETING" \
  -u {KEY_ID}:{KEY_SECRET}
```

`useCase` is **optional** — omit it to get qualification data for all use cases at once (useful when the user hasn't decided yet).

Check the response for `monthlyFee`, `setupFee`, `mnoMetadata` (per-carrier restrictions and throughput), and `minSubUseCases`/`maxSubUseCases` (required sub-use-case count for `MIXED` campaigns). If any carrier shows the campaign as unsupported, reconsider the use case before proceeding.

See [Qualify a Campaign](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_qualifybrandbyusecase.md) for full response details.

### Step 4: Create the Campaign

Gather from the user: use case (`useCase` — one of the enums in Key Concepts), campaign name, description of who sends and receives, sample messages (realistic, matching use case), opt-in flow description (`messageFlow`), HELP/STOP/opt-in messages and keywords, and boolean flags. You also need the `brandId` from Step 2's response.

**CRITICAL — campaigns are rejected for vague descriptions.**

> **Bad:** "We send texts to customers about their orders."
> **Good:** "Acme Corp sends order delivery notifications to customers who opted in during checkout at acme.com. Messages include tracking links and estimated delivery times."

Key points:
- `description` and `messageFlow` each have a 40-character minimum — be specific and detailed
- `sample1`–`sample3` are required (separate string fields, not an array); `sample4` is optional
- `affiliateMarketing` has **no default** — must be explicitly set to `true` or `false`
- All keyword fields (`optinKeywords`, `optoutKeywords`, `helpKeywords`) are comma-separated with no spaces

For the full field reference, constraints, and a complete curl example, see [Campaign Registration Fields](references/campaign-fields.md). For the raw API schema, see [Create a Campaign (API reference)](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_createtcrcampaign.md).

**Success:** Response includes `campaignRegistrationId` (Sinch ULID format — not the TCR campaign ID, which is assigned after TCR approval).

### Step 5: Upload Supporting Documents (if required)

Set `attachments: true` when creating the campaign (Step 4) to delay submission until documents are uploaded.

- **Endpoint:** `POST /v1/projects/{projectId}/uploadCampaignFiles:submit`
- **Required fields:** `campaignInternalId` (the `campaignRegistrationId` from Step 4), `submitCampaign` (boolean)
- **File object:** `fileName`, `fileContent` (base64-encoded), `fileCategory` (integer enum: 1=PRIVACY_POLICY, 2=TERMS_AND_CONDITIONS, 3=CALL_TO_ACTION, 4=OPT_IN, 5=MMS)
- **Limits:** max 10MB per file, max 5 files per category
- **Workflow:** set `submitCampaign: false` for all but the last file, then `submitCampaign: true` on the final upload to submit the campaign

See [Upload Supporting Documents](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_uploadcampaignfiles.md) for request/response details.

### Step 6: Wait for Campaign Approval

Same async pattern as brand: poll and wait. No webhooks.

See [Check Campaign Status](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_getcampaign.md) for request/response details.

Campaign status flow: `SINCH_REVIEW` → `SINCH_APPROVED` → `SUBMITTED` → `APPROVED` / `ACTIVE` (or `SINCH_REJECTED` / `REJECTED` / `SUBMISSION_FAILED` at various stages).

**Polling strategy:**
- Poll every **60 minutes**.
- Campaigns typically take **1–7 business days** to reach a final status (Sinch internal review + TCR review).
- Stop automated polling after **14 days** and advise the user to contact Sinch support.
- On API errors, apply exponential backoff as described in Step 2.

**Once approved**, you can send A2P SMS on US 10-digit long codes through Sinch. To send messages, see the [sinch-conversation-api](../sinch-conversation-api/SKILL.md) skill.

## Common Patterns

- **List all brands/campaigns** — See [List All Brands](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_listbrandregistrationrequest.md) and [List All Campaigns](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationservice_listcampaignregistrationrequest.md)
- **Upgrade brand from Simplified to Full** — See [Upgrade Brand](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_upgrade10dlcbrandtofullregistration.md)
- **Update brand details** — See [Update Brand Registration](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_update10dlcbrand.md)
- **Look up brand by TCR ID** — See [Get Brand by TCR Brand ID](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_fetchbrandregistrationrequest.md)
- **Look up campaign by TCR ID** — See [Get Campaign by TCR Campaign ID](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_getcampaignbytcrcampaignid.md)
- **Delete a campaign** — See [Delete Campaign](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationexternalservice_deletecampaign.md) (irreversible, status becomes `EXPIRED`). **Note:** the delete path uses singular `campaignRegistration` (not plural) — `DELETE /v1/projects/{projectId}/campaignRegistration/{campaignRegistrationId}`
- **Resubmit a campaign** — See [Resubmit Campaign](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationservice_resubmitcampaignregistration.md). After resubmitting, poll `lastActionStatus`: `RESUBMIT_IN_PROGRESS` → `RESUBMIT_SUCCESSFUL` (get updated MNO metadata) or `RESUBMIT_FAILED` (check campaign feedback for reason)
- **Get brand vetting info** — See [Brand Vetting Information](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_getbrandregistrationvettinginfo.md)
- **Resend 2FA email** — See [Resend 2FA Email](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration/brandregistrationservice_resend2faemail.md)

## Gotchas and Best Practices

### Brand rejected

1. Fetch brand feedback (see Step 2 above)
2. Common fixes: correct EIN format (`XX-XXXXXXX`), match company name to IRS records exactly, fix stock symbol if public
3. Re-register with corrected data

### Campaign rejected

1. Fetch campaign feedback via [Campaign Registration Feedback](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration/campaignregistrationservice_getcampaignregistrationfeedback.md) — includes TCR errors and internal errors
2. Fix the issue — the most common causes and their fixes are described in Step 4's CRITICAL block
3. Create a new campaign with corrected data (campaigns cannot be edited after submission)

### Messages blocked after registration

- Verify campaign status is `APPROVED` (not just brand)
- Check throughput limits — brand trust score (assigned by TCR, not returned by Sinch API) affects messages per second
- Ensure the sending number is associated with the approved campaign

### General

- Always use `FULL` registration type for production — it yields higher trust scores and throughput than `SIMPLIFIED`.
- Use `campaignRegistrations:qualify` before submitting a campaign to check requirements and fees upfront.
- Poll registration status hourly — there are no webhooks for state transitions.
- Match company name and `taxIdCorporate` (EIN) to IRS records exactly to avoid brand rejection.
- If a campaign is rejected, the safest and most common approach is to create a new one with corrected data.
- Brands and campaigns can also be registered via the [Sinch Build Dashboard](https://dashboard.sinch.com) UI.
- This API is REST-only (no SDK). Use direct HTTP calls.

## Links

- [Authentication setup](../sinch-authentication/SKILL.md)
- [10DLC Registration API Reference](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration.md)
- [Brand Registration API](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-brand-registration.md)
- [Campaign Registration API](https://developers.sinch.com/docs/10dlc-registration/api-reference/10dlc-registration/10dlc-campaign-registration.md)
- [10DLC Registration Options (Community)](https://community.sinch.com/t5/10DLC/10DLC-Registration-Options-Overview/ta-p/12422)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/10dlc-registration/api-reference/10dlc-registration.yaml?download)

> **Note:** The same Registration API also includes TFN (Toll-Free Number) verification endpoints. This skill covers 10DLC only. For toll-free registration, see the API spec directly.
