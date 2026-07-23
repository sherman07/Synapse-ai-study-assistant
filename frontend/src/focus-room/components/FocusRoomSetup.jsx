import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { FOCUS_ROOM_DURATIONS } from "../data.js";
import { currentScene } from "../utils.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { EditableTimer } from "./EditableTimer.jsx";
import { GlassButton } from "./GlassButton.jsx";
import { LiquidGlass } from "./LiquidGlass.jsx";
import { SceneSelector } from "./SceneSelector.jsx";
import { SoundControlPanel } from "./SoundControlPanel.jsx";

export function FocusRoomSetup({ audioState, onWorkspace }) {
  const selectedScene = useFocusRoomStore(state => state.selectedScene);
  const pomodoroDurationSeconds = useFocusRoomStore(state => state.pomodoroDurationSeconds);
  const studyGoal = useFocusRoomStore(state => state.studyGoal);
  const setPomodoroDuration = useFocusRoomStore(state => state.setPomodoroDuration);
  const setPomodoroDurationSeconds = useFocusRoomStore(state => state.setPomodoroDurationSeconds);
  const setStudyGoal = useFocusRoomStore(state => state.setStudyGoal);
  const startSession = useFocusRoomStore(state => state.startSession);
  const scene = currentScene(selectedScene);
  const ready = Boolean(selectedScene && pomodoroDurationSeconds > 0 && String(studyGoal || "").trim());

  const enterRoom = () => {
    if (!ready) return;
    startSession();
  };

  return (
    <section className="focus-setup-stage" aria-label="Focus Room setup" data-focus-setup="true">
      <header className="focus-setup-heading">
        <button type="button" className="focus-wordmark" onClick={onWorkspace} aria-label="Return to Synapse workspace">
          <span className="focus-wordmark-mark">S</span>
          <span>synapse</span>
        </button>
        <div className="focus-setup-heading-actions">
          <GlassButton className="setup-quiet-action" onClick={onWorkspace}>
            <ArrowLeft size={14} aria-hidden="true" /> Workspace
          </GlassButton>
        </div>
      </header>

      <div className="focus-setup-layout">
        <LiquidGlass className="focus-setup-scenes">
          <div className="setup-panel-intro">
            <span className="focus-step-label">Step 01</span>
            <h1>Choose your study scene</h1>
            <p>Pick the atmosphere first. The live preview behind this panel updates as you choose.</p>
          </div>
          <SceneSelector />
          <div className="focus-setup-scene-preview" aria-live="polite">
            <span className="focus-pill">Selected</span>
            <strong>{scene.name}</strong>
            <span>{scene.description || "Quiet study room"}</span>
          </div>
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
            <span className="focus-field-hint">Click minutes or seconds, then type digits to set the length.</span>
          </div>

          <label className="focus-field setup-goal-field">
            Focus intention
            <textarea
              value={studyGoal}
              onChange={event => setStudyGoal(event.target.value)}
              placeholder="What will you protect this block for?"
              rows={3}
            />
          </label>

          <p className="setup-plan-hint">
            After you enter, your timer, sound mix, and scene stay ready. You can still fine-tune room settings inside the Focus Room.
          </p>

          <GlassButton
            className="enter-focus-btn"
            variant="primary"
            onClick={enterRoom}
            disabled={!ready}
            data-focus-enter="true"
          >
            <Sparkles size={18} aria-hidden="true" /> Enter Focus Room
          </GlassButton>
        </LiquidGlass>
      </div>
    </section>
  );
}
