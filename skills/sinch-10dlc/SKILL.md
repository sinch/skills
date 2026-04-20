---
name: sinch-10dlc
description: Registers US 10DLC brands and campaigns with Sinch for A2P SMS messaging. Use when the user needs to register a brand, create a 10DLC campaign, check registration status, troubleshoot a 10DLC rejection, fix an EIN mismatch, upgrade from simplified to full registration, or qualify a campaign for US SMS sending on 10-digit long codes. Do NOT use for non-US messaging or toll-free/short code registration.
metadata:
  author: Sinch
  version: 1.1.1
  category: Numbers
  tags: 10dlc, sms, a2p, brand-registration, campaign-registration, us-messaging, brand, campaign, tcr, registration, a2p-sms
  uses:
    - sinch-authentication
---

# Sinch 10DLC Registration

## Overview

10DLC (10-Digit Long Code) is the required US registration system for Application-to-Person (A2P) SMS on standard 10-digit phone numbers. You must register a **brand** (the sending company) and a **campaign** (the messaging use case) with The Campaign Registry (TCR) via Sinch before sending any US A2P SMS.

## Agent Instructions

Before writing code, determine the user's goal:

1. **What do you need?** Register a brand, register a campaign, check status, or troubleshoot a rejection?
2. **Do you already have a brand ID?** If yes, skip to Step 3 (qualify) or Step 4 (campaign).
3. **Registration type?** `SIMPLIFIED` (faster, lower throughput, $10) or `FULL` (recommended for production, $50)?

This skill covers **10DLC only**. The same Registration API also includes TFN (Toll-Free Number) verification endpoints — for toll-free registration, see the API spec directly.

This API is REST-only — there is no SDK wrapper. Use curl, `fetch`, `axios`, `requests`, or equivalent HTTP clients.

## Getting Started

**Auth:** See [sinch-authentication](../sinch-authentication/SKILL.md) for setup.

### Base URL

```
https://us10dlc.numbers.api.sinch.com
```

US-only — there are no regional variants for 10DLC.

Store credentials in environment variables — never hardcode tokens or keys in commands or source code:

```bash
export PROJECT_ID="your-project-id"
export ACCESS_TOKEN="your-oauth-token"
```

### First API Call

Register a brand:

```bash
curl -X POST "https://us10dlc.numbers.api.sinch.com/v1/projects/$PROJECT_ID/brandRegistrations:submit" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "brandRegistrationType": "FULL",
  "displayName": "Sinch Mock",
  "companyDetails": {
    "companyName": "Sinch",
    "brandName": "Sinch Mock x",
    "companyEmail": "support@sinch.com",
    "country": "US",
    "state": "GA",
    "city": "Atlanta",
    "streetAddress": " 3500 Lenox Rd NE, Ste. 1875",
    "postalCode": "94105",
    "webAddress": "https://sinch.com"
  },
  "financialDetails": {
    "brandEntityType": "PRIVATE",
    "brandVerticalType": "TECHNOLOGY",
    "taxIdCountry": "US",
    "taxIdCorporate": "770505044",
    "stockSymbol": "SINCH",
    "exchange": "STO"
  },
  "contactDetails": {
    "firstName": "Jane",
    "lastName": "Doe",
    "phoneNumber": "+14155550100",
    "email": "admin@sinch.com"
  },
  "mock": true
}'
```

## Key Concepts

- **Brand** — The company sending messages. Must be registered first. ID starts with `B` (e.g., `BESINCH`).
- **Campaign** — A messaging use case tied to a brand. Defines what, to whom, and why.
- **TCR** — The Campaign Registry. Sinch submits to TCR on your behalf as your CSP.
- **Registration type** (`brandRegistrationType`) — `SIMPLIFIED` (basic, lower throughput, $10) or `FULL` (complete vetting, higher throughput, $50). Default is `SIMPLIFIED`. Prefer `FULL` for production.
- **Trust score** — Assigned by TCR after vetting. Higher score = more messages per second. This is a TCR concept; the Sinch API does not return it in the brand response.
- **Use case** — The campaign's messaging purpose. Use cases are categorized as Standard or Special, with different vetting requirements and fees.
  - Standard Use Cases: 2FA, ACCOUNT_NOTIFICATION, CUSTOMER_CARE, DELIVERY_NOTIFICATION, FRAUD_ALERT, HIGHER_EDUCATION, MARKETING, POLLING_VOTING, PUBLIC_SERVICE_ANNOUNCEMENT, SECURITY_ALERT.
  - Special Use Cases: AGENTS_FRANCHISES, CARRIER_EXEMPT, CHARITY, EMERGENCY, K12_EDUCATION, POLITICAL, PROXY, SOCIAL, SWEEPSTAKE.
  - Mixed/Low Volume: LOW_VOLUME or MIXED can be used for campaigns that combine multiple standard use cases but have low traffic requirements.
- **CSP** — Campaign Service Provider. Sinch typically acts as your CSP, managing the registration process. It's also possible for you to register as your own CSP directly with TCR and use Sinch for number provisioning and connectivity, though this is a more advanced setup.

## Workflow: Complete 10DLC Setup

Follow these steps in order. Each step depends on the previous one succeeding. For detailed curl examples, response schemas, enum values, and polling strategies, see [references/workflow.md](references/workflow.md).

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
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
