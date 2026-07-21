import { Minimize2 } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { formatTimerClock } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function CompactFocusTimer({ onExit }) {
  const elapsedSeconds = useFocusRoomStore(state => state.elapsedSeconds);
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const timerDurationSeconds = useFocusRoomStore(state => state.timerDurationSeconds);
  const timerMode = useFocusRoomStore(state => state.timerMode);
  const timerStatus = useFocusRoomStore(state => state.timerStatus);
  const currentSession = useFocusRoomStore(state => state.currentSession);
  const totalDurationSeconds = Number(timerDurationSeconds) || (Number(pomodoroDuration) || 0) * 60;
  const remaining = timerMode === "countup" ? elapsedSeconds : Math.max(0, totalDurationSeconds - elapsedSeconds);
  return (
    <div className="compact-focus-mode-card" aria-label="Distraction-free focus timer">
      <div className="compact-focus-card-top"><span>POMODORO #{currentSession?.pomodoroNumber || 1}</span><GlassButton className="compact-exit-button" onClick={onExit} aria-label="Exit Focus Mode"><Minimize2 size={14} aria-hidden="true" /></GlassButton></div>
      <span className="compact-focus-status"><i />{timerStatus === "paused" ? "Paused" : "In focus"}</span>
      <strong>{formatTimerClock(remaining)}</strong>
      <div className="compact-focus-progress"><span style={{ width: `${totalDurationSeconds ? Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100)) : 0}%` }} /></div>
      <small>{pomodoroDuration} min session</small>
      <span className="sr-only">Press Escape to exit Focus Mode.</span>
    </div>
  );
}
