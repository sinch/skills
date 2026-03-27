/**
 * Shared Sinch Voice API client utilities.
 *
 * Provides Basic Auth and environment variable helpers
 * used by all voice scripts. The Voice API uses Application Key + Secret.
 */

var https = require("https");

var DEFAULT_BASE = "https://calling.api.sinch.com";
var CONFIG_BASE = "https://callingapi.sinch.com";

var REGIONAL_BASES = {
  global: "https://calling.api.sinch.com",
  "north-america": "https://calling-use1.api.sinch.com",
  europe: "https://calling-euc1.api.sinch.com",
  "southeast-asia-1": "https://calling-apse1.api.sinch.com",
  "southeast-asia-2": "https://calling-apse2.api.sinch.com",
  "south-america": "https://calling-sae1.api.sinch.com",
};

function getEnv(name, defaultValue) {
  var value = process.env[name] || defaultValue;
  if (value === undefined || value === null) {
    process.stderr.write("Error: " + name + " environment variable is required\n");
    process.exit(1);
  }
  return value;
}

function getAuthHeader(appKey, appSecret) {
  return "Basic " + Buffer.from(appKey + ":" + appSecret).toString("base64");
}

function getBaseUrl(region) {
  if (!region || region === "global") return DEFAULT_BASE;
  var base = REGIONAL_BASES[region.toLowerCase()];
  if (!base) {
    process.stderr.write(
      "Error: Unknown region '" + region + "'. Valid: " + Object.keys(REGIONAL_BASES).join(", ") + "\n"
    );
    process.exit(1);
  }
  return base;
}

function httpRequest(urlStr, options, body) {
  return new Promise(function (resolve, reject) {
    var url = new URL(urlStr);
    var opts = Object.assign({}, options, {
      hostname: url.hostname,
      path: url.pathname + url.search,
      port: url.port || 443,
    });

    if (body) {
      opts.headers = opts.headers || {};
      opts.headers["Content-Length"] = Buffer.byteLength(body);
    }

    var req = https.request(opts, function (res) {
      var data = "";
      res.on("data", function (chunk) { data += chunk; });
      res.on("end", function () {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (_e) {
            resolve(data);
          }
        } else {
          reject(new Error("HTTP " + res.statusCode + ": " + data));
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

module.exports = {
  getEnv: getEnv,
  getAuthHeader: getAuthHeader,
  getBaseUrl: getBaseUrl,
  httpRequest: httpRequest,
  CONFIG_BASE: CONFIG_BASE,
};
