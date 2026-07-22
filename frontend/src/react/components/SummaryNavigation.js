import { h, icon, legacyAction } from "../runtime.js";

/** Document outline panel hosted inside the unified workspace rail. */
export function SummaryNavigation() {
  return h(
    "div",
    {
      id: "summaryNav",
      className: "summary-nav workspace-nav-panel workspace-outline-panel hidden-before-analysis",
      role: "tabpanel",
      "aria-labelledby": "workspaceNavTabOutline",
      "data-workspace-nav-panel": "outline",
      hidden: true,
    },
    h(
      "div",
      { className: "workspace-outline-header" },
      h("p", { className: "workspace-outline-kicker" }, "This note"),
      h(
        "p",
        { id: "summaryNavDescription", className: "workspace-outline-lead" },
        "Your generated study outline will appear here after analysis."
      )
    ),
    h("div", { id: "sections", className: "section-list" })
  );
}
