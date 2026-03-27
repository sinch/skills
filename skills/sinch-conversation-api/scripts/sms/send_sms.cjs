#!/usr/bin/env node
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

var client = require("../common/sinch_client.cjs");

function parseArgs(argv) {
  var args = { channel: "SMS" };
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--to":
        args.to = argv[++i];
        break;
      case "--message":
        args.message = argv[++i];
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--channel":
        args.channel = argv[++i];
        break;
      case "--help":
        console.log("Usage: node send_sms.js --to PHONE --message TEXT [--sender NUMBER] [--channel SMS|WHATSAPP|RCS]");
        process.exit(0);
    }
  }
  if (!args.to || !args.message) {
    console.error("Error: --to and --message are required");
    console.error("Usage: node send_sms.js --to PHONE --message TEXT [--sender NUMBER] [--channel SMS|WHATSAPP|RCS]");
    process.exit(1);
  }
  return args;
}

function sendSms(projectId, token, appId, to, message, region, sender, channel) {
  var url = client.apiUrl(region, projectId, "messages:send");

  var body = {
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

  var data = JSON.stringify(body);
  return client.httpRequest(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  }, data);
}

async function main() {
  var args = parseArgs(process.argv);

  var projectId = client.getEnv("SINCH_PROJECT_ID");
  var keyId = client.getEnv("SINCH_KEY_ID");
  var keySecret = client.getEnv("SINCH_KEY_SECRET");
  var appId = client.getEnv("SINCH_APP_ID");
  var region = client.getEnv("SINCH_REGION", "us");

  process.stderr.write("Authenticating...\n");
  var token = await client.getAccessToken(keyId, keySecret);

  process.stderr.write("Sending " + args.channel + " message to " + args.to + "...\n");
  var result = await sendSms(
    projectId, token, appId, args.to, args.message,
    region, args.sender, args.channel
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch(function (err) {
  console.error(err.message);
  process.exit(1);
});
