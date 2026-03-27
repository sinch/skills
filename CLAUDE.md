# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Official Sinch API skills for AI coding agents. Each skill in `skills/` provides getting-started guides, best practices, and gotchas for a Sinch product. Skills are installed by developers via `npx skills add sinch/skills` and are listed on https://skills.sh/.

## Architecture

```
skills/
  <product>/
    SKILL.md            # Main skill file (required)
    scripts/            # Optional helper scripts
    references/         # Optional detailed reference material
    assets/             # Optional images or other assets
```

One folder per Sinch product. The skill file is always `SKILL.md`.

## Adding a New Skill

1. Create `skills/<product-name>/SKILL.md` with YAML frontmatter (`---` delimiters, `name` and `description` fields)
2. Fill in the YAML frontmatter (`name` in `sinch-<product>` format, `description` with what it does and when to use it)
3. Complete all body sections: Overview, Getting Started, Key Concepts, Common Patterns, Gotchas & Best Practices, Links
4. Keep the file under 500 lines. Move detailed content to `references/` if needed.

## SKILL.md Format Rules

### Frontmatter

- `name`: Max 64 characters. Format: `sinch-<product-slug>` (e.g., `sinch-sms`, `sinch-voice-api`)
- `description`: Max 1024 characters. Describes when to trigger the skill (e.g., "When the user wants to send SMS messages using the Sinch SMS API")

### Body Sections

1. **Overview** -- What the product does and when to use it (2-3 sentences)
2. **Getting Started** -- Authentication, SDK install, first API call
3. **Key Concepts** -- Product-specific domain model and terminology
4. **Common Patterns** -- Most frequent use cases with code snippets
5. **Gotchas and Best Practices** -- Non-obvious pitfalls, rate limits, regional quirks
6. **Links** -- Documentation, API reference, dashboard

### Style Guidelines

- Max 500 lines per SKILL.md; move detailed content to `references/`
- Write for AI agents: concise, actionable, include code examples
- Use curl and Node.js SDK (`@sinch/sdk-core`) for code examples. Exception: Mailgun skills use `mailgun.js`.
- Do not include lengthy prose; prefer bullet points and code blocks

## Sinch Developer Docs

- Developer portal: https://developers.sinch.com
- LLMs.txt (full markdown docs index): https://developers.sinch.com/llms.txt
- Mailgun LLMs.txt: https://documentation.mailgun.com/llms.txt
- OpenAPI specs: `https://developers.sinch.com/_bundle/docs/<product>/api-reference/<product>.yaml?download`
- Mailgun docs use `https://documentation.mailgun.com` instead of `developers.sinch.com`

## Auth

The shared `skills/sinch-authentication/SKILL.md` skill covers all auth methods. Product skills reference it rather than duplicating auth setup.

- OAuth2 (most APIs): project ID + key ID + key secret → bearer token
- Basic Auth: project ID + key ID + key secret (some APIs)
- Application signing: Voice API, Verification API (HMAC-SHA256)
- API key: Mailgun (`api:key`)
- Dashboard access keys: https://dashboard.sinch.com/settings/access-keys

## API Reference Link Format

Each skill's Links section should include both:
1. **OpenAPI YAML spec**: `https://developers.sinch.com/_bundle/docs/<product>/api-reference/<product>.yaml?download`
2. **Markdown docs**: `https://developers.sinch.com/docs/<product>/api-reference/<product>.md`

These are machine-readable formats optimized for AI agent consumption.

## Do Not

- Add README.md, CHANGELOG.md, or INSTALLATION_GUIDE.md inside skill folders. Only SKILL.md and optional bundled resources.
- Create skills that exceed 500 lines.
- Use authentication credentials or API keys in code examples (use placeholders like `YOUR_PROJECT_ID`).
