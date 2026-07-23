import { useCallback, useEffect, useMemo } from "react";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function useFocusSession() {
  const store = useFocusRoomStore();
  const returnToWorkspace = useCallback(async (materialId = "", action = "", target = {}) => {
    store.pauseTimer({ pauseAudio: true });
    store.closeSummary();
    const explicitMaterialId = typeof materialId === "string" || typeof materialId === "number"
      ? materialId
      : "";
    const explicitAction = typeof action === "string" ? action : "";
    const workspaceTarget = normalizeWorkspaceTarget(explicitAction, target);
    const returnMaterialId = String(explicitMaterialId || store.selectedMaterialId || store.selectedMaterial?.materialId || "");
    if (typeof globalThis.returnFromFocusRoomToWorkspace === "function") {
      try {
        const result = globalThis.returnFromFocusRoomToWorkspace(returnMaterialId, workspaceTarget);
        if (result && typeof result.then === "function") {
          await result;
        }
        runWorkspaceAction(workspaceTarget.action || explicitAction, workspaceTarget);
        return;
      } catch (error) {
        console.error("Could not return from Focus Room:", error);
      }
    }
    globalThis.location.hash = "";
    runWorkspaceAction(workspaceTarget.action || explicitAction, workspaceTarget);
  }, [store]);

  const api = useMemo(() => ({
      answerFocusQuizQuestion: store.answerQuizQuestion,
      askFocusAssistant: store.askAssistant,
      checkFocusQuizQuestion: store.checkQuizQuestion,
      closeFocusSummary: store.closeSummary,
      endFocusRoomSession: store.endSession,
      returnToFocusRoomSetup: store.returnToSetup,
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
        store.openStudyPanel("history");
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
  if (["flashcards", "quiz", "assistant", "mindmap", "timeline", "source", "notes"].includes(value)) {
    return value;
  }
  return "";
}

function normalizeWorkspaceTarget(action, target = {}) {
  const objectTarget = target && typeof target === "object" && !Array.isArray(target) ? target : {};
  const normalizedAction = normalizeWorkspaceAction(action || objectTarget.action);
  return {
    ...objectTarget,
    action: normalizedAction,
    sourceId: String(objectTarget.sourceId || objectTarget.source_id || ""),
    sourceIndex: Number(objectTarget.sourceIndex || objectTarget.source_index || 0) || 0,
    sourceLabel: String(objectTarget.sourceLabel || objectTarget.source_label || ""),
    sectionTitle: String(objectTarget.sectionTitle || objectTarget.section_title || ""),
    highlightId: String(objectTarget.highlightId || objectTarget.highlight_id || ""),
    excerpt: String(objectTarget.excerpt || "").slice(0, 1600)
  };
}

function runWorkspaceAction(action, target = {}) {
  const nextAction = normalizeWorkspaceAction(action);
  if (!nextAction) return;

  const run = () => {
    if (nextAction === "source") {
      if (typeof globalThis.toggleSourceViewer === "function") {
        globalThis.toggleSourceViewer(true);
      }
      if (target.sourceId && typeof globalThis.selectSourceItem === "function") {
        globalThis.selectSourceItem(target.sourceId);
      }
      return;
    }

    if (nextAction === "notes") {
      if (typeof globalThis.showFullSummary === "function") {
        globalThis.showFullSummary();
      }
      return;
    }

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
