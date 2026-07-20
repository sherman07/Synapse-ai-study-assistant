import { h, icon, legacyAction, legacyTargetAction } from "../runtime.js";

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
        h("p", null, "Check readiness, practise weak topics, and turn generated notes into active study.")
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
        {
          id: "toolBtnTimeline",
          className: "tool-switch-btn",
          type: "button",
          onClick: legacyTargetAction("switchTool", "timeline"),
        },
        icon("bi-signpost-split", "me-1"),
        "Study Path"
      ),
      h(
        "button",
        {
          id: "toolBtnQuiz",
          className: "tool-switch-btn",
          type: "button",
          onClick: legacyTargetAction("switchTool", "quiz"),
        },
        icon("bi-patch-question", "me-1"),
        "Quiz"
      ),
      h(
        "button",
        {
          id: "toolBtnMasteryGraph",
          className: "tool-switch-btn",
          type: "button",
          onClick: legacyTargetAction("switchTool", "masterygraph"),
        },
        icon("bi-repeat", "me-1"),
        "Exam Readiness"
      ),
      h(
        "button",
        {
          id: "toolBtnBroadcast",
          className: "tool-switch-btn",
          type: "button",
          onClick: legacyTargetAction("switchTool", "broadcast"),
        },
        icon("bi-broadcast-pin", "me-1"),
        "AI Broadcast"
      )
    ),
    h(
      "div",
      { id: "toolPanelMindMap", className: "tool-panel active" },
      h(
        "div",
        { className: "tool-panel-head d-flex align-items-start justify-content-between gap-3 mb-3" },
        h(
          "div",
          null,
          h("h3", null, "Mind Map"),
          h("p", null, "Click any branch or point to jump into the related note section. The mind map opens automatically after generation.")
        ),
        h(
          "button",
          {
            className: "btn btn-outline-primary btn-sm flex-shrink-0",
            type: "button",
            onClick: legacyAction("openStudyToolSettingsModal", "mindmap"),
          },
          icon("bi-sliders", "me-1"),
          "Mind map settings"
        )
      ),
      h("div", { id: "mindMapCanvas", className: "mindmap-canvas" })
    ),
    h(
      "div",
      { id: "toolPanelBroadcast", className: "tool-panel" },
      h(
        "div",
        { className: "tool-panel-head d-flex align-items-start justify-content-between gap-3 mb-3" },
        h(
          "div",
          null,
          h("h3", null, "AI Broadcast"),
          h("p", null, "Tune the episode style, length, voice format, depth, and language before generating.")
        ),
        h(
          "button",
          {
            className: "btn btn-outline-primary btn-sm flex-shrink-0",
            type: "button",
            onClick: legacyAction("openAiBroadcastSetup"),
          },
          icon("bi-sliders", "me-1"),
          "Broadcast settings"
        )
      ),
      h(
        "div",
        { id: "broadcastWorkspace", className: "broadcast-workspace" },
        h(
          "div",
          { className: "study-tool-launch", "data-study-tool-launch": "broadcast", "data-generation-cost": "0" },
          h("div", { className: "study-tool-launch-icon", "aria-hidden": "true" }, icon("bi-broadcast-pin")),
          h(
            "div",
            { className: "study-tool-launch-copy" },
            h("span", { className: "study-tool-launch-kicker" }, "Listen and revise"),
            h("h4", null, "Create an AI broadcast"),
            h("p", null, "Turn the current notes into a natural study episode with explanations, examples, and a guided recap.")
          ),
          h("div", { className: "study-tool-launch-meta" }, icon("bi-lightning-charge-fill"), "No tokens used for this first generation"),
          h(
            "button",
            {
              className: "btn btn-primary study-tool-generate-btn",
              type: "button",
              "data-study-tool-generate": "broadcast",
              "data-token-cost": "0",
              onClick: legacyTargetAction("generateBroadcastFromSetup"),
            },
            icon("bi-stars", "me-2"),
            "Generate broadcast"
          )
        )
      )
    )
  );
}
