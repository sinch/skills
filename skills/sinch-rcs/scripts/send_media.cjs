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

const client = require("./common/sinch_client.cjs");
const { parseArgs } = require("node:util");

function parseArguments() {
  const { values } = parseArgs({
    options: {
      "to":            { type: "string" },
      "url":           { type: "string" },
      "thumbnail-url": { type: "string" },
      "fallback-sms":  { type: "boolean", default: false },
      "sender":        { type: "string" },
      "help":          { type: "boolean" },
    },
  });

  if (values.help) {
    console.log(
      "Usage: node send_media.cjs --to PHONE --url MEDIA_URL [--thumbnail-url THUMB_URL] [--fallback-sms] [--sender NUMBER]",
    );
    process.exit(0);
  }

  if (!values.to || !values.url) {
    console.error("Error: --to and --url are required");
    console.error("Usage: node send_media.cjs --to PHONE --url MEDIA_URL");
    process.exit(1);
  }

  return {
    to: values.to,
    url: values.url,
    thumbnailUrl: values["thumbnail-url"],
    fallbackSms: values["fallback-sms"],
    sender: values.sender,
  };
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
  const apiUrl = client.apiUrl(region, projectId, "messages:send");

  const mediaMsg = { url: url };
  if (thumbnailUrl) {
    mediaMsg.thumbnail_url = thumbnailUrl;
  }

  const body = {
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

  const data = JSON.stringify(body);
  return client.httpRequest(
    apiUrl,
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

  process.stderr.write(`Sending RCS media message to ${args.to}...\n`);
  const result = await sendRcsMedia(
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

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
