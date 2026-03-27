# SDK Initialization (Node.js)

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

> With SDK v2 (upcoming), defining the region will be required for Conversation usage. Set region explicitly now to stay forward-compatible.

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
