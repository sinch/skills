---
name: sinch-in-app-calling
description: Integrate Sinch In-App Voice and Video SDK for real-time calling in Android, iOS, or JavaScript apps. Use when the user mentions In-App Calling, VoIP integration, WebRTC with Sinch, app-to-phone calling, video calling, or building voice/video features in a mobile or web app.
metadata:
  author: Sinch
  version: 1.0.1
  category: Voice & Video
  tags: in-app-calling, voip, webrtc, voice, video, android, ios, javascript
  uses:
    - sinch-authentication
---

# Sinch In-App Calling

## Overview
Real-time voice and video SDK for **Android**, **iOS**, and **JavaScript (Web)**. Connects to Sinch's cloud for signaling and routing.

### Supported call types
- App-to-App (VoIP/WebRTC between users)
- App-to-Phone (call PSTN numbers)
- App-to-SIP (connect to PBXs, contact centers)
- App-to-Conference (multi-party calls)
- Phone-to-App / SIP-to-App (inbound calls)

## Agent Instructions

### Prerequisites
The user needs a Sinch account with an application key and secret from the [Sinch Build Dashboard](https://dashboard.sinch.com/voice/apps). See [sinch-authentication](../sinch-authentication/SKILL.md) for credential setup — In-App Calling uses **application-scoped** auth (Application Key + Application Secret).

### Integration workflow

1. **Detect the platform** from the user's project (language, build system, framework):
   - Android (Kotlin/Java, Gradle) → Read `references/android.md`
   - iOS (Swift/ObjC, Xcode) → Read `references/ios.md`
   - JavaScript/Web (npm, browser) → Read `references/js.md`
   - If unclear, **ask the user**.

2. **Walk through the integration steps** in the platform reference. Go step by step — confirm each step is in place before moving to the next.

3. **Ask about auth approach**: Can the Application Secret be embedded (prototyping only) or must JWTs come from a backend (production)?

4. **Ask about call types**: Which types does the user need? This determines which sections to cover.

5. **For Phone-to-App / SIP-to-App**: The user needs a backend ICE callback handler. See [backend setup](#phone-to-app--sip-to-app-backend) below.

### SDK Init References

For detailed SDK initialization code per platform:

- Browser: [references/sdk-init-in-app-calling-browser.md](references/sdk-init-in-app-calling-browser.md)
- iOS: [references/sdk-init-in-app-calling-ios.md](references/sdk-init-in-app-calling-ios.md)
- Android: [references/sdk-init-in-app-calling-android.md](references/sdk-init-in-app-calling-android.md)

### Phone-to-App / SIP-to-App backend

Receiving inbound PSTN or SIP calls requires:
1. A Sinch voice number from the [Build Dashboard](https://dashboard.sinch.com/numbers/overview) assigned to the app (or SIP origination configured).
2. A callback URL in the app's Voice settings.
3. A backend ICE handler that routes calls via `connectMxp`:

```json
{
  "action": {
    "name": "connectMxp",
    "destination": {
      "type": "username",
      "endpoint": "target-user-id"
    }
  }
}
```

## Key Concepts

**SinchClient** — The core SDK object. Must be initialized with Application Key and started before any calls can be made or received.
**User Identity** — A string identifier (e.g., user ID) that uniquely identifies a user in the Sinch system. Set during `SinchClient` initialization.
**Call Types** — App-to-App (VoIP), App-to-Phone (PSTN), App-to-SIP, App-to-Conference, and inbound (Phone-to-App, SIP-to-App).
**Managed Push** — Sinch-managed push notifications for incoming calls when the app is backgrounded. Required on all platforms.
**JWT Authentication** — Production apps must use backend-generated JWTs (not embedded secrets) for SDK authentication.
**ICE Callback** — Incoming Call Event. A backend webhook handler required for Phone-to-App and SIP-to-App calls that routes calls via `connectMxp`.
**Environment Host** — Regional endpoint for the SDK connection (e.g., `ocra.api.sinch.com` for global routing).

## Common Patterns

- **App-to-App voice call** — Initialize SinchClient with user identity, call `callUser("recipient-id")`. Both users must have active SinchClient instances.
- **App-to-Phone (PSTN)** — Call `callPhoneNumber("+15551234567")` with a CLI (caller ID) set to a Sinch number.
- **Receive incoming calls** — Register push notifications, implement call listener/delegate, handle `onIncomingCall` event.
- **Phone-to-App routing** — Assign a Sinch number to the app, set up backend ICE callback that returns `connectMxp` action targeting the user.
- **Video calling** — Use `callUserVideo("recipient-id")` (or platform equivalent). Requires camera permissions.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `onClientFailed` / `clientDidFail` | JWT issue — token missing, expired, wrong secret, or malformed | Verify JWT generation: correct app key + secret, `kid` matches key ID, token not expired. See auth section in platform reference |
| `onClientFailed` / `clientDidFail` | Invalid app key or wrong environment host | Verify key in [Dashboard](https://dashboard.sinch.com/voice/apps); check `environmentHost` matches your region |
| No incoming calls (JS) | Managed push not enabled | Call `sinchClient.setSupportManagedPush()` before starting — required even for the caller side |
| No incoming calls (Android) | FCM misconfiguration | Verify FCM credentials in Dashboard ("In-app Voice & Video SDKs" → "Google FCM Identification"); check that the device receives FCM tokens |
| No incoming calls (iOS) | APNs push not configured or token stale | Verify push certificate/key in Dashboard; ensure `registerPushNotificationData` is called with a fresh device token |
| No incoming calls (general) | SinchClient not running on the receiver's device | The receiver's app must have an active, started SinchClient to receive calls. Verify `start()` completed successfully |
| App-to-Phone fails immediately | Missing CLI (caller ID) | Set `callerIdentifier` / `cli` with a Sinch number |
| Audio only in foreground (iOS) | CallKit not reporting calls | Report outgoing calls to CallKit for background audio |

If the above steps don't resolve the issue, instruct the user to contact [Sinch Support](https://www.sinch.com/customer-support/) with their app key, platform, and a description of the problem.

## Public endpoints

Set `environmentHost` when creating the Sinch client:

| Endpoint | Region |
|---|---|
| `ocra.api.sinch.com` | Global (auto-routed) |
| `ocra-euc1.api.sinch.com` | Europe |
| `ocra-use1.api.sinch.com` | North America |
| `ocra-sae1.api.sinch.com` | South America |
| `ocra-apse1.api.sinch.com` | South East Asia 1 |
| `ocra-apse2.api.sinch.com` | South East Asia 2 |

## Links

- [In-App Calling Overview](https://developers.sinch.com/docs/in-app-calling.md)
- [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads.md)
- [Reference Applications (GitHub)](https://github.com/sinch/rtc-reference-applications)
- [Android SDK Reference](https://download.sinch.com/android/latest/reference/index.html)
- [iOS SDK Reference](https://download.sinch.com/ios/latest/reference/index.html)
- [JavaScript SDK Reference](https://download.sinch.com/js/latest/reference/index.html)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)

