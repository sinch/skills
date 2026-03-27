#!/usr/bin/env node
/**
 * Test webhook triggers by sending example payloads to a test URL.
 *
 * Usage Mode 1 - Test with existing webhook:
 *   node test_webhook_triggers.js --webhook-id WEBHOOK_ID --test-url URL [options]
 *
 * Usage Mode 2 - Test specific trigger without webhook:
 *   node test_webhook_triggers.js --trigger TRIGGER_NAME --test-url URL [--webhook-secret SECRET]
 *
 * Environment variables (only required for Mode 1):
 *   SINCH_PROJECT_ID  - Your Sinch project ID
 *   SINCH_KEY_ID      - Your access key ID
 *   SINCH_KEY_SECRET  - Your access key secret
 *   SINCH_REGION      - API region: us, eu, or br (default: us)
 *
 * Options:
 *   --webhook-id      - Webhook ID to test (mode 1)
 *   --trigger         - Single trigger name to test (mode 2)
 *   --test-url        - Test URL to send payloads to (required)
 *   --webhook-secret  - Webhook secret for HMAC signature (mode 2, optional)
 *   --triggers        - Comma-separated list of triggers (mode 1 only)
 *   --no-signature    - Skip HMAC signature (flag)
 *
 * Examples:
 *   # Mode 1: Test all triggers of an existing webhook
 *   node test_webhook_triggers.js \
 *     --webhook-id 01WEBHOOK123456789 \
 *     --test-url https://webhook.site/your-unique-id
 *
 *   # Mode 1: Test specific triggers of a webhook
 *   node test_webhook_triggers.js \
 *     --webhook-id 01WEBHOOK123456789 \
 *     --test-url https://webhook.site/your-unique-id \
 *     --triggers MESSAGE_INBOUND,MESSAGE_DELIVERY
 *
 *   # Mode 2: Test CONTACT_DELETE trigger without webhook ID
 *   node test_webhook_triggers.js \
 *     --trigger CONTACT_DELETE \
 *     --test-url https://webhook.site/your-unique-id
 *
 *   # Mode 2: Test with custom webhook secret
 *   node test_webhook_triggers.js \
 *     --trigger MESSAGE_INBOUND \
 *     --test-url https://your-server.com/webhook \
 *     --webhook-secret your_webhook_secret_key
 */

var client = require("../common/sinch_client.cjs");
var crypto = require("crypto");
var https = require("https");
var http = require("http");

// Environment variables (only required for mode 1 with --webhook-id)
var projectId, keyId, keySecret, region;

