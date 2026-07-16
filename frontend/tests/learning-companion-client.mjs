import assert from "node:assert/strict";

globalThis.window = {
  location: {
    protocol: "http:",
    hostname: "localhost",
    port: "8001",
    host: "localhost:8001",
  },
};
globalThis.document = { body: { dataset: {} } };

const { createLearningCompanionRequester } = await import("../src/legacy/learningCompanionClient.js");

let sentBody = null;
const request = createLearningCompanionRequester({
  fetch: async (_path, options) => {
    sentBody = JSON.parse(options.body);
    return { ok: true, json: async () => ({ reply: "Ready" }) };
  },
});

await request({
  message: "Teach me calculus",
  messages: [],
  learningContext: { topic: "calculus", goal: "pass my test" },
  sourceBundle: { fingerprint: "x", sources: [] },
});
assert.equal(sentBody.learning_context.goal, "pass my test");
assert.deepEqual(sentBody.source_bundle, { fingerprint: "x", sources: [] });

console.log("learning companion client passed");
