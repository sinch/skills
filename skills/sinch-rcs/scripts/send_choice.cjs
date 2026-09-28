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
 * Send an RCS choice message with interactive buttons via Sinch Conversation API.
 *
 * Usage:
 *   node send_choice.cjs --to +15551234567 --message "Choose an option:" --choices "Yes,No,Maybe"
 *   node send_choice.cjs --to +15551234567 --message "What's next?" --choices "Call Us|tel:+15551234567,Visit|https://example.com"
 *   node send_choice.cjs --to +15551234567 --message "Share your location:" --choices "Share location|loc:https://maps.google.com"
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
      "to":           { type: "string" },
      "message":      { type: "string" },
      "choices":      { type: "string" },
      "fallback-sms": { type: "boolean", default: false },
      "sender":       { type: "string" },
      "help":         { type: "boolean" },
    },
  });

  if (values.help) {
    console.log(
      'Usage: node send_choice.cjs --to PHONE --message TEXT --choices "Choice1,Choice2"',
    );
    console.log(
      'For URL/Call/Location actions: --choices "Call|tel:+15551234567,Visit|https://example.com,Share|loc:https://maps.google.com"',
    );
    process.exit(0);
  }

  if (!values.to || !values.message || !values.choices) {
    console.error("Error: --to, --message, and --choices are required");
    console.error(
      'Usage: node send_choice.cjs --to PHONE --message TEXT --choices "Choice1,Choice2"',
    );
    process.exit(1);
  }

  return {
    to: values.to,
    message: values.message,
    choices: values.choices.split(","),
    fallbackSms: values["fallback-sms"],
    sender: values.sender,
  };
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
  const url = client.apiUrl(region, projectId, "messages:send");

  const choicesArray = choices.map((choice) => {
    const parts = choice.split("|");
    const text = parts[0];
    const action = parts[1];

    const choiceMsg = {
      postback_data: text.toLowerCase().replaceAll(" ", "_"),
    };

    if (action) {
      if (action.startsWith("http://") || action.startsWith("https://")) {
        choiceMsg.url_message = { title: text, url: action };
      } else if (action.startsWith("tel:")) {
        choiceMsg.call_message = { title: text, phone_number: action.replace("tel:", "") };
      } else if (action.startsWith("loc:")) {
        choiceMsg.share_location_message = { title: text, fallback_url: action.replace("loc:", "") };
      } else {
        choiceMsg.text_message = { text: text };
      }
    } else {
      choiceMsg.text_message = { text: text };
    }

    return choiceMsg;
  });

  const body = {
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

  const data = JSON.stringify(body);
  return client.httpRequest(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
    data,
  );
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

  process.stderr.write(`Sending RCS choice message to ${args.to}...\n`);
  const result = await sendRcsChoice(
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

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
