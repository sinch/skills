#!/usr/bin/env node
/**
 * Make a conference callout via Sinch Voice API.
 *
 * Usage:
 *   node make_conference_call.cjs --to +14045005000 --conference-id myRoom
 *   node make_conference_call.cjs --to +14045005000 --conference-id myRoom --cli +14045001000
 *
 * Environment variables (required):
 *   SINCH_APPLICATION_KEY    - Voice application key
 *   SINCH_APPLICATION_SECRET - Voice application secret
 *
 * Environment variables (optional):
 *   SINCH_VOICE_REGION       - API region (default: global)
 */

var client = require("../common/voice_client.cjs");

function parseArgs(argv) {
  var args = {};
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--to": args.to = argv[++i]; break;
      case "--conference-id": args.conferenceId = argv[++i]; break;
      case "--cli": args.cli = argv[++i]; break;
      case "--help":
        console.log("Usage: node make_conference_call.cjs --to PHONE --conference-id ID [--cli NUMBER]");
        process.exit(0);
    }
  }
  if (!args.to || !args.conferenceId) {
    console.error("Error: --to and --conference-id are required");
    process.exit(1);
  }
  return args;
}

async function main() {
  var args = parseArgs(process.argv);
  var appKey = client.getEnv("SINCH_APPLICATION_KEY");
  var appSecret = client.getEnv("SINCH_APPLICATION_SECRET");
  var region = process.env.SINCH_VOICE_REGION || "global";

  var baseUrl = client.getBaseUrl(region);
  var url = baseUrl + "/calling/v1/callouts";

  var body = {
    method: "conferenceCallout",
    conferenceCallout: {
      destination: { type: "number", endpoint: args.to },
      conferenceId: args.conferenceId,
      enableAce: true,
      enableDice: true,
    },
  };
  if (args.cli) body.conferenceCallout.cli = args.cli;

  var result = await client.httpRequest(url, {
    method: "POST",
    headers: {
      Authorization: client.getAuthHeader(appKey, appSecret),
      "Content-Type": "application/json",
    },
  }, JSON.stringify(body));

  console.log("Conference call placed successfully:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(function (err) {
  console.error("Error:", err.message);
  process.exit(1);
});
