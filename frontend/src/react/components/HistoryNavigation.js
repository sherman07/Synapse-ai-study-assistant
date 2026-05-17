import { html } from "../html.js";

export function HistoryNavigation() {
  return html`
    <aside id="historyNav" class="history-nav" aria-label="Generated notes history">
      <div class="history-header">
        <div class="nav-logo">
          <span class="nav-logo-icon"><img class="nav-logo-img" src="/logos/synapse.png" alt="Synapse logo"></span>
          <span class="nav-logo-text">Synapse</span>
        </div>
        <button class="history-new-btn" type="button" onclick="resetWorkspace()">
          <i class="bi bi-plus-lg"></i> New
        </button>
      </div>
      <div class="history-search-wrap">
        <i class="bi bi-search"></i>
        <input id="historySearch" type="search" placeholder="Search generated notes..." aria-label="Search generated notes history">
      </div>
      <div class="history-section-title">Recent Generated Notes</div>
      <div id="historyList" class="history-list">
        <p class="history-empty">No generated notes yet.</p>
      </div>
    </aside>
  `;
}
