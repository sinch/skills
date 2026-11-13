# Sinch get started: Gemini CLI

> Host steps for Gemini CLI (`gemini` in a terminal). This is not the Gemini app in a browser or on a phone; for that, use `chat-apps.md`. Extension facts come from https://github.com/sinch/sinch-plugins. If Gemini CLI behaves differently from this file, follow Gemini CLI and tell the user.

## Pick one route

Ask the user which they want. Use one route, not both, or the skills load twice.

| Route | What it adds | Best for |
|-------|--------------|----------|
| **Sinch extension** (`sinch-gemini-extension`) | The Docs MCP server (`sinch-docs`), the Build MCP server (`sinch`), and `/sinch:...` commands for messages, webhooks, voice, verification, fax, numbers, email and more | Users who want to try Sinch from the chat, and non-developers |
| **CLI, skills and Docs MCP** (steps 1 to 3 in `SKILL.md`) | The `sinch` command-line tool, the skills, and `sinch-docs` | Developers building their own code |

## Extension route

The install asks for the Sinch credentials (Project ID, Key ID, Key Secret, region, Conversation API app ID). So on this route, do steps 4 and 5 first, so the user has the key in hand, then install. If they have no Conversation API app yet, they can leave that value empty and set it later.

The user runs this in their own terminal, since it prompts for the secret:

```bash
gemini extensions install https://github.com/sinch/sinch-plugins
```

The extension installs for all projects. To keep it to this project, the user can disable it globally and enable it here: `gemini extensions disable sinch-gemini-extension`, then `gemini extensions enable sinch-gemini-extension --scope workspace`. Skip step 3 on this route.

## CLI, skills and Docs MCP route

- **Step 1:** `npm install -g @sinch/cli`.
- **Step 2:** `sinch skills install --all --project` for this project, or `sinch skills install --all` for all projects.
- **Step 3:** add `sinch-docs` under `mcpServers` in `.gemini/settings.json` in the project, or `~/.gemini/settings.json` for all projects. Gemini CLI uses `httpUrl`:

  ```json
  { "mcpServers": { "sinch-docs": { "httpUrl": "https://developers.sinch.com/mcp" } } }
  ```

## Step 5: where the key goes

- **Extension's Build MCP server.** The values typed at install are kept in the extension's settings. To change one later, the user runs `gemini extensions settings set sinch-gemini-extension <setting>` in their terminal. Check the exact extension and setting names with `gemini extensions list` and `gemini extensions settings list sinch-gemini-extension`.
- **Sinch CLI:** the user runs `sinch auth login` in their own terminal.
- **Code they build:** a git-ignored `.env`, as `SKILL.md` describes.

## After setup

Restart Gemini CLI. `gemini mcp list` shows whether `sinch` and `sinch-docs` are connected.
