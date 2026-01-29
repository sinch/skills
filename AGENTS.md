# AGENTS.md

Guidance for AI coding agents working with this repository.

## Repository Purpose

Official Sinch API skills for AI coding agents. Each skill in `skills/` provides getting-started guides, best practices, and gotchas for a Sinch product. Skills are installed by developers via `npx skills add sinch/skills` and are listed on https://skills.sh/.

## How to Discover and Use Skills

Each `skills/<product>/SKILL.md` contains product-specific guidance for integrating a Sinch API. To find the right skill:

1. Browse the `skills/` directory to see available products
2. Open the relevant `SKILL.md` to get getting-started instructions, common patterns, and gotchas
3. Follow the code examples (curl and Node.js SDK) to integrate the API

## Skill Format

Each SKILL.md has:

- **YAML frontmatter**: `name` (e.g., `sinch-sms`) and `description` (when to use the skill)
- **Markdown body**: Overview, Getting Started, Key Concepts, Common Patterns, Gotchas & Best Practices, Links

## Contributing

When adding or editing skills:

- Follow `template/SKILL.md` as the skeleton for new skills
- Keep each SKILL.md under 500 lines
- Use `sinch-<product>` naming convention for the `name` field (max 64 characters)
- `description` field must be max 200 characters
- Write for AI agents: concise, actionable, include code examples
- Use curl and Node.js SDK (`@sinch/sdk-core`) for examples
- Move detailed content to `references/` subdirectories if needed

## Sinch Developer Docs

https://developers.sinch.com
