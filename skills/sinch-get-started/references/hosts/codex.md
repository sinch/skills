# Sinch get started: OpenAI Codex

> Host steps for Codex: the Codex CLI, and Codex in the ChatGPT desktop app. For ChatGPT chat without Codex, use `chat-apps.md`. Plugin facts come from https://github.com/sinch/sinch-plugins. If Codex behaves differently from this file, follow Codex and tell the user.

## Pick one route

Ask the user which they want. Use one route, not both, or the skills load twice.

| Route | What it adds | Best for |
|-------|--------------|----------|
| **Sinch plugin** (`sinch-codex-plugin`) | The Sinch product skills and the Docs MCP server (`sinch-docs`). It is read-only: no credentials, and it cannot send messages or change anything in a Sinch account | Learning Sinch and planning code, for developers and non-developers |
| **CLI, skills and Docs MCP** (steps 1 to 3 in `SKILL.md`) | The `sinch` command-line tool, which can also send messages and rent numbers, plus the skills and `sinch-docs` | Developers building their own code |

## Plugin route

1. Add the Sinch marketplace: `codex plugin marketplace add sinch/sinch-plugins`. You can run it, or the user can.
2. Restart Codex.
3. The user installs `sinch-codex-plugin` from the Sinch marketplace in Codex.

Skip step 3 on this route; the plugin brings `sinch-docs`.

## CLI, skills and Docs MCP route

- **Step 1:** `npm install -g @sinch/cli`.
- **Step 2:** `sinch skills install --all --project` for this project, or `sinch skills install --all` for all projects.
- **Step 3:** add `sinch-docs` at `https://developers.sinch.com/mcp` to Codex's MCP configuration, as a remote HTTP server.

## Step 5: where the key goes

The plugin takes no credentials, so the key goes where the user will use it:

- **Sinch CLI:** the user runs `sinch auth login` in their own terminal.
- **Code they build:** a git-ignored `.env`, as `SKILL.md` describes.
- **Neither yet** (common for non-developers on this plugin): they keep the key in their password manager for now, as `SKILL.md` describes for non-developers.

## After setup

Restart Codex. If the plugin does not appear, check `codex plugin marketplace list` for the `sinch` marketplace and that the plugin is enabled for the current project.
