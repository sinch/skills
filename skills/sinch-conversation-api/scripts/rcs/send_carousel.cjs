#!/usr/bin/env node
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

var client = require("../common/sinch_client.cjs");

function parseArgs(argv) {
  var args = { fallbackSms: false };
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--to":
        args.to = argv[++i];
        break;
      case "--cards":
        try {
          args.cards = JSON.parse(argv[++i]);
        } catch (e) {
          console.error("Error: --cards must be valid JSON array");
          process.exit(1);
        }
        break;
      case "--outer-choices":
        args.outerChoices = argv[++i].split(",");
        break;
      case "--fallback-sms":
        args.fallbackSms = true;
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--help":
        console.log(
          'Usage: node send_carousel.cjs --to PHONE --cards JSON_ARRAY [--outer-choices "Choice1,Choice2"] [--fallback-sms] [--sender NUMBER]',
        );
        console.log(
          'Example JSON: \'[{"title":"Card1","description":"Desc1","image":"https://...","choices":["Buy","Learn More"]}]\'',
        );
        process.exit(0);
    }
  }
  if (!args.to || !args.cards) {
    console.error("Error: --to and --cards are required");
    console.error(
      "Usage: node send_carousel.cjs --to PHONE --cards JSON_ARRAY",
    );
    process.exit(1);
  }
  if (args.cards.length < 2 || args.cards.length > 10) {
    console.error("Error: carousel must have 2-10 cards");
    process.exit(1);
  }
  return args;
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
  var url = client.apiUrl(region, projectId, "messages:send");

  var cardsArray = cards.map(function (card) {
    var cardMsg = {
      title: card.title,
      description: card.description,
    };
    if (card.image) {
      cardMsg.media_message = { url: card.image };
    }
    if (card.choices && card.choices.length > 0) {
      cardMsg.choices = card.choices.map(function (choice) {
        return {
          text_message: { text: choice },
          postback_data: choice.toLowerCase().replace(/ /g, "_"),
        };
      });
    }
    return cardMsg;
  });

  var choicesArray = [];
  if (outerChoices && outerChoices.length > 0) {
    choicesArray = outerChoices.map(function (choice) {
      return {
        text_message: { text: choice },
        postback_data: choice.toLowerCase().replace(/ /g, "_"),
      };
    });
  }

  var body = {
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

  process.stderr.write("Sending RCS carousel message to " + args.to + "...\n");
  var result = await sendRcsCarousel(
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

main().catch(function (err) {
  console.error(err.message);
  process.exit(1);
});
