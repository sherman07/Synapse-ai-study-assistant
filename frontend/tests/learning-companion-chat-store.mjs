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
    permanent_daily_minutes: 45,
    student_level: "beginner",
    current_level_id: "limits-101",
    current_session: "review",
    active_subskill: "chain rule",
    source_fingerprint: "source-123",
    misconceptions: ["product rule", "quotient rule", "chain rule", "limits", "graphs", "derivatives", "integrals", "series", "discard me"],
    review_candidates: ["practice-1", "practice-2"],
    selected_source_ids: ["source-1", "source-2"],
    path_levels: ["overview", "practice", "review", "checkpoint", "exam", "reflection", "revision", "mastery", "discard me"],
    level: "old provisional level",
    session: "old provisional session",
    path: { current: "old provisional nested path" },
    strengths: ["This unknown array key must not survive."],
    sourceExcerpt: "A raw source excerpt must never be persisted.",
    note: "A raw note must never be persisted.",
    quote: "A raw quote must never be persisted.",
    summary: "A raw summary must never be persisted.",
    nested: { content: "Raw source content must never be persisted." },
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
  permanent_daily_minutes: 45,
  student_level: "beginner",
  current_level_id: "limits-101",
  current_session: "review",
  active_subskill: "chain rule",
  source_fingerprint: "source-123",
  misconceptions: ["product rule", "quotient rule", "chain rule", "limits", "graphs", "derivatives", "integrals", "series"],
  review_candidates: ["practice-1", "practice-2"],
  selected_source_ids: ["source-1", "source-2"],
  path_levels: ["overview", "practice", "review", "checkpoint", "exam", "reflection", "revision", "mastery"],
});
assert.equal(Object.hasOwn(contextualized.learningContext, "strengths"), false);
assert.equal(Object.hasOwn(contextualized.learningContext, "sourceExcerpt"), false);
assert.equal(Object.hasOwn(contextualized.learningContext, "level"), false);
assert.equal(Object.hasOwn(contextualized.learningContext, "session"), false);
assert.equal(Object.hasOwn(contextualized.learningContext, "path"), false);
assert.equal(Object.hasOwn(contextualized.learningContext, "nested"), false);
assert.ok(JSON.stringify(contextualized.learningContext).length <= 2048);

const excessive = updateLearningCompanionThreadContext(saved, {
  topic: "x".repeat(161),
  goal: "y".repeat(161),
  permanent_daily_minutes: 9999,
  misconceptions: Array.from({ length: 8 }, () => "m".repeat(80)),
  review_candidates: Array.from({ length: 8 }, () => "r".repeat(80)),
  selected_source_ids: Array.from({ length: 8 }, () => "s".repeat(80)),
  path_levels: [{ raw: "nested object" }, "p".repeat(80)],
});
assert.equal(Object.hasOwn(excessive.learningContext, "topic"), false);
assert.equal(Object.hasOwn(excessive.learningContext, "goal"), false);
assert.equal(Object.hasOwn(excessive.learningContext, "permanent_daily_minutes"), false);
assert.deepEqual(excessive.learningContext.path_levels, ["p".repeat(80)]);
assert.ok(excessive.learningContext.misconceptions.length <= 8);
assert.ok(excessive.learningContext.review_candidates.length <= 8);
assert.ok(excessive.learningContext.selected_source_ids.length <= 8);
assert.ok(JSON.stringify(excessive.learningContext).length <= 2048);
assert.deepEqual(
  resetLearningCompanionThread(
    { id: "thread-2", now: () => "2026-07-16T00:02:00.000Z" },
    storage,
  ).messages,
  [],
);

console.log("learning companion chat store passed");
