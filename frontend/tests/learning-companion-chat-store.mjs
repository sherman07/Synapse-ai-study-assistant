import assert from "node:assert/strict";
import {
  appendLearningCompanionMessage,
  createLearningCompanionThread,
  loadLearningCompanionThread,
  resetLearningCompanionThread,
  saveLearningCompanionThread,
  updateLearningCompanionThreadContext,
} from "../src/legacy/learningCompanionChatStore.js";

const storage = new Map();
storage.getItem = storage.get.bind(storage);
storage.setItem = storage.set.bind(storage);
storage.removeItem = storage.delete.bind(storage);

const createdWithNonStringId = createLearningCompanionThread({
  id: 123,
  now: () => "2026-07-16T00:00:00.000Z",
});
assert.equal(typeof createdWithNonStringId.id, "string");
assert.notEqual(createdWithNonStringId.id.trim().length, 0);

saveLearningCompanionThread(
  { version: 1, id: 456, updatedAt: "2026-07-16T00:00:00.000Z", messages: [] },
  storage,
);
const loadedWithNonStringId = loadLearningCompanionThread(storage);
assert.equal(typeof loadedWithNonStringId.id, "string");
assert.notEqual(loadedWithNonStringId.id.trim().length, 0);

const migrated = loadLearningCompanionThread({
  getItem: () => JSON.stringify({
    version: 1,
    id: "old",
    updatedAt: "2026-07-16T00:00:00.000Z",
    messages: [],
  }),
});
assert.equal(migrated.version, 2);
assert.deepEqual(migrated.learningContext, {});

const thread = createLearningCompanionThread({
  id: "thread-1",
  now: () => "2026-07-16T00:00:00.000Z",
});

const saved = appendLearningCompanionMessage(
  { ...thread, id: 789 },
  { id: "user-1", role: "user", content: "Teach me photography" },
  { now: () => "2026-07-16T00:01:00.000Z" },
);

assert.equal(typeof saved.id, "string");
assert.notEqual(saved.id.trim().length, 0);
saveLearningCompanionThread(saved, storage);
assert.deepEqual(loadLearningCompanionThread(storage), saved);

const contextualized = updateLearningCompanionThreadContext(
  saved,
  {
    topic: "calculus",
    goal: "pass my test",
    deadline: "Friday",
    level: "beginner",
    session: "review",
    strengths: ["limits", "graphs", "derivatives", "integrals", "series", "proofs", "vectors", "matrices", "discard me"],
    path: ["overview", "practice", "review", "checkpoint", "exam", "reflection", "revision", "mastery", "discard me"],
    sourceExcerpt: "A raw source excerpt must never be persisted.",
  },
  { now: () => "2026-07-16T00:03:00.000Z" },
);
assert.equal(contextualized.version, 2);
assert.equal(contextualized.updatedAt, "2026-07-16T00:03:00.000Z");
assert.equal(contextualized.messages, saved.messages);
assert.deepEqual(contextualized.learningContext, {
  topic: "calculus",
  goal: "pass my test",
  deadline: "Friday",
  level: "beginner",
  session: "review",
  strengths: ["limits", "graphs", "derivatives", "integrals", "series", "proofs", "vectors", "matrices"],
  path: ["overview", "practice", "review", "checkpoint", "exam", "reflection", "revision", "mastery"],
});
assert.deepEqual(
  resetLearningCompanionThread(
    { id: "thread-2", now: () => "2026-07-16T00:02:00.000Z" },
    storage,
  ).messages,
  [],
);

console.log("learning companion chat store passed");
