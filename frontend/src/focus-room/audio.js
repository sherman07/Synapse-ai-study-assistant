import howler from "howler";
import { getFocusRoomAudioProfile } from "./data.js";

const { Howl } = howler;

const FADE_MS = 500;

const channels = {
  music: null,
  ambient: new Map()
};

let activeConfig = {};
let shouldPlay = false;
let lastError = "";

function canUseAudio() {
  return typeof Howl === "function";
}

function normalizeVolume(value, fallback = 50) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.min(1, Math.max(0, safe / 100));
}

function createHowl(src) {
  return new Howl({
    src: [src],
    loop: true,
    html5: true,
    preload: true,
    volume: 0
  });
}

function fadeTo(howl, volume, duration = FADE_MS) {
  if (!howl) return;
  try {
    const current = typeof howl.volume === "function" ? howl.volume() : 0;
    howl.fade(current, volume, duration);
  } catch {
    try {
      howl.volume(volume);
    } catch {
      // Howler can reject volume updates when a browser blocks media setup.
    }
  }
}

function stopHowl(howl, { unload = false } = {}) {
  if (!howl) return;
  fadeTo(howl, 0, Math.min(FADE_MS, 300));
  globalThis.setTimeout?.(() => {
    try {
      howl.pause();
      if (unload) howl.unload();
    } catch {
      // Remote media can fail during teardown without affecting app state.
    }
  }, Math.min(FADE_MS, 320));
}

function ensureMusicChannel(track) {
  if (!track?.streamUrl || !canUseAudio()) return null;
  if (!channels.music || channels.music.__synapseSrc !== track.streamUrl) {
    stopHowl(channels.music, { unload: true });
    channels.music = createHowl(track.streamUrl);
    channels.music.__synapseSrc = track.streamUrl;
  }
  return channels.music;
}

function ensureAmbientChannel(layer) {
  if (!layer?.streamUrl || !canUseAudio()) return null;
  const key = layer.id || layer.streamUrl;
  const existing = channels.ambient.get(key);
  if (existing && existing.__synapseSrc === layer.streamUrl) return existing;

  stopHowl(existing, { unload: true });
  const next = createHowl(layer.streamUrl);
  next.__synapseSrc = layer.streamUrl;
  channels.ambient.set(key, next);
  return next;
}

function activeHowls() {
  return [
    channels.music,
    ...channels.ambient.values()
  ].filter(Boolean);
}

function pauseAllAudio() {
  activeHowls().forEach(howl => stopHowl(howl));
}

function removeInactiveAmbientChannels(activeKeys) {
  for (const [key, howl] of channels.ambient.entries()) {
    if (activeKeys.has(key)) continue;
    stopHowl(howl, { unload: true });
    channels.ambient.delete(key);
  }
}

function playHowl(howl, targetVolume) {
  if (!howl) return;
  try {
    if (!howl.playing()) {
      howl.play();
    }
    fadeTo(howl, targetVolume);
    lastError = "";
  } catch (error) {
    lastError = error?.message || "Audio playback is blocked until the browser receives a user action.";
  }
}

async function syncFocusRoomAudio(config = {}) {
  activeConfig = { ...activeConfig, ...config };
  const profile = getFocusRoomAudioProfile(activeConfig);
  if (!canUseAudio()) return getFocusRoomAudioState(profile);

  if (!shouldPlay) {
    pauseAllAudio();
    return getFocusRoomAudioState(profile);
  }

  const music = ensureMusicChannel(profile.musicTrack);
  const musicVolume = normalizeVolume(activeConfig.musicVolume, 60);

  const ambientBaseVolume = normalizeVolume(activeConfig.ambientVolume, 50);
  const activeAmbientKeys = new Set();
  const ambientTargets = [];
  profile.ambientLayers.forEach(layer => {
    const key = layer.id || layer.streamUrl;
    activeAmbientKeys.add(key);
    const howl = ensureAmbientChannel(layer);
    const targetVolume = Math.min(1, Math.max(0, ambientBaseVolume * (layer.volumeBias ?? 1)));
    ambientTargets.push([howl, targetVolume]);
  });
  removeInactiveAmbientChannels(activeAmbientKeys);

  playHowl(music, musicVolume);
  ambientTargets.forEach(([howl, targetVolume]) => playHowl(howl, targetVolume));
  return getFocusRoomAudioState(profile);
}

function setFocusRoomAudioPlaying(playing) {
  shouldPlay = Boolean(playing);
  if (!shouldPlay) pauseAllAudio();
  return shouldPlay;
}

async function toggleFocusRoomAudio(config = activeConfig) {
  setFocusRoomAudioPlaying(!shouldPlay);
  return syncFocusRoomAudio(config);
}

function stopFocusRoomAudio() {
  shouldPlay = false;
  activeHowls().forEach(howl => {
    try {
      howl.stop();
    } catch {
      stopHowl(howl);
    }
  });
}

function getFocusRoomAudioState(profile = getFocusRoomAudioProfile(activeConfig)) {
  return {
    available: canUseAudio(),
    playing: shouldPlay && canUseAudio(),
    musicTitle: profile.musicTrack?.title || "",
    musicArtist: profile.musicTrack?.artist || "",
    musicPageUrl: profile.musicTrack?.pageUrl || "",
    musicAttribution: profile.musicTrack?.attribution || "",
    ambientTitles: profile.ambientLayers.map(layer => layer.title).filter(Boolean),
    ambientPageUrls: profile.ambientLayers.map(layer => layer.pageUrl).filter(Boolean),
    ambientAttributions: profile.ambientLayers.map(layer => layer.attribution).filter(Boolean),
    error: lastError
  };
}

export {
  getFocusRoomAudioState,
  setFocusRoomAudioPlaying,
  stopFocusRoomAudio,
  syncFocusRoomAudio,
  toggleFocusRoomAudio
};
