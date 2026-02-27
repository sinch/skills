<!-- Reference file for JavaScript SDK integration. 
        Read only when the user's project targets JavaScript/Web. -->
# Sinch Javascript Voice and Video SDK 

## Add the Sinch library
You can include Sinch in several ways. Pick the one that fits your setup.

### Host with your web app
Host the library with your site and include it:
```html
<script src="sinch.min.js"></script>
```

### Load from Sinch CDN 
```html
<script src="https://cdn.sinch.com/latest/sinch-rtc-min.js"></script>
```

## Integration steps

Every integration must follow these steps in order. Do not skip or reorder them.

1. **Create a SinchClient** - Build the client with application key, environment host, and user ID.
2. **Add a client listener** - Attach a `SinchClientListener` to handle `onClientStarted`, `onClientFailed`, and `onCredentialsRequired`.
3. **Authorize the client** - Implement `onCredentialsRequired` to supply a signed JWT. Decide whether to sign client-side (prototyping only) or fetch from a backend.
4. **Enable push notifications** - Call `sinchClient.setSupportManagedPush()` before `start()`. Provide a service worker (`sw.js`) that forwards push payloads to open tabs. Required for app-to-app calls, even as the caller.
5. **Start the client** - Call `sinchClient.start()`. Wait for `onClientStarted` before proceeding.
6. **Add a CallClientListener** - Attach a listener to `sinchClient.callClient` to detect incoming calls via `onIncomingCall`.
7. **Add a CallListener to each call** - On every outgoing or incoming call, attach a `CallListener` to handle `onCallProgressing`, `onCallRinging`, `onCallAnswered`, `onCallEstablished`, and `onCallEnded`.

When helping a user integrate, walk through these steps one at a time. Confirm each step is in place before moving to the next.



## Sinch Client
The *SinchClient* is the Sinch SDK entry point. It's used to configure the user’s and device’s capabilities, as well as to provide access to feature classes such as the *CallController*, *AudioController*, and *VideoController*.

