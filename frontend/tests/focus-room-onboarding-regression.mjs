import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const page = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/FocusRoomPage.jsx"), "utf8");
const store = fs.readFileSync(path.join(root, "frontend/src/focus-room/hooks/useFocusRoomStore.js"), "utf8");
const dock = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/BottomControlDock.jsx"), "utf8");

assert.match(page, /FocusRoomLanding/, "Focus Room renders a calm entry page before setup");
assert.match(page, /<FocusRoomSetup\s*\/>/, "Focus Room renders the selectable scene and settings stage");
assert.match(store, /route: "landing"/, "Fresh Focus Room state opens on the entry page");
assert.match(store, /openSetup\(\)/, "The entry page can transition into setup");
assert.match(dock, /Edit today's goal/, "Today's goal exposes a direct edit control");
assert.match(dock, /setStudyGoal\(nextGoal\)/, "Goal edits update the persisted Focus Room state");

console.log("focus-room-onboarding-regression: passed");
