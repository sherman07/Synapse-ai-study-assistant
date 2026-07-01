import { FileText, Sparkles } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { GlassButton } from "./GlassButton.jsx";

export function FocusWorkspaceNotes({ onWorkspace }) {
  const material = useFocusRoomStore(state => state.selectedMaterial);
  const workspaceNotes = useFocusRoomStore(state => state.workspaceNotes);
  const workspaceUpdatedAt = useFocusRoomStore(state => state.workspaceUpdatedAt);
  const setWorkspaceNotes = useFocusRoomStore(state => state.setWorkspaceNotes);
  const openStudyPanel = useFocusRoomStore(state => state.openStudyPanel);

  const updatedLabel = workspaceUpdatedAt
    ? `Autosaved ${new Date(workspaceUpdatedAt).toLocaleString()}`
    : "Autosave on";

  return (
    <section className="study-tool-stack">
      <article className="study-card liquid-glass-lite focus-notes-card">
        <div className="study-tool-head">
          <div>
            <span className="focus-kicker">Workspace Notes</span>
            <h3>{material?.materialTitle || "Study notes"}</h3>
          </div>
          <span className="focus-pill"><FileText size={14} aria-hidden="true" /> {updatedLabel}</span>
        </div>
        <textarea
          className="answer-input focus-notes-textarea"
          placeholder="Capture connections, revision cues, questions, and mistakes while you study..."
          value={workspaceNotes}
          onChange={event => setWorkspaceNotes(event.target.value)}
        />
        <div className="focus-button-row">
          <GlassButton variant="primary" onClick={() => openStudyPanel("materials")}>
            <Sparkles size={16} aria-hidden="true" /> Back to materials
          </GlassButton>
          <GlassButton onClick={() => onWorkspace?.(material?.materialId || "", "assistant")}>
            Open full workspace
          </GlassButton>
        </div>
      </article>
    </section>
  );
}
