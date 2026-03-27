#!/usr/bin/env node
/**
 * Get call info via Sinch Voice API.
 *
 * Usage:
 *   node get_call_info.cjs --call-id 4398599d1ba84ef3bde0a82dfb61abed
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
      case "--call-id": args.callId = argv[++i]; break;
      case "--help":
        console.log("Usage: node get_call_info.cjs --call-id CALL_ID");
        process.exit(0);
    }
  }
  if (!args.callId) {
    console.error("Error: --call-id is required");
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
  var url = baseUrl + "/calling/v1/calls/id/" + encodeURIComponent(args.callId);

  var result = await client.httpRequest(url, {
    method: "GET",
    headers: {
      Authorization: client.getAuthHeader(appKey, appSecret),
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch(function (err) {
  console.error("Error:", err.message);
  process.exit(1);
});
