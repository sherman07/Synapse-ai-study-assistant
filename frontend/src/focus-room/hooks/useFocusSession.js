import { useCallback, useEffect, useMemo } from "react";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function useFocusSession() {
  const store = useFocusRoomStore();
  const returnToWorkspace = useCallback(async (materialId = "", action = "") => {
    store.pauseTimer({ pauseAudio: true });
    store.closeSummary();
    const explicitMaterialId = typeof materialId === "string" || typeof materialId === "number"
      ? materialId
      : "";
    const explicitAction = typeof action === "string" ? action : "";
    const returnMaterialId = String(explicitMaterialId || store.selectedMaterialId || store.selectedMaterial?.materialId || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace === "function") {
      try {
        const result = globalThis.returnFromFocusRoomToWorkspace(returnMaterialId);
        if (result && typeof result.then === "function") {
          await result;
        }
        runWorkspaceAction(explicitAction);
        return;
      } catch (error) {
        console.error("Could not return from Focus Room:", error);
      }
    }
    globalThis.location.hash = "";
    runWorkspaceAction(explicitAction);
  }, [store]);

  const api = useMemo(() => ({
      answerFocusQuizQuestion: store.answerQuizQuestion,
      askFocusAssistant: store.askAssistant,
      checkFocusQuizQuestion: store.checkQuizQuestion,
      closeFocusSummary: store.closeSummary,
      endFocusRoomSession: store.endSession,
      flipFocusFlashcard: store.flipFlashcard,
      pauseFocusRoomTimer: store.pauseTimer,
      rateFocusFlashcard: store.rateFlashcard,
      resetFocusRoomTimer: store.resetTimer,
      returnFromFocusRoom: returnToWorkspace,
      selectFocusScene: store.selectScene,
      setFocusDuration: store.setPomodoroDuration,
      setFocusFlashcardIndex: store.setFlashcardIndex,
      setFocusPanelTab: store.setPanelTab,
      showFocusStudyHistory: () => {
        globalThis.location.hash = "#/study-history";
      },
      skipFocusRoomTimer: store.skipTimer,
      startFocusRoomSession: store.startSession,
      startFocusRoomTimer: store.startTimer,
      toggleFocusRoomAudioPlayback: store.toggleAudio,
      toggleFocusLearningPanel: store.toggleAIPanel,
      toggleFocusTask: store.toggleTask,
      updateFocusPlanTask: store.updatePlanTask,
      updateFocusGoal: store.setStudyGoal,
      updateFocusSound: store.setSound
    }), [returnToWorkspace, store]);

  globalThis.__synapseFocusRoomApi = api;

  useEffect(() => {
    globalThis.__synapseFocusRoomApi = api;
  }, [api]);

  return {
    ...store,
    returnToWorkspace
  };
}

function normalizeWorkspaceAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (["flashcards", "quiz", "assistant", "mindmap", "timeline"].includes(value)) {
    return value;
  }
  return "";
}

function runWorkspaceAction(action) {
  const nextAction = normalizeWorkspaceAction(action);
  if (!nextAction) return;

  const run = () => {
    if (nextAction === "assistant") {
      if (typeof globalThis.openAssistant === "function") {
        globalThis.openAssistant();
      }
      return;
    }

    if (typeof globalThis.switchTool === "function") {
      globalThis.switchTool(nextAction);
    }
  };

  if (typeof globalThis.requestAnimationFrame === "function") {
    globalThis.requestAnimationFrame(run);
  } else {
    setTimeout(run, 0);
  }
}
