# Sinch get started: chat apps

> Shared rules for chat apps in a browser, on desktop or on a phone. Each app with its own file adds its exact clicks on top of these rules. There is no Sinch plugin for any chat app; the plugins at https://github.com/sinch/sinch-plugins are for coding agents only. App settings change often; if a menu is not where a file says, follow the app and tell the user.

| App | File |
|-----|------|
| Claude (claude.ai, desktop chat, mobile) | [claude-web.md](claude-web.md) |
| ChatGPT | [chatgpt.md](chatgpt.md) |
| Gemini app (gemini.google.com, mobile) | [gemini-app.md](gemini-app.md) |
| Grok (grok.com) and Grok Bot | [grok.md](grok.md) |
| Lovable | [lovable.md](lovable.md) |
| Microsoft Copilot, and any other chat app | This file only |

## Rules for every chat app

Most people here are business users. Apply "Business users and other non-developers" in `SKILL.md`: plain words, one step per message, and setup is optional.

1. **Start with Step 0 from `SKILL.md`.** Your first reply is only that: the bullet list of what the user will be able to do at the end, the line on what it takes, and "Continue" | "Not now". Wait for the answer before anything below.
2. **Say which app you are**, for example "You're using Claude in the browser." Then give only that app's steps.
3. **Skip steps 1 and 2 silently.** There is no command-line tool to install and no Sinch plugin. Do not mention them, not even as "skipped" or "not applicable".
4. **Step 3, the Sinch docs, is optional.** Offer it as one step: "Want me to be able to look things up in the Sinch docs? It takes a minute." First look for an existing Sinch docs connector, whatever its name (for example "Sinch Build Docs"), in the app's connector directory as well as among your connected tools: one the user has not connected does not show among your tools. If the app gives you a tool to search connectors or suggest one, use it, so the user gets a Connect button. If it is connected but switched off, say where to switch it on. Give the app file's clicks, with the name **Sinch Docs** and the URL `https://developers.sinch.com/mcp`. It needs no sign-in: pick "no authentication" or "no sign in" where the app asks. If the user does not see the option, or says no, go on: "You don't need anything else set up to start."
5. **Step 5: the key goes nowhere yet.** Follow "Step 5 for non-developers" in `SKILL.md`: the user saves the Project ID, Key ID and Key Secret in their password manager and never pastes the Key Secret into the chat. Skip step 6; you have no terminal to check the key with. Lovable is the exception; see its file.

## Microsoft Copilot

The Copilot app and Microsoft 365 Copilot chat have no setting where a user adds their own connector. Connecting an MCP server is done by an admin or maker in Copilot Studio, for an agent they build. Skip step 3, and say only: "You don't need anything else set up to start."

## Any other chat app

Give the step 3 clicks only if you know your app's exact menu path for adding a custom connector or MCP server by URL today. Otherwise skip it.
