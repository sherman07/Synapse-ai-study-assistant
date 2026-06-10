const FOCUS_ROOM_SESSION_KEY = "synapse.focusRoom.sessions.v1";
const FOCUS_ROOM_DRAFT_KEY = "synapse.focusRoom.draft.v1";
const FOCUS_ROOM_SESSION_LIMIT = 40;

let memoryFocusRoomSessions = [];

const commonsAudio = fileName => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURI(fileName)}`;

const FOCUS_ROOM_MUSIC_TRACKS = [
  {
    label: "Deep Focus",
    title: "Chasing Daylight",
    artist: "Scott Buckley",
    streamUrl: "https://www.scottbuckley.com.au/library/wp-content/uploads/2021/03/sb_chasingdaylight.mp3",
    pageUrl: "https://www.scottbuckley.com.au/library/chasing-daylight/",
    license: "CC BY 4.0",
    attribution: "'Chasing Daylight' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
  },
  {
    label: "Lo-fi",
    title: "Lofi Hip Hop Upbeat",
    artist: "raspberrymusic",
    streamUrl: commonsAudio("Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Raspberrymusic_-_Lofi_Hip_Hop_Upbeat.ogg",
    license: "CC BY 4.0",
    attribution: "Raspberrymusic - Lofi Hip Hop Upbeat by raspberrymusic"
  },
  {
    label: "Piano",
    title: "The Long Dark",
    artist: "Scott Buckley",
    streamUrl: "https://www.scottbuckley.com.au/library/wp-content/uploads/2023/01/TheLongDark.mp3",
    pageUrl: "https://www.scottbuckley.com.au/library/the-long-dark/",
    license: "CC BY 4.0",
    attribution: "'The Long Dark' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
  },
  {
    label: "Minimal",
    title: "Computations in a Snowstorm",
    artist: "Scott Buckley",
    streamUrl: "https://www.scottbuckley.com.au/library/wp-content/uploads/2019/01/sb_computations_altmix.mp3",
    pageUrl: "https://www.scottbuckley.com.au/library/computations/",
    license: "CC BY 4.0",
    attribution: "'Computations in a Snowstorm' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au"
  }
];

const AMBIENT_LAYERS = {
  nature: {
    id: "nature-forest",
    title: "Forest ambience",
    artist: "nille",
    streamUrl: commonsAudio("20090610_0_ambience.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:20090610_0_ambience.ogg",
    license: "Public domain",
    attribution: "Forest ambience by nille",
    volumeBias: 1
  },
  cafe: {
    id: "cafe-ambiance",
    title: "Cafe ambiance",
    artist: "Marble Toast",
    streamUrl: commonsAudio("Cafe_ambiance.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg",
    license: "CC0",
    attribution: "Cafe ambiance by Marble Toast",
    volumeBias: 0.72
  },
  rain: {
    id: "rain",
    title: "Rain",
    artist: "ezwa",
    streamUrl: commonsAudio("Rain_(1).ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Rain_(1).ogg",
    license: "Public domain",
    attribution: "Rain by ezwa",
    volumeBias: 0.48
  },
  whiteNoise: {
    id: "white-noise",
    title: "White noise",
    artist: "Bautsch",
    streamUrl: commonsAudio("White.Noise.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:White.Noise.ogg",
    license: "Public domain",
    attribution: "White noise by Bautsch",
    volumeBias: 1
  },
  ocean: {
    id: "ocean-waves",
    title: "Waves",
    artist: "Dsw4",
    streamUrl: commonsAudio("Waves.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Waves.ogg",
    license: "CC BY 3.0",
    attribution: "Waves by Dsw4",
    volumeBias: 1
  },
  wind: {
    id: "howling-wind",
    title: "Howling wind",
    artist: "Tvabutzku1234",
    streamUrl: commonsAudio("Howling_wind.ogg"),
    pageUrl: "https://commons.wikimedia.org/wiki/File:Howling_wind.ogg",
    license: "CC0",
    attribution: "Howling wind by Tvabutzku1234",
    volumeBias: 0.78
  }
};

const FOCUS_ROOM_AMBIENT_SOUNDS = [
  {
    label: "Nature",
    layers: [AMBIENT_LAYERS.nature],
    pageUrl: AMBIENT_LAYERS.nature.pageUrl,
    license: AMBIENT_LAYERS.nature.license
  },
  {
    label: "Cafe Rain",
    layers: [AMBIENT_LAYERS.cafe, AMBIENT_LAYERS.rain],
    pageUrl: AMBIENT_LAYERS.cafe.pageUrl,
    license: "CC0 / Public domain"
  },
  {
    label: "Rain",
    layers: [AMBIENT_LAYERS.rain],
    pageUrl: AMBIENT_LAYERS.rain.pageUrl,
    license: AMBIENT_LAYERS.rain.license
  },
  {
    label: "White Noise",
    layers: [AMBIENT_LAYERS.whiteNoise],
    pageUrl: AMBIENT_LAYERS.whiteNoise.pageUrl,
    license: AMBIENT_LAYERS.whiteNoise.license
  },
  {
    label: "Ocean",
    layers: [AMBIENT_LAYERS.ocean],
    pageUrl: AMBIENT_LAYERS.ocean.pageUrl,
    license: AMBIENT_LAYERS.ocean.license
  },
  {
    label: "Wind",
    layers: [AMBIENT_LAYERS.wind],
    pageUrl: AMBIENT_LAYERS.wind.pageUrl,
    license: AMBIENT_LAYERS.wind.license
  }
];

const FOCUS_ROOM_SCENES = [
  {
    id: "morning-window",
    name: "Morning Window",
    kicker: "Bright focus",
    description: "Soft daylight, quiet desk, gentle outdoor calm.",
    image: "./assets/focus-room/morning-window.webp",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  },
  {
    id: "rainy-cafe",
    name: "Rainy Cafe",
    kicker: "Low hum",
    description: "Window rain, warm lights, steady cafe ambience.",
    image: "./assets/focus-room/rainy-cafe.webp",
    ambientSound: "Cafe Rain",
    musicType: "Lo-fi"
  },
  {
    id: "library-night",
    name: "Library Night",
    kicker: "Quiet review",
    description: "Desk lamp, bookshelves, late-night concentration.",
    image: "./assets/focus-room/library-night.webp",
    ambientSound: "White Noise",
    musicType: "Piano"
  },
  {
    id: "ocean-study-room",
    name: "Ocean Study Room",
    kicker: "Open air",
    description: "Blue horizon, slow waves, clean study energy.",
    image: "./assets/focus-room/ocean-study-room.webp",
    ambientSound: "Ocean",
    musicType: "Deep Focus"
  },
  {
    id: "mountain-cabin",
    name: "Mountain Cabin",
    kicker: "Warm retreat",
    description: "Snow view, wood textures, protected concentration.",
    image: "./assets/focus-room/mountain-cabin.webp",
    ambientSound: "Wind",
    musicType: "Piano"
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk",
    kicker: "Clean reset",
    description: "Neutral light, uncluttered desk, no distractions.",
    image: "./assets/focus-room/minimal-desk.webp",
    ambientSound: "White Noise",
    musicType: "Minimal"
  }
];

const FOCUS_ROOM_DURATIONS = [25, 45, 50, 90];

function focusRoomMusicTrack(label = "") {
  const value = String(label || "");
  return FOCUS_ROOM_MUSIC_TRACKS.find(track => track.label === value) || FOCUS_ROOM_MUSIC_TRACKS[0];
}

function focusRoomAmbientSound(label = "") {
  const value = String(label || "");
  return FOCUS_ROOM_AMBIENT_SOUNDS.find(sound => sound.label === value) || FOCUS_ROOM_AMBIENT_SOUNDS[0];
}

function getFocusRoomAudioProfile(source = {}) {
  const musicTrack = focusRoomMusicTrack(source?.musicType);
  const ambientSound = focusRoomAmbientSound(source?.ambientSound);
  return {
    musicTrack,
    ambientSound,
    ambientLayers: ambientSound.layers.map(layer => ({
      ...layer,
      volumeBias: finiteNumber(layer.volumeBias, 1)
    }))
  };
}

function readJSON(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    console.warn(`Could not read ${key}:`, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not write ${key}:`, error);
    return false;
  }
}

