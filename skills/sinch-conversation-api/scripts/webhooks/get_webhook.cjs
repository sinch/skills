#!/usr/bin/env node
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

var client = require("../common/sinch_client.cjs");

var projectId = client.getEnv("SINCH_PROJECT_ID");
var keyId = client.getEnv("SINCH_KEY_ID");
var keySecret = client.getEnv("SINCH_KEY_SECRET");
var region = client.getEnv("SINCH_REGION", "us");

function parseArgs() {
  var args = process.argv.slice(2);
  var params = {};

  for (var i = 0; i < args.length; i++) {
    if (args[i] === "--help") {
      console.log("Usage: node get_webhook.cjs --webhook-id WEBHOOK_ID");
      process.exit(0);
    }
    if (args[i].startsWith("--")) {
      var key = args[i].substring(2);
      var value = args[++i];
      params[key] = value;
    }
  }

  if (!params["webhook-id"]) {
    console.error("Error: --webhook-id is required");
    process.exit(1);
  }

  return params;
}

async function getWebhook() {
  try {
    var params = parseArgs();

    console.log("Retrieving webhook:", params["webhook-id"]);

    var token = await client.getAccessToken(keyId, keySecret);
    var url = client.apiUrl(
      region,
      projectId,
      "webhooks/" + params["webhook-id"],
    );

    var webhook = await client.httpRequest(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    console.log("\nWebhook Details:");
    console.log("─".repeat(80));
    console.log("ID:", webhook.id);
    console.log("App ID:", webhook.app_id);
    console.log("Target:", webhook.target);
    console.log("Target Type:", webhook.target_type);
    console.log("Triggers:");
    webhook.triggers.forEach(function (trigger) {
      console.log("  -", trigger);
    });
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
