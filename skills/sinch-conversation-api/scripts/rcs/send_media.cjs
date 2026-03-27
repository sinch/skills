#!/usr/bin/env node
/**
 * Send an RCS media message (image, video, or PDF) via Sinch Conversation API.
 *
 * Usage:
 *   node send_media.cjs --to +15551234567 --url "https://example.com/image.jpg"
 *   node send_media.cjs --to +15551234567 --url "https://example.com/video.mp4" --thumbnail-url "https://example.com/thumb.jpg"
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
      case "--url":
        args.url = argv[++i];
        break;
      case "--thumbnail-url":
        args.thumbnailUrl = argv[++i];
        break;
      case "--fallback-sms":
        args.fallbackSms = true;
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--help":
        console.log(
          "Usage: node send_media.cjs --to PHONE --url MEDIA_URL [--thumbnail-url THUMB_URL] [--fallback-sms] [--sender NUMBER]",
        );
        process.exit(0);
    }
  }
  if (!args.to || !args.url) {
    console.error("Error: --to and --url are required");
    console.error("Usage: node send_media.cjs --to PHONE --url MEDIA_URL");
    process.exit(1);
  }
  return args;
}

function sendRcsMedia(
  projectId,
  token,
  appId,
  to,
  url,
  thumbnailUrl,
  region,
  fallbackSms,
  sender,
) {
  var apiUrl = client.apiUrl(region, projectId, "messages:send");

  var mediaMsg = { url: url };
  if (thumbnailUrl) {
    mediaMsg.thumbnail_url = thumbnailUrl;
  }

  var body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: {
      media_message: mediaMsg,
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
    apiUrl,
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

  process.stderr.write("Sending RCS media message to " + args.to + "...\n");
  var result = await sendRcsMedia(
    projectId,
    token,
    appId,
    args.to,
    args.url,
    args.thumbnailUrl,
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
