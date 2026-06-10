import { h, icon, legacyAction } from "../runtime.js";

export function SourceViewerPanel() {
  return h(
    "aside",
    {
      id: "sourceViewerPanel",
      className: "source-viewer-panel d-none",
      "aria-label": "Uploaded source viewer",
    },
    h("div", { className: "source-viewer-tabs", id: "sourceViewerTabs" }),
    h(
      "div",
      { className: "source-viewer-toolbar" },
      h(
        "div",
        null,
        h("strong", { id: "sourceViewerTitle" }, "Uploaded sources"),
        h("span", { id: "sourceViewerMeta" }, "Open a source beside your notes.")
      ),
      h(
        "div",
        { className: "source-viewer-tools" },
        h(
          "button",
          {
            type: "button",
            className: "source-tool-btn",
            onClick: legacyAction("changeSourceZoom", -10),
            "aria-label": "Zoom out",
          },
          icon("bi-zoom-out")
        ),
        h("span", { id: "sourceZoomLabel" }, "100%"),
        h(
          "button",
          {
            type: "button",
            className: "source-tool-btn",
            onClick: legacyAction("changeSourceZoom", 10),
            "aria-label": "Zoom in",
          },
          icon("bi-zoom-in")
        ),
        h(
          "button",
          {
            type: "button",
            className: "source-tool-btn",
            onClick: legacyAction("toggleSourceViewer", false),
            "aria-label": "Close sources",
          },
          icon("bi-x-lg")
        )
      )
    ),
    h("div", { id: "sourceViewerBody", className: "source-viewer-body" })
  );
}
