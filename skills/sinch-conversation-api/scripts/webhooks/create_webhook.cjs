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

const client = require("../common/sinch_client.cjs");
const { parseArgs } = require("node:util");

const projectId = client.getEnv("SINCH_PROJECT_ID");
const keyId = client.getEnv("SINCH_KEY_ID");
const keySecret = client.getEnv("SINCH_KEY_SECRET");
const region = client.getEnv("SINCH_REGION", "us");

function parseArguments() {
  const { values } = parseArgs({
    options: {
      "app-id":              { type: "string" },
      "target":              { type: "string" },
      "triggers":            { type: "string" },
      "secret":              { type: "string" },
      "oauth-client-id":     { type: "string" },
      "oauth-client-secret": { type: "string" },
      "oauth-endpoint":      { type: "string" },
      "help":                { type: "boolean" },
    },
  });

  if (values.help) {
    console.log("Usage: node create_webhook.cjs --app-id APP_ID --target URL --triggers TRIGGERS [--secret SECRET] [--oauth-client-id ID --oauth-client-secret SECRET --oauth-endpoint URL]");
    process.exit(0);
  }

  if (!values["app-id"]) {
    console.error("Error: --app-id is required");
    process.exit(1);
  }
  if (!values.target) {
    console.error("Error: --target is required");
    process.exit(1);
  }
  if (!values.triggers) {
    console.error("Error: --triggers is required");
    process.exit(1);
  }

  if (values.target.length > 742) {
    console.error("Error: --target URL exceeds 742 character limit");
    process.exit(1);
  }

  if (!values.target.startsWith("https://")) {
    console.error("Error: --target must use HTTPS protocol");
    process.exit(1);
  }

  return values;
}

function buildWebhookPayload(params) {
  const payload = {
    app_id: params["app-id"],
    target: params.target,
    target_type: "HTTP",
    triggers: params.triggers.split(",").map((t) => t.trim()),
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
    const params = parseArguments();
    const payload = buildWebhookPayload(params);

    console.log("Creating webhook...");
    console.log("App ID:", params["app-id"]);
    console.log("Target:", params.target);
    console.log("Triggers:", payload.triggers.join(", "));

    const token = await client.getAccessToken(keyId, keySecret);
    const url = client.apiUrl(region, projectId, "webhooks");
    const body = JSON.stringify(payload);

    const result = await client.httpRequest(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
