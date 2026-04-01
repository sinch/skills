# AGENTS.md
test change
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

- **YAML frontmatter**: `name` (e.g., `sinch-conversation-api`) and `description` (when to use the skill)
- **Markdown body**: Overview, Getting Started, Key Concepts, Common Patterns, Gotchas & Best Practices, Links

## Contributing

When adding or editing skills:

- Use kebab-case for skill folder names (e.g., `sinch-conversation-api`). No spaces, underscores, or capitals.
- The skill file must be named exactly `SKILL.md` (case-sensitive). No variations (`SKILL.MD`, `skill.md`).
- Do not add `README.md` inside skill folders. All documentation goes in `SKILL.md` or `references/`.
- Keep each SKILL.md under 500 lines. Move detailed content to `references/` subdirectories if needed.
- Use `sinch-<product>` naming convention for the `name` field (max 64 characters).
- `description` field must be max 1024 characters. Include both what the skill does and when to use it (trigger conditions with specific phrases).
- No XML angle brackets (`<` `>`) in YAML frontmatter.
- Write for AI agents: concise, actionable, include code examples.
- Use curl and Node.js SDK (`@sinch/sdk-core`) for examples.

## Sinch Developer Docs

https://developers.sinch.com
