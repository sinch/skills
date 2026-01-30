---
name: sinch-elastic-sip-trunking
description: Manage SIP trunks, endpoints, ACLs, and phone numbers with the Sinch Elastic SIP Trunking REST API. Use for trunk provisioning and SIP connectivity.
---

# Sinch Elastic SIP Trunking API

## Overview

The Sinch Elastic SIP Trunking (EST) API lets you programmatically create and manage SIP trunks, endpoints, access control lists (ACLs), and phone number assignments. It provides enterprise-grade SIP connectivity for routing voice traffic between your infrastructure and the PSTN via Sinch.

Key capabilities:
- **Trunk management**: Create, list, update, and delete SIP trunks
- **SIP endpoints**: Configure SIP endpoint addresses for call routing
- **Access control lists (ACLs)**: Restrict trunk access to specific IP addresses
- **Phone number management**: Assign and manage phone numbers on trunks
- **Credential lists**: Manage authentication credentials for trunk users

## Operational Mental Model

1. **Hierarchy**: Project > Trunk > (SIP Endpoint + ACL).
2. **Inbound (Origination)**: Requires a **SIP Endpoint** attached to the Trunk. Use **Registered Endpoints** (with Credential Lists) for dynamic IPs or **Static Endpoints** for fixed infrastructure.
3. **Outbound (Termination)**: Requires an **ACL** (IP Authorization) or **Credential List** (Digest Auth) linked directly to the **Trunk**.
4. **Phone Numbers**: Rented from Sinch and **assigned** to a specific Trunk for inbound routing.

## Golden Rules

1. **Dependency Order**: Failures occur if resources are created out of order.
   `Create Trunk` -> `Create Creds/ACL` -> `LINK TO TRUNK` -> `Rent/Assign Number` -> `Create Endpoint`.
2. **The Domain Trap**: Never send SIP INVITEs to the generic `trunk.pstn.sinch.com`. ALWAYS use your specific `{trunk-hostname}.pstn.sinch.com`.
3. **Propagation Delay**: After linking ACLs or Credentials to a trunk, **WAIT 60 SECONDS** before attempting to register or place calls.
4. **Lower Priority = Higher Preference**: SIP Endpoint `priority: 1` is the primary target; `priority: 100` is for failover.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

The EST API uses **OAuth2 client credentials** for production and **Basic Auth** for testing only.

**OAuth2 Token Request:**

```bash
curl -X POST "https://auth.sinch.com/oauth2/token" \
  -d "grant_type=client_credentials" \
  -u "YOUR_KEY_ID:YOUR_KEY_SECRET"
```

Response:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

The access token is valid for **1 hour**. Generate a new token as needed.

**Using the token:**
```
Authorization: Bearer eyJhbGciOi...
```

**Basic Auth (testing only, rate-limited):**
```
Authorization: Basic base64(KEY_ID:KEY_SECRET)
```

IMPORTANT: Basic authentication is heavily rate-limited and intended only for prototyping. Use OAuth2 tokens in production.

### Base URL

```
https://elastic-trunking.api.sinch.com/v1/projects/{projectId}
```

All endpoints require your `projectId` in the URL path. Find your Project ID in the Sinch Dashboard.

### SDK Installation

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` |
| Node.js (standalone) | `@sinch/elastic-sip-trunking` | `npm install @sinch/elastic-sip-trunking` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First API Call: Create a SIP Trunk

**curl:**
```bash
# Step 1: Get OAuth2 token
TOKEN=$(curl -s -X POST "https://auth.sinch.com/oauth2/token" \
  -d "grant_type=client_credentials" \
  -u "YOUR_KEY_ID:YOUR_KEY_SECRET" | jq -r '.access_token')

# Step 2: Create a SIP trunk
curl -X POST "https://elastic-trunking.api.sinch.com/v1/projects/YOUR_PROJECT_ID/trunks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Production Trunk",
    "hostName": "sip.example.com"
  }'
```

Response:
```json
{
  "id": "trunk-abc123",
  "name": "My Production Trunk",
  "hostName": "sip.example.com",
  "createTime": "2024-01-15T10:30:00Z",
  "updateTime": "2024-01-15T10:30:00Z"
}
```

**Node.js SDK:**
```javascript
const { SinchClient } = require('@sinch/sdk-core');

const sinchClient = new SinchClient({
  projectId: process.env.SINCH_PROJECT_ID,
  keyId: process.env.SINCH_KEY_ID,
  keySecret: process.env.SINCH_KEY_SECRET,
});

async function createTrunk() {
  const trunk = await sinchClient.elasticSipTrunking.sipTrunks.create({
    createSipTrunkRequestBody: {
      name: 'My Production Trunk',
      hostName: 'sip.example.com',
    },
  });
  console.log('Trunk created:', trunk.id);
  return trunk;
}

