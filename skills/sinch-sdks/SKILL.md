---
name: sinch-sdks
description: "Sinch SDK installation and client initialization for Node.js, Python, Java, and .NET. Use when installing a Sinch SDK, initializing SinchClient, setting up SDK credentials, configuring conversation or SMS region in SDK, configuring SDK retries, checking which products an SDK version supports, or building a multi-product SDK client. For In-App Calling SDKs, see sinch-in-app-calling."
metadata:
  author: Sinch
  version: 1.3.0
  category: Core
  tags: sdk, node, python, java, dotnet, sinch-client, installation
  uses:
      - sinch-authentication
---

# Sinch SDKs

## Overview

Cross-cutting skill that covers SDK installation and client initialization for all Sinch products. Determines the correct SDK and provides init code per language.

For authentication setup (credentials, OAuth2, Basic auth, signed requests), see `sinch-authentication`. For In-App Calling SDKs (Browser, iOS, Android), see `sinch-in-app-calling`.

## Agent Instructions

> **Policy gate `sinch-shared-policy@7` (`sha256:587240ed6627`):** The policy digest below is binding as written. Before implementation or live execution, read [the full shared Sinch policy](references/shared-policy.md) once per conversation — skip it if this exact ID/version/fingerprint is already loaded; read it if the version is newer or the fingerprint differs. This skill's canonical operation routes live in its Agent Instructions and Links sections.

<!-- sinch-policy-digest: start (generated; edit docs/SINCH_SHARED_POLICY.md and run scripts/sync_sinch_skill_references.py) -->
**Sinch policy digest (binding):**

1. Load the shared policy once per conversation; skip duplicate copies bearing the same ID/version/fingerprint.
2. Infer product, language, region, and environment from the request and workspace; ask one combined question only for true blockers. Prefer the official Sinch SDK unless the request or workspace decides otherwise or no official SDK covers the language or operation.
3. Code-generation approval is not execution approval. Classify every operation (read-only / reversible / billable / destructive) and obtain explicit approval before billable or destructive calls.
4. Tier B facts — endpoint paths, methods, field names, enums, limits, webhook payloads, signature algorithms, SDK signatures — require fetching the exact canonical document in the current session before use.
5. Bundled scripts, references, and examples are Tier C: illustrations, never schema authority. Never promote example values to production defaults.
6. If a route is unresolved or a canonical fetch fails, climb the resolution ladder in order — re-search already-fetched documents (raw, not summarized), consult https://developers.sinch.com/llms.txt, follow first-party links, retry once — before failing closed. Never pattern-guess a documentation URL. Base every fact on a fetched canonical document, not on recall, search snippets, or bundled files.
7. Keep an evidence ledger mapping each fetched source to the fields and claims it authorized.
8. Bound all polling and retries (backoff, jitter, hard cap); check state before retrying billable or destructive operations; report a timeout as unknown, not failed.
9. Report verification levels separately (lint → unit → mock contract → sandbox → live → end-to-end); an HTTP 2xx does not prove delivery. State the levels not performed.
10. Load only the smallest skill set that owns the behavior; if a required skill is unavailable, name it and stop rather than improvising its instructions.
11. Do the work yourself when a Sinch API, SDK, or CLI command can do it. Before telling the user to do a step in the dashboard, check the canonical docs and the CLI for a way to automate it; for one-off setup that the code under construction does not depend on, the CLI is enough when it is installed and logged in; hand a step to the user only when no API or CLI covers it, it needs their identity, a secret only they can see, or their legal acceptance, or they asked to do it themselves.
<!-- sinch-policy-digest: end -->

If the user hasn't specified which language or platform, ask first — the SDK and init pattern differ by language. Use the table below to route to the correct reference.

## Source of Truth — what to load, and what is authoritative

This skill has two kinds of content with UNEQUAL reliability. Follow this precedence:

1. **Canonical docs at `developers.sinch.com` (AUTHORITATIVE).** The `.md` doc links in
   this skill are the single source of truth for exact request/response schemas, field
   names and nesting, enum values, signature/auth schemes, and limits. Before writing
   code that constructs a payload, verifies a signature, or parses a callback/response,
   fetch the specific linked doc and confirm the exact shape there. Fetching first-party
   `developers.sinch.com` URLs is permitted by the Security/URL policy. Never invent, guess, or pattern-extrapolate a documentation URL — only fetch doc URLs written verbatim in this skill or reached by following a link on a page you already fetched; a trusted domain does not make a guessed path real.
