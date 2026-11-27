# Changelog

All notable changes to this project will be documented in this file. Individual skills have their own versions in metadata.

## 2026-11-27

### Added

- `sinch-get-started` v1.0.0 — Entry point for connecting an AI agent to Sinch. Installs the Sinch CLI, the Sinch skills, and the Sinch Docs MCP server (`https://developers.sinch.com/mcp`), asking first whether to install per project or globally. Then creates an access key kept out of chat, runs a read-only credential check, and routes to the right product skill. Host files under `references/hosts/` give the exact steps for Claude Code, Cursor, Gemini CLI, Antigravity CLI, OpenAI Codex, and chat apps (Claude, ChatGPT, Gemini, Grok, Lovable). Non-developers get a lighter path without CLI or MCP jargon. Users without an account are handed to `sinch-onboarding`.
- `sinch-onboarding` v1.0.0 — Guided onboarding from free trial to a live SMS sender, phase by phase with checkpoints. Agent entry files for Claude Code, Lovable, and ChatGPT (where the user runs the code locally); region guides for the US and global SMS.
- `sinch-conversation-api` v2.2.0 — New reference files for the optional per-app add-ons: Consent Management (opt-in/opt-out keywords, consent lists, Primary/Secondary modes) and Smart Conversations (sentiment, NLU intents, image comprehension, PII masking, offensive content, speech-to-text, redaction). Corrected the opt-in/opt-out and Smart Conversations webhook trigger references to match the real callbacks.

### Changed

