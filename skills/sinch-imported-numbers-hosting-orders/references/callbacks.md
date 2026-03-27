# Callback Payload Reference

## Payload Structure

| Field | Type | Description |
|-------|------|-------------|
| `resourceType` | string | `IMPORTED_NUMBER` or `HOSTING_ORDER_NUMBER` |
| `eventType` | string | See event types below |
| `eventId` | string | Unique event ID |
| `timestamp` | ISO 8601 | When the event was created (UTC) |
| `projectId` | string | Project ID |
| `resourceId` | string | Phone number, hosting order ID, or brand ID |
| `status` | string | `SUCCEEDED` or `FAILED` |
| `failureCode` | string | Only present when `status` is `FAILED` |

## Resource Types

- **IMPORTED_NUMBER** — Numbers imported individually or previously imported successfully via hosting orders but later updated.
- **HOSTING_ORDER_NUMBER** — Numbers that are imported as part of a hosting order.

## Event Types

| Event Type | Description |
|-----------|-------------|
| `PROVISIONING_TO_SMS_PLATFORM` | Number linked to a Service Plan ID |
| `DEPROVISIONING_TO_SMS_PLATFORM` | Number unlinked from a Service Plan ID |
| `LINK_TO_10DLC_CAMPAIGN` | Number linked to a Campaign |
| `UNLINK_TO_10DLC_CAMPAIGN` | Number unlinked from a Campaign |
| `HOSTING_PROCESS` | Success or failure of a number's hosting process |
| `OSR_UPDATE` | OSR update performed for a number |
| `DELETE` | Number deleted |

## Failure Codes

Only present when `status` is `FAILED`:

| Code | Description |
|------|-------------|
| `CAMPAIGN_NOT_AVAILABLE` | The specified campaign is not available |
| `EXCEEDED_10DLC_LIMIT` | Exceeded the limit for 10DLC |
| `NUMBER_PROVISIONING_FAILED` | Provisioning the number failed |
| `PARTNER_SERVICE_UNAVAILABLE` | Third party service is unavailable |
| `CAMPAIGN_PENDING_ACCEPTANCE` | Campaign not yet accepted |
| `MNO_SHARING_ERROR` | Error with MNO |
| `CAMPAIGN_PROVISIONING_FAILED` | Campaign failed to provision |
| `CAMPAIGN_EXPIRED` | Campaign expired |
| `CAMPAIGN_MNO_REJECTED` | Campaign MNO was rejected |
| `CAMPAIGN_MNO_SUSPENDED` | Campaign MNO was suspended |
| `CAMPAIGN_MNO_REVIEW` | Campaign MNO is under review |
| `INSUFFICIENT_BALANCE` | Not enough credit in the account |
| `MOCK_CAMPAIGN_NOT_ALLOWED` | Provisioning not allowed for mock campaigns |
| `TFN_NOT_ALLOWED` | Toll free numbers not allowed |
| `INVALID_NNID` | Invalid NNID |

## Example Callback Payload

```json
{
  "resourceType": "IMPORTED_NUMBER",
  "eventType": "LINK_TO_10DLC_CAMPAIGN",
  "eventId": "abcd1234efghijklmnop567890",
  "timestamp": "2023-06-06T07:45:27.785357Z",
  "projectId": "abcd12ef-ab12-ab12-bc34-abcdef123456",
  "resourceId": "+12345612345",
  "status": "FAILED",
  "failureCode": "CAMPAIGN_NOT_AVAILABLE"
}
```

## HMAC Signature Verification

Callbacks include an `X-Sinch-Signature` header. To verify:

1. Configure your HMAC secret via `PATCH /v1/projects/{projectId}/callbackConfiguration`
2. Compute HMAC-SHA1 of the raw callback request body using your secret
3. Compare against the `X-Sinch-Signature` header value
