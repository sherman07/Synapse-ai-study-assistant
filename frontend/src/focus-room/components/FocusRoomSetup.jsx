import { Clock, Sparkles } from "lucide-react";
import { FOCUS_ROOM_DURATIONS } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { GlassButton } from "./GlassButton.jsx";
import { LiquidGlass } from "./LiquidGlass.jsx";
import { SceneSelector } from "./SceneSelector.jsx";
import { SoundControlPanel } from "./SoundControlPanel.jsx";

export function FocusRoomSetup({ audioState }) {
  const pomodoroDuration = useFocusRoomStore(state => state.pomodoroDuration);
  const studyGoal = useFocusRoomStore(state => state.studyGoal);
  const setPomodoroDuration = useFocusRoomStore(state => state.setPomodoroDuration);
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
        <div className="duration-grid" aria-label="Pomodoro duration">
          {FOCUS_ROOM_DURATIONS.map(minutes => (
            <GlassButton
              key={minutes}
              variant={minutes === pomodoroDuration ? "primary" : "ghost"}
              aria-pressed={minutes === pomodoroDuration}
              onClick={() => setPomodoroDuration(minutes)}
            >
              <Clock size={16} aria-hidden="true" /> {minutes}m
            </GlassButton>
          ))}
        </div>
        <label className="focus-field">
          Custom duration
          <input type="number" min="10" max="180" step="5" value={pomodoroDuration} onChange={event => setPomodoroDuration(event.target.value)} />
        </label>
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
