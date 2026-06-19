import { motion } from "motion/react";
import { BookOpenText, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
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
  const material = useFocusRoomStore(state => state.selectedMaterial);
  const studyGoal = useFocusRoomStore(state => state.studyGoal);
  const completedTasks = useFocusRoomStore(state => state.completedTasks);
  const studyPlan = useFocusRoomStore(state => state.studyPlan);
  const musicType = useFocusRoomStore(state => state.musicType);
  const ambientSound = useFocusRoomStore(state => state.ambientSound);
  const startTimer = useFocusRoomStore(state => state.startTimer);
  const pauseTimer = useFocusRoomStore(state => state.pauseTimer);
  const resetTimer = useFocusRoomStore(state => state.resetTimer);
  const skipTimer = useFocusRoomStore(state => state.skipTimer);
  const openStudyPanel = useFocusRoomStore(state => state.openStudyPanel);
  const remaining = Math.max(0, pomodoroDuration * 60 - elapsedSeconds);
  const progress = progressPercent(elapsedSeconds, pomodoroDuration);
  const timerScale = isIdle ? 0.96 : 1;
  const timerAnimate = timerStatus === "studying"
    ? { scale: [timerScale, timerScale + 0.012, timerScale] }
    : { scale: timerScale };
  const nextTask = studyPlan.find(item => !completedTasks.includes(item.task))?.task || "Review your strongest and weakest ideas.";

  return (
    <motion.article
      className="timer-card liquid-glass"
      animate={timerAnimate}
      transition={timerStatus === "studying" ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    >
      <span className="focus-kicker">Focus Block / {timerStatus}</span>
      <div className="timer-card-head">
        <div>
          <h2>{studyGoal || `Study ${material?.materialTitle || "this material"}`}</h2>
          <p>{material?.materialTitle || "Study material"}</p>
        </div>
        <div className="timer-pill-row">
          <span className="focus-pill">{musicType} / {ambientSound}</span>
          <span className="focus-pill"><BookOpenText size={14} aria-hidden="true" /> {completedTasks.length}/{studyPlan.length || 0} tasks</span>
        </div>
      </div>
      <div className="timer-value" aria-live="polite">{formatTimerClock(remaining)}</div>
      <div className="timer-meta-grid">
        <div className="timer-meta-card">
          <span>Focused</span>
          <strong>{formatFocusRoomDuration(elapsedSeconds)}</strong>
        </div>
        <div className="timer-meta-card">
          <span>Block</span>
          <strong>{pomodoroDuration}m</strong>
        </div>
        <div className="timer-meta-card">
          <span>Next</span>
          <strong>{nextTask}</strong>
        </div>
      </div>
      <div className="focus-progress-track" aria-label="Focus progress">
        <div className="focus-progress-fill" style={{ width: `${progress.toFixed(1)}%` }} />
      </div>
      <div className="timer-actions">
        <GlassButton variant={timerStatus === "studying" ? "primary" : "ghost"} onClick={startTimer}>
          <Play size={16} aria-hidden="true" /> {timerActionLabel(timerStatus)}
        </GlassButton>
        <GlassButton onClick={() => pauseTimer()}><Pause size={16} aria-hidden="true" /> Pause</GlassButton>
        <GlassButton onClick={() => openStudyPanel("materials")}>Materials</GlassButton>
        <GlassButton onClick={resetTimer}><RotateCcw size={16} aria-hidden="true" /> Reset</GlassButton>
        <GlassButton onClick={skipTimer}><SkipForward size={16} aria-hidden="true" /> Skip</GlassButton>
      </div>
    </motion.article>
  );
}
