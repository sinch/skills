# Voice API — Node.js Examples

## Contents

- [SDK Setup](#sdk-setup)
- [TTS Callout](#tts-callout) | [Conference Callout](#conference-callout) | [Custom Callout](#custom-callout-full-svaml-control)
- [Get Call Info](#get-call-info) | [Update In-Progress Call](#update-in-progress-call) | [Manage Call Leg](#manage-call-leg-play-audio)
- [Conference Operations](#conference--get-info): Get Info, Kick All, Mute Participant
- [Callback Handler (Express.js)](#callback-handler-expressjs)

## SDK Setup

```javascript
import { SinchClient } from "@sinch/sdk-core";

const sinch = new SinchClient({
  applicationKey: "YOUR_APPLICATION_KEY",
  applicationSecret: "YOUR_APPLICATION_SECRET",
});
```

## TTS Callout

```javascript
const response = await sinch.voice.callouts.tts({
  ttsCalloutRequestBody: {
    destination: { type: "number", endpoint: "+14045005000" },
    cli: "+14045001000",
    locale: "en-US",
    text: "Hello! This is a test call from Sinch.",
  },
});
console.log("Call ID:", response.callId);
```

## Conference Callout

```javascript
const response = await sinch.voice.callouts.conference({
  conferenceCalloutRequestBody: {
    destination: { type: "number", endpoint: "+14045005000" },
    cli: "+14045001000",
    conferenceId: "myConference",
    enableAce: true,
    enableDice: true,
  },
});
console.log("Call ID:", response.callId);
```

## Custom Callout (Full SVAML Control)

```javascript
const response = await sinch.voice.callouts.custom({
  customCalloutRequestBody: {
    destination: { type: "number", endpoint: "+14045005000" },
    cli: "+14045001000",
    ice: JSON.stringify({
      action: {
        name: "connectPstn",
        number: "+14045009000",
        cli: "+14045001000",
      },
    }),
    ace: JSON.stringify({
      action: { name: "continue" },
    }),
  },
});
```

## Get Call Info

```javascript
const callInfo = await sinch.voice.calls.get({
  callId: "4398599d1ba84ef3bde0a82dfb61abed",
});
console.log("Status:", callInfo.status);
console.log("Duration:", callInfo.duration);
```

## Update In-Progress Call

```javascript
await sinch.voice.calls.update({
  callId: "4398599d1ba84ef3bde0a82dfb61abed",
  spiRequestBody: {
    instructions: [
      { name: "say", text: "This call will now end.", locale: "en-US" },
    ],
    action: { name: "hangup" },
  },
});
```

## Manage Call Leg (Play Audio)

```javascript
await sinch.voice.calls.manageWithCallLeg({
  callId: "4398599d1ba84ef3bde0a82dfb61abed",
  callLeg: "callee",
  spiRequestBody: {
    instructions: [
      { name: "playFiles", ids: ["#tts[Please hold.]"], locale: "en-US" },
    ],
    action: { name: "continue" },
  },
});
```

## Conference — Get Info

```javascript
const conf = await sinch.voice.conferences.get({
  conferenceId: "myConference",
});
console.log("Participants:", conf.participants);
```

## Conference — Kick All

```javascript
await sinch.voice.conferences.kickAll({
  conferenceId: "myConference",
});
```

## Conference — Mute Participant

```javascript
await sinch.voice.conferences.manageParticipant({
  conferenceId: "myConference",
  callId: "4398599d1ba84ef3bde0a82dfb61abed",
  manageParticipantRequestBody: { command: "mute" },
});
```

## Callback Handler (Express.js)

```javascript
import express from "express";
const app = express();
app.use(express.json());

app.post("/voice/ice", (req, res) => {
  const { cli, to } = req.body;
  console.log(`Incoming call from ${cli} to ${to.endpoint}`);

  res.json({
    instructions: [
      { name: "say", text: "Welcome! Press 1 for sales.", locale: "en-US" },
    ],
    action: {
      name: "runMenu",
      mainMenu: "main",
      menus: [
        {
          id: "main",
          mainPrompt: "#tts[Press 1 for sales or 2 for support.]",
          options: [
            { dtmf: 1, action: "return(sales)" },
            { dtmf: 2, action: "return(support)" },
          ],
        },
      ],
    },
  });
});

app.post("/voice/ace", (req, res) => {
  res.json({ action: { name: "continue" } });
});

app.post("/voice/pie", (req, res) => {
  const { menuResult } = req.body;
  const number = menuResult.value === "sales" ? "+14045009001" : "+14045009002";

  res.json({
    instructions: [
      { name: "say", text: `Connecting you to ${menuResult.value}.`, locale: "en-US" },
    ],
    action: { name: "connectPstn", number, cli: "+14045001000" },
  });
});

app.post("/voice/dice", (req, res) => {
  console.log(`Call ended: ${req.body.reason}, duration: ${req.body.duration}s`);
  res.sendStatus(200);
});

app.listen(3000);
```

## Links

- [Node.js SDK Reference](https://developers.sinch.com/docs/voice/sdk/node/syntax-reference.md)
- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core)
