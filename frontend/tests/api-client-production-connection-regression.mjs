import assert from "node:assert/strict";

globalThis.window = {
  fetch: () => Promise.reject(new Error("not used")),
  setTimeout,
  clearTimeout
};

const { ApiConnectionError, SynapseApiClient } = await import("../src/legacy/apiClient.js");

const hostedClient = new SynapseApiClient("https://synapse-ai-backend.example.com", {
  fetchImpl: () => Promise.reject(new TypeError("network unavailable"))
});

await assert.rejects(
  () => hostedClient.fetch("/analyze"),
  error => (
    error instanceof ApiConnectionError
    && /hosted service/i.test(error.message)
    && !/start the local stack/i.test(error.message)
  )
);

let healthCalls = 0;
const warmingClient = new SynapseApiClient("https://synapse-ai-backend.example.com", {
  fetchImpl: () => {
    healthCalls += 1;
    return Promise.resolve({ ok: healthCalls > 1, status: healthCalls > 1 ? 200 : 503 });
  }
});

const healthResponse = await warmingClient.warmup({ attempts: 2, retryDelayMs: 0, timeoutMs: 0 });
assert.equal(healthResponse.ok, true);
assert.equal(healthCalls, 2, "hosted health warmup should retry before a real analysis request");

console.log("api client production connection regression passed");
