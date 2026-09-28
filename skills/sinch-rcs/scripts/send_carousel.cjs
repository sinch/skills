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
 * Send an RCS carousel message via Sinch Conversation API.
 *
 * Usage:
 *   node send_carousel.cjs --to +15551234567 --cards '[{"title":"Card1","description":"Desc1","image":"https://..."},{"title":"Card2","description":"Desc2","image":"https://..."}]'
 *   node send_carousel.cjs --to +15551234567 --cards '[...]' --outer-choices "View All,Contact Us"
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
      "to":            { type: "string" },
      "cards":         { type: "string" },
      "outer-choices": { type: "string" },
      "fallback-sms":  { type: "boolean", default: false },
      "sender":        { type: "string" },
      "help":          { type: "boolean" },
    },
  });

  if (values.help) {
    console.log(
      'Usage: node send_carousel.cjs --to PHONE --cards JSON_ARRAY [--outer-choices "Choice1,Choice2"] [--fallback-sms] [--sender NUMBER]',
    );
    console.log(
      'Example JSON: \'[{"title":"Card1","description":"Desc1","image":"https://...","choices":["Buy","Learn More"]}]\'',
    );
    process.exit(0);
  }

  if (!values.to || !values.cards) {
    console.error("Error: --to and --cards are required");
    console.error(
      "Usage: node send_carousel.cjs --to PHONE --cards JSON_ARRAY",
    );
    process.exit(1);
  }

  let cards;
  try {
    cards = JSON.parse(values.cards);
  } catch {
    console.error("Error: --cards must be valid JSON array");
    process.exit(1);
  }

  if (cards.length < 1 || cards.length > 10) {
    console.error("Error: carousel must have 1-10 cards");
    process.exit(1);
  }

  return {
    to: values.to,
    cards,
    outerChoices: values["outer-choices"] ? values["outer-choices"].split(",") : undefined,
    fallbackSms: values["fallback-sms"],
    sender: values.sender,
  };
}

function sendRcsCarousel(
  projectId,
  token,
  appId,
  to,
  cards,
  outerChoices,
  region,
  fallbackSms,
  sender,
) {
  const url = client.apiUrl(region, projectId, "messages:send");

  const cardsArray = cards.map((card) => {
    const cardMsg = {
      title: card.title,
      description: card.description,
    };
    if (card.image) {
      cardMsg.media_message = { url: card.image };
    }
    if (card.choices && card.choices.length > 0) {
      cardMsg.choices = card.choices.map((choice) => ({
        text_message: { text: choice },
        postback_data: choice.toLowerCase().replaceAll(" ", "_"),
      }));
    }
    return cardMsg;
  });

  let choicesArray = [];
  if (outerChoices && outerChoices.length > 0) {
    choicesArray = outerChoices.map((choice) => ({
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
      carousel_message: {
        cards: cardsArray,
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

  process.stderr.write(`Sending RCS carousel message to ${args.to}...\n`);
  const result = await sendRcsCarousel(
    projectId,
    token,
    appId,
    args.to,
    args.cards,
    args.outerChoices,
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
