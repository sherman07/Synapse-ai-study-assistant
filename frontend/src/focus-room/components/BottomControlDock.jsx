import { useState } from "react";
import { Pause, Play, RotateCcw, SkipForward, SlidersHorizontal, Volume2 } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { formatTimerClock } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function BottomControlDock({ onFocusMode, audioState }) {
  const timerStatus = useFocusRoomStore(state => state.timerStatus);
  const elapsedSeconds = useFocusRoomStore(state => state.elapsedSeconds);
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const timerDurationSeconds = useFocusRoomStore(state => state.timerDurationSeconds);
  const timerMode = useFocusRoomStore(state => state.timerMode);
  const studyGoal = useFocusRoomStore(state => state.studyGoal);
  const currentSession = useFocusRoomStore(state => state.currentSession);
  const startTimer = useFocusRoomStore(state => state.startTimer);
  const pauseTimer = useFocusRoomStore(state => state.pauseTimer);
  const resetTimer = useFocusRoomStore(state => state.resetTimer);
  const skipTimer = useFocusRoomStore(state => state.skipTimer);
  const setSessionDuration = useFocusRoomStore(state => state.setSessionDuration);
  const toggleAudio = useFocusRoomStore(state => state.toggleAudio);
  const audioPlaying = useFocusRoomStore(state => state.audioPlaying);
  const setStudyGoal = useFocusRoomStore(state => state.setStudyGoal);
  const [editingDuration, setEditingDuration] = useState(false);
  const [draftClock, setDraftClock] = useState("25:00");
  const [editingGoal, setEditingGoal] = useState(false);
  const [draftGoal, setDraftGoal] = useState("");
  const totalDurationSeconds = timerMode === "countup" ? 0 : Number(timerDurationSeconds) || (Number(pomodoroDuration) || 0) * 60;
  const remaining = timerMode === "countup" ? elapsedSeconds : Math.max(0, totalDurationSeconds - elapsedSeconds);
  const isPaused = timerStatus === "paused";
  const isRunning = timerStatus === "studying";
  const isComplete = timerStatus === "completed";
  const timerLabel = isComplete && timerMode !== "countup" ? "00:00" : formatTimerClock(remaining);
  const statusLabel = isPaused ? "Paused" : isComplete ? "Complete" : "In focus";
  const timerActionLabel = isPaused ? "Resume timer" : isRunning ? "Pause timer" : "Start timer";

  const openDurationEditor = () => {
    setDraftClock(timerLabel);
    setEditingDuration(true);
  };

  const applyDuration = () => {
    const [minutesText = "", secondsText = "0"] = String(draftClock).split(":");
    setSessionDuration(minutesText, secondsText);
    setEditingDuration(false);
  };

  const openGoalEditor = () => {
    setDraftGoal(studyGoal || "");
    setEditingGoal(true);
  };

  const applyGoal = () => {
    const nextGoal = draftGoal.trim();
    if (nextGoal) setStudyGoal(nextGoal);
    setEditingGoal(false);
  };

  return (
    <div className="focus-session-dock liquid-glass" aria-label="Focus session controls">
      <div className="dock-timer-block">
        <div className="dock-eyebrow">POMODORO #{currentSession?.pomodoroNumber || 1}</div>
        <div className="dock-status"><span className={`dock-status-dot ${isPaused ? "is-paused" : ""}`} />{statusLabel}</div>
        {editingDuration ? (
          <input
            autoFocus
            className="dock-time-input"
            type="text"
            inputMode="text"
            maxLength={6}
            value={draftClock}
            aria-label="Focus duration in minutes and seconds"
            onChange={event => setDraftClock(event.target.value.replace(/[^0-9:]/g, ""))}
            onFocus={event => event.currentTarget.select()}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyDuration();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                event.currentTarget.dataset.cancel = "true";
                setEditingDuration(false);
              }
            }}
            onBlur={event => {
              if (event.currentTarget.dataset.cancel !== "true") applyDuration();
            }}
          />
        ) : (
          <button type="button" className="dock-time-edit" onClick={openDurationEditor} aria-label={`Change focus duration, currently ${pomodoroDuration} minutes`} title="Click to change focus duration">
            <strong className="dock-time" aria-live="off">{timerLabel}</strong>
          </button>
        )}
        <div className="dock-progress" aria-hidden="true"><span style={{ width: `${totalDurationSeconds ? Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100)) : 0}%` }} /></div>
      </div>
      <div className="dock-goal-block">
        <span className="dock-eyebrow">TODAY'S GOAL</span>
        {editingGoal ? (
          <input
            autoFocus
            className="dock-goal-input"
            type="text"
            value={draftGoal}
            maxLength={140}
            aria-label="Edit today's goal"
            onChange={event => setDraftGoal(event.target.value)}
            onFocus={event => event.currentTarget.select()}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyGoal();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                event.currentTarget.dataset.cancel = "true";
                setEditingGoal(false);
              }
            }}
            onBlur={event => {
              if (event.currentTarget.dataset.cancel !== "true") applyGoal();
            }}
          />
        ) : (
          <button
            type="button"
            className="dock-goal-edit"
            onClick={openGoalEditor}
            aria-label={`Edit today's goal, currently ${studyGoal || "a quiet block for meaningful progress"}`}
            title="Click to edit today's goal"
          >
            <strong>{studyGoal || "A quiet block for meaningful progress"}</strong>
          </button>
        )}
        <span className="dock-goal-meta">{timerMode === "countup" ? "Count-up" : `${formatTimerClock(totalDurationSeconds)} session`} · {formatTimerClock(elapsedSeconds)} focused</span>
      </div>
      <div className="dock-action-block">
        <GlassButton className="dock-action-button" onClick={toggleAudio} aria-label={audioPlaying ? "Pause room audio" : "Play room audio"}>{audioPlaying ? <Pause size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}<span>{audioState?.playing ? "Pause audio" : "Audio"}</span></GlassButton>
        <GlassButton className="dock-action-button" onClick={() => isRunning ? pauseTimer() : startTimer()} variant="primary" aria-label={timerActionLabel}>{isRunning ? <Pause size={15} aria-hidden="true" /> : <Play size={15} fill="currentColor" aria-hidden="true" />}<span>{isPaused ? "Resume" : isRunning ? "Pause" : "Start"}</span></GlassButton>
        <GlassButton className="dock-action-button" onClick={skipTimer} aria-label="Skip timer"><SkipForward size={15} aria-hidden="true" /><span>Skip</span></GlassButton>
        <GlassButton className="dock-action-button" onClick={resetTimer} aria-label="Reset timer"><RotateCcw size={15} aria-hidden="true" /><span>Reset</span></GlassButton>
        <GlassButton className="dock-focus-mode" onClick={onFocusMode} aria-label="Enter distraction-free Focus Mode"><SlidersHorizontal size={15} aria-hidden="true" /><span>Focus Mode</span></GlassButton>
      </div>
    </div>
  );
}
