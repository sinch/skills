/*
 * EXECUTION-TOOL HELPER — not a schema reference.
 * Shared by the sibling runnable scripts; keep it alongside them. Do NOT copy
 * its payload literals or logic into a new codebase as if they were the API
 * spec — for payload shape, load the canonical developers.sinch.com docs
 * linked from ../../SKILL.md instead.
 */
/**
 * Shared Sinch API client utilities.
 *
 * Provides OAuth2 authentication and environment variable helpers
 * used by all send_*.cjs and list_messages.cjs scripts.
 */

const AUTH_URL = "https://auth.sinch.com/oauth2/token";
const API_BASE = "https://{region}.conversation.api.sinch.com";

function getEnv(name, defaultValue) {
  const value = process.env[name] || defaultValue;
  if (value === undefined || value === null) {
    process.stderr.write(`Error: ${name} environment variable is required\n`);
    process.exit(1);
  }
  return value;
}

async function getAccessToken(keyId, keySecret) {
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Auth failed (${res.status}): ${body}`);
  }
  return JSON.parse(body).access_token;
}

function apiUrl(region, projectId, path) {
  const base = API_BASE.replace("{region}", region);
  return `${base}/v1/projects/${projectId}/${path}`;
}

async function httpRequest(url, options, body) {
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: options.headers || {},
    body: body,
  });

  const data = await res.text();
  if (!res.ok) {
    throw new Error(`API error (${res.status}): ${data}`);
  }

  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

module.exports = {
  getEnv,
  getAccessToken,
  apiUrl,
  httpRequest,
};
