import { Minimize2 } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { formatDuration } from "../timerInput.js";
import { formatTimerClock } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

function blockProgress(elapsedSeconds, totalSeconds) {
  if (!totalSeconds) return 0;
  return Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));
}

export function CompactFocusTimer({ onExit }) {
  const elapsedSeconds = useFocusRoomStore(state => state.elapsedSeconds);
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const pomodoroDurationSeconds = useFocusRoomStore(state => state.pomodoroDurationSeconds);
  const timerMode = useFocusRoomStore(state => state.timerMode);
  const timerStatus = useFocusRoomStore(state => state.timerStatus);
  const currentSession = useFocusRoomStore(state => state.currentSession);
  const totalSeconds = Number(pomodoroDurationSeconds) || (Number(pomodoroDuration) || 0) * 60;
  const remaining = timerMode === "countup" ? elapsedSeconds : Math.max(0, totalSeconds - elapsedSeconds);
  return (
    <div className="compact-focus-mode-card" aria-label="Distraction-free focus timer">
      <div className="compact-focus-card-top"><span>POMODORO #{currentSession?.pomodoroNumber || 1}</span><GlassButton className="compact-exit-button" onClick={onExit} aria-label="Exit Focus Mode"><Minimize2 size={14} aria-hidden="true" /></GlassButton></div>
      <span className="compact-focus-status"><i />{timerStatus === "paused" ? "Paused" : "In focus"}</span>
      <strong>{formatTimerClock(remaining)}</strong>
      <div className="compact-focus-progress"><span style={{ width: `${blockProgress(elapsedSeconds, totalSeconds)}%` }} /></div>
      <small>{formatDuration(totalSeconds)} session</small>
      <span className="sr-only">Press Escape to exit Focus Mode.</span>
    </div>
  );
}
