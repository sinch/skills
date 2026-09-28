#!/usr/bin/env node
/*
 * EXECUTION TOOL — not a schema reference.
 * Run this script as-is to PERFORM this task when you do not need to write
 * application code; side-effect rules still apply (billable/destructive calls
 * need explicit user approval). Do NOT copy its payload literals or logic into
 * a new codebase as if they were the API spec — for payload shape, load the
 * canonical developers.sinch.com docs linked from ../SKILL.md instead.
 */
/**
 * Send an SMS via Sinch Conversation API.
 *
 * Usage:
 *   node send_sms.js --to +15551234567 --message "Hello from Sinch!"
 *   node send_sms.js --to +15551234567 --message "Hello" --sender +15559876543
 *   node send_sms.js --to +15551234567 --message "Hello" --channel WHATSAPP
 *
 * Environment variables (required):
 *   SINCH_PROJECT_ID   - Sinch project ID
 *   SINCH_KEY_ID       - Access key ID
 *   SINCH_KEY_SECRET   - Access key secret
 *   SINCH_APP_ID       - Conversation API app ID
 *
 * Environment variables (optional):
 *   SINCH_REGION       - API region: us, eu, or br (default: us)
 */

const client = require("./common/sinch_client.cjs");
const { parseArgs } = require("node:util");

function parseArguments() {
  const { values } = parseArgs({
    options: {
      "to":      { type: "string" },
      "message": { type: "string" },
      "sender":  { type: "string" },
      "channel": { type: "string", default: "SMS" },
      "help":    { type: "boolean" },
    },
  });

  if (values.help) {
    console.log("Usage: node send_sms.js --to PHONE --message TEXT [--sender NUMBER] [--channel SMS|WHATSAPP|RCS]");
    process.exit(0);
  }

  if (!values.to || !values.message) {
    console.error("Error: --to and --message are required");
    console.error("Usage: node send_sms.js --to PHONE --message TEXT [--sender NUMBER] [--channel SMS|WHATSAPP|RCS]");
    process.exit(1);
  }

  return values;
}

function sendSms(projectId, token, appId, to, message, region, sender, channel) {
  const url = client.apiUrl(region, projectId, "messages:send");

  const body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: channel, identity: to }],
      },
    },
    message: { text_message: { text: message } },
  };

  if (sender) {
    body.channel_properties = { SMS_SENDER: sender };
  }

  const data = JSON.stringify(body);
  return client.httpRequest(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }, data);
}

async function main() {
  const args = parseArguments();

  const projectId = client.getEnv("SINCH_PROJECT_ID");
  const keyId = client.getEnv("SINCH_KEY_ID");
  const keySecret = client.getEnv("SINCH_KEY_SECRET");
  const appId = client.getEnv("SINCH_APP_ID");
  const region = client.getEnv("SINCH_REGION", "us");

  process.stderr.write("Authenticating...\n");
  const token = await client.getAccessToken(keyId, keySecret);

  process.stderr.write(`Sending ${args.channel} message to ${args.to}...\n`);
  const result = await sendSms(
    projectId, token, appId, args.to, args.message,
    region, args.sender, args.channel
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
