---
name: sinch-in-app-calling
description: Helps users integrate the Sinch In-App Voice SDK into their app. Use whenever a user mentions In-App Voice SDK, or asks about integrating Sinch In-App Voice SDK into an Android, iOS, or JavaScript web application project, or asks to create a WebRTC application using Sinch.
---

# Sinch In-App Calling

## What is the Sinch In-app Calling SDK?
The Sinch In-app Calling SDK enables real-time voice and video communication inside mobile and web apps. It connects to Sinch's cloud backend for signaling and routing.
Available for **Android**, **iOS**, and **JavaScript (Web)**.

### Supported call types
- App-to-App (VoIP/WebRTC between users in the same app)
- App-to-Phone (call PSTN landlines/mobiles from the app)
- App-to-SIP (connect to PBXs, contact centers, AI agents)
- App-to-Conference (multi-party calls across channels)
- Phone-to-App and SIP-to-App (inbound calls into the app)

### Getting started requires
1. A Sinch account with an application key and secret from the Sinch Build Dashboard.
2. The SDK for the target platform.

## Platform Detection
Determine the user's platform from their project files, language, or question:
- Android (Kotlin/Java, Gradle, Android Studio) → Read `references/android.md`
- iOS (Swift/ObjC, Xcode, CocoaPods/SPM) → Read `references/ios.md`  
- JavaScript/Web (npm, package.json, React, etc.) → Read `references/js.md`

If the platform is unclear, ask the user which platform they're targeting.

## Public endpoints
The In-App Calling API uses different endpoints depending on your region.
When creating a Sinch client, choose the regional endpoint used to communicate with the Sinch platform by setting the `environmentHost` parameter. The following regional endpoints are available:

| Endpoint (hostname) | Description |
|  --- | --- |
| `https://ocra.api.sinch.com` | Global - redirected by Sinch to the closest region |
| `https://ocra-euc1.api.sinch.com` | Europe |
| `https://ocra-use1.api.sinch.com` | North America |
| `https://ocra-sae1.api.sinch.com` | South America |
| `https://ocra-apse1.api.sinch.com` | South East Asia 1 |
| `https://ocra-apse2.api.sinch.com` | South East Asia 2 |


## Links

- [In-App Calling Overview](https://developers.sinch.com/docs/in-app-calling.md)
- [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads.md) 
- [Reference Applications (GitHub)](https://github.com/sinch/rtc-reference-applications)
- [Android SDK Online reference docs](https://download.sinch.com/android/latest/reference/index.html)
- [iOS SDK Online reference docs](https://download.sinch.com/ios/latest/reference/index.html)
- [JavaScript SDK Online reference docs](https://download.sinch.com/js/latest/reference/index.html)

