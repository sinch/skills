#!/usr/bin/env node
/**
 * Send an RCS choice message with interactive buttons via Sinch Conversation API.
 *
 * Usage:
 *   node send_choice.cjs --to +15551234567 --message "Choose an option:" --choices "Yes,No,Maybe"
 *   node send_choice.cjs --to +15551234567 --message "What's next?" --choices "Call Us|tel:+15551234567,Visit|https://example.com"
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
      case "--choices":
        args.choices = argv[++i].split(",");
        break;
      case "--fallback-sms":
        args.fallbackSms = true;
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--help":
        console.log(
          'Usage: node send_choice.cjs --to PHONE --message TEXT --choices "Choice1,Choice2"',
        );
        console.log(
          'For URL/Call actions: --choices "Call|tel:+15551234567,Visit|https://example.com"',
        );
        process.exit(0);
    }
  }
  if (!args.to || !args.message || !args.choices) {
    console.error("Error: --to, --message, and --choices are required");
    console.error(
      'Usage: node send_choice.cjs --to PHONE --message TEXT --choices "Choice1,Choice2"',
    );
    process.exit(1);
  }
  return args;
}

function sendRcsChoice(
  projectId,
  token,
  appId,
  to,
  message,
  choices,
  region,
  fallbackSms,
  sender,
) {
  var url = client.apiUrl(region, projectId, "messages:send");

  var choicesArray = choices.map(function (choice) {
    var parts = choice.split("|");
    var text = parts[0];
    var action = parts[1];

    var choiceMsg = {
      text_message: { text: text },
      postback_data: text.toLowerCase().replace(/ /g, "_"),
    };

    if (action) {
      if (action.startsWith("http://") || action.startsWith("https://")) {
        choiceMsg.url_message = { url: action };
      } else if (action.startsWith("tel:")) {
        choiceMsg.call_message = { phone_number: action.replace("tel:", "") };
      }
    }

    return choiceMsg;
  });

  var body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: {
      choice_message: {
        text_message: { text: message },
        choices: choicesArray,
      },
    },
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

  process.stderr.write("Sending RCS choice message to " + args.to + "...\n");
  var result = await sendRcsChoice(
    projectId,
    token,
    appId,
    args.to,
    args.message,
    args.choices,
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
