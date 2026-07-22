import { h, icon, legacyAction, legacyTargetAction } from "../runtime.js";

export function AssistantPanel() {
  return h(
    "aside",
    { id: "assistant", className: "assistant-panel hidden-before-analysis" },
    h(
      "div",
      { className: "assistant-header" },
      h(
        "button",
        { className: "icon-btn", title: "New Chat", type: "button", onClick: legacyAction("clearChat") },
        icon("bi-plus-lg")
      ),
      h(
        "div",
        { className: "assistant-title" },
        h("span", { className: "assistant-logo-dot" }),
        h("h4", null, "Synapse Tutor")
      ),
      h(
        "div",
        { className: "d-flex gap-2" },
        h(
          "button",
          { className: "icon-btn", title: "Expand", type: "button", onClick: legacyAction("expandAssistant") },
          icon("bi-arrows-fullscreen")
        ),
        h(
          "button",
          { className: "icon-btn", title: "Close", type: "button", onClick: legacyAction("closeAssistant") },
          icon("bi-x-lg")
        )
      )
    ),
    h(
      "div",
      { className: "assistant-tabs" },
      h(
        "button",
        { className: "asst-tab active", type: "button", onClick: legacyTargetAction("switchTab", "chat") },
        icon("bi-chat-dots", "me-1"),
        "Chat"
      ),
      h(
        "button",
        { className: "asst-tab", type: "button", onClick: legacyTargetAction("switchTab", "voice") },
        icon("bi-mic", "me-1"),
        "Voice"
      ),
      h(
        "button",
        { className: "asst-tab", type: "button", onClick: legacyTargetAction("switchTab", "connections") },
        icon("bi-diagram-3", "me-1"),
        "Connections"
      )
    ),
    h(
      "div",
      { id: "tab-chat", className: "tab-panel active" },
      h(
        "div",
        { id: "chatMessages", className: "chat-area" },
        h(
          "div",
          { className: "assistant-empty" },
          icon("bi-chat-dots"),
          h("p", null, "Ask questions about your generated notes.")
        )
      ),
      h(
        "div",
        { className: "quick-actions" },
        h("button", { className: "btn btn-light quick-btn", type: "button", onClick: legacyAction("quickAsk", "Summarise my current notes clearly.") }, "Summarise"),
        h("button", { className: "btn btn-light quick-btn", type: "button", onClick: legacyAction("quickAsk", "Explain the most difficult idea like a tutor.") }, "Explain concept"),
        h("button", { className: "btn btn-light quick-btn", type: "button", onClick: legacyAction("quickAsk", "Challenge my understanding with tutorial questions.") }, "Challenge me")
      ),
      h(
        "div",
        { className: "assistant-input-card" },
        h("textarea", {
          id: "questionInput",
          className: "form-control",
          placeholder: "Ask anything about your material...",
          rows: 3,
        }),
        h(
          "div",
          { className: "input-toolbar" },
          h(
            "span",
            { className: "context-pill" },
            icon("bi-at"),
            h("span", { id: "contextLabel" }, "Current Notes")
          ),
          h(
            "button",
            { className: "send-btn", type: "button", onClick: legacyAction("askAI"), "aria-label": "Send message" },
            icon("bi-arrow-return-left")
          )
        )
      )
    ),
    h(
      "div",
      { id: "tab-voice", className: "tab-panel" },
      h(
        "div",
        { className: "voice-tutor-panel" },
        h(
          "div",
          { className: "voice-tutor-status" },
          h(
            "div",
            null,
            h("span", { id: "voiceTutorState", className: "voice-state-pill" }, "Ready"),
            h("h5", null, "Voice Tutor"),
            h("p", { id: "voiceTutorDiagnosis" }, "Start a spoken diagnostic session for the current notes.")
          ),
          h(
            "div",
            { className: "voice-mastery", "aria-label": "Voice tutor learning progress" },
            h(
              "div",
              { className: "voice-mastery-top" },
              h("span", { className: "voice-mastery-label" }, "Progress"),
              h("span", { id: "voiceTutorMastery" }, "0%")
            ),
            h("div", { className: "voice-mastery-bar" }, h("span", { id: "voiceTutorMasteryFill" })),
            h("span", { id: "voiceTutorProgressLabel", className: "voice-mastery-caption" }, "Ready to diagnose")
          )
        ),
        h(
          "div",
          { id: "voiceMessages", className: "voice-chat-area" },
          h(
            "div",
            { className: "assistant-empty voice-empty" },
            icon("bi-mic"),
            h("p", null, "Start with what you already understand. Synapse will adapt the questions until you are ready.")
          )
        ),
        h(
          "div",
          { id: "voiceTutorActions", className: "voice-actions" },
          h(
            "button",
            {
              id: "voiceRecordBtn",
              className: "btn btn-primary voice-primary-btn",
              type: "button",
              onClick: legacyAction("startVoiceTutorSession"),
            },
            icon("bi-telephone-fill", "me-1"),
            "Start live tutor"
          ),
          h(
            "button",
            {
              id: "voiceMuteBtn",
              className: "btn btn-outline-primary voice-record-btn",
              type: "button",
              onClick: legacyAction("toggleVoiceTutorMute"),
              disabled: true,
            },
            icon("bi-mic-mute", "me-1"),
            "Mute mic"
          ),
          h(
            "button",
            {
              className: "btn btn-light voice-small-btn",
              type: "button",
              onClick: legacyAction("sendVoiceTutorText", "I am stuck. Please give me a hint and a simpler question."),
              disabled: true,
              "data-voice-requires-session": true,
            },
            "Hint"
          )
        ),
        h(
          "div",
          { className: "voice-text-fallback" },
          h("textarea", {
            id: "voiceTextInput",
            className: "form-control",
            rows: 2,
            placeholder: "Type an answer if you cannot use the microphone...",
          }),
          h(
            "button",
            {
              className: "send-btn",
              type: "button",
              onClick: legacyAction("sendVoiceTutorTypedAnswer"),
              "aria-label": "Send typed voice answer",
            },
            icon("bi-arrow-return-left")
          )
        ),
        h(
          "div",
          { className: "voice-footer" },
          h("span", { className: "voice-speak-toggle" }, icon("bi-broadcast-pin"), " GPT Realtime voice"),
          h(
            "button",
            {
              className: "btn btn-link voice-link-btn",
              type: "button",
              onClick: legacyAction("resetVoiceTutorSession"),
            },
            "Reset voice tutor"
          )
        )
      )
    ),
    h(
      "div",
      { id: "tab-connections", className: "tab-panel" },
      h(
        "div",
        { className: "connections-panel" },
        h(
          "div",
          { id: "connectionsEmpty", className: "assistant-empty" },
          icon("bi-diagram-3"),
          h("p", null, "Connections will appear after analysis.")
        ),
        h("div", { id: "connectionsList", className: "connections-list d-none" })
      )
    )
  );
}

export function OpenAssistantButton() {
  return h(
    "button",
    {
      id: "openAssistantFab",
      className: "open-assistant-fab",
      type: "button",
      onClick: legacyAction("openAssistant"),
      "aria-label": "Open Tutor",
    },
    icon("bi-chat-left-text", "me-2"),
    "Open Tutor"
  );
}
