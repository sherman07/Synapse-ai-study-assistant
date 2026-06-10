import { formatFocusRoomDuration } from "../data.js";
import { useSessionHistory } from "../hooks/useSessionHistory.js";
import { GlassButton } from "./GlassButton.jsx";
import { LiquidGlass } from "./LiquidGlass.jsx";

export function StudyHistoryPanel({ onWorkspace }) {
  const { data: sessions = [] } = useSessionHistory();

  return (
    <section className="history-stage">
      <LiquidGlass className="history-main">
        <span className="focus-kicker">Synapse Focus Room</span>
        <h1>Study History</h1>
        <p>Review recent Focus Room sessions saved on this device.</p>
        <div className="history-list">
          {sessions.length ? sessions.map(session => {
            const date = session.sessionDate || session.endedAt || session.startedAt || "";
            const readableDate = date ? new Date(date).toLocaleString() : "Saved session";
            return (
              <article className="history-row liquid-glass-lite" key={session.sessionId}>
                <strong>{session.materialTitle || "Study material"}</strong>
                <span>{readableDate} / {formatFocusRoomDuration(session.totalFocusTime || 0)}</span>
                {session.studyGoal ? <p>{session.studyGoal}</p> : null}
                {session.persisted === false ? <p>Not saved to device history</p> : null}
              </article>
            );
          }) : <p>No Focus Room sessions saved yet.</p>}
        </div>
      </LiquidGlass>
      <LiquidGlass className="history-next">
        <h2>Next step</h2>
        <p>Choose a material from the workspace to start another protected study block.</p>
        <GlassButton variant="primary" onClick={() => onWorkspace()}>Open Workspace</GlassButton>
      </LiquidGlass>
    </section>
  );
}
