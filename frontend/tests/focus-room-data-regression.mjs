import assert from "node:assert/strict";

const values = new Map();
globalThis.localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  }
};

const data = await import("../src/focus-room/data.js");

assert.equal(data.FOCUS_ROOM_SESSION_KEY, "synapse.focusRoom.sessions.v1");
assert.equal(data.FOCUS_ROOM_SCENES.length, 6);
assert.ok(data.FOCUS_ROOM_SCENES.every(scene => scene.id && scene.name && scene.image), "each scene should have an image-backed identity");

const material = data.normalizeFocusRoomMaterial({
  id: "history-1",
  title: "Vector Calculus Review",
  summary: "# Key Ideas\n\nGradients measure steepest increase.\n\n## Worked Examples\nUse partial derivatives.",
  sections: {
    "Key Ideas": "Gradients measure steepest increase.",
    "Worked Examples": "Use partial derivatives."
  },
  mindMap: { branches: [{ title: "Gradients" }] },
  sourceFingerprint: "abc123"
});

assert.equal(material.materialId, "history-1");
assert.equal(material.materialTitle, "Vector Calculus Review");
assert.equal(material.aiSummary.includes("Gradients"), true);
assert.deepEqual(material.studyHeadings.slice(0, 2), ["Key Ideas", "Worked Examples"]);

const plan = data.buildFocusRoomStudyPlan({
  material,
  goal: "Prepare for tomorrow's quiz",
  durationMinutes: 45
});

assert.equal(plan.length, 4);
assert.ok(plan[0].task.includes("Prepare for tomorrow's quiz"));
assert.ok(plan.some(item => item.task.includes("Worked Examples")));

const session = data.saveFocusRoomSession({
  sessionId: "session-1",
  materialId: "history-1",
  materialTitle: "Vector Calculus Review",
  studyGoal: "Prepare for tomorrow's quiz",
  selectedScene: "morning-window",
  pomodoroDuration: 45,
  startedAt: "2026-06-09T00:00:00.000Z",
  endedAt: "2026-06-09T00:30:00.000Z",
  totalFocusTime: 1800,
  flashcardsCompleted: 3,
  quizScore: 80,
  completedTasks: ["Review Key Ideas"],
  aiReflection: "You completed a focused review session."
});

assert.equal(session.materialTitle, "Vector Calculus Review");
assert.equal(data.readFocusRoomSessions().length, 1);
assert.equal(data.formatFocusRoomDuration(3661), "1h 1m");

console.log("focus room data regression passed");
