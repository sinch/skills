# Sinch get started: Antigravity CLI

> Host steps for Google's Antigravity CLI (`agy`). Plugin facts come from https://github.com/sinch/sinch-plugins. If Antigravity behaves differently from this file, follow Antigravity and tell the user.

## Pick one route

Ask the user which they want. Use one route, not both, or the skills load twice.

| Route | What it adds | Best for |
|-------|--------------|----------|
| **Sinch plugin** (`sinch-antigravity-plugin`) | Sinch product skills, the Docs MCP server (`sinch-docs`), the Build MCP server (`sinch`), and `/sinch-...` commands for messages, webhooks, voice, verification, fax, numbers, email and more | Users who want to try Sinch from the chat, and non-developers |
| **CLI, skills and Docs MCP** (steps 1 to 3 in `SKILL.md`) | The `sinch` command-line tool, the skills, and `sinch-docs` | Developers building their own code |

## Plugin route

The user runs one of these in their own terminal:

- New install: `agy plugin install https://github.com/sinch/sinch-plugins`. This installs every plugin in that repository, not only the Antigravity one; say so.
- Already has the Sinch Gemini CLI extension: `agy plugin import gemini`.

`agy plugin list` should then show `sinch-antigravity-plugin`. The Docs MCP server works straight away. Skip step 3 on this route.

## CLI, skills and Docs MCP route

- **Step 1:** `npm install -g @sinch/cli`.
- **Step 2:** `sinch skills install --all --project` for this project, or `sinch skills install --all` for all projects.
- **Step 3:** add `sinch-docs` to Antigravity's MCP configuration. Antigravity uses `serverUrl`: `{ "sinch-docs": { "serverUrl": "https://developers.sinch.com/mcp" } }`.

## Step 5: where the key goes

- **Plugin's Build MCP server.** Antigravity does not ask for credentials at install. The Build MCP server reads `PROJECT_ID`, `KEY_ID`, `KEY_SECRET`, `CONVERSATION_REGION` (`us`, `eu` or `br`) and `CONVERSATION_APP_ID` from the environment of the terminal that starts `agy`. The user sets them in that terminal before starting `agy`, for example with their secret manager's command-line tool, so the secret does not land in shell history or a profile file. Without a Conversation API app ID yet, skip this and come back to it once they have created an app.
- **Sinch CLI:** the user runs `sinch auth login` in their own terminal.
- **Code they build:** a git-ignored `.env`, as `SKILL.md` describes.

## After setup

Restart `agy` after installing or changing the environment. In an `agy` session, `/mcp` shows whether `sinch` and `sinch-docs` are connected.
