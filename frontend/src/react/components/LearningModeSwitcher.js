import { h, legacyAction } from "../runtime.js";

function modeButton(mode, label, pressed) {
  return h(
    "button",
    {
      type: "button",
      className: `btn ${pressed ? "btn-primary active" : "btn-outline-primary"} learning-mode-btn`,
      "data-learning-experience-target": mode,
      "aria-pressed": pressed ? "true" : "false",
      onClick: legacyAction("setLearningExperienceMode", mode),
    },
    label
  );
}

export function LearningModeSwitcher() {
  return h(
    "section",
    { className: "learning-mode-switcher", "aria-labelledby": "learningModeSwitcherLabel" },
    h(
      "div",
      { className: "learning-mode-switcher-copy" },
      h("p", { className: "learning-mode-switcher-eyebrow" }, "Choose your workspace"),
      h("h2", { id: "learningModeSwitcherLabel" }, "How would you like to study right now?"),
      h("p", null, "Stay in materials to upload and generate notes, or switch to companion for guided study support.")
    ),
    h(
      "div",
      {
        className: "btn-group learning-mode-switcher-group",
        role: "group",
        "aria-label": "Learning experience mode",
      },
      modeButton("materials", "Materials", true),
      modeButton("companion", "Companion", false)
    )
  );
}
