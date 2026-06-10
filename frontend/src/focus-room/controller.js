import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { FocusRoomPage } from "./components/FocusRoomPage.jsx";
import { QueryClientProvider, focusRoomQueryClient } from "./queryClient.js";

let focusRoomRoot = null;

function callFocusRoomApi(name, args) {
  const api = globalThis.__synapseFocusRoomApi || {};
  if (typeof api[name] !== "function") {
    console.warn(`Synapse Focus Room action "${name}" is not available yet.`);
    return undefined;
  }
  return api[name](...args);
}

function exposeFocusRoomGlobals() {
  const actions = {
    answerFocusQuizQuestion: "answerFocusQuizQuestion",
    askFocusAssistant: "askFocusAssistant",
    checkFocusQuizQuestion: "checkFocusQuizQuestion",
    closeFocusSummary: "closeFocusSummary",
    endFocusRoomSession: "endFocusRoomSession",
    flipFocusFlashcard: "flipFocusFlashcard",
    pauseFocusRoomTimer: "pauseFocusRoomTimer",
    rateFocusFlashcard: "rateFocusFlashcard",
    resetFocusRoomTimer: "resetFocusRoomTimer",
    returnFromFocusRoom: "returnFromFocusRoom",
    selectFocusScene: "selectFocusScene",
    setFocusDuration: "setFocusDuration",
    setFocusFlashcardIndex: "setFocusFlashcardIndex",
    setFocusPanelTab: "setFocusPanelTab",
    showFocusStudyHistory: "showFocusStudyHistory",
    skipFocusRoomTimer: "skipFocusRoomTimer",
    startFocusRoomSession: "startFocusRoomSession",
    startFocusRoomTimer: "startFocusRoomTimer",
    toggleFocusRoomAudioPlayback: "toggleFocusRoomAudioPlayback",
    toggleFocusLearningPanel: "toggleFocusLearningPanel",
    toggleFocusTask: "toggleFocusTask",
    updateFocusPlanTask: "updateFocusPlanTask",
    updateFocusGoal: "updateFocusGoal",
    updateFocusSound: "updateFocusSound"
  };

  Object.entries(actions).forEach(([globalName, apiName]) => {
    globalThis[globalName] = (...args) => callFocusRoomApi(apiName, args);
  });
}

function initFocusRoom(options = {}) {
  exposeFocusRoomGlobals();
  const mount = options.root || document.getElementById("focusRoomRoot");
  if (!mount) {
    throw new Error("Focus Room root element was not found.");
  }
  if (focusRoomRoot) return;
  focusRoomRoot = createRoot(mount);
  focusRoomRoot.render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(
        QueryClientProvider,
        { client: focusRoomQueryClient },
        React.createElement(
          HashRouter,
          null,
          React.createElement(FocusRoomPage)
        )
      )
    )
  );
}

export { initFocusRoom };
