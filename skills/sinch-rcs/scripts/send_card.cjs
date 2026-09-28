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
 * Send an RCS card message via Sinch Conversation API.
 *
 * Usage:
 *   node send_card.cjs --to +15551234567 --title "Sale" --description "50% off" --image-url "https://..." --choices "Shop Now,Learn More"
 *   node send_card.cjs --to +15551234567 --title "Product" --description "Amazing features" --image-url "https://..." --fallback-sms
 *   node send_card.cjs --to +15551234567 --title "Deal" --description "Tap to open" --image-url "https://..." --orientation HORIZONTAL --alignment RIGHT
 *   node send_card.cjs --to +15551234567 --title "Webview" --description "Opens in tall webview" --image-url "https://..." --webview-mode TALL
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
      "title":        { type: "string" },
      "description":  { type: "string" },
      "image-url":    { type: "string" },
      "choices":      { type: "string" },
      "fallback-sms": { type: "boolean", default: false },
      "sender":       { type: "string" },
      "orientation":  { type: "string" },
      "alignment":    { type: "string" },
      "webview-mode": { type: "string" },
      "help":         { type: "boolean" },
    },
  });

  if (values.help) {
    console.log(
      "Usage: node send_card.cjs --to PHONE --title TEXT --description TEXT --image-url URL" +
      ' [--choices "Choice1,Choice2"] [--fallback-sms] [--sender NUMBER]' +
      " [--orientation HORIZONTAL|VERTICAL] [--alignment LEFT|RIGHT] [--webview-mode TALL|FULL|HALF]",
    );
    process.exit(0);
  }

  if (!values.to || !values.title || !values.description || !values["image-url"]) {
    console.error(
      "Error: --to, --title, --description, and --image-url are required",
    );
    console.error(
      "Usage: node send_card.cjs --to PHONE --title TEXT --description TEXT --image-url URL" +
      ' [--choices "Choice1,Choice2"] [--orientation HORIZONTAL|VERTICAL] [--alignment LEFT|RIGHT] [--webview-mode TALL|FULL|HALF]',
    );
    process.exit(1);
  }

  return {
    to: values.to,
    title: values.title,
    description: values.description,
    imageUrl: values["image-url"],
    choices: values.choices ? values.choices.split(",") : undefined,
    fallbackSms: values["fallback-sms"],
    sender: values.sender,
    orientation: values.orientation,
    alignment: values.alignment,
    webviewMode: values["webview-mode"],
  };
}

function sendRcsCard(
  projectId,
  token,
  appId,
  to,
  title,
  description,
  imageUrl,
  choices,
  region,
  fallbackSms,
  sender,
  orientation,
  alignment,
  webviewMode,
) {
  const url = client.apiUrl(region, projectId, "messages:send");

  let choicesArray = [];
  if (choices && choices.length > 0) {
    choicesArray = choices.map((choice) => ({
      text_message: { text: choice },
      postback_data: choice.toLowerCase().replaceAll(" ", "_"),
    }));
  }

  const body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: {
      card_message: {
        title: title,
        description: description,
        media_message: { url: imageUrl },
        choices: choicesArray,
      },
    },
  };

  // Build channel_properties by merging all applicable properties
  const channelProperties = {};

  if (orientation) {
    channelProperties.RCS_CARD_ORIENTATION = orientation;
  }
  if (alignment) {
    channelProperties.RCS_CARD_THUMBNAIL_IMAGE_ALIGNMENT = alignment;
  }
  if (webviewMode) {
    channelProperties.RCS_WEBVIEW_MODE = webviewMode;
  }

  if (fallbackSms) {
    body.channel_priority_order = ["RCS", "SMS"];
    body.recipient.identified_by.channel_identities.push({
      channel: "SMS",
      identity: to,
    });
    if (sender) {
      channelProperties.SMS_SENDER = sender;
    }
  }

  if (Object.keys(channelProperties).length > 0) {
    body.channel_properties = channelProperties;
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

  process.stderr.write(`Sending RCS card message to ${args.to}...\n`);
  const result = await sendRcsCard(
    projectId,
    token,
    appId,
    args.to,
    args.title,
    args.description,
    args.imageUrl,
    args.choices,
    region,
    args.fallbackSms,
    args.sender,
    args.orientation,
    args.alignment,
    args.webviewMode,
  );

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
