# SDK Initialization — In-App Calling (iOS)

In-App Calling uses the **Sinch RTC SDK** (Swift) — a separate client-side SDK from `@sinch/sdk-core`. Authentication is handled via JWT tokens generated on your backend using Application Key + Application Secret credentials.

Based on the [official getting-started guide](https://developers.sinch.com/docs/in-app-calling/getting-started/ios/create-app).

## Prerequisites

- Xcode
- In-App Calling [SDK for iOS](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/)
- APNs signing key from your [Apple Developer Account](https://developer.apple.com/) uploaded to your [Sinch Developer Account](https://dashboard.sinch.com/voice/apps)

## Add the SDK

Download the Sinch Swift SDK from the [SDK download page](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/) and add `SinchRTC.xcframework` to your Xcode project. Set it to **Embed & Sign** — otherwise you'll get `dylib` loading failures.

In your project's Target → Signing & Capabilities:
- Enable **Voice over IP** under Background Modes (required for CallKit / LiveCommunicationKit)
- Add the **Push Notifications** capability

## Configuration

Create a `Config.swift` file:

```swift
let APPLICATION_KEY = "YOUR_APPLICATION_KEY"

// Never commit APPLICATION_SECRET in client code — serious security risk.
// In production, JWT generation must be delegated to your backend.
let APPLICATION_SECRET = "YOUR_APPLICATION_SECRET"

let ENVIRONMENT_HOST = "ocra.api.sinch.com"
```

## Initialize via SinchClientMediator

Create a `SinchClientMediator` class as a wrapper around `SinchClient`:

```swift
import SinchRTC
import OSLog

typealias ClientStartedCallback = (_ error: Error?) -> Void

class SinchClientMediator {

  var clientStartedCallback: ClientStartedCallback!

  private(set) var sinchClient: SinchClient?

  func createAndStartClient(with userId: String, and callback: @escaping (_ error: Error?) -> Void) {
    do {
      sinchClient = try SinchRTC.client(withApplicationKey: APPLICATION_KEY,
                                        environmentHost: ENVIRONMENT_HOST,
                                        userId: userId)
    } catch let error as NSError {
      callback(error)
      return
    }

    clientStartedCallback = callback

    guard let sinchClient = sinchClient else { return }

    sinchClient.delegate = self
    sinchClient.start()
  }
}
```

## Provide Credentials (SinchClientDelegate)

Implement `SinchClientDelegate` for credential provisioning and client status monitoring:

```swift
extension SinchClientMediator: SinchClientDelegate {

  func clientRequiresRegistrationCredentials(_ client: SinchRTC.SinchClient,
                                             withCallback callback: SinchRTC.SinchClientRegistration) {
    do {
      // WARNING: test implementation — in production, generate JWT on your backend
      let jwt = try SinchJWT.sinchJWTForUserRegistration(withApplicationKey: APPLICATION_KEY,
                                                         applicationSecret: APPLICATION_SECRET,
                                                         userId: client.userId)
      callback.register(withJWT: jwt)
    } catch {
      callback.registerDidFail(error: error)
    }
  }

  func clientDidStart(_ client: SinchClient) {
    guard clientStartedCallback != nil else { return }
    clientStartedCallback(nil)
    clientStartedCallback = nil
  }

  func clientDidFail(_ client: SinchClient, error: Error) {
    guard clientStartedCallback != nil else { return }
    clientStartedCallback(error)
    clientStartedCallback = nil
  }
}
```

> **Note:** The `SinchJWT` helper for test JWT generation is available in the [Swift reference application](https://github.com/sinch/rtc-reference-applications/tree/master/ios) and bundled with the SDK. In production, **always** generate JWTs on your backend.

## Push Notifications (APNs)

Upload your APNs signing key to your Sinch application configuration. See [configuring APNs](https://developers.sinch.com/docs/in-app-calling/ios/push-notifications/#configuring-an-apns-authentication-signing-key) for details. Expired certificates cause silent failures.

## Enable Logging (Optional)

```swift
import OSLog
import SinchRTC

SinchRTC.setLogCallback { (severity: SinchRTC.LogSeverity,
                               area: String,
                                msg: String,
                                  _: Date) in
  os_log("%{public}@", log: .sinchOSLog(for: area), type: severity.osLogType, msg)
}
```

## Key Points

- `environmentHost` is the REST API endpoint the SDK targets (`ocra.api.sinch.com` for production)
- `userId` is the user identifier registered within your application
- `SinchClient` is a **singleton per user session** — create one instance and retain it for the entire app lifetime
- The `clientRequiresRegistrationCredentials` callback fires on start and when the registration TTL nears expiry
- **Never embed the Application Secret in client-side code** — generate JWTs on your backend
- The Objective-C SDK is also available

## Links

- [In-App Calling Overview](https://developers.sinch.com/docs/in-app-calling/overview.md)
- [iOS Getting Started: Create App](https://developers.sinch.com/docs/in-app-calling/getting-started/ios/create-app)
- [iOS First Time Setup](https://developers.sinch.com/docs/in-app-calling/ios/first-time-setup/)
- [iOS Push Notifications](https://developers.sinch.com/docs/in-app-calling/ios/push-notifications/)
- [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/)
- [Reference Applications (GitHub)](https://github.com/sinch/rtc-reference-applications/tree/master/ios)
