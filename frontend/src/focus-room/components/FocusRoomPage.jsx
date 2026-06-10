import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FocusBackground } from "./FocusBackground.jsx";
import { FocusRoomSetup } from "./FocusRoomSetup.jsx";
import { PomodoroTimer } from "./PomodoroTimer.jsx";
import { TopFocusNav } from "./TopFocusNav.jsx";
import { BottomControlDock } from "./BottomControlDock.jsx";
import { AILearningPanel } from "./AILearningPanel.jsx";
import { StudyPlanDrawer } from "./StudyPlanDrawer.jsx";
import { MaterialPanel } from "./MaterialPanel.jsx";
import { WorkspacePanel } from "./WorkspacePanel.jsx";
import { SessionSummaryModal } from "./SessionSummaryModal.jsx";
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
              <PomodoroTimer />
            </section>
            <BottomControlDock audioState={audioState} />
            <FocusRoomDrawers audioState={audioState} />
            <StudyPlanDrawer />
            <MaterialPanel />
            <WorkspacePanel onWorkspace={showWorkspace} />
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
