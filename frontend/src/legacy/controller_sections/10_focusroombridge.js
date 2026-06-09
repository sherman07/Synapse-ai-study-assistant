function getFocusRoomSummaryText() {
  return fullSummary || summaryContent?.textContent || "";
}

function getFocusRoomStoreRecordByKeys(readStore, keys, predicate) {
  const rawStore = typeof readStore === "function" ? readStore() : {};
  const store = rawStore && typeof rawStore === "object" && !Array.isArray(rawStore) ? rawStore : {};
  return keys.map(key => store[key]).find(predicate);
}

function getFocusRoomKeys({ historyId = "", sourceFingerprint = "" } = {}) {
  return [
    historyId ? `history:${historyId}` : "",
    sourceFingerprint ? `fingerprint:${sourceFingerprint}` : ""
  ].filter(Boolean);
}

function getFocusRoomKeysForCurrentNote() {
  return getFocusRoomKeys({
    historyId: currentHistoryId,
    sourceFingerprint: currentSourceFingerprint
  });
}

function getFocusRoomKeysForHistoryItem(item) {
  const keys = [
    ...getFocusRoomKeys({
      historyId: item?.id,
      sourceFingerprint: item?.sourceFingerprint
    }),
    item?.clientFingerprint ? `fingerprint:${item.clientFingerprint}` : ""
  ].filter(Boolean);
  return [...new Set(keys)];
}

function getFocusRoomFlashcardsForKeys(keys, fallbackCards = []) {
  const fallback = Array.isArray(fallbackCards) ? fallbackCards : [];
  const record = getFocusRoomStoreRecordByKeys(
    typeof getFlashcardStore === "function" ? getFlashcardStore : null,
    keys,
    item => item && Array.isArray(item.cards) && item.cards.length
  );
  return record?.cards || fallback;
}

function getFocusRoomQuizSummaries(records) {
  return (Array.isArray(records) ? records : []).map(record => ({
    id: record.id,
    title: record.title,
    createdAt: record.createdAt || record.created_at || "",
    updatedAt: record.updatedAt || record.updated_at || "",
    questions: record.quiz?.questions || record.questions || [],
    report: record.report || null
  }));
}

function getFocusRoomQuizRecordKey(record) {
  const id = String(record?.id || "").trim();
  if (id) return `id:${id}`;
  try {
    return `content:${JSON.stringify({
      title: record?.title || "",
      createdAt: record?.createdAt || "",
      updatedAt: record?.updatedAt || "",
      questions: record?.questions || []
    })}`;
  } catch {
    return "";
  }
}

function getFocusRoomQuizRecordsForKeys(keys, fallbackRecords = []) {
  const rawStore = typeof getQuizHistoryStore === "function" ? getQuizHistoryStore() : {};
  const store = rawStore && typeof rawStore === "object" && !Array.isArray(rawStore) ? rawStore : {};
  const records = keys.flatMap(key => Array.isArray(store[key]) ? store[key] : []);
  const sourceRecords = records.length ? records : fallbackRecords;
  const seen = new Set();
  return getFocusRoomQuizSummaries(sourceRecords)
    .filter(record => {
      const key = getFocusRoomQuizRecordKey(record);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function getFocusRoomFlashcardsForCurrentNote() {
  return getFocusRoomFlashcardsForKeys(getFocusRoomKeysForCurrentNote(), currentFlashcards);
}

function getFocusRoomQuizRecordsForCurrentNote() {
  return getFocusRoomQuizRecordsForKeys(getFocusRoomKeysForCurrentNote(), quizHistory);
}

function getFocusRoomFlashcardsForHistoryItem(item) {
  return getFocusRoomFlashcardsForKeys(getFocusRoomKeysForHistoryItem(item));
}

function getFocusRoomQuizRecordsForHistoryItem(item) {
  return getFocusRoomQuizRecordsForKeys(getFocusRoomKeysForHistoryItem(item));
}

function getSynapseFocusRoomCurrentMaterial() {
  const summary = getFocusRoomSummaryText();
  if (!summary || !summary.trim()) return null;
  return {
    materialId: currentHistoryId || currentSourceFingerprint || "current-material",
    materialTitle: storedTitle || makeHistoryTitle(summary) || "Current Study Notes",
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: summary,
    sections,
    flashcards: getFocusRoomFlashcardsForCurrentNote(),
    quizzes: getFocusRoomQuizRecordsForCurrentNote(),
    mindMap: currentMindMap,
    studyPlan: currentTimeline?.events || [],
    progressHistory: [],
    sourceFingerprint: currentSourceFingerprint,
    createdAt: "",
    updatedAt: ""
  };
}

function focusRoomMaterialFromHistoryItem(item) {
  return {
    materialId: item.id,
    materialTitle: item.title || makeHistoryTitle(item),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: item.summary || "",
    sections: item.sections || {},
    flashcards: getFocusRoomFlashcardsForHistoryItem(item),
    quizzes: getFocusRoomQuizRecordsForHistoryItem(item),
    mindMap: item.mindMap || item.mind_map || item.brainstorm || null,
    studyPlan: [],
    progressHistory: [],
    sourceFingerprint: item.sourceFingerprint || item.clientFingerprint || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || ""
  };
}

function getSynapseFocusRoomMaterials() {
  const historyMaterials = getHistory().map(focusRoomMaterialFromHistoryItem);
  const currentMaterial = getSynapseFocusRoomCurrentMaterial();
  if (!currentMaterial) return historyMaterials;
  return [
    currentMaterial,
    ...historyMaterials.filter(item => item.materialId !== currentMaterial.materialId)
  ];
}

function getSynapseFocusRoomMaterial(materialId) {
  const id = String(materialId || "");
  return getSynapseFocusRoomMaterials().find(item => item.materialId === id) || null;
}

function renderFocusRoomWorkspaceActions() {
  const button = document.getElementById("focusRoomCta");
  if (!button) return;
  const material = getSynapseFocusRoomCurrentMaterial();
  button.classList.toggle("d-none", !material);
  button.disabled = !material;
  if (material) {
    button.setAttribute("data-material-id", material.materialId);
    button.setAttribute("aria-label", `Study ${material.materialTitle} in Focus Room`);
  } else {
    button.removeAttribute("data-material-id");
    button.setAttribute("aria-label", "Study in Focus Room");
  }
}

function notifyFocusRoomMaterialsChanged() {
  window.dispatchEvent(new CustomEvent("synapse-focus-room-materials-updated", {
    detail: {
      currentMaterialId: getSynapseFocusRoomCurrentMaterial()?.materialId || "",
      count: getSynapseFocusRoomMaterials().length
    }
  }));
}

function openSynapseFocusRoom(materialId = "") {
  const requestedId = materialId || getSynapseFocusRoomCurrentMaterial()?.materialId || "";
  const suffix = requestedId ? `/${encodeURIComponent(requestedId)}` : "";
  window.location.href = `focus-room.html#/focus-room${suffix}`;
}

async function returnFromFocusRoomToWorkspace(materialId = "") {
  const id = String(materialId || "");
  try {
    if (id && getHistory().some(item => item.id === id)) {
      await loadHistoryEntry(id, { preserveScroll: true });
    }
  } catch (error) {
    console.error("Could not restore Focus Room material:", error);
  } finally {
    window.location.hash = "";
    renderFocusRoomWorkspaceActions();
    notifyFocusRoomMaterialsChanged();
  }
}
