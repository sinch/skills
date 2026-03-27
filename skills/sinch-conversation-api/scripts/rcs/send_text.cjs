#!/usr/bin/env node
/**
 * Send an RCS text message via Sinch Conversation API.
 *
 * Usage:
 *   node send_text.cjs --to +15551234567 --message "Hello from RCS!"
 *   node send_text.cjs --to +15551234567 --message "Hello" --fallback-sms --sender +15559876543
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
  var args = { fallbackSms: false };
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--to":
        args.to = argv[++i];
        break;
      case "--message":
        args.message = argv[++i];
        break;
      case "--fallback-sms":
        args.fallbackSms = true;
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--help":
        console.log(
          "Usage: node send_text.cjs --to PHONE --message TEXT [--fallback-sms] [--sender NUMBER]",
        );
        process.exit(0);
    }
  }
  if (!args.to || !args.message) {
    console.error("Error: --to and --message are required");
    console.error(
      "Usage: node send_text.cjs --to PHONE --message TEXT [--fallback-sms] [--sender NUMBER]",
    );
    process.exit(1);
  }
  return args;
}

function sendRcsText(
  projectId,
  token,
  appId,
  to,
  message,
  region,
  fallbackSms,
  sender,
) {
  var url = client.apiUrl(region, projectId, "messages:send");

  var body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: { text_message: { text: message } },
  };

  if (fallbackSms) {
    body.channel_priority_order = ["RCS", "SMS"];
    body.recipient.identified_by.channel_identities.push({
      channel: "SMS",
      identity: to,
    });
    if (sender) {
      body.channel_properties = { SMS_SENDER: sender };
    }
  }

  var data = JSON.stringify(body);
  return client.httpRequest(
    url,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    },
    data,
  );
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

  process.stderr.write("Sending RCS text message to " + args.to + "...\n");
  var result = await sendRcsText(
    projectId,
    token,
    appId,
    args.to,
    args.message,
    region,
    args.fallbackSms,
    args.sender,
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch(function (err) {
  console.error(err.message);
  process.exit(1);
});
