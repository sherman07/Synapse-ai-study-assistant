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
const focusRoomHtml = read("frontend/focus-room.html");
const focusRoomShell = read("frontend/src/focus-room/shell.js");
const focusRoomStandalone = read("frontend/src/focus-room/standalone.js");
const focusRoomStandaloneBridge = read("frontend/src/focus-room/standalone-bridge.js");
const focusRoomData = read("frontend/src/focus-room/data.js");
const style = read("frontend/style.css");
const focusStyle = read("frontend/styles/09-focus-room.css");

assert.ok(!main.includes("initFocusRoom"), "main.js should leave Focus Room controller boot to focus-room.html");
assert.ok(main.includes("bootSynapseRuntime"), "main.js should route legacy and Focus Room startup through a guarded boot helper");
assert.ok(main.includes("console.error(\"Synapse boot failed:\", error)"), "main.js should log boot failures with the caught error");
assert.ok(main.includes("scheduleSynapseRuntimeBoot"), "main.js should be able to retry startup through the async fallback path");
assert.ok(!appShell.includes("FocusRoom()"), "AppShell should not render the separate Focus Room shell");
assert.ok(analysisStage.includes("focusRoomCta"), "analysis header should include the current-material Focus Room CTA");
assert.ok(controller.includes("\"10_focusroombridge.js\""), "legacy controller should load the Focus Room bridge");
assert.ok(boot.includes("getSynapseFocusRoomMaterials"), "boot should expose Focus Room material bridge helpers");
assert.ok(boot.includes("openSynapseFocusRoom"), "boot should expose the Focus Room opener");
assert.ok(uploadSection.includes("renderFocusRoomWorkspaceActions"), "analysis view should refresh Focus Room CTAs");
assert.ok(historySection.includes("history-focus-room-btn"), "history rows should include a Focus Room action");
assert.ok(style.includes("09-focus-room.css"), "global stylesheet should import Focus Room styles");
assert.ok(focusRoomHtml.includes("src/focus-room/standalone.js"), "Focus Room should have its own standalone HTML entry");
assert.ok(focusRoomHtml.includes("styles/09-focus-room.css"), "Standalone Focus Room page should load Focus Room styles directly");
assert.ok(focusRoomShell.includes("focusRoomSurface"), "Focus Room shell should live in a shared Focus Room module");
assert.ok(focusRoomStandalone.includes("renderFocusRoomShell"), "Standalone Focus Room boot should render the shared shell");
assert.ok(focusRoomStandalone.includes("initFocusRoom"), "Standalone Focus Room boot should initialize the controller");
assert.ok(focusRoomStandaloneBridge.includes("HISTORY_STORAGE_KEY"), "Standalone Focus Room bridge should read generated history");
assert.ok(focusRoomStandaloneBridge.includes("getSynapseFocusRoomMaterials"), "Standalone Focus Room bridge should expose material providers");
assert.ok(focusRoomStandaloneBridge.includes("returnFromFocusRoomToWorkspace"), "Standalone Focus Room bridge should return to the workspace page");
assert.ok(focusRoomData.includes("Cafe Rain"), "Focus Room data should include the two-layer Rainy Cafe ambience");
assert.ok(focusBridge.includes("function getFocusRoomFlashcardsForCurrentNote()"), "Focus Room bridge should read stored flashcards for the active note");
assert.ok(focusBridge.includes("function getFocusRoomQuizRecordsForCurrentNote()"), "Focus Room bridge should expose saved quiz record metadata");
assert.ok(focusBridge.includes("flashcards: getFocusRoomFlashcardsForCurrentNote()"), "current Focus Room material should use stored flashcard records");
assert.ok(focusBridge.includes("quizzes: getFocusRoomQuizRecordsForCurrentNote()"), "current Focus Room material should use saved quiz records");
assert.ok(
  boot.includes('typeof renderFocusRoomWorkspaceActions === "function"'),
  "boot should guard Focus Room workspace action refreshes"
);
assert.ok(
  boot.includes('typeof notifyFocusRoomMaterialsChanged === "function"'),
  "boot should guard Focus Room material change notifications"
);
assert.ok(
  focusBridge.includes("focus-room.html#/focus-room"),
  "Workspace Focus Room opener should navigate to the separate Focus Room HTML entry"
);
assert.ok(
  focusStyle.indexOf("height: 100vh;") > -1 && focusStyle.indexOf("height: 100vh;") < focusStyle.indexOf("height: 100dvh;"),
  "Focus Room surface should declare a 100vh fallback before 100dvh"
);
for (const token of [
  "--focus-glass-bg",
  "--focus-glass-border",
  "--focus-glass-shadow",
  "backdrop-filter: blur(28px) saturate(180%)",
  ".focus-setup-stage",
  ".focus-session-shell",
  ".focus-context-panel",
  ".focus-session-dock",
  ".focus-learning-panel",
  "translateX(0)",
  "@media (max-width: 640px)"
]) {
  assert.ok(focusStyle.includes(token), `Focus Room liquid glass CSS should include ${token}`);
}

