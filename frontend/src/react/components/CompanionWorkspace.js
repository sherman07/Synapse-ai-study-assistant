import { h, icon, legacyAction } from "../runtime.js";

function companionStep(iconName, title, body) {
  return h(
    "article",
    { className: "companion-workspace-step" },
    h("div", { className: "companion-workspace-step-icon", "aria-hidden": "true" }, icon(iconName)),
    h(
      "div",
      null,
      h("h3", null, title),
      h("p", null, body)
    )
  );
}

export function CompanionWorkspace() {
  return h(
    "section",
    { id: "companionWorkspace", className: "companion-workspace", "aria-labelledby": "companionWorkspaceTitle" },
    h(
      "div",
      { className: "companion-workspace-card" },
      h("p", { className: "learning-mode-switcher-eyebrow" }, "AI Learning Companion"),
      h("h1", { id: "companionWorkspaceTitle" }, "Study with a guided companion workspace"),
      h("p", { className: "companion-workspace-intro" }, "Keep your materials ready in the workspace while Synapse coaches you through questions, explanations, and next steps."),
      h(
        "div",
        { className: "companion-workspace-grid" },
        companionStep("bi-chat-dots", "Ask for guidance", "Open the assistant for hints, explanations, or a simpler next question."),
        companionStep("bi-journal-check", "Track understanding", "Use the companion view as a dedicated study shell without losing the upload workspace underneath."),
        companionStep("bi-arrow-repeat", "Switch back instantly", "Return to materials whenever you want to upload, adjust prompt mode, or regenerate notes.")
      ),
      h(
        "div",
        { className: "companion-workspace-actions" },
        h(
          "button",
          {
            type: "button",
            className: "btn btn-primary",
            onClick: legacyAction("openAssistant"),
          },
          icon("bi-stars", "me-2"),
          "Open assistant"
        )
      )
    )
  );
}
