# Dark Learning Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Synapse an original dark, chat-centered desktop shell with a functional learning navigation rail and anchored account control.

**Architecture:** Keep the existing history and account actions as the source of truth. Add a concise rail action group to `HistoryNavigation`, then layer dark shell styles onto the initial Materials/Companion workspace without changing the in-progress summary-navigation implementation.

**Tech Stack:** React `createElement`, legacy action bridge, existing Bootstrap icons, CSS, Node assertion tests, Vite.

## Global Constraints

- Preserve the existing uncommitted controller, summary-navigation, assistant-panel, and responsive layout changes.
- Do not copy ChatGPT branding, product copy, assets, or proprietary icons.
- Keep existing generated-note search/history, account menu, mode targets, upload behaviour, and Companion chat behaviour working.
- Do not add API, storage, authentication, routing, or dependency changes.

---

### Task 1: Add functional rail actions and scoped dark workspace styles

**Files:**
- Modify: `frontend/src/react/components/HistoryNavigation.js:1-130`
- Modify: `frontend/styles/01-section.css:280-430, 440-820`
- Modify: `frontend/tests/ai-learning-companion-shell-regression.mjs:1-60`

**Interfaces:**
- Consumes `legacyAction("resetWorkspace")`, existing account menu actions, existing history search/list IDs, and `setLearningExperienceMode` mode targets.
- Produces `dark-learning-rail`, `learning-rail-actions`, and an account control anchored at the rail bottom.

- [ ] **Step 1: Write failing regression assertions**

```js
const historyNavigation = read("frontend/src/react/components/HistoryNavigation.js");
assert.ok(historyNavigation.includes("dark-learning-rail"));
assert.ok(historyNavigation.includes("learning-rail-new-chat"));
assert.ok(historyNavigation.includes("learning-rail-materials"));
assert.ok(historyNavigation.includes("history-account-rail"));
assert.ok(styles.includes(".dark-learning-rail"));
assert.ok(styles.includes(".learning-rail-actions"));
```

- [ ] **Step 2: Run the regression to verify it fails**

Run: `source scripts/use_local_node.sh && node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: failure because the rail action classes are not rendered yet.

- [ ] **Step 3: Implement the rail action group**

Render an original Synapse action group below the brand: New chat calls `resetWorkspace`; Materials calls `setLearningExperienceMode("materials")`; Learning companion calls `setLearningExperienceMode("companion")`. Keep the existing history search/list. Move the existing account menu wrapper into a bottom rail container without changing its account menu contents or actions.

- [ ] **Step 4: Implement scoped dark styles**

Add `.dark-learning-rail` styles for a charcoal rail, simple dark action buttons, readable recent-history items, bottom account control, and dark initial-state canvas. Scope dark Companion cards/messages/composer and Materials upload surfaces under the initial workspace only. Preserve existing responsive breakpoints and add a narrow-screen rail override only when it does not affect the existing mobile offcanvas.

- [ ] **Step 5: Run verification**

Run:

```bash
source scripts/use_local_node.sh
node frontend/tests/ai-learning-companion-shell-regression.mjs
npm run test:frontend
npm run build
```

Expected: all frontend regressions pass and both Vite builds complete.

- [ ] **Step 6: Commit only owned files and publish**

```bash
git add frontend/src/react/components/HistoryNavigation.js frontend/styles/01-section.css frontend/tests/ai-learning-companion-shell-regression.mjs
git commit -m "style: add dark learning workspace rail"
git push origin main
```
