# Focus Room Liquid Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Synapse Focus Room UI into the approved cinematic iOS liquid-glass experience while preserving all existing Focus Room behavior.

**Architecture:** Keep the existing static frontend module boundaries. `frontend/src/focus-room/controller.js` renders the new setup, active session, drawer, history, and summary markup from current state; `frontend/styles/09-focus-room.css` provides the liquid-glass visual system and responsive layout; existing data/audio modules keep their current responsibilities.

**Tech Stack:** Static HTML/CSS/ES modules, browser `localStorage`, existing Focus Room regression scripts, bundled Node.js at `/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

---

## Preflight Notes

- The worktree already contains unstaged Focus Room/audio changes. Treat them as user-owned baseline work. Do not revert them.
- Do not stage `.superpowers/brainstorm/**`; those files are visual companion artifacts.
- Use the bundled Node executable in commands:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
```

## File Structure

- Modify `frontend/src/focus-room/controller.js`
  - Adds small render helpers for step headings, session navigation, material summaries, and the bottom dock.
  - Restructures `renderFocusRoomSetup()`, `renderFocusRoomSession()`, `renderLearningPanel()`, `renderFocusSessionSummary()`, `renderNoMaterialState()`, and `renderStudyHistory()`.
  - Preserves state, routing, persistence, audio, timer, AI panel tabs, and workspace return functions.

- Modify `frontend/styles/09-focus-room.css`
  - Defines the liquid glass visual system and scene background treatment.
  - Replaces dashboard-like layouts with setup stage, cinematic session stage, right drawer, history, summary, and responsive rules.
  - Preserves existing workspace entry button and history action styles.

- Modify `frontend/tests/focus-room-integration-regression.mjs`
  - Adds string-contract assertions for new layout hooks and liquid-glass CSS hooks.
  - Keeps existing behavior assertions intact.

- Modify `frontend/tests/focus-room-controller-actions-regression.mjs`
  - Adds assertions that drawer markup still includes workspace return actions after the visual restructure.

- Do not modify `frontend/src/focus-room/data.js` unless an existing helper must be imported by rendering code. Do not change storage keys or material/session shapes.

---

### Task 1: Lock the New Visual Contract in Regression Tests

**Files:**
- Modify: `frontend/tests/focus-room-integration-regression.mjs`
- Modify: `frontend/tests/focus-room-controller-actions-regression.mjs`

- [ ] **Step 1: Add controller and CSS layout contract assertions**

In `frontend/tests/focus-room-integration-regression.mjs`, after the existing `for (const token of [` block that checks `focusController`, add a second token block:

```js
for (const token of [
  "focus-setup-stage",
  "focus-setup-scenes",
  "focus-setup-controls",
  "focus-step-label",
  "focus-session-shell",
  "focus-session-nav",
  "focus-context-panel",
  "focus-session-dock",
  "focus-drawer-shell",
  "focus-drawer-tabs",
  "focus-material-strip"
]) {
  assert.ok(focusController.includes(token), `Focus Room redesigned markup should include ${token}`);
}
```

In the same file, after the existing `focusStyle` assertion for `height: 100vh`, add:

```js
for (const token of [
  "--focus-glass-bg",
  "--focus-glass-border",
  "--focus-glass-shadow",
  "backdrop-filter: blur(28px) saturate(180%)",
  ".focus-setup-stage",
  ".focus-session-shell",
  ".focus-context-panel",
  ".focus-session-dock",
  ".focus-learning-panel",
  "translateX(0)",
  "@media (max-width: 640px)"
]) {
  assert.ok(focusStyle.includes(token), `Focus Room liquid glass CSS should include ${token}`);
}
```

- [ ] **Step 2: Add drawer action preservation assertions**

In `frontend/tests/focus-room-controller-actions-regression.mjs`, after the existing flashcard workspace assertion, add:

```js
assert.ok(
  elements.focusLearningPanel.innerHTML.includes("focus-drawer-shell"),
  "AI Learning Panel should render inside the redesigned liquid glass drawer shell"
);

assert.ok(
  elements.focusLearningPanel.innerHTML.includes("focus-drawer-tabs"),
  "AI Learning Panel should keep the tab row after the drawer redesign"
);

assert.ok(
  elements.focusLearningPanel.innerHTML.includes("Open Flashcard Workspace"),
  "AI Learning Panel should keep flashcard workspace return actions after the redesign"
);
```

- [ ] **Step 3: Run the focused tests and verify they fail**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-integration-regression.mjs
"$NODE" frontend/tests/focus-room-controller-actions-regression.mjs
```

Expected: at least one assertion fails because the new layout/CSS tokens are not implemented yet.

- [ ] **Step 4: Keep the red-phase tests local**

```bash
git status --short frontend/tests/focus-room-integration-regression.mjs frontend/tests/focus-room-controller-actions-regression.mjs
```

Expected: both test files are modified in the worktree. Do not commit these red-phase tests yet; commit them with the implementation once the assertions pass.

---

### Task 2: Add Focus Room Render Helpers Without Changing Behavior

**Files:**
- Modify: `frontend/src/focus-room/controller.js`

- [ ] **Step 1: Add section and summary helpers**

In `frontend/src/focus-room/controller.js`, near `renderMaterialCard(material)`, add:

```js
function renderStepHeading(step, title, subtitle = "") {
  return `
    <div class="focus-step-heading">
      <span class="focus-step-label">${escapeHTML(step)}</span>
      <h2>${escapeHTML(title)}</h2>
      ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}
    </div>
  `;
}

function renderMaterialStrip(material) {
  const headings = Array.isArray(material?.studyHeadings) ? material.studyHeadings.slice(0, 2) : [];
  const meta = headings.length ? headings.join(" / ") : material?.materialType || "Generated notes";
  return `
    <article class="focus-material-strip">
      <span class="focus-room-pill">${escapeHTML(material?.materialType || "Study material")}</span>
      <div>
        <strong>${escapeHTML(material?.materialTitle || "Study material")}</strong>
        <p>${escapeHTML(meta)}</p>
      </div>
    </article>
  `;
}

function renderGoalSummaryCard() {
  return `
    <article class="focus-mini-card">
      <span class="focus-room-kicker">Goal summary</span>
      <p>${escapeHTML(state.studyGoal || `Study ${state.material?.materialTitle || "this material"}`)}</p>
    </article>
  `;
}
```

- [ ] **Step 2: Add session navigation and dock helpers**

In `frontend/src/focus-room/controller.js`, near `timerActionLabel()`, add:

```js
function renderSessionNavigation(scene) {
  const navItems = ["Scene", "Music", "Plan", "Materials"];
  return `
    <nav class="focus-session-nav" aria-label="Focus Room controls">
      ${navItems.map(label => `
        <span class="focus-nav-pill">${escapeHTML(label)}</span>
      `).join("")}
      <button class="focus-room-ghost-btn" type="button" onclick="toggleFocusLearningPanel()">AI Learning Panel</button>
      <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
      <button class="focus-room-ghost-btn" type="button" onclick="showFocusStudyHistory()">Study History</button>
      <button class="focus-session-end-btn" type="button" onclick="endFocusRoomSession()">End</button>
      <span class="focus-room-pill">${escapeHTML(scene.kicker)}</span>
    </nav>
  `;
}

function renderFocusSessionDock() {
  const audioState = getFocusRoomAudioState(getFocusRoomAudioProfile(focusAudioConfig()));
  return `
    <div class="focus-session-dock" aria-label="Compact session controls">
      <button class="focus-dock-btn${audioState.playing ? " active" : ""}" type="button" onclick="toggleFocusRoomAudioPlayback()">
        ${audioState.playing ? "Pause audio" : "Play audio"}
      </button>
      <button class="focus-dock-btn" type="button" onclick="pauseFocusRoomTimer()">Pause</button>
      <button class="focus-dock-btn" type="button" onclick="resetFocusRoomTimer()">Reset</button>
      <button class="focus-dock-btn" type="button" onclick="endFocusRoomSession()">End session</button>
    </div>
  `;
}
```

- [ ] **Step 3: Run focused tests and verify expected failures remain**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-integration-regression.mjs
```

Expected: still fails on CSS tokens and any markup tokens not yet rendered.

- [ ] **Step 4: Commit helper-only controller changes**

```bash
git add frontend/src/focus-room/controller.js
git commit -m "refactor: add focus room liquid glass render helpers"
```

---

### Task 3: Restructure the Setup and No-Material Views

**Files:**
- Modify: `frontend/src/focus-room/controller.js`

- [ ] **Step 1: Replace `renderNoMaterialState()` markup**

Change the `setup.innerHTML =` body inside `renderNoMaterialState()` to:

```js
  setup.innerHTML = `
    ${renderBackground(scene)}
    ${renderTopbar({
      kicker: "Synapse Focus Room",
      title: "No study material yet",
      subtitle: "Generate or select study notes in the workspace, then open the Focus Room again.",
      actions: `
        <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
        <button class="focus-room-ghost-btn" type="button" onclick="showFocusStudyHistory()">Study History</button>
      `
    })}
    <section class="focus-setup-stage focus-empty-stage">
      <article class="focus-room-panel focus-empty-card">
        ${renderStepHeading("Ready when you are", "Waiting for material", "Return to the workspace, generate study notes, or choose a saved history item to start a Focus Room session.")}
        <div class="focus-session-controls">
          <button class="focus-room-primary-btn" type="button" onclick="returnFromFocusRoom()">Open Workspace</button>
          <button class="focus-room-ghost-btn" type="button" onclick="showFocusStudyHistory()">View Study History</button>
        </div>
      </article>
      <article class="focus-room-panel focus-history-preview">
        <h3>Saved sessions</h3>
        ${renderHistoryList({ compact: true })}
      </article>
    </section>
  `;
```

- [ ] **Step 2: Replace `renderFocusRoomSetup()` layout markup**

In `renderFocusRoomSetup()`, replace the `<section class="focus-room-setup-layout">...</section>` block with:

```js
    <section class="focus-setup-stage">
      <div class="focus-room-panel focus-setup-scenes">
        ${renderStepHeading("Step 01", "Choose your study scene", "Pick the atmosphere that matches this focus block.")}
        ${renderMaterialStrip(state.material)}
        <div class="focus-scene-grid">${renderSceneCards()}</div>
      </div>
      <div class="focus-room-panel focus-setup-controls">
        ${renderStepHeading("Step 02", "Set sound atmosphere", "Tune the music and ambient layer before you begin.")}
        ${renderSoundControls()}
        ${renderStepHeading("Step 03", "Set Pomodoro", "Choose a focus length and goal for this session.")}
        ${renderDurationControls()}
        ${renderGoalEditor()}
        <div class="focus-plan-preview" id="focusPlanPreview">
          <h3>Study plan</h3>
          ${renderStudyPlanList()}
        </div>
        <div class="focus-session-controls focus-enter-row">
          <button class="focus-room-primary-btn focus-enter-btn" type="button" onclick="startFocusRoomSession()">Enter Focus Room</button>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Keep setup behavior checks passing**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-data-regression.mjs
"$NODE" frontend/tests/focus-room-controller-actions-regression.mjs
```

Expected: both pass. If controller actions fail because a drawer token is still missing, continue to Task 5 and rerun there.

- [ ] **Step 4: Commit setup markup restructure**

```bash
git add frontend/src/focus-room/controller.js
git commit -m "feat: restructure focus room setup layout"
```

---

### Task 4: Restructure the Active Session as Cinematic Split Stage

**Files:**
- Modify: `frontend/src/focus-room/controller.js`

- [ ] **Step 1: Replace `renderFocusRoomSession()` toolbar and layout markup**

In `renderFocusRoomSession()`, replace the `session.innerHTML =` template with this structure while keeping the same `scene`, `total`, and `remaining` variables:

```js
  session.innerHTML = `
    ${renderBackground(scene)}
    <div class="focus-session-shell">
      <header class="focus-session-hero">
        <div class="focus-room-title-block">
          <p class="focus-room-kicker">${escapeHTML(scene.kicker)} / ${escapeHTML(state.timerStatus)}</p>
          <h1 class="focus-room-title">${escapeHTML(state.material.materialTitle)}</h1>
          <p class="focus-room-subtitle">${escapeHTML(state.studyGoal)}</p>
        </div>
        ${renderSessionNavigation(scene)}
      </header>
      <section class="focus-session-layout">
        <article class="focus-timer-card">
          <p class="focus-room-pill">${escapeHTML(state.musicType)} / ${escapeHTML(state.ambientSound)}</p>
          <div class="focus-session-timer" aria-live="polite">${escapeHTML(formatTimerClock(remaining))}</div>
          <p class="focus-room-subtitle">${escapeHTML(formatFocusRoomDuration(state.elapsedSeconds))} focused of ${escapeHTML(state.durationMinutes)}m</p>
          <div class="focus-progress-track" aria-label="Focus progress">
            <div class="focus-progress-fill" style="width: ${progressPercent().toFixed(1)}%;"></div>
          </div>
          <div class="focus-session-controls">
            <button class="focus-control-btn${state.timerStatus === "studying" ? " active" : ""}" type="button" onclick="startFocusRoomTimer()">${timerActionLabel()}</button>
            <button class="focus-control-btn" type="button" onclick="pauseFocusRoomTimer()">Pause</button>
            <button class="focus-control-btn" type="button" onclick="resetFocusRoomTimer()">Reset</button>
            <button class="focus-control-btn" type="button" onclick="skipFocusRoomTimer()">Skip</button>
          </div>
        </article>
        <aside class="focus-session-panel focus-context-panel">
          <section>
            <h3>Study plan</h3>
            ${renderStudyPlanList({ interactive: true })}
          </section>
          <section>
            <h3>Sound</h3>
            ${renderSoundControls()}
          </section>
          <section>
            <h3>Current material</h3>
            ${renderMaterialStrip(state.material)}
          </section>
          ${renderGoalSummaryCard()}
        </aside>
      </section>
      ${renderFocusSessionDock()}
    </div>
  `;
```

- [ ] **Step 2: Verify timer and workspace action tests**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-controller-actions-regression.mjs
"$NODE" frontend/tests/focus-room-study-tools-regression.mjs
```

Expected: action routing and study tool behavior pass or fail only on drawer tokens that Task 5 will add.

- [ ] **Step 3: Commit active session restructure**

```bash
git add frontend/src/focus-room/controller.js
git commit -m "feat: restructure focus room session stage"
```

---

### Task 5: Redesign AI Drawer, Session Summary, and Study History Markup

**Files:**
- Modify: `frontend/src/focus-room/controller.js`

- [ ] **Step 1: Wrap `renderLearningPanel()` content in drawer shell**

In `renderLearningPanel()`, replace `panel.innerHTML =` with:

```js
  panel.innerHTML = `
    <div class="focus-drawer-shell">
      <div class="focus-drawer-head">
        <div>
          <p class="focus-room-kicker">Synapse</p>
          <h3>AI Learning Panel</h3>
        </div>
        <button class="focus-icon-btn" type="button" aria-label="Close AI Learning Panel" onclick="toggleFocusLearningPanel()">x</button>
      </div>
      <div class="focus-tab-row focus-drawer-tabs" role="tablist">
        ${PANEL_TAB_LIST.map(tab => `
          <button
            class="focus-tab-btn${tab === state.panelTab ? " active" : ""}"
            type="button"
            role="tab"
            aria-selected="${tab === state.panelTab ? "true" : "false"}"
            onclick="setFocusPanelTab(${jsStringAttr(tab)})"
          >${escapeHTML(panelTabLabel(tab))}</button>
        `).join("")}
      </div>
      <div class="focus-drawer-body">
        ${renderPanelContent()}
      </div>
    </div>
  `;
```

- [ ] **Step 2: Give session summary a glass content wrapper**

In `renderFocusSessionSummary()`, keep the saved record fields but change the card class line to:

```js
    <article class="focus-summary-card focus-summary-glass" role="dialog" aria-modal="true" aria-label="Focus session summary">
```

Keep the existing buttons:

```js
        <button class="focus-room-primary-btn" type="button" onclick="closeFocusSummary()">Stay</button>
        <button class="focus-room-ghost-btn" type="button" onclick="showFocusStudyHistory()">View History</button>
        <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
```

- [ ] **Step 3: Update study history layout class hooks**

In `renderStudyHistory()`, replace the `<section class="focus-history-grid">` block with:

```js
    <section class="focus-history-stage">
      <article class="focus-history-card focus-history-main">
        <h3>Recent sessions</h3>
        ${renderHistoryList()}
      </article>
      <article class="focus-history-card focus-history-next">
        <h3>Next step</h3>
        <p class="focus-room-subtitle">Choose a material from the workspace to start another protected study block.</p>
        <div class="focus-session-controls">
          <button class="focus-room-primary-btn" type="button" onclick="returnFromFocusRoom()">Open Workspace</button>
        </div>
      </article>
    </section>
```

- [ ] **Step 4: Run controller and integration tests**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-controller-actions-regression.mjs
"$NODE" frontend/tests/focus-room-integration-regression.mjs
```

Expected: controller actions pass; integration may still fail on CSS tokens until Task 6.

- [ ] **Step 5: Commit drawer/history/summary restructure**

```bash
git add frontend/src/focus-room/controller.js
git commit -m "feat: add focus room liquid glass drawer"
```

---

### Task 6: Implement Liquid Glass CSS System and Desktop Layouts

**Files:**
- Modify: `frontend/styles/09-focus-room.css`

- [ ] **Step 1: Add liquid glass CSS variables**

Near the top of `frontend/styles/09-focus-room.css`, after `.history-focus-room-btn` rules and before `.focus-room-surface`, add:

```css
:root {
  --focus-glass-bg: rgba(255, 255, 255, 0.13);
  --focus-glass-bg-strong: rgba(255, 255, 255, 0.18);
  --focus-glass-border: rgba(255, 255, 255, 0.32);
  --focus-glass-border-soft: rgba(255, 255, 255, 0.22);
  --focus-glass-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
  --focus-glass-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.36);
  --focus-text: #ffffff;
  --focus-text-soft: rgba(248, 251, 255, 0.76);
  --focus-dark: #10131d;
}
```

- [ ] **Step 2: Upgrade scene background and panel glass**

Replace the current `.focus-room-bg::after`, shared panel group, and button/input base styles with this CSS:

```css
.focus-room-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.16), transparent 28%),
    linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)),
    linear-gradient(90deg, rgba(8, 12, 22, 0.72), rgba(8, 12, 22, 0.22) 48%, rgba(8, 12, 22, 0.70));
}

.focus-room-panel,
.focus-session-panel,
.focus-summary-card,
.focus-history-card,
.focus-room-glass,
.focus-panel-card,
.focus-timer-card,
.focus-learning-panel {
  border: 1px solid var(--focus-glass-border);
  border-radius: 30px;
  background: var(--focus-glass-bg);
  box-shadow: var(--focus-glass-highlight), var(--focus-glass-shadow);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
}

.focus-room-back-btn,
.focus-room-ghost-btn,
.focus-room-primary-btn,
.focus-session-end-btn,
.focus-icon-btn,
.focus-control-btn,
.focus-tab-btn,
.focus-duration-btn,
.focus-dock-btn,
.focus-nav-pill {
  border: 1px solid var(--focus-glass-border-soft);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: var(--focus-text);
  box-shadow: var(--focus-glass-highlight), 0 12px 34px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
}

.focus-room-primary-btn,
.focus-control-btn.active,
.focus-tab-btn.active,
.focus-duration-btn.active,
.focus-dock-btn.active,
.focus-control-btn[aria-pressed="true"],
.focus-tab-btn[aria-selected="true"],
.focus-duration-btn[aria-pressed="true"] {
  border-color: rgba(255, 255, 255, 0.70);
  background: rgba(255, 255, 255, 0.86);
  color: #111827;
}

.focus-setup-form input,
.focus-setup-form select,
.focus-setup-form textarea,
.focus-answer-input,
.focus-plan-edit-item input,
.focus-plan-edit-item textarea {
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  box-shadow: var(--focus-glass-highlight);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.focus-setup-form input::placeholder,
.focus-setup-form textarea::placeholder,
.focus-answer-input::placeholder {
  color: rgba(255, 255, 255, 0.58);
}
```

- [ ] **Step 3: Add setup and active session desktop layout CSS**

Add this CSS after the existing layout block for `.focus-room-setup-layout, .focus-session-layout`:

```css
.focus-setup-stage {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(420px, 1.08fr) minmax(360px, 0.92fr);
  gap: 22px;
  align-items: stretch;
  max-width: 1280px;
  margin: 0 auto;
}

.focus-setup-scenes,
.focus-setup-controls {
  min-height: min(680px, calc(100vh - 156px));
}

.focus-step-heading {
  display: grid;
  gap: 7px;
  margin-bottom: 18px;
}

.focus-step-label {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.focus-step-heading h2 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(1.5rem, 2.4vw, 2.1rem);
  font-weight: 950;
}

.focus-step-heading p {
  margin: 0;
  color: var(--focus-text-soft);
}

.focus-material-strip,
.focus-mini-card {
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1px solid var(--focus-glass-border-soft);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.10);
  padding: 13px 14px;
  box-shadow: var(--focus-glass-highlight);
}

.focus-material-strip strong,
.focus-mini-card p {
  color: #ffffff;
}

.focus-material-strip p,
.focus-mini-card p {
  margin: 3px 0 0;
}

.focus-session-shell {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 48px);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
}

.focus-session-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.focus-session-nav {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 720px;
}

.focus-context-panel {
  display: grid;
  gap: 18px;
}

.focus-session-dock {
  justify-self: center;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: min(640px, 100%);
  border: 1px solid var(--focus-glass-border-soft);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: var(--focus-glass-highlight), 0 22px 64px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  padding: 10px;
}

.focus-dock-btn {
  min-height: 38px;
  padding: 8px 14px;
  cursor: pointer;
}

.focus-nav-pill {
  min-height: 42px;
  padding: 10px 14px;
}
```

- [ ] **Step 4: Run integration test and verify CSS tokens pass**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-integration-regression.mjs
```

Expected: passes unless remaining responsive/drawer CSS tokens are added in Task 7.

- [ ] **Step 5: Commit desktop liquid glass CSS**

```bash
git add frontend/styles/09-focus-room.css
git commit -m "style: add focus room liquid glass system"
```

---

### Task 7: Add Drawer, History, Summary, and Responsive CSS

**Files:**
- Modify: `frontend/styles/09-focus-room.css`

- [ ] **Step 1: Add right drawer CSS**

Add this CSS near the current `.focus-learning-panel` rules:

```css
.focus-learning-panel {
  position: fixed;
  top: 24px;
  right: 24px;
  bottom: 24px;
  z-index: 3;
  width: min(520px, calc(100vw - 48px));
  padding: 0;
  overflow: hidden;
  transform: translateX(0);
  animation: focusDrawerIn 0.28s ease both;
}

.focus-drawer-shell {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 16px;
  padding: 22px;
  min-height: 0;
}

.focus-drawer-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.focus-drawer-head h3 {
  margin: 4px 0 0;
  font-size: 1.45rem;
}

.focus-drawer-tabs {
  margin-top: 0;
  overflow-x: auto;
  flex-wrap: nowrap;
  padding-bottom: 4px;
}

.focus-drawer-body {
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

@keyframes focusDrawerIn {
  from {
    opacity: 0;
    transform: translateX(28px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

- [ ] **Step 2: Add history and summary CSS**

Add this CSS near the existing history/summary rules:

```css
.focus-history-stage {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: 18px;
}

.focus-history-main,
.focus-history-next,
.focus-summary-glass {
  background: rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
}

.focus-summary-overlay {
  background: rgba(6, 10, 18, 0.58);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}
```

- [ ] **Step 3: Replace responsive rules for tablet and mobile**

Update the existing `@media (max-width: 980px)` and `@media (max-width: 640px)` blocks so they include:

```css
@media (max-width: 980px) {
  .focus-room-surface {
    padding: 18px;
  }

  .focus-room-topbar,
  .focus-session-toolbar,
  .focus-session-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .focus-setup-stage,
  .focus-room-setup-layout,
  .focus-session-layout,
  .focus-history-stage {
    grid-template-columns: 1fr;
  }

  .focus-setup-scenes,
  .focus-setup-controls,
  .focus-session-shell {
    min-height: auto;
  }

  .focus-session-nav {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .analysis-header-actions {
    width: 100%;
  }

  .focus-room-entry-btn {
    width: 100%;
  }

  .focus-room-surface {
    height: 100dvh;
    padding: 14px;
  }

  .focus-scene-grid {
    grid-template-columns: 1fr;
  }

  .focus-room-panel,
  .focus-session-panel,
  .focus-summary-card,
  .focus-history-card,
  .focus-panel-card,
  .focus-timer-card,
  .focus-learning-panel {
    border-radius: 22px;
    padding: 16px;
  }

  .focus-learning-panel {
    inset: 0;
    width: 100%;
    border-radius: 0;
    padding: 0;
  }

  .focus-drawer-shell {
    padding: 16px;
  }

  .focus-duration-grid,
  .focus-history-grid {
    grid-template-columns: 1fr;
  }

  .focus-session-controls,
  .focus-control-row,
  .focus-tab-row,
  .focus-session-controls > *,
  .focus-session-nav > *,
  .focus-session-dock > * {
    width: 100%;
  }

  .focus-session-dock {
    border-radius: 24px;
    flex-direction: column;
    align-items: stretch;
  }

  .focus-control-btn,
  .focus-tab-btn,
  .focus-duration-btn,
  .focus-dock-btn {
    width: 100%;
  }

  .focus-study-card {
    min-height: 240px;
  }

  .focus-plan-edit-item {
    grid-template-columns: 1fr;
  }

  .focus-chat-message {
    width: 100%;
  }
}
```

- [ ] **Step 4: Run focused regression tests**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-integration-regression.mjs
"$NODE" frontend/tests/focus-room-controller-actions-regression.mjs
```

Expected: both pass.

- [ ] **Step 5: Commit responsive and drawer CSS**

```bash
git add frontend/styles/09-focus-room.css frontend/tests/focus-room-integration-regression.mjs frontend/tests/focus-room-controller-actions-regression.mjs
git commit -m "style: finish focus room responsive glass layouts"
```

---

### Task 8: Full Regression Pass and Browser Verification

**Files:**
- No code files unless regressions reveal a focused fix.

- [ ] **Step 1: Run all Focus Room regression scripts**

Run:

```bash
NODE="/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
"$NODE" frontend/tests/focus-room-integration-regression.mjs
"$NODE" frontend/tests/focus-room-data-regression.mjs
"$NODE" frontend/tests/focus-room-controller-actions-regression.mjs
"$NODE" frontend/tests/focus-room-study-tools-regression.mjs
"$NODE" frontend/tests/focus-room-audio-regression.mjs
```

Expected:

```text
focus room integration regression passed
focus room data regression passed
focus room controller actions regression passed
focus room study tools regression passed
focus room audio regression passed
```

- [ ] **Step 2: Start the static frontend server**

Run:

```bash
/Users/zhenghui/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 run_frontend.py
```

Expected: frontend server prints a local URL on port `5175`. Keep the server session running until browser verification is complete.

- [ ] **Step 3: Verify desktop Focus Room in Browser**

Open:

```text
http://127.0.0.1:5175/frontend/focus-room.html#/focus-room/history-1
```

Use the Browser plugin to verify:

```text
Setup page shows full-screen scene background, Step 01/02/03 sections, image scene cards, sound controls, duration buttons, goal input, study plan preview, and Enter Focus Room button.
```

If no material is available for `history-1`, use a material ID shown by the current workspace bridge or verify the no-material glass empty state at:

```text
http://127.0.0.1:5175/frontend/focus-room.html#/focus-room
```

- [ ] **Step 4: Verify active room and AI drawer**

In the browser:

1. Click `Enter Focus Room`.
2. Verify the active room shows the left timer card, right context panel, and bottom dock.
3. Click `AI Learning Panel`.
4. Verify the right-side drawer opens at desktop width, shows tabs, and does not cover the whole page.
5. Open Flashcards/Quiz/Chat/Plan tabs and confirm workspace action buttons still render.

Expected: no console errors from Focus Room interactions.

- [ ] **Step 5: Verify mobile layout**

Use Browser viewport capability or responsive dev viewport at around `390x844`.

Expected:

```text
Setup stacks into one column, buttons are tap-sized, AI drawer is full width, timer stays contained, and there is no horizontal scroll.
```

- [ ] **Step 6: Commit any focused verification fixes**

If verification required code fixes, commit them:

```bash
git add frontend/src/focus-room/controller.js frontend/styles/09-focus-room.css frontend/tests/focus-room-integration-regression.mjs frontend/tests/focus-room-controller-actions-regression.mjs
git commit -m "fix: polish focus room liquid glass verification issues"
```

If no fixes were needed, do not create an empty commit.

---

### Task 9: Final Status Check

**Files:**
- No code files.

- [ ] **Step 1: Confirm committed and uncommitted scope**

Run:

```bash
git status --short --untracked-files=all
git log --oneline -5
```

Expected: implementation commits are visible. Any remaining `.superpowers/brainstorm/**` files are untracked companion artifacts and should not be staged.

- [ ] **Step 2: Summarize final verification**

Prepare a final handoff summary with:

```text
Assumption:
Changed:
Verified:
Remaining risk:
```

Include exact tests run and the browser targets checked.
