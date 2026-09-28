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
 * Send an RCS location message via Sinch Conversation API.
 *
 * Usage:
 *   node send_location.cjs --to +15551234567 --lat 37.7749 --lon -122.4194 --title "Our Office" --label "Visit us here"
 *   node send_location.cjs --to +15551234567 --lat 40.7128 --lon -74.0060 --title "New York Office"
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

// node:util's parseArgs treats any token starting with "-" as a new flag, so
// `--lon -122.4194` is misread as an unknown option. Rewrite `--lat`/`--lon`
// followed by a negative-number token into `--lat=-122.4194` form before
// parsing, so negative coordinates work with the documented space syntax too.
function normalizeArgv(argv) {
  const numericOptions = new Set(["--lat", "--lon"]);
  const negativeNumber = /^-\d+(\.\d+)?$/;
  const result = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (numericOptions.has(arg) && next !== undefined && negativeNumber.test(next)) {
      result.push(`${arg}=${next}`);
      i++;
    } else {
      result.push(arg);
    }
  }

  return result;
}

function parseArguments() {
  const { values } = parseArgs({
    args: normalizeArgv(process.argv.slice(2)),
    options: {
      "to":           { type: "string" },
      "lat":          { type: "string" },
      "lon":          { type: "string" },
      "title":        { type: "string" },
      "label":        { type: "string" },
      "fallback-sms": { type: "boolean", default: false },
      "sender":       { type: "string" },
      "help":         { type: "boolean" },
    },
  });

  if (values.help) {
    console.log(
      "Usage: node send_location.cjs --to PHONE --lat LATITUDE --lon LONGITUDE --title TEXT [--label TEXT] [--fallback-sms] [--sender NUMBER]",
    );
    process.exit(0);
  }

  const lat = values.lat !== undefined ? parseFloat(values.lat) : NaN;
  const lon = values.lon !== undefined ? parseFloat(values.lon) : NaN;

  // The API rejects location_message without a title ("Field is mandatory"),
  // so validate it here rather than surfacing a raw 400 from the server.
  if (!values.to || isNaN(lat) || isNaN(lon) || !values.title) {
    console.error("Error: --to, --lat, --lon, and --title are required");
    console.error(
      "Usage: node send_location.cjs --to PHONE --lat LATITUDE --lon LONGITUDE --title TEXT",
    );
    process.exit(1);
  }

  return {
    to: values.to,
    lat,
    lon,
    title: values.title,
    label: values.label,
    fallbackSms: values["fallback-sms"],
    sender: values.sender,
  };
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
  const url = client.apiUrl(region, projectId, "messages:send");

  const locationMsg = {
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

  const body = {
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

  process.stderr.write(`Sending RCS location message to ${args.to}...\n`);
  const result = await sendRcsLocation(
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

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
