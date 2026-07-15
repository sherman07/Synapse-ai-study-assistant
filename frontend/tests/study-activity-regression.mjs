import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const mastery = read("frontend/src/legacy/controller_sections/04_masterygraph.js");
const notes = read("frontend/src/legacy/controller_sections/01_uploadedfiles.js");
const controls = read("frontend/src/legacy/controller_sections/02_openvisualmodal.js");
const timeline = read("frontend/src/legacy/controller_sections/03_rendertimeline.js");
const visual = read("frontend/src/legacy/controller_sections/04_rendervisualguidelaunch.js");
const quiz = read("frontend/src/legacy/controller_sections/05_persistcurrentquiztohistory.js");
const flashcards = read("frontend/src/legacy/controller_sections/06_deleteflashcarddeck.js");
const tutor = read("frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js");
const source = read("frontend/src/legacy/controller_sections/09_togglesourceviewer.js");
const broadcast = read("frontend/src/legacy/controller_sections/12_broadcastjobs.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const styles = read("frontend/styles/07-section.css");

for (const token of [
  "MEMORY_ACTIVITY_LIMIT",
  "recordStudyActivity",
  "getStudyActivityList",
  "getStudyActivitySummary",
  "completedTasks",
  "study-activity-panel",
  "study-activity-list"
]) {
  assert.ok(mastery.includes(token) || styles.includes(token), `activity system should include ${token}`);
}

for (const [sourceText, token, label] of [
  [notes, "notes_ready", "note generation"],
  [controls, "tool_opened", "tool navigation"],
  [timeline, "study_path_task_completed", "study path completion"],
  [visual, "visual_guide_generated", "image guide generation"],
  [quiz, "quiz_submitted", "quiz submission"],
  [flashcards, "flashcard_flipped", "flashcard review"],
  [tutor, "tutor_message", "tutor messages"],
  [source, "source_opened", "source viewing"],
  [broadcast, "broadcast_started", "broadcast playback"]
]) {
  assert.ok(sourceText.includes(token), `${label} should write to the activity ledger`);
}

assert.ok(boot.includes("recordStudyActivity"), "activity recorder should be available to the app shell");
assert.ok(boot.includes("recordQuizAnswerActivity"), "quiz text answer tracking should be available to inline handlers");
assert.ok(boot.includes("deleteMemoryEngineNote"), "activity history should be deleted with the generated note");
assert.ok(source.includes("deleteMemoryEngineNote"), "deleting a note should remove its activity ledger");
assert.ok(mastery.includes("Detailed progress for this note"), "readiness should explain the activity scope");

console.log("study activity regression passed");
