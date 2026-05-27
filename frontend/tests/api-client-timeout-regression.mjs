import assert from "node:assert/strict";

globalThis.window = {
  fetch: () => Promise.reject(new Error("not used")),
  setTimeout,
  clearTimeout
};

const { ApiConnectionError, SynapseApiClient } = await import("../src/legacy/apiClient.js");

const client = new SynapseApiClient("http://127.0.0.1:8001", {
  fetchImpl: (_url, options = {}) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    });
  })
});

await assert.rejects(
  () => client.fetch("/analyze", { timeoutMs: 1 }),
  error => error instanceof ApiConnectionError && /did not respond within/.test(error.message)
);

console.log("api client timeout regression passed");
