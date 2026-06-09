function getFocusRoomSummaryText() {
  return fullSummary || summaryContent?.textContent || "";
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
    flashcards: Array.isArray(currentFlashcards) ? currentFlashcards : [],
    quizzes: Array.isArray(quizHistory) ? quizHistory : [],
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
  if (currentMaterial && !historyMaterials.some(item => item.materialId === currentMaterial.materialId)) {
    return [currentMaterial, ...historyMaterials];
  }
  return historyMaterials;
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

function returnFromFocusRoomToWorkspace(materialId = "") {
  const id = String(materialId || "");
  if (id && getHistory().some(item => item.id === id)) {
    loadHistoryEntry(id, { preserveScroll: true });
  }
  window.location.hash = "";
  renderFocusRoomWorkspaceActions();
}
