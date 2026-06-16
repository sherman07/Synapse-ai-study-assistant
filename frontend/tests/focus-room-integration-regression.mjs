import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");
const exists = file => fs.existsSync(path.join(repoRoot, file));

const packageJson = JSON.parse(read("package.json"));
const viteConfig = read("vite.config.js");
const staticFocusRoomConfig = read("vite.focus-room-static.config.js");
const main = read("frontend/src/main.js");
const app = read("frontend/src/react/App.js");
const runtime = read("frontend/src/react/runtime.js");
const appShell = read("frontend/src/react/components/AppShell.js");
const analysisStage = read("frontend/src/react/components/AnalysisStage.js");
const controller = read("frontend/src/legacy/controller.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const uploadSection = read("frontend/src/legacy/controller_sections/01_uploadedfiles.js");
const historySection = read("frontend/src/legacy/controller_sections/09_togglesourceviewer.js");
const focusBridge = read("frontend/src/legacy/controller_sections/10_focusroombridge.js");
const indexHtml = read("frontend/index.html");
const focusRoomHtml = read("frontend/focus-room.html");
const focusRoomStaticLoader = read("frontend/src/focus-room/static-compatible-loader.js");
const focusRoomStandalone = read("frontend/src/focus-room/standalone.js");
const focusRoomStandaloneBridge = read("frontend/src/focus-room/standalone-bridge.js");
const focusRoomData = read("frontend/src/focus-room/data.js");
const focusRoomController = read("frontend/src/focus-room/controller.js");
const focusRoomStore = read("frontend/src/focus-room/hooks/useFocusRoomStore.js");
const focusRoomPage = read("frontend/src/focus-room/components/FocusRoomPage.jsx");
const focusTimerCard = read("frontend/src/focus-room/components/TimerCard.jsx");
const style = read("frontend/style.css");
const focusStyle = read("frontend/styles/09-focus-room.css");

for (const dep of [
  "react",
  "react-dom",
  "vite",
  "@vitejs/plugin-react",
  "react-router-dom",
  "motion",
  "gsap",
  "zustand",
  "@tanstack/react-query",
  "howler",
  "lucide-react",
  "radix-ui"
]) {
  assert.ok(packageJson.dependencies[dep], `package.json should install ${dep}`);
}
assert.ok(packageJson.scripts.build.includes("vite build"), "package.json should expose a Vite build");
assert.ok(packageJson.scripts["test:focus-room"].includes("focus-room-integration-regression.mjs"), "package.json should expose focused Focus Room tests");
assert.ok(viteConfig.includes("frontend/index.html"), "Vite config should include the workspace HTML entry");
assert.ok(viteConfig.includes("frontend/focus-room.html"), "Vite config should include the Focus Room HTML entry");
assert.ok(viteConfig.includes("@vitejs/plugin-react"), "Vite config should use the React plugin");
assert.ok(packageJson.scripts.build.includes("vite.focus-room-static.config.js"), "build should regenerate the static Focus Room bundle");
assert.ok(staticFocusRoomConfig.includes("frontend/assets/focus-room-app"), "static Focus Room bundle should build into frontend assets");
assert.ok(staticFocusRoomConfig.includes("process.env.NODE_ENV"), "static Focus Room bundle should define process.env.NODE_ENV for browser-only serving");

assert.ok(indexHtml.includes("react@18/umd/react.production.min.js"), "Workspace should keep CDN React for static-server compatibility");
assert.ok(indexHtml.includes("react-dom@18/umd/react-dom.production.min.js"), "Workspace should keep CDN ReactDOM for static-server compatibility");
assert.ok(main.includes("flushSync"), "main.js should preserve guarded synchronous shell boot");
assert.ok(main.includes("window.ReactDOM"), "Workspace main.js should use CDN ReactDOM globals on the static server");
assert.ok(runtime.includes("globalThis.React"), "React runtime helper should use the static-compatible React global");
assert.ok(app.includes("h(AppShell)"), "React app should render the shell as React elements");
assert.ok(!app.includes("dangerouslySetInnerHTML"), "React app should not inject the workspace shell as an HTML string");
assert.ok(!appShell.includes("FocusRoom()"), "AppShell should not render the separate Focus Room shell");
assert.ok(analysisStage.includes("focusRoomCta"), "analysis header should include the current-material Focus Room CTA");
assert.ok(controller.includes("\"10_focusroombridge.js\""), "legacy controller should load the Focus Room bridge");
assert.ok(boot.includes("getSynapseFocusRoomMaterials"), "boot should expose Focus Room material bridge helpers");
assert.ok(boot.includes("openSynapseFocusRoom"), "boot should expose the Focus Room opener");
assert.ok(uploadSection.includes("renderFocusRoomWorkspaceActions"), "analysis view should refresh Focus Room CTAs");
assert.ok(historySection.includes("history-focus-room-btn"), "history rows should include a Focus Room action");
assert.ok(style.includes("09-focus-room.css"), "global stylesheet should import Focus Room styles");
assert.ok(focusRoomHtml.includes("static-compatible-loader.js"), "Focus Room should use the static-compatible loader");
assert.ok(focusRoomHtml.includes("styles/09-focus-room.css"), "Standalone Focus Room page should load Focus Room styles directly");
assert.ok(!focusRoomHtml.includes("react@18"), "Standalone Focus Room should rely on Vite/npm React, not CDN React");
assert.ok(focusRoomStaticLoader.includes("focus-room-static.js"), "Focus Room static loader should import the prebuilt static bundle");
assert.ok(focusRoomStaticLoader.includes("./standalone.js"), "Focus Room static loader should keep the Vite source entry for dev");
assert.ok(focusRoomStaticLoader.includes("import.meta.env?.DEV"), "Focus Room loader should detect Vite through import.meta.env instead of port guessing");
assert.ok(!focusRoomStaticLoader.includes("VITE_PORTS"), "Focus Room loader should not mistake static servers for Vite based on port numbers");
assert.ok(focusRoomStaticLoader.includes("addEventListener(\"error\""), "Focus Room loader should surface runtime boot errors");
assert.ok(focusRoomStaticLoader.includes("addEventListener(\"unhandledrejection\""), "Focus Room loader should surface async boot errors");
assert.ok(focusRoomStaticLoader.includes("focusRoomHasMounted"), "Focus Room loader should verify that React mounted visible UI");
assert.ok(exists("frontend/assets/focus-room-app/focus-room-static.js"), "prebuilt static Focus Room bundle should exist for static servers");
assert.ok(focusRoomStandalone.includes("initFocusRoom({ root })"), "Standalone Focus Room boot should initialize the React controller");
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

for (const file of [
  "frontend/src/focus-room/components/FocusRoomPage.jsx",
  "frontend/src/focus-room/components/FocusBackground.jsx",
  "frontend/src/focus-room/components/LiquidGlass.jsx",
  "frontend/src/focus-room/components/GlassButton.jsx",
  "frontend/src/focus-room/components/TopFocusNav.jsx",
  "frontend/src/focus-room/components/FocusRoomSetup.jsx",
  "frontend/src/focus-room/components/SceneSelector.jsx",
  "frontend/src/focus-room/components/SceneCard.jsx",
  "frontend/src/focus-room/components/SoundControlPanel.jsx",
  "frontend/src/focus-room/components/PomodoroTimer.jsx",
  "frontend/src/focus-room/components/TimerCard.jsx",
  "frontend/src/focus-room/components/BottomControlDock.jsx",
  "frontend/src/focus-room/components/AILearningPanel.jsx",
  "frontend/src/focus-room/components/StudyPlanDrawer.jsx",
  "frontend/src/focus-room/components/MaterialPanel.jsx",
  "frontend/src/focus-room/components/FlashcardStudyMode.jsx",
  "frontend/src/focus-room/components/QuizStudyMode.jsx",
  "frontend/src/focus-room/components/MindMapViewer.jsx",
  "frontend/src/focus-room/components/AIStudyChat.jsx",
  "frontend/src/focus-room/components/SessionSummaryModal.jsx",
  "frontend/src/focus-room/components/StudyHistoryPanel.jsx",
  "frontend/src/focus-room/components/WorkspacePanel.jsx",
  "frontend/src/focus-room/hooks/useIdleMode.js",
  "frontend/src/focus-room/hooks/usePomodoroTimer.js",
  "frontend/src/focus-room/hooks/useFocusSession.js",
  "frontend/src/focus-room/hooks/useSceneBackground.js",
  "frontend/src/focus-room/hooks/useStudyMaterial.js",
  "frontend/src/focus-room/hooks/useAudioSettings.js",
  "frontend/src/focus-room/hooks/useSessionHistory.js",
  "frontend/src/focus-room/hooks/useFocusRoomStore.js",
  "frontend/src/focus-room/static-compatible-loader.js"
]) {
  assert.ok(exists(file), `${file} should exist`);
}

for (const token of [
  "createRoot",
  "QueryClientProvider",
  "HashRouter",
  "exposeFocusRoomGlobals",
  "__synapseFocusRoomApi"
]) {
  assert.ok(focusRoomController.includes(token), `React Focus Room controller should include ${token}`);
}

for (const token of [
  "selectedScene",
  "selectedMaterialId",
  "musicType",
  "ambientSound",
  "musicVolume",
  "ambientVolume",
  "pomodoroDuration",
  "timerStatus",
  "studyGoal",
  "studyPlan",
  "aiPanelOpen",
  "planDrawerOpen",
  "workspaceOpen",
  "historyOpen",
  "isIdle",
  "currentSession",
  "sessionHistory"
]) {
  assert.ok(focusRoomStore.includes(token), `Zustand Focus Room store should include ${token}`);
}

for (const token of [
  "useIdleMode(3000)",
  "usePomodoroTimer",
  "useAudioSettings",
  "useStudyMaterial",
  "TopFocusNav",
  "BottomControlDock",
  "AILearningPanel",
  "StudyPlanDrawer"
]) {
  assert.ok(focusRoomPage.includes(token), `Focus Room page should include ${token}`);
}
assert.ok(focusTimerCard.includes("isIdle"), "Timer card Motion animation should respond to idle mode");
assert.ok(focusTimerCard.includes("timerScale"), "Timer card should scale down through Motion during idle mode");

for (const token of [
  "--glass-bg",
  "--glass-bg-strong",
  "--glass-border",
  "--glass-border-strong",
  "--glass-blur",
  "--glass-radius",
  "--text-primary",
  "body.focus-room-standalone",
  "#focusRoomFallbackTitle",
  ".liquid-glass",
  "backdrop-filter: blur(var(--glass-blur)) saturate(190%) contrast(105%)",
  ".focus-background",
  ".focus-overlay",
  ".focus-setup-stage",
  "overflow-y: auto",
  ".timer-card",
  ".bottom-dock",
  ".ai-learning-panel",
  ".is-idle .top-nav",
  ".is-idle .extra-panel",
  ".is-idle .timer-card",
  ".is-idle .bottom-dock",
  "@media (max-width: 640px)"
]) {
  assert.ok(focusStyle.includes(token), `Focus Room liquid glass CSS should include ${token}`);
}
assert.ok(
  focusStyle.indexOf("height: 100vh;") > -1 && focusStyle.indexOf("height: 100vh;") < focusStyle.indexOf("height: 100dvh;"),
  "Focus Room surface should declare a 100vh fallback before 100dvh"
);

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

console.log("focus room integration regression passed");
