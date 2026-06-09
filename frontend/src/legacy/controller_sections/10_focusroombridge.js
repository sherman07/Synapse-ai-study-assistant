function getFocusRoomSummaryText() {
  return fullSummary || summaryContent?.textContent || "";
}

function getFocusRoomFlashcardsForCurrentNote() {
  const fallbackCards = Array.isArray(currentFlashcards) ? currentFlashcards : [];
  const rawStore = typeof getFlashcardStore === "function" ? getFlashcardStore() : {};
  const store = rawStore && typeof rawStore === "object" && !Array.isArray(rawStore) ? rawStore : {};
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const record = keys.map(key => store[key]).find(item => item && Array.isArray(item.cards));
  return record?.cards || fallbackCards;
}

function getFocusRoomQuizRecordsForCurrentNote() {
  const records = Array.isArray(quizHistory) ? quizHistory : [];
  return records.map(record => ({
    id: record.id,
    title: record.title,
    questions: record.quiz?.questions || [],
    report: record.report || null
  }));
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
    flashcards: [],
    quizzes: [],
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
  window.location.hash = `#/focus-room${suffix}`;
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
