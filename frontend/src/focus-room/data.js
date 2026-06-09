const FOCUS_ROOM_SESSION_KEY = "synapse.focusRoom.sessions.v1";
const FOCUS_ROOM_DRAFT_KEY = "synapse.focusRoom.draft.v1";
const FOCUS_ROOM_SESSION_LIMIT = 40;

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
    ambientSound: "Rain",
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
    return normalizeFocusRoomMaterial(globalThis.getSynapseFocusRoomCurrentMaterial());
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
  const firstBlock = Math.max(5, Math.round(minutes * 0.2));
  const secondBlock = Math.max(8, Math.round(minutes * 0.4));
  const thirdBlock = Math.max(5, Math.round(minutes * 0.2));
  const finalBlock = Math.max(5, minutes - firstBlock - secondBlock - thirdBlock);

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
  return Array.isArray(parsed) ? parsed : [];
}

function saveFocusRoomSession(session) {
  const now = new Date().toISOString();
  const record = {
    sessionId: session.sessionId || `focus-${Date.now()}`,
    materialId: String(session.materialId || ""),
    materialTitle: session.materialTitle || "Study material",
    studyGoal: session.studyGoal || "",
    selectedScene: session.selectedScene || "morning-window",
    musicType: session.musicType || "Deep Focus",
    ambientSound: session.ambientSound || "Nature",
    musicVolume: Number(session.musicVolume ?? 60),
    ambientVolume: Number(session.ambientVolume ?? 50),
    pomodoroDuration: Number(session.pomodoroDuration || 25),
    startedAt: session.startedAt || now,
    endedAt: session.endedAt || now,
    totalFocusTime: Math.max(0, Number(session.totalFocusTime || 0)),
    flashcardsCompleted: Math.max(0, Number(session.flashcardsCompleted || 0)),
    quizScore: Number.isFinite(Number(session.quizScore)) ? Number(session.quizScore) : null,
    mistakesMade: Array.isArray(session.mistakesMade) ? session.mistakesMade : [],
    completedTasks: Array.isArray(session.completedTasks) ? session.completedTasks : [],
    aiReflection: session.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: session.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: session.sessionDate || now
  };
  const next = [record, ...readFocusRoomSessions().filter(item => item.sessionId !== record.sessionId)].slice(0, FOCUS_ROOM_SESSION_LIMIT);
  writeJSON(FOCUS_ROOM_SESSION_KEY, next);
  return record;
}

function formatFocusRoomDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export {
  FOCUS_ROOM_DRAFT_KEY,
  FOCUS_ROOM_DURATIONS,
  FOCUS_ROOM_SCENES,
  FOCUS_ROOM_SESSION_KEY,
  buildFocusRoomStudyPlan,
  formatFocusRoomDuration,
  getFocusRoomMaterial,
  getFocusRoomMaterials,
  normalizeFocusRoomMaterial,
  readFocusRoomDraft,
  readFocusRoomSessions,
  saveFocusRoomSession,
  writeFocusRoomDraft
};
