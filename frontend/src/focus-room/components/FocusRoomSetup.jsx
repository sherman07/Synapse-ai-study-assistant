import { Clock, Sparkles } from "lucide-react";
import { FOCUS_ROOM_DURATIONS } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { EditableTimer } from "./EditableTimer.jsx";
import { GlassButton } from "./GlassButton.jsx";
import { LiquidGlass } from "./LiquidGlass.jsx";
import { SceneSelector } from "./SceneSelector.jsx";
import { SoundControlPanel } from "./SoundControlPanel.jsx";

export function FocusRoomSetup({ audioState }) {
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const pomodoroDurationSeconds = useFocusRoomStore(state => state.pomodoroDurationSeconds);
  const studyGoal = useFocusRoomStore(state => state.studyGoal);
  const setPomodoroDuration = useFocusRoomStore(state => state.setPomodoroDuration);
  const setPomodoroDurationSeconds = useFocusRoomStore(state => state.setPomodoroDurationSeconds);
  const setStudyGoal = useFocusRoomStore(state => state.setStudyGoal);
  const startSession = useFocusRoomStore(state => state.startSession);

  return (
    <section className="focus-setup-stage" aria-label="Focus Room setup">
      <LiquidGlass className="focus-setup-scenes">
        <span className="focus-step-label">Step 01</span>
        <h1>Choose your study scene</h1>
        <p>Pick the cinematic atmosphere that helps you settle into this focus block.</p>
        <SceneSelector />
      </LiquidGlass>

      <LiquidGlass className="focus-setup-controls">
        <span className="focus-step-label">Step 02</span>
        <h2>Set sound atmosphere</h2>
        <SoundControlPanel audioState={audioState} />
        <span className="focus-step-label">Step 03</span>
        <h2>Set Pomodoro</h2>
        <div className="duration-grid" aria-label="Pomodoro duration presets">
          {FOCUS_ROOM_DURATIONS.map(minutes => {
            const isActive = minutes * 60 === pomodoroDurationSeconds;
            return (
              <GlassButton
                key={minutes}
                variant={isActive ? "primary" : "ghost"}
                aria-pressed={isActive}
                onClick={() => setPomodoroDuration(minutes)}
              >
                <Clock size={16} aria-hidden="true" /> {minutes}m
              </GlassButton>
            );
          })}
        </div>
        <div className="focus-field focus-field-timer">
          <span className="focus-field-label">Custom duration</span>
          <EditableTimer
            valueSeconds={pomodoroDurationSeconds}
            onChange={setPomodoroDurationSeconds}
            size="setup"
            ariaLabel="Set custom Pomodoro length"
          />
          <span className="focus-field-hint">Tap the minutes or seconds, then type, scroll, or use ↑ / ↓ to fine-tune.</span>
        </div>
        <label className="focus-field">
          Focus intention
          <textarea value={studyGoal} onChange={event => setStudyGoal(event.target.value)} />
        </label>
        <GlassButton className="enter-focus-btn" variant="primary" onClick={startSession}>
          <Sparkles size={18} aria-hidden="true" /> Enter Focus Room
        </GlassButton>
      </LiquidGlass>
    </section>
  );
}