function stripHTML(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromSummary(summary) {
  const line = String(summary || "")
    .split(/\n+/)
    .map(item => item.replace(/^#+\s*/, "").trim())
    .find(item => item.length > 4);
  return line ? line.slice(0, 72) : "Generated Study Notes";
}

function headingsFromMaterial(source) {
  const sectionKeys = source?.sections && typeof source.sections === "object"
    ? Object.keys(source.sections).filter(Boolean)
    : [];
  if (sectionKeys.length) return sectionKeys.slice(0, 8);

  return String(source?.summary || source?.aiSummary || "")
    .split("\n")
    .map(line => line.match(/^#{1,4}\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeFocusRoomMaterial(source = {}) {
  if (!source || typeof source !== "object") {
    source = {};
  }

  const materialId = String(source.materialId || source.id || source.historyId || source.sourceFingerprint || "current-material");
  const aiSummary = String(source.aiSummary || source.summary || source.fullSummary || "");
  const materialTitle = String(source.materialTitle || source.title || titleFromSummary(aiSummary));
  const sourceFingerprint = String(source.sourceFingerprint || source.clientFingerprint || "");

  return {
    materialId,
    materialTitle,
    materialType: source.materialType || source.type || "Generated notes",
    uploadedContent: source.uploadedContent || source.sourceText || "",
    aiSummary,
    summaryText: stripHTML(aiSummary),
    sections: source.sections || {},
    studyHeadings: headingsFromMaterial(source),
    flashcards: Array.isArray(source.flashcards) ? source.flashcards : [],
    quizzes: Array.isArray(source.quizzes) ? source.quizzes : [],
    mindMap: source.mindMap || source.mind_map || null,
    studyPlan: Array.isArray(source.studyPlan) ? source.studyPlan : [],
    progressHistory: Array.isArray(source.progressHistory) ? source.progressHistory : [],
    sourceFingerprint,
    createdAt: source.createdAt || "",
    updatedAt: source.updatedAt || ""
  };
}

function getLegacyMaterials() {
  if (typeof globalThis.getSynapseFocusRoomMaterials === "function") {
    const materials = globalThis.getSynapseFocusRoomMaterials();
    return Array.isArray(materials) ? materials.map(normalizeFocusRoomMaterial) : [];
  }
  return [];
}

function getLegacyCurrentMaterial() {
  if (typeof globalThis.getSynapseFocusRoomCurrentMaterial === "function") {
    const material = globalThis.getSynapseFocusRoomCurrentMaterial();
    return material ? normalizeFocusRoomMaterial(material) : null;
  }
  return null;
}

function getFocusRoomMaterials() {
  const materials = getLegacyMaterials();
  const current = getLegacyCurrentMaterial();
  if (current && current.aiSummary && !materials.some(item => item.materialId === current.materialId)) {
    return [current, ...materials];
  }
  return materials;
}

function getFocusRoomMaterial(materialId) {
  const id = String(materialId || "");
  const materials = getFocusRoomMaterials();
  return materials.find(item => item.materialId === id) || materials[0] || null;
}

function buildFocusRoomStudyPlan({ material, goal, durationMinutes }) {
  const minutes = Math.max(10, Number(durationMinutes) || 25);
  const headings = material?.studyHeadings?.length
    ? material.studyHeadings
    : ["Key ideas", "Examples", "Practice", "Review"];
  const goalText = String(goal || "").trim() || `Study ${material?.materialTitle || "this material"}`;
  const firstBlock = Math.max(1, Math.floor(minutes * 0.2));
  const secondBlock = Math.max(1, Math.floor(minutes * 0.4));
  const thirdBlock = Math.max(1, Math.floor(minutes * 0.2));
  const finalBlock = Math.max(1, minutes - firstBlock - secondBlock - thirdBlock);

  return [
    { minutes: firstBlock, task: `Set the goal: ${goalText}` },
    { minutes: secondBlock, task: `Review ${headings[0] || "the core ideas"}` },
    { minutes: thirdBlock, task: `Practice with ${headings[1] || headings[0] || "the generated examples"}` },
    { minutes: finalBlock, task: "Summarize mistakes and choose the next study step" }
  ];
}

function readFocusRoomDraft() {
  return readJSON(FOCUS_ROOM_DRAFT_KEY, null);
}

function writeFocusRoomDraft(draft) {
  return writeJSON(FOCUS_ROOM_DRAFT_KEY, draft || null);
}

function readFocusRoomSessions() {
  const parsed = readJSON(FOCUS_ROOM_SESSION_KEY, []);
  const persisted = Array.isArray(parsed) ? parsed : [];
  const seen = new Set();
  return [...memoryFocusRoomSessions, ...persisted]
    .filter(item => {
      const id = String(item?.sessionId || "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, FOCUS_ROOM_SESSION_LIMIT);
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function saveFocusRoomSession(session = {}) {
  const now = new Date().toISOString();
  const record = {
    sessionId: session.sessionId || `focus-${Date.now()}`,
    materialId: String(session.materialId || ""),
    materialTitle: session.materialTitle || "Study material",
    studyGoal: session.studyGoal || "",
    selectedScene: session.selectedScene || "morning-window",
    musicType: session.musicType || "Deep Focus",
    ambientSound: session.ambientSound || "Nature",
    musicVolume: finiteNumber(session.musicVolume ?? 60, 60),
    ambientVolume: finiteNumber(session.ambientVolume ?? 50, 50),
    pomodoroDuration: finiteNumber(session.pomodoroDuration || 25, 25),
    startedAt: session.startedAt || now,
    endedAt: session.endedAt || now,
    totalFocusTime: Math.max(0, finiteNumber(session.totalFocusTime || 0, 0)),
    flashcardsCompleted: Math.max(0, finiteNumber(session.flashcardsCompleted || 0, 0)),
    quizScore: session.quizScore === null || session.quizScore === undefined || session.quizScore === ""
      ? null
      : (Number.isFinite(Number(session.quizScore)) ? Number(session.quizScore) : null),
    mistakesMade: Array.isArray(session.mistakesMade) ? session.mistakesMade : [],
    completedTasks: Array.isArray(session.completedTasks) ? session.completedTasks : [],
    aiReflection: session.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: session.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: session.sessionDate || now
  };
  const candidate = { ...record, persisted: true };
  const existing = readFocusRoomSessions().filter(item => item.sessionId !== candidate.sessionId);
  const next = [candidate, ...existing.map(item => ({ ...item, persisted: true }))].slice(0, FOCUS_ROOM_SESSION_LIMIT);
  const persisted = writeJSON(FOCUS_ROOM_SESSION_KEY, next);
  const finalRecord = { ...candidate, persisted };
  if (persisted) {
    memoryFocusRoomSessions = [];
  } else {
    memoryFocusRoomSessions = [finalRecord, ...existing].slice(0, FOCUS_ROOM_SESSION_LIMIT);
  }
  return finalRecord;
}

function formatFocusRoomDuration(seconds) {
  const total = Math.max(0, finiteNumber(seconds || 0, 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export {
  FOCUS_ROOM_DRAFT_KEY,
  FOCUS_ROOM_AMBIENT_SOUNDS,
  FOCUS_ROOM_DURATIONS,
  FOCUS_ROOM_MUSIC_TRACKS,
  FOCUS_ROOM_SCENES,
  FOCUS_ROOM_SESSION_KEY,
  buildFocusRoomStudyPlan,
  formatFocusRoomDuration,
  getFocusRoomAudioProfile,
  getFocusRoomMaterial,
  getFocusRoomMaterials,
  normalizeFocusRoomMaterial,
  readFocusRoomDraft,
  readFocusRoomSessions,
  saveFocusRoomSession,
  writeFocusRoomDraft
};
