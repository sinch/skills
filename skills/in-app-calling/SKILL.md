---
name: sinch-in-app-calling
description: Build in-app voice and video calling with Sinch RTC SDKs. Use for app-to-app, app-to-phone, video calls, and push notifications on iOS, Android, and Web.
---

# Sinch In-App Calling

## Overview

The Sinch In-App Calling SDK enables real-time voice and video communication directly within your mobile or web application. Built on WebRTC, it supports app-to-app audio/video calls, app-to-phone (PSTN) calls, app-to-SIP calls, and conference calling across iOS, Android, and JavaScript platforms.

Key capabilities:
- **App-to-app voice and video calling** between users of your application
- **App-to-phone (PSTN)** calling from your app to any phone number
- **App-to-SIP** calling to SIP endpoints
- **Conference calling** with multiple participants
- **Push notifications** for incoming calls when the app is in the background
- **Screen sharing** on supported platforms

See the [Sinch pricing page](https://sinch.com/pricing/) for current in-app calling rates.

## Getting Started

### Authentication

See the [sinch-authentication](../authentication/SKILL.md) skill for full auth setup, SDK initialization, and dashboard links.

In-App Calling uses **Application Key + Application Secret** from the Sinch Dashboard. Authentication requires a **JWT (JSON Web Token)** signed with a key derived from your Application Secret.

**JWT signing key derivation:**
```
signingKey = HMAC256(BASE64_DECODE(applicationSecret), UTF8_ENCODE(YYYYMMDD))
```

The JWT must include:
- `iss` (issuer): Your Application Key
- `sub` (subject): The user ID
- `iat` (issued at): Current timestamp
- `exp` (expiration): Token expiry (TTL must be at least 1 minute)
- `nonce`: A unique nonce value

**IMPORTANT:** In production, generate JWTs on your backend server. Never embed the Application Secret in client-side code.

### Platform SDKs

| Platform | SDK | Distribution |
|----------|-----|-------------|
| iOS | Sinch RTC SDK | CocoaPods / manual framework |
| Android | Sinch RTC SDK | Maven / manual AAR |
| JavaScript (Web) | Sinch RTC JS SDK | npm / CDN |

Server-side SDKs for managing Voice resources:

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@sinch/sdk-core` | `npm install @sinch/sdk-core` |
| Java | `com.sinch.sdk:sinch-sdk-java` | Maven dependency |
| Python | `sinch` | `pip install sinch` |
| .NET | `Sinch` | `dotnet add package Sinch` |

### First Integration: JavaScript (Web) Voice Call

**Step 1: Initialize the SinchClient**

```javascript
const sinchClient = Sinch.getSinchClientBuilder()
  .applicationKey('YOUR_APPLICATION_KEY')
  .environmentHost('ocra.api.sinch.com')
  .userId('alice')
  .build();
```

**Step 2: Add lifecycle and credential listeners**

```javascript
const sinchClientListener = {
  onCredentialsRequired: (sinchClient, clientRegistration) => {
    // In production: fetch JWT from your backend
    fetch('/api/sinch-token?userId=' + sinchClient.userId)
      .then(res => res.json())
      .then(data => clientRegistration.register(data.token))
      .catch(() => clientRegistration.registerFailed());
  },
  onClientStarted: (sinchClient) => {
    console.log('Sinch client started successfully');
  },
  onClientFailed: (sinchClient, error) => {
    console.error('Sinch client failed to start:', error);
  },
};

sinchClient.addListener(sinchClientListener);
sinchClient.start();
```

**Step 3: Make a voice call**

```javascript
// Get the call client
const callClient = sinchClient.callClient;

// Add call listener
callClient.addListener({
  onIncomingCall: (callClient, call) => {
    console.log('Incoming call from:', call.remoteUserId);
    // call.answer() to accept
    // call.hangup() to reject
  },
});

// Make an app-to-app call
const call = callClient.callUser('bob');

call.addListener({
  onCallProgressing: (call) => {
    console.log('Ringing...');
  },
  onCallEstablished: (call) => {
    console.log('Call connected');
  },
  onCallEnded: (call) => {
    console.log('Call ended');
  },
});
```

**Step 4: Make a video call**

```javascript
const call = callClient.callUserVideo('bob');

call.addListener({
  onCallEstablished: (call) => {
    // Attach local and remote video streams
    document.getElementById('localVideo').srcObject = call.localStream;
    document.getElementById('remoteVideo').srcObject = call.remoteStream;
  },
});
```

### Backend: Generate JWT Token (Node.js)

Your backend must generate JWT tokens for client authentication:

```javascript
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function generateSinchJWT(userId, applicationKey, applicationSecret) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

  // Derive signing key: HMAC-SHA256(base64decode(secret), dateString)
  const decodedSecret = Buffer.from(applicationSecret, 'base64');
  const signingKey = crypto
    .createHmac('sha256', decodedSecret)
    .update(dateStr)
    .digest();

  const token = jwt.sign(
    {
      iss: applicationKey,
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 600, // 10 minute expiry
      nonce: crypto.randomBytes(16).toString('hex'),
    },
    signingKey,
    { algorithm: 'HS256' }
  );

  return token;
}
```

### curl: Place an Outbound Call via REST API

You can also initiate calls server-side using the Voice REST API:

```bash
curl -X POST "https://calling.api.sinch.com/calling/v1/callouts" \
  -H "Content-Type: application/json" \
  -u "YOUR_APPLICATION_KEY:YOUR_APPLICATION_SECRET" \
  -d '{
    "method": "customCallout",
    "customCallout": {
      "destination": {
        "type": "username",
        "endpoint": "bob"
      },
      "cli": "alice",
      "ice": "{\"action\":{\"name\":\"connectMxp\",\"destination\":{\"type\":\"username\",\"endpoint\":\"bob\"}}}"
    }
  }'
