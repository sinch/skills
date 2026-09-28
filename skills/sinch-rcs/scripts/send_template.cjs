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
 * Send an RCS template message via Sinch Conversation API.
 *
 * Usage:
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"John"}'
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"María"}' --language es
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"John"}' --fallback-sms --sender +15559876543
 *   node send_template.cjs --to +15551234567 --template-id 01TEMPLATE123 --params '{"name":"John"}' --version 3
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
      "to":           { type: "string" },
      "template-id":  { type: "string" },
      "params":       { type: "string" },
      "language":     { type: "string" },
      "version":      { type: "string", default: "latest" },
      "fallback-sms": { type: "boolean", default: false },
      "sender":       { type: "string" },
      "help":         { type: "boolean" },
    },
  });

  if (values.help) {
    console.log(
      "Usage: node send_template.cjs --to PHONE --template-id ID --params JSON [--language CODE] [--fallback-sms] [--sender NUMBER]",
    );
    console.log("\nExamples:");
    console.log(
      '  node send_template.cjs --to +15551234567 --template-id 01ABC --params \'{"name":"John","order":"123"}\'',
    );
    console.log(
      '  node send_template.cjs --to +15551234567 --template-id 01ABC --params \'{"name":"María"}\' --language es',
    );
    process.exit(0);
  }

  if (!values.to || !values["template-id"] || !values.params) {
    console.error("Error: --to, --template-id, and --params are required");
    console.error(
      "Usage: node send_template.cjs --to PHONE --template-id ID --params JSON",
    );
    process.exit(1);
  }

  let parsedParams;
  try {
    parsedParams = JSON.parse(values.params);
  } catch {
    console.error("Error: --params must be valid JSON");
    console.error("Example: --params '{\"name\":\"John\",\"order\":\"123\"}'");
    process.exit(1);
  }

  return {
    to: values.to,
    templateId: values["template-id"],
    params: values.params,
    parsedParams,
    language: values.language,
    version: values.version,
    fallbackSms: values["fallback-sms"],
    sender: values.sender,
  };
}

function sendRcsTemplate(
  projectId,
  token,
  appId,
  to,
  templateId,
  parameters,
  region,
  languageCode,
  version,
  fallbackSms,
  sender,
) {
  const url = client.apiUrl(region, projectId, "messages:send");

  // template_message requires either `omni_template` or `channel_template`;
  // a flat template_id/parameters object is rejected by the API. `version`
  // is required by omni_template — "latest" resolves to the newest version.
  const omniTemplate = {
    template_id: templateId,
    version: version,
    parameters: parameters,
  };

  if (languageCode) {
    omniTemplate.language_code = languageCode;
  }

  const body = {
    app_id: appId,
    recipient: {
      identified_by: {
        channel_identities: [{ channel: "RCS", identity: to }],
      },
    },
    message: { template_message: { omni_template: omniTemplate } },
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

  console.log("Sending RCS template message...");
  console.log("To:", args.to);
  console.log("Template ID:", args.templateId);
  console.log("Parameters:", JSON.stringify(args.parsedParams));
  if (args.language) {
    console.log("Language:", args.language);
  }
  if (args.fallbackSms) {
    console.log("SMS fallback: enabled");
    if (args.sender) {
      console.log("SMS sender:", args.sender);
    }
  }

  const token = await client.getAccessToken(keyId, keySecret);
  const response = await sendRcsTemplate(
    projectId,
    token,
    appId,
    args.to,
    args.templateId,
    args.parsedParams,
    region,
    args.language,
    args.version,
    args.fallbackSms,
    args.sender,
  );

  console.log("\nTemplate message sent successfully.");
  console.log("Message ID:", response.message_id);
  if (response.accepted_time) {
    console.log("Accepted time:", response.accepted_time);
  }
}

main().catch((error) => {
  console.error("\nFailed to send template message:");
  console.error(error.message || error);
  process.exit(1);
});
