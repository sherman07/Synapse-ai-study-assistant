import { motion } from "motion/react";
import { Play, RotateCcw, SkipForward } from "lucide-react";
import { formatFocusRoomDuration } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { formatTimerClock, progressPercent } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

function timerActionLabel(status) {
  if (status === "paused") return "Resume";
  if (status === "completed") return "Restart";
  return "Start";
}

export function TimerCard() {
  const elapsedSeconds = useFocusRoomStore(state => state.elapsedSeconds);
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const timerStatus = useFocusRoomStore(state => state.timerStatus);
  const isIdle = useFocusRoomStore(state => state.isIdle);
  const musicType = useFocusRoomStore(state => state.musicType);
  const ambientSound = useFocusRoomStore(state => state.ambientSound);
  const startTimer = useFocusRoomStore(state => state.startTimer);
  const pauseTimer = useFocusRoomStore(state => state.pauseTimer);
  const resetTimer = useFocusRoomStore(state => state.resetTimer);
  const skipTimer = useFocusRoomStore(state => state.skipTimer);
  const remaining = Math.max(0, pomodoroDuration * 60 - elapsedSeconds);
  const progress = progressPercent(elapsedSeconds, pomodoroDuration);
  const timerScale = isIdle ? 0.96 : 1;
  const timerAnimate = timerStatus === "studying"
    ? { scale: [timerScale, timerScale + 0.012, timerScale] }
    : { scale: timerScale };

  return (
    <motion.article
      className="timer-card liquid-glass"
      animate={timerAnimate}
      transition={timerStatus === "studying" ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    >
      <span className="focus-kicker">Pomodoro #1 / {timerStatus}</span>
      <p className="focus-pill">{musicType} / {ambientSound}</p>
      <div className="timer-value" aria-live="polite">{formatTimerClock(remaining)}</div>
      <p>{formatFocusRoomDuration(elapsedSeconds)} focused of {pomodoroDuration}m</p>
      <div className="focus-progress-track" aria-label="Focus progress">
        <div className="focus-progress-fill" style={{ width: `${progress.toFixed(1)}%` }} />
      </div>
      <div className="timer-actions">
        <GlassButton variant={timerStatus === "studying" ? "primary" : "ghost"} onClick={startTimer}>
          <Play size={16} aria-hidden="true" /> {timerActionLabel(timerStatus)}
        </GlassButton>
        <GlassButton onClick={() => pauseTimer()}>Pause</GlassButton>
        <GlassButton onClick={resetTimer}><RotateCcw size={16} aria-hidden="true" /> Reset</GlassButton>
        <GlassButton onClick={skipTimer}><SkipForward size={16} aria-hidden="true" /> Skip</GlassButton>
      </div>
    </motion.article>
  );
}