createTrunk();
```

## Key Concepts

### Trunks

A SIP trunk is the primary resource representing a connection between your infrastructure and Sinch. Each trunk has:
- **name**: Human-readable identifier
- **hostName**: The SIP domain/host for routing
- **id**: Unique identifier assigned by Sinch

### SIP Endpoints

Endpoints define the SIP addresses that can receive calls through a trunk.
- **Registered Endpoints**: Uses a `Credential List`. The SIP User Agent must send a `REGISTER` request.
- **Static Endpoints**: Forwards calls to a static IP/Port you define.
- **Priority**: Lower numbers are preferred (1 = Primary, 100 = Backup).

### Access Control Lists (ACLs)

ACLs restrict which IP addresses can send SIP traffic to your trunk for **outbound calls**. You must configure at least one ACL (or use Credential Lists) assigned to the trunk to authorize termination.

### Credential Lists

Credential lists manage username/password pairs.
- **For Inbound**: Used by Registered Endpoints for `REGISTER` authentication.
- **For Outbound**: Used for Digest Authentication on the trunk if ACLs are not used.

### Phone Numbers

Phone numbers (DIDs) are assigned to trunks for inbound call routing. Numbers must be in **E.164 format** (e.g., `+14045001000`).

## SIP Header & Routing Rules

When making outbound calls through your trunk, headers must be configured precisely:

| Header | Value | Purpose |
|--------|-------|---------|
| **`From`** | `caller@your-trunk.pstn.sinch.com` | **Must** use your trunk's domain. |
| **`To`** | `callee@your-trunk.pstn.sinch.com` | Routing destination. Routes on the number only|
| **`Request-URI`** | `sip:+1E164@your-trunk.pstn.sinch.com` | The destination number and your trunk domain. |

**Important**: Using the destination's domain in the `From` header will result in a **403 Forbidden** error.

## Common Patterns

### Full Trunk Setup (Create Trunk + ACL + Endpoint)

**Node.js SDK:**
```javascript
const { SinchClient } = require('@sinch/sdk-core');

const sinchClient = new SinchClient({
  projectId: process.env.SINCH_PROJECT_ID,
  keyId: process.env.SINCH_KEY_ID,
  keySecret: process.env.SINCH_KEY_SECRET,
});

async function setupTrunk() {
  // Step 1: Create the trunk
  const trunk = await sinchClient.elasticSipTrunking.sipTrunks.create({
    createSipTrunkRequestBody: {
      name: 'Production Trunk',
      hostName: 'sip.mycompany.com',
    },
  });
  console.log('Trunk ID:', trunk.id);

  // Step 2: Create an ACL
  const acl = await sinchClient.elasticSipTrunking.accessControlLists.create({
    createAccessControlListRequestBody: {
      name: 'Office IPs',
      entries: [
        { ip: '203.0.113.10/32', description: 'Primary office' },
        { ip: '203.0.113.20/32', description: 'Backup office' },
      ],
    },
  });
  console.log('ACL ID:', acl.id);

  // Step 3: Assign ACL to trunk
  await sinchClient.elasticSipTrunking.accessControlLists.addToTrunk({
    trunkId: trunk.id,
    accessControlListId: acl.id,
  });

  // Step 4: Create a SIP endpoint
  const endpoint = await sinchClient.elasticSipTrunking.sipEndpoints.create({
    createSipEndpointRequestBody: {
      trunkId: trunk.id,
      address: '203.0.113.10',
      port: 5060,
      transport: 'UDP',
      priority: 1,
    },
  });
  console.log('Endpoint ID:', endpoint.id);

  return { trunk, acl, endpoint };
}

setupTrunk();
```

### List All Trunks

**curl:**
```bash
curl -X GET "https://elastic-trunking.api.sinch.com/v1/projects/YOUR_PROJECT_ID/trunks" \
  -H "Authorization: Bearer $TOKEN"
```

**Node.js SDK:**
```javascript
async function listTrunks() {
  const response = await sinchClient.elasticSipTrunking.sipTrunks.list({});
  for (const trunk of response.trunks) {
    console.log(`${trunk.name} (${trunk.id}) - ${trunk.hostName}`);
  }
}
```

### Update a Trunk

**curl:**
```bash
curl -X PUT "https://elastic-trunking.api.sinch.com/v1/projects/YOUR_PROJECT_ID/trunks/TRUNK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Trunk Name",
    "hostName": "sip-updated.example.com"
  }'
