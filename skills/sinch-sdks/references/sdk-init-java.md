> **Not a schema.** This file shows Java SDK installation and client-initialization examples.
> For SDK method signatures and initialization options, fetch the owning product's SDK syntax reference on `developers.sinch.com` (route via the product skill or [llms.txt](https://developers.sinch.com/llms.txt)) before writing code or prose that states payload structure.

# SDK Installation (Java)

Maven: `com.sinch.sdk:sinch-sdk-java` (latest 2.4.0; Voice API v2 needs 2.3.0+, Number Lookup v2 needs 2.1.0+). Supported runtimes: Java 8, 11, 17, 21, 25.

## Project-Scoped Auth (Conversation, Numbers, Number Lookup, Voice API v2)

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

> Since SDK v2.0.0, `conversationRegion` is **required** when using the Conversation API. Calls will fail at runtime if the region is not set.

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

### Voice API v2 (2.3.0+, preview)

Uses the project-scoped client above with no extra parameters; methods are under `client.voice().v2()` (calls, batches, sessions, services, SVAML). 2.4.0 added helpers in `com.sinch.sdk.domains.voice.models.v2.helpers`: `CommandsSequenceCreator`, `Destination`, `Calls`, `Menu`, `CallBehaviorHelper`, `SinchEventResponses`, `VoiceName`.

## Application-Scoped Auth (Voice API v1, Verification)

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

## Client options

```java
import com.sinch.sdk.models.RetryConfiguration;
import com.sinch.sdk.models.RetryPolicy;

Configuration config = Configuration.builder()
    // ... credentials
    .setRetryConfiguration(RetryConfiguration.builder()   // HTTP 429 retries on all endpoints, 2.2.0+
        .setRetryPolicy(RetryPolicy.BACKOFF)               // DEFAULT | RETRY_AFTER | BACKOFF | NONE
        .setMaxRetryCount(5)                               // default 3
        .setExponentialBackoff(2)                          // default 4
        .build())
    .build();
```

Also available: HTTP proxy via `HttpProxyConfiguration` (2.1.0+), `TransportSettings` for timeout (2.3.0+), and `SinchClient.close()` to release the connection pool (2.1.0+). For operations that accept `Idempotency-Key`, 2.3.0+ generates one and reuses it on 429 retries.
