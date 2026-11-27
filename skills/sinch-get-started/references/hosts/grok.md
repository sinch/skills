# Sinch get started: Grok and Grok Bot

> Host steps for Grok at grok.com and in its apps, and for Grok Bot, xAI's personal agent. Grok facts come from xAI's connector docs (https://docs.x.ai/grok/connectors); Grok Bot facts come from a third-party guide, as xAI had no page on it, so trust what the user sees over this file. Follow the rules in [chat-apps.md](chat-apps.md); this file adds the clicks.

There is no Sinch plugin in the Grok Bot plugin marketplace. Do not search for one.

## Grok (grok.com)

### Step 3: the Sinch docs (optional)

1. Open grok.com/connectors.
2. Click **New Connector**, then **Custom**.
3. Paste `https://developers.sinch.com/mcp` as the server URL and finish. No sign-in is needed.

On Grok Business and Enterprise, a team admin may have to add connectors in the xAI console first. If the user does not see **New Connector**, tell them to ask their admin, or skip.

## Grok Bot

Grok Bot has no settings field for a server URL; it adds servers when asked in the chat.

### Step 3: the Sinch docs (optional)

Offer to add it yourself. If the user agrees, add a custom MCP server named **sinch-docs** at `https://developers.sinch.com/mcp`, with no authentication. The user confirms the name and URL on the card that appears and clicks **Add it**. To use it in a task, they type `@` and pick **sinch-docs**.

If the user talks to a different bot than you, give them this line to send: "Add a custom MCP server called sinch-docs at https://developers.sinch.com/mcp".

### Step 5

Grok Bot can store a key as a header on a server it adds, but no Sinch server needs one today. Follow the shared rule: the user keeps the key in their password manager, and never pastes the Key Secret into the chat.
