# Sinch Skill Shared Policy

<!-- Catalog-only: start -->
This is a catalog source document maintained under `docs/`. Run
`python3 scripts/sync_sinch_skill_references.py` from the repository root to
regenerate the standalone policy copy shipped with each skill.
<!-- Catalog-only: end -->

This policy is mandatory for every `sinch-*` skill. Product-specific instructions may add stricter requirements but must not weaken these rules.

## Binding Digest

These rules are always binding; the sections below define each precisely. This list is embedded verbatim into every skill's `SKILL.md`.

<!-- Digest: start -->
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
<!-- Digest: end -->

## 0. Load This Policy Once

This policy is identified by the `Policy-ID`, `Policy-Version`, and `Content-SHA256` in the generated local copy. During one conversation:

- Read the first encountered copy and treat that ID/version as loaded.
- When another Sinch skill declares the same policy ID/version/fingerprint, do not read its duplicate copy.
- If another skill declares a newer version, read it once and replace the loaded version.
- If the version matches but the fingerprint differs, read it because the policy payload changed without a version bump.
- Use `Content-SHA256` to audit that copies with the same ID/version have identical policy payloads.

Skill-specific canonical routes and side-effect notes live in each skill's own `SKILL.md` (Agent Instructions and Links); they are not duplicates and always apply.

## 1. Resolve Context Without Repeating Questions

Infer product, operation, language, approach, region, and environment from the user's request, prior turns, workspace manifests, and existing Sinch dependencies.

Ask only for unresolved information that blocks the next action:

- Combine related questions into one concise prompt unless answers must be collected sequentially.
- Do not ask for a value already established by another loaded skill.
- Do not ask the user to choose SDK versus direct API. When the request or an existing Sinch dependency already decides the approach, follow it. Otherwise default to the official Sinch SDK for the resolved language, and use direct API calls only when no official SDK covers that language or operation. State the chosen approach; do not ask.
- Separate code generation from execution. A request to generate code is not approval to call a live API.

## 2. Evidence Tiers

Classify every API fact before using it.

### Tier A: Stable Routing Facts

Tier A facts may be used directly from a skill when the skill names the canonical source that owns them:

- Product and credential family
- Canonical service hostname pattern
- High-level resource or workflow name
- Official SDK package name

### Tier B: Schema and Security Facts

Fetch the exact canonical document in the current session before emitting Tier B facts in code or prose:

- Endpoint path or HTTP method
- Header, query parameter, or body field name
- Request/response nesting
- Enum, status, limit, timeout, encoding, or signature algorithm
- Webhook/callback payload or verification procedure
- Channel property
- SDK method signature or initialization option

A successful fetch means a trusted first-party URL returned readable content containing the relevant operation or field. Seeing a link, reading a bundled reference, or fetching an unrelated overview does not count.

### Tier C: Examples and Engineering Choices

Examples, bundled scripts, retries, caches, storage, concurrency controls, framework choices, and validation logic are not API authority. Label them as examples or engineering choices. Never turn example identifiers, URLs, phone numbers, dates, or credentials into production defaults.

## 3. Minimum Document Route

Before implementation:

1. Identify the exact operation.
2. List every Tier B field, header, parameter, enum, limit, and security procedure that the implementation may emit or claim.
3. Using the canonical links written in the skill (Agent Instructions and Links), assign one exact canonical source to every listed item.
4. For direct API requests, fetch the authoritative operation schema before writing the payload. When the skill identifies an OpenAPI document as authoritative, fetch that document and locate the exact operation and request/response schema; an overview page does not authorize body fields.
5. For every `channel_properties` key, fetch the exact owning channel-properties page. A mention on a message-type page, in an example, or in another channel's documentation does not authorize the key.
6. Fetch only the documents required for that operation; independent fetches may run in parallel.
7. Record each fetched URL, exact schema or section, and the fields or claims it authorized in an evidence ledger before the first code edit.
8. Fetch authentication or callback-signing documentation only when that surface is implemented. When it is implemented, it is Tier B like any other surface and must resolve to a canonical source: prefer the skill's routed auth source (or the `sinch-authentication` skill when available); when neither resolves, the API's OpenAPI document is canonical — `components.securitySchemes` authorizes the token endpoint and flow.

Use this field-source gate for implementation tasks:

| Tier B field or claim | Canonical source fetched this session | Exact operation, schema, or section |
|---|---|---|

Do not begin implementation while a row is unresolved. Do not omit a relevant API feature merely because its canonical source has not been fetched. If a feature may satisfy an explicit requirement, fetch its canonical source before deciding to use or omit it, then record the decision and rationale.

Do not fetch every link in a skill. Do not infer documentation URLs; use links written in the skill or links reached from an already-fetched first-party page. When no written link covers a needed fact, resolve it through the ladder in section 4 — never by guessing a URL.

## 4. Unresolved Route or Fetch Failure

Fail closed for Tier B facts — but only after exhausting this ladder in order. Stop at the first step that resolves the fact.

