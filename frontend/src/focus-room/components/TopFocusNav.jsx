import { BookOpenText, Brain, History, Layers, Music2, NotebookPen, Quote, Square } from "lucide-react";
import { currentScene } from "../utils.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { GlassButton } from "./GlassButton.jsx";

export function TopFocusNav({ onWorkspace, onHistory }) {
  const material = useFocusRoomStore(state => state.selectedMaterial);
  const selectedScene = useFocusRoomStore(state => state.selectedScene);
  const panelTab = useFocusRoomStore(state => state.panelTab);
  const aiPanelOpen = useFocusRoomStore(state => state.aiPanelOpen);
  const openDrawer = useFocusRoomStore(state => state.openDrawer);
  const openStudyPanel = useFocusRoomStore(state => state.openStudyPanel);
  const endSession = useFocusRoomStore(state => state.endSession);
  const scene = currentScene(selectedScene);
  const sourceCount = material?.sourceHighlights?.length || material?.sourceItems?.length || material?.sources?.length || 0;
  const sectionCount = Object.keys(material?.sections || {}).length || material?.studyHeadings?.length || 1;
  const isActive = tab => aiPanelOpen && panelTab === tab;

  return (
    <header className="top-nav">
      <div className="focus-brand">
        <span className="focus-kicker">Synapse Focus Room</span>
        <strong>{scene.name}</strong>
        <small>{material?.materialTitle || "Study material"} · {sectionCount} section{sectionCount === 1 ? "" : "s"} · {sourceCount} source{sourceCount === 1 ? "" : "s"}</small>
      </div>
      <nav className="top-nav-actions" aria-label="Focus Room controls">
        <GlassButton className="focus-command-btn" onClick={() => openDrawer("scene")} title="Change scene"><Layers size={16} aria-hidden="true" /> <span>Scene</span></GlassButton>
        <GlassButton className="focus-command-btn" onClick={() => openDrawer("music")} title="Sound controls"><Music2 size={16} aria-hidden="true" /> <span>Sound</span></GlassButton>
        <GlassButton className={`focus-command-btn ${isActive("materials") ? "is-active" : ""}`.trim()} onClick={() => openStudyPanel("materials")} title="Open material overview"><BookOpenText size={16} aria-hidden="true" /> <span>Materials</span></GlassButton>
        <GlassButton className={`focus-command-btn ${isActive("notes") ? "is-active" : ""}`.trim()} onClick={() => openStudyPanel("notes")} title="Read generated notes"><NotebookPen size={16} aria-hidden="true" /> <span>Notes</span></GlassButton>
        <GlassButton className={`focus-command-btn ${isActive("sources") ? "is-active" : ""}`.trim()} onClick={() => openStudyPanel("sources")} title="Open source highlights"><Quote size={16} aria-hidden="true" /> <span>Sources</span></GlassButton>
        <GlassButton className={`focus-command-btn ${isActive("chat") ? "is-active" : ""}`.trim()} onClick={() => openStudyPanel("chat")} title="Open Study Suite"><Brain size={16} aria-hidden="true" /> <span>Study Suite</span></GlassButton>
        <GlassButton className={`focus-command-btn ${isActive("history") ? "is-active" : ""}`.trim()} onClick={() => openStudyPanel("history")} title="Open history"><History size={16} aria-hidden="true" /> <span>History</span></GlassButton>
        <GlassButton className="focus-command-btn" variant="danger" onClick={endSession} title="End focus session"><Square size={16} aria-hidden="true" /> <span>End</span></GlassButton>
      </nav>
    </header>
  );
}
