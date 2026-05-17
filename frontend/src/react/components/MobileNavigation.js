import { html } from "../html.js";

export function MobileNavigation() {
  return html`
    <nav class="mobile-topbar" aria-label="Mobile navigation">
      <button class="mobile-menu-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-controls="mobileNav" aria-label="Open menu">
        <i class="bi bi-list"></i>
      </button>
      <div class="mobile-brand">
        <span class="brand-dot"><img class="brand-logo-img" src="/logos/synapse.png" alt="Synapse logo"></span>
        <strong>Synapse</strong>
      </div>
      <div class="mobile-topbar-spacer"></div>
    </nav>

    <div class="offcanvas offcanvas-top mobile-offcanvas" tabindex="-1" id="mobileNav" aria-labelledby="mobileNavLabel">
      <div class="offcanvas-header">
        <div class="mobile-brand" id="mobileNavLabel">
          <span class="brand-dot"><img class="brand-logo-img" src="/logos/synapse.png" alt="Synapse logo"></span>
          <strong>Synapse</strong>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <div class="mobile-nav-actions">
          <button class="history-new-btn mobile-new-btn" type="button" onclick="resetWorkspace()" data-bs-dismiss="offcanvas">
            <i class="bi bi-plus-lg"></i> New
          </button>
        </div>
        <div class="history-search-wrap mobile-history-search-wrap">
          <i class="bi bi-search"></i>
          <input id="mobileHistorySearch" type="search" placeholder="Search generated notes..." aria-label="Search generated notes history">
        </div>
        <div class="history-section-title mobile-history-title">Recent Generated Notes</div>
        <div id="mobileHistoryList" class="history-list mobile-history-list">
          <p class="history-empty">No generated notes yet.</p>
        </div>
        <div class="mobile-nav-divider"></div>
        <p class="mobile-nav-caption">Current note sections</p>
        <div id="mobileSections" class="section-list"></div>
      </div>
    </div>
  `;
}
