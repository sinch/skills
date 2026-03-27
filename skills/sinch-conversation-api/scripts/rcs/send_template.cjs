#!/usr/bin/env node
/**
 * Send an RCS template message via Sinch Conversation API.
 *
 * Usage:
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"John"}'
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"María"}' --language es
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"John"}' --fallback-sms --sender +15559876543
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
      case "--template-id":
        args.templateId = argv[++i];
        break;
      case "--params":
        args.params = argv[++i];
        break;
      case "--language":
        args.language = argv[++i];
        break;
      case "--fallback-sms":
        args.fallbackSms = true;
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--help":
        console.log(
          "Usage: node send_template.cjs --to PHONE --template-id ID --params JSON [--language CODE] [--fallback-sms] [--sender NUMBER]",
        );
        console.log("\nExamples:");
        console.log(
          '  node send_template.cjs --to +15551234567 --template-id 01ABC --params \'{"name":"John","order":"123"}\'',
        );
        console.log(
          '  node send_template.cjs --to +15551234567 --template-id 01ABC --params \'{"name":"María"}\' --language es',
        );
        process.exit(0);
    }
  }
  if (!args.to || !args.templateId || !args.params) {
    console.error("Error: --to, --template-id, and --params are required");
    console.error(
      "Usage: node send_template.cjs --to PHONE --template-id ID --params JSON",
    );
    process.exit(1);
  }

  // Parse JSON parameters
  try {
    args.parsedParams = JSON.parse(args.params);
  } catch (e) {
    console.error("Error: --params must be valid JSON");
    console.error("Example: --params '{\"name\":\"John\",\"order\":\"123\"}'");
    process.exit(1);
  }

  return args;
}

function sendRcsTemplate(
  projectId,
  token,
  appId,
  to,
  templateId,
  parameters,
  region,
  languageCode,
  fallbackSms,
  sender,
) {
  var url = client.apiUrl(region, projectId, "messages:send");

  var templateMessage = {
    template_id: templateId,
    parameters: parameters,
  };

  if (languageCode) {
    templateMessage.language_code = languageCode;
  }

  var body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: { template_message: templateMessage },
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

// Main execution
(function main() {
  var args = parseArgs(process.argv);
  var projectId = client.getEnv("SINCH_PROJECT_ID");
  var keyId = client.getEnv("SINCH_KEY_ID");
  var keySecret = client.getEnv("SINCH_KEY_SECRET");
  var appId = client.getEnv("SINCH_APP_ID");
  var region = client.getEnv("SINCH_REGION", "us");

  console.log("Sending RCS template message...");
  console.log("To:", args.to);
  console.log("Template ID:", args.templateId);
  console.log("Parameters:", JSON.stringify(args.parsedParams));
  if (args.language) {
    console.log("Language:", args.language);
  }
  if (args.fallbackSms) {
    console.log("SMS fallback: enabled");
    if (args.sender) {
      console.log("SMS sender:", args.sender);
    }
  }

  client
    .getAccessToken(keyId, keySecret)
    .then(function (token) {
      return sendRcsTemplate(
        projectId,
        token,
        appId,
        args.to,
        args.templateId,
        args.parsedParams,
        region,
        args.language,
        args.fallbackSms,
        args.sender,
      );
    })
    .then(function (response) {
      console.log("\nTemplate message sent successfully.");
      console.log("Message ID:", response.message_id);
      if (response.accepted_time) {
        console.log("Accepted time:", response.accepted_time);
      }
    })
    .catch(function (error) {
      console.error("\nFailed to send template message:");
      console.error(error.message || error);
      process.exit(1);
    });
})();
