---
name: sinch-porting-api
description: "Port phone numbers from other carriers into Sinch with the Porting API. Automates port-in order creation, portability checks, order tracking, on-demand activation, and webhook notifications. Use when porting numbers, checking portability, creating port-in orders, tracking port status, activating ported numbers, uploading LOA documents, or configuring porting defaults."
metadata:
  author: Sinch
  version: 1.0.0
  category: Numbers
  tags: porting, port-in, number-transfer, carrier, portability, loa, foc, activation
  uses:
    - sinch-authentication
---

# Sinch Porting API

## Overview

The Porting API automates port-in operations — transferring phone numbers from another carrier into Sinch. It supports portability checks, order creation and management, document uploads, on-demand activation, and webhook notifications for status updates. Currently supports North American (US/CA) numbers only.

## Instructions

Before generating code, gather from the user:

1. **Approach** — SDK or direct API calls (curl/fetch)?
2. **Use case** — Portability check, create order, track order, activate numbers?
3. **Activation mode** (only for create order) — Automatic (on `desiredPortDate`) or on-demand (`onDemandActivation: true`)?

Note: The `@sinch/sdk-core` Node.js SDK does not currently have dedicated porting methods. Use direct HTTP calls for all porting operations.

## Getting Started

### Authentication

See [sinch-authentication](../sinch-authentication/SKILL.md) for full setup.

### Base URL

| Environment | URL |
|-------------|-----|
| Production  | `https://porting.api.sinch.com/v1/projects/{PROJECT_ID}` |

### First API Call — Check Portability

Always check portability before creating an order:

```bash
curl -X POST "https://porting.api.sinch.com/v1/projects/{PROJECT_ID}/portabilityChecks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{
    "phoneNumbers": ["+15551234567", "+15559876543"]
  }'
```

Response:

```json
{
  "phoneNumbers": [
    {
      "phoneNumber": "+15551234567",
      "portable": true,
      "carrier": "T-Mobile"
    },
    {
      "phoneNumber": "+15559876543",
      "portable": false,
      "carrier": "Verizon",
      "reason": "Number is not portable"
    }
  ]
}
```

### Create a Port-In Order

```bash
curl -X POST "https://porting.api.sinch.com/v1/projects/{PROJECT_ID}/orders/portIns" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{
    "desiredPortSchedule": {
      "desiredPortDate": "2026-05-15",
      "desiredPortTime": "09:00:00",
      "desiredPortTimeZone": "US/Eastern"
    },
    "customerOrderReference": "my-ref-123",
    "phoneNumbers": [
      {
        "phoneNumber": "+15551234567",
        "endUser": {
          "name": "Acme Corp",
          "streetNum": "123",
          "streetName": "Main",
          "streetType": "St",
          "city": "Anytown",
          "state": "CA",
          "zipCode": "90210",
          "typeOfService": "B"
        },
        "portOutInfo": {
          "existingPortOutPin": "1234"
        }
      }
    ]
  }'
```

Response:

```json
{
  "id": 12345,
  "status": "PENDING",
  "customerOrderReference": "my-ref-123",
  "desiredPortSchedule": {
    "desiredPortDate": "2026-05-15",
    "desiredPortTime": "09:00:00",
    "desiredPortTimeZone": "US/Eastern"
  },
  "phoneNumbers": [
    {
      "phoneNumber": "+15551234567",
      "status": "PENDING"
    }
  ]
}
```

### Track an Order

```bash
curl "https://porting.api.sinch.com/v1/projects/{PROJECT_ID}/orders/portIns/12345" \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

Response:

```json
{
  "id": 12345,
  "status": "CONFIRMED",
  "customerOrderReference": "my-ref-123",
  "desiredPortSchedule": {
    "desiredPortDate": "2026-05-15",
    "desiredPortTime": "09:00:00",
    "desiredPortTimeZone": "US/Eastern"
  },
  "phoneNumbers": [
    {
      "phoneNumber": "+15551234567",
      "status": "CONFIRMED",
      "focDate": "2026-05-15"
    }
  ]
}
```

### Activate Numbers (On-Demand)

First check which number groups are ready:

```bash
curl "https://porting.api.sinch.com/v1/projects/{PROJECT_ID}/orders/portIns/12345/availableActivations" \
  -H "Authorization: Bearer {ACCESS_TOKEN}"
