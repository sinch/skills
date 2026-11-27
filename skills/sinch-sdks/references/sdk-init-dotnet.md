> **Not a schema.** This file shows .NET SDK installation and client-initialization examples.
> For SDK method signatures and initialization options, fetch the owning product's SDK syntax reference on `developers.sinch.com` (route via the product skill or [llms.txt](https://developers.sinch.com/llms.txt)) before writing code or prose that states payload structure.

# SDK Installation (.NET)

`dotnet add package Sinch` (latest 1.5.1). Supported runtimes: .NET 6, 7, 8. `SinchClient` is thread-safe — register it as a singleton with dependency injection.

The .NET SDK does not cover Voice API v2, Number Lookup, Elastic SIP Trunking, or Provisioning — use direct HTTP for those.

## Project-Scoped Auth (Conversation, Numbers, Fax, EST, etc.)

```csharp
using Sinch;

var sinch = new SinchClient("YOUR_PROJECT_ID",
                            "YOUR_KEY_ID",
                            "YOUR_KEY_SECRET");
```

### Setting the Conversation API Region

> The SDK README documents `ConversationRegion` as required for the Conversation API. Always set it.

```csharp
using Sinch;
using Sinch.Conversation;

var sinch = new SinchClient("YOUR_PROJECT_ID",
                            "YOUR_KEY_ID",
                            "YOUR_KEY_SECRET",
                            options => options.ConversationRegion = ConversationRegion.Eu); // Us, Eu, or Br
```

## Application-Scoped Auth (Voice API v1, Verification)

With project credentials:

```csharp
using Sinch;

var sinch = new SinchClient("YOUR_PROJECT_ID",
                            "YOUR_KEY_ID",
                            "YOUR_KEY_SECRET");
var voice = sinch.Voice("YOUR_APP_KEY", "YOUR_APP_SECRET");
var verification = sinch.Verification("YOUR_APP_KEY", "YOUR_APP_SECRET");
```

Voice/Verification only (no project credentials):

```csharp
using Sinch;

var sinch = new SinchClient(null, null, null);
var voice = sinch.Voice("YOUR_APP_KEY", "YOUR_APP_SECRET");
```
