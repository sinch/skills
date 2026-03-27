#!/usr/bin/env node
/**
 * Make a TTS callout via Sinch Voice API.
 *
 * Usage:
 *   node make_tts_call.cjs --to +14045005000 --text "Hello from Sinch!"
 *   node make_tts_call.cjs --to +14045005000 --text "Hello" --cli +14045001000 --locale sv-SE
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
  var args = { locale: "en-US" };
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case "--to": args.to = argv[++i]; break;
      case "--text": args.text = argv[++i]; break;
      case "--cli": args.cli = argv[++i]; break;
      case "--locale": args.locale = argv[++i]; break;
      case "--help":
        console.log("Usage: node make_tts_call.cjs --to PHONE --text TEXT [--cli NUMBER] [--locale LOCALE]");
        process.exit(0);
    }
  }
  if (!args.to || !args.text) {
    console.error("Error: --to and --text are required");
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
    method: "ttsCallout",
    ttsCallout: {
      destination: { type: "number", endpoint: args.to },
      locale: args.locale,
      text: args.text,
    },
  };
  if (args.cli) body.ttsCallout.cli = args.cli;

  var result = await client.httpRequest(url, {
    method: "POST",
    headers: {
      Authorization: client.getAuthHeader(appKey, appSecret),
      "Content-Type": "application/json",
    },
  }, JSON.stringify(body));

  console.log("Call placed successfully:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(function (err) {
  console.error("Error:", err.message);
  process.exit(1);
});