// Example payloads for each trigger type
var EXAMPLE_PAYLOADS = {
  MESSAGE_INBOUND: {
    app_id: "01EB37HMH1M6SV18ABNS3G135H",
    accepted_time: "2026-02-13T08:17:44.993024Z",
    event_time: "2026-02-13T08:17:42.814Z",
    project_id: "c36f3d3d-1523-4edd-ae42-11995557ff61",
    message: {
      id: "01EQ8235TD19N21XQTH12B145D",
      direction: "TO_APP",
      contact_message: {
        text_message: {
          text: "Hello! This is a test inbound message.",
        },
      },
      channel_identity: {
        channel: "SMS",
        identity: "+15551234567",
        app_id: "01EB37HMH1M6SV18ABNS3G135H",
      },
      conversation_id: "01EQ8172WMDB8008EFT4M30481",
      contact_id: "01EQ4174TGGY5B1VPTPGHW19R0",
      metadata: "",
      accept_time: "2026-02-13T08:17:43.915829Z",
      sender_id: "12345",
      processing_mode: "CONVERSATION",
    },
  },

  MESSAGE_DELIVERY: {
    app_id: "01EB37HMH1M6SV18BSNS3G135H",
    accepted_time: "2026-02-13T15:09:11.659Z",
    event_time: "2026-02-13T15:09:13.267185Z",
    project_id: "c36f3d3d-1513-2edd-ae42-11995557ff61",
    message_delivery_report: {
      message_id: "01EQBC1A3BEK731GY4YXEN0C2R",
      conversation_id: "01EPYATA64TMNZ1FV02JKF12JF",
      status: "DELIVERED",
      channel_identity: {
        channel: "SMS",
        identity: "+15551234567",
        app_id: "01EB27HMH1M6SV18ASNS3G135H",
      },
      contact_id: "01EXA07N79THJ20WSN6AS30TMW",
      metadata: "",
      processing_mode: "CONVERSATION",
    },
    message_metadata: "",
  },

  MESSAGE_SUBMIT: {
    app_id: "01EB37HMH1M6SV18BSNS3G135H",
    accepted_time: "2026-02-13T15:09:11.659Z",
    event_time: "2026-02-13T15:09:13.267185Z",
    project_id: "c36f3d3d-1513-2edd-ae42-11995557ff61",
    message_submit_notification: {
      message_id: "01EQBC1A3BEK731GY4YXEN0C2R",
      conversation_id: "01EPYATA64TMNZ1FV02JKF12JF",
      channel_identity: {
        channel: "SMS",
        identity: "+15551234567",
        app_id: "01EB27HMH1M6SV18ASNS3G135H",
      },
      contact_id: "01EXA07N79THJ20WSN6AS30TMW",
      submitted_message: {
        text_message: {
          text: "Hello from Conversation API!",
        },
      },
      metadata: "",
      processing_mode: "CONVERSATION",
    },
    message_metadata: "",
  },

  EVENT_INBOUND: {
    app_id: "01EB37HMH1M6SV18ABNS3G135H",
    accepted_time: "2026-02-13T08:17:44.993024Z",
    event_time: "2026-02-13T08:17:42.814Z",
    project_id: "c36f3d3d-1523-4edd-ae42-11995557ff61",
    event: {
      id: "01GJMQ28NDF6FP0REWQ70N2W3E",
      direction: "TO_APP",
      contact_event: {
        composing_event: {},
      },
      channel_identity: {
        channel: "WHATSAPP",
        identity: "+15551234567",
        app_id: "",
      },
      contact_id: "01EQ4174TGGY5B1VPTPGHW19R0",
      conversation_id: "01GJMQ3782FWM7TKAZKQZAEF56",
      accept_time: "2026-02-13T08:17:43.915829Z",
      processing_mode: "CONVERSATION",
    },
  },

  EVENT_DELIVERY: {
    app_id: "01EB37HMH1M6SV18BSNS3G135H",
    accepted_time: "2026-02-13T15:09:11.659Z",
    event_time: "2026-02-13T15:09:13.267185Z",
    project_id: "c36f3d3d-1513-2edd-ae42-11995557ff61",
    event_delivery_report: {
      event_id: "01EQBC1A3BEK731GY4YXEN0C2R",
      status: "QUEUED_ON_CHANNEL",
      channel_identity: {
        channel: "WHATSAPP",
        identity: "+15551234567",
        app_id: "01EB27HMH1M6SV18ASNS3G135H",
      },
      contact_id: "01EXA07N79THJ20WSN6AS30TMW",
      metadata: "",
      processing_mode: "CONVERSATION",
    },
    message_metadata: "",
  },

  CONVERSATION_START: {
    app_id: "01EB37HMH1M6SF18ASNS3G135H",
    project_id: "c36f3d3d-1523-4edd-ae42-11995557ff61",
    conversation_start_notification: {
      conversation: {
        id: "01EQ4174WMDB8008EFT4M30481",
        app_id: "01EB37HMH1M6SF18ASNS3G135H",
        contact_id: "01BQ8174TGGY5B1VPTPGHW19R0",
        active_channel: "SMS",
        active: true,
        metadata: "",
      },
    },
  },

  CONVERSATION_STOP: {
    app_id: "01EB37HMH1M6SV17ASNS3G135H",
    project_id: "c36f3d3d-1523-4edd-ae42-11995557ff61",
    conversation_stop_notification: {
      conversation: {
        id: "01EPYATZ64TMNZ1FV02JKD12JF",
        app_id: "01EB37HMH1M6SV17ASNS3G135H",
        contact_id: "01EKA07N79THJ20WAN6AS30TMW",
        last_received: "2026-02-13T15:09:12Z",
        active_channel: "SMS",
        active: false,
        metadata: "",
      },
    },
  },

  CONTACT_CREATE: {
    app_id: "",
    accepted_time: "2026-02-13T15:36:28.155494Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    contact_create_notification: {
      contact: {
        id: "01EQBDK8771J6A1FV8MQPE1XAR",
        channel_identities: [
          {
            channel: "SMS",
            identity: "+15551234567",
            app_id: "",
          },
        ],
        channel_priority: ["SMS"],
        display_name: "Test Contact",
        email: "test@example.com",
        external_id: "ext-12345",
        metadata: "",
        language: "EN_US",
      },
    },
  },

  CONTACT_UPDATE: {
    app_id: "",
    accepted_time: "2026-02-13T15:44:33.517073Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    contact_update_notification: {
      contact: {
        id: "01EQBDK8771J6A1FV8MQPE1XAR",
        channel_identities: [
          {
            channel: "SMS",
            identity: "+15551234567",
            app_id: "",
          },
        ],
        channel_priority: ["SMS"],
        display_name: "Updated Contact Name",
        email: "updated@example.com",
        external_id: "ext-12345",
        metadata: "",
        language: "EN_US",
      },
    },
  },

  CONTACT_DELETE: {
    app_id: "",
    accepted_time: "2026-02-13T15:44:33.517073Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    contact_delete_notification: {
      contact: {
        id: "01EQBDK8771J6A1FV8MQPE1XAR",
        channel_identities: [
          {
            channel: "SMS",
            identity: "+15551234567",
            app_id: "",
          },
        ],
        channel_priority: ["SMS"],
        display_name: "Deleted Contact",
        email: "",
        external_id: "",
        metadata: "",
        language: "UNSPECIFIED",
      },
    },
  },

  CONTACT_MERGE: {
    app_id: "",
    accepted_time: "2026-02-13T15:53:03.457706Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    contact_merge_notification: {
      preserved_contact: {
        id: "01EQBECE7Z4XP21359SBKS1526",
        channel_identities: [
          {
            channel: "SMS",
            identity: "+15551234567",
            app_id: "",
          },
        ],
        channel_priority: ["SMS"],
        display_name: "Merged Contact",
        email: "",
        external_id: "",
        metadata: "",
        language: "UNSPECIFIED",
      },
      deleted_contact: {
        id: "01EQBEH7MNEZQC0881A4WS17K3",
        channel_identities: [
          {
            channel: "SMS",
            identity: "+15559876543",
            app_id: "",
          },
        ],
        channel_priority: ["SMS"],
        display_name: "Duplicate Contact",
        email: "",
        external_id: "",
        metadata: "",
        language: "UNSPECIFIED",
      },
    },
  },

  CAPABILITY: {
    app_id: "01EB37KMH2M6SV18ASNS3G135H",
    accepted_time: "2026-02-13T16:05:51.724083Z",
    project_id: "",
    capability_notification: {
      contact_id: "01EKA07N79THJ20ZSN6AS30TMW",
      identity: "+15551234567",
      channel: "WHATSAPP",
      capability_status: "CAPABILITY_FULL",
      request_id: "01EQBF91XWP9PW1J8EWRYZ1GK2",
    },
  },

  OPT_IN: {
    app_id: "01EB37HMH1M6SV18ASNS3G135H",
    accepted_time: "2026-02-13T07:54:03.165316Z",
    event_time: "2026-02-13T07:54:02.112Z",
    project_id: "",
    opt_in_notification: {
      contact_id: "01EKA07N79THJ20WSN6AS30TMW",
      channel: "VIBERBM",
      identity: "+15551234567",
      status: "OPT_IN_SUCCEEDED",
      request_id: "01F7N9TEH11X7B15XQ6VBR04G7",
      processing_mode: "CONVERSATION",
    },
  },

  OPT_OUT: {
    app_id: "01EB37HMH1M6SV18ASNS3G135H",
    accepted_time: "2026-02-13T07:54:03.165316Z",
    event_time: "2026-02-13T07:54:02.112Z",
    project_id: "",
    opt_out_notification: {
      contact_id: "01EKA07N79THJ20WSN6AS30TMW",
      channel: "VIBERBM",
      identity: "+15551234567",
      status: "OPT_OUT_SUCCEEDED",
      request_id: "01F7N9TEH11X7B15XQ6VBR04G7",
      processing_mode: "CONVERSATION",
    },
  },

  CHANNEL_EVENT: {
    app_id: "01EB37HMH1M6SV18ASNS3G135H",
    accepted_time: "2026-02-13T10:00:00.000000Z",
    event_time: "2026-02-13T10:00:00.000000Z",
    project_id: "c36f3d3d-1513-4edd-ae42-11995557ff61",
    channel_event_notification: {
      channel_event: {
        channel: "WHATSAPP",
        event_type: "WHATS_APP_QUALITY_RATING_CHANGED",
        additional_data: {
          quality_rating: "GREEN",
        },
      },
    },
  },

  UNSUPPORTED: {
    app_id: "01EB37HMF1M6SV18ASNS3G135H",
    accepted_time: "2026-02-13T15:17:05.723864Z",
    event_time: "2026-02-13T15:17:05.683253Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    unsupported_callback: {
      channel: "MESSENGER",
      payload: '{"object":"page","entry":[{"id":"123","time":1634626225304}]}',
      id: "01FMAVK07YN3SP1B43FP9D1C0S",
      contact_id: "01FMAVAPAQTEGDJSFJJWANRX38",
      conversation_id: "01FMAVAQBTR4C1HJZS05PVTXZ8",
      channel_identity: {
        channel: "MESSENGER",
        identity: "123456789",
        app_id: "01EB37HMF1M6SV18ASNS3G135H",
      },
      processing_mode: "CONVERSATION",
    },
  },

  CONTACT_IDENTITIES_DUPLICATION: {
    app_id: "01EB37KMH2M6SV18ASNS3G135H",
    accepted_time: "2022-09-29T09:16:22.544813845Z",
    event_time: "2022-09-29T09:16:22.544813845Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    duplicated_contact_identities_notification: {
      duplicated_identities: [
        {
          channel: "SMS",
          identity: "+15551234567",
          app_id: "",
          contact_ids: [
            "01EKA07N79THJ20ZSN6AS30TMW",
            "01EKA07N79THJ20ZSN6AS30TTT",
          ],
        },
      ],
    },
    message_metadata: "",
  },

  BATCH_STATUS_UPDATE: {
    app_id: "01EB37KMH2M6SV18ASNS3G135H",
    accepted_time: "2023-05-15T14:22:33.123456789Z",
    event_time: "2023-05-15T14:22:33.123456789Z",
    project_id: "c36f3a3d-1513-4edd-ae42-11995557ff61",
    batch_status_update_notification: {
      batch_id: "01FG37KMH2M6SV18ASNS3G135H",
      batch_status: "BATCH_STATUS_PROCESSED",
      batch_type: "BATCH_TYPE_MESSAGES",
      additional_data: {
        message_batch_data: {
          send_after: "2023-05-15T12:00:00.000000000Z",
          batch_metadata: {
            campaign: "summer_sale",
            segment: "active_users",
          },
        },
      },
    },
    message_metadata: "",
  },

  MESSAGE_INBOUND_SMART_CONVERSATION_REDACTION: {
    app_id: "01EB37HMH1M6SV18ABNS3G135H",
    accepted_time: "2026-02-13T08:17:44.993024Z",
    event_time: "2026-02-13T08:17:42.814Z",
    project_id: "c36f3d3d-1523-4edd-ae42-11995557ff61",
    message_redaction: {
      id: "01EQ8235TD19N21XQTH12B145D",
      direction: "TO_APP",
      contact_message: {
        text_message: {
          text: "My name is {PERSON} and my email is {EMAIL}",
        },
      },
      redaction_type: "PII_MASKING",
      original_text: "My name is John Doe and my email is john@example.com",
      channel_identity: {
        channel: "SMS",
        identity: "+15551234567",
        app_id: "01EB37HMH1M6SV18ABNS3G135H",
      },
      conversation_id: "01EQ8172WMDB8008EFT4M30481",
      contact_id: "01EQ4174TGGY5B1VPTPGHW19R0",
      metadata: "",
      accept_time: "2026-02-13T08:17:43.915829Z",
      sender_id: "12345",
      processing_mode: "CONVERSATION",
    },
  },
};

