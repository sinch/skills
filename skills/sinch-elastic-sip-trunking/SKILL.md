---
name: sinch-elastic-sip-trunking
description: Provisions SIP trunks, endpoints, ACLs, credential lists, and phone numbers via the Sinch Elastic SIP Trunking REST API. Use when the user needs SIP connectivity, trunk provisioning, inbound/outbound PSTN voice routing, PBX integration, or SIP-to-PSTN bridging.
metadata:
  author: Sinch
  version: 1.0.1
  category: Voice
  tags: sip, trunking, est, pstn, voice, pbx, inbound, outbound
  uses:
    - sinch-authentication
    - sinch-sdks
---

# Sinch Elastic SIP Trunking API

## Overview

The Sinch Elastic SIP Trunking (EST) API lets you programmatically provision SIP trunks and route voice traffic between customer infrastructure and the PSTN. The core workflow is: create a trunk, authorize it (ACL or credentials), attach endpoints, assign phone numbers.

## Agent Instructions

Before generating code, ask the user these clarifying questions:

1. **Direction** — Do you need **inbound** (receive calls from PSTN), **outbound** (send calls to PSTN), or **both**?
2. **Auth method for the trunk** (if outbound or both) — **ACL-based** (static IPs) or **Credential-based** (digest auth / dynamic IPs)?
3. **Endpoint type** (if inbound or both) — **Static endpoint** (fixed IP/port) or **Registered endpoint** (SIP UA registers dynamically)?
4. **Language** — curl, Node.js SDK, Python, Java, .NET?

Only ask questions 2-3 when relevant to the user's direction. Wait for answers, then follow the matching workflow below.

## Decision Tree

```
User wants EST →
├─ Outbound only
│  ├─ Static IPs   → Workflow A (Trunk + ACL)
│  └─ Dynamic IPs  → Workflow E (Trunk + Credential List / Digest Auth)
├─ Inbound only
│  ├─ Static IP    → Workflow B (Trunk + Static Endpoint + Phone Number)
│  └─ Dynamic IP   → Workflow D (Trunk + Credential List + Registered Endpoint + Phone Number)
└─ Both           → Workflow C (Trunk + ACL/Creds + Endpoint + Phone Number)
```

## Critical Rules

1. **Dependency order matters.** Creating resources out of order causes failures.
   `Create Trunk` → `Create ACL/Credentials` → `Link to Trunk` → `Assign Phone Numbers` → `Create Endpoint`
2. **The Domain Trap.** Never send SIP INVITEs to `trunk.pstn.sinch.com`. ALWAYS use `{your-hostname}.pstn.sinch.com`.
3. **60-second propagation.** After linking ACLs or Credentials, wait 60 seconds before testing.
4. **Lower priority = higher preference.** Endpoint `priority: 1` is primary; `priority: 100` is failover.
5. **PUT replaces the entire object.** Omitted fields become `null`.

## Getting Started

### Authentication

See [sinch-authentication](../sinch-authentication/SKILL.md) for full auth setup. EST uses **OAuth2 client credentials** (production) or **Basic Auth** (testing only, rate-limited).

### SDK Installation

See [sinch-sdks](../sinch-sdks/SKILL.md) for installation and client initialization. Note: EST is only supported in the **Node.js SDK** — for Java, Python, and .NET, use direct HTTP calls.

### First API Call — Create a Trunk

```bash
curl -X POST "https://elastic-trunking.api.sinch.com/v1/projects/{PROJECT_ID}/trunks" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-trunk", "hostName": "my-trunk"}'
```

Response includes `sipTrunkId` and `hostName` — use `{hostName}.pstn.sinch.com` for all SIP routing.

