<!-- Reference file for iOS SDK integration (Swift).
        Read only when the user's project targets iOS. -->
# Sinch iOS Voice and Video SDK (Swift)

Minimum supported deployment target: **iOS 12.0**.

## Add the Sinch library
You can include the Sinch SDK in several ways. Pick the one that fits your setup.

### Swift Package Manager (recommended for Swift)
1. In Xcode, go to **File > Add Package Dependencies...**
2. Repository URL:
```
https://github.com/sinch/sinch-ios-sdk-spm
```
3. Choose a dependency rule:
   - Branch `dynamic` (or `main`) for the latest dynamic xcframework
   - Branch `static` for the latest static xcframework
   - **Exact Version** `x.y.z` for a pinned dynamic release
4. Click **Add Package**.

For `dynamic`/`main`: in your app target > General > Frameworks, Libraries, and Embedded Content, set SinchRTC to **Embed & Sign**.
For `static`: set SinchRTC to **Do Not Embed**.

### CocoaPods (Objective-C only)
```ruby
platform :ios, '12.0'

target 'YourApp' do
  pod 'SinchRTC', 'x.y.z'
  workspace './YourApp.xcworkspace'
end
```
Then run `pod install`.

### Manual integration
Drag `SinchRTC.xcframework` (Swift) or `Sinch.xcframework` (Objective-C) into the Frameworks section in Xcode Project Navigator and set it to **Embed & Sign**.

If you integrate manually, link these system frameworks/libraries: `libc++.tbd`, `libz.tbd`, `Security.framework`, `AVFoundation.framework`, `AudioToolbox.framework`, `VideoToolbox.framework`, `CoreMedia.framework`, `CoreVideo.framework`, `CoreImage.framework`, `GLKit.framework`, `OpenGLES.framework`, `QuartzCore.framework`, `Metal.framework`, `MetalKit.framework`, `PushKit.framework`, `SystemConfiguration.framework`.

## Capabilities and Info.plist

Before writing any code, configure your Xcode project. iOS handles permission prompts automatically at runtime, but you must declare the required entries or your app will crash or be rejected.

### Capabilities
Enable **Push Notifications** in your app target's Signing & Capabilities. This adds `aps-environment` to your entitlements.

### Info.plist entries

Add the following keys to your `Info.plist`:

**Required background modes** (`UIBackgroundModes`):
- `audio` - App plays audio or streams audio/video using AirPlay
- `voip` - App provides Voice over IP services

**Privacy - Microphone Usage Description** (`NSMicrophoneUsageDescription`):
A string explaining why the app needs microphone access. Example: `"Application wants to use your microphone to be able to capture your voice in a call."`

**Privacy - Camera Usage Description** (`NSCameraUsageDescription`) - only if you enable video:
A string explaining why the app needs camera access. Example: `"Application wants to use your camera to be able to make a video call."`

Note: iOS will present a system permission dialog to the user the first time the microphone or camera is activated. You do not request these permissions manually through Sinch, but you must declare the usage descriptions or iOS will terminate your app.

## Integration steps

Every integration must follow these steps in order. Do not skip or reorder them.

1. **Configure Info.plist and Capabilities** - Add background modes (`audio`, `voip`), microphone/camera usage descriptions, and enable Push Notifications capability.
2. **Create a SinchClient** - Instantiate with application key, environment host, and user ID.
3. **Set the client delegate** - Assign a `SinchClientDelegate` to handle `clientDidStart`, `clientDidFail`, and `clientRequiresRegistrationCredentials`.
4. **Authorize the client** - Implement `clientRequiresRegistrationCredentials` to supply a signed JWT. Decide whether to sign locally (prototyping only) or fetch from a backend.
5. **Enable managed push notifications** - Call `sinchClient.enableManagedPushNotifications()` before `start()`. Create `SinchManagedPush` early in your app lifecycle (typically in `AppDelegate`). Required for app-to-app calls, even as the caller.
6. **Set up CallKit (or LiveCommunicationKit)** - Integrate with Apple's system calling UI. You must report every incoming VoIP push as a call to CallKit/LiveCommunicationKit before the push delegate returns, or iOS will terminate your app. Also report outgoing calls so audio works when the app is backgrounded or the device is locked. You do not provide any token manually when building the client for this; the integration between Sinch and CallKit happens through push payload handling and `CXProvider`/`ConversationManager`.
7. **Start the client** - Call `sinchClient.start()`. Wait for `clientDidStart` before proceeding.
8. **Add a SinchCallClientDelegate** - Assign a delegate to `sinchClient.callClient` to detect incoming calls via `client(_:didReceiveIncomingCall:)`.
9. **Add a SinchCallDelegate to each call** - On every outgoing or incoming call, assign a `SinchCallDelegate` to handle `callDidProgress`, `callDidRing`, `callDidAnswer`, `callDidEstablish`, and `callDidEnd`.

