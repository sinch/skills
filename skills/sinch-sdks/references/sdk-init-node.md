# SDK Installation (Node.js)

`npm install @sinch/sdk-core` (v1.4.0+)

> **ESM vs CommonJS** — The SDK uses ESM imports by default: `import { SinchClient } from "@sinch/sdk-core"`. For CommonJS, use `const { SinchClient } = require("@sinch/sdk-core")`.

## Project-Scoped Auth (Conversation, Numbers, Fax, EST, etc.)

```javascript
import { SinchClient } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
});
```

### Setting the Conversation API Region

> The region should be set explicitly for Conversation API usage. Not yet enforced in SDK v1 for backward compatibility, but recommended.

```javascript
import { SinchClient, ConversationRegion } from '@sinch/sdk-core';

const sinch = new SinchClient({
  projectId: 'YOUR_PROJECT_ID',
  keyId: 'YOUR_KEY_ID',
  keySecret: 'YOUR_KEY_SECRET',
  conversationRegion: ConversationRegion.EUROPE, // us, eu, or br
});
```

## Application-Scoped Auth (Voice, Verification)

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