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

let analysisCalls = 0;
const renderWakeClient = new SynapseApiClient("https://synapse-ai-backend.example.com", {
  fetchImpl: () => {
    analysisCalls += 1;
    return Promise.resolve({
      ok: analysisCalls === 3,
      status: analysisCalls === 3 ? 200 : 503,
      headers: { get: () => "application/json" }
    });
  }
});

const analysisResponse = await renderWakeClient.fetchWithRetry(
  "/analyze",
  { method: "POST", body: "retryable test payload" },
  { attempts: 3, retryDelayMs: 0 }
);
assert.equal(analysisResponse.ok, true, "analysis should recover after Render wake-up 503 responses");
assert.equal(analysisCalls, 3, "analysis should retry transient Render wake-up responses");

console.log("api client production connection regression passed");
