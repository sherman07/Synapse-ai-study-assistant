import { html } from "../html.js";
import { languageOptions } from "./LanguageOptions.js";

export function NotesToolbar() {
  return html`
    <div class="notes-toolbar">
      <h2 id="sectionTitle">Study Notes</h2>
      <div class="notes-actions" aria-label="Notes actions">
        <button id="fullNotesBtn" class="notes-action-btn" type="button" onclick="showFullSummary()">
          <i class="bi bi-journal-text"></i><span>Full Notes</span>
        </button>
        <button id="sourceViewerBtn" class="notes-action-btn" type="button" onclick="toggleSourceViewer()">
          <i class="bi bi-book"></i><span>Sources</span>
        </button>
        <button id="downloadNotesBtn" class="notes-action-btn" type="button" onclick="downloadNotesPDF()">
          <i class="bi bi-download"></i><span>PDF</span>
        </button>
        <div class="notes-translate-wrap">
          <select id="notesTranslateLanguage" class="notes-language-select" aria-label="Translate notes language">
            ${languageOptions({ includePlaceholder: true })}
          </select>
        </div>
      </div>
    </div>
  `;
}
