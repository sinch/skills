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
template/
  SKILL.md              # Skeleton for new skills
```

One folder per Sinch product. The skill file is always `SKILL.md`.

## Adding a New Skill

1. Copy `template/SKILL.md` to `skills/<product-name>/SKILL.md`
2. Fill in the YAML frontmatter (`name` and `description`)
3. Complete all body sections: Overview, Getting Started, Key Concepts, Common Patterns, Gotchas & Best Practices, Links
4. Keep the file under 500 lines. Move detailed content to `references/` if needed.

## SKILL.md Format Rules

### Frontmatter

- `name`: Max 64 characters. Format: `sinch-<product-slug>` (e.g., `sinch-sms`, `sinch-voice-api`)
- `description`: Max 200 characters. Describes when to trigger the skill (e.g., "When the user wants to send SMS messages using the Sinch SMS API")

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
- Use curl and Node.js SDK (`@sinch/sdk-core`) for code examples
- Do not include lengthy prose; prefer bullet points and code blocks

## Sinch Developer Docs

https://developers.sinch.com

## Auth Patterns

Most Sinch APIs use OAuth2:
- Credentials: project ID + key ID + key secret
- Exchange for a bearer token via `POST https://auth.sinch.com/oauth2/token`
- Include `Authorization: Bearer <token>` on API requests

Some legacy APIs use Basic auth or application signing. Check each product's documentation for specifics.

## Do Not

- Add README.md, CHANGELOG.md, or INSTALLATION_GUIDE.md inside skill folders. Only SKILL.md and optional bundled resources.
- Create skills that exceed 500 lines.
- Use authentication credentials or API keys in code examples (use placeholders like `YOUR_PROJECT_ID`).
