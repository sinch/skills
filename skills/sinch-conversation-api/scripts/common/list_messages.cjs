#!/usr/bin/env node
/**
 * List messages from Sinch Conversation API.
 *
 * Usage:
 *   node list_messages.js
 *   node list_messages.js --contact-id CONTACT_ID
 *   node list_messages.js --channel SMS --page-size 20
 *   node list_messages.js --conversation-id CONV_ID
 *
 * Environment variables (required):
 *   SINCH_PROJECT_ID   - Sinch project ID
 *   SINCH_KEY_ID       - Access key ID
 *   SINCH_KEY_SECRET   - Access key secret
 *
 * Environment variables (optional):
 *   SINCH_REGION       - API region: us, eu, or br (default: us)
 */

var querystring = require("querystring");
var client = require("./sinch_client.cjs");

function parseArgs(argv) {
  var args = { pageSize: 10 };
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--contact-id":
        args.contactId = argv[++i];
        break;
      case "--conversation-id":
        args.conversationId = argv[++i];
        break;
      case "--channel":
        args.channel = argv[++i];
        break;
      case "--app-id":
        args.appId = argv[++i];
        break;
      case "--page-size":
        args.pageSize = parseInt(argv[++i], 10);
        break;
      case "--page-token":
        args.pageToken = argv[++i];
        break;
      case "--help":
        console.log("Usage: node list_messages.js [--contact-id ID] [--conversation-id ID] [--channel SMS] [--page-size 10] [--page-token TOKEN]");
        process.exit(0);
    }
  }
  return args;
}

function listMessages(projectId, token, region, options) {
  var params = { page_size: String(options.pageSize || 10) };
  if (options.contactId) params.contact_id = options.contactId;
  if (options.conversationId) params.conversation_id = options.conversationId;
  if (options.channel) params.channel = options.channel;
  if (options.appId) params.app_id = options.appId;
  if (options.pageToken) params.page_token = options.pageToken;

  var query = querystring.stringify(params);
  var url = client.apiUrl(region, projectId, "messages?" + query);

  return client.httpRequest(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
}

function extractText(msg) {
  var contactMsg = msg.contact_message;
  if (contactMsg && contactMsg.text_message) {
    return contactMsg.text_message.text || "";
  }

  var appMsg = msg.app_message;
  if (appMsg && appMsg.text_message) {
    return appMsg.text_message.text || "";
  }

  return "(non-text message)";
}

function printMessage(msg) {
  var msgId = msg.id || "N/A";
  var acceptTime = msg.accept_time || "N/A";
  var direction = msg.direction || "N/A";
  var channelIdentity = msg.channel_identity || {};
  var msgChannel = channelIdentity.channel || "N/A";
  var identity = channelIdentity.identity || "N/A";
  var text = extractText(msg);

  console.log("[" + acceptTime + "] " + direction + " via " + msgChannel + " (" + identity + "): " + text);
  console.log("  ID: " + msgId);
  console.log();
}

async function main() {
  var args = parseArgs(process.argv);

  var projectId = client.getEnv("SINCH_PROJECT_ID");
  var keyId = client.getEnv("SINCH_KEY_ID");
  var keySecret = client.getEnv("SINCH_KEY_SECRET");
  var region = client.getEnv("SINCH_REGION", "us");

  process.stderr.write("Authenticating...\n");
  var token = await client.getAccessToken(keyId, keySecret);

  process.stderr.write("Listing messages...\n");
  var result = await listMessages(projectId, token, region, args);

  var messages = result.messages || [];
  var nextToken = result.next_page_token;

  if (messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  var reversed = messages.slice().reverse();
  for (var i = 0; i < reversed.length; i++) {
    printMessage(reversed[i]);
  }

  if (nextToken) {
    console.log("Next page token: " + nextToken);
  }
}

main().catch(function (err) {
  console.error(err.message);
  process.exit(1);
});
