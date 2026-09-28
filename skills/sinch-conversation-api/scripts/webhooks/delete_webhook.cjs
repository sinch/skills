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
 * Delete a webhook.
 *
 * Usage:
 *   node delete_webhook.js --webhook-id WEBHOOK_ID
 *
 * Environment variables:
 *   SINCH_PROJECT_ID  - Your Sinch project ID (required)
 *   SINCH_KEY_ID      - Your access key ID (required)
 *   SINCH_KEY_SECRET  - Your access key secret (required)
 *   SINCH_REGION      - API region: us, eu, or br (default: us)
 *
 * Options:
 *   --webhook-id      - Webhook ID to delete (required)
 *   --confirm         - Skip confirmation prompt (flag, no value)
 *
 * Example:
 *   node delete_webhook.js --webhook-id 01WEBHOOK123456789
 *
 *   # Skip confirmation:
 *   node delete_webhook.js --webhook-id 01WEBHOOK123456789 --confirm
 */

const client = require("../common/sinch_client.cjs");
const readline = require("node:readline/promises");
const { parseArgs } = require("node:util");

const projectId = client.getEnv("SINCH_PROJECT_ID");
const keyId = client.getEnv("SINCH_KEY_ID");
const keySecret = client.getEnv("SINCH_KEY_SECRET");
const region = client.getEnv("SINCH_REGION", "us");

function parseArguments() {
  const { values } = parseArgs({
    options: {
      "webhook-id": { type: "string" },
      "confirm":    { type: "boolean", default: false },
      "help":       { type: "boolean" },
    },
  });

  if (values.help) {
    console.log("Usage: node delete_webhook.cjs --webhook-id WEBHOOK_ID [--confirm]");
    process.exit(0);
  }

  if (!values["webhook-id"]) {
    console.error("Error: --webhook-id is required");
    process.exit(1);
  }

  return values;
}

async function confirmDeletion(webhookId) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question(
      `\nAre you sure you want to delete webhook ${webhookId}? (yes/no): `,
    );
    const normalized = answer.toLowerCase();
    return normalized === "yes" || normalized === "y";
  } finally {
    rl.close();
  }
}

async function deleteWebhook() {
  try {
    const params = parseArguments();

    console.log("Preparing to delete webhook:", params["webhook-id"]);

    if (!params.confirm) {
      const confirmed = await confirmDeletion(params["webhook-id"]);
      if (!confirmed) {
        console.log("Deletion cancelled.");
        process.exit(0);
      }
    }

    const token = await client.getAccessToken(keyId, keySecret);
    const url = client.apiUrl(
      region,
      projectId,
      `webhooks/${params["webhook-id"]}`,
    );

    // Note: DELETE returns empty response (204 No Content)
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status !== 200 && res.status !== 204) {
      const body = await res.text();
      throw new Error(`Delete failed (${res.status}): ${body}`);
    }

    console.log("\nWebhook deleted successfully!");
    console.log("Webhook ID:", params["webhook-id"]);
  } catch (error) {
    console.error("\nError deleting webhook:");
    console.error(error.message);
    process.exit(1);
  }
}

deleteWebhook();
