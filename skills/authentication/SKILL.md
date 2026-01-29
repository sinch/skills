---
name: sinch-authentication
description: Sinch API authentication setup. Use when configuring credentials, OAuth2 tokens, or API keys for any Sinch product.
---

# Sinch Authentication

## Overview
Most Sinch APIs authenticate using OAuth2 with project-scoped credentials. Some legacy APIs use Application key/secret signing. This skill covers all auth methods.

## Getting Your Credentials

### Sinch Dashboard
1. Go to https://dashboard.sinch.com
2. Navigate to **Settings** > **Access Keys** (or the specific product section)
3. Note your **Project ID** (shown at the top of the dashboard)
4. Create an **Access Key** — this gives you a **Key ID** and **Key Secret**

IMPORTANT: Store your Key Secret securely. It is only shown once at creation time.

### Credential Types

| Credential | Where to Find | Used By |
|-----------|--------------|---------|
| Project ID | Dashboard top bar | All APIs |
| Key ID + Key Secret | Settings > Access Keys | OAuth2 APIs (Conversation, Numbers, SMS, Fax) |
| Application Key + Secret | Voice > Apps | Voice API, Verification API |
| API Key | Mailgun/Mailjet dashboard | Email APIs |

## OAuth2 Authentication (Most APIs)

Used by: Conversation API, SMS API, Numbers API, Fax API, Elastic SIP Trunking, 10DLC, Provisioning API

### Get a Bearer Token

```bash
curl -X POST https://auth.sinch.com/oauth2/token \
  -d grant_type=client_credentials \
  -u YOUR_KEY_ID:YOUR_KEY_SECRET
```

Response:
```json
{
  "access_token": "eyJhbG...",
  "expires_in": 3599,
  "token_type": "bearer"
}
```

Then use the token:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://us.conversation.api.sinch.com/v1/projects/YOUR_PROJECT_ID/...
```

### Node.js SDK (handles auth automatically)

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
});

// The SDK handles OAuth2 token management automatically
```

### Python SDK

```python
from sinch import SinchClient

sinch = SinchClient(
    project_id="YOUR_PROJECT_ID",
    key_id="YOUR_KEY_ID",
    key_secret="YOUR_KEY_SECRET",
)
```

### Java SDK

```java
import com.sinch.sdk.SinchClient;
import com.sinch.sdk.models.Configuration;

Configuration config = Configuration.builder()
    .setProjectId("YOUR_PROJECT_ID")
    .setKeyId("YOUR_KEY_ID")
    .setKeySecret("YOUR_KEY_SECRET")
    .build();

SinchClient sinch = new SinchClient(config);
```

### .NET SDK

```csharp
using Sinch;

var sinch = new SinchClient(
    projectId: "YOUR_PROJECT_ID",
    keyId: "YOUR_KEY_ID",
    keySecret: "YOUR_KEY_SECRET"
);
```

## Application Signing (Voice & Verification APIs)

Used by: Voice API, Verification API

These APIs use Application Key + Secret for request signing rather than OAuth2.

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
  voiceApplicationManagementKey: 'YOUR_APP_KEY',
  voiceApplicationManagementSecret: 'YOUR_APP_SECRET',
});
```

For curl with Voice API, sign requests using the Application Key and Secret per the [Voice API auth docs](https://developers.sinch.com/docs/voice/api-reference/authentication).

## Email Authentication

### Mailgun
Uses API key with Basic auth:
```bash
curl -s --user 'api:YOUR_MAILGUN_API_KEY' \
  https://api.mailgun.net/v3/YOUR_DOMAIN/messages
```

Get your API key at: https://app.mailgun.com/settings/api_security

### Mailjet
Uses API key + Secret key with Basic auth:
```bash
curl -s -X POST --user 'API_KEY:SECRET_KEY' \
  https://api.mailjet.com/v3.1/send
```

Get your keys at: https://app.mailjet.com/account/apikeys

## Environment Variables (Recommended)

Never hardcode credentials. Use environment variables:

```bash
export SINCH_PROJECT_ID="your-project-id"
export SINCH_KEY_ID="your-key-id"
export SINCH_KEY_SECRET="your-key-secret"
```

```javascript
const sinch = new SinchClient({
  projectId: process.env.SINCH_PROJECT_ID,
  keyId: process.env.SINCH_KEY_ID,
  keySecret: process.env.SINCH_KEY_SECRET,
});
```

## Gotchas and Best Practices

- OAuth2 tokens expire after ~3600 seconds. The SDKs handle refresh automatically; if using curl, re-request before expiry.
- Key Secrets are shown only once at creation. If lost, create a new Access Key.
- Use separate Access Keys for different environments (dev, staging, prod).
- Regional API base URLs differ (e.g., `us.conversation.api.sinch.com` vs `eu.conversation.api.sinch.com`). Choose the region matching your project.
- For Voice/Verification: the Application Key/Secret is different from the Access Key. Both are needed.
- Never commit credentials to version control. Use `.env` files (added to `.gitignore`) or a secrets manager.

## Links

- Sinch Dashboard: https://dashboard.sinch.com
- Access Keys: https://dashboard.sinch.com/settings/access-keys
- OAuth2 Docs: https://developers.sinch.com/docs/conversation/api-reference/oauth2
- Voice Auth Docs: https://developers.sinch.com/docs/voice/api-reference/authentication
- Mailgun API Keys: https://app.mailgun.com/settings/api_security
- Mailjet API Keys: https://app.mailjet.com/account/apikeys
