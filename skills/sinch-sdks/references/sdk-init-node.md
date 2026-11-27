> **Not a schema.** This file shows Node.js SDK installation and client-initialization examples.
> For SDK method signatures and initialization options, fetch the owning product's SDK syntax reference on `developers.sinch.com` (route via the product skill or [llms.txt](https://developers.sinch.com/llms.txt)) before writing code or prose that states payload structure.

# SDK Installation (Node.js)

`npm install @sinch/sdk-core` (latest 1.8.0; Voice API v2 needs 1.6.0+). Supported runtimes: Node.js 18, 20, 22.

> **ESM vs CommonJS** — The SDK uses ESM imports by default: `import { SinchClient } from "@sinch/sdk-core"`. For CommonJS, use `const { SinchClient } = require("@sinch/sdk-core")`.

## Project-Scoped Auth (Conversation, Numbers, Voice API v2, Fax, Number Lookup, Provisioning)

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
});
```

### Setting the Conversation API Region

> The SDK README documents `conversationRegion` as required for the Conversation API. Always set it.

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: process.env.SINCH_PROJECT_ID,
  keyId: process.env.SINCH_KEY_ID,
  keySecret: process.env.SINCH_KEY_SECRET,
  conversationRegion: 'us', // 'us', 'eu', or 'br'
});
```

### Voice API v2 (1.6.0+)

Voice API v2 uses the project-scoped client above — no application key/secret. Methods are on `sinch.voice.v2` (calls, batches, sessions, services, SVAML validate/describe). The default host is `https://voice.api.sinch.com`; override it with the `voiceV2Hostname` client option only when you need a regional endpoint. Webhooks are validated with `VoiceV2CallbackWebhooks({ serviceId, serviceSecret })`. 1.7.0 added SVAML helpers (`CommandsSequenceCreator`, `Destination`, `CallBehaviorHelper`, `VoiceName`) and renamed `MenuItem.onFail` to `onFailure`.

### SMS API (end-of-sale since 15 April 2026)

Set `smsRegion` (`us`, `eu`, `au`, `br`, `ca`). Project access keys work only in `us`/`eu` and not for projects created after 2026-04-15; otherwise use a service plan:

```javascript
const sinch = new SinchClient({
  servicePlanId: process.env.SINCH_SERVICE_PLAN_ID,
  apiToken: process.env.SINCH_API_TOKEN,
  smsRegion: 'au',
});
```

## Application-Scoped Auth (Voice API v1, Verification)

App credentials only:

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  applicationKey: 'YOUR_APP_KEY',
  applicationSecret: 'YOUR_APP_SECRET',
});
```

Combined project + app credentials (multi-product):

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
  applicationKey: 'YOUR_APP_KEY',
  applicationSecret: 'YOUR_APP_SECRET',
});
```

## Client options (1.5.0+)

```javascript
import { SinchClient, RetryPolicy } from '@sinch/sdk-core';

const sinch = new SinchClient({
  /* credentials */
  retryPolicy: RetryPolicy.BACKOFF, // DEFAULT | RETRY_AFTER | BACKOFF | NONE (1.6.0+)
  maxRetryCount: 5,                 // default 3
  exponentialBackoff: 2,            // default 4
  timeoutSeconds: 30,               // default 60 (1.6.0+)
  logger: null,                     // custom Logger, default console, null silences (1.5.0+)
});
```

> **1.5.0 breaking change:** domain packages (e.g. `@sinch/voice`) no longer re-export `@sinch/sdk-client`. Import client types and helpers from `@sinch/sdk-core`.