```

Response:

```json
{
  "activationGroups": [
    {
      "groupId": "grp-001",
      "phoneNumbers": ["+15551234567"],
      "status": "READY"
    }
  ]
}
```

Then activate:

```bash
curl -X POST "https://porting.api.sinch.com/v1/projects/{PROJECT_ID}/orders/portIns/12345/activate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -d '{
    "groupIds": ["grp-001"]
  }'
```

## Key Concepts

**Port-In Order** — A request to transfer one or more phone numbers from another carrier to Sinch. Each order has a numeric `id` and tracks the overall lifecycle.

**Order Status** — Lifecycle of a port-in order: `PENDING` (can update/cancel) → `CONFIRMED` (locked, awaiting port date) → `COMPLETED` (numbers active). Also: `PENDING_CANCELATION` → `CANCELED`.

**Phone Number Status** — Per-number status within an order: `PENDING` → `CONFIRMED` → `ACTIVATED`. Also: `REJECTED` (see `rejectReason`), `CANCELED`, `EXCLUDED` (see `exclusionReason`).

**FOC (Firm Order Confirmation)** — The confirmed port date set by the losing carrier. Returned as `focDate` on each phone number once confirmed. On-demand activation requires FOC date to be today or earlier.

**End User** — The person or company that currently owns the number. Required fields: `name`, `streetNum`, `streetName`, `city`, `state`, `zipCode`. Must match the losing carrier's records exactly.

**Port-Out Info** — Credentials from the losing carrier. Usually only `existingPortOutPin` is needed. May also include `accountNum`, `accountPhoneNumber`, `authorizingName`, `authorizingDate`.

**LOA (Letter of Authorization)** — A document authorizing the port. Upload via `POST /orders/portIns/{orderId}/documents`.

**On-Demand Activation** — When `onDemandActivation: true`, numbers are not auto-activated on the port date. Instead, call `POST /orders/portIns/{orderId}/activate` after FOC date is reached and numbers are routing on Sinch network.

**Voice Configuration** — Optional per-number config for voice routing. Discriminated on `type`: `RTC` (programmable voice, requires `appId`), `EST` (elastic SIP trunking, requires `trunkId`), `FAX` (requires `serviceId`).

**Messaging Configuration** — Optional per-number config for messaging features. Supports `A2PLC` (Application-to-Person Long Code) and `SMSMMS` feature types. Configured alongside voice options on each phone number in the order.

**E911** — Optional per-number emergency location data. Submitted as part of the phone number entry in a port-in order for numbers that require E911 service.

**Directory Listing** — Optional per-number directory listing information (e.g., name and address for directory assistance). Provided as part of the phone number entry in a port-in order.

**Desired Port Schedule** — Required. Contains `desiredPortDate` (ISO date, required), `desiredPortTime` (defaults to project config or `09:00:00`), `desiredPortTimeZone` (one of: `US/Eastern`, `US/Central`, `US/Mountain`, `US/Pacific`).

**Configuration** — Project-level defaults for porting: default contact info, webhook URL, default port time and timezone. Set via `POST /configuration`, updated via `PUT /configuration`.

## Common Patterns

- **Check portability** — `POST /portabilityChecks` with `phoneNumbers` array. Always do this before creating an order; non-portable numbers cause order failure.

- **Create port-in order** — `POST /orders/portIns` with `desiredPortSchedule`, `phoneNumbers` (each with `endUser` and `portOutInfo`). Returns order `id` and initial `PENDING` status.

- **List and filter orders** — `GET /orders/portIns` with query params: `orderStatus`, `phoneNumber`, `customerOrderReference`, `createdDateStart`/`createdDateEnd`, `focStartDate`/`focEndDate`, `pageSize` (default 100, max 1000), `page`.

- **Get order details** — `GET /orders/portIns/{orderId}` returns full order with phone numbers, notes, and documents.

- **Get phone number groups** — `GET /orders/portIns/phoneGroups/{orderId}` returns phone numbers grouped by their status or activation group within the order. Porting is processed by groups.

- **Update a pending order** — `PUT /orders/portIns/{orderId}` — sends the **full object** (not a patch). Only works on `PENDING` orders.

- **Cancel a pending order** — `DELETE /orders/portIns/{orderId}` — only works on `PENDING` orders.

- **Add note to order** — `POST /orders/portIns/{orderId}/notes` — use to respond to issues flagged by Sinch during processing.

- **Upload document (LOA)** — `POST /orders/portIns/{orderId}/documents` — attach authorization documents.

- **Get document details** — `GET /orders/portIns/{orderId}/documents/{documentId}` — retrieve metadata or content for a previously uploaded document.

- **On-demand activation** — First `GET /orders/portIns/{orderId}/availableActivations` to see which number groups are ready, then `POST /orders/portIns/{orderId}/activate` to activate them. FOC date must be today or earlier and numbers must be routing on Sinch network.

- **Configure defaults** — `POST /configuration` to create, `PUT /configuration` to update, `GET /configuration` to read. Sets default contact, webhook URL, port time, and timezone.

## Gotchas and Best Practices

- **Always check portability first** — `POST /portabilityChecks` before creating an order. Orders with non-portable numbers will fail.
- **Phone numbers must be E.164 format** — All phone numbers in requests must be in E.164 format (e.g., `+15551234567`). Numbers not in this format will be rejected.
- **`customerOrderReference` max 100 characters** — Longer values will be rejected at validation.
- **North America only** — The Porting API currently supports US and CA numbers only (`countryCode` is `US` or `CA`).
- **Max 500 numbers per order** — For orders with more than 500 numbers, contact [Sinch support](https://support.sinch.com).
- **Update is a full PUT, not PATCH** — `PUT /orders/portIns/{orderId}` requires the complete order object. Omitting fields will clear them.
- **Only PENDING orders can be updated or canceled** — Once `CONFIRMED`, orders cannot be modified. Cancel creates `PENDING_CANCELATION` state during which the same numbers cannot be resubmitted.
- **End user info must match the losing carrier's records** — Mismatched name, address, or account details cause rejections. `typeOfService` defaults to `B` (Business); set to `R` for residential.
- **Port-out PIN is usually sufficient** — Most carriers only require `existingPortOutPin` in `portOutInfo`. Only provide `accountNum`, `accountPhoneNumber`, `authorizingName` if the carrier requires them.
- **`authorizingDate` cannot be in the future** — Must be today or earlier.
- **Default port time is 09:00 US/Eastern** — If you don't set `desiredPortTime` and `desiredPortTimeZone` on the order and haven't configured project defaults, the system uses `09:00:00 US/Eastern`.
- **Time zones are US-only enum values** — Only `US/Eastern`, `US/Central`, `US/Mountain`, `US/Pacific` are accepted. No generic timezone strings.
- **10DLC campaign required after port completes** — For US 10DLC numbers, you must associate the number with an approved 10DLC campaign before sending SMS/MMS. This can only be done after the port completes.
- **Webhooks for real-time updates** — Configure a webhook URL via `POST /configuration` or the dashboard. Use webhooks instead of polling `GET /orders/portIns/{orderId}` for status updates.
- **`voiceConfiguration` is a discriminated union** — Must include `type` field: `RTC` (with `appId`), `EST` (with `trunkId`), or `FAX` (with `serviceId`).
- **No SDK support** — The `@sinch/sdk-core` Node.js SDK does not have dedicated porting methods. Use direct REST calls.
- **`resellerName` required for Canadian numbers** — An additional field needed when porting CA numbers.

## Links

- [Porting Documentation](https://developers.sinch.com/docs/numbers/api-reference/porting.md)
- [Port-In Numbers API Reference](https://developers.sinch.com/docs/numbers/api-reference/porting/port-in-numbers.md)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/numbers/api-reference/porting.yaml?download)
- [Advanced Porting (Activation)](https://developers.sinch.com/docs/numbers/api-reference/porting/advanced-porting.md)
- [Porting Webhooks](https://developers.sinch.com/docs/numbers/api-reference/porting/webhooks/webhooks-for-porting.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
