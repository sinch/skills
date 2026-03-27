---
name: sinch-authentication
description: Configures Sinch API credentials and authentication. Use when setting up OAuth2, Basic auth, application signing, API keys, or SDK credentials for any Sinch product including Conversation API, Voice, Verification, Numbers, Fax, and Mailgun. Also use when troubleshooting 401 Unauthorized, 403 Forbidden, invalid signature, or credential errors against any Sinch API.
metadata:
  author: Sinch
  version: 1.0.0
---

# Sinch Authentication

Cross-cutting skill that covers credential setup and authentication for all Sinch APIs. Determines the correct auth model, provides curl examples, SDK init code, and troubleshooting for common auth errors.

## Agent Instructions

If the user hasn't specified which Sinch product they're integrating, ask first — the auth model depends on the product. Use the decision table in Step 1 to route to the correct credentials.

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

## Step 3: Authenticate

### Project-Scoped APIs

Use **Basic auth** (simplest) — Key ID as username, Key Secret as password:

```bash
curl -u YOUR_KEY_ID:YOUR_KEY_SECRET \
  https://numbers.api.sinch.com/v1/projects/{PROJECT_ID}/activeNumbers
```

Or use **OAuth2** — exchange credentials for a bearer token:

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_KEY_ID:YOUR_KEY_SECRET
```

The response JSON contains an `access_token` field — this is the JWT to use as the bearer token:

```json
{ "access_token": "eyJ...", "token_type": "bearer", "expires_in": 3600 }
```

Use it in subsequent requests: `Authorization: Bearer {access_token}` (expires in 3600s).

The token endpoint `https://auth.sinch.com/oauth2/token` works for **all** project-scoped APIs, including regional ones like Conversation and Template Management. Regional aliases (`us.auth.sinch.com`, `eu.auth.sinch.com`) also exist but are not required — the global URL issues tokens valid for any region.

### Voice, Verification & In-App Calling

Use **Basic auth** (prototyping) — Application Key as username, Application Secret as password:

```bash
curl -X POST -u YOUR_APP_KEY:YOUR_APP_SECRET \
  https://calling.api.sinch.com/calling/v1/callouts
```

Or use **HMAC Signed Requests** (production) — see signing algorithm docs:
- Voice: https://developers.sinch.com/docs/voice/api-reference/authentication/signed-request.md
- Verification: https://developers.sinch.com/docs/verification/api-reference/authentication/application-signed-request.md

Verification API also supports **Public Authentication** (weak, client-side SDK only).

### Mailgun

```bash
curl -s --user 'api:YOUR_MAILGUN_API_KEY' \
  https://api.mailgun.net/v3/{DOMAIN}/messages
```

## SDK Initialization

For SDK-specific init code, use the language-specific references:

- Node.js: [references/sdk-init-node.md](references/sdk-init-node.md)
- Python: [references/sdk-init-python.md](references/sdk-init-python.md)
- Java: [references/sdk-init-java.md](references/sdk-init-java.md)
- .NET: [references/sdk-init-dotnet.md](references/sdk-init-dotnet.md)
- In-App Calling (Browser): [references/sdk-init-in-app-calling-browser.md](references/sdk-init-in-app-calling-browser.md)
- In-App Calling (iOS): [references/sdk-init-in-app-calling-ios.md](references/sdk-init-in-app-calling-ios.md)
- In-App Calling (Android): [references/sdk-init-in-app-calling-android.md](references/sdk-init-in-app-calling-android.md)

If language is unknown, ask first. The SDKs handle token refresh automatically.

## Gotchas

- OAuth2 tokens expire in 3600s. SDKs auto-refresh; for curl, re-request before expiry.
- **Regional API URLs matter for Conversation/Template APIs**: The API base URL must match the region where the app was created (e.g., `us.conversation.api.sinch.com`, `eu.conversation.api.sinch.com`). The OAuth token endpoint, however, is always `https://auth.sinch.com/oauth2/token`.
- **Voice/Verification use application credentials**, not project Access Keys. These are entirely separate credential sets from different dashboard pages.
- Key Secrets are shown only once. If lost, create a new Access Key.

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

- Voice Auth Docs: https://developers.sinch.com/docs/voice/api-reference/authentication.md
- Verification Auth Docs: https://developers.sinch.com/docs/verification/api-reference/authentication.md
- In-App Calling: https://developers.sinch.com/docs/in-app-calling/overview.md
- Sinch Docs (machine-readable index): https://developers.sinch.com/llms.txt
