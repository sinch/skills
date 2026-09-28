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
 * Get details of a specific webhook.
 *
 * Usage:
 *   node get_webhook.js --webhook-id WEBHOOK_ID
 *
 * Environment variables:
 *   SINCH_PROJECT_ID  - Your Sinch project ID (required)
 *   SINCH_KEY_ID      - Your access key ID (required)
 *   SINCH_KEY_SECRET  - Your access key secret (required)
 *   SINCH_REGION      - API region: us, eu, or br (default: us)
 *
 * Options:
 *   --webhook-id      - Webhook ID to retrieve (required)
 *
 * Example:
 *   node get_webhook.js --webhook-id 01WEBHOOK123456789
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
      "webhook-id": { type: "string" },
      "help":       { type: "boolean" },
    },
  });

  if (values.help) {
    console.log("Usage: node get_webhook.cjs --webhook-id WEBHOOK_ID");
    process.exit(0);
  }

  if (!values["webhook-id"]) {
    console.error("Error: --webhook-id is required");
    process.exit(1);
  }

  return values;
}

async function getWebhook() {
  try {
    const params = parseArguments();

    console.log("Retrieving webhook:", params["webhook-id"]);

    const token = await client.getAccessToken(keyId, keySecret);
    const url = client.apiUrl(
      region,
      projectId,
      `webhooks/${params["webhook-id"]}`,
    );

    const webhook = await client.httpRequest(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("\nWebhook Details:");
    console.log("─".repeat(80));
    console.log("ID:", webhook.id);
    console.log("App ID:", webhook.app_id);
    console.log("Target:", webhook.target);
    console.log("Target Type:", webhook.target_type);
    console.log("Triggers:");
    for (const trigger of webhook.triggers) {
      console.log("  -", trigger);
    }
    console.log("Has Secret:", webhook.secret ? "Yes (hidden)" : "No");

    if (webhook.client_credentials) {
      console.log("OAuth2 Configuration:");
      console.log("  Client ID:", webhook.client_credentials.client_id);
      console.log("  Endpoint:", webhook.client_credentials.endpoint);
      console.log(
        "  Token Request Type:",
        webhook.client_credentials.token_request_type,
      );
      if (webhook.client_credentials.scope) {
        console.log("  Scope:", webhook.client_credentials.scope);
      }
    } else {
      console.log("OAuth2 Configuration: None");
    }

    console.log("─".repeat(80));
    console.log("\nFull JSON:");
    console.log(JSON.stringify(webhook, null, 2));
  } catch (error) {
    console.error("\nError retrieving webhook:");
    console.error(error.message);
    process.exit(1);
  }
}

getWebhook();
