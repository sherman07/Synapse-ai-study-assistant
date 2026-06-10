import { h, icon, legacyTargetAction } from "../runtime.js";

export function StudyTools() {
  return h(
    "section",
    { className: "brainstorm-card study-tools-card" },
    h(
      "div",
      { className: "study-tools-head" },
      h(
        "div",
        null,
        h("h2", null, "Study Tools"),
        h("p", null, "Open interactive tools generated from your notes. More tools can be added here later.")
      ),
      icon("bi-grid-1x2", "study-tools-icon")
    ),
    h(
      "div",
      { className: "tool-switcher", role: "tablist", "aria-label": "Study tools" },
      h(
        "button",
        {
          id: "toolBtnMindMap",
          className: "tool-switch-btn active",
          type: "button",
          onClick: legacyTargetAction("switchTool", "mindmap"),
        },
        icon("bi-diagram-3", "me-1"),
        "Mind Map"
      ),
      h(
        "button",
        { className: "tool-switch-btn disabled", type: "button", disabled: true },
        icon("bi-signpost-split", "me-1"),
        "Study Path"
      ),
      h(
        "button",
        { className: "tool-switch-btn disabled", type: "button", disabled: true },
        icon("bi-patch-question", "me-1"),
        "Quiz"
      )
    ),
    h(
      "div",
      { id: "toolPanelMindMap", className: "tool-panel active" },
      h(
        "div",
        { className: "tool-panel-head" },
        h(
          "div",
          null,
          h("h3", null, "Mind Map"),
          h("p", null, "Click any branch or point to jump into the related note section. The mind map opens automatically after generation.")
        )
      ),
      h("div", { id: "mindMapCanvas", className: "mindmap-canvas" })
    )
  );
}
