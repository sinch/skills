---
name: sinch-in-app-calling
description: Integrate Sinch In-App Voice and Video SDK for real-time calling in Android, iOS, or JavaScript apps. Use when the user mentions In-App Calling, VoIP integration, WebRTC with Sinch, app-to-phone calling, video calling, or building voice/video features in a mobile or web app.
metadata:
  author: Sinch
  version: 1.0.0
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
The user needs a Sinch account with an application key and secret from the [Sinch Build Dashboard](https://dashboard.sinch.com/voice/apps).

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

