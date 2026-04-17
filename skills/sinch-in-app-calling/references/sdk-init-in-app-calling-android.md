# SDK Installation — In-App Calling (Android)

In-App Calling uses the **Sinch RTC SDK** — a separate client-side SDK from `@sinch/sdk-core`. Authentication is handled via JWT tokens generated on your backend using Application Key + Application Secret credentials.

Based on the [official getting-started guide](https://developers.sinch.com/docs/in-app-calling/getting-started/android/create-app).

## Prerequisites

- Android Studio and Android SDK tools
- In-App Calling [SDK for Android](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/)
- Two physical Android devices (or one device and one emulator)

## Add the SDK

Download the SDK from the [SDK download page](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/), extract the AAR from the `libs` folder, and copy it to your `app/libs` directory.

```groovy
repositories {
    flatDir {
        dirs 'libs'
    }
}

dependencies {
    implementation(name:'sinch-android-rtc', version:'+', ext:'aar')
}
```

Alternatively, the SDK is available on [Maven Central](https://developers.sinch.com/docs/in-app-calling/sdk-downloads#android-sdk-on-maven-central).

Required permissions in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
```

## Initialize the SinchClient (Service Pattern)

The SDK recommends placing `SinchClient` inside a [Service](https://developer.android.com/guide/components/services) component rather than an Activity or Fragment:

```kotlin
class SinchService : Service() {

    companion object {
        private const val APP_KEY = "YOUR_APPLICATION_KEY"
        private const val APP_SECRET = "YOUR_APPLICATION_SECRET"
        private const val ENVIRONMENT = "ocra.api.sinch.com"
    }

    private var sinchClient: SinchClient? = null

    private fun createClient(username: String) {
        sinchClient = SinchClient.builder().context(applicationContext)
            .userId(username)
            .applicationKey(APP_KEY)
            .environmentHost(ENVIRONMENT)
            .pushConfiguration(
                PushConfiguration.fcmPushConfigurationBuilder()
                    .senderID(APP_FCM_SENDER_ID)
                    .registrationToken(getFcmRegistrationToken(this).orEmpty()).build()
            )
            .pushNotificationDisplayName("User $username")
            .build()
        sinchClient?.addSinchClientListener(MySinchClientListener())
        sinchClient?.callController?.addCallControllerListener(SinchCallControllerListener())
    }
    // ...
}
```

## Provide Credentials (SinchClientListener)

When the client starts, `onCredentialsRequired` is called. Provide a JWT token:

```kotlin
override fun onCredentialsRequired(clientRegistration: ClientRegistration) {
    // In production: fetch JWT from your backend server
    clientRegistration.register(create(APP_KEY, APP_SECRET, settings.username))
}

override fun onClientStarted(client: SinchClient) {
    listener?.onStarted()
}

override fun onClientFailed(client: SinchClient, error: SinchError) {
    listener?.onFailed(error)
}
```

> **Note:** The `JWT` helper class for test token generation is available in the SDK samples (`sinch-rtc-sample-push/src/com/sinch/android/rtc/sample/push/JWT.kt`). In production, **always** generate JWTs on your backend — never put your app secret in Android source code.

## Push Notifications (FCM)

FCM push configuration is passed to the builder via `pushConfiguration()`. Ensure your FCM sender ID and registration token are current.

## Service Binding

Use Android's [bound service pattern](https://developer.android.com/guide/components/bound-services) for communication between Activities and the SinchClient:

```kotlin
private fun bindService() {
    val serviceIntent = Intent(this, SinchService::class.java)
    applicationContext.bindService(serviceIntent, this, BIND_AUTO_CREATE)
}
```

## Key Points

- `environmentHost` is the REST API endpoint the SDK targets (`ocra.api.sinch.com` for production)
- `userId` is the user identifier registered within your application
- `SinchClient` is a **singleton per user session** — place it in a Service, not an Activity
- The `onCredentialsRequired` callback fires on start and when the registration TTL nears expiry
- Call `sinchClient.terminateGracefully()` on cleanup to avoid resource leaks
- **Never embed the Application Secret in client-side code** — generate JWTs on your backend
- Code snippets are from the `sinch-rtc-sample-push` sample in the SDK

## Links

- [In-App Calling Overview](https://developers.sinch.com/docs/in-app-calling/overview.md)
- [Android Getting Started: Create App](https://developers.sinch.com/docs/in-app-calling/getting-started/android/create-app)
- [Android Getting Started: Make a Call](https://developers.sinch.com/docs/in-app-calling/getting-started/android/make-call)
- [Authentication & Authorization (Android)](https://developers.sinch.com/docs/in-app-calling/android/application-authentication/)
- [Android SinchClient Docs](https://developers.sinch.com/docs/in-app-calling/android/sinch-client/)
- [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/)
- [Reference Applications (GitHub)](https://github.com/sinch/rtc-reference-applications)
