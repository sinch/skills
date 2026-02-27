<!-- Reference file for Android SDK integration.
        Read only when the user's project targets Android. -->
# Sinch Android Voice and Video SDK

## Add the Sinch library

You can include the Sinch SDK in your Android project in two ways.

### AAR from SDK download
Copy the `.aar` file to your `libs` folder and update `build.gradle`:
```gradle
repositories {
    flatDir {
        dirs 'libs'
    }
}

dependencies {
    implementation(name:'sinch-android-rtc', version:'+', ext:'aar')
}
```

### Maven Central
Consume the SDK directly from Maven Central. See the [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads#android-sdk-on-maven-central) page for the Gradle coordinates.

## Integration steps

Every integration must follow these steps in order. Do not skip or reorder them.

1. **Declare permissions in AndroidManifest.xml** - Add `INTERNET`, `ACCESS_NETWORK_STATE`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `READ_PHONE_STATE` . And  add `CAMERA` if the implementation uses video calls.
2. **Request runtime permissions** - Before starting a call, request `RECORD_AUDIO` (and `CAMERA` for video calls) from the user at runtime using the standard Android permission flow. The SDK will not function correctly without these grants.
3. **Set up FCM** - Add `google-services.json` to your project, include the `com.google.gms.google-services` Gradle plugin, and add `com.google.firebase:firebase-messaging` as a dependency. Obtain the FCM sender ID and registration token.
4. **Build a PushConfiguration** - Create an `FcmPushConfiguration` with the sender ID and registration token obtained in step 3.
5. **Create a SinchClient** - Build the client with application key, environment host, user ID, Android context, and the push configuration from step 4.
6. **Add a SinchClientListener** - Attach a `SinchClientListener` to handle `onClientStarted`, `onClientFailed`, and `onCredentialsRequired`.
7. **Authorize the client** - Implement `onCredentialsRequired` to supply a signed JWT. Decide whether to sign on-device (prototyping only) or fetch from a backend.
8. **Start the client** - Call `sinchClient.start()`. Wait for `onClientStarted` before proceeding.
9. **Add a CallControllerListener** - Attach a listener to `sinchClient.callController` to detect incoming calls via `onIncomingCall`.
10. **Add a CallListener to each call** - On every outgoing or incoming call, attach a `CallListener` (or `VideoCallListener` for video) to handle `onCallProgressing`, `onCallRinging`, `onCallAnswered`, `onCallEstablished`, and `onCallEnded`.

When helping a user integrate, walk through these steps one at a time. Confirm each step is in place before moving to the next.


## Permissions

Add the following to your `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
```

**Runtime permissions (Android 6.0+):**
`RECORD_AUDIO` and `CAMERA` are dangerous permissions. You must request them at runtime before placing or answering a call.
<!-- Claude: remind the user to request RECORD_AUDIO before any call and CAMERA before video calls -->
Ask the user whether they have implemented the runtime permission request. If not, guide them through the standard `ActivityCompat.requestPermissions` flow for `RECORD_AUDIO` (required for all calls) and `CAMERA` (required for video calls).

```kotlin
// Example: request audio and camera permissions before a video call
val permissions = arrayOf(
    Manifest.permission.RECORD_AUDIO,
    Manifest.permission.CAMERA
)
ActivityCompat.requestPermissions(activity, permissions, REQUEST_CODE)
```

After the user grants permissions, verify with `SinchClient.checkManifest()` before starting the client. This method checks that all permissions required by the currently enabled features are granted.

Note: By default the SDK hangs up Sinch calls when a native phone call is active. This requires `READ_PHONE_STATE`. To disable this behavior, call `sinchClient.callController.setRespectNativeCalls(false)` and remove the permission.


## Sinch Client
The *SinchClient* is the Sinch SDK entry point. It configures user and device capabilities and provides access to the *CallController*, *AudioController*, and *VideoController*.

### Create a *SinchClient*
```kotlin
val sinchClient = SinchClient.builder()
    .context(applicationContext)
    .applicationKey("<application key>")
    .environmentHost("ocra.api.sinch.com")
    .userId("<user id>")
    .pushConfiguration(pushConfiguration) // see Push Notifications section
    .build()
```
- The *Application Key* is obtained from the [Sinch Developer Dashboard - Apps](https://dashboard.sinch.com/voice/apps).
- The *User ID* should uniquely identify the user on the device.
- The term *Ocra* in the hostname `ocra.api.sinch.com` is the name of the Sinch API that SDK clients target.
- The *Push Configuration* registers the device for incoming call notifications. See [Push Notifications](#push-notifications-fcm).

**Listener threading:** All listener callbacks are invoked on the same thread that called `SinchClientBuilder.build`. If that is not the main thread, it must have an associated `Looper`.

### Start the Sinch client
Before starting, add a client listener (see [SinchClientListener reference](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc/-sinch-client-listener/index.html)):

```kotlin
sinchClient.addSinchClientListener(object : SinchClientListener() {

    override fun onClientStarted(client: SinchClient) {
        // Sinch client started successfully
    }

    override fun onClientFailed(client: SinchClient, error: SinchError) {
        // Sinch client start failed
    }

    override fun onCredentialsRequired(clientRegistration: ClientRegistration) {
        // Registration required, get JWT token for user and register
    }

    override fun onLogMessage(level: Int, area: String, message: String) { }
})

sinchClient.start()
```

### Authentication & authorization
When `SinchClient` starts with a given user ID, you must provide an authorization token (JWT) to register with Sinch.
Implement `SinchClientListener.onCredentialsRequired()` and supply a JWT signed with the Application Secret.
<!-- Claude: read https://developers.sinch.com/docs/in-app-calling/android/application-authentication.md for additional auth details if needed -->
Read https://developers.sinch.com/docs/in-app-calling/android/application-authentication.md

For production application it is recommended to generate and sign the JWT token on the backend server, then send it over a secure channel to the application and Sinch client running on the device. 
For development or test purposes it is fine to have it embeded.
<!-- Claude: Ask the user whether it can be embedded! -->
Ask the user whether it can be embedded.
If it can be embedded:
A sample code for jwt generation is provided at `assets/jwt-helper-andorid` folder. Read and adapt it.
```kotlin
override fun onCredentialsRequired(clientRegistration: ClientRegistration) {
    try {
        val jwt = JWT.create(APP_KEY, APP_SECRET, userId)
        clientRegistration.register(jwt)
    } catch (e: Exception) {
        Log.e(TAG, "Authentication failed: ${e.message}")
        clientRegistration.registerFailed()
    }
}
```
If it cannot be embedded:
Implement the required functionality on your backend and fetch a signed registration token when required.

```kotlin
override fun onCredentialsRequired(clientRegistration: ClientRegistration) {
    yourAuthServer.getRegistrationToken(userId, object : AuthCallback {
        fun onSuccess(token: String) {
            clientRegistration.register(token)
        }
        fun onFailure() {
            clientRegistration.registerFailed()
        }
    })
}
```

### Lifecycle management
Keep the `SinchClient` instance alive and started for the lifetime of the running application. Avoid unnecessary stop/restart cycles.

Stopping or disposing of a `SinchClient` does not prevent receiving incoming calls if the user was previously registered. When an incoming call push arrives, create a new `SinchClient` and forward the push payload to it.

To fully dispose:
```kotlin
sinchClient?.terminateGracefully()
sinchClient = null
```


## Push Notifications (FCM)

Push notifications let your app receive incoming calls even when backgrounded or closed. This section covers the FCM flow only.

### Step 1. Add Firebase to your project

1. Register your app in the [Firebase Console](https://console.firebase.google.com/).
2. Download `google-services.json` and place it in your app module's root folder (e.g. `app/google-services.json`).
3. Add the Google Services Gradle plugin in your project-level `build.gradle`:
```gradle
plugins {
    id 'com.google.gms.google-services' version '<latest>' apply false
}
```
4. Apply it in your app-level `build.gradle`:
```gradle
plugins {
    id 'com.google.gms.google-services'
}
```
5. Add the Firebase Messaging dependency:
```gradle
dependencies {
    implementation 'com.google.firebase:firebase-messaging:<latest>'
}
```

### Step 2. Configure FCM v1 OAuth in the Sinch Dashboard

In the [Sinch Dashboard](https://dashboard.sinch.com/voice/apps), select your app and go to the "In-app Voice & Video SDKs" tab. Under "Google FCM Identification", provide your OAuth endpoints so Sinch can send push messages on your behalf. This requires implementing a backend OAuth flow. See the [FCM v1 OAuth2.0 documentation](https://developers.sinch.com/docs/in-app-calling/android/push-notifications#fcm-v1-oauth20-flow) for details.

### Step 3. Acquire sender ID and registration token

```kotlin
// Sender ID (stable, bundled in google-services.json)
val senderId: String = FirebaseApp.getInstance().options.gcmSenderId.orEmpty()

// Registration token (async, can change)
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val registrationToken = task.result
        // Use this token to build push configuration
    }
}
```

Track token changes by overriding `onNewToken` in your `FirebaseMessagingService`. When the token changes, recreate `SinchClient` with the new token.

### Step 4. Build PushConfiguration and pass to SinchClient

```kotlin
val pushConfiguration = PushConfiguration.fcmPushConfigurationBuilder()
    .senderID(senderId)
    .registrationToken(registrationToken)
    .build()

val sinchClient = SinchClient.builder()
    .context(applicationContext)
    .applicationKey("<application key>")
    .userId("<user id>")
    .environmentHost("ocra.api.sinch.com")
    .pushConfiguration(pushConfiguration)
    .build()

sinchClient.addSinchClientListener(listener)
sinchClient.start()
```

### Step 5. Implement the FCM Listening Service

Create a service extending `FirebaseMessagingService` to receive and forward Sinch push payloads:

```kotlin
class FcmListenerService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (SinchPush.isSinchPushPayload(remoteMessage.data)) {
            val result = SinchPush.queryPushNotificationPayload(
                applicationContext, remoteMessage.data
            )
            // result contains caller info, video flag, timeout status
            // Forward to your running SinchClient instance:
            sinchClient.relayRemotePushNotification(result)
        } else {
            // Not a Sinch message, handle your own push logic
        }
    }

    override fun onNewToken(token: String) {
        // Token changed: recreate SinchClient with new token
    }
}
```

### Unregistering a device
If the user logs out, call `sinchClient.unregisterPushToken()` so the device stops receiving incoming call notifications. This is critical if your app supports switching between users on the same device.

Note:
For use cases requiring only outgoing App-to-Phone, App-to-SIP, or App-to-Conference calls, providing `PushConfiguration` is not required. You can place these calls directly once the Sinch client is started.


## Voice Calling
The Sinch SDK supports four types of calls: *app-to-app (audio or video)*, *app-to-phone*, *app-to-sip* and *conference* calls. The *CallController* is the entry point for calling functionality.
Calls are placed through the *CallController* and events are received using the *CallControllerListener*. The call controller is owned by the SinchClient and accessed using `sinchClient.callController`.

### Set up an *App-to-App* call
Use the [CallController.callUser()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-controller/call-user.html) method so Sinch can connect the call to the callee.

```kotlin
val callController = sinchClient.callController
val call = callController.callUser("<remote user id>", MediaConstraints(false))
// Video call:
// val call = callController.callUser("<remote user id>", MediaConstraints(true))
call.addCallListener(...)
```
The returned call object includes participant details, start time, state, and possible errors.

Assuming the callee's device is available,
[CallListener.onCallProgressing()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-listener/on-call-progressing.html)
is invoked. If you play a progress tone, start it here.
When the callee receives the call,
[CallListener.onCallRinging()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-listener/on-call-ringing.html)
fires. This indicates the callee's device is ringing.
When the other party answers,
[CallListener.onCallAnswered()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-listener/on-call-answered.html)
is called. Stop any progress tone.
Once full audio connectivity is established,
[CallListener.onCallEstablished()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-listener/on-call-established.html)
is emitted. Users can now talk.

Typically, connectivity is already established when the call is answered, so
`onCallEstablished` may follow immediately after `onCallAnswered`.
On poor networks, it can take longer. Consider showing a "connecting" indicator.

**Important:**
For *App-to-App* calls, you must provide FCM `PushConfiguration` to `SinchClientBuilder` to receive push messages. See the full setup in [Push Notifications](#push-notifications-fcm).

### Set up an *App-to-Phone* call

An *app-to-phone* call targets the regular telephone network. Use [CallController.callPhoneNumber()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-controller/call-phone-number.html) with an E.164 formatted number prefixed with `+`. For example, to call the US number 415 555 0101, use `+14155550101`.

#### Presenting a number to the destination you are calling

Mandatory step!
You must provide a CLI (Calling Line Identifier) or your call will fail.
You need a number from Sinch so you can provide a valid CLI to the handset you are calling.

Note: When your account is in trial mode, you can only call your [verified numbers](https://dashboard.sinch.com/numbers/verified-numbers). If you want to call any number, you need to upgrade your account!

```kotlin
val callController = sinchClient.callController
val destinationNumber = "<E.164 formatted number>"
val cli = "<your Sinch number>"
val call = callController.callPhoneNumber(destinationNumber, cli)
```

### Set up an *App-to-sip* call

Use [CallController.callSip()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-controller/call-sip.html). The SIP identity should be in the form `user@server`. Custom SIP headers should be prefixed with `x-`. If the SIP server reports errors, `CallDetails` will provide an error with the `SIP` error type.

### Set up a *Conference* call
A *conference* call connects a user to a room where multiple users can participate simultaneously. The conference room identifier may not exceed 64 characters.

```kotlin
val callController = sinchClient.callController
val call = callController.callConference("<conferenceId>")
call.addCallListener(...)
```

### Handle incoming calls

Add a [CallControllerListener](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-controller-listener/index.html) to `CallController` to act on incoming calls. When a call arrives, [CallControllerListener.onIncomingCall()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-controller-listener/index.html) is executed.

```kotlin
val callController = sinchClient.callController
callController.addCallControllerListener(...)
```

When the incoming call callback fires, the call can be connected automatically or wait for user interaction. If waiting, play a ringtone to notify the user.

```kotlin
override fun onIncomingCall(callController: CallController, call: Call) {
    // Start playing ringing tone
    ...

    // Add call listener
    call.addCallListener(...)
}
```

#### Receiving Calls from PSTN or SIP (Phone-to-App / SIP-to-App)

The Sinch SDK supports receiving incoming calls from the PSTN or SIP endpoints. When a call arrives at a Sinch voice number or via SIP origination, the Sinch platform triggers an **Incoming Call Event (ICE)** callback to your backend. Your platform can then route this call to an in-app user by responding with the `connectMxp` SVAML action.

##### Prerequisites

1. Rent a voice number from the [Sinch Build Dashboard](https://dashboard.sinch.com/numbers/overview) and assign it to your application, OR configure SIP origination for your application.
2. Configure a callback URL in your app's Voice settings where Sinch will send call-related events.
3. Implement the ICE callback handler in your backend to route calls to the appropriate app user.

##### Backend Implementation

When a PSTN or SIP call comes in, respond to the ICE callback with a `connectMxp` action:

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

When an incoming call is a video call, `onIncomingCall` is also executed and `call.details.isVideoOffered` returns `true`. See [Video Calling](#video-calling) for how to handle video views.

#### Answer incoming call

Use [Call.answer()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call/answer.html) to accept. Stop any ringtone.

```kotlin
// User answers the call
call.answer()

// Stop playing ringing tone
```

#### Decline incoming call

Use [Call.hangup()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call/hangup.html) to decline. The caller is notified. Stop any ringtone.

```kotlin
// User doesn't want to answer
call.hangup()

// Stop playing ringing tone
```

### Disconnecting a Call
Use [Call.hangup()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call/hangup.html). Either party can disconnect.

```kotlin
call.hangup()
```

When either party disconnects, [CallListener.onCallEnded()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call-listener/on-call-ended.html) fires, allowing you to update the UI or play an alert tone.

A call can be disconnected before it is fully established:
```kotlin
val call = callController.callUser("<remote user id>", MediaConstraints(false))
// User changed their mind
call.hangup()
```

### Volume control

Call `setVolumeControlStream(AudioManager.STREAM_VOICE_CALL)` on the `Activity` handling the call so hardware volume buttons control the call volume. Reset it when the call ends:

```kotlin
override fun onCallEnded(call: Call) {
    setVolumeControlStream(AudioManager.USE_DEFAULT_STREAM_TYPE)
}
```

### Audio routing

Use [AudioController](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc/-audio-controller/index.html) via `sinchClient.audioController` to control mute, speaker, and automatic audio routing.

Key methods: `mute()`, `unmute()`, `enableSpeaker()`, `disableSpeaker()`, `enableAutomaticAudioRouting(config)`, `disableAutomaticAudioRouting()`.

Automatic audio routing priorities: Bluetooth (if enabled and `BLUETOOTH` permission granted) > Wired headset > Default (speakerphone or earpiece based on `useSpeakerphone` setting or proximity sensor in `AUTO` mode).


## Video Calling

Video calls follow the same flow as audio calls but use `MediaConstraints(true)` and a `VideoCallListener`.

### Setting up a video call

```kotlin
val call = sinchClient.callController.callUser("<remote user id>", MediaConstraints(true))
call.addCallListener(myVideoCallListener)
```

**Remember:** Request `CAMERA` permission at runtime before placing or answering a video call.

### Showing the video streams

Implement [VideoCallListener](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.video/-video-call-listener/index.html) and use `onVideoTrackAdded` to get video views:

```kotlin
override fun onVideoTrackAdded(call: Call) {
    val videoController = sinchClient.videoController
    val localView = videoController.localView
    val remoteView = videoController.remoteView

    // Add localView and remoteView to your view hierarchy
}
```

Remove the views from your hierarchy when the call ends.

#### Pausing and resuming a video stream

Use [Call.pauseVideo()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call/pause-video.html) and [Call.resumeVideo()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.calling/-call/resume-video.html). Audio continues unless muted separately.

Listeners are notified via `VideoCallListener.onVideoTrackPaused()` and `onVideoTrackResumed()` to update UI accordingly.

### Video scaling

Use `VideoController.setResizeBehaviour(VideoScalingType)` and `setLocalResizeBehaviour(VideoScalingType)` to control scaling. Options: `ASPECT_FIT`, `ASPECT_FILL`, `ASPECT_BALANCED`.

### Switching camera

Toggle front/back camera using [VideoController.toggleCaptureDevicePosition()](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.video/-video-controller/toggle-capture-device-position.html).

### Accessing raw video frames

Implement [RemoteVideoFrameListener](https://download.sinch.com/android/latest/reference/sinch-rtc/com.sinch.android.rtc.video/-remote-video-frame-listener/index.html) and register it with `videoController.setRemoteVideoFrameListener(handler)` to receive raw I420 frames for processing (filters, screenshots, etc.). A similar `setLocalVideoFrameListener` exists for local frames.

Use `VideoUtils.I420toNV21Frame(videoFrame)` to convert to NV21 format for saving as an image on Android.