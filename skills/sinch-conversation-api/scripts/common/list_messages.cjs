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

const client = require("./sinch_client.cjs");
const { parseArgs } = require("node:util");

function parseArguments() {
  const { values } = parseArgs({
    options: {
      "contact-id":      { type: "string" },
      "conversation-id": { type: "string" },
      "channel":         { type: "string" },
      "app-id":          { type: "string" },
      "page-size":       { type: "string" },
      "page-token":      { type: "string" },
      "help":            { type: "boolean" },
    },
  });

  if (values.help) {
    console.log("Usage: node list_messages.js [--contact-id ID] [--conversation-id ID] [--channel SMS] [--page-size 10] [--page-token TOKEN]");
    process.exit(0);
  }

  return {
    contactId: values["contact-id"],
    conversationId: values["conversation-id"],
    channel: values.channel,
    appId: values["app-id"],
    pageSize: values["page-size"] !== undefined ? parseInt(values["page-size"], 10) : 10,
    pageToken: values["page-token"],
  };
}

function listMessages(projectId, token, region, options) {
  const params = { page_size: String(options.pageSize || 10) };
  if (options.contactId) params.contact_id = options.contactId;
  if (options.conversationId) params.conversation_id = options.conversationId;
  if (options.channel) params.channel = options.channel;
  if (options.appId) params.app_id = options.appId;
  if (options.pageToken) params.page_token = options.pageToken;

  const query = new URLSearchParams(params).toString();
  const url = client.apiUrl(region, projectId, `messages?${query}`);

  return client.httpRequest(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

function extractText(msg) {
  const contactMsg = msg.contact_message;
  if (contactMsg && contactMsg.text_message) {
    return contactMsg.text_message.text || "";
  }

  const appMsg = msg.app_message;
  if (appMsg && appMsg.text_message) {
    return appMsg.text_message.text || "";
  }

  return "(non-text message)";
}

function printMessage(msg) {
  const msgId = msg.id || "N/A";
  const acceptTime = msg.accept_time || "N/A";
  const direction = msg.direction || "N/A";
  const channelIdentity = msg.channel_identity || {};
  const msgChannel = channelIdentity.channel || "N/A";
  const identity = channelIdentity.identity || "N/A";
  const text = extractText(msg);

  console.log(`[${acceptTime}] ${direction} via ${msgChannel} (${identity}): ${text}`);
  console.log(`  ID: ${msgId}`);
  console.log();
}

async function main() {
  const args = parseArguments();

  const projectId = client.getEnv("SINCH_PROJECT_ID");
  const keyId = client.getEnv("SINCH_KEY_ID");
  const keySecret = client.getEnv("SINCH_KEY_SECRET");
  const region = client.getEnv("SINCH_REGION", "us");

  process.stderr.write("Authenticating...\n");
  const token = await client.getAccessToken(keyId, keySecret);

  process.stderr.write("Listing messages...\n");
  const result = await listMessages(projectId, token, region, args);

  const messages = result.messages || [];
  const nextToken = result.next_page_token;

  if (messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  const reversed = messages.slice().reverse();
  for (const msg of reversed) {
    printMessage(msg);
  }

  if (nextToken) {
    console.log(`Next page token: ${nextToken}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
