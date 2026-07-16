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
    { className: "learning-mode-switcher learning-mode-switcher-compact", "aria-labelledby": "learningModeSwitcherLabel" },
    h("span", { id: "learningModeSwitcherLabel", className: "visually-hidden" }, "Learning workspace"),
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
