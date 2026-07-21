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

const originalDateNow = Date.now;
let now = 1_700_000_000_000;
Date.now = () => now;

try {
  const utils = await import(`../src/focus-room/utils.js?timer-input=${now}`);
  const {
    splitDuration,
    joinDuration,
    stepSegment,
    pushDigit,
    bufferToValue,
    commitBuffer,
    nextSegment,
    formatDuration,
    SEGMENT_MAX
  } = await import(`../src/focus-room/timerInput.js?timer-input=${now}`);

  assert.equal(utils.MIN_DURATION_SECONDS, 60);
  assert.equal(utils.MAX_DURATION_SECONDS, utils.MAX_DURATION_MINUTES * 60);
  assert.equal(utils.clampDurationSeconds(5, 600), 60, "sub-minute values clamp up to the one-minute floor");
  assert.equal(utils.clampDurationSeconds(999999, 600), utils.MAX_DURATION_SECONDS, "values clamp to the max");
  assert.equal(utils.clampDurationSeconds(1530, 600), 1530, "in-range seconds pass through");

  const parts = splitDuration(1500);
  assert.deepEqual(parts, { minutes: 25, seconds: 0 });
  assert.deepEqual(splitDuration(597), { minutes: 9, seconds: 57 });
  assert.equal(joinDuration(9, 57), 597);
  assert.equal(formatDuration(597), "09:57");
  assert.equal(formatDuration(1500), "25:00");

  // Stepping one segment must never disturb the other segment's digits.
  assert.equal(stepSegment(597, "seconds", 1), joinDuration(9, 58), "seconds +1 keeps minutes");
  assert.equal(stepSegment(597, "seconds", 5), joinDuration(9, 59), "seconds clamp at 59 without rolling minutes");
  assert.equal(stepSegment(597, "minutes", 1), joinDuration(10, 57), "minutes +1 keeps seconds");
  assert.equal(stepSegment(60, "seconds", -30), joinDuration(1, 0), "seconds floor stops at 0 within the minute");
  assert.equal(stepSegment(60, "minutes", -5), 60, "minutes cannot drop below the one-minute floor");

  // Type-to-overwrite buffer for a single segment.
  assert.equal(pushDigit("", "3", "seconds"), "3");
  assert.equal(pushDigit("3", "0", "seconds"), "30");
  assert.equal(pushDigit("30", "5", "seconds"), "05", "seconds keep the last two typed digits");
  assert.equal(pushDigit("12", "0", "minutes"), "120", "minutes keep up to three digits");
  assert.equal(bufferToValue("90", "seconds"), 59, "typed seconds clamp to 59");
  assert.equal(bufferToValue("500", "minutes"), SEGMENT_MAX.minutes, "typed minutes clamp to the max minute");

  assert.equal(commitBuffer(1500, "seconds", "30"), joinDuration(25, 30), "commit seconds only");
  assert.equal(commitBuffer(1500, "minutes", "10"), joinDuration(10, 0), "commit minutes only");

  assert.equal(nextSegment("minutes", 1), "seconds");
  assert.equal(nextSegment("seconds", -1), "minutes");
  assert.equal(nextSegment("seconds", 1), "seconds", "moving past the last segment stays put");

  // Store: second precision drives the countdown, minutes stay in sync.
  const material = {
    materialId: "timer-input",
    materialTitle: "Editable Timer Test",
    aiSummary: "fixture",
    studyHeadings: ["Ideas"],
    sections: { Ideas: "content" }
  };
  globalThis.getSynapseFocusRoomMaterials = () => [material];
  globalThis.getSynapseFocusRoomCurrentMaterial = () => material;

  const { useFocusRoomStore } = await import(`../src/focus-room/hooks/useFocusRoomStore.js?timer-input=${now}`);
  const store = useFocusRoomStore;

  store.getState().hydrateFocusRoute({ name: "focus", materialId: material.materialId }, material);
  store.getState().startSession();

  store.getState().setPomodoroDurationSeconds(1530);
  assert.equal(store.getState().pomodoroDurationSeconds, 1530, "canonical seconds are stored");
  assert.equal(store.getState().pomodoroDuration, 26, "minutes stay in sync (rounded)");
  assert.equal(store.getState().timerDurationSeconds, 1530, "countdown length uses the exact seconds");

  store.getState().setPomodoroDuration(30);
  assert.equal(store.getState().pomodoroDurationSeconds, 1800, "preset minutes still work through the seconds path");
  assert.equal(store.getState().timerDurationSeconds, 1800);

  // Sub-minute custom lengths run to completion at the exact second count.
  store.getState().setPomodoroDurationSeconds(63);
  store.getState().startTimer();
  now += 63_000;
  store.getState().tickTimer();
  assert.equal(store.getState().timerState, "completed");
  assert.equal(store.getState().elapsedSeconds, 63, "a 1:03 block completes at 63 seconds");

  console.log("focus room timer input regression passed");
} finally {
  Date.now = originalDateNow;
}
