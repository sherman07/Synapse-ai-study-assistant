const HISTORY_STORAGE_KEY = "synapse.generated.history.v6";
const ACTIVE_HISTORY_KEY = "synapse.active.generated.v6";
const FLASHCARD_STORAGE_KEY = "synapse.flashcards.deck.v1";
const QUIZ_HISTORY_STORAGE_KEY = "synapse.quiz.history.v1";
const FOCUS_ROOM_RETURN_TARGET_KEY = "synapse.focusRoom.return-target.v1";

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

function writeValue(key, value) {
  try {
    globalThis.localStorage?.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Could not write ${key}:`, error);
    return false;
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

function getHistory() {
  const items = readJSON(HISTORY_STORAGE_KEY, []);
  return Array.isArray(items) ? items : [];
}

function titleFromHistory(item) {
  const title = String(item?.title || "").trim();
  if (title) return title;
  const summaryTitle = String(item?.summary || "")
    .split(/\n+/)
    .map(line => line.replace(/^#+\s*/, "").trim())
    .find(line => line.length > 4);
  return summaryTitle || "Generated Study Notes";
}

function focusRoomKeysForHistoryItem(item = {}) {
  return [
    item.id ? `history:${item.id}` : "",
    item.sourceFingerprint ? `fingerprint:${item.sourceFingerprint}` : "",
    item.clientFingerprint ? `fingerprint:${item.clientFingerprint}` : ""
  ].filter(Boolean);
}

function flashcardsForHistoryItem(item = {}) {
  const store = readJSON(FLASHCARD_STORAGE_KEY, {});
  const keys = focusRoomKeysForHistoryItem(item);
  const record = keys
    .map(key => store?.[key])
    .find(value => value && Array.isArray(value.cards) && value.cards.length);
  return record?.cards || [];
}

function quizRecordKey(record = {}) {
  const id = String(record.id || "").trim();
  if (id) return `id:${id}`;
  try {
    return `content:${JSON.stringify({
      title: record.title || "",
      createdAt: record.createdAt || "",
      updatedAt: record.updatedAt || "",
      questions: record.quiz?.questions || record.questions || []
    })}`;
  } catch {
    return "";
  }
}

function quizSummaries(records = []) {
  return (Array.isArray(records) ? records : []).map(record => ({
    id: record.id,
    title: record.title,
    createdAt: record.createdAt || record.created_at || "",
    updatedAt: record.updatedAt || record.updated_at || "",
    questions: record.quiz?.questions || record.questions || [],
    report: record.report || null
  }));
}

function quizzesForHistoryItem(item = {}) {
  const store = readJSON(QUIZ_HISTORY_STORAGE_KEY, {});
  const keys = focusRoomKeysForHistoryItem(item);
  const records = keys.flatMap(key => Array.isArray(store?.[key]) ? store[key] : []);
  const seen = new Set();
  return quizSummaries(records)
    .filter(record => {
      const key = quizRecordKey(record);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function focusRoomMaterialFromHistoryItem(item = {}) {
  return {
    materialId: String(item.id || item.sourceFingerprint || item.clientFingerprint || "current-material"),
    materialTitle: titleFromHistory(item),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: item.summary || "",
    sections: item.sections || {},
    flashcards: flashcardsForHistoryItem(item),
    quizzes: quizzesForHistoryItem(item),
    mindMap: item.mindMap || item.mind_map || item.brainstorm || null,
    studyPlan: item.studyPlan || [],
    progressHistory: [],
    sources: Array.isArray(item.sources) ? item.sources : [],
    sourceItems: Array.isArray(item.sourceItems) ? item.sourceItems : [],
    sourceHighlights: Array.isArray(item.sourceHighlights || item.source_highlights)
      ? (item.sourceHighlights || item.source_highlights)
      : [],
    sourceFingerprint: item.sourceFingerprint || item.clientFingerprint || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || ""
  };
}

function getSynapseFocusRoomMaterials() {
  return getHistory()
    .filter(item => item && (item.id || item.summary) && item.kind !== "companion" && !String(item.id || "").startsWith("companion:"))
    .map(focusRoomMaterialFromHistoryItem);
}

function getSynapseFocusRoomMaterial(materialId = "") {
  const id = String(materialId || "");
  if (!id) return null;
  return getSynapseFocusRoomMaterials().find(item =>
    item.materialId === id ||
    item.sourceFingerprint === id ||
    item.clientFingerprint === id
  ) || null;
}

function getSynapseFocusRoomCurrentMaterial() {
  const activeId = globalThis.localStorage?.getItem(ACTIVE_HISTORY_KEY) || "";
  return getSynapseFocusRoomMaterial(activeId);
}

function openSynapseFocusRoom(materialId = "") {
  const requestedId = materialId || getSynapseFocusRoomCurrentMaterial()?.materialId || "";
  const suffix = requestedId ? `/${encodeURIComponent(requestedId)}` : "";
  globalThis.location.hash = `#/focus-room${suffix}`;
}

function normalizeReturnTarget(materialId = "", target = {}) {
  const objectTarget = target && typeof target === "object" && !Array.isArray(target) ? target : {};
  return {
    materialId: String(materialId || ""),
    action: String(objectTarget.action || "").trim().toLowerCase(),
    sourceId: String(objectTarget.sourceId || objectTarget.source_id || ""),
    sourceIndex: Number(objectTarget.sourceIndex || objectTarget.source_index || 0) || 0,
    sourceLabel: String(objectTarget.sourceLabel || objectTarget.source_label || ""),
    sectionTitle: String(objectTarget.sectionTitle || objectTarget.section_title || ""),
    highlightId: String(objectTarget.highlightId || objectTarget.highlight_id || ""),
    excerpt: String(objectTarget.excerpt || "").slice(0, 1600),
    createdAt: new Date().toISOString()
  };
}

async function returnFromFocusRoomToWorkspace(materialId = "", target = {}) {
  const id = String(materialId || "");
  const historyItem = getHistory().find(item =>
    String(item?.id || "") === id ||
    String(item?.sourceFingerprint || item?.source_fingerprint || "") === id ||
    String(item?.clientFingerprint || item?.client_fingerprint || "") === id
  ) || null;
  const workspaceId = String(historyItem?.id || "");
  if (workspaceId) {
    writeValue(ACTIVE_HISTORY_KEY, workspaceId);
  }
  const workspaceTarget = normalizeReturnTarget(workspaceId, target);
  if (workspaceTarget.action) {
    writeJSON(FOCUS_ROOM_RETURN_TARGET_KEY, workspaceTarget);
  }
  globalThis.location.href = workspaceId
    ? `index.html?focusReturn=${encodeURIComponent(workspaceId)}`
    : "index.html";
}

function installStandaloneFocusRoomBridge() {
  Object.assign(globalThis, {
    getSynapseFocusRoomCurrentMaterial,
    getSynapseFocusRoomMaterial,
    getSynapseFocusRoomMaterials,
    openSynapseFocusRoom,
    returnFromFocusRoomToWorkspace
  });
}

export {
  ACTIVE_HISTORY_KEY,
  HISTORY_STORAGE_KEY,
  installStandaloneFocusRoomBridge
};
