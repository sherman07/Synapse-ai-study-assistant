import { html } from "../html.js";

export function StudyTools() {
  return html`
    <section class="brainstorm-card study-tools-card">
      <div class="study-tools-head">
        <div>
          <h2>Study Tools</h2>
          <p>Open interactive tools generated from your notes. More tools can be added here later.</p>
        </div>
        <i class="bi bi-grid-1x2 study-tools-icon"></i>
      </div>

      <div class="tool-switcher" role="tablist" aria-label="Study tools">
        <button id="toolBtnMindMap" class="tool-switch-btn active" type="button" onclick="switchTool('mindmap', this)">
          <i class="bi bi-diagram-3 me-1"></i>Mind Map
        </button>
        <button class="tool-switch-btn disabled" type="button" disabled>
          <i class="bi bi-signpost-split me-1"></i>Study Path
        </button>
        <button class="tool-switch-btn disabled" type="button" disabled>
          <i class="bi bi-patch-question me-1"></i>Quiz
        </button>
      </div>

      <div id="toolPanelMindMap" class="tool-panel active">
        <div class="tool-panel-head">
          <div>
            <h3>Mind Map</h3>
            <p>Click any branch or point to jump into the related note section. The mind map opens automatically after generation.</p>
          </div>
        </div>
        <div id="mindMapCanvas" class="mindmap-canvas"></div>
      </div>
    </section>
  `;
}
