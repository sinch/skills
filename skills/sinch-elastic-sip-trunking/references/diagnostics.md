> **Not a schema.** This file describes common SIP failure symptoms and troubleshooting steps.
> For payload shape (field names, nesting, encodings, enums), refer to the canonical
> `developers.sinch.com` docs linked from the parent [SKILL.md](../SKILL.md) before writing
> code or prose that states payload structure.

# Elastic SIP Trunking — Diagnostics

## SIP Error Code Reference

If calls or registrations fail, check the SIP response code:

| Code | Symptom | Likely Cause | Fix |
|------|---------|--------------|-----|
| **401** | Registration fails | Credential list not linked to trunk | **Check this first.** `GET /trunks/{trunkId}/credentialLists` — if empty, link it: `POST /trunks/{trunkId}/credentialLists`. Endpoint creation succeeds without the link, so provisioning looks healthy while every REGISTER fails. |
| **401** | Registration fails | Credential mismatch | Verify username/password in Credential List matches what the SIP UA is sending. |
| **403** | Outbound call fails | Source IP not in ACL | Add your public IP to the ACL linked to the trunk. Check with `curl ifconfig.me`. |
| **403** | Outbound call fails | Wrong `From` domain | Ensure `From` header uses YOUR trunk domain (`user@{hostname}.pstn.sinch.com`), not the destination's domain. |
| **404** | Outbound call fails | Wrong SIP domain | Do NOT use `trunk.pstn.sinch.com`. Use your specific `{hostname}.pstn.sinch.com`. |
| **408** | Call timeout | Network/firewall issue | Ensure SIP ports (5060 UDP/TCP, 5061 TLS) are open to Sinch edge IPs. |
| **503** | Inbound call fails | No active endpoints | Ensure at least one SIP endpoint exists on the trunk AND (if registered) the UA is actively registered. |
| **603** | Outbound call fails | Rate limit (CPS) | Reduce call frequency. Default is 1 CPS; contact Sinch to increase. |

## HTTP provisioning errors (4xx)

Provisioning failures surface as HTTP status codes, not SIP codes. These are the ones the API returns with a usable message:

| Status | When | What it means |
|--------|------|---------------|
| **400** `VALIDATION_FAILED` / `Failed to read HTTP message` | Creating an ACL | Body shape is wrong. `ipRanges` is an array of `{ipAddress, range}` objects (`range` is an integer 1–32), and `enabled` is required. A CIDR string such as `"203.0.113.10/32"` produces this error. |
| **400** | Creating a credential | Password policy: at least 12 characters, with one uppercase, one lowercase, and one numeric. |
| **400** `Cannot delete SIP Trunk ... when there are phone numbers assigned` | `DELETE` trunk | Unassign phone numbers first. The API blocks the delete; it does not orphan the trunk. |
| **400** `Credential List cannot be deleted while attached to a SIP Trunk` | `DELETE` credential list | Unlink it from the trunk first (`DELETE /trunks/{trunkId}/credentialLists/{credentialListId}`). |
| **400** `Credential List cannot be deleted while attached to a SIP Endpoint` | `DELETE` credential list | Separate constraint from the trunk link. Delete or update the endpoint that references the username, then delete the list. |
| **404** `NO_RESOURCE_FOUND` | `GET /trunks/{trunkId}/phoneNumbers` | That path does not exist. List numbers with `GET /projects/{projectId}/phoneNumbers`. |
| **404** `CREDENTIAL_NOT_FOUND` | Creating a registered endpoint | `credentialUsername` is not in any credential list in the project. This check does **not** require the list to be linked to the trunk — a `201` can still leave REGISTER failing with SIP 401. |

## Verification Checklist

After setting up a trunk, verify the configuration:

1. **Check trunk exists**: `GET /trunks` — confirm your trunk appears in the list
2. **Check outbound auth is linked** (outbound): `GET /trunks/{trunkId}/accessControlLists` for ACL-based auth, or `GET /trunks/{trunkId}/credentialLists` for digest auth — confirm your ACL or credential list ID appears
3. **Check endpoint exists** (inbound): `GET /trunks/{trunkId}/endpoints` — confirm endpoint with correct IP/port
4. **Check phone numbers assigned** (inbound): `GET /projects/{projectId}/phoneNumbers` — confirm numbers are listed
5. **Wait 60 seconds** after any config change before testing
6. **Test outbound**: Send a SIP INVITE to `+1XXXXXXXXXX@{hostname}.pstn.sinch.com`
7. **Test inbound**: Call one of the assigned phone numbers and verify your endpoint receives the INVITE

## Common Debugging Steps

### "My outbound calls get 403"
1. Check your source IP: `curl ifconfig.me`
2. List ACLs on the trunk: `GET /trunks/{trunkId}/accessControlLists`
3. Verify your IP is in one of the linked ACLs (use /32 for exact match)
4. Check the SIP `From` header uses your trunk domain, not the callee's domain

### "My SIP UA can't register"
1. Verify a Credential List is **linked to the trunk** — `GET /trunks/{trunkId}/credentialLists` must be non-empty. Creating the endpoint does not link it for you.
2. Confirm a **Registered Endpoint** (not Static) exists on the trunk
3. Verify the username/password in the Credential List matches the UA config
4. Ensure the UA is sending REGISTER to `{hostname}.pstn.sinch.com`

### "Inbound calls aren't reaching my PBX"
1. Verify the phone number is assigned to the correct trunk
2. Check a SIP Endpoint exists with the correct IP and port
3. If using Registered Endpoints, verify the UA's registration is active
4. Check firewall rules — SIP traffic from Sinch must reach your endpoint
