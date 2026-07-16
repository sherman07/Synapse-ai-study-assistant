import assert from "node:assert/strict";
import {
  appendLearningCompanionMessage,
  createLearningCompanionThread,
  loadLearningCompanionThread,
  resetLearningCompanionThread,
  saveLearningCompanionThread,
} from "../src/legacy/learningCompanionChatStore.js";

const storage = new Map();
storage.getItem = storage.get.bind(storage);
storage.setItem = storage.set.bind(storage);
storage.removeItem = storage.delete.bind(storage);

const thread = createLearningCompanionThread({
  id: "thread-1",
  now: () => "2026-07-16T00:00:00.000Z",
});

const saved = appendLearningCompanionMessage(
  thread,
  { id: "user-1", role: "user", content: "Teach me photography" },
  { now: () => "2026-07-16T00:01:00.000Z" },
);

saveLearningCompanionThread(saved, storage);
assert.deepEqual(loadLearningCompanionThread(storage), saved);
assert.deepEqual(
  resetLearningCompanionThread(
    { id: "thread-2", now: () => "2026-07-16T00:02:00.000Z" },
    storage,
  ).messages,
  [],
);

console.log("learning companion chat store passed");
