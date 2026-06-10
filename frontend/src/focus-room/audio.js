import { getFocusRoomAudioProfile } from "./data.js";

const channels = {
  music: null,
  ambient: new Map()
};

let activeConfig = {};
let shouldPlay = false;
let lastError = "";

function canUseAudio() {
  return typeof globalThis.Audio === "function";
}

function normalizeVolume(value, fallback = 50) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.min(1, Math.max(0, safe / 100));
}

function createAudioElement(src) {
  const audio = new globalThis.Audio(src);
  audio.loop = true;
  audio.preload = "auto";
  return audio;
}

function ensureMusicChannel(track) {
  if (!track?.streamUrl || !canUseAudio()) return null;
  if (!channels.music || channels.music.src !== track.streamUrl) {
    channels.music?.pause?.();
    channels.music = createAudioElement(track.streamUrl);
  }
  return channels.music;
}

function ensureAmbientChannel(layer) {
  if (!layer?.streamUrl || !canUseAudio()) return null;
  const key = layer.id || layer.streamUrl;
  const existing = channels.ambient.get(key);
  if (existing && existing.src === layer.streamUrl) return existing;

  existing?.pause?.();
  const next = createAudioElement(layer.streamUrl);
  channels.ambient.set(key, next);
  return next;
}

function pauseAudio(audio) {
  if (!audio) return;
  audio.pause?.();
}

async function playAudio(audio) {
  if (!audio || !audio.paused) return;
  try {
    await audio.play();
    lastError = "";
  } catch (error) {
    lastError = error?.message || "Audio playback is blocked until the browser receives a user action.";
  }
}

function activeAudioElements() {
  return [
    channels.music,
    ...channels.ambient.values()
  ].filter(Boolean);
}

function pauseAllAudio() {
  activeAudioElements().forEach(pauseAudio);
}

function removeInactiveAmbientChannels(activeKeys) {
  for (const [key, audio] of channels.ambient.entries()) {
    if (activeKeys.has(key)) continue;
    pauseAudio(audio);
    channels.ambient.delete(key);
  }
}

async function syncFocusRoomAudio(config = {}) {
  activeConfig = { ...activeConfig, ...config };
  const profile = getFocusRoomAudioProfile(activeConfig);
  if (!canUseAudio()) return getFocusRoomAudioState(profile);

  const music = ensureMusicChannel(profile.musicTrack);
  if (music) {
    music.volume = normalizeVolume(activeConfig.musicVolume, 60);
  }

  const ambientBaseVolume = normalizeVolume(activeConfig.ambientVolume, 50);
  const activeAmbientKeys = new Set();
  profile.ambientLayers.forEach(layer => {
    const key = layer.id || layer.streamUrl;
    activeAmbientKeys.add(key);
    const audio = ensureAmbientChannel(layer);
    if (audio) {
      audio.volume = Math.min(1, Math.max(0, ambientBaseVolume * (layer.volumeBias ?? 1)));
    }
  });
  removeInactiveAmbientChannels(activeAmbientKeys);

  if (!shouldPlay) {
    pauseAllAudio();
    return getFocusRoomAudioState(profile);
  }

  await Promise.all(activeAudioElements().map(playAudio));
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
  pauseAllAudio();
  activeAudioElements().forEach(audio => {
    try {
      audio.currentTime = 0;
    } catch {
      // Some remote media elements do not allow seeking before metadata loads.
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
