#!/usr/bin/env node
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

var client = require("../common/sinch_client.cjs");
var readline = require("readline");

var projectId = client.getEnv("SINCH_PROJECT_ID");
var keyId = client.getEnv("SINCH_KEY_ID");
var keySecret = client.getEnv("SINCH_KEY_SECRET");
var region = client.getEnv("SINCH_REGION", "us");

function parseArgs() {
  var args = process.argv.slice(2);
  var params = {};

  for (var i = 0; i < args.length; i++) {
    if (args[i] === "--help") {
      console.log("Usage: node delete_webhook.cjs --webhook-id WEBHOOK_ID [--confirm]");
      process.exit(0);
    }
    if (args[i].startsWith("--")) {
      var key = args[i].substring(2);

      if (key === "confirm") {
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

  return params;
}

function confirmDeletion(webhookId) {
  return new Promise(function (resolve) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "\nAre you sure you want to delete webhook " + webhookId + "? (yes/no): ",
      function (answer) {
        rl.close();
        resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
      },
    );
  });
}

async function deleteWebhook() {
  try {
    var params = parseArgs();

    console.log("Preparing to delete webhook:", params["webhook-id"]);

    if (!params.confirm) {
      var confirmed = await confirmDeletion(params["webhook-id"]);
      if (!confirmed) {
        console.log("Deletion cancelled.");
        process.exit(0);
      }
    }

    var token = await client.getAccessToken(keyId, keySecret);
    var url = client.apiUrl(
      region,
      projectId,
      "webhooks/" + params["webhook-id"],
    );

    // Note: DELETE returns empty response (204 No Content)
    var https = require("https");
    var parsedUrl = new URL(url);

    await new Promise(function (resolve, reject) {
      var options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      };

      var req = https.request(options, function (res) {
        var data = "";
        res.on("data", function (chunk) {
          data += chunk;
        });
        res.on("end", function () {
          if (res.statusCode === 200 || res.statusCode === 204) {
            resolve();
          } else {
            reject(
              new Error("Delete failed (" + res.statusCode + "): " + data),
            );
          }
        });
      });

      req.on("error", reject);
      req.end();
    });

    console.log("\nWebhook deleted successfully!");
    console.log("Webhook ID:", params["webhook-id"]);
  } catch (error) {
    console.error("\nError deleting webhook:");
    console.error(error.message);
    process.exit(1);
  }
}

deleteWebhook();
