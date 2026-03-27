#!/usr/bin/env node
/**
 * Send an RCS location message via Sinch Conversation API.
 *
 * Usage:
 *   node send_location.cjs --to +15551234567 --lat 37.7749 --lon -122.4194 --title "Our Office" --label "Visit us here"
 *   node send_location.cjs --to +15551234567 --lat 40.7128 --lon -74.0060
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
      case "--lat":
        args.lat = parseFloat(argv[++i]);
        break;
      case "--lon":
        args.lon = parseFloat(argv[++i]);
        break;
      case "--title":
        args.title = argv[++i];
        break;
      case "--label":
        args.label = argv[++i];
        break;
      case "--fallback-sms":
        args.fallbackSms = true;
        break;
      case "--sender":
        args.sender = argv[++i];
        break;
      case "--help":
        console.log(
          "Usage: node send_location.cjs --to PHONE --lat LATITUDE --lon LONGITUDE [--title TEXT] [--label TEXT] [--fallback-sms] [--sender NUMBER]",
        );
        process.exit(0);
    }
  }
  if (!args.to || isNaN(args.lat) || isNaN(args.lon)) {
    console.error("Error: --to, --lat, and --lon are required");
    console.error(
      "Usage: node send_location.cjs --to PHONE --lat LATITUDE --lon LONGITUDE",
    );
    process.exit(1);
  }
  return args;
}

function sendRcsLocation(
  projectId,
  token,
  appId,
  to,
  lat,
  lon,
  title,
  label,
  region,
  fallbackSms,
  sender,
) {
  var url = client.apiUrl(region, projectId, "messages:send");

  var locationMsg = {
    coordinates: {
      latitude: lat,
      longitude: lon,
    },
  };
  if (title) {
    locationMsg.title = title;
  }
  if (label) {
    locationMsg.label = label;
  }

  var body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: {
      location_message: locationMsg,
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

  process.stderr.write("Sending RCS location message to " + args.to + "...\n");
  var result = await sendRcsLocation(
    projectId,
    token,
    appId,
    args.to,
    args.lat,
    args.lon,
    args.title,
    args.label,
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
