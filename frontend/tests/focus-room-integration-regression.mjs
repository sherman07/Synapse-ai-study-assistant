import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const main = read("frontend/src/main.js");
const appShell = read("frontend/src/react/components/AppShell.js");
const analysisStage = read("frontend/src/react/components/AnalysisStage.js");
const controller = read("frontend/src/legacy/controller.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const uploadSection = read("frontend/src/legacy/controller_sections/01_uploadedfiles.js");
const historySection = read("frontend/src/legacy/controller_sections/09_togglesourceviewer.js");
const focusBridge = read("frontend/src/legacy/controller_sections/10_focusroombridge.js");
const style = read("frontend/style.css");

assert.ok(main.includes("initFocusRoom"), "main.js should initialize the Focus Room controller");
assert.ok(appShell.includes("FocusRoom()"), "AppShell should render the Focus Room shell");
assert.ok(analysisStage.includes("focusRoomCta"), "analysis header should include the current-material Focus Room CTA");
assert.ok(controller.includes("\"10_focusroombridge.js\""), "legacy controller should load the Focus Room bridge");
assert.ok(boot.includes("getSynapseFocusRoomMaterials"), "boot should expose Focus Room material bridge helpers");
assert.ok(boot.includes("openSynapseFocusRoom"), "boot should expose the Focus Room opener");
assert.ok(uploadSection.includes("renderFocusRoomWorkspaceActions"), "analysis view should refresh Focus Room CTAs");
assert.ok(historySection.includes("history-focus-room-btn"), "history rows should include a Focus Room action");
assert.ok(style.includes("09-focus-room.css"), "global stylesheet should import Focus Room styles");
assert.ok(focusBridge.includes("function getFocusRoomFlashcardsForCurrentNote()"), "Focus Room bridge should read stored flashcards for the active note");
assert.ok(focusBridge.includes("function getFocusRoomQuizRecordsForCurrentNote()"), "Focus Room bridge should expose saved quiz record metadata");
assert.ok(focusBridge.includes("flashcards: getFocusRoomFlashcardsForCurrentNote()"), "current Focus Room material should use stored flashcard records");
assert.ok(focusBridge.includes("quizzes: getFocusRoomQuizRecordsForCurrentNote()"), "current Focus Room material should use saved quiz records");

function createFocusBridgeContext(overrides = {}) {
  const context = {
    console,
    currentFlashcards: [],
    currentHistoryId: "history-1",
    currentMindMap: null,
    currentSourceFingerprint: "fingerprint-1",
    currentTimeline: { events: [] },
    fullSummary: "Generated notes",
    makeHistoryTitle: () => "Generated notes",
    quizHistory: [],
    sections: {},
    storedTitle: "Generated notes",
    summaryContent: { textContent: "" },
    ...overrides
  };
  vm.createContext(context);
  vm.runInContext(focusBridge, context);
  return context;
}

const fallbackCard = { front: "Fallback card", back: "Fallback answer" };
let bridgeContext = createFocusBridgeContext({ currentFlashcards: [fallbackCard] });
assert.deepEqual(
  bridgeContext.getSynapseFocusRoomCurrentMaterial().flashcards,
  [fallbackCard],
  "Focus Room bridge should fall back to current flashcards when getFlashcardStore is missing"
);

bridgeContext = createFocusBridgeContext({
  currentFlashcards: "not-an-array",
  getFlashcardStore: () => ({ "history:history-1": { cards: [{ front: "Stored card", back: "Stored answer" }] } })
});
assert.deepEqual(
  bridgeContext.getSynapseFocusRoomCurrentMaterial().flashcards,
  [{ front: "Stored card", back: "Stored answer" }],
  "Focus Room bridge should prefer stored flashcards for the active note"
);

bridgeContext = createFocusBridgeContext({
  currentFlashcards: "not-an-array",
  getFlashcardStore: () => "malformed-store"
});
assert.equal(
  bridgeContext.getSynapseFocusRoomCurrentMaterial().flashcards.length,
  0,
  "Focus Room bridge should tolerate malformed flashcard storage"
);

const focusComponent = read("frontend/src/react/components/FocusRoom.js");
for (const id of [
  "focusRoomSurface",
  "focusRoomSetup",
  "focusRoomSession",
  "focusLearningPanel",
  "focusSessionSummary",
  "focusStudyHistory"
]) {
  assert.ok(focusComponent.includes(id), `FocusRoom shell should include #${id}`);
}

const focusController = read("frontend/src/focus-room/controller.js");
for (const token of [
  "hashchange",
  "#/focus-room",
  "renderFocusRoomSetup",
  "renderFocusRoomSession",
  "saveFocusRoomSession",
  "returnFromFocusRoom",
  "state.material.flashcards || []",
  "slice(0, 12)",
  "<details>",
  "state.material.quizzes || []",
  "questions.length",
  "onclick=\"returnFromFocusRoom(${jsStringAttr(materialId)})"
]) {
  assert.ok(focusController.includes(token), `Focus Room controller should include ${token}`);
}

console.log("focus room integration regression passed");
