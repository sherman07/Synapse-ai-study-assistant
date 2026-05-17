import { html } from "../html.js";

export function SourceViewerPanel() {
  return html`
    <aside id="sourceViewerPanel" class="source-viewer-panel d-none" aria-label="Uploaded source viewer">
      <div class="source-viewer-tabs" id="sourceViewerTabs"></div>
      <div class="source-viewer-toolbar">
        <div>
          <strong id="sourceViewerTitle">Uploaded sources</strong>
          <span id="sourceViewerMeta">Open a source beside your notes.</span>
        </div>
        <div class="source-viewer-tools">
          <button type="button" class="source-tool-btn" onclick="changeSourceZoom(-10)" aria-label="Zoom out">
            <i class="bi bi-zoom-out"></i>
          </button>
          <span id="sourceZoomLabel">100%</span>
          <button type="button" class="source-tool-btn" onclick="changeSourceZoom(10)" aria-label="Zoom in">
            <i class="bi bi-zoom-in"></i>
          </button>
          <button type="button" class="source-tool-btn" onclick="toggleSourceViewer(false)" aria-label="Close sources">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      <div id="sourceViewerBody" class="source-viewer-body"></div>
    </aside>
  `;
}
