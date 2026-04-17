---
name: sinch-sdks
description: "Sinch SDK installation and client initialization for Node.js, Python, Java, and .NET. Use when installing a Sinch SDK, initializing SinchClient, setting up SDK credentials, configuring conversation region in SDK, or building a multi-product SDK client. For In-App Calling SDKs, see sinch-in-app-calling."
metadata:
  author: Sinch
  version: 1.0.0
  category: Core
  tags: sdk, node, python, java, dotnet, sinch-client, installation
  uses:
    - sinch-authentication
---

# Sinch SDKs

## Overview

Cross-cutting skill that covers SDK installation and client initialization for all Sinch products. Determines the correct SDK and provides init code per language.

For authentication setup (credentials, OAuth2, Basic auth, signed requests), see [sinch-authentication](../sinch-authentication/SKILL.md). For In-App Calling SDKs (Browser, iOS, Android), see [sinch-in-app-calling](../sinch-in-app-calling/SKILL.md).

## Agent Instructions

If the user hasn't specified which language or platform, ask first — the SDK and init pattern differ by language. Use the table below to route to the correct reference.

## SDK Installation

| Language | Package | Install | Auth Scope |
|----------|---------|---------|------------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` | Project + Application |
| Python | `sinch` | `pip install sinch` | Project + Application |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency | Project + Application |
| .NET | `Sinch` | NuGet package | Project + Application |

In-App Calling uses a **separate client-side SDK** — not `@sinch/sdk-core`. See [sinch-in-app-calling](../sinch-in-app-calling/SKILL.md).

## Product Coverage by SDK

Not all products are available in all SDKs. Check the table before recommending an SDK for a specific product.

| Product | Node.js | Java | .NET | Python |
|---------|---------|------|------|--------|
| Conversation API | ✅ | ✅ | ⚠️ | ⚠️ |
| Voice API | ✅ | ✅ | ✅ | ✅ |
| Verification API | ✅ | ✅ | ✅ | ✅ |
| Numbers API | ✅ | ✅ | ✅ | ✅ |
| Number Lookup API | ✅ | ❌ | ❌ | ✅ |
| Elastic SIP Trunking | ✅ | ❌ | ❌ | ❌ |
| Fax API | ✅ | ❌ | ⚠️ | ❌ |
| Provisioning API | ✅ | ❌ | ❌ | ❌ |
| 10DLC Registration | ❌ | ❌ | ❌ | ❌ |

✅ = supported, ⚠️ = partial/preview, ❌ = not available (use direct HTTP)

When a product is not supported in the user's chosen SDK, guide them to use direct HTTP calls instead.

## SDK Init References

For language-specific initialization code, use the references:

- Node.js: [references/sdk-init-node.md](references/sdk-init-node.md)
- Python: [references/sdk-init-python.md](references/sdk-init-python.md)
- Java: [references/sdk-init-java.md](references/sdk-init-java.md)
- .NET: [references/sdk-init-dotnet.md](references/sdk-init-dotnet.md)

If language is unknown, ask first. The SDKs handle token refresh automatically.

## Key Concepts

**`@sinch/sdk-core`** — Unified Node.js SDK covering all project-scoped and application-scoped Sinch APIs. Individual packages (e.g., `@sinch/voice`, `@sinch/verification`) are also available.

**`sinch` (Python)** — Python SDK (v2.0.0+) covering project-scoped and application-scoped APIs.

**`sinch-sdk-java`** — Java SDK (v2.0.0+) via Maven Central.

**Project-scoped init** — Uses `projectId`, `keyId`, `keySecret`. For Conversation, Numbers, Fax, EST, 10DLC, Number Lookup, Provisioning.

**Application-scoped init** — Uses `applicationKey`, `applicationSecret`. For Voice, Verification, In-App Calling.

**Multi-product client** — Provide both project and application credentials in a single `SinchClient` to access all APIs.

**Conversation region** — Must be set explicitly when using the Conversation API. Values: `us`, `eu`, `br`. Required in Python SDK v2.0.0+ and Java SDK v2.0.0+; recommended in Node.js and .NET.

## Common Patterns

- **Project-scoped quick start** — Init `SinchClient` with project credentials. See language-specific ref.
- **Application-scoped quick start** — Init `SinchClient` with app key/secret. See language-specific ref.
- **Multi-product client** — Pass both credential sets to a single client instance.
- **Regional Conversation API** — Set `conversationRegion` during init (required in Python/Java, recommended elsewhere).

## Gotchas

- **Not all products are available in all SDKs** — Check the Product Coverage table before recommending an SDK. For unsupported products, use direct HTTP calls.
- **Conversation region is required** — Python and Java SDKs fail at runtime without `conversation_region`. Node.js and .NET don't enforce it yet but should set it explicitly.
- **Voice/Verification use application credentials** — These are a separate credential set from project Access Keys.
- **SDKs auto-refresh OAuth2 tokens** — No need to manually handle token expiry when using SDKs.

## Links

- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core)
- [PyPI: sinch](https://pypi.org/project/sinch/)
- [Maven: sinch-sdk-java](https://central.sonatype.com/artifact/com.sinch.sdk/sinch-sdk-java)
- [NuGet: Sinch](https://www.nuget.org/packages/Sinch)
- [Sinch Developer Docs](https://developers.sinch.com)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
