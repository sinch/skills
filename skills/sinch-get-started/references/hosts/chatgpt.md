# Sinch get started: ChatGPT

> Host steps for ChatGPT in the browser, desktop app and mobile app. For Codex, use `codex.md`. Facts come from OpenAI's help page on custom MCP servers (https://help.openai.com/en/articles/12584461). OpenAI has moved this setting several times; if a label differs, follow what the user sees. Follow the rules in [chat-apps.md](chat-apps.md); this file adds the clicks.

## Step 3: the Sinch docs (optional)

Custom MCP servers need a paid plan (Plus, Pro, Business, Enterprise or Edu), and are added in ChatGPT on the web. The Sinch docs server only reads, so plans limited to read-only servers are fine. On a Free plan, skip this step.

1. Open **Plugins** (some accounts call it **Apps**) and click **+** to add a custom one.
2. Name: **Sinch Docs**. URL: `https://developers.sinch.com/mcp`. Authentication: none.
3. Accept the warning that the app is not verified by OpenAI; the URL is Sinch's own.
4. In a chat, open the **+** menu and select **Sinch Docs** for that conversation.

If there is no option to add a custom one, it may sit behind **Developer mode**, under **Settings → Security and login**. On Business, Enterprise and Edu, a workspace admin may need to allow it first. If the user cannot find it, skip this step.
