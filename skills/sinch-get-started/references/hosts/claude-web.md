# Sinch get started: Claude chat

> Host steps for Claude in the browser (claude.ai), the desktop app's chat, and the mobile apps. For Claude Code, use `claude-code.md`. Facts come from Anthropic's help page on custom connectors (https://support.claude.com/en/articles/11175166). Follow the rules in [chat-apps.md](chat-apps.md); this file adds the clicks.

## Step 3: the Sinch docs (optional)

### First: the Sinch Build Docs connector in Claude's directory

Sinch's docs server is listed in Claude's connector directory as **Sinch Build Docs** (`https://developers.sinch.com/mcp`). Connecting it from the directory takes one click and does not use up the Free plan's custom connector, so always try this first:

1. **Search the directory, not only the connected tools.** A connector the user has not connected does not show among your tools. If you have a connector search tool (for example `search_mcp_registry`), search for "Sinch". Look for **Sinch Build Docs**, connected or not.
2. **If it is found but not connected**, show it with your connector suggestion tool (for example `suggest_connectors`, passing its directory ID), so the user gets a **Connect** button. Say one line: "Click Connect to let me read the Sinch docs."
3. **If it is connected but switched off in this chat**, tell the user: click **+** at the bottom left of the message box, choose **Connectors**, and switch **Sinch Build Docs** on.
4. **If you have no search tool**, give the clicks: open **Customize → Connectors**, browse or search the directory for **Sinch Build Docs**, and click **Connect**.

Use the custom connector steps below only if the directory has no Sinch Build Docs entry, or the user's organization blocks it.

### Fallback: add it as a custom connector

Custom connectors work on every plan; the Free plan allows one. Add it in the browser or desktop app.

**Free, Pro and Max:**

1. Open **Customize → Connectors**.
2. Click **+ Add**, then **Add custom connector**.
3. Name: **Sinch Docs**. URL: `https://developers.sinch.com/mcp`. Click **Continue**.
4. Under **Authentication**, choose **No sign in**, then click **Add**.

**Team and Enterprise:** only an Owner can add a custom connector, under **Organization settings → Connectors**. If the user is not an Owner, tell them to ask one, or skip. Once an Owner has added it, the user finds it under **Customize → Connectors** and clicks **Connect**.

**Use it in a chat:** click **+** at the bottom left of the message box, choose **Connectors**, and switch it on.

A newly connected connector may only show up in a new chat. If you cannot see its tools after the user connects it, ask them to start a new chat and paste the same request.

On a Free plan that already has a custom connector, skip this step rather than asking the user to remove one.