2. **Bundled `references/*.md` (NAVIGATIONAL SUMMARIES — not authoritative).** They orient
   you and point at the right canonical doc; they may lag, omit fields, or simplify
   nesting. Use them to decide what to build and which doc to open. Do NOT transcribe a
   field name, nesting, encoding, or enum from a reference or from the SKILL.md overview
   into shipped code without confirming it in the tier-1 doc. If a detail appears only in
   a summary, treat it as unverified and say so.

Quick rule: **writing code → load the doc.** Never cite an exact field, header, enum, or
encoding you only saw in a summary.

## SDK Installation

| Language | Package | Install | Latest (as of 2026-11-05) | Runtime |
|----------|---------|---------|---------------------------|---------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` | 1.8.0 | Node.js 18, 20, 22 |
| Python | `sinch` | `pip install sinch` | 2.4.0 | Python 3.9–3.14 |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency | 2.4.0 | Java 8, 11, 17, 21, 25 |
| .NET | `Sinch` | `dotnet add package Sinch` | 1.5.1 | .NET 6, 7, 8 |

Versions move often — check the registry (Links) for the current release before pinning one. All four SDKs are **server-side only**; never ship them in browser, mobile, or desktop clients, as that exposes your credentials.

In-App Calling uses a **separate client-side SDK** — not `@sinch/sdk-core`. See `sinch-in-app-calling`.

## Product Coverage by SDK

Not all products are available in all SDKs. Check the table before recommending an SDK for a specific product.

| Product | Node.js | Java | .NET | Python |
|---------|---------|------|------|--------|
| Conversation API | ✅ | ✅ | ⚠ | ✅ (2.4.0+) |
| SMS API (end-of-sale since 15 April 2026) | ✅ | ✅ | ✅ | ✅ |
| Voice API v2 (public preview) | ✅ (1.6.0+) | ✅ (2.3.0+) | ❌ | ✅ (2.2.0+) |
| Voice API v1 | ✅ | ✅ | ✅ | ❌ (removed in 2.0.0) |
| Verification API | ✅ | ✅ | ✅ | ❌ (removed in 2.0.0) |
| Numbers API | ✅ | ✅ | ✅ | ✅ |
| Number Lookup API v2 | ✅ (1.4.0+) | ✅ (2.1.0+) | ❌ | ✅ (2.0.0+) |
| Elastic SIP Trunking | ⚠ deprecated (1.6.0) | ❌ | ❌ | ❌ |
| Fax API | ✅ | ❌ | ⚠ | ❌ |
| Provisioning API | ⚠ webhooks + RCS account activities only (1.6.0+) | ❌ | ❌ | ❌ |
| 10DLC Registration | ❌ | ❌ | ❌ | ❌ |

✅ = supported, ⚠ = partial, preview, or deprecated, ❌ = not available (use direct HTTP). A version in brackets is the first SDK release with that support; older releases lack it.

*(Summary of the SDK READMEs and release notes as of 2026-11-05 — confirm against the SDK's own README "Supported APIs" section or its changelog before telling a user a product is or isn't covered.)*

Voice API v1 and v2 are separate APIs, and new voice projects default to v2 (see the `sinch-voice-api-v2` skill). Python SDK 2.0 and later do not include Voice API v1. *(Summary only — confirm versions in the [Voice API support by SDK version](https://developers.sinch.com/docs/sdks.md) table before installing or upgrading.)*

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

**`sinch` (Python)** — Python SDK (v2.0.0+), synchronous client only, Pydantic v2. Since 2.0.0 it covers project-scoped APIs only: Voice API v1 and Verification were removed, and Voice API v2 returned in 2.2.0 on project credentials.

**`sinch-sdk-java`** — Java SDK (v2.0.0+) via Maven Central. Voice API v2 is under `client.voice().v2()` (2.3.0+).

**Project-scoped init** — Uses `projectId`, `keyId`, `keySecret`. For Conversation, Numbers, **Voice API v2**, Fax, EST, Number Lookup, Provisioning, and SMS in the `us`/`eu` regions.

**Application-scoped init** — Uses `applicationKey`, `applicationSecret`. For Voice API **v1**, Verification, In-App Calling. Voice API v2 does not use application credentials.

**SMS service plan init** — `servicePlanId` + API token, with an SMS region. Required for SMS outside `us`/`eu`, and for projects created after the SMS API end-of-sale (2026-04-15), where project access keys return `401`.

**Multi-product client** — Provide both project and application credentials in a single `SinchClient` to access all APIs.

**Conversation region** — Must be set explicitly when using the Conversation API. Values: `us`, `eu`, `br`. All four SDK READMEs now document it as required; Python and Java v2.0.0+ fail at runtime without it.

**SMS region** — `us`, `eu`, `au`, `br`, `ca`. Required for the SMS API; when one client uses both SMS and Conversation, set both to the same region.

**HTTP 429 retries** — Node.js (1.6.0+), Python (2.2.0+), and Java (2.2.0+) retry rate-limited calls and token fetches automatically: policy `DEFAULT` (honor `Retry-After`, else backoff), `RETRY_AFTER`, `BACKOFF`, or `NONE`; 3 retries by default. Set `NONE` when an outer layer already retries, so retries don't multiply. *(Summary only — confirm exact names/encoding/enums against the authoritative [Sinch Developer Docs](https://developers.sinch.com) doc before implementing.)*

## Common Patterns

- **Project-scoped quick start** — Init `SinchClient` with project credentials. See language-specific ref.
- **Application-scoped quick start** — Init `SinchClient` with app key/secret. See language-specific ref.
- **Multi-product client** — Pass both credential sets to a single client instance.
- **Regional Conversation API** — Set `conversationRegion` during init in every SDK.
- **Voice API v2** — Project-credential client; methods on `sinch.voice.v2` (Node.js), `sinch_client.voice.v2` (Python), `client.voice().v2()` (Java). Load `sinch-voice-api-v2` for the API itself.
- **Retry tuning** — Configure the retry policy on the client (see the language reference), not with an outer retry loop.

## Gotchas

- **Not all products are available in all SDKs** — Check the Product Coverage table before recommending an SDK. For unsupported products, use direct HTTP calls.
- **Conversation region is required** — Python and Java SDKs fail at runtime without `conversation_region`. Set it explicitly in Node.js and .NET too.
- **Voice v1 and Verification use application credentials; Voice v2 does not** — v2 uses project Access Keys. Don't give a Voice v2 client an application key/secret.
- **Python SDK 2.x has no Voice v1 or Verification** — Pin `sinch<2` only to maintain an existing integration; otherwise use direct HTTP for Verification, or Voice API v2.
- **Elastic SIP Trunking is deprecated in the Node.js SDK** (1.6.0) and will be removed in SDK v2 — prefer direct HTTP for new EST code.
- **SMS API is end-of-sale** — Prefer the Conversation API for new integrations. Projects created after 2026-04-15 must use service plan credentials for SMS.
- **Breaking changes in minor releases** — e.g. Node.js 1.5.0 stopped re-exporting `@sinch/sdk-client` from domain packages (import from `@sinch/sdk-core`), Node.js 1.7.0 and Python 2.3.0 renamed Voice v2 `onFail`/`on_fail` to `onFailure`/`on_failure`, Node.js 1.8.0 changed the Fax `coverPages.list()` type. Read the release notes when upgrading.
- **SDKs auto-refresh OAuth2 tokens** — No need to manually handle token expiry when using SDKs.

## Links

- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core)
- [PyPI: sinch](https://pypi.org/project/sinch/)
- [Maven: sinch-sdk-java](https://central.sonatype.com/artifact/com.sinch.sdk/sinch-sdk-java)
- [NuGet: Sinch](https://www.nuget.org/packages/Sinch)
- Release notes: [Node.js](https://github.com/sinch/sinch-sdk-node/releases), [Python](https://github.com/sinch/sinch-sdk-python/releases), [Java](https://github.com/sinch/sinch-sdk-java/releases), [.NET](https://github.com/sinch/sinch-sdk-dotnet/releases)
- [Sinch Developer Docs](https://developers.sinch.com)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