```

## Key Concepts

### Call Types

| Type | Description | Method |
|------|-------------|--------|
| App-to-App (Audio) | Voice call between two app users | `callClient.callUser(userId)` |
| App-to-App (Video) | Video call between two app users | `callClient.callUserVideo(userId)` |
| App-to-Phone (PSTN) | Call from app to a phone number | `callClient.callPhoneNumber(number)` |
| App-to-SIP | Call from app to a SIP endpoint | `callClient.callSip(sipAddress)` |
| Conference | Multi-party call via conference ID | `callClient.callConference(conferenceId)` |

### SinchClient Lifecycle

1. **Build**: Create client with `SinchClientBuilder`, providing applicationKey, environmentHost, and userId.
2. **Register listener**: Add `SinchClientListener` with `onCredentialsRequired`, `onClientStarted`, and `onClientFailed`.
3. **Start**: Call `sinchClient.start()`. The SDK triggers `onCredentialsRequired` to obtain a JWT.
4. **Use**: Access `callClient` for making/receiving calls.
5. **Stop**: Call `sinchClient.terminate()` when done.

### Push Notifications

Push notifications enable incoming call alerts when the app is backgrounded or closed.

| Platform | Push Service | Configuration |
|----------|-------------|---------------|
| iOS | Apple Push Notification service (APNs) | Upload APNs certificate/key in Sinch Dashboard |
| Android | Firebase Cloud Messaging (FCM) | Add FCM server key in Sinch Dashboard |
| Web | Not applicable | Use `setSupportManagedPush()` for browser notifications |

Enable managed push in the client builder:
```javascript
const sinchClient = Sinch.getSinchClientBuilder()
  .applicationKey('YOUR_APPLICATION_KEY')
  .environmentHost('ocra.api.sinch.com')
  .userId('alice')
  .setSupportManagedPush()
  .build();