When helping a user integrate, walk through these steps one at a time. Confirm each step is in place before moving to the next.


## Sinch Client
The `SinchClient` is the Sinch SDK entry point. It manages the client lifecycle and capabilities, and exposes feature APIs such as `callClient` (calling), `audioController` (audio), and `videoController` (video).

### Create a SinchClient
```swift
import SinchRTC

// Keep a strong reference to sinchClient
private(set) var sinchClient: SinchClient?

do {
  self.sinchClient = try SinchRTC.client(withApplicationKey: "<application key>",
                                         environmentHost: "ocra.api.sinch.com",
                                         userId: "<user id>")
} catch {
  // Handle error
}
```
- The *Application Key* is obtained from the [Sinch Developer Dashboard - Apps](https://dashboard.sinch.com/voice/apps).
- The *User ID* should uniquely identify the user on the current device.
- The term *Ocra* in the hostname `ocra.api.sinch.com` is the name of the Sinch API that SDK clients target.

### Start the Sinch client
Before starting, assign a delegate conforming to `SinchClientDelegate`:

```swift
sinchClient.delegate = self
sinchClient.start()
```

Delegate methods:

```swift
// SinchClientDelegate

func clientDidStart(_ client: SinchRTC.SinchClient) {
  // Sinch client started successfully
}

func clientDidFail(_ client: SinchRTC.SinchClient, error: Error) {
  // Sinch client start failed
}

func clientRequiresRegistrationCredentials(_ client: SinchRTC.SinchClient,
                                           withCallback callback: SinchRTC.SinchClientRegistration) {
  // Registration required, get JWT token for user and register
}
```

### Authentication & authorization
When `SinchClient` starts with a given user ID, you must provide an authorization token (JWT) to register with Sinch.
Implement `clientRequiresRegistrationCredentials(_:withCallback:)` and supply a JWT signed with a key derived from the Application Secret.
<!-- Claude: read this URL for additional auth details if needed -->
Read https://developers.sinch.com/docs/in-app-calling/ios/auth.md

In general it is not suggested to embed the Application Secret in a production application.
<!-- Claude: Ask the user whether it can be embedded! -->
Ask the user whether it can be embedded.
If it can be embedded:
The Swift reference application on [GitHub](https://github.com/sinch/rtc-reference-applications/tree/master/ios) includes a `SinchJWT.swift` helper that demonstrates how to create and sign the JWT locally. I can be also found in `assets/SinchJWT.swift` Read and adapt it.

```swift
func clientRequiresRegistrationCredentials(_ client: SinchRTC.SinchClient,
                                           withCallback callback: SinchRTC.SinchClientRegistration) {
  do {
    // WARNING: Development example only. In production, fetch a JWT from your backend.
    let jwt = try SinchJWT.sinchJWTForUserRegistration(withApplicationKey: "<application key>",
                                                        applicationSecret: "<application secret>",
                                                        userId: client.userId)
    callback.register(withJWT: jwt)
  } catch {
    callback.registerDidFail(error: error)
  }
}
```
If it can not be embedded:
Implement the required functionality on your backend and fetch a signed registration token when required.

```swift
func clientRequiresRegistrationCredentials(_ client: SinchRTC.SinchClient,
                                           withCallback callback: SinchRTC.SinchClientRegistration) {
  authServer.fetchRegistrationToken(for: client.userId) { result in
    switch result {
    case .success(let token):
      callback.register(withJWT: token)
    case .failure(let error):
      callback.registerDidFail(error: error)
    }
  }
}
```

### Life cycle management
Create and start a single `SinchClient` and keep it alive for the lifetime of your application. Retain a strong reference. The client uses little memory once started.

To temporarily stop incoming calls without disposing the client:
```swift
sinchClient.unregisterPushNotificationDeviceToken()
```

To completely stop and dispose of the client:
```swift
sinchClient.terminateGracefully()
sinchClient = nil
```

### Push notifications
To receive incoming calls via Apple VoIP push notifications, enable managed push on the client and set up `SinchManagedPush`.

**Enable managed push on the client:**
```swift
sinchClient.enableManagedPushNotifications()
```

**Create SinchManagedPush early in the app lifecycle** (typically in `AppDelegate.application(_:didFinishLaunchingWithOptions:)`):

```swift
class AppDelegate: UIResponder, UIApplicationDelegate {

  private var sinchPush: SinchManagedPush?

  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions:
                     [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    sinchPush = SinchRTC.managedPush(forAPSEnvironment: .development)
    sinchPush?.delegate = self
    sinchPush?.setDesiredPushType(SinchManagedPush.TypeVoIP)
    return true
  }
}
```

The APS environment you pass (`.development` or `.production`) must match your app's provisioning profile. A Debug build signed with a Development profile uses `.development`; a Release build signed with a Distribution profile uses `.production`.

**Upload your APNs Signing Key:**
1. Create an APNs Key in your [Apple Developer Account](https://developer.apple.com/).
2. Upload the `.p8` key file to your [Sinch Developer Account](https://dashboard.sinch.com/voice/apps).

`SinchManagedPush` is lightweight and can live independently of a `SinchClient`. It acquires the push device token via PushKit and automatically registers it with any `SinchClient` created later.

Note:
For use cases requiring only outgoing App-to-Phone, App-to-SIP, or Conference calls, calling `sinchClient.enableManagedPushNotifications()` is not required. You can place these calls directly once the Sinch client is started.

### CallKit integration

Apple requires that every incoming VoIP push notification is reported to CallKit (or LiveCommunicationKit on iOS 17.4+) before your push delegate returns. Failing to do so will cause iOS to terminate your app, and repeated failures may stop VoIP push delivery entirely.

**Handling incoming pushes with CallKit:**

```swift
func managedPush(_ managedPush: SinchRTC.SinchManagedPush,
                 didReceiveIncomingPushWithPayload payload: [AnyHashable: Any],
                 for type: String) {
  let notification = queryPushNotificationPayload(payload)

  guard notification.isCall, notification.isValid else { return }

  let callNotification = notification.callResult

  let uuid = // Get or create a UUID mapped to callNotification.callId

  let update = CXCallUpdate()
  update.remoteHandle = CXHandle(type: .generic, value: callNotification.remoteUserId)

  self.provider.reportNewIncomingCall(with: uuid, update: update) { error in
    // Handle error and hangup call if needed
  }
}
```

If you do not relay the payload to a `SinchClient`, call `SinchManagedPush.didCompleteProcessingPushPayload(_:)` so PushKit's completion handler is invoked.

**Reporting outgoing calls to CallKit:**
While not strictly required by Apple for outgoing calls, reporting them to CallKit is necessary for audio to work when the caller app is in the background or the device is locked.

```swift
func call(userId: String, uuid: UUID, with completion: @escaping (Error?) -> Void) {
  let handle = CXHandle(type: .generic, value: userId)
  let startCallAction = CXStartCallAction(call: uuid, handle: handle)
  let transaction = CXTransaction(action: startCallAction)
  self.callController.request(transaction, completion: completion)
}
```

Implement `CXProviderDelegate` to start the Sinch call when CallKit requests it:

```swift
func provider(_ provider: CXProvider, perform action: CXStartCallAction) {
  let recipientIdentifier = action.handle.value
  let callResult = callClient.callUser(withId: recipientIdentifier)

  switch callResult {
  case .success(let call):
    call.delegate = self
    action.fulfill()
  case .failure(let error):
    action.fail()
  }
}
```

**Audio session with CallKit:**
When using CallKit, the system manages audio session activation. Forward these events to the SDK:

```swift
// In your CXProviderDelegate
func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
  sinchClient?.callClient.didActivate(audioSession: audioSession)
}

func provider(_ provider: CXProvider, didDeactivate audioSession: AVAudioSession) {
  sinchClient?.callClient.didDeactivate(audioSession: audioSession)
}
```

See the full reference app for a complete CallKit implementation: [Swift reference application on GitHub](https://github.com/sinch/rtc-reference-applications/tree/master/ios).

### LiveCommunicationKit (iOS 17.4+)

LiveCommunicationKit is an alternative to CallKit. The same rules apply: report every incoming VoIP push before your delegate returns.

```swift
func managedPush(_ managedPush: SinchRTC.SinchManagedPush,
                 didReceiveIncomingPushWithPayload payload: [AnyHashable: Any],
                 for type: String) {
  let notification = queryPushNotificationPayload(payload)

  guard notification.isCall, notification.isValid else { return }

  let callNotification = notification.callResult
  let uuid = // Get or create a UUID mapped to callNotification.callId

  let localHandle = Handle(type: .generic, value: "localUserId")
  let remoteHandle = Handle(type: .generic, value: callNotification.remoteUserId)

  let update = Conversation.Update(localMember: localHandle,
                                   activeRemoteMembers: [remoteHandle],
                                   capabilities: nil)

  Task {
    do {
      try await self.conversationManager.reportNewIncomingConversation(uuid: uuid, update: update)
    } catch {
      // Handle error and hangup call if needed
    }
  }
}
```

## Voice calling
The Sinch SDK supports four types of calls: *app-to-app (audio or video)*, *app-to-phone*, *app-to-sip*, and *conference* calls. The `SinchCallClient` is the entry point for calling functionality.
Calls are placed through `SinchCallClient` and events are received via `SinchCallClientDelegate`. The call client is owned by `SinchClient` and accessed using `sinchClient.callClient`.

### Set up an *App-to-App* call
```swift
guard let callClient = sinchClient?.callClient else { return }

let callResult = callClient.callUser(withId: "<remote user id>")

switch callResult {
case .success(let call):
  call.delegate = self
case .failure(let error):
  // Handle error
}
```

The returned call object includes participant details, start time, state, and possible errors.

Assuming the callee's device is available, `callDidProgress(_:)` is invoked. If you play a progress tone, start it here.
When the callee's phone is ringing, `callDidRing(_:)` fires.
When the callee answers, `callDidAnswer(_:)` fires. Stop any progress tone.
When full audio connectivity is established, `callDidEstablish(_:)` is called. Users can now talk.

Typically, connectivity is already established when the call is answered, so `callDidEstablish` may follow immediately after `callDidAnswer`. On poor networks, it can take longer; consider showing a "connecting" indicator.

**Important:**
For *App-to-App* calls, you must enable managed push by calling `sinchClient.enableManagedPushNotifications()`, even if you are the caller. See the full setup in [Push notifications](https://developers.sinch.com/docs/in-app-calling/ios/push-notifications).

### Set up an *App-to-Phone* call

An *app-to-phone* call is a call made to a phone on the regular telephone network. Use `callPhoneNumber(_:)` with an E.164-formatted number prefixed with `+`.

```swift
guard let callClient = sinchClient?.callClient else { return }

let callResult = callClient.callPhoneNumber("+14155550101")

switch callResult {
case .success(let call):
  call.delegate = self
case .failure(let error):
  // Handle error
}
```

#### Presenting a number to the destination you are calling

Mandatory step!
You must provide a CLI (Calling Line Identifier) or your call will fail.
You need a number from Sinch so you can provide a valid CLI to the handset you are calling.
Specify your CLI when creating the SinchClient:

```swift
do {
  self.sinchClient = try SinchRTC.client(withApplicationKey: "<application key>",
                                         environmentHost: "ocra.api.sinch.com",
                                         userId: "<user id>",
                                         cli: "<Your Purchased Sinch Number>")
} catch {
  // Handle error
}
```

Note: When your account is in trial mode, you can only call your [verified numbers](https://dashboard.sinch.com/numbers/verified-numbers). If you want to call any number, you need to upgrade your account!

### Set up an *App-to-SIP* call

An *app-to-sip* call is made to a SIP server. Use `callSIP(_:)` or `callSIP(_:headers:)`. The SIP identity should be in the form `user@server`. When passing custom headers, prefix them with `x-`.

```swift
guard let callClient = sinchClient?.callClient else { return }

let callResult = callClient.callSIP("<SIP identity>")

switch callResult {
case .success(let call):
  call.delegate = self
case .failure(let error):
  // Handle error
}
```

### Set up a *Conference* call
A conference call connects a user to a room where multiple users can participate. The identifier may not be longer than 64 characters.

```swift
guard let callClient = sinchClient?.callClient else { return }

let callResult = callClient.callConference(withId: "<conference id>")

switch callResult {
case .success(let call):
  call.delegate = self
case .failure(let error):
  // Handle error
}
```

### Handle incoming calls

Add a `SinchCallClientDelegate` to `SinchCallClient` to act on incoming calls. When a call arrives, `client(_:didReceiveIncomingCall:)` is executed.

**With CallKit/LiveCommunicationKit** (typical production setup):
Use `client(_:didReceiveIncomingCall:)` primarily to associate the `SinchCall` with the system call. Keep a mapping between system UUIDs and `callId`.

```swift
extension SinchClientMediator: SinchCallClientDelegate {
  func client(_ client: SinchRTC.SinchCallClient,
              didReceiveIncomingCall call: SinchRTC.SinchCall) {
    call.delegate = self
    // Store/match call.callId with your CallKit UUID mapping
  }
}
```

**Without CallKit** (e.g. testing or custom UI):
```swift
extension SinchClientMediator: SinchCallClientDelegate {
  func client(_ client: SinchRTC.SinchCallClient,
              didReceiveIncomingCall call: SinchRTC.SinchCall) {
    call.delegate = self
    // Present UI for call
  }
}
```

#### Receiving Calls from PSTN or SIP (Phone-to-App / SIP-to-App)

The Sinch SDK supports receiving incoming calls that originate from the PSTN (regular phone network) or from SIP endpoints.
When a call arrives at a Sinch voice number or via SIP origination, the Sinch platform triggers an **Incoming Call Event (ICE)** callback to your backend.
The platform can then route this call to an in-app user by responding with the `connectMxp` SVAML action.

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

#### Answer incoming call

To answer the call, use `call.answer()`:

```swift
call.answer()
```

#### Decline incoming call

If the call shouldn't be answered, use `call.hangup()` to decline. The caller is notified that the incoming call was denied.

```swift
call.hangup()
```

### Disconnecting a call
When the user wants to disconnect an ongoing call, use `call.hangup()`. Either party can disconnect.

```swift
call.hangup()
```

When either party disconnects, `callDidEnd(_:)` is called on the delegate:

```swift
func callDidEnd(_ call: SinchCall) {
  // Update UI, e.g., dismiss the call screen
}
```

A call can be disconnected before it has been completely established.

## Video Calling

Video calls follow the same flow as audio calls. Use `callClient.callUserVideo(withId:)` to start a video call. You receive the same callbacks: `callDidProgress`, `callDidAnswer`, `callDidEstablish`.

### Showing the video streams

Assuming a view controller with two `UIView` outlets for remote and local video:

**Local video preview:**
```swift
override func viewDidLoad() {
  super.viewDidLoad()

  guard let videoController = sinchClient?.videoController else { return }
  localVideoView.addSubview(videoController.localView)
}
```

**Remote video stream** (attach when the remote track arrives):
```swift
func callDidAddVideoTrack(_ call: SinchCall) {
  guard let videoController = sinchClient?.videoController else { return }
  remoteVideoView.addSubview(videoController.remoteView)
}
```

#### Pausing and resuming a video stream

Use `call.pauseVideo()` to temporarily stop sending local video and `call.resumeVideo()` to resume. Audio continues unless you mute it separately.

```swift
call.pauseVideo()
call.resumeVideo()
```

The call delegate is notified via `callDidPauseVideoTrack(_:)` and `callDidResumeVideoTrack(_:)`.

### Switching camera (front/back)
```swift
guard let videoController = sinchClient?.videoController else { return }
videoController.captureDevicePosition.toggle()
```

### Video content fitting
Control how rendered video fits a view via `UIView.contentMode`. Only `.scaleAspectFit` and `.scaleAspectFill` are respected.

```swift
videoController.remoteView.contentMode = .scaleAspectFill
```

### Full screen mode
The SDK provides `UIView` extension methods for fullscreen transitions:

```swift
if view.sinIsFullscreen() {
  view.contentMode = .scaleAspectFit
  view.sinDisableFullscreen(true)
} else {
  view.contentMode = .scaleAspectFill
  view.sinEnableFullscreen(true)
}
```

### Incoming video call
An incoming video call triggers `client(_:didReceiveIncomingCall:)` like a voice call. Check `call.details.isVideoOffered` to determine if video is included.

## Miscellaneous

### Minimum requirements
iOS **12.0** minimum deployment target.

### User ID restrictions
User IDs must not be longer than 255 bytes and must only contain URL-safe characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjiklmnopqrstuvwxyz0123456789-_=`. Consider base64url-encoding IDs that contain other characters.

### Call details
The `SinchCallDetails` class holds metadata about a call including timestamps (`startedTime`, `progressedTime`, `rungTime`, `answeredTime`, `establishedTime`, `endedTime`), end cause (`.timeout`, `.denied`, `.noAnswer`, `.error`, `.hungUp`, `.canceled`, `.otherDeviceAnswered`, etc.), and error information.

```swift
func callDidEnd(_ call: SinchCall) {
  if call.details.endCause == .error {
    if let error = call.details.error {
      print("Call failed: \(error.localizedDescription)")
    }
  }
}
```

### Audio session
During calls, the SDK manages `AVAudioSession`. It sets the category to `.playAndRecord` with mode `.voiceChat` at the start of a call and restores original settings when the call ends.

If using CallKit/LiveCommunicationKit, forward audio session activation events to the SDK (see CallKit integration section above).

To override audio session category options:
```swift
sinchClient?.audioController.setAudioSessionCategoryOptions([.allowBluetooth, .allowBluetoothA2DP, .defaultToSpeaker])
```