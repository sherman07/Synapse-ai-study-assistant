import { useEffect, useState } from "react";
import { getFocusRoomAudioProfile } from "../data.js";
import {
  getFocusRoomAudioState,
  setFocusRoomAudioPlaying,
  syncFocusRoomAudio
} from "../audio.js";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export const FOCUS_ROOM_AUDIO_PREFS_KEY = "synapse.focusRoom.audioPrefs.v1";

function writeAudioPrefs(config) {
  try {
    globalThis.localStorage?.setItem(FOCUS_ROOM_AUDIO_PREFS_KEY, JSON.stringify({
      musicType: config.musicType,
      ambientSound: config.ambientSound,
      musicVolume: config.musicVolume,
      ambientVolume: config.ambientVolume,
      audioChannels: config.audioChannels,
      updatedAt: new Date().toISOString()
    }));
  } catch {
    // Local audio preferences are a convenience only.
  }
}

export function useAudioSettings() {
  const musicType = useFocusRoomStore(state => state.musicType);
  const ambientSound = useFocusRoomStore(state => state.ambientSound);
  const musicVolume = useFocusRoomStore(state => state.musicVolume);
  const ambientVolume = useFocusRoomStore(state => state.ambientVolume);
  const audioChannels = useFocusRoomStore(state => state.audioChannels);
  const audioPlaying = useFocusRoomStore(state => state.audioPlaying);
  const [audioState, setAudioState] = useState(() => getFocusRoomAudioState(getFocusRoomAudioProfile({
    musicType,
    ambientSound,
    musicVolume,
    ambientVolume,
    audioChannels
  })));

  useEffect(() => {
    const config = { musicType, ambientSound, musicVolume, ambientVolume, audioChannels };
    let cancelled = false;
    setFocusRoomAudioPlaying(audioPlaying);
    writeAudioPrefs(config);
    syncFocusRoomAudio(config).then(nextState => {
      if (!cancelled) setAudioState(nextState);
    });
    return () => {
      cancelled = true;
    };
  }, [ambientSound, ambientVolume, audioChannels, audioPlaying, musicType, musicVolume]);

  return audioState;
}