function createFocusBridgeContext(overrides = {}) {
  const context = {
    console,
    currentFlashcards: [],
    currentHistoryId: "history-1",
    currentMindMap: null,
    currentSourceFingerprint: "fingerprint-1",
    currentTimeline: { events: [] },
    fullSummary: "Generated notes",
    getHistory: () => [],
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

bridgeContext = createFocusBridgeContext({
  fullSummary: "",
  getFlashcardStore: () => ({
    "history:history-2": { cards: [{ front: "Saved card", back: "Saved answer" }] }
  }),
  getHistory: () => [{
    id: "history-2",
    title: "Saved History Note",
    summary: "# Saved History Note\n\nReview the saved material.",
    sourceFingerprint: "fingerprint-2"
  }],
  getQuizHistoryStore: () => ({
    "history:history-2": [{
      id: "quiz-2",
      title: "Saved History Quiz",
      createdAt: "2026-06-09T00:00:00.000Z",
      quiz: { questions: [{ question: "What should history keep connected?" }] },
      report: { objectivePercent: 100 }
    }]
  })
});
assert.deepEqual(
  bridgeContext.getSynapseFocusRoomMaterial("history-2").flashcards,
  [{ front: "Saved card", back: "Saved answer" }],
  "Focus Room history materials should include stored flashcards"
);
assert.deepEqual(
  JSON.parse(JSON.stringify(bridgeContext.getSynapseFocusRoomMaterial("history-2").quizzes)),
  [{
    id: "quiz-2",
    title: "Saved History Quiz",
    createdAt: "2026-06-09T00:00:00.000Z",
    updatedAt: "",
    questions: [{ question: "What should history keep connected?" }],
    report: { objectivePercent: 100 }
  }],
  "Focus Room history materials should include stored quiz records"
);

bridgeContext = createFocusBridgeContext({
  fullSummary: "",
  getFlashcardStore: () => ({
    "history:history-3": { cards: [] },
    "fingerprint:fingerprint-3": { cards: [{ front: "Fingerprint card", back: "Fingerprint answer" }] }
  }),
  getHistory: () => [{
    id: "history-3",
    title: "Fingerprint History Note",
    summary: "# Fingerprint History Note",
    sourceFingerprint: "fingerprint-3"
  }],
  getQuizHistoryStore: () => ({
    "history:history-3": [{
      id: "quiz-3-history",
      title: "History Quiz",
      createdAt: "2026-06-09T00:00:00.000Z",
      questions: [{ question: "Which history key connected?" }]
    }, {
      id: "quiz-3-shared",
      title: "Shared Quiz",
      createdAt: "2026-06-09T00:01:00.000Z",
      questions: [{ question: "Should this appear once?" }]
    }],
    "fingerprint:fingerprint-3": [{
      id: "quiz-3",
      title: "Fingerprint Quiz",
      createdAt: "2026-06-09T00:02:00.000Z",
      questions: [{ question: "Which key should still connect?" }]
    }, {
      id: "quiz-3-shared",
      title: "Duplicate Shared Quiz",
      createdAt: "2026-06-09T00:03:00.000Z",
      questions: [{ question: "Should duplicate IDs be removed?" }]
    }]
  })
});
assert.deepEqual(
  bridgeContext.getSynapseFocusRoomMaterial("history-3").flashcards,
  [{ front: "Fingerprint card", back: "Fingerprint answer" }],
  "Focus Room history materials should fall through to fingerprint flashcards"
);
assert.deepEqual(
  JSON.parse(JSON.stringify(bridgeContext.getSynapseFocusRoomMaterial("history-3").quizzes.map(record => record.id))),
  ["quiz-3", "quiz-3-shared", "quiz-3-history"],
  "Focus Room history materials should merge and dedupe quiz records across keys"
);

bridgeContext = createFocusBridgeContext({
  fullSummary: "",
  getHistory: () => [{
    id: "history-4",
    title: "Idless Quiz Note",
    summary: "# Idless Quiz Note",
    sourceFingerprint: "fingerprint-4"
  }],
  getQuizHistoryStore: () => ({
    "history:history-4": [{
      title: "Practice Quiz",
      createdAt: "2026-06-09T00:00:00.000Z",
      questions: [{ question: "Which ID-less record is unique?" }]
    }],
    "fingerprint:fingerprint-4": [{
      title: "Practice Quiz",
      createdAt: "2026-06-09T00:00:00.000Z",
      questions: [{ question: "Which ID-less record is unique?" }]
    }]
  })
});
assert.equal(
  bridgeContext.getSynapseFocusRoomMaterial("history-4").quizzes.length,
  1,
  "Focus Room bridge should content-dedupe quiz records that do not have IDs"
);

const focusComponent = read("frontend/src/react/components/FocusRoom.js");
assert.ok(focusComponent.includes("renderFocusRoomShell"), "React FocusRoom component should reuse the shared Focus Room shell");
for (const id of [
  "focusRoomSurface",
  "focusRoomSetup",
  "focusRoomSession",
  "focusLearningPanel",
  "focusSessionSummary",
  "focusStudyHistory"
]) {
  assert.ok(focusRoomShell.includes(id), `FocusRoom shell should include #${id}`);
}

const focusController = read("frontend/src/focus-room/controller.js");
for (const token of [
  "hashchange",
  "#/focus-room",
  "renderFocusRoomSetup",
  "renderFocusRoomSession",
  "saveFocusRoomSession",
  "returnFromFocusRoom",
  "function focusFlashcards()",
  "state.material?.flashcards || []",
  "function renderFlashcardStudyMode(cards)",
  "function focusQuizQuestions()",
  "state.material?.quizzes",
  "function renderFocusQuizMode(questions)",
  "function renderFocusChatPanel()",
  "function renderStudyPlanEditor()",
  "syncFocusRoomAudio",
  "toggleFocusRoomAudioPlayback",
  "focusQuizScore",
  "focusRoomWorkspaceButton(\"Open Flashcard Workspace\", \"flashcards\")",
  "focusRoomWorkspaceButton(\"Open Quiz Workspace\", \"quiz\")",
  "runFocusWorkspaceAction"
]) {
  assert.ok(focusController.includes(token), `Focus Room controller should include ${token}`);
}
for (const token of [
  "focus-setup-stage",
  "focus-setup-scenes",
  "focus-setup-controls",
  "focus-step-label",
  "focus-session-shell",
  "focus-session-nav",
  "focus-context-panel",
  "focus-session-dock",
  "focus-drawer-shell",
  "focus-drawer-tabs",
  "focus-material-strip"
]) {
  assert.ok(focusController.includes(token), `Focus Room redesigned markup should include ${token}`);
}

console.log("focus room integration regression passed");
