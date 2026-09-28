---
name: sinch-authentication
description: Configures Sinch API credentials and authentication. Use when setting up OAuth2, Basic auth, application signing, or API keys for any Sinch product including Conversation API, Voice, Verification, Numbers, Fax, and Mailgun. Also use when troubleshooting 401 Unauthorized, 403 Forbidden, invalid signature, or credential errors against any Sinch API. For SDKs usage, see sinch-sdks.
metadata:
  author: Sinch
  version: 1.3.0
  category: Core
  tags: authentication, oauth2, basic-auth, api-keys, credentials
---

# Sinch Authentication

Cross-cutting skill that covers credential setup and authentication for all Sinch APIs. Determines the correct auth model, provides curl examples, SDK init code, and troubleshooting for common auth errors.

## Agent Instructions

> **Policy gate `sinch-shared-policy@5` (`sha256:4864cf0fa8d6`):** The policy digest below is binding as written. Before implementation or live execution, read [the full shared Sinch policy](references/shared-policy.md) once per conversation — skip it if this exact ID/version/fingerprint is already loaded; read it if the version is newer or the fingerprint differs. This skill's canonical operation routes live in its Agent Instructions and Links sections.

<!-- sinch-policy-digest: start (generated; edit docs/SINCH_SHARED_POLICY.md and run scripts/sync_sinch_skill_references.py) -->
**Sinch policy digest (binding):**

1. Load the shared policy once per conversation; skip duplicate copies bearing the same ID/version/fingerprint.
2. Infer product, language, region, and environment from the request and workspace; ask one combined question only for true blockers. Prefer the official Sinch SDK unless the request or workspace decides otherwise or no official SDK covers the language or operation.
3. Code-generation approval is not execution approval. Classify every operation (read-only / reversible / billable / destructive) and obtain explicit approval before billable or destructive calls.
4. Tier B facts — endpoint paths, methods, field names, enums, limits, webhook payloads, signature algorithms, SDK signatures — require fetching the exact canonical document in the current session before use.
5. Bundled scripts, references, and examples are Tier C: illustrations, never schema authority. Never promote example values to production defaults.
6. If a route is unresolved or a canonical fetch fails, climb the resolution ladder in order — re-search already-fetched documents (raw, not summarized), consult https://developers.sinch.com/llms.txt, follow first-party links, retry once — before failing closed. Never pattern-guess a documentation URL; never substitute memory, search snippets, or bundled files.
7. Keep an evidence ledger mapping each fetched source to the fields and claims it authorized.
8. Bound all polling and retries (backoff, jitter, hard cap); check state before retrying billable or destructive operations; report a timeout as unknown, not failed.
9. Report verification levels separately (lint → unit → mock contract → sandbox → live → end-to-end); an HTTP 2xx does not prove delivery. State the levels not performed.
10. Load only the smallest skill set that owns the behavior; if a required skill is unavailable, name it and stop rather than improvising its instructions.
<!-- sinch-policy-digest: end -->

If the user hasn't specified which Sinch product they're integrating, ask first — the auth model depends on the product. Use the decision table in Step 1 to route to the correct credentials.

## Source of Truth — what to load, and what is authoritative

This skill has two kinds of content with UNEQUAL reliability. Follow this precedence:

1. **Canonical docs at `developers.sinch.com` (AUTHORITATIVE).** The `.md` doc links in
   this skill are the single source of truth for exact request/response schemas, field
   names and nesting, enum values, signature/auth schemes, and limits. Before writing
   code that constructs a payload, verifies a signature, or parses a callback/response,
   fetch the specific linked doc and confirm the exact shape there. Fetching first-party
   `developers.sinch.com` URLs is permitted by the Security/URL policy. Never invent, guess, or pattern-extrapolate a documentation URL — only fetch doc URLs written verbatim in this skill or reached by following a link on a page you already fetched; a trusted domain does not make a guessed path real.
