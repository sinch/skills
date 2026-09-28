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
