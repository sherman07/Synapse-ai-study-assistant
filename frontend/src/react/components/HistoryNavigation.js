import { html } from "../html.js";

export function HistoryNavigation() {
  return html`
    <aside id="historyNav" class="history-nav" aria-label="Generated notes history">
      <div class="history-header">
        <div class="nav-logo">
          <span class="nav-logo-icon"><img class="nav-logo-img" src="/logos/synapse.png" alt="Synapse logo"></span>
          <span class="nav-logo-text">Synapse</span>
        </div>
        <div class="account-menu" onmouseenter="renderAccountMenu()" onfocusin="renderAccountMenu()">
          <button class="history-account-btn" type="button" onclick="renderAccountMenu()" aria-haspopup="menu" aria-label="Open account menu">
            <span class="account-avatar account-menu-avatar">S</span>
            <span class="history-account-plan account-menu-plan">Starter</span>
          </button>
          <div class="account-popover" role="menu" aria-label="Account menu">
            <div class="account-popover-profile">
              <span class="account-avatar account-menu-avatar">S</span>
              <div>
                <strong class="account-menu-name">Synapse Student</strong>
                <p class="account-menu-email">Not signed in</p>
              </div>
            </div>
            <div class="account-plan-row">
              <span><i class="bi bi-lightning-charge"></i> <span class="account-menu-plan">Starter</span></span>
              <strong><span class="account-menu-credits">500</span> credits</strong>
            </div>
            <button class="account-menu-item" type="button" onclick="resetWorkspace()">
              <i class="bi bi-plus-lg"></i>
              <span>New workspace</span>
            </button>
            <button class="account-menu-item account-signed-in-only" type="button" onclick="openAccountPanel('profile')">
              <i class="bi bi-person-circle"></i>
              <span>Profile</span>
            </button>
            <button class="account-menu-item account-signed-in-only" type="button" onclick="openAccountPanel('billing')">
              <i class="bi bi-credit-card"></i>
              <span>Billing & credits</span>
            </button>
            <button class="account-menu-item account-signed-in-only" type="button" onclick="openAccountPanel('settings')">
              <i class="bi bi-gear"></i>
              <span>Settings</span>
            </button>
            <button class="account-menu-item" type="button" onclick="openAccountPanel('help')">
              <i class="bi bi-question-circle"></i>
              <span>Help</span>
            </button>
            <div class="account-menu-divider"></div>
            <button class="account-menu-item account-signed-in-only" type="button" onclick="signOutAccount()">
              <i class="bi bi-box-arrow-right"></i>
              <span>Sign out</span>
            </button>
            <button class="account-menu-item account-signed-out-only" type="button" onclick="goToAuthPage('login')">
              <i class="bi bi-box-arrow-in-right"></i>
              <span>Login</span>
            </button>
          </div>
        </div>
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
