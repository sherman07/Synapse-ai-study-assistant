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

function setLearningExperienceMode(mode) {
  if (mode !== "materials" && mode !== "companion") return;
  appLayout.dataset.learningExperienceMode = mode;
  safeSetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, mode);
  syncLearningExperienceModeButtons(mode);
  syncLearningExperienceModeStatus(mode);
  window.dispatchEvent(new CustomEvent("synapse-learning-mode-changed", { detail: { mode } }));
}

const initialLearningExperienceMode = safeGetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, "");
setLearningExperienceMode(initialLearningExperienceMode === "companion" ? "companion" : "materials");
