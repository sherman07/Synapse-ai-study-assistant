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

const callerAbortController = new AbortController();
const callerAbortClient = new SynapseApiClient("http://127.0.0.1:8001", {
  fetchImpl: (_url, options = {}) => new Promise((_resolve, reject) => {
    const rejectAbort = () => {
      const error = new Error("caller cancelled");
      error.name = "AbortError";
      reject(error);
    };
    if (options.signal?.aborted) rejectAbort();
    else options.signal.addEventListener("abort", rejectAbort, { once: true });
  })
});
const callerAbortRequest = callerAbortClient.fetch("/analyze", {
  signal: callerAbortController.signal,
  timeoutMs: 1000
});
callerAbortController.abort();
await assert.rejects(
  () => callerAbortRequest,
  error => error?.name === "AbortError" && !(error instanceof ApiConnectionError)
);

console.log("api client timeout regression passed");