```

**Node.js SDK:**
```javascript
async function updateTrunk(trunkId) {
  const updated = await sinchClient.elasticSipTrunking.sipTrunks.update({
    trunkId: trunkId,
    updateSipTrunkRequestBody: {
      name: 'Updated Trunk Name',
      hostName: 'sip-updated.example.com',
    },
  });
  console.log('Updated:', updated.name);
}
```

### Delete a Trunk

**curl:**
```bash
curl -X DELETE "https://elastic-trunking.api.sinch.com/v1/projects/YOUR_PROJECT_ID/trunks/TRUNK_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Assign a Phone Number to a Trunk

**curl:**
```bash
curl -X POST "https://elastic-trunking.api.sinch.com/v1/projects/YOUR_PROJECT_ID/trunks/TRUNK_ID/phoneNumbers" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phoneNumbers": ["+14045001000"]
  }'
```

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trunks` | Create a new SIP trunk |
| GET | `/trunks` | List all SIP trunks |
| GET | `/trunks/{trunkId}` | Get trunk by ID |
| PUT | `/trunks/{trunkId}` | Update a trunk (full object required) |
| DELETE | `/trunks/{trunkId}` | Delete a trunk |
| POST | `/trunks/{trunkId}/endpoints` | Create a SIP endpoint |
| GET | `/trunks/{trunkId}/endpoints` | List endpoints for a trunk |
| POST | `/accessControlLists` | Create an ACL |
| GET | `/accessControlLists` | List all ACLs |
| PUT | `/accessControlLists/{aclId}` | Update an ACL |
| POST | `/trunks/{trunkId}/phoneNumbers` | Assign phone numbers to trunk |
| GET | `/trunks/{trunkId}/phoneNumbers` | List phone numbers on trunk |

All endpoints are prefixed with `https://elastic-trunking.api.sinch.com/v1/projects/{projectId}`.

## Diagnostic Reference

If calls or registrations fail, check the SIP response code:

| Code | Symptom | Likely Cause | Fix |
|------|---------|--------------|-----|
| **401** | Reg Fail | Credential mismatch | Verify username/password in Credential List. |
| **403** | Outbound Fail | Source IP not in ACL | Add your public IP to the ACL linked to the trunk. |
| **403** | Outbound Fail | Wrong `From` domain | Ensure `From` header uses YOUR trunk domain. |
| **404** | Outbound Fail | Wrong Domain | Do NOT use `trunk.pstn.sinch.com`; use your hostname. |
| **503** | Inbound Fail | No active endpoints | Ensure endpoint is created and (if registered) UA is active. |
| **603** | Outbound Fail | Rate Limit (CPS) | Reduce call frequency (default 1 CPS). |

## Gotchas and Best Practices

1. **Wait for Propagation.** ACL and Credential changes take **~60 seconds** to sync across Sinch's edge network. Testing immediately after a configuration change often results in false negatives.

2. **The "From" Header Rule.** Always set the domain in your SIP `From` header to your specific trunk hostname (e.g., `+15551234567@my-trunk.pstn.sinch.com`).

3. **OAuth2 tokens expire after 1 hour.** Implement token refresh logic in your application. Do not cache tokens beyond their expiry.

4. **UPDATE replaces the entire object.** The PUT endpoint requires the full trunk object. Any fields you omit will be set to `null`.

5. **Priority Logic.** Lower numbers = higher priority. Use `1` for primary and `100` for failover.

6. **IP ACL entries use CIDR notation.** Specify IP ranges as `203.0.113.0/24` or `203.0.113.10/32`.

7. **Project ID vs App Key.** EST uses `projectId` from the Dashboard settings, not the Voice Application Key.

8. **Country Permissions.** US/Canada are allowed by default. Most other countries are blocked; use `updateCountryPermissions` to enable them.

## Links

- [Elastic SIP Trunking Overview](https://developers.sinch.com/docs/est.md)
- [Getting Started Guide](https://developers.sinch.com/docs/est/getting-started.md)
- [API Reference](https://developers.sinch.com/docs/est/api-reference/est.md)
- [SIP Trunks API](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks.md)
- [SIP Endpoints API](https://developers.sinch.com/docs/est/api-reference/est/sip-endpoints.md)
- [Access Control Lists API](https://developers.sinch.com/docs/est/api-reference/est/credential-list/bulkupdatecredentiallistsfortrunk.md)
- [Twilio BYOC Integration Guide](https://developers.sinch.com/docs/est/integration-guides/twilio-byoc.md)
- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core)
- [npm: @sinch/elastic-sip-trunking](https://www.npmjs.com/package/@sinch/elastic-sip-trunking)
- [Sinch Community: How to Create a SIP Trunk](https://community.sinch.com/t5/Elastic-SIP-Trunking/How-do-I-create-a-SIP-trunk/ta-p/11405)
- [Elastic SIP Trunking OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/est/api-reference/est.yaml?download)
- [Elastic SIP Trunking API Reference (Markdown)](https://developers.sinch.com/docs/est/api-reference/est.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
