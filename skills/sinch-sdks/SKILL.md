---
name: sinch-sdks
description: "Sinch SDK installation and client initialization for Node.js, Python, Java, and .NET. Use when installing a Sinch SDK, initializing SinchClient, setting up SDK credentials, configuring conversation region in SDK, or building a multi-product SDK client. For In-App Calling SDKs, see sinch-in-app-calling."
metadata:
  author: Sinch
  version: 1.2.0
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

> **Policy gate `sinch-shared-policy@5` (`sha256:4864cf0fa8d6`):** The policy digest below is binding as written. Before implementation or live execution, read [the full shared Sinch policy](references/shared-policy.md) once per conversation — skip it if this exact ID/version/fingerprint is already loaded; read it if the version is newer or the fingerprint differs. This skill's canonical operation routes live in its Agent Instructions and Links sections.

<!-- sinch-policy-digest: start (generated; edit docs/SINCH_SHARED_POLICY.md and run scripts/sync_sinch_skill_references.py) -->
**Sinch policy digest (binding):**

1. Load the shared policy once per conversation; skip duplicate copies bearing the same ID/version/fingerprint.
2. Infer product, language, region, and environment from the request and workspace; ask one combined question only for true blockers. Prefer the official Sinch SDK unless the request or workspace decides otherwise or no official SDK covers the language or operation.
3. Code-generation approval is not execution approval. Classify every operation (read-only / reversible / billable / destructive) and obtain explicit approval before billable or destructive calls.
4. Tier B facts — endpoint paths, methods, field names, enums, limits, webhook payloads, signature algorithms, SDK signatures — require fetching the exact canonical document in the current session before use.
5. Bundled scripts, references, and examples are Tier C: illustrations, never schema authority. Never promote example values to production defaults.
6. If a route is unresolved or a canonical fetch fails, climb the resolution ladder in order — re-search already-fetched documents (raw, not summarized), consult https://developers.sinch.com/llms.txt, follow first-party links, retry once — before failing closed. Never pattern-guess a documentation URL; never substitute memory, search snippets, or bundled files.
7. Keep an evidence ledger mapping each fetched source to the fields and claims it authorized.
8. Bound all polling and retries (backoff, jitter, hard cap); check state before retrying billable or destructive operations; report a timeout as unknown, not failed.
9. Report verification levels separately (lint → unit → mock contract → sandbox → live → end-to-end); an HTTP 2xx does not prove delivery. State the levels not performed.
10. Load only the smallest skill set that owns the behavior; if a required skill is unavailable, name it and stop rather than improvising its instructions.
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

| Language | Package | Install | Auth Scope |
|----------|---------|---------|------------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` | Project + Application |
| Python | `sinch` | `pip install sinch` | Project + Application |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency | Project + Application |
| .NET | `Sinch` | NuGet package | Project + Application |

In-App Calling uses a **separate client-side SDK** — not `@sinch/sdk-core`. See `sinch-in-app-calling`.

## Product Coverage by SDK

Not all products are available in all SDKs. Check the table before recommending an SDK for a specific product.

| Product | Node.js | Java | .NET | Python |
|---------|---------|------|------|--------|
| Conversation API | ✅ | ✅ | ⚠ | ⚠ |
| Voice API | ✅ | ✅ | ✅ | ✅ |
| Verification API | ✅ | ✅ | ✅ | ✅ |
| Numbers API | ✅ | ✅ | ✅ | ✅ |
| Number Lookup API | ✅ | ❌ | ❌ | ✅ |
| Elastic SIP Trunking | ✅ | ❌ | ❌ | ❌ |
| Fax API | ✅ | ❌ | ⚠ | ❌ |
| Provisioning API | ✅ | ❌ | ❌ | ❌ |
| 10DLC Registration | ❌ | ❌ | ❌ | ❌ |

✅ = supported, ⚠ = partial/preview, ❌ = not available (use direct HTTP)

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

**Conversation region** — Must be set explicitly when using the Conversation API. Values: `us`, `eu`, `br`. Required in Python SDK v2.0.0+ and Java SDK v2.0.0+; recommended in Node.js and .NET. *(Summary only — confirm exact names/encoding/enums against the authoritative [Sinch Developer Docs](https://developers.sinch.com) doc before implementing.)*

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