2. **This SKILL.md's own tables, field lists, and snippets (SUMMARIES — not authoritative).**
   They orient you and point at the right canonical doc; they may lag, omit fields, or
   simplify nesting. Use them to decide what to build and which doc to open. Do NOT
   transcribe a field name, nesting, encoding, or enum from this file into shipped code
   without confirming it in the tier-1 doc. If a detail appears only in a summary, treat
   it as unverified and say so.

Quick rule: **writing code → load the doc.** Never cite an exact field, header, enum, or
encoding you only saw in a summary.

## Step 1: Identify the Auth Model

Determine which model applies based on the Sinch product:

| Auth Model | Products | Credentials Needed |
|-----------|----------|-------------------|
| **Project-scoped** (Basic or OAuth2) | Conversation API, Numbers, Fax, EST, 10DLC, Number Lookup, Provisioning | Project ID + Key ID + Key Secret |
| **Application-scoped** (Basic or Signed) | Voice API, Verification API, In-App Calling SDKs | Application Key + Application Secret |
| **API key** | Mailgun | API Key (username is literal `api`) |

> Voice/Verification credentials are a **separate credential set** from project Access Keys (different dashboard pages and auth models). In multi-product SDK clients, you may provide both sets together, but do not substitute one set for the other.

## Step 2: Get Credentials

- **Project-scoped**: Dashboard > Settings > Access Keys → creates Key ID + Key Secret. Project ID is at the top of the dashboard.
- **Application-scoped**: Dashboard > Voice > Apps or Verification > Apps → creates Application Key + Application Secret.
- **Mailgun**: https://app.mailgun.com/settings/api_security

Store Key Secrets securely — they are shown only once at creation.

**Load credentials into environment variables** before making API calls — never embed them directly in commands or code:

```bash
# Project-scoped APIs (Conversation, Numbers, Fax, etc.)
export SINCH_PROJECT_ID="your-project-id"
export SINCH_KEY_ID="your-key-id"
export SINCH_KEY_SECRET="your-key-secret"

# Application-scoped APIs (Voice, Verification)
export SINCH_APP_KEY="your-application-key"
export SINCH_APP_SECRET="your-application-secret"

# Mailgun
export MAILGUN_API_KEY="your-mailgun-api-key"
export MAILGUN_DOMAIN="your-domain.com"
```

## Step 3: Authenticate

### Project-Scoped APIs

**OAuth2 (recommended)** — Exchange credentials for a bearer token:

```bash
curl -X POST \
  https://auth.sinch.com/oauth2/token \
  -u "$SINCH_KEY_ID:$SINCH_KEY_SECRET" \
  -d grant_type=client_credentials
```

