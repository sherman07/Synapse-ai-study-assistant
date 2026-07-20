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

const material = {
  materialId: "timer-regression",
  materialTitle: "Timestamp Timer Test",
  aiSummary: "A small generated study material fixture.",
  studyHeadings: ["Key ideas"],
  sections: { "Key ideas": "Use timestamps, not interval counts." }
};

globalThis.getSynapseFocusRoomMaterials = () => [material];
globalThis.getSynapseFocusRoomCurrentMaterial = () => material;

const originalDateNow = Date.now;
let now = 1_700_000_000_000;
Date.now = () => now;

try {
  const data = await import(`../src/focus-room/data.js?timer-regression=${now}`);
  assert.deepEqual(data.FOCUS_ROOM_TIMER_STATES, [
    "idle",
    "running",
    "paused",
    "completed",
    "break",
    "restoring"
  ]);
  assert.equal(data.normalizeFocusRoomTimerState("studying"), "running");
  assert.equal(data.focusRoomLegacyTimerStatus("running"), "studying");

  data.saveFocusRoomActiveSession("timer-regression", {
    view: "session",
    timerStatus: "studying",
    elapsedSeconds: 2,
    timerAnchorAtMs: now - 2_000,
    timerUpdatedAtMs: now
  });
  const savedMetadata = data.readFocusRoomActiveSessionForMaterial("timer-regression");
  assert.equal(savedMetadata.timerState, "running");
  assert.equal(savedMetadata.timerStatus, "studying");
  assert.equal(savedMetadata.timerAnchorAtMs, now - 2_000);

  const { useFocusRoomStore } = await import(`../src/focus-room/hooks/useFocusRoomStore.js?timer-regression=${now}`);
  const store = useFocusRoomStore;
  store.getState().hydrateFocusRoute({ name: "focus", materialId: material.materialId }, material);
  store.getState().startSession();
  store.getState().setPomodoroDuration(10);

  store.getState().startTimer();
  const started = store.getState();
  assert.equal(started.timerState, "running");
  assert.equal(started.timerPhase, "running");
  assert.equal(started.timerStatus, "studying", "legacy studying alias must remain available");
  const anchor = started.timerAnchorAtMs;

  now += 3_400;
  store.getState().tickTimer();
  assert.equal(store.getState().elapsedSeconds, 3, "elapsed time should come from the wall-clock anchor");

  now += 4_100;
  store.getState().tickTimer();
  assert.equal(store.getState().elapsedSeconds, 7, "one reconciliation should include hidden-tab time");
  assert.equal(store.getState().timerAnchorAtMs, anchor);

  store.getState().startTimer();
  assert.equal(store.getState().timerAnchorAtMs, anchor, "starting an already-running timer must not create a second clock");

  store.getState().pauseTimer();
  assert.equal(store.getState().timerState, "paused");
  assert.equal(store.getState().timerStatus, "paused");
  assert.equal(store.getState().timerAnchorAtMs, null);
  const pausedElapsed = store.getState().elapsedSeconds;

  now += 5_000;
  store.getState().tickTimer();
  assert.equal(store.getState().elapsedSeconds, pausedElapsed, "paused time must not accrue");

  store.getState().startTimer();
  now += 2_100;
  store.getState().tickTimer();
  assert.equal(store.getState().elapsedSeconds, pausedElapsed + 2);

  now += 600_000;
  store.getState().tickTimer();
  assert.equal(store.getState().timerState, "completed");
  assert.equal(store.getState().timerStatus, "completed");
  assert.equal(store.getState().elapsedSeconds, 600);

  store.getState().startBreak();
  assert.equal(store.getState().timerState, "break");
  assert.equal(store.getState().getTimerState(), "break");

  const persistedAfterBreak = data.readFocusRoomActiveSessionForMaterial(material.materialId);
  assert.equal(persistedAfterBreak.timerState, "break");
  assert.equal(persistedAfterBreak.timerMode, "countdown");

  data.saveFocusRoomActiveSession(material.materialId, {
    view: "session",
    timerState: "running",
    timerStatus: "studying",
    timerMode: "countdown",
    elapsedSeconds: 4,
    timerAnchorAtMs: now - 4_000,
    timerUpdatedAtMs: now,
    startedAt: new Date(now - 4_000).toISOString()
  });
  store.getState().hydrateFocusRoute({ name: "focus", materialId: material.materialId }, material);
  assert.equal(store.getState().timerState, "restoring");
  await Promise.resolve();
  assert.equal(store.getState().timerState, "paused", "a persisted running session must restore safely as paused");
  assert.equal(store.getState().timerStatus, "paused");
  assert.equal(store.getState().elapsedSeconds, 4);
  assert.ok(store.getState().timerRestoredAtMs > 0);
  assert.equal(data.readFocusRoomActiveSessionForMaterial(material.materialId).timerState, "paused");

  store.getState().startSession();
  store.getState().setTimerMode("countup");
  store.getState().startTimer();
  now += 5_200;
  store.getState().tickTimer();
  assert.equal(store.getState().timerMode, "countup");
  assert.equal(store.getState().elapsedSeconds, 5, "count-up mode should use the same timestamp clock");
  store.getState().pauseTimer();
  assert.equal(store.getState().timerState, "paused");

  const hookSource = await (await import("node:fs/promises")).readFile(new URL("../src/focus-room/hooks/usePomodoroTimer.js", import.meta.url), "utf8");
  assert.equal((hookSource.match(/setInterval\(/g) || []).length, 1, "the timer hook should own one interval");
  assert.equal((hookSource.match(/clearInterval\(/g) || []).length, 1, "the timer hook should clean up its interval");

  console.log("focus room timer regression passed");
} finally {
  Date.now = originalDateNow;
}
