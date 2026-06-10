import { Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { GlassButton } from "./GlassButton.jsx";

export function BottomControlDock({ audioState }) {
  const audioPlaying = useFocusRoomStore(state => state.audioPlaying);
  const toggleAudio = useFocusRoomStore(state => state.toggleAudio);
  const pauseTimer = useFocusRoomStore(state => state.pauseTimer);
  const resetTimer = useFocusRoomStore(state => state.resetTimer);
  const skipTimer = useFocusRoomStore(state => state.skipTimer);
  const endSession = useFocusRoomStore(state => state.endSession);
  const musicVolume = useFocusRoomStore(state => state.musicVolume);
  const ambientVolume = useFocusRoomStore(state => state.ambientVolume);

  return (
    <div className="bottom-dock liquid-glass" aria-label="Floating session controls">
      <span className="dock-meter">Music {musicVolume}%</span>
      <span className="dock-meter">Ambient {ambientVolume}%</span>
      <GlassButton variant={audioPlaying ? "primary" : "ghost"} onClick={toggleAudio}>
        {audioPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        {audioState?.playing ? "Pause" : "Audio"}
      </GlassButton>
      <GlassButton onClick={() => pauseTimer()}><Pause size={16} aria-hidden="true" /> Timer</GlassButton>
      <GlassButton onClick={skipTimer}><SkipForward size={16} aria-hidden="true" /> Skip</GlassButton>
      <GlassButton onClick={resetTimer}><RotateCcw size={16} aria-hidden="true" /> Reset</GlassButton>
      <GlassButton variant="danger" onClick={endSession}><Square size={16} aria-hidden="true" /> End</GlassButton>
    </div>
  );
}
