/**
 * Shared Sinch API client utilities.
 *
 * Provides OAuth2 authentication and environment variable helpers
 * used by all send_*.cjs and list_messages.cjs scripts.
 */

var https = require("https");
var querystring = require("querystring");

var AUTH_URL = "https://auth.sinch.com/oauth2/token";
var API_BASE = "https://{region}.conversation.api.sinch.com";

function getEnv(name, defaultValue) {
  var value = process.env[name] || defaultValue;
  if (value === undefined || value === null) {
    process.stderr.write("Error: " + name + " environment variable is required\n");
    process.exit(1);
  }
  return value;
}

function getAccessToken(keyId, keySecret) {
  return new Promise(function (resolve, reject) {
    var credentials = Buffer.from(keyId + ":" + keySecret).toString("base64");
    var postData = querystring.stringify({ grant_type: "client_credentials" });

    var url = new URL(AUTH_URL);
    var options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        Authorization: "Basic " + credentials,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    var req = https.request(options, function (res) {
      var body = "";
      res.on("data", function (chunk) {
        body += chunk;
      });
      res.on("end", function () {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body).access_token);
        } else {
          reject(new Error("Auth failed (" + res.statusCode + "): " + body));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

function apiUrl(region, projectId, path) {
  var base = API_BASE.replace("{region}", region);
  return base + "/v1/projects/" + projectId + "/" + path;
}

function httpRequest(url, options, body) {
  return new Promise(function (resolve, reject) {
    var parsed = new URL(url);
    var reqOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    if (body) {
      reqOptions.headers["Content-Length"] = Buffer.byteLength(body);
    }

    var req = https.request(reqOptions, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end", function () {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error("API error (" + res.statusCode + "): " + data));
        }
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

module.exports = {
  getEnv: getEnv,
  getAccessToken: getAccessToken,
  apiUrl: apiUrl,
  httpRequest: httpRequest,
};
