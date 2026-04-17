# SDK Installation — In-App Calling (Browser / JavaScript)

In-App Calling uses the **Sinch RTC SDK** — a separate client-side SDK from `@sinch/sdk-core`. Authentication is handled via JWT tokens generated on your backend using Application Key + Application Secret credentials.

## Add the SDK

Add the SDK via CDN script tag in your HTML `<head>`:

```html
<!-- Trusted first-party CDN: cdn.sinch.com is owned by Sinch -->
<script src="https://cdn.sinch.com/latest/sinch-rtc-min.js"></script>
```

## Service Worker for Push Notifications

Add a service worker file (`sw.js`) for handling push notifications:

```javascript
this.addEventListener("push", (event) => {
  console.log("ServiceWorker Push: ", event);
  const body = event.data.json();
  event.waitUntil(
    clients
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

## Initialize the SinchClient

Use the wrapper class pattern from the [official getting-started guide](https://developers.sinch.com/docs/in-app-calling/getting-started/javascript/create-app):

```javascript
const APP_KEY = "YOUR_APPLICATION_KEY";
const ENVIRONMENT_HOST = "ocra.api.sinch.com";

class SinchClientWrapper {
  constructor(userId, ui) {
    this.userId = userId;
    this.ui = ui;

    const sinchClient = Sinch.getSinchClientBuilder()
      .applicationKey(APP_KEY)
      .userId(userId)
      .environmentHost(ENVIRONMENT_HOST)
      .build();

    sinchClient.addListener(this.#sinchClientListener());
    sinchClient.setSupportManagedPush();
    sinchClient.start();

    this.sinchClient = sinchClient;
  }

  #sinchClientListener() {
    return {
      onCredentialsRequired: (sinchClient, clientRegistration) => {
        // In production: fetch JWT from your backend server
        fetch('/api/sinch-token?userId=' + this.userId)
          .then((res) => res.json())
          .then((data) => clientRegistration.register(data.token))
          .catch((error) => {
            clientRegistration.registerFailed();
            console.error(error);
          });
      },

      onClientStarted: (sinchClient) => {
        console.log("Sinch - Start client succeeded");
      },

      onClientFailed: (sinchClient, error) => {
        console.log("Sinch - Start client failed");
        console.error(error);
      },
    };
  }
}
```

> **Note:** `setSupportManagedPush()` should almost always be enabled in production — without it, incoming calls cannot be received while the app is unfocused.

## Key Points

- `environmentHost` is the REST API endpoint the SDK targets (`ocra.api.sinch.com` for production)
- `userId` is the user identifier registered within your application
- `SinchClient` is a **singleton per user session** — create one instance and retain it for the entire app lifetime
- The `onCredentialsRequired` callback fires on start and when the registration TTL nears expiry
- An implementation of a local `JWT` helper class is available in the [reference app](https://github.com/sinch/rtc-reference-applications/blob/master/javascript/samples/common/jwt.js)
- **Never embed the Application Secret in client-side code** — generate JWTs on your backend
- WebRTC requires HTTPS — ensure your site is served over a secure context
- Supported browsers: Chrome, Firefox, Safari, Edge
- For more complex examples, see the [reference app](https://github.com/sinch/rtc-reference-applications/tree/master/javascript) or the [SDK documentation](https://developers.sinch.com/docs/in-app-calling/js-cloud/)

## Links

- [In-App Calling Overview](https://developers.sinch.com/docs/in-app-calling/overview.md)
- [JavaScript Getting Started: Create App](https://developers.sinch.com/docs/in-app-calling/getting-started/javascript/create-app)
- [JavaScript Getting Started: Make a Call](https://developers.sinch.com/docs/in-app-calling/getting-started/javascript/make-call)
- [JavaScript SDK Documentation](https://developers.sinch.com/docs/in-app-calling/js-cloud/)
- [Authentication & Authorization (JS)](https://developers.sinch.com/docs/in-app-calling/js/application-authentication/)
- [SDK Downloads](https://developers.sinch.com/docs/in-app-calling/sdk-downloads/)
- [Reference Applications (GitHub)](https://github.com/sinch/rtc-reference-applications)

## Backend: JWT Token Generation (Node.js)

Your backend generates JWT tokens using the Application Secret. **Never expose the secret to client code.**

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

  return jwt.sign(
    {
      iss: applicationKey,
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 600, // 10 min expiry
      nonce: crypto.randomBytes(16).toString('hex'),
    },
    signingKey,
    { algorithm: 'HS256' }
  );
}
```
