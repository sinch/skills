#!/usr/bin/env node
/**
 * Update an existing webhook.
 *
 * Usage:
 *   node update_webhook.js --webhook-id WEBHOOK_ID [options]
 *
 * Environment variables:
 *   SINCH_PROJECT_ID  - Your Sinch project ID (required)
 *   SINCH_KEY_ID      - Your access key ID (required)
 *   SINCH_KEY_SECRET  - Your access key secret (required)
 *   SINCH_REGION      - API region: us, eu, or br (default: us)
 *
 * Options:
 *   --webhook-id      - Webhook ID to update (required)
 *   --target          - New webhook target URL (HTTPS required, max 742 chars)
 *   --triggers        - New comma-separated list of triggers
 *   --secret          - New HMAC secret for signature verification
 *   --clear-secret    - Remove the HMAC secret (flag, no value)
 *   --oauth-client-id - New OAuth2 client ID
 *   --oauth-client-secret - New OAuth2 client secret
 *   --oauth-endpoint  - New OAuth2 token endpoint URL
 *   --clear-oauth     - Remove OAuth2 configuration (flag, no value)
 *
 * Example:
 *   node update_webhook.js \
 *     --webhook-id 01WEBHOOK123456789 \
 *     --target https://new-url.com/webhook \
 *     --triggers MESSAGE_INBOUND,MESSAGE_DELIVERY,EVENT_INBOUND
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
      console.log("Usage: node update_webhook.cjs --webhook-id WEBHOOK_ID [--target URL] [--triggers TRIGGERS] [--secret SECRET] [--clear-secret] [--clear-oauth]");
      process.exit(0);
    }
    if (args[i].startsWith("--")) {
      var key = args[i].substring(2);

      if (key === "clear-secret" || key === "clear-oauth") {
        params[key] = true;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        params[key] = args[++i];
      }
    }
  }

  if (!params["webhook-id"]) {
    console.error("Error: --webhook-id is required");
    process.exit(1);
  }

  if (params.target && params.target.length > 742) {
    console.error("Error: --target URL exceeds 742 character limit");
    process.exit(1);
  }

  if (params.target && !params.target.startsWith("https://")) {
    console.error("Error: --target must use HTTPS protocol");
    process.exit(1);
  }

  return params;
}

function buildUpdatePayloadAndMask(params) {
  var payload = {};
  var updateMask = [];

  if (params.target) {
    payload.target = params.target;
    updateMask.push("target");
  }

  if (params.triggers) {
    payload.triggers = params.triggers.split(",").map(function (t) {
      return t.trim();
    });
    updateMask.push("triggers");
  }

  if (params.secret) {
    payload.secret = params.secret;
    updateMask.push("secret");
  } else if (params["clear-secret"]) {
    payload.secret = "";
    updateMask.push("secret");
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
    updateMask.push("client_credentials");
  } else if (params["clear-oauth"]) {
    payload.client_credentials = null;
    updateMask.push("client_credentials");
  }

  if (updateMask.length === 0) {
    console.error("Error: No fields specified to update");
    console.error(
      "Use one or more of: --target, --triggers, --secret, --oauth-*, or --clear-*",
    );
    process.exit(1);
  }

  return { payload: payload, updateMask: updateMask };
}

async function updateWebhook() {
  try {
    var params = parseArgs();
    var update = buildUpdatePayloadAndMask(params);

    console.log("Updating webhook:", params["webhook-id"]);
    console.log("Fields to update:", update.updateMask.join(", "));

    var token = await client.getAccessToken(keyId, keySecret);
    var baseUrl = client.apiUrl(
      region,
      projectId,
      "webhooks/" + params["webhook-id"],
    );
    var url = baseUrl + "?update_mask=" + update.updateMask.join(",");
    var body = JSON.stringify(update.payload);

    var result = await client.httpRequest(
      url,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
      body,
    );

    console.log("\nWebhook updated successfully!");
    console.log("Full response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\nError updating webhook:");
    console.error(error.message);
    process.exit(1);
  }
}

updateWebhook();
