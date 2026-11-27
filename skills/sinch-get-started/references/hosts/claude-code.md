# Sinch get started: Claude Code

> Host steps for Claude Code: the CLI, the desktop app's Code tab, and the IDE extensions. Plugin facts come from https://github.com/sinch/sinch-plugins. If Claude Code behaves differently from this file, follow Claude Code and tell the user.

## Pick one route

Ask the user which they want. Use one route, not both, or the skills load twice.

| Route | What it adds | Best for |
|-------|--------------|----------|
| **Sinch plugin** (`sinch-claude-plugin`) | The Sinch skills, the Docs MCP server (`sinch-docs`), and the Build MCP server (`sinch`), which can send messages, manage webhooks and list senders through the Conversation API | Users who want to try Sinch from the chat, and non-developers |
| **CLI, skills and Docs MCP** (steps 1 to 3 in `SKILL.md`) | The `sinch` command-line tool, the skills, and `sinch-docs` | Developers building their own code |

## Plugin route

Ask about scope first (`SKILL.md`, "Choose where to install"), then either run these yourself or give them to the user to type in the chat:

| You run | The user types |
|---------|----------------|
| `claude plugin marketplace add https://github.com/sinch/sinch-plugins.git` | `/plugin marketplace add https://github.com/sinch/sinch-plugins.git` |
| `claude plugin install sinch-claude-plugin@sinch --scope <scope>` | `/plugin install sinch-claude-plugin` |

`--scope` is `project` (this project, shared with the team through the repository), `local` (this project, only this user) or `user` (all projects). It defaults to `user`, so always pass it.

The Docs MCP server works straight away. The Build MCP server needs the access key from step 5 and a Conversation API app ID; until those are set it does not connect. Skip step 3 on this route.

## CLI, skills and Docs MCP route

- **Step 1:** `npm install -g @sinch/cli`.
- **Step 2:** `sinch skills install --all --project` for this project, or `sinch skills install --all` for all projects.
- **Step 3:** `claude mcp add --transport http --scope <local|project|user> sinch-docs https://developers.sinch.com/mcp`.

## Step 5: where the key goes

- **Plugin's Build MCP server.** It reads `PROJECT_ID`, `KEY_ID`, `KEY_SECRET`, `CONVERSATION_REGION` (`us`, `eu` or `br`) and `CONVERSATION_APP_ID` from the `env` block of `~/.claude/settings.json`. The plugin ships a setup script, `commands/config/init_mcp_cred.sh` in the installed plugin's folder, that asks for each value with hidden input and writes the file; it needs `jq`. The user runs it in their own terminal. Tell them the file keeps the secret in plain text in their home folder. Without a Conversation API app ID yet, skip this and come back to it once they have created an app.
- **Sinch CLI:** the user runs `sinch auth login` in their own terminal.
- **Code they build:** a git-ignored `.env`, as `SKILL.md` describes.

## After setup: load what you installed

You cannot run slash commands or restart Claude Code yourself, so this is a user checkpoint (`SKILL.md`, "Load what you installed"). Never end with "Run /reload-skills, then restart" in passing. List only the lines that apply, in this order:

| What changed | The user does | You then check |
|--------------|---------------|----------------|
| Skills installed (step 2) | Type `/reload-skills` | Your skill list shows the Sinch skills, such as `sinch-sms` |
| Plugin installed (plugin route) | Type `/reload-plugins` | The plugin's skills and `sinch-docs` tools are listed |
| MCP server added (step 3), or `env` values changed in `settings.json` | Restart Claude Code: quit and reopen the app or session in the same folder. In the terminal, `claude --continue` resumes this conversation | `claude mcp list` shows `sinch-docs`, and `sinch` once its credentials are set |

Ask "Done" | "I'm stuck" after the list. A restart ends this session, so put it last. Tell the user to say "continue Sinch setup" when they are back, and keep the steps 1 to 3 detection in `SKILL.md` so it resumes at step 4.