### Create a *SinchClient*
```javascript
const sinchClient = Sinch.getSinchClientBuilder()
  .applicationKey("<application key>")
  .environmentHost("ocra.api.sinch.com")
  .userId("<user id>")
  .build();
```
- The *Application Key* is obtained from the [Sinch Developer Dashboard - Apps](https://dashboard.sinch.com/voice/apps).
- The *User ID* should uniquely identify the user.
- The term *Ocra* in the hostname `ocra.api.sinch.com` is the name of the Sinch API that SDK clients target.


### Start the Sinch client
Before starting, add a client listener (see [SinchClientListener reference](https://download.sinch.com/js/latest/reference/interfaces/SinchClientListener.html)):

```javascript
sinchClient.addListener({
    onClientStarted: (client) => {
      // sinch client started successfully
    },
    onClientFailed: (client, error) => {
      // sinch client start failed
    },
    onCredentialsRequired: (client, clientRegistration) => {
      // registration required, get jwt token for user and register
    }
});
sinchClient.start();
```

### Authentication & authorization  
When `SinchClient` starts with a given user ID, you must provide an authorization token (JWT) to register with Sinch. 
Implement `SinchClientListener.onCredentialsRequired()` and supply a JWT signed with the Application Secret.
<!-- Claude: read this URL for additional auth details if needed -->
Read https://developers.sinch.com/docs/in-app-calling/js/application-authentication.md

For production application it is recommended to generate and sign the JWT token on the backend server, then send it over a secure channel to the application and Sinch client running on the device.
<!-- Claude: Ask the user whether it can be embedded!-->
Ask the user whether it can be embedded. 
If it can be embedded:
A sample JWT helper is provided at `assets/jwt-helper.js`. Read and adapt it.
```javascript
onCredentialsRequired(sinchClient, clientRegistration) {
        try {
            const jwt = new JWT(CONFIG.applicationKey, CONFIG.applicationSecret, this.userId);
            const token = await jwt.toJwt();
            clientRegistration.register(token);
        } catch (error) {
            console.log('Authentication failed: ' + error.message);
            clientRegistration.registerFailed();
        }
    }
```
If it can not be embedded:
Implement the required functionality on your backend and fetch a signed registration token when required.

```javascript
onCredentialsRequired: (sinchClient, clientRegistration) => {
  yourAuthServer
    .getRegistrationToken(sinchClient.userId)
    .then((token) => {
      clientRegistration.register(token);
    })
    .catch(() => {
      clientRegistration.registerFailed();
    });
};
```

### Push notifications
To receive incoming calls in the browser via W3C Web Push API, enable managed push:

```javascript
// Enable managed push with the default Service Worker path (sw.js)
sinchClient.setSupportManagedPush();
```

By default, Sinch expects a Service Worker file at `sw.js` in your current directory.
If you use a custom path or filename, pass it explicitly:

```javascript
sinchClient.setSupportManagedPush("<path_to_serviceworker>");
```

Add a basic Service Worker that forwards push payloads to open tabs.
This lets `SinchClient` process the payload and trigger `CallClientListener.onIncomingCall` when a new call arrives.

```javascript
// sw.js (basic example)
self.addEventListener("push", (event) => {
  const body = event.data?.json?.() ?? null;
  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            visible: client.visibilityState === "visible",
            data: body,
          });
        });
      })
  );
});
```

For a more advanced `sw.js` that handles mobile browser limitations, see the reference app:
[voicecall/sw.js](https://github.com/sinch/rtc-reference-applications/blob/master/javascript/samples/voicecall/sw.js)

When managed push is enabled and your Service Worker forwards messages as above, incoming calls will be delivered to `onIncomingCall` in [CallClientListener](https://download.sinch.com/js/latest/reference/interfaces/CallClientListener.html#onincomingcall-1).

Note:
For use cases requiring only outgoing App-to-Phone, App-to-SIP, or App-to-Conference calls, calling `sinchClient.setSupportManagedPush` is not required. You can place these calls directly once the Sinch client is started.

## Voice calling
The Sinch SDK supports four types of calls: *app-to-app (audio or video)*, *app-to-phone*, *app-to-sip* and *conference* calls. The *CallClient* is the entry point for the calling functionality of the Sinch SDK.
Calls are placed through the *CallClient* and events are received using the *CallClientListener*. The call client is owned by the SinchClient and accessed using `sinchClient.callClient`.

### Set up an *App-to-App* call
Use the [CallClient.callUser()](https://download.sinch.com/js/latest/reference/interfaces/CallClient.html#calluser) method so Sinch can connect the call to the callee.

```javascript
var callClient = sinchClient.callClient;
var call = callClient.callUser('<remote user id>');
// Video call:
// var call = callClient.callUserVideo('<remote user id>');
call.addListener(...);
```
The returned call object includes participant details, start time, state,and possible errors.

Assuming the callee’s device is available,
[CallListener.onCallProgressing()](https://download.sinch.com/js/latest/reference/interfaces/CallListener.html#oncallprogressing)
is invoked. If you play a progress tone, start it here.
When the callee receives the call,
[CallListener.onCallRinging()](https://download.sinch.com/js/latest/reference/interfaces/CallListener.html#oncallringing)
fires. This indicates the callee’s device is ringing.
When the other party answers,
[CallListener.onCallAnswered()](https://download.sinch.com/js/latest/reference/interfaces/CallListener.html#oncallanswered)
is called. Stop any progress tone.
Once full audio connectivity is established,
[CallListener.onCallEstablished()](https://download.sinch.com/js/latest/reference/interfaces/CallListener.html#oncallestablished)
is emitted. Users can now talk.

Typically, connectivity is already established when the call is answered, so
`onCallEstablished` may follow immediately after `onCallAnswered`.
On poor networks, it can take longer—consider showing a “connecting”
indicator.

**Important:**
For *App-to-App* calls, you must enable managed push by calling `sinchClient.setSupportManagedPush()`, even if you are the caller. See the full setup in [Push notifications](/docs/in-app-calling/js/push-notifications).

### Set up an *App-to-Phone* call

An *app-to-phone* call is a call that's made to a phone on the regular telephone network. Setting up an *app-to-phone* call is not much different than setting up an *app-to-app* call. Instead of invoking the `callUser` method, invoke the [CallClient.callPhoneNumber()](https://download.sinch.com/js/latest/reference/interfaces/CallClient.html#callphonenumber) method and pass an E.164 number prefixed with `+`. For example, to call the US phone number 415 555 0101, specify `+14155550101`. The `+` is the required prefix with the US country code `1` prepended to the local subscriber number.

#### Presenting a number to the destination you are calling

Mandatory step!
You must provide a CLI (Calling Line Identifier) or your call will fail.
You need a number from Sinch so you can provide a valid CLI to the handset you are calling.
Specify your CLI during building SinchClient by using [callerIdentifier](https://download.sinch.com/js/latest/reference/interfaces/SinchClientBuilder.html#calleridentifier-1) method.

Note: When your account is in trial mode, you can only call your [verified numbers](https://dashboard.sinch.com/numbers/verified-numbers). If you want to call any number, you need to upgrade your account!

### Set up an *App-to-sip* call

An *app-to-sip* call is a call that's made to a SIP server. Setting up an *app-to-sip* call is not much different from setting up an *app-to-app* call. Instead of invoking the `callUser` method, invoke [CallClient.callSip()](https://download.sinch.com/js/latest/reference/interfaces/CallClient.html#callsip). The SIP identity should be in the form `user@server`. By convention, when passing custom headers in the SIP call, the headers should be prefixed with `x-`. If the SIP server reports any errors, the `CallDetails` object will provide an error with the `SIP` error type.

### Set up a *Conference* call
A *conference* call can be made to connect a user to a conference room where multiple users can be connected at the same time. The identifier for a conference room may not be longer than 64 characters.

```javascript
var callClient = sinchClient.callClient;
var call = callClient.callConference('<conferenceId>');
call.addListener(...);
```

### Selecting audio input device

To select a specific audio input device, set the `deviceId` constraint via
[CallClient.setAudioTrackConstraints()](https://download.sinch.com/js/latest/reference/interfaces/CallClient.html#setaudiotrackconstraints).


```javascript
sinchClient.callClient.setAudioTrackConstraints({
  deviceId: { exact: <yourVideoDeviceId> },
});
```

For a full sample of input/output device selection, see the
[reference app](https://github.com/sinch/rtc-reference-applications/tree/master/javascript/samples).

### Handle incoming calls

To answer calls, the application must be notified when the user receives an incoming call.

Add a [CallClientListener](https://download.sinch.com/js/latest/reference/interfaces/CallClientListener.html) to `CallClient` to act on incoming calls. When a call arrives, [CallClientListener.onIncomingCall()](https://download.sinch.com/js/latest/reference/interfaces/CallClientListener.html#onincomingcall) is executed.


```javascript
var callClient = sinchClient.callClient;
callClient.addListener(...);
```

When the incoming call method is executed, the call can either be connected automatically without any user action, or it can wait for the user to press the answer or the hangup button. If the call is set up to wait for a user response, we recommended that a ringtone is played to notify the user that there is an incoming call.


```javascript
onIncomingCall = (callClient, call) => {
    // Start playing ringing tone
    ...

    // Add call listener
    call.addListener(...);
}
```

To get events related to the call, add a call listener. The call object contains details about participants, start time, potential error codes, and error messages.

#### Receiving Calls from PSTN or SIP (Phone-to-App / SIP-to-App)

The Sinch SDK supports receiving incoming calls that originate from the PSTN (regular phone network) or from SIP endpoints.
When a call arrives at a Sinch voice number or via SIP origination, the Sinch platform triggers an **Incoming Call Event (ICE)** callback to your backend.
Our platform can then route this call to an in-app user by responding with the `connectMxp` SVAML action.

##### Prerequisites

1. Rent a voice number from the [Sinch Build Dashboard](https://dashboard.sinch.com/numbers/overview) and assign it to your application, OR configure SIP origination for your application
2. Configure a callback URL in your app's Voice settings where Sinch will send call-related events
3. Implement the ICE callback handler in your backend to route calls to the appropriate app user


##### Backend Implementation

When a PSTN or SIP call comes in, respond to the ICE callback with a `connectMxp` action to route the call to an app user:

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

#### Incoming video call

When an incoming call is a video call, the [CallClientListener.onIncomingCall()](https://download.sinch.com/js/latest/reference/interfaces/CallClientListener.html) section for details on how to add video views.

#### Answer incoming call

To answer the call, use the
[Call.answer()](https://download.sinch.com/js/latest/reference/interfaces/Call.html#answer)
method on the call to accept it. If a ringtone was previously played, it
should be stopped now.

User presses the answer button:


```javascript
// User answers the call
call.answer();

// Stop playing ringing tone
```

#### Decline incoming call

If the call shouldn't be answered, use
[Call.hangup()](https://download.sinch.com/js/latest/reference/interfaces/Call.html#hangup)
on the call to decline. The caller is notified that the incoming call was
denied. If a ringtone was previously played, it should be stopped now.

User presses the hangup button:

```javascript
// User doesn't want to answer
call.hangup();

// Stop playing ringing tone
...
```

### Disconnecting a Call
When the user wants to disconnect an ongoing call, use [Call.hangup()](https://download.sinch.com/js/latest/reference/interfaces/Call.html#hangup) method. Either user taking part in a call can disconnect it.
Hanging up a call:

```javascript
call.hangup();
```

When either party disconnects a call, the application is notified using the
call listener method
[CallListener.onCallEnded()](https://download.sinch.com/js/latest/reference/interfaces/CallListener.html#oncallended).
This allows the user interface to be updated, an alert tone to be played, or
similar actions to occur.

A call can be disconnected before it has been completely established.

Hanging up a connecting call:

```javascript
// Starts a call asynchronously
var call = callClient.callUser('<remote user id>');

// User changed his/her mind, let’s hangup
call.hangup();
```

## Video Calling

Set up video calls with the Sinch JavaScript Voice and Video SDK.

### Setting up a video call

Video calls follow the same flow as audio calls.
Use [CallClient.callUserVideo()](https://download.sinch.com/js/latest/reference/interfaces/CallClient.html#calluservideo) to start a video call with a specific user.
You’ll receive the same callbacks as for audio: progressing, ringing, answered, and established. For lifecycle details, see [Audio calling](/docs/in-app-calling/js/calling).

### Showing the video streams
Once you have a `Call`, you can access two MediaStreams:
- `incomingStream` — remote stream sent to your app
- `outgoingStream` — your local stream sent to the other party

Access them via [Call.incomingStream](https://download.sinch.com/js/latest/reference/interfaces/Call.html#incomingstream) and [Call.outgoingStream](https://download.sinch.com/js/latest/reference/interfaces/Call.html#outgoingstream).
Bind the appropriate stream to a `<video>` element by setting `srcObject`:

```javascript
const videoElement = document.getElementById(`${direction}-video`);
videoElement.srcObject = call.incomingStream;
```

#### Pausing and resuming a video stream

Use [Call.pauseVideo()](https://download.sinch.com/js/latest/reference/interfaces/Call.html#pausevideo) to temporarily stop sending your local video (for privacy or to save bandwidth). Use [Call.resumeVideo](https://download.sinch.com/js/latest/reference/interfaces/Call.html#resumevideo) to start sending it again. Audio continues unless you mute it separately.

### Switching capturing device
To select a specific camera, set the `deviceId` constraint via [CallClient.setVideoTrackConstraints()](https://download.sinch.com/js/latest/reference/interfaces/CallClient.html#setvideotrackconstraints).

```javascript
sinchClient.callClient.setVideoTrackConstraints({
  deviceId: { exact: <yourVideoDeviceId> },
});
```

For a full sample of input/output device selection, see the
[reference app](https://github.com/sinch/rtc-reference-applications/tree/master/javascript/samples).