- Voice API v2 is now the default for new voice projects, following the Voice API v2 [AI best practices](https://developers.sinch.com/docs/voice-2.0/ai-support.md). Use v1 only for existing v1 code or when a project strictly requires a GA API, conferencing, or In-App voice.
  - `sinch-voice-api-v2` v0.4.0 — "Choosing between v1 and v2" section; SDK support (Node.js 1.6.0+, Python 2.2.0+, Java 2.3.0+; no .NET) with method namespaces and SVAML helper classes; Sinch Functions and CLI hosting option; links to the AMD, call pacing, and number masking pages.
  - `sinch-voice-api` v1.4.0 — Scoped to existing v1 integrations and strict GA, conferencing, or In-App needs. Python is no longer listed as an SDK option.
  - `sinch-authentication` v1.4.0 — Voice API v2 listed with the project-scoped (Access Key, OAuth2) APIs; application-key auth scoped to Voice API v1.
  - `AGENTS.md`, `CLAUDE.md`, `README.md` — Routing updated to match.
- `sinch-sdks` v1.3.0 — Synced with the latest SDK releases (Node.js 1.8.0, Python 2.4.0, Java 2.4.0, .NET 1.5.1). Rebuilt the product coverage table with SMS and Voice API v2 rows and minimum versions per cell. Documents the Python 2.x removal of Voice API v1 and Verification, the Elastic SIP Trunking deprecation in Node.js, retry and client options, and links to each SDK's release notes.
- `sinch-cli` v1.3.0 — Updated for CLI 0.9.1: Node.js 24+, browser login (preview), `sinch login`/`sinch logout` shortcuts, `--profile` on every command, `--json` and `--force` behavior, exit codes for scripts, CI/CD environment-variable auth, opt-in auto-update, and Functions `versions`/`rollback`.
- `sinch-functions` v1.3.0, `sinch-functions-node` v1.3.0, `sinch-functions-dotnet` v1.3.0 — Deploys now set `VOICE_SERVICE_SECRET`, so voice webhook signatures are verified on deployed functions. `sinch-functions` explains how secrets reach a deploy and that a deploy drops any secret not declared in `.env` or `appsettings.json`.
- `sinch-verification-api` v1.3.0 — Python is no longer listed as an SDK option (removed in Python SDK 2.0.0).
- `sinch-number-lookup-api` v1.3.0 — Java (2.1.0+) added as an SDK option.
- `sinch-provisioning-api` v1.3.0 — Documents partial Node.js SDK coverage (Webhooks API, RCS account activities).
- `sinch-elastic-sip-trunking` v1.3.0 — EST support in the Node.js SDK is deprecated since 1.6.0; direct HTTP is recommended for new code.
- Shared policy `sinch-shared-policy@7` — New rule: when a Sinch API, SDK, or CLI command can do a step, the agent does it rather than sending the user to the dashboard. Three rules that security scanners misread were reworded without changing their meaning. Applied to every skill; skills whose only change is the policy are bumped to the next minor version (`sinch-10dlc` and `sinch-numbers-api` v1.4.0; `sinch-fax-api`, `sinch-imported-numbers-hosting-orders`, `sinch-in-app-calling`, `sinch-mailgun`, `sinch-mailgun-inspect`, `sinch-mailgun-optimize`, `sinch-mailgun-validate`, `sinch-mms`, `sinch-number-order-api`, `sinch-porting-api`, `sinch-rcs`, `sinch-sms`, `sinch-whatsapp` v1.3.0). `sinch-sms` and `sinch-conversation-api` now say to list or create Conversation API apps through the API.
- `sinch-sms`, `sinch-mailgun`, `sinch-fax-api`, `sinch-conversation-api`, `sinch-voice-api-v2` — Reworded untrusted-input warnings that scanners flagged as prompt injection.
- `tile.json` — Added `sinch-get-started`, `sinch-onboarding`, and `sinch-voice-api-v2`.

## 2026-09-23

### Changed

- `sinch-functions-dotnet` v1.2.0 — Rewritten for the `Sinch.Functions.Runtime` 0.3.17 author API and rebalanced across all bundled products, not just voice. Voice handlers are now `OnIncoming(Call, CommandBuilder)`, `OnMenu`, `OnWebhook`, `OnCompleted` and `OnOther` overrides that return the injected builder as a `CallFlow`, replacing the removed `Handlers`/`CallHandlers`/`Plan` surface; the v1 callbacks are now optional overrides, and `AgentController` replaces the nonexistent `ElevenLabsController`. Added the `Dial*` connect helpers, `AddOption` menus, live-call transfers, realtime AI voice agents (`AddRealtimeAgent`, `RealtimeAgent`, `[AgentTool]`), `ADMIN_USER`/`ADMIN_PASSWORD` sign-in for `[Authorize]` and its fail-closed behaviour, and the `Context.Voice.RawAsync` escape hatch. Removed the Voice v1 (legacy) sections, the ICE/ACE/PIE/DICE tables, and the SVAML v1 builder samples. Replaced `references/svaml-builders.md` with a short `references/voice.md` (~80 lines): the event→override→builder model, the live-leg rule, the handler/event table, non-obvious behaviours (AMD, `Say`+`Hangup` timing, the Voice Relay provider spelling), and two worked examples — no `CommandBuilder` method catalogue; SKILL.md now points to the NuGet package's XML docs (IntelliSense) and the C# runtime guide for the full method set instead. Trimmed `references/context-services.md` to cache/storage/database only, and fixed `references/conversation.md`'s override table (`MessageDeliveryReceiptEvent`, not `MessageDeliveryEvent`; `InboundEvent`, not `EventInboundEvent`) while trimming it to the functions-specific glue. The bundled-SDK section now states the pre-authenticated `Sinch` NuGet package as a headline fact, lists all five products `FunctionContext` pre-wires (including `Verification`, missing from a prior pass), and shows constructing `new SinchClient(...)` directly for any product with no dedicated context property, verified against `Core/SinchClientFactory.cs` in the 0.3.17 sources and a `dotnet build`.
- `sinch-functions-node` v1.2.0 — Rewritten for the `@sinch/functions-runtime` 0.6.0 author API and rebalanced across all bundled products, not just voice. Voice handlers now receive the call flattened (`call.from`, `call.callId`) and typed per slot, plus an injected `CommandBuilder`, replacing the `commands()`/nested-`event.call` shape; `call.call` still compiles but is deprecated. Added the `dialPhone`/`dialSip`/`dialStream`/`dialRelay`/`dialAgent` connect helpers and their standalone factories (moved to the primary `@sinch/functions-runtime/voice` subpath), the `option()`/`match()` menu split, live-call `transferTo*`, `connectAgent`/`voiceRelay`/`realtimeAgent` (providers `openai`/`grok`/`gemini`/`deepgram`/`voice-relay` — the last renamed from `'relay'`, no alias), `ADMIN_USER`/`ADMIN_PASSWORD` sign-in, the built-in `/login` page, fail-closed auth, and the `context.voice.raw` escape hatch. Removed the Voice v1 (legacy) sections, the ICE/ACE/PIE/DICE tables, and the SVAML v1 builder samples. Replaced `references/svaml-builders.md` with a short `references/voice.md` (~85 lines): the event→handler→builder model, the live-leg rule, the handler/event table, non-obvious behaviours, and two worked examples — no `CommandBuilder` method catalogue; SKILL.md now points to the `.d.ts` JSDoc under `node_modules/@sinch/functions-runtime/dist` and the Node.js runtime guide for the full method set instead. Trimmed `references/context-services.md` to cache/storage/database only, and typed `references/conversation.md`'s handler example (`MessageInboundEvent`) and documented its full event-helper and reply-helper surface. The bundled-SDK section states the pre-authenticated `@sinch/sdk-core` SDK as a headline fact and shows constructing `new SinchClient(...)` directly (already resolvable, no extra dependency) for any product `context` doesn't pre-wire, verified against `packages/runtime-shared/src/sinch/index.ts` in the 0.6.0 sources and a strict `tsc` typecheck.
- `sinch-functions` v1.2.0 — Rebalanced to present the platform for all bundled products (voice, conversation/messaging, SMS, numbers, cache/storage/database), not primarily voice: the "Bundled Sinch SDK" section is now a short pointer to `sinch-sdks` and the product skills instead of a per-product code sample. Node.js examples and the lifecycle table use the flattened `call` and injected `CommandBuilder`; C# examples use the 0.3.17 `On*` overrides. Removed the Voice v1 (legacy) sections. Documented the Functions-only raw voice API escape hatch next to the `sinch-voice-api-v2` pointer. Added `sinch-voice-api-v2` to `metadata.uses` on all three functions skills and `sinch-conversation-api` to `sinch-functions`; removed `sinch-cli` from all three functions skills' `metadata.uses` per the shared policy's Skill Routing section — it is a run/deploy destination, not a dependency of the skill's own workflow.
- `sinch-cli` v1.2.0 — Removed the Gotchas bullet claiming Voice commands need an Application Key/Secret from `sinch auth login`, which contradicted the Getting Started section.

## 2026-09-22

### Fixed

- `sinch-elastic-sip-trunking` v1.2.1 — Follow-up from the EST-4041 live-API review, limited to facts re-checked against the published OpenAPI spec:
  - Endpoint `priority: 100` removed as a failover example. Schema only documents `minimum: 1` (example `1`); routing above that is unconfirmed, so failover examples should use a small integer such as `2`.
  - Documented link-collection semantics: POST appends and the `200` echoes only the IDs just sent; credential-list PUT replaces the whole set; ACLs have no bulk-replace (use DELETE).
  - Phone-number assign can return `201` for a number the project does not own — verify with GET after assign.
  - `diagnostics.md` gained an HTTP 4xx section for the ACL body, password policy, delete guards, the missing phone-numbers path, and `CREDENTIAL_NOT_FOUND`.
  - Teardown gotcha corrected: out-of-order deletes are rejected with `400`, they do not orphan resources.

## 2026-09-14

### Changed

- `sinch-cli` v1.1.0, `sinch-functions` v1.1.0, `sinch-functions-node` v1.1.0, `sinch-functions-dotnet` v1.1.0 — Adopted the shared-policy pattern used by every other skill: generated policy gate and digest under Agent Instructions plus a bundled `references/shared-policy.md`. Removed the dependency on the non-existent `sinch-voice-api-v2` skill; Voice API 2.0 is now referenced by its documentation URL. Replaced cross-skill relative links with plain skill names so each skill is standalone. `sinch-cli` also gained a Security section.
- `sinch-authentication` v1.3.0, `sinch-10dlc` v1.3.0, `sinch-numbers-api` v1.3.0, `sinch-voice-api` v1.3.0, `sinch-conversation-api` v2.1.0, `sinch-elastic-sip-trunking` v1.2.0, `sinch-fax-api` v1.2.0, `sinch-imported-numbers-hosting-orders` v1.2.0, `sinch-in-app-calling` v1.2.0, `sinch-mailgun` v1.2.0, `sinch-mailgun-inspect` v1.2.0, `sinch-mailgun-optimize` v1.2.0, `sinch-mailgun-validate` v1.2.0, `sinch-mms` v1.2.0, `sinch-number-lookup-api` v1.2.0, `sinch-number-order-api` v1.2.0, `sinch-porting-api` v1.2.0, `sinch-provisioning-api` v1.2.0, `sinch-rcs` v1.2.0, `sinch-sdks` v1.2.0, `sinch-sms` v1.2.0, `sinch-verification-api` v1.2.0, `sinch-whatsapp` v1.2.0 — Version bump for the shared-policy rollout merged after the 2026-09-11 GitHub release: Agent Instructions now carry the `sinch-shared-policy@5` gate and digest, bundled references and scripts use the unified "not a schema" and execution-tool framing, cross-skill links were replaced with plain skill names, and follow-up fixes landed for OAuth2 token acquisition, HMAC webhook validation, project-scoped webhook registration, Mailgun infrastructure endpoints, and the Voice API v1 version scope.

### Fixed

- `scripts/validate_sinch_skills.py` — Skill-count tripwire raised from 23 to 27 to include the Functions and CLI skills.

## 2026-09-05

### Fixed

- `sinch-elastic-sip-trunking` v1.1.1 — Corrected four API details that were wrong or missing, all verified against the live EST API:
  - Create-trunk response field is `id`, not `sipTrunkId`; documented the returned `domain` and the `id`/`sipTrunkId` naming difference between the trunk response and the endpoint request body
  - ACL `ipRanges` take `{ipAddress, range}` objects with an integer prefix length, not CIDR strings; `enabled` is required
  - Replaced `GET /trunks/{trunkId}/phoneNumbers` (returns 404 — endpoint does not exist) with `GET /projects/{projectId}/phoneNumbers` in Workflows B/C/D and the diagnostics checklist
  - Workflow D was missing the step linking the credential list to the trunk; without it the registered endpoint is still created with `201` and every REGISTER then fails with `401`. Added the step, the verification, and a matching 401 troubleshooting entry. Also documented the credential password policy.

## 2026-09-03

### Added

- `sinch-cli` v1.0.0 — New skill covering the full Sinch CLI (`@sinch/cli`, binary `sinch`): auth, config profiles, `functions` lifecycle (`init`/`dev`/`deploy`/`logs`/`status`/`db`/`storage`), `voice`, `numbers`, `porting`, `conversation`, `fax`, `sip`, `secrets`, `templates`, and shell completions. Ships with reference files for voice, numbers-and-porting, and conversation-fax-sip.
- `sinch-functions` v1.0.0 — New skill for the Sinch Functions serverless platform (beta): runtime choice (Node.js vs C#), install/auth, `FunctionContext` overview, voice callback lifecycle (ICE/ACE/PIE/DICE), SVAML basics, and cross-links to the runtime-specific skills.
- `sinch-functions-node` v1.0.0 — New skill for the Node.js/TypeScript runtime (`@sinch/functions-runtime`): `VoiceFunction` default export, `IceSvamlBuilder`/`AceSvamlBuilder`/`PieSvamlBuilder`, `MenuTemplates`/`createMenu`, `ConversationController`, custom HTTP endpoints, Basic Auth via `export const auth`, and `setup()` hooks. Ships with reference files for context services, SVAML builders, and conversation webhooks.
- `sinch-functions-dotnet` v1.0.0 — New skill for the C#/.NET runtime (`Sinch.Functions.Runtime`, `.NET 10`): `SinchVoiceController`/`SinchConversationController`/`SinchController`/`ElevenLabsController`, `Instructions.* → Action.* → Build()` builder chain, `ISinchFunctionInit` DI, and `[Authorize]` protection. Ships with reference files for context services, SVAML builders, and conversation webhooks.

## 2026-07-13

### Added

- `sinch-sms` v1.0.0 — New skill for the SMS channel of the Conversation API (sender IDs, encoding, message parts, opt-out handling). Extracted from `sinch-conversation-api`; includes the `send_sms.cjs` script.
- `sinch-mms` v1.0.0 — New skill for the MMS channel of the Conversation API (media types, size limits, transcoding). Extracted from `sinch-conversation-api`.
- `sinch-rcs` v1.0.0 — New skill for the RCS channel of the Conversation API (rich cards, carousels, suggested actions, capability check, SMS fallback). Extracted from `sinch-conversation-api`; includes the RCS send scripts.
- `sinch-whatsapp` v1.0.0 — New skill for the WhatsApp channel of the Conversation API (24-hour window, templates, opt-in rules, media specs). Extracted from `sinch-conversation-api`.

### Changed

- `sinch-conversation-api` v2.0.0 — Restructured to cover the API layer only (apps, contacts, conversations, message types, webhooks, templates, batch sending). Channel-specific references and send scripts moved to the new `sinch-sms`, `sinch-mms`, `sinch-rcs`, and `sinch-whatsapp` skills.

## 2026-04-20

### Changed

- `sinch-10dlc` v1.1.1 — Added environment variable instructions; switched curl placeholders to shell variables; improved Key Concepts formatting
- `sinch-fax-api` v1.0.2 — Added environment variable instructions; switched curl placeholders to shell variables; improved Key Concepts formatting
- `sinch-in-app-calling` v1.0.2 — Clarified Phone-to-App/SIP-to-App backend reference; improved Key Concepts formatting
- `sinch-mailgun-validate` v1.0.2 — Added environment variable instructions; switched curl placeholders to shell variables
- `sinch-number-lookup-api` v1.0.3 — Added environment variable instructions; switched curl placeholders to shell variables
- `sinch-number-order-api` v1.0.2 — Added environment variable instructions; switched curl placeholders to shell variables
- `sinch-numbers-api` v1.1.1 — Improved Key Concepts formatting
- `sinch-porting-api` v1.0.1 — Added environment variable instructions; switched curl placeholders to shell variables
- `sinch-voice-api` v1.1.1 — Fixed doc links to use `.md` extensions for AI agent consumption

## 2026-04-17

### Added

- `sinch-porting-api` v1.0.0 — New skill for porting phone numbers from other carriers into Sinch
- `sinch-sdks` v1.0.0 — New skill for SDK installation and client initialization (Node.js, Python, Java, .NET)
- `.gitignore` file
- Java SDK examples for Voice API

### Changed

- `sinch-10dlc` v1.1.0 — Streamlined authentication instructions; updated description, tags, and metadata
- `sinch-authentication` v1.1.0 — Clarified auth methods; added metadata with category and tags
- `sinch-conversation-api` v1.1.0 — Streamlined SKILL.md; added metadata with category, tags, and usage references
- `sinch-elastic-sip-trunking` v1.0.1 — Added metadata; referenced sinch-sdks skill for SDK setup
- `sinch-fax-api` v1.0.1 — Fixed category from Messaging to Voice; added metadata
- `sinch-imported-numbers-hosting-orders` v1.0.1 — Added metadata; standardized credential placeholders
- `sinch-in-app-calling` v1.0.1 — Added Key Concepts section; referenced sinch-authentication for credential setup
- `sinch-mailgun` v1.0.1 — Enhanced documentation; added metadata with category and tags
- `sinch-mailgun-inspect` v1.0.2 — Added metadata; standardized credential placeholders
- `sinch-mailgun-optimize` v1.0.1 — Enhanced documentation; added metadata with category and tags
- `sinch-mailgun-validate` v1.0.1 — Added metadata; improved security guidance for URL handling; standardized credential placeholders
- `sinch-number-lookup-api` v1.0.2 — Simplified SKILL.md; added `sinch-sdks` usage reference; added metadata
- `sinch-number-order-api` v1.0.1 — Enhanced documentation; added metadata with category and tags
- `sinch-numbers-api` v1.1.0 — Updated Python and Java reference examples; added metadata with category and tags
- `sinch-provisioning-api` v1.0.1 — Added metadata with category, tags, and skill references
- `sinch-verification-api` v1.0.1 — Added metadata; consolidated SDK references to sinch-sdks skill
- `sinch-voice-api` v1.1.0 — Updated Java reference examples; enhanced documentation; added metadata
- `README.md` — Removed duplicate `sinch-authentication` row; added `sinch-porting-api`; updated descriptions
- Updated SDK init references across Node.js, Python, Java, and .NET for latest SDK versions
- Enhanced metadata (category, tags, uses) across all skills

### Fixed

- Addressed Snyk security scan warnings across all skills (credential placeholder standardization, URL trust boundaries)
- Removed redundant SDK installation tables from skills that now reference sinch-sdks

## 2026-04-01

### Changed

- Added Sinch usage disclaimer to README
- Synced skills from internal GitLab repository

## 2026-03-30

### Fixed

- Fixed Node.js SDK init reference

## 2026-03-27

### Added

- Skills 1.0.0 public release with initial set of skills

### Changed

- Updated license from MIT to Apache 2.0
- Enhanced README with installation instructions
- Fixed conversation region usage in SDK init references

## 2026-02-06

### Changed

- Updated RCS channel skills

## 2026-02-05

### Changed

- Updated RCS skills content

## 2026-01-30

### Fixed

- Updated SKILL.md formatting

## 2026-01-29

### Added

- Initial commit — first version of Sinch skills repository
- Added best practices guide and skill links
- Added OpenAPI links, fixed Overview headers, removed duplicates

### Fixed

- Corrected technical inaccuracies and link formatting across 7 skills
- Added `.md` extensions to doc links, fixed broken URLs