1. **Re-read what you already have.** Search documents already fetched this session. Security schemes, server blocks, and enums frequently live inside the OpenAPI document rather than on a prose page. A summarized read is not a search: for documents over ~100KB, download and grep the raw file before concluding a fact is absent. A summarizer returning "not specified" is not evidence of absence.
2. **Consult the docs index.** Fetch https://developers.sinch.com/llms.txt and locate the exact path. This is the route resolver for any Sinch docs URL not written in a skill.
3. **Follow first-party links** from an already-fetched page to the target.
4. **Retry once** only if the failure appeared transient.
5. **Then fail closed** — stop before emitting the affected API detail, or produce a clearly labelled non-runnable draft with every unverified field identified. Do not silently substitute `SKILL.md`, `references/**`, `scripts/**`, search snippets, or memory. State which URL failed and which implementation surface remains blocked.

Never construct a documentation URL by pattern-guessing a path (`.../api-reference/authentication.md`, `.../getting-started/auth.md`). A 404 from a guessed URL is not evidence the documentation does not exist — it is evidence the guess was wrong. Guessed-URL 404s must not be recorded in the evidence ledger as attempted verification.

## 5. Canonical Routes in Skills

Each skill carries its own canonical routing: the Links section and inline Agent Instructions name the exact first-party document that owns each operation, schema, or security surface. Tier B values quoted inside a skill (field names, limits, endpoints) are navigation aids, not authority — fetch the owning canonical document in the current session before using them. Security algorithms must always be fetched in the current session before implementation.

## 6. Provenance Ledger

For implementation tasks, maintain a concise ledger during the work:

| Source | Fetched this session | Authorized code or claim |
|---|---:|---|

Cite a canonical URL once per coherent schema or security contract; do not attach a citation to every repeated field. Distinguish use-case requirements from vendor API facts and from engineering choices.

## 7. Side-Effect Classes

Classify operations before execution:

| Class | Examples | Required behavior |
|---|---|---|
| Read-only | list, get, search, capability query | May execute when credentials and target are established |
| Reversible mutation | create/update webhook, draft resource | Explain mutation and verify resulting state |
| Billable | send message/email/fax, place call, rent number, validation job | Obtain explicit execution approval unless the user already explicitly requested the live action; use sandbox/test mode when available |
| Destructive or externally consequential | release number, activate port, submit registration, cancel order, delete domain/resource | Show exact target and consequence, obtain explicit approval immediately before execution, then verify state |

Never treat code-generation approval as live-execution approval. Never retry an uncertain billable or destructive request until a read operation or idempotency key proves the first attempt did not succeed. Redact credentials and sensitive payload fields from commands, logs, and reports.

## 8. Async and Retry Contract

For polling or retries:

- Use bounded exponential backoff with jitter.
- Define a maximum elapsed time or attempt count.
- Treat documented terminal failure states as terminal.
- On timeout, report the last known state as unknown; do not claim failure or success.
- Respect `Retry-After` when documented.
- Check state before retrying billable or destructive operations.

## 9. Verification Contract

After code changes, run the narrowest available checks and report these levels separately:

1. Syntax/type/lint checks
2. Unit tests for parsing, signatures, retries, idempotency, timeouts, and concurrency where applicable
3. Mock HTTP contract tests against fetched request/response schemas
4. Sandbox or documented test-mode call
5. Live API acceptance
6. End-to-end outcome such as delivery, activation, callback receipt, or rendered media

Never use one level to imply another. An HTTP `2xx` does not prove message delivery, fax receipt, call completion, provisioning, or port activation. State every level not performed and why.

## 10. Skill Routing

Load only the smallest skill set that owns the requested behavior:

- Authentication setup or failures -> `sinch-authentication`
- SDK installation/client initialization -> `sinch-sdks`
- Conversation API objects, webhooks, contacts, conversations, templates, or batches -> `sinch-conversation-api`
- Channel behavior -> the relevant channel skill only
- Provisioning or registration -> the owning provisioning/registration skill

Treat `metadata.uses` as a list of potential dependencies needed to complete one or more operations inside the owning skill, not instructions to load every listed skill. Do not add adjacent products, optional next steps, post-completion destinations, or general "see also" references to `metadata.uses`.

Before entering a workflow owned by another skill, whether it is a dependency or an optional handoff:

1. Determine whether that dependency is required for the user's current operation.
2. Check whether its exact skill name appears in the available skill catalog.
3. If available, load it before continuing that part of the workflow.
4. If unavailable, tell the user which exact skill is required and ask them to install or provide it before continuing. Do not invent its instructions or substitute remembered API details.
5. If catalog visibility is unavailable, state that the dependency could not be confirmed and ask the user to make the named skill available.

Do not block an unrelated workflow because a conditional dependency is absent. An optional handoff must not block completion of the current skill's workflow; check availability only when the user asks to continue into the handed-off workflow. Cross-skill routing text must use the exact backticked skill name, for example: "load `sinch-conversation-api`". Do not use cross-skill relative file links; they break standalone skill packaging.

Record materially relevant skills considered but not loaded when the task asks for an auditable process.

## 11. Maintenance and CI

Every catalog release should validate:

- Frontmatter and skill/folder names
- Relative links and trusted canonical URLs
- Shell and JSON examples
- OpenAPI-backed payload examples where a spec exists
- No literal secrets or unsafe production defaults
- A mandatory shared-policy link plus canonical route links written in each skill
- A generated policy gate and policy digest block in every `SKILL.md`, current with this document

<!-- Catalog-only: start -->
Run `python3 scripts/sync_sinch_skill_references.py --check` and
`python3 scripts/validate_sinch_skills.py` from the repository root before publishing.
<!-- Catalog-only: end -->