For SDK examples, see the [Getting Started Guide](https://developers.sinch.com/docs/est/getting-started.md).
## Key Concepts

- **Trunk**: Connection between your infrastructure and Sinch. Has a `hostName` used in SIP routing.
- **SIP Endpoint**: Where inbound calls go. **Static** (fixed IP) or **Registered** (dynamic, requires Credential List).
- **ACL**: Authorizes outbound by source IP (CIDR notation, e.g. `203.0.113.10/32`).
- **Credential List**: Username/password pairs. Used for registered endpoint auth (inbound) or digest auth (outbound).
- **Phone Numbers**: E.164 DIDs assigned to a trunk for inbound routing.

## Workflows

### Workflow A: Outbound Only (ACL-based)

- [ ] 1. Create trunk
- [ ] 2. Create ACL with your source IPs
- [ ] 3. Link ACL to trunk
- [ ] 4. **Wait 60 seconds**
- [ ] 5. Verify: `GET /trunks/{trunkId}/accessControlLists` — confirm ACL appears

**API docs**: [Create trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/createsiptrunk.md) → [Create ACL](https://developers.sinch.com/docs/est/api-reference/est/access-control-list/createaccesscontrollist.md) → [Link ACL to trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/addaccesscontrollisttotrunk.md) → [List ACLs for trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/getaccesscontrollistsfortrunk.md)

### Workflow B: Inbound Only (Static Endpoint)

- [ ] 1. Create trunk
- [ ] 2. Create static SIP endpoint on trunk
- [ ] 3. Assign phone number(s) to trunk
- [ ] 4. Verify: `GET /trunks/{trunkId}/endpoints` and `GET /trunks/{trunkId}/phoneNumbers`

**API docs**: [Create trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/createsiptrunk.md) → [Create SIP endpoint](https://developers.sinch.com/docs/est/api-reference/est/sip-endpoints/createsipendpoint.md) → [Get phone numbers](https://developers.sinch.com/docs/est/api-reference/est/phone-numbers/getphonenumbers.md)

### Workflow C: Bidirectional (Both Inbound + Outbound)

- [ ] 1. Create trunk
- [ ] 2. Create ACL and/or Credential List → Link to trunk
- [ ] 3. Create SIP endpoint on trunk
- [ ] 4. Assign phone numbers to trunk
- [ ] 5. **Wait 60 seconds** before testing
- [ ] 6. Verify: `GET /trunks/{trunkId}/accessControlLists`, `GET /trunks/{trunkId}/endpoints`, `GET /trunks/{trunkId}/phoneNumbers`

**API docs**: [Create trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/createsiptrunk.md) → [Create ACL](https://developers.sinch.com/docs/est/api-reference/est/access-control-list/createaccesscontrollist.md) → [Link ACL to trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/addaccesscontrollisttotrunk.md) → [Create SIP endpoint](https://developers.sinch.com/docs/est/api-reference/est/sip-endpoints/createsipendpoint.md) → [Get phone numbers](https://developers.sinch.com/docs/est/api-reference/est/phone-numbers/getphonenumbers.md)

### Workflow D: Inbound with Registered Endpoint (Credential-based)

- [ ] 1. Create trunk
- [ ] 2. Create credential list with username/password
- [ ] 3. Create registered endpoint on trunk (references a username from the credential list)
- [ ] 4. Assign phone number(s) to trunk
- [ ] 5. Configure SIP UA to REGISTER to `{hostname}.pstn.sinch.com`
- [ ] 6. Verify: `GET /trunks/{trunkId}/endpoints` and `GET /trunks/{trunkId}/phoneNumbers`

**API docs**: [Create trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/createsiptrunk.md) → [Credential Lists](https://developers.sinch.com/docs/est/api-reference/est/credential-lists/getcredentiallistbyid.md) → [Create SIP endpoint](https://developers.sinch.com/docs/est/api-reference/est/sip-endpoints/createsipendpoint.md) → [Get phone numbers](https://developers.sinch.com/docs/est/api-reference/est/phone-numbers/getphonenumbers.md)

### Workflow E: Outbound Only (Digest Auth / Credential-based)

- [ ] 1. Create trunk
- [ ] 2. Create credential list with username/password
- [ ] 3. Link credential list to trunk
- [ ] 4. **Wait 60 seconds**
- [ ] 5. Verify: `GET /trunks/{trunkId}/credentialLists` — confirm credential list appears

**API docs**: [Create trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/createsiptrunk.md) → [Credential Lists](https://developers.sinch.com/docs/est/api-reference/est/credential-lists/getcredentiallistbyid.md) → [Add credential list to trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/addcredentiallisttotrunk.md) → [List credential lists for trunk](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/getcredentiallistsfortrunk.md)

## SIP Header Rules (Outbound)

| Header | Value | Notes |
|--------|-------|-------|
| `From` | `sip:+1E164@{your-hostname}.pstn.sinch.com` | **Must** be your trunk domain. Wrong domain → 403. Use E.164 format. |
| `To` | `sip:+1E164@{your-hostname}.pstn.sinch.com` | Destination in E.164 + your trunk domain. In most cases, same as Request-URI. |
| `Request-URI` | `sip:+1E164@{your-hostname}.pstn.sinch.com` | Destination in E.164 + your trunk domain. In most cases, same as To. |

## Gotchas and Best Practices

1. **CIDR notation** — ACL entries require CIDR (`/32` for single IP, `/24` for range).
2. **Country permissions** — US/Canada enabled by default. Other countries blocked; use `updateCountryPermissions`.
3. **Project ID ≠ App Key** — EST uses `projectId`, not the Voice Application Key.
4. **Default CPS limit** — 1 call per second. Exceeding it → 603. Contact Sinch to increase.
5. **Teardown order** — Delete in reverse: unassign phone numbers → delete endpoints → unlink ACLs/credentials → delete trunk. Deleting out of order can orphan resources.

## Troubleshooting

For SIP error codes and debugging runbooks, see [references/diagnostics.md](references/diagnostics.md).

Quick reference:
- **401** → Credential mismatch in Credential List
- **403** → IP not in ACL, or wrong `From` domain
- **404** → Using wrong SIP domain (must be `{hostname}.pstn.sinch.com`)
- **503** → No active endpoint on trunk

## References

- **SIP Trunks API**: [Trunks](https://developers.sinch.com/docs/est/api-reference/est/sip-trunks/createsiptrunk.md) · [Endpoints](https://developers.sinch.com/docs/est/api-reference/est/sip-endpoints/createsipendpoint.md) · [ACLs](https://developers.sinch.com/docs/est/api-reference/est/access-control-list/createaccesscontrollist.md) · [Credential Lists](https://developers.sinch.com/docs/est/api-reference/est/credential-lists/getcredentiallistbyid.md) · [Phone Numbers](https://developers.sinch.com/docs/est/api-reference/est/phone-numbers/getphonenumbers.md) · [Country Permissions](https://developers.sinch.com/docs/est/api-reference/est/country-permissions/getcountrypermissions.md)
- **Diagnostics & debugging runbooks**: [references/diagnostics.md](references/diagnostics.md)

## Links

- [EST Overview](https://developers.sinch.com/docs/est/getting-started.md)
- [Getting Started Guide](https://developers.sinch.com/docs/est/getting-started.md)
- [API Reference (Markdown)](https://developers.sinch.com/docs/est/api-reference/est.md)
- [OpenAPI Spec (YAML)](https://developers.sinch.com/_bundle/docs/est/api-reference/est.yaml?download)
- [Twilio BYOC Integration](https://developers.sinch.com/docs/est/integration-guides/twilio-byoc.md)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
