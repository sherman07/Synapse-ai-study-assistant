import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { AnimatePresence, motion } from "motion/react";
import { clearFocusRoomActiveSession, saveFocusRoomActiveSession } from "../data.js";
import { FocusBackground } from "./FocusBackground.jsx";
import { FocusRoomSetup } from "./FocusRoomSetup.jsx";
import { PomodoroTimer } from "./PomodoroTimer.jsx";
import { TopFocusNav } from "./TopFocusNav.jsx";
import { BottomControlDock } from "./BottomControlDock.jsx";
import { AILearningPanel } from "./AILearningPanel.jsx";
import { SessionSummaryModal } from "./SessionSummaryModal.jsx";
import { SessionOverviewCard } from "./SessionOverviewCard.jsx";
import { StudyHistoryPanel } from "./StudyHistoryPanel.jsx";
import { FocusRoomDrawers } from "./FocusRoomDrawers.jsx";
import { useAudioSettings } from "../hooks/useAudioSettings.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { useFocusSession } from "../hooks/useFocusSession.js";
import { useIdleMode } from "../hooks/useIdleMode.js";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer.js";
import { useSceneBackground } from "../hooks/useSceneBackground.js";
import { useStudyMaterial } from "../hooks/useStudyMaterial.js";
import { parseFocusPath, spring } from "../utils.js";

function activeSessionSnapshot(state) {
  const materialId = String(state.selectedMaterial?.materialId || state.selectedMaterialId || "");
  if (!materialId || state.view !== "session" || state.summaryRecord) return null;
  return {
    materialId,
    view: state.view,
    panelTab: state.panelTab,
    selectedScene: state.selectedScene,
    musicType: state.musicType,
    ambientSound: state.ambientSound,
    musicVolume: state.musicVolume,
    ambientVolume: state.ambientVolume,
    pomodoroDuration: state.pomodoroDuration,
    timerStatus: state.timerStatus,
    studyGoal: state.studyGoal,
    studyPlan: state.studyPlan,
    currentSession: state.currentSession,
    elapsedSeconds: state.elapsedSeconds,
    startedAt: state.startedAt,
    completedTasks: state.completedTasks,
    flashcardIndex: state.flashcardIndex,
    flashcardSide: state.flashcardSide,
    flashcardProgress: state.flashcardProgress,
    quizAnswers: state.quizAnswers,
    quizChecked: state.quizChecked,
    workspaceNotes: state.workspaceNotes,
    workspaceUpdatedAt: state.workspaceUpdatedAt,
    activeNoteSection: state.activeNoteSection,
    activeSourceHighlight: state.activeSourceHighlight,
    assistantContext: state.assistantContext,
    chatMessages: state.chatMessages
  };
}

export function FocusRoomPage() {
  const [hashPath, setHashPath] = useState(() => hashToPath());
  useEffect(() => {
    const update = () => setHashPath(hashToPath());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const route = useMemo(() => parseFocusPath(hashPath), [hashPath]);
  const view = useFocusRoomStore(state => state.view);
  const isIdle = useIdleMode(3000);
  const scene = useSceneBackground();
  const audioState = useAudioSettings();
  const session = useFocusSession();
  useStudyMaterial(route);
  usePomodoroTimer();
  const persistenceSnapshot = useFocusRoomStore(useShallow(activeSessionSnapshot));
  const selectedMaterialId = useFocusRoomStore(state => state.selectedMaterialId);
  const summaryRecord = useFocusRoomStore(state => state.summaryRecord);

  useEffect(() => {
    if (!persistenceSnapshot?.materialId) return;
    saveFocusRoomActiveSession(persistenceSnapshot.materialId, persistenceSnapshot);
  }, [persistenceSnapshot]);

  useEffect(() => {
    if (!selectedMaterialId || view === "session" && !summaryRecord) return;
    clearFocusRoomActiveSession(selectedMaterialId);
  }, [selectedMaterialId, summaryRecord, view]);

  const showHistory = () => {
    globalThis.location.hash = "#/study-history";
  };

  const showWorkspace = (...args) => {
    session.returnToWorkspace(...args);
  };

  return (
    <main
      id="focusRoomSurface"
      className={`focus-room-surface react-focus-room ${isIdle ? "is-idle" : ""}`.trim()}
      aria-live="polite"
    >
      <FocusBackground scene={scene} />
      <AnimatePresence mode="wait">
        {view === "history" ? (
          <motion.div
            key="history"
            className="focus-room-view focus-history-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring}
          >
            <StudyHistoryPanel onWorkspace={showWorkspace} />
          </motion.div>
        ) : view === "session" ? (
          <motion.div
            key="session"
            className="focus-room-view focus-session-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring}
          >
            <TopFocusNav onWorkspace={showWorkspace} onHistory={showHistory} />
            <section className="focus-session-stage">
              <div className="focus-session-grid">
                <SessionOverviewCard />
                <PomodoroTimer />
              </div>
            </section>
            <BottomControlDock audioState={audioState} />
            <FocusRoomDrawers audioState={audioState} />
            <AILearningPanel onWorkspace={showWorkspace} />
            <SessionSummaryModal onWorkspace={showWorkspace} onHistory={showHistory} />
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            className="focus-room-view focus-room-setup-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring}
          >
            <FocusRoomSetup audioState={audioState} onWorkspace={showWorkspace} onHistory={showHistory} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function hashToPath() {
  const hash = String(globalThis.location?.hash || "#/focus-room");
  return hash.replace(/^#/, "") || "/focus-room";
}
