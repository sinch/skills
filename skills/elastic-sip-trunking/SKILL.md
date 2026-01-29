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

Endpoints define the SIP addresses that can receive calls through a trunk. You can configure multiple endpoints per trunk for failover and load balancing.

### Access Control Lists (ACLs)

ACLs restrict which IP addresses can send SIP traffic to your trunk. You must configure at least one ACL to make outbound calls. ACLs can be shared across multiple trunks.

### Credential Lists

Credential lists manage username/password pairs for SIP REGISTER authentication. Use these to control which users can register and make calls on a trunk.

### Phone Numbers

Phone numbers (DIDs) are assigned to trunks for inbound call routing. Numbers purchased or ported to your Sinch account can be assigned to specific trunks.

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

## Gotchas and Best Practices

1. **OAuth2 tokens expire after 1 hour.** Implement token refresh logic in your application. Do not cache tokens beyond their expiry. The `expires_in` field in the token response tells you the TTL.

2. **Basic auth is for testing only.** It is heavily rate-limited and the limits may change without notice. Always use OAuth2 in production.

3. **UPDATE replaces the entire object.** The PUT endpoint requires the full trunk object. Any fields you omit will be set to `null`. Always fetch the current state before updating.

4. **ACLs are required for outbound calls.** You must have at least one ACL assigned to a trunk before you can make outbound calls. Without an ACL, outbound traffic is blocked.

5. **IP ACL entries use CIDR notation.** Specify IP ranges as `203.0.113.0/24` for a range or `203.0.113.10/32` for a single IP. Be precise to avoid exposing your trunk to unauthorized traffic.

6. **SIP transport options.** Sinch supports UDP, TCP, and TLS for SIP signaling. Use TLS for production to encrypt SIP headers and prevent eavesdropping. Media (RTP) encryption via SRTP is recommended.

7. **Codec support.** Sinch EST supports standard voice codecs including G.711 (PCMU/PCMA), G.729, and Opus. Ensure your PBX/SBC negotiates compatible codecs.

8. **Pagination on list endpoints.** List responses may be paginated. Check for pagination tokens in the response and iterate to retrieve all results.

9. **Phone numbers must be in E.164 format.** Always include the `+` prefix and country code (e.g., `+14045001000`). Numbers not in E.164 format will be rejected.

10. **Project ID is required in every request.** The base URL includes your `projectId`. This is different from the Application Key used by the Voice API. Find your Project ID in the Sinch Dashboard under Settings.

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
