import { motion } from "motion/react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { formatTimerClock } from "../utils.js";
import { EditableTimer } from "./EditableTimer.jsx";

function blockProgress(elapsedSeconds, totalSeconds) {
  if (!totalSeconds) return 0;
  return Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));
}

export function TimerCard() {
  const elapsedSeconds = useFocusRoomStore(state => state.elapsedSeconds);
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const pomodoroDurationSeconds = useFocusRoomStore(state => state.pomodoroDurationSeconds);
  const timerStatus = useFocusRoomStore(state => state.timerStatus);
  const timerMode = useFocusRoomStore(state => state.timerMode);
  const isIdle = useFocusRoomStore(state => state.isIdle);
  const currentSession = useFocusRoomStore(state => state.currentSession);
  const setPomodoroDurationSeconds = useFocusRoomStore(state => state.setPomodoroDurationSeconds);

  const isRunning = timerStatus === "studying";
  const isPaused = timerStatus === "paused";
  const isComplete = timerStatus === "completed";
  const canEditTime = timerStatus === "idle" && timerMode !== "countup";
  const totalSeconds = Number(pomodoroDurationSeconds) || (Number(pomodoroDuration) || 0) * 60;
  const remaining = timerMode === "countup"
    ? elapsedSeconds
    : Math.max(0, totalSeconds - elapsedSeconds);
  const displaySeconds = isComplete && timerMode !== "countup" ? 0 : remaining;
  const statusLabel = isPaused ? "Paused" : isComplete ? "Complete" : isRunning ? "In focus" : "Ready";
  const timerScale = isIdle ? 0.97 : 1;
  const timerAnimate = isRunning
    ? { scale: [timerScale, timerScale + 0.01, timerScale], opacity: 1 }
    : { scale: timerScale, opacity: 1 };

  return (
    <motion.article
      className="timer-card floating-pomodoro liquid-glass"
      animate={timerAnimate}
      transition={isRunning ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25 }}
      aria-label="Focus timer"
    >
      <div className="floating-pomodoro-top">
        <span className="dock-eyebrow">POMODORO #{currentSession?.pomodoroNumber || 1}</span>
      </div>
      <div className="dock-status floating-pomodoro-status">
        <span className={`dock-status-dot ${isPaused || !isRunning ? "is-paused" : ""}`} />
        {statusLabel}
      </div>
      {canEditTime ? (
        <EditableTimer
          className="floating-pomodoro-editor"
          valueSeconds={totalSeconds}
          onChange={setPomodoroDurationSeconds}
          size="float"
          ariaLabel="Set focus block length"
        />
      ) : (
        <strong className="floating-pomodoro-time" aria-live="polite">{formatTimerClock(displaySeconds)}</strong>
      )}
      <div className="floating-pomodoro-progress" aria-hidden="true">
        <span style={{ width: `${blockProgress(elapsedSeconds, totalSeconds)}%` }} />
      </div>
    </motion.article>
  );
}