function parseArgs() {
  var args = process.argv.slice(2);
  var params = {};

  for (var i = 0; i < args.length; i++) {
    if (args[i] === "--help") {
      console.log("Usage: node test_webhook_triggers.cjs --webhook-id WEBHOOK_ID --test-url URL [--triggers TRIGGERS]");
      console.log("       node test_webhook_triggers.cjs --trigger TRIGGER_NAME --test-url URL [--webhook-secret SECRET] [--no-signature]");
      process.exit(0);
    }
    if (args[i].startsWith("--")) {
      var key = args[i].substring(2);

      if (key === "no-signature") {
        params[key] = true;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        params[key] = args[++i];
      }
    }
  }

  // Validate arguments based on mode
  if (!params["webhook-id"] && !params["trigger"]) {
    console.error("Error: Either --webhook-id or --trigger is required");
    console.error("");
    console.error("Mode 1: --webhook-id WEBHOOK_ID --test-url URL");
    console.error(
      "Mode 2: --trigger TRIGGER_NAME --test-url URL [--webhook-secret SECRET]",
    );
    process.exit(1);
  }

  if (params["webhook-id"] && params["trigger"]) {
    console.error("Error: Cannot use both --webhook-id and --trigger");
    console.error(
      "Use --webhook-id to test a webhook, or --trigger to test a specific trigger",
    );
    process.exit(1);
  }

  if (!params["test-url"]) {
    console.error("Error: --test-url is required");
    process.exit(1);
  }

  // Mode 2 validation
  if (params["trigger"]) {
    if (!EXAMPLE_PAYLOADS[params["trigger"]]) {
      console.error("Error: Unknown trigger '" + params["trigger"] + "'");
      console.error(
        "Available triggers:",
        Object.keys(EXAMPLE_PAYLOADS).join(", "),
      );
      process.exit(1);
    }

    if (params["triggers"]) {
      console.error(
        "Error: --triggers option is only available in webhook mode (--webhook-id)",
      );
      console.error(
        "Use --trigger with a single trigger name for standalone testing",
      );
      process.exit(1);
    }
  }

  return params;
}

