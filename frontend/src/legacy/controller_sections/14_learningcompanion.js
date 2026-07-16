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

function getLearningExperienceMode() {
  return appLayout?.dataset.learningExperienceMode === "companion" ? "companion" : "materials";
}

function setLearningExperienceMode(mode) {
  if (mode !== "materials" && mode !== "companion") return;
  appLayout.dataset.learningExperienceMode = mode;
  safeSetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, mode);
  syncLearningExperienceModeButtons(mode);
  window.dispatchEvent(new CustomEvent("synapse-learning-mode-changed", { detail: { mode } }));
}

const initialLearningExperienceMode = safeGetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, "");
setLearningExperienceMode(initialLearningExperienceMode === "companion" ? "companion" : "materials");
