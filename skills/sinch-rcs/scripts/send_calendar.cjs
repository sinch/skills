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
 * Send an RCS choice message with a calendar action via Sinch Conversation API.
 *
 * Usage:
 *   node send_calendar_choice.cjs \
 *     --to +15551234567 \
 *     --message "Here is your next spinning exercise Add it to your calendar!" \
 *     --cal-title "Spinning 45 min" \
 *     --event-start "2026-06-20T10:00:00Z" \
 *     --event-end "2026-06-20T10:45:00Z" \
 *     --event-title "Spinning" \
 *     --event-description "45min spinning with the Spinner guy" \
 *     --event-fallback-url "https://www.sinch.com"
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
            "to":                 { type: "string" },
            "message":            { type: "string" },
            "fallback-sms":       { type: "boolean", default: false },
            "sender":             { type: "string" },
            "cal-title":          { type: "string" },
            "event-start":        { type: "string" },
            "event-end":          { type: "string" },
            "event-title":        { type: "string" },
            "event-description":  { type: "string" },
            "event-fallback-url": { type: "string" },
            "postback":           { type: "string" },
            "help":               { type: "boolean" },
        },
    });

    if (values.help) {
        console.log("Usage: node send_calendar_choice.cjs --to PHONE --message TEXT \\");
        console.log('  --cal-title "Button Title" --event-start ISO8601 --event-end ISO8601 \\');
        console.log('  [--event-title TEXT] [--event-description TEXT] [--event-fallback-url URL]');
        process.exit(0);
    }

    if (!values.to || !values.message || !values["event-start"] || !values["event-end"] || !values["event-title"] || !values["event-fallback-url"]) {
        console.error("Error: --to, --message, --event-start, --event-end, --event-title, and --event-fallback-url are required");
        process.exit(1);
    }

    return {
        to: values.to,
        message: values.message,
        fallbackSms: values["fallback-sms"],
        sender: values.sender,
        calTitle: values["cal-title"],
        eventStart: values["event-start"],
        eventEnd: values["event-end"],
        eventTitle: values["event-title"],
        eventDescription: values["event-description"],
        eventFallbackUrl: values["event-fallback-url"],
        postback: values.postback,
    };
}

function sendRcsCalendarChoice(
    projectId,
    token,
    appId,
    to,
    message,
    calendarEvent,
    region,
    fallbackSms,
    sender,
) {
    const url = client.apiUrl(region, projectId, "messages:send");

    const body = {
        app_id: appId,
        recipient: {
            identified_by: {
                channel_identities: [{ channel: "RCS", identity: to }],
            },
        },
        message: {
            choice_message: {
                text_message: { text: message },
                choices: [
                    {
                        calendar_message: {
                            title: calendarEvent.title,
                            event_start: calendarEvent.eventStart,
                            event_end: calendarEvent.eventEnd,
                            event_title: calendarEvent.eventTitle,
                            event_description: calendarEvent.eventDescription,
                            fallback_url: calendarEvent.fallbackUrl,
                        },
                        postback_data: calendarEvent.postback || "postback_createcalendar",
                    },
                ],
            },
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

    process.stderr.write(`Sending RCS calendar choice message to ${args.to}...\n`);
    const result = await sendRcsCalendarChoice(
        projectId,
        token,
        appId,
        args.to,
        args.message,
        {
            title: args.calTitle,
            eventStart: args.eventStart,
            eventEnd: args.eventEnd,
            eventTitle: args.eventTitle,
            eventDescription: args.eventDescription,
            fallbackUrl: args.eventFallbackUrl,
            postback: args.postback,
        },
        region,
    );

    console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});