*(Summary only — confirm exact names/encoding/enums against the authoritative [Sinch Docs](https://developers.sinch.com/llms.txt) doc before implementing.)*

The response JSON contains an `access_token` field — this is the JWT to use as the bearer token:

```json
{ "access_token": "eyJ...", "token_type": "bearer", "expires_in": 3600 }
```

> **Do not mint your own JWT.** The `access_token` above is issued and signed by Sinch's auth server. Locally-signed JWTs (e.g. `jsonwebtoken.sign({ iss: keyId }, keySecret, { algorithm: "HS256" })`) will be rejected with **HTTP 401** by every Sinch API. Always POST `grant_type=client_credentials` to the token endpoint and use the returned `access_token` verbatim.

Use it in subsequent requests (expires in 3600s):

```bash
curl -X GET \
  "https://numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/activeNumbers" \
  -H "Authorization: Bearer $SINCH_ACCESS_TOKEN"
```

The token endpoint `https://auth.sinch.com/oauth2/token` works for **all** project-scoped APIs, including regional ones like Conversation and Template Management.

**Basic auth (quick testing only)** — Supported but **not recommended for production** (heavily rate-limited). Pass Key ID as username and Key Secret as password:

```bash
curl -X GET \
  "https://numbers.api.sinch.com/v1/projects/$SINCH_PROJECT_ID/activeNumbers" \
  -u "$SINCH_KEY_ID:$SINCH_KEY_SECRET"
```

Always prefer OAuth2 bearer tokens for production workloads — Basic auth has lower rate limits and exposes credentials in every request.

### Voice, Verification & In-App Calling

Use **Basic auth** (prototyping) — Application Key as username, Application Secret as password:

```bash
curl -X POST \
  "https://calling.api.sinch.com/calling/v1/callouts" \
  -u "$SINCH_APP_KEY:$SINCH_APP_SECRET"
```

Or use **HMAC Signed Requests** (production) — see signing algorithm docs:
- Voice: https://developers.sinch.com/docs/voice/api-reference/authentication/signed-request.md
- Verification: https://developers.sinch.com/docs/verification/api-reference/authentication/application-signed-request.md

Verification API also supports **Public Authentication** (weak, client-side SDK only).

### Mailgun

```bash
curl -X GET \
  "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
  -s --user "api:$MAILGUN_API_KEY"
```

## SDK Installation

For SDK installation and client initialization, see the `sinch-sdks` skill.

## Gotchas

- OAuth2 tokens expire in 3600s. SDKs auto-refresh; for curl, re-request before expiry.
- **Voice/Verification use application credentials**, not project Access Keys. These are entirely separate credential sets from different dashboard pages.
- Key Secrets are shown only once. If lost, create a new Access Key.
- **Never hardcode credentials** — Always load Key IDs, Key Secrets, and API keys from environment variables or a secret manager. Do not embed credentials in source code, shell history, or agent instructions.
- **Basic auth is rate-limited** — Use OAuth2 bearer tokens in production for higher throughput.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` on Conversation/Numbers API | Wrong credentials or expired token | Verify Key ID from Access Keys and use the Key Secret saved at creation time; if the secret was lost, create a new Access Key and re-request an OAuth2 token. Also inspect the `WWW-Authenticate` response header for details (for example, invalid token, expired token, or invalid client). |
| `401 Invalid Signature` on Voice/Verification | Wrong Application Key/Secret or signing error | Verify app credentials from Voice > Apps; ensure HMAC signing matches the algorithm spec |
| OAuth2 token works for Numbers but fails for Conversation | Wrong API base URL region | Ensure the API base URL matches the app's region (e.g., `eu.conversation.api.sinch.com` for EU apps) |
| `403 Forbidden` | Key doesn't have access to this project/product | Check Access Key scope in dashboard; ensure correct Project ID |

## Links

Dashboard links below require authentication and are intended for human operators. Agents should rely on public docs for procedural guidance and treat dashboard URLs as navigational references only.

Authenticated Console Links (human operators):

- Sinch Dashboard: https://dashboard.sinch.com
- Access Keys: https://dashboard.sinch.com/settings/access-keys
- Voice Apps: https://dashboard.sinch.com/voice/apps
- Verification Apps: https://dashboard.sinch.com/verification/apps
- Mailgun API Keys: https://app.mailgun.com/settings/api_security

Public Documentation Links (agent-friendly):

- Project OAuth Docs: https://developers.sinch.com/docs/numbers/api-reference/authentication/oauth
- Voice Auth Docs: https://developers.sinch.com/docs/voice/api-reference/authentication.md
- Verification Auth Docs: https://developers.sinch.com/docs/verification/api-reference/authentication.md
- Mailgun Auth Docs: https://documentation.mailgun.com/docs/mailgun/api-reference/mg-auth.md
- In-App Calling: https://developers.sinch.com/docs/in-app-calling/overview.md
- How to Create Access Keys: https://community.sinch.com/t5/Conversation-API/How-do-I-create-new-Access-Keys-for-use-with-the-Conversation/ta-p/8120
- Sinch Docs: https://developers.sinch.com/llms.txt