import { html } from "../html.js";

export function SummaryNavigation() {
  return html`
    <aside id="summaryNav" class="summary-nav hidden-before-analysis">
      <div class="nav-header">
        <div class="nav-logo">
          <span class="nav-logo-icon"><img class="nav-logo-img" src="/logos/synapse.png" alt="Synapse logo"></span>
          <span class="nav-logo-text">Synapse</span>
          <button id="summaryNavToggle" class="summary-nav-toggle" type="button" onclick="toggleSummaryNav()" aria-label="Collapse sections" aria-expanded="true" title="Collapse sections">
            <i class="bi bi-chevron-double-left"></i>
          </button>
        </div>
        <p>Generated headings will appear here after analysis.</p>
      </div>
      <div id="sections" class="section-list"></div>
    </aside>
  `;
}
