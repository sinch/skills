# SDK Initialization (Java)

## Project-Scoped Auth (Conversation, Numbers, Fax, EST, etc.)

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

### Setting the Conversation API Region

> With SDK v2 (upcoming), region will be required for Conversation usage. Set region explicitly now to stay forward-compatible.

```java
import com.sinch.sdk.SinchClient;
import com.sinch.sdk.models.Configuration;
import com.sinch.sdk.models.ConversationRegion;

Configuration config = Configuration.builder()
    .setProjectId("YOUR_PROJECT_ID")
    .setKeyId("YOUR_KEY_ID")
    .setKeySecret("YOUR_KEY_SECRET")
    .setConversationRegion(ConversationRegion.EU) // US, EU, or BR
    .build();

SinchClient sinch = new SinchClient(config);
```

## Application-Scoped Auth (Voice, Verification)

App credentials only:

```java
import com.sinch.sdk.SinchClient;
import com.sinch.sdk.models.Configuration;

SinchClient client = new SinchClient(Configuration.builder()
    .setApplicationKey("YOUR_APP_KEY")
    .setApplicationSecret("YOUR_APP_SECRET")
    .build());
```

Combined project + app credentials (multi-product):

```java
import com.sinch.sdk.SinchClient;
import com.sinch.sdk.models.Configuration;

SinchClient client = new SinchClient(Configuration.builder()
    .setProjectId("YOUR_PROJECT_ID")
    .setKeyId("YOUR_KEY_ID")
    .setKeySecret("YOUR_KEY_SECRET")
    .setApplicationKey("YOUR_APP_KEY")
    .setApplicationSecret("YOUR_APP_SECRET")
    .build());
```
