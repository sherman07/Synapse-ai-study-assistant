import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const apiConfigPath = path.join(repoRoot, "frontend/src/legacy/apiConfig.js");
const dataApiConfigPath = path.join(repoRoot, "frontend/src/legacy/dataApiConfig.js");

async function loadApiBase({ protocol = "http:", hostname = "127.0.0.1", port = "5175", configured = "", backendPort = "" }) {
  const host = hostname.startsWith("[") ? `${hostname}:${port}` : `${hostname}:${port}`;
  globalThis.window = {
    SYNAPSE_API_BASE: configured,
    SYNAPSE_BACKEND_PORT: backendPort,
    location: { protocol, hostname, port, host }
  };
  globalThis.document = { body: { dataset: {} } };
  const url = `${pathToFileURL(apiConfigPath).href}?case=${encodeURIComponent(`${protocol}:${hostname}:${port}:${configured}:${backendPort}:${Date.now()}`)}`;
  return (await import(url)).API_BASE;
}

async function loadDataApiBaseWithoutBrowserGlobals() {
  delete globalThis.window;
  delete globalThis.document;
  const url = `${pathToFileURL(dataApiConfigPath).href}?case=node-safe-${Date.now()}`;
  return (await import(url)).DATA_API_BASE;
}

assert.equal(
  await loadDataApiBaseWithoutBrowserGlobals(),
  "http://127.0.0.1:3001",
  "data API config should be safe to import from Node regression tests"
);

assert.equal(
  await loadApiBase({ hostname: "[::1]", port: "5175" }),
  "http://127.0.0.1:8001",
  "bracketed IPv6 localhost should use the backend port"
);

assert.equal(
  await loadApiBase({ hostname: "::1", port: "5175" }),
  "http://127.0.0.1:8001",
  "plain IPv6 localhost should use the backend port"
);

assert.equal(
  await loadApiBase({ hostname: "127.0.0.1", port: "5175", backendPort: "9000" }),
  "http://127.0.0.1:9000",
  "custom backend ports should still be respected"
);

assert.equal(
  await loadApiBase({ hostname: "study.example.com", port: "", configured: "https://api.example.com/" }),
  "https://api.example.com",
  "explicit API base should win"
);

const authClientSource = fs.readFileSync(path.join(repoRoot, "frontend/auth-client.js"), "utf8");
assert.ok(authClientSource.includes("function isLocalDevHost"));
assert.ok(authClientSource.includes("\"[::1]\""));
assert.ok(authClientSource.includes("isLocalDevHost(hostname) && port !== backendPort"));

const landingAuthSource = fs.readFileSync(path.join(repoRoot, "frontend/landing-auth.js"), "utf8");
assert.ok(landingAuthSource.includes("function isLocalDevHost"));
assert.ok(landingAuthSource.includes("\"[::1]\""));
assert.ok(landingAuthSource.includes("isLocalDevHost(hostname)"));

console.log("api base localhost regression passed");
