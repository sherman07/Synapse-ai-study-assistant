import { h, icon, legacyAction } from "../runtime.js";
import { LanguageSelect } from "./LanguageOptions.js?v=react-shell-v2";

export function NotesToolbar() {
  return h(
    "div",
    { className: "notes-toolbar" },
    h("h2", { id: "sectionTitle" }, "Study Notes"),
    h(
      "div",
      { className: "notes-actions", "aria-label": "Notes actions" },
      h(
        "button",
        {
          id: "fullNotesBtn",
          className: "notes-action-btn",
          type: "button",
          onClick: legacyAction("showFullSummary"),
        },
        icon("bi-journal-text"),
        h("span", null, "Full Notes")
      ),
      h(
        "button",
        {
          id: "sourceViewerBtn",
          className: "notes-action-btn",
          type: "button",
          onClick: legacyAction("toggleSourceViewer"),
        },
        icon("bi-book"),
        h("span", null, "Sources")
      ),
      h(
        "button",
        {
          id: "downloadNotesBtn",
          className: "notes-action-btn",
          type: "button",
          onClick: legacyAction("downloadNotesPDF"),
        },
        icon("bi-download"),
        h("span", null, "PDF")
      ),
      h(
        "div",
        { className: "notes-translate-wrap" },
        h(LanguageSelect, {
          id: "notesTranslateLanguage",
          className: "notes-language-select",
          includePlaceholder: true,
          ariaLabel: "Translate notes language",
        })
      )
    )
  );
}