function generateNonce() {
  return crypto.randomBytes(12).toString("hex");
}

function generateHmacSignature(body, secret) {
  var nonce = generateNonce();
  var timestamp = Math.floor(Date.now() / 1000);
  var signedData = body + "." + nonce + "." + timestamp;
  var signature = crypto
    .createHmac("sha256", secret)
    .update(signedData)
    .digest("base64");

  return {
    signature: signature,
    nonce: nonce,
    timestamp: timestamp,
    algorithm: "HmacSHA256",
  };
}

function sendTestPayload(testUrl, payload, secret, skipSignature) {
  return new Promise(function (resolve, reject) {
    var body = JSON.stringify(payload);
    var parsedUrl = new URL(testUrl);
    var protocol = parsedUrl.protocol === "https:" ? https : http;

    var headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    };

    if (secret && !skipSignature) {
      var hmac = generateHmacSignature(body, secret);
      headers["x-sinch-webhook-signature"] = hmac.signature;
      headers["x-sinch-webhook-signature-timestamp"] =
        hmac.timestamp.toString();
      headers["x-sinch-webhook-signature-nonce"] = hmac.nonce;
      headers["x-sinch-webhook-signature-algorithm"] = hmac.algorithm;
    }

    var options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: headers,
    };

    var req = protocol.request(options, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end", function () {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function getWebhook(webhookId) {
  var token = await client.getAccessToken(keyId, keySecret);
  var url = client.apiUrl(region, projectId, "webhooks/" + webhookId);

  return await client.httpRequest(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
}

async function testWebhookTriggers() {
  try {
    var params = parseArgs();
    var webhook = null;
    var webhookSecret = null;
    var triggersToTest = [];

    // Mode 1: Test existing webhook
    if (params["webhook-id"]) {
      // Load environment variables (required for mode 1)
      projectId = client.getEnv("SINCH_PROJECT_ID");
      keyId = client.getEnv("SINCH_KEY_ID");
      keySecret = client.getEnv("SINCH_KEY_SECRET");
      region = client.getEnv("SINCH_REGION", "us");

      console.log("Fetching webhook details...");
      webhook = await getWebhook(params["webhook-id"]);

      console.log("\nWebhook ID:", webhook.id);
      console.log("App ID:", webhook.app_id);
      console.log("Has Secret:", webhook.secret ? "Yes" : "No");
      console.log("Configured Triggers:", webhook.triggers.join(", "));
      console.log("Test URL:", params["test-url"]);
      console.log("");

      webhookSecret = webhook.secret;
      triggersToTest = params.triggers
        ? params.triggers.split(",").map(function (t) {
            return t.trim();
          })
        : webhook.triggers;
    }
    // Mode 2: Test specific trigger without webhook
    else if (params["trigger"]) {
      console.log("\nMode: Standalone trigger test");
      console.log("Trigger:", params["trigger"]);
      console.log("Test URL:", params["test-url"]);

      webhookSecret = params["webhook-secret"] || "test_webhook_secret_12345";

      if (params["webhook-secret"]) {
        console.log("Using provided webhook secret");
      } else {
        console.log("Using default test secret (for demo purposes)");
      }
      console.log("");

      triggersToTest = [params["trigger"]];
    }

    console.log("Testing " + triggersToTest.length + " trigger(s)...");
    console.log("─".repeat(80));

    var results = {
      success: 0,
      failed: 0,
      details: [],
    };

    for (var i = 0; i < triggersToTest.length; i++) {
      var trigger = triggersToTest[i];
      var payload = EXAMPLE_PAYLOADS[trigger];

      if (!payload) {
        console.log(
          "\n[" + (i + 1) + "/" + triggersToTest.length + "] " + trigger,
        );
        console.log("  ⚠️  No example payload available for this trigger");
        results.details.push({
          trigger: trigger,
          status: "skipped",
          reason: "no example payload",
        });
        continue;
      }

      console.log(
        "\n[" + (i + 1) + "/" + triggersToTest.length + "] " + trigger,
      );

      try {
        var response = await sendTestPayload(
          params["test-url"],
          payload,
          webhookSecret,
          params["no-signature"],
        );

        if (response.statusCode >= 200 && response.statusCode < 300) {
          console.log("  ✅ Success (HTTP " + response.statusCode + ")");
          if (webhookSecret && !params["no-signature"]) {
            console.log("  🔐 HMAC signature included");
          }
          results.success++;
          results.details.push({
            trigger: trigger,
            status: "success",
            statusCode: response.statusCode,
          });
        } else {
          console.log("  ❌ Failed (HTTP " + response.statusCode + ")");
          console.log("  Response:", response.body.substring(0, 200));
          results.failed++;
          results.details.push({
            trigger: trigger,
            status: "failed",
            statusCode: response.statusCode,
          });
        }
      } catch (error) {
        console.log("  ❌ Error:", error.message);
        results.failed++;
        results.details.push({
          trigger: trigger,
          status: "error",
          error: error.message,
        });
      }
    }

    console.log("\n" + "─".repeat(80));
    console.log("\nTest Summary:");
    console.log("  Total:", triggersToTest.length);
    console.log("  Success:", results.success);
    console.log("  Failed:", results.failed);
    console.log(
      "  Skipped:",
      triggersToTest.length - results.success - results.failed,
    );

    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\nError testing webhook triggers:");
    console.error(error.message);
    process.exit(1);
  }
}

testWebhookTriggers();
