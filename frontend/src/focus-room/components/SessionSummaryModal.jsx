import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { formatFocusRoomDuration } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { focusFlashcards, focusQuizQuestions } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function SessionSummaryModal({ onWorkspace, onHistory }) {
  const record = useFocusRoomStore(state => state.summaryRecord);
  const material = useFocusRoomStore(state => state.selectedMaterial);
  const closeSummary = useFocusRoomStore(state => state.closeSummary);
  const openStudyPanel = useFocusRoomStore(state => state.openStudyPanel);
  const startTimer = useFocusRoomStore(state => state.startTimer);
  const openHistory = () => {
    closeSummary();
    openStudyPanel("history");
  };
  const openWorkspace = () => {
    closeSummary();
    onWorkspace?.();
  };
  const flashcards = focusFlashcards(material);
  const questions = focusQuizQuestions(material);

  return (
    <Dialog.Root open={Boolean(record)} onOpenChange={open => !open && closeSummary()}>
      <AnimatePresence>
        {record ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="summary-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.article
                className="summary-card liquid-glass"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
              >
                <span className="focus-kicker">Session complete</span>
                <Dialog.Title>{record.materialTitle}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Summary of focus time, flashcards, quiz score, completed tasks, and recommended next step.
                </Dialog.Description>
                <p>{record.aiReflection}</p>
                <div className="summary-grid">
                  <div className="summary-stat liquid-glass-lite">
                    <span>Focus time</span>
                    <strong>{formatFocusRoomDuration(record.totalFocusTime)}</strong>
                  </div>
                  <div className="summary-stat liquid-glass-lite">
                    <span>Flashcards</span>
                    <strong>{record.flashcardsCompleted}</strong>
                  </div>
                  <div className="summary-stat liquid-glass-lite">
                    <span>Quiz score</span>
                    <strong>{record.quizScore === null ? "N/A" : `${record.quizScore}%`}</strong>
                  </div>
                  <div className="summary-stat liquid-glass-lite">
                    <span>Tasks</span>
                    <strong>{record.completedTasks.length}</strong>
                  </div>
                </div>
                {record.mistakesMade.length ? <p>Review: {record.mistakesMade.join("; ")}</p> : null}
                {record.persisted === false ? <p>This session is visible for now, but could not be saved to this device history.</p> : null}
                <p>{record.recommendedNextStep}</p>
                <div className="focus-button-row">
                  <GlassButton variant="primary" onClick={() => { closeSummary(); startTimer(); }}>Continue studying</GlassButton>
                  <GlassButton onClick={() => { closeSummary(); openStudyPanel(questions.length ? "quiz" : "materials"); }}>Start quiz</GlassButton>
                  <GlassButton onClick={() => { closeSummary(); openStudyPanel(flashcards.length ? "flashcards" : "materials"); }}>Review flashcards</GlassButton>
                  <GlassButton onClick={() => { closeSummary(); openStudyPanel(material?.mindMap ? "mindmap" : "materials"); }}>Open mind map</GlassButton>
                  <GlassButton onClick={openHistory}>View History</GlassButton>
                  <GlassButton onClick={openWorkspace}>Workspace</GlassButton>
                </div>
              </motion.article>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