```

### Video Codecs

Sinch supports standard WebRTC video codecs:
- **VP8** (default, widely supported)
- **VP9** (better compression)
- **H.264** (hardware acceleration on mobile)

### Environment Hosts

| Environment | Host |
|-------------|------|
| Production | `ocra.api.sinch.com` |

## Common Patterns

### Incoming Call Handling with UI

```javascript
callClient.addListener({
  onIncomingCall: (callClient, call) => {
    // Show incoming call UI
    showIncomingCallUI(call.remoteUserId);

    call.addListener({
      onCallEstablished: (call) => {
        showActiveCallUI();
      },
      onCallEnded: (call) => {
        hideCallUI();
      },
    });

    // User actions:
    document.getElementById('answerBtn').onclick = () => call.answer();
    document.getElementById('declineBtn').onclick = () => call.hangup();
  },
});
```

### Mute/Unmute and Speaker Toggle

```javascript
// Mute microphone
call.mute();

// Unmute microphone
call.unmute();

// Toggle video (pause/resume)
call.pauseVideo();
call.resumeVideo();
```

### Video Call with Stream Management

```javascript
const call = callClient.callUserVideo('bob');

call.addListener({
  onCallEstablished: (call) => {
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    localVideo.srcObject = call.localStream;
    remoteVideo.srcObject = call.remoteStream;
  },
  onCallEnded: (call) => {
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
  },
});
```

## Gotchas and Best Practices

1. **Never embed Application Secret in client code.** Always generate JWT tokens on your backend. The client SDK calls `onCredentialsRequired` where you should fetch a token from your server.

2. **Push notification certificate management is critical.** On iOS, you must upload a valid APNs certificate (or key) to the Sinch Dashboard. Expired certificates cause silent failures. On Android, ensure the FCM server key is current.

3. **NAT traversal is handled by Sinch.** The SDK uses STUN/TURN servers managed by Sinch. You do not need to configure ICE servers, but ensure your network allows UDP traffic on ports used by WebRTC.

4. **Token TTL must be at least 1 minute.** The Sinch SDK rejects tokens with very short expiration times. Set `exp` to at least 60 seconds from `iat`.

5. **The SDK automatically re-requests credentials.** When the registration TTL nears expiry, `onCredentialsRequired` is called again. Your backend must be able to issue fresh tokens on demand.

6. **SinchClient is a singleton per user session.** Create one instance and retain it for the entire app lifecycle. Do not create multiple instances.

7. **Call `terminate()` on cleanup.** Failing to terminate the SinchClient can cause resource leaks and unexpected behavior on subsequent starts.

8. **Browser compatibility for Web SDK.** WebRTC support is required. Chrome, Firefox, Safari, and Edge are supported. Ensure HTTPS -- WebRTC requires a secure context.

9. **Video bandwidth adapts automatically.** The SDK adjusts video quality based on available bandwidth. You do not need to configure bitrate settings manually.

10. **PSTN calls require credit.** App-to-phone calls consume your Sinch account balance. App-to-app calls cost $0.003/min/leg. Ensure your account is funded for production use.

## Links

- [In-App Calling Overview](https://developers.sinch.com/docs/in-app-calling)
- [JavaScript SDK Guide](https://developers.sinch.com/docs/in-app-calling/js-cloud)
- [JavaScript Voice Calling](https://developers.sinch.com/docs/in-app-calling/js/calling/)
- [Authentication & Authorization (JS)](https://developers.sinch.com/docs/in-app-calling/js/application-authentication/)
- [Getting Started: Create App](https://developers.sinch.com/docs/in-app-calling/getting-started/javascript/create-app)
- [Getting Started: Make a Call](https://developers.sinch.com/docs/in-app-calling/getting-started/javascript/make-call)
- [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/)
- [Reference Applications (GitHub)](https://github.com/sinch/rtc-reference-applications)
- [SinchClient JS API Reference](https://download.sinch.com/docs/javascript/latest/reference/classes/SinchClient.html)
- [In-App Calling API Reference](https://developers.sinch.com/docs/in-app-calling)
- [npm: @sinch/sdk-core](https://www.npmjs.com/package/@sinch/sdk-core)
- [LLMs.txt (full docs index)](https://developers.sinch.com/llms.txt)
