import { h, icon, legacyAction } from "../runtime.js";

export function HistoryNavigation() {
  return h(
    "aside",
    { id: "historyNav", className: "history-nav dark-learning-rail", "aria-label": "Synapse learning navigation" },
      h(
        "div",
        { className: "history-header" },
        h(
          "div",
          { className: "nav-logo" },
          h(
            "span",
            { className: "nav-logo-icon" },
            h("img", { className: "nav-logo-img", src: "/logos/synapse.png", alt: "Synapse logo" })
          ),
          h("span", { className: "nav-logo-text" }, "Synapse")
        ),
        h(
          "button",
          {
            id: "historyNavToggle",
            className: "history-nav-toggle",
            type: "button",
            onClick: legacyAction("toggleHistoryNav"),
            "aria-label": "Hide learning navigation",
            "aria-expanded": "true",
            title: "Hide learning navigation",
          },
          icon("bi-chevron-double-left")
        ),
        h(
          "div",
          {
            className: "account-menu history-account-rail",
            onMouseEnter: legacyAction("renderAccountMenu"),
            onFocus: legacyAction("renderAccountMenu"),
          },
        h(
          "button",
          {
            className: "history-account-btn",
            type: "button",
            onClick: legacyAction("renderAccountMenu"),
            "aria-haspopup": "menu",
            "aria-label": "Open account menu",
          },
          h("span", { className: "account-avatar account-menu-avatar" }, "GS"),
          h("span", { className: "history-account-plan account-menu-plan" }, "Free")
        ),
        h(
          "div",
          { className: "account-popover", role: "menu", "aria-label": "Account menu" },
          h(
            "div",
            { className: "account-popover-profile" },
            h("span", { className: "account-avatar account-menu-avatar" }, "S"),
            h(
              "div",
              null,
              h("strong", { className: "account-menu-name" }, "Guest Student"),
              h("p", { className: "account-menu-email" }, "Not signed in")
            )
          ),
          h(
            "div",
            { className: "account-plan-row" },
            h("span", null, icon("bi-lightning-charge"), " ", h("span", { className: "account-menu-plan" }, "Free")),
            h("strong", null, h("span", { className: "account-menu-credits" }, "0"), " credits")
          ),
          h(
            "button",
            { className: "account-menu-item", type: "button", onClick: legacyAction("resetWorkspace") },
            icon("bi-plus-lg"),
            h("span", null, "New workspace")
          ),
          h(
            "button",
            { className: "account-menu-item account-signed-in-only", type: "button", style: { display: "none" }, onClick: legacyAction("openAccountPanel", "profile") },
            icon("bi-person-circle"),
            h("span", null, "Profile")
          ),
          h(
            "button",
            { className: "account-menu-item account-signed-in-only", type: "button", style: { display: "none" }, onClick: legacyAction("openAccountPanel", "billing") },
            icon("bi-credit-card"),
            h("span", null, "Billing & credits")
          ),
          h(
            "button",
            { className: "account-menu-item account-signed-in-only", type: "button", style: { display: "none" }, onClick: legacyAction("openAccountPanel", "settings") },
            icon("bi-gear"),
            h("span", null, "Settings")
          ),
          h(
            "button",
            { className: "account-menu-item", type: "button", onClick: legacyAction("openAccountPanel", "help") },
            icon("bi-question-circle"),
            h("span", null, "Help")
          ),
          h("div", { className: "account-menu-divider" }),
          h(
            "button",
            { className: "account-menu-item account-signed-in-only", type: "button", style: { display: "none" }, onClick: legacyAction("signOutAccount") },
            icon("bi-box-arrow-right"),
            h("span", null, "Sign out")
          ),
          h(
            "button",
            { className: "account-menu-item account-signed-out-only", type: "button", onClick: legacyAction("goToAuthPage", "login") },
            icon("bi-box-arrow-in-right"),
            h("span", null, "Login")
          )
        )
      )
    ),
    h(
      "nav",
      { className: "learning-rail-actions", "aria-label": "Learning workspace" },
      h(
        "button",
        {
          className: "learning-rail-action learning-rail-new-chat",
          type: "button",
          onClick: legacyAction("resetWorkspace"),
          "data-feature-flag": "new-chat",
          "data-feature-flag-label": "New chat",
          title: "Start a new chat",
        },
        icon("bi-pencil-square"),
        h("span", { className: "learning-rail-action-label" }, "New chat"),
        h("span", { className: "learning-rail-feature-tag", "aria-hidden": "true" }, "new chat")
      ),
      h(
        "button",
        {
          className: "learning-rail-action learning-rail-materials",
          type: "button",
          onClick: legacyAction("setLearningExperienceMode", "materials"),
          "data-learning-experience-target": "materials",
          "aria-pressed": "true",
        },
        icon("bi-collection"),
        h("span", null, "Materials")
      ),
      h(
        "button",
        {
          className: "learning-rail-action learning-rail-companion",
          type: "button",
          onClick: legacyAction("setLearningExperienceMode", "companion"),
          "data-learning-experience-target": "companion",
          "aria-pressed": "false",
        },
        icon("bi-chat-dots"),
        h("span", null, "Learning companion")
      ),
      h(
        "button",
        {
          className: "learning-rail-action learning-rail-focus-room",
          type: "button",
          onClick: legacyAction("openSynapseFocusRoom"),
          "aria-label": "Open Focus Room",
        },
        icon("bi-bullseye"),
        h("span", null, "Focus Room")
      )
    ),
    h(
      "div",
      { className: "learning-mode-status", role: "status", "aria-live": "polite" },
      icon("bi-collection", "learning-mode-status-icon"),
      h("span", { id: "learningModeStatusText" }, "Materials mode")
    ),
    h(
      "div",
      { className: "history-search-wrap" },
      icon("bi-search"),
      h("input", {
        id: "historySearch",
        type: "search",
        placeholder: "Search generated notes...",
        "aria-label": "Search generated notes history",
      })
    ),
    h("div", { className: "history-section-title" }, "Recent learning"),
    h(
      "div",
      { id: "historyList", className: "history-list" },
      h("p", { className: "history-empty" }, "No generated notes yet.")
    )
  );
}
