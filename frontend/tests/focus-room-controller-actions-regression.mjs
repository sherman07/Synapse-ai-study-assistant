import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const controller = read("frontend/src/focus-room/controller.js");
const page = read("frontend/src/focus-room/components/FocusRoomPage.jsx");
const dock = read("frontend/src/focus-room/components/BottomControlDock.jsx");
const timer = read("frontend/src/focus-room/components/TimerCard.jsx");
const session = read("frontend/src/focus-room/hooks/useFocusSession.js");

for (const token of ["createRoot", "FocusRoomPage", "exposeFocusRoomGlobals", "startFocusRoomSession", "returnFromFocusRoom"]) {
  assert.ok(controller.includes(token), `React controller should preserve ${token}`);
}
assert.ok(!controller.includes("QueryClientProvider"), "React controller should not reintroduce the React Query boot wrapper");
assert.ok(!controller.includes("HashRouter"), "React controller should not reintroduce the React Router boot wrapper");

assert.ok(page.includes("initializeFocusRoom"), "Focus Room should initialize as a standalone room");
assert.ok(!page.includes("useStudyMaterial"), "Focus Room should not load generated material");
assert.ok(!page.includes("AILearningPanel"), "Focus Room should not mount the AI study suite");
assert.ok(!page.includes("FocusRoomToolPanel"), "Focus Room should not mount Synapse Tools");
assert.ok(!dock.includes("Synapse Tools"), "Focus Room dock should not include generated-content tools");
assert.ok(!timer.includes("openStudyPanel"), "Timer should not open generated-content panels");

for (const token of ["__synapseFocusRoomApi", "returnFromFocusRoomToWorkspace", "selectFocusScene", "setFocusDuration", "toggleFocusRoomAudioPlayback"]) {
  assert.ok(session.includes(token), `Focus session hook should preserve ${token}`);
}

console.log("focus room controller actions regression passed");
