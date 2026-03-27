#!/usr/bin/env node
/**
 * List voice-capable numbers assigned to an application via Sinch Voice API.
 *
 * Usage:
 *   node list_numbers.cjs
 *
 * Environment variables (required):
 *   SINCH_APPLICATION_KEY    - Voice application key
 *   SINCH_APPLICATION_SECRET - Voice application secret
 */

var client = require("../common/voice_client.cjs");

async function main() {
  var appKey = client.getEnv("SINCH_APPLICATION_KEY");
  var appSecret = client.getEnv("SINCH_APPLICATION_SECRET");

  var url = client.CONFIG_BASE + "/v1/configuration/numbers";

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
