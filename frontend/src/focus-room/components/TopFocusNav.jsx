import { Brain, History, Layers, Library, Music2, PanelRightOpen, Square, Target } from "lucide-react";
import { currentScene } from "../utils.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { GlassButton } from "./GlassButton.jsx";

export function TopFocusNav({ onWorkspace, onHistory }) {
  const material = useFocusRoomStore(state => state.selectedMaterial);
  const selectedScene = useFocusRoomStore(state => state.selectedScene);
  const openDrawer = useFocusRoomStore(state => state.openDrawer);
  const toggleAIPanel = useFocusRoomStore(state => state.toggleAIPanel);
  const endSession = useFocusRoomStore(state => state.endSession);
  const scene = currentScene(selectedScene);

  return (
    <header className="top-nav">
      <div className="focus-brand">
        <span className="focus-kicker">Synapse Focus Room</span>
        <strong>{scene.name}</strong>
        <small>{material?.materialTitle || "Study material"}</small>
      </div>
      <nav className="top-nav-actions" aria-label="Focus Room controls">
        <GlassButton onClick={() => openDrawer("scene")}><Layers size={16} aria-hidden="true" /> Scene</GlassButton>
        <GlassButton onClick={() => openDrawer("music")}><Music2 size={16} aria-hidden="true" /> Music</GlassButton>
        <GlassButton onClick={() => openDrawer("plan")}><Target size={16} aria-hidden="true" /> Plan</GlassButton>
        <GlassButton onClick={() => openDrawer("materials")}><Library size={16} aria-hidden="true" /> Materials</GlassButton>
        <GlassButton onClick={toggleAIPanel}><Brain size={16} aria-hidden="true" /> AI Learning Panel</GlassButton>
        <GlassButton onClick={() => onWorkspace()}><PanelRightOpen size={16} aria-hidden="true" /> Workspace</GlassButton>
        <GlassButton onClick={onHistory}><History size={16} aria-hidden="true" /> Study History</GlassButton>
        <GlassButton variant="danger" onClick={endSession}><Square size={16} aria-hidden="true" /> End</GlassButton>
      </nav>
    </header>
  );
}
