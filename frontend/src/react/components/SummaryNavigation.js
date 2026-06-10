import { h, icon, legacyAction } from "../runtime.js";

export function SummaryNavigation() {
  return h(
    "aside",
    { id: "summaryNav", className: "summary-nav hidden-before-analysis" },
    h(
      "div",
      { className: "nav-header" },
      h(
        "div",
        { className: "nav-logo" },
        h(
          "span",
          { className: "nav-logo-icon" },
          h("img", { className: "nav-logo-img", src: "/logos/synapse.png", alt: "Synapse logo" })
        ),
        h("span", { className: "nav-logo-text" }, "Synapse"),
        h(
          "button",
          {
            id: "summaryNavToggle",
            className: "summary-nav-toggle",
            type: "button",
            onClick: legacyAction("toggleSummaryNav"),
            "aria-label": "Collapse sections",
            "aria-expanded": "true",
            title: "Collapse sections",
          },
          icon("bi-chevron-double-left")
        )
      ),
      h("p", null, "Generated headings will appear here after analysis.")
    ),
    h("div", { id: "sections", className: "section-list" })
  );
}
