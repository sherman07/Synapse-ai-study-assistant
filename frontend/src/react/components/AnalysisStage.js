import { html } from "../html.js";
import { NotesToolbar } from "./NotesToolbar.js";
import { SourceViewerPanel } from "./SourceViewerPanel.js";
import { StudyTools } from "./StudyTools.js";

export function AnalysisStage() {
  return html`
    <section id="analysisStage" class="analysis-stage d-none">
      <section class="notes-header compact-header">
        <div>
          <h1>Generated Study Notes</h1>
          <p>Synapse analysed your materials and built a guided study overview.</p>
        </div>
        <div class="analysis-header-actions">
          <button id="focusRoomCta" class="btn btn-primary focus-room-entry-btn d-none" type="button" onclick="openSynapseFocusRoom()">
            <i class="bi bi-door-open me-1"></i>Study in Focus Room
          </button>
          <button class="btn btn-outline-primary new-upload-btn" onclick="resetWorkspace()">
            <i class="bi bi-plus-lg me-1"></i>New upload
          </button>
        </div>
      </section>

      <div id="loadingBox" class="loading-box d-none">
        <div class="synapse-ai-loader refined-loader" aria-hidden="true">
          <div class="loader-orbit loader-orbit-one"></div>
          <div class="loader-orbit loader-orbit-two"></div>
          <div class="vector-logo-loader">
            <img class="rotating-vector-logo" src="/logos/synapse_no_spark.png" alt="Synapse loading logo">
            <div class="loading-star">
              <svg viewBox="0 0 24 24" class="synapse-spark">
                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z"/>
              </svg>
            </div>
          </div>
        </div>
        <h3>Synapse is analysing your material...</h3>
        <p>Reading sources, explaining ideas, and preparing your tutor-style notes.</p>
      </div>

      <div id="resultGrid" class="result-grid d-none">
        <section class="notes-card">
          ${NotesToolbar()}
          <div id="summaryContent" class="summary-content"></div>
          <div id="visualGallery" class="visual-gallery d-none"></div>
        </section>

        ${SourceViewerPanel()}
        ${StudyTools()}
      </div>
    </section>
  `;
}
