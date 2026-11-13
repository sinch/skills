# Sinch get started: Cursor

> Host steps for the Cursor editor. Plugin facts come from https://github.com/sinch/sinch-plugins. If Cursor behaves differently from this file, follow Cursor and tell the user.

## Pick one route

Ask the user which they want. Use one route, not both, or the skills load twice.

| Route | What it adds | Best for |
|-------|--------------|----------|
| **Sinch plugin** (`sinch-cursor-plugin`) | The Sinch skills, the Docs MCP server (`sinch-docs`), the Build MCP server (`sinch`) for sending messages and managing webhooks and senders, and commands such as `/send-message` and `/list-senders` | Users who want to try Sinch from the chat, and non-developers |
| **CLI, skills and Docs MCP** (steps 1 to 3 in `SKILL.md`) | The `sinch` command-line tool, the skills, and `sinch-docs` | Developers building their own code |

## Plugin route

The user types this in the Cursor chat; you cannot run it for them:

```
/add-plugin sinch-cursor-plugin
```

The Docs MCP server works straight away. The Build MCP server needs the access key from step 5 and a Conversation API app ID. Skip step 3 on this route.

## CLI, skills and Docs MCP route

- **Step 1:** `npm install -g @sinch/cli`.
- **Step 2:** `sinch skills install --all --project` for this project, or `sinch skills install --all` for all projects.
- **Step 3:** add `sinch-docs` to `.cursor/mcp.json` in the project, or to `~/.cursor/mcp.json` for all projects. Cursor uses `url`:

  ```json
  { "mcpServers": { "sinch-docs": { "url": "https://developers.sinch.com/mcp" } } }
  ```

## Step 5: where the key goes

- **Plugin's Build MCP server.** It reads `~/.sinch/mcp.env` with `PROJECT_ID`, `KEY_ID`, `KEY_SECRET`, `CONVERSATION_REGION` (`us`, `eu` or `br`) and `CONVERSATION_APP_ID`. Have the user type `/sinch-mcp-setup` in the chat and choose the script option; it asks for each value and writes the file. The file should be readable only by the user (`chmod 600`). Without a Conversation API app ID yet, skip this and come back to it once they have created an app.
- **Sinch CLI:** the user runs `sinch auth login` in Cursor's terminal.
- **Code they build:** a git-ignored `.env`, as `SKILL.md` describes.

## After setup

After changing `mcp.json` or `~/.sinch/mcp.env`, restart the server in **Cursor Settings → MCP**, or reload the window. The same settings page shows whether `sinch` and `sinch-docs` are connected.
