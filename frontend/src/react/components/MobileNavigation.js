import { Fragment, h, icon, legacyAction } from "../runtime.js";

export function MobileNavigation() {
  const brand = h(
    "div",
    { className: "mobile-brand" },
    h(
      "span",
      { className: "brand-dot" },
      h("img", { className: "brand-logo-img", src: "/logos/synapse.png", alt: "Synapse logo" })
    ),
    h("strong", null, "Synapse")
  );

  return h(
    Fragment,
    null,
    h(
      "nav",
      { className: "mobile-topbar", "aria-label": "Mobile navigation" },
      h(
        "button",
        {
          className: "mobile-menu-btn",
          type: "button",
          "data-bs-toggle": "offcanvas",
          "data-bs-target": "#mobileNav",
          "aria-controls": "mobileNav",
          "aria-label": "Open menu",
        },
        icon("bi-list")
      ),
      brand,
      h("div", { className: "mobile-topbar-spacer" })
    ),
    h(
      "div",
      {
        className: "offcanvas offcanvas-top mobile-offcanvas",
        tabIndex: -1,
        id: "mobileNav",
        "aria-labelledby": "mobileNavLabel",
      },
      h(
        "div",
        { className: "offcanvas-header" },
        h(
          "div",
          { className: "mobile-brand", id: "mobileNavLabel" },
          h(
            "span",
            { className: "brand-dot" },
            h("img", { className: "brand-logo-img", src: "/logos/synapse.png", alt: "Synapse logo" })
          ),
          h("strong", null, "Synapse")
        ),
        h("button", {
          type: "button",
          className: "btn-close",
          "data-bs-dismiss": "offcanvas",
          "aria-label": "Close",
        })
      ),
      h(
        "div",
        { className: "offcanvas-body" },
        h(
          "div",
          { className: "mobile-nav-actions" },
          h(
            "button",
            {
              className: "mobile-account-summary",
              type: "button",
              onClick: legacyAction("openAccountPanel", "profile"),
              "data-bs-dismiss": "offcanvas",
            },
            h("span", { className: "account-avatar account-menu-avatar" }, "S"),
            h(
              "div",
              null,
              h("strong", { className: "account-menu-name" }, "Synapse Student"),
              h("p", { className: "account-menu-email" }, "Not signed in")
            )
          ),
          h(
            "button",
            {
              className: "history-new-btn mobile-new-btn",
              type: "button",
              onClick: legacyAction("resetWorkspace"),
              "data-bs-dismiss": "offcanvas",
            },
            icon("bi-plus-lg"),
            " New workspace"
          )
        ),
        h(
          "div",
          { className: "history-search-wrap mobile-history-search-wrap" },
          icon("bi-search"),
          h("input", {
            id: "mobileHistorySearch",
            type: "search",
            placeholder: "Search generated notes...",
            "aria-label": "Search generated notes history",
          })
        ),
        h("div", { className: "history-section-title mobile-history-title" }, "Recent Generated Notes"),
        h(
          "div",
          { id: "mobileHistoryList", className: "history-list mobile-history-list" },
          h("p", { className: "history-empty" }, "No generated notes yet.")
        ),
        h("div", { className: "mobile-nav-divider" }),
        h("p", { className: "mobile-nav-caption" }, "Current note sections"),
        h("div", { id: "mobileSections", className: "section-list" })
      )
    )
  );
}
