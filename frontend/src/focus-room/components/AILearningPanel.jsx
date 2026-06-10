import { Dialog, Tabs } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { getFocusRoomMaterials } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import {
  PANEL_TAB_LIST,
  focusFlashcards,
  focusQuizQuestions,
  panelTabLabel,
  spring
} from "../utils.js";
import { AIStudyChat } from "./AIStudyChat.jsx";
import { FlashcardStudyMode } from "./FlashcardStudyMode.jsx";
import { GlassButton } from "./GlassButton.jsx";
import { MindMapViewer } from "./MindMapViewer.jsx";
import { QuizStudyMode } from "./QuizStudyMode.jsx";

function WorkspaceReturn({ label, action, onWorkspace }) {
  const material = useFocusRoomStore(state => state.selectedMaterial);
  return (
    <div className="focus-button-row">
      <GlassButton variant="primary" onClick={() => onWorkspace(material?.materialId || "", action)}>
        {label}
      </GlassButton>
    </div>
  );
}

function PanelContent({ tab, onWorkspace }) {
  const material = useFocusRoomStore(state => state.selectedMaterial);
  const studyPlan = useFocusRoomStore(state => state.studyPlan);
  const openMaterial = materialId => {
    const suffix = materialId ? `/${encodeURIComponent(materialId)}` : "";
    globalThis.location.hash = `#/focus-room${suffix}`;
  };

  if (!material) return null;

  if (tab === "materials") {
    const materials = getFocusRoomMaterials();
    return (
      <div className="material-list">
        {materials.length ? materials.map(item => (
          <button className="material-row liquid-glass-lite" key={item.materialId} type="button" onClick={() => openMaterial(item.materialId)}>
            <strong>{item.materialTitle || "Study material"}</strong>
            <span>{item.materialType || "Generated notes"}</span>
          </button>
        )) : <p>No Focus Room materials are available yet.</p>}
      </div>
    );
  }

  if (tab === "flashcards") {
    const cards = focusFlashcards(material);
    if (!cards.length) {
      return (
        <article className="study-card liquid-glass-lite">
          <h3>Flashcards</h3>
          <p>No flashcards are attached to this material yet. Return to the workspace to generate a flashcard deck.</p>
          <WorkspaceReturn label="Open Flashcard Generator" action="flashcards" onWorkspace={onWorkspace} />
        </article>
      );
    }
    return (
      <>
        <FlashcardStudyMode cards={cards} />
        <WorkspaceReturn label="Open Flashcard Workspace" action="flashcards" onWorkspace={onWorkspace} />
      </>
    );
  }

  if (tab === "quiz") {
    const questions = focusQuizQuestions(material);
    if (!questions.length) {
      return (
        <article className="study-card liquid-glass-lite">
          <h3>Quiz</h3>
          <p>No saved quizzes are attached to this material yet. Return to the workspace to generate one.</p>
          <WorkspaceReturn label="Open Quiz Generator" action="quiz" onWorkspace={onWorkspace} />
        </article>
      );
    }
    return (
      <>
        <QuizStudyMode questions={questions} />
        <WorkspaceReturn label="Open Quiz Workspace" action="quiz" onWorkspace={onWorkspace} />
      </>
    );
  }

  if (tab === "mindmap") {
    return (
      <article className="study-card liquid-glass-lite">
        <h3>Mind Map</h3>
        <MindMapViewer mindMap={material.mindMap} />
        <WorkspaceReturn label="Open Mind Map Workspace" action="mindmap" onWorkspace={onWorkspace} />
      </article>
    );
  }

  if (tab === "chat") {
    return (
      <>
        <AIStudyChat />
        <WorkspaceReturn label="Open Workspace Assistant" action="assistant" onWorkspace={onWorkspace} />
      </>
    );
  }

  if (tab === "plan") {
    return (
      <article className="study-card liquid-glass-lite">
        <h3>Study Plan</h3>
        <ul className="plan-list">
          {studyPlan.map((item, index) => (
            <li key={`${item.task}-${index}`}>
              <strong>{item.minutes}m</strong>
              <span>{item.task}</span>
            </li>
          ))}
        </ul>
        <WorkspaceReturn label="Open Timeline Workspace" action="timeline" onWorkspace={onWorkspace} />
      </article>
    );
  }

  const summary = String(material.summaryText || material.aiSummary || "").slice(0, 900);
  return (
    <article className="study-card liquid-glass-lite">
      <h3>Material summary</h3>
      <p>{summary || "Study notes will appear here when Synapse has generated them."}</p>
    </article>
  );
}

export function AILearningPanel({ onWorkspace }) {
  const open = useFocusRoomStore(state => state.aiPanelOpen);
  const panelTab = useFocusRoomStore(state => state.panelTab);
  const toggleAIPanel = useFocusRoomStore(state => state.toggleAIPanel);
  const setPanelTab = useFocusRoomStore(state => state.setPanelTab);

  return (
    <Dialog.Root open={open} onOpenChange={toggleAIPanel}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="ai-panel-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.aside
                className="ai-learning-panel liquid-glass extra-panel"
                initial={{ opacity: 0, x: 42 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 42 }}
                transition={spring}
              >
                <div className="drawer-head">
                  <div>
                    <span className="focus-kicker">Synapse</span>
                    <Dialog.Title>AI Learning Panel</Dialog.Title>
                    <Dialog.Description className="sr-only">
                      Study the selected material with summary, flashcards, quiz, mind map, AI chat, and plan tabs.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <GlassButton aria-label="Close AI Learning Panel"><X size={16} aria-hidden="true" /></GlassButton>
                  </Dialog.Close>
                </div>
                <Tabs.Root className="ai-tabs" value={panelTab} onValueChange={setPanelTab}>
                  <Tabs.List className="ai-tab-row" aria-label="AI Learning Panel tabs">
                    {PANEL_TAB_LIST.map(tab => (
                      <Tabs.Trigger className="ai-tab-trigger" key={tab} value={tab}>
                        {panelTabLabel(tab)}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                  {PANEL_TAB_LIST.map(tab => (
                    <Tabs.Content className="ai-tab-content" key={tab} value={tab}>
                      <PanelContent tab={tab} onWorkspace={onWorkspace} />
                    </Tabs.Content>
                  ))}
                </Tabs.Root>
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
