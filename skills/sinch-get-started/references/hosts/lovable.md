# Sinch get started: Lovable

> Host steps for Lovable, which builds apps from chat. Connector facts come from Lovable's docs on custom MCP servers (https://docs.lovable.dev/integrations/custom-mcp). Lovable features change; when this file disagrees with what Lovable can do, follow Lovable and tell the user. Follow the rules in [chat-apps.md](chat-apps.md), except for step 5 below.

## Step 3: the Sinch docs (optional)

Lovable calls this a **chat connector**. It is available on all plans, and it helps Lovable while it builds; the published app cannot use it.

1. Open **Connectors** and click **Add custom**, then **MCP server**.
2. Server name: **Sinch Docs**. Connection: leave **Direct connection**. Server URL: `https://developers.sinch.com/mcp`.
3. Authentication: none. Click **Add server**.

If **MCP server** is greyed out, a workspace admin has turned custom servers off. Tell the user to ask their admin, or skip.

## Step 5: where the key goes

Unlike other chat apps, Lovable will use the key in the app it builds. When the user is ready to build something that calls Sinch, open Lovable's secret storage form for `SINCH_KEY_ID` and `SINCH_KEY_SECRET`, and have the user paste the values there, never into the chat. The Project ID is not a secret and can go in the app's config. Until they build, they keep the key in their password manager.

Every Sinch call must run in a backend function, never in code that runs in the browser.

## Guided first test

For a step-by-step first test in Lovable, such as sending a first SMS, hand off to `sinch-onboarding`; its Lovable entry point covers secret storage, backend functions and webhooks.
