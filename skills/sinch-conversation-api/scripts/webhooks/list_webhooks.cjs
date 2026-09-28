#!/usr/bin/env node
/*
 * EXECUTION TOOL — not a schema reference.
 * Run this script as-is to PERFORM this task when you do not need to write
 * application code; side-effect rules still apply (billable/destructive calls
 * need explicit user approval). Do NOT copy its payload literals or logic into
 * a new codebase as if they were the API spec — for payload shape, load the
 * canonical developers.sinch.com docs linked from ../../SKILL.md instead.
 */
/**
 * List all webhooks for a Sinch Conversation API app.
 *
 * Usage:
 *   node list_webhooks.js --app-id YOUR_APP_ID
 *
 * Environment variables:
 *   SINCH_PROJECT_ID  - Your Sinch project ID (required)
 *   SINCH_KEY_ID      - Your access key ID (required)
 *   SINCH_KEY_SECRET  - Your access key secret (required)
 *   SINCH_REGION      - API region: us, eu, or br (default: us)
 *
 * Options:
 *   --app-id          - Conversation API app ID (required)
 *
 * Example:
 *   node list_webhooks.js --app-id 01EB37HMH1M6SV18ASNS3G135H
 */

const client = require("../common/sinch_client.cjs");
const { parseArgs } = require("node:util");

const projectId = client.getEnv("SINCH_PROJECT_ID");
const keyId = client.getEnv("SINCH_KEY_ID");
const keySecret = client.getEnv("SINCH_KEY_SECRET");
const region = client.getEnv("SINCH_REGION", "us");

function parseArguments() {
  const { values } = parseArgs({
    options: {
      "app-id": { type: "string" },
      "help":   { type: "boolean" },
    },
  });

  if (values.help) {
    console.log("Usage: node list_webhooks.cjs --app-id APP_ID");
    process.exit(0);
  }

  if (!values["app-id"]) {
    console.error("Error: --app-id is required");
    process.exit(1);
  }

  return values;
}

async function listWebhooks() {
  try {
    const params = parseArguments();

    console.log("Listing webhooks for app:", params["app-id"]);

    const token = await client.getAccessToken(keyId, keySecret);
    const url = client.apiUrl(
      region,
      projectId,
      `apps/${params["app-id"]}/webhooks`,
    );

    const result = await client.httpRequest(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!result.webhooks || result.webhooks.length === 0) {
      console.log("\nNo webhooks found for this app.");
      return;
    }

    console.log("\nFound", result.webhooks.length, "webhook(s):");
    console.log("─".repeat(80));

    result.webhooks.forEach((webhook, index) => {
      console.log(`\nWebhook ${index + 1}:`);
      console.log("  ID:", webhook.id);
      console.log("  Target:", webhook.target);
      console.log("  Triggers:", webhook.triggers.join(", "));
      console.log("  Has Secret:", webhook.secret ? "Yes" : "No");
      console.log("  Has OAuth2:", webhook.client_credentials ? "Yes" : "No");
    });

    console.log(`\n${"─".repeat(80)}`);
    console.log("Total webhooks:", result.webhooks.length, "/ 5 maximum");
  } catch (error) {
    console.error("\nError listing webhooks:");
    console.error(error.message);
    process.exit(1);
  }
}

listWebhooks();
