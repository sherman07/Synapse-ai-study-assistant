const LEARNING_EXPERIENCE_STORAGE_KEY = "synapse.learning.experience.mode.v1";

function syncLearningExperienceModeButtons(mode) {
  document.querySelectorAll("[data-learning-experience-target]").forEach(button => {
    const isActive = button.dataset.learningExperienceTarget === mode;
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.classList.toggle("active", isActive);
    button.classList.toggle("btn-primary", isActive);
    button.classList.toggle("btn-outline-primary", !isActive);
  });
}

function syncLearningExperienceModeStatus(mode) {
  const isCompanion = mode === "companion";
  const label = isCompanion ? "Learning companion mode" : "Materials mode";
  const iconClass = isCompanion ? "bi-chat-dots" : "bi-collection";
  const railLabel = document.getElementById("learningModeStatusText");
  if (railLabel) railLabel.textContent = label;
  const railIcon = document.querySelector(".learning-mode-status .learning-mode-status-icon");
  if (railIcon) railIcon.className = `bi ${iconClass} learning-mode-status-icon`;
  document.querySelectorAll("[data-learning-mode-status]").forEach(status => {
    const active = status.dataset.learningModeStatus === mode;
    status.dataset.active = active ? "true" : "false";
    const text = status.querySelector("span");
    if (text) text.textContent = status.dataset.learningModeStatus === "companion"
      ? "Learning companion mode"
      : "Materials mode";
  });
}

function getLearningExperienceMode() {
  return appLayout?.dataset.learningExperienceMode === "companion" ? "companion" : "materials";
}

function isGeneratedWorkspaceView() {
  const layout = document.getElementById("appLayout") || appLayout;
  if (!layout) return false;
  return (
    layout.classList.contains("generated-notes-state") ||
    layout.classList.contains("analysis-ready") ||
    layout.classList.contains("generation-job-state") ||
    layout.classList.contains("loading-state")
  );
}

/**
 * Leave the generated-notes / analysis view and open Materials or Companion home
 * without wiping the user's library history.
 */
function openWorkspaceHome(mode = "materials", { persistMode = true } = {}) {
  const layout = document.getElementById("appLayout") || appLayout;
  const desired = mode === "companion" ? "companion" : "materials";
  if (!layout) return;

  const analysis = document.getElementById("analysisStage");
  const results = document.getElementById("resultGrid");
  const loading = document.getElementById("loadingBox");
  const upload = document.getElementById("uploadStage");
  const tutor = document.getElementById("assistant");
  const tutorFab = document.getElementById("openAssistantFab");
  const sourcePanel = document.getElementById("sourceViewerPanel");

  analysis?.classList.add("d-none");
  results?.classList.add("d-none");
  loading?.classList.add("d-none");
  upload?.classList.remove("d-none");
  tutor?.classList.add("hidden");
  if (tutorFab) tutorFab.style.display = "none";
  sourcePanel?.classList.add("d-none");

  layout.classList.remove(
    "analysis-ready",
    "loading-state",
    "generation-job-state",
    "generated-notes-state"
  );
  layout.classList.add("initial-state", "assistant-closed");

  if (typeof safeRemoveLocalStorage === "function") {
    safeRemoveLocalStorage(typeof ACTIVE_HISTORY_KEY === "string" ? ACTIVE_HISTORY_KEY : "synapse.active.generated.v6");
  }

  if (typeof setWorkspaceNavTab === "function") {
    setWorkspaceNavTab("library", { persist: true, expandRail: true });
  }

  applyLearningExperienceMode(desired, { persistMode });

  requestAnimationFrame(() => {
    const shell = document.querySelector(".learning-experience-shell");
    const target = desired === "companion"
      ? document.getElementById("companionWorkspace") || shell || upload
      : upload || shell || document.body;
    target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    if (document.getElementById("mainNotes")) document.getElementById("mainNotes").scrollTop = 0;
  });
}

function applyLearningExperienceMode(mode, { persistMode = true } = {}) {
  const layout = document.getElementById("appLayout") || appLayout;
  const desired = mode === "companion" ? "companion" : "materials";
  if (!layout) return;
  layout.dataset.learningExperienceMode = desired;
  if (persistMode && typeof safeSetLocalStorage === "function") {
    safeSetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, desired);
  }
  syncLearningExperienceModeButtons(desired);
  syncLearningExperienceModeStatus(desired);
  window.dispatchEvent(new CustomEvent("synapse-learning-mode-changed", { detail: { mode: desired } }));
}

function setLearningExperienceMode(mode) {
  if (mode !== "materials" && mode !== "companion") return;
  // Rail jumps must leave the generated-notes screen; mode-only toggles stay stuck.
  if (isGeneratedWorkspaceView()) {
    openWorkspaceHome(mode);
    return;
  }
  applyLearningExperienceMode(mode);
}

const initialLearningExperienceMode = safeGetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, "");
applyLearningExperienceMode(
  initialLearningExperienceMode === "companion" ? "companion" : "materials",
  { persistMode: false }
);
