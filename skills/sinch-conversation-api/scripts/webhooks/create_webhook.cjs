#!/usr/bin/env node
/**
 * Create a webhook for Sinch Conversation API.
 *
 * Usage:
 *   node create_webhook.js --app-id YOUR_APP_ID --target https://your-server.com/webhook --triggers MESSAGE_INBOUND,MESSAGE_DELIVERY
 *
 * Environment variables:
 *   SINCH_PROJECT_ID  - Your Sinch project ID (required)
 *   SINCH_KEY_ID      - Your access key ID (required)
 *   SINCH_KEY_SECRET  - Your access key secret (required)
 *   SINCH_REGION      - API region: us, eu, or br (default: us)
 *
 * Options:
 *   --app-id          - Conversation API app ID (required)
 *   --target          - Webhook target URL (HTTPS required, max 742 chars) (required)
 *   --triggers        - Comma-separated list of triggers (required)
 *   --secret          - Optional HMAC secret for signature verification
 *   --oauth-client-id - Optional OAuth2 client ID for webhook authentication
 *   --oauth-client-secret - Optional OAuth2 client secret
 *   --oauth-endpoint  - Optional OAuth2 token endpoint URL
 *
 * Example:
 *   node create_webhook.js \
 *     --app-id 01EB37HMH1M6SV18ASNS3G135H \
 *     --target https://my-server.com/webhooks/sinch \
 *     --triggers MESSAGE_INBOUND,MESSAGE_DELIVERY,EVENT_INBOUND \
 *     --secret my-webhook-secret-123
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
      console.log("Usage: node create_webhook.cjs --app-id APP_ID --target URL --triggers TRIGGERS [--secret SECRET] [--oauth-client-id ID --oauth-client-secret SECRET --oauth-endpoint URL]");
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
  if (!params.target) {
    console.error("Error: --target is required");
    process.exit(1);
  }
  if (!params.triggers) {
    console.error("Error: --triggers is required");
    process.exit(1);
  }

  if (params.target.length > 742) {
    console.error("Error: --target URL exceeds 742 character limit");
    process.exit(1);
  }

  if (!params.target.startsWith("https://")) {
    console.error("Error: --target must use HTTPS protocol");
    process.exit(1);
  }

  return params;
}

function buildWebhookPayload(params) {
  var payload = {
    app_id: params["app-id"],
    target: params.target,
    target_type: "HTTP",
    triggers: params.triggers.split(",").map(function (t) {
      return t.trim();
    }),
  };

  if (params.secret) {
    payload.secret = params.secret;
  }

  if (
    params["oauth-client-id"] &&
    params["oauth-client-secret"] &&
    params["oauth-endpoint"]
  ) {
    payload.client_credentials = {
      client_id: params["oauth-client-id"],
      client_secret: params["oauth-client-secret"],
      endpoint: params["oauth-endpoint"],
      token_request_type: "BASIC",
    };
  }

  return payload;
}

async function createWebhook() {
  try {
    var params = parseArgs();
    var payload = buildWebhookPayload(params);

    console.log("Creating webhook...");
    console.log("App ID:", params["app-id"]);
    console.log("Target:", params.target);
    console.log("Triggers:", payload.triggers.join(", "));

    var token = await client.getAccessToken(keyId, keySecret);
    var url = client.apiUrl(region, projectId, "webhooks");
    var body = JSON.stringify(payload);

    var result = await client.httpRequest(
      url,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
      body,
    );

    console.log("\nWebhook created successfully!");
    console.log("Webhook ID:", result.id);
    console.log("Full response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\nError creating webhook:");
    console.error(error.message);
    process.exit(1);
  }
}

createWebhook();
