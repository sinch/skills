#!/usr/bin/env node
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
      console.log("Usage: node list_webhooks.cjs --app-id APP_ID");
      process.exit(0);
    }
    if (args[i].startsWith("--")) {
      var key = args[i].substring(2);
      var value = args[++i];
      params[key] = value;
    }
  }

  if (!params["app-id"]) {
    console.error("Error: --app-id is required");
    process.exit(1);
  }

  return params;
}

async function listWebhooks() {
  try {
    var params = parseArgs();

    console.log("Listing webhooks for app:", params["app-id"]);

    var token = await client.getAccessToken(keyId, keySecret);
    var url = client.apiUrl(
      region,
      projectId,
      "apps/" + params["app-id"] + "/webhooks",
    );

    var result = await client.httpRequest(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!result.webhooks || result.webhooks.length === 0) {
      console.log("\nNo webhooks found for this app.");
      return;
    }

    console.log("\nFound", result.webhooks.length, "webhook(s):");
    console.log("─".repeat(80));

    result.webhooks.forEach(function (webhook, index) {
      console.log("\nWebhook", index + 1 + ":");
      console.log("  ID:", webhook.id);
      console.log("  Target:", webhook.target);
      console.log("  Triggers:", webhook.triggers.join(", "));
      console.log("  Has Secret:", webhook.secret ? "Yes" : "No");
      console.log("  Has OAuth2:", webhook.client_credentials ? "Yes" : "No");
    });

    console.log("\n" + "─".repeat(80));
    console.log("Total webhooks:", result.webhooks.length, "/ 5 maximum");
  } catch (error) {
    console.error("\nError listing webhooks:");
    console.error(error.message);
    process.exit(1);
  }
}

listWebhooks();
