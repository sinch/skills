import CommonCrypto
import Foundation

/**
 * Helper class showing how to create a signed JWT (JSON Web Token)
 * for User registration (@see SinchClientRegistration).
 *
 * IMPORTANT: This implementation here in the sample app is only here
 * to quickly get you started with the samples apps and this
 * implementation is NOT meant to be used in production. When
 * deploying your application to production, the Application Secret
 * should be kept secure on your backend and not be embedded in the
 * your apps.
 */
enum JWTError: Error {

  case base64CreateFailed
  case stringFromBase64Failed
}

enum SinchJWT {

  static func sinchJWTForUserRegistration(withApplicationKey key: String,
                                          applicationSecret secret: String,
                                          userId: String) throws -> String {
    let now = Date()

    return try sinchJWTForUserRegistration(withApplicationKey: key,
                                           applicationSecret: secret,
                                           userId: userId,
                                           nonce: UUID().uuidString,
                                           issuedAt: now,
                                           expireAt: now.addingTimeInterval(600))
  }

  static func sinchJWTForUserRegistration(withApplicationKey key: String,
                                          applicationSecret secret: String,
                                          userId: String,
                                          nonce: String,
                                          issuedAt: Date,
                                          expireAt: Date) throws -> String {
    return try jwtWith(withApplicationKey: key,
                       applicationSecret: secret,
                       userId: userId,
                       nonce: nonce,
                       issuedAt: issuedAt,
                       expireAt: expireAt,
                       instanceExpireAt: nil)
  }

  static func sinchJWTForUserRegistration(withApplicationKey key: String,
                                          applicationSecret secret: String,
                                          userId: String,
                                          nonce: String,
                                          issuedAt: Date,
                                          expireAt: Date,
                                          instanceExpireAt: Date) throws -> String {
    return try jwtWith(withApplicationKey: key,
                       applicationSecret: secret,
                       userId: userId,
                       nonce: nonce,
                       issuedAt: issuedAt,
                       expireAt: expireAt,
                       instanceExpireAt: instanceExpireAt)
  }

  private static func jwtWith(withApplicationKey key: String,
                              applicationSecret secret: String,
                              userId: String,
                              nonce: String,
                              issuedAt: Date,
                              expireAt: Date,
                              instanceExpireAt: Date?) throws -> String {
    let header = ["alg": "HS256",
                  "typ": "JWT",
                  "kid": "hkdfv1-" + JWTFormatDate(issuedAt)]

    var payload: [String: Any] = ["iss": "//rtc.sinch.com/applications/" + key,
                                  "sub": "//rtc.sinch.com/applications/" + key + "/users/" + userId,
                                  "iat": NSNumber(value: Int(issuedAt.timeIntervalSince1970)),
                                  "exp": NSNumber(value: Int(expireAt.timeIntervalSince1970)),
                                  "nonce": nonce]

    if let expTime = instanceExpireAt {
      payload["sinch:rtc:instance:exp"] = NSNumber(value: Int(expTime.timeIntervalSince1970))
    }

    let signingKey = try JWTDeriveSigningKey(secret, issuedAt)
    return try makeJWT(withHeaders: header, payload: payload, signingKey: signingKey)
  }

  // MARK: - Implementation

  private static func JWTFormatDate(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyyMMdd"
    formatter.timeZone = TimeZone(secondsFromGMT: 0)
    return formatter.string(from: date)
  }

  private static func JWTDeriveSigningKey(_ secret: String, _ issuedAt: Date) throws -> Data {
    let data = Data(base64Encoded: secret)

    guard data != nil else {
      throw JWTError.base64CreateFailed
    }

    return makeHMAC_SHA256(data!, JWTFormatDate(issuedAt))
  }

  private static func makeJWT(withHeaders headers: [String: Any],
                              payload: [String: Any],
                              signingKey key: Data) throws -> String {
    let arr = [try JWTBase64Encode(data: JSONSerialize(of: headers)),
               try JWTBase64Encode(data: JSONSerialize(of: payload))]
    let headerDotPayload = arr.joined(separator: ".")
    let signature = try JWTBase64Encode(data: makeHMAC_SHA256(key, headerDotPayload))

    return [headerDotPayload, signature].joined(separator: ".")
  }

  private static func JWTBase64Encode(data: Data) throws -> String {
    // JWT RFC mandates URL-safe base64-encoding without padding.
    let base64 = String(data: data.base64EncodedData(), encoding: .utf8)
    guard base64 != nil else {
      throw JWTError.stringFromBase64Failed
    }
    return base64!.replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }

  private static func JSONSerialize(of payload: [String: Any]) throws -> Data {
    let json = try JSONSerialization.data(withJSONObject: payload, options: JSONSerialization.WritingOptions(rawValue: 0))
    let jsonStr = String(data: json, encoding: .utf8)
    return (jsonStr?.replacingOccurrences(of: "\\/", with: "/").data(using: .utf8))!
  }

  private static func makeHMAC_SHA256(_ key: Data, _ message: String) -> Data {
    return makeInternalHMAC_SHA256(key, message.data(using: .utf8)!)
  }

  private static func makeInternalHMAC_SHA256(_ key: Data, _ message: Data) -> Data {
    let out = UnsafeMutablePointer<UInt8>.allocate(capacity: Int(CC_SHA256_DIGEST_LENGTH))
    defer { out.deallocate() }

    key.withUnsafeBytes { (rbpKey: UnsafeRawBufferPointer) in
      message.withUnsafeBytes { (rpbMsg: UnsafeRawBufferPointer) in
        CCHmac(CCHmacAlgorithm(kCCHmacAlgSHA256), rbpKey.baseAddress, rbpKey.count, rpbMsg.baseAddress, rpbMsg.count, out)
      }
    }

    return Data(bytes: out, count: Int(CC_SHA256_DIGEST_LENGTH))
  }
}
