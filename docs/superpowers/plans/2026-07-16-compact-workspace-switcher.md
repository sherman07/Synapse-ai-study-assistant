# Compact Workspace Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the large workspace-choice card with a persistent compact top-right Materials/Companion switch.

**Architecture:** Keep `LearningModeSwitcher` and its existing legacy mode bridge unchanged. Reduce its rendered structure to a labelled segmented control and use scoped CSS to place it at the right edge of the learning workspace in both modes.

**Tech Stack:** React `createElement`, existing legacy action bridge, CSS, Node assertion regression test.

## Global Constraints

- Do not change Materials upload behaviour, Companion chat behaviour, history navigation, or mode persistence.
- Preserve the existing `data-learning-experience-target` values and accessible group semantics.
- The switch remains visible in Materials and Companion modes and becomes responsive without obscuring controls.

---

### Task 1: Render and style the compact persistent switch

**Files:**
- Modify: `frontend/src/react/components/LearningModeSwitcher.js:1-44`
- Modify: `frontend/styles/01-section.css:452-515, 1040-1110`
- Modify: `frontend/tests/ai-learning-companion-shell-regression.mjs:1-50`

**Interfaces:**
- Consumes `legacyAction("setLearningExperienceMode", mode)` and existing mode target attributes.
- Produces a `learning-mode-switcher` compact control with the same button targets and ARIA group.

- [ ] **Step 1: Write the failing regression assertions**

```js
const switcher = read("frontend/src/react/components/LearningModeSwitcher.js");
assert.ok(switcher.includes("learning-mode-switcher-compact"));
assert.ok(!switcher.includes("How would you like to study right now?"));
assert.ok(styles.includes(".learning-mode-switcher-compact"));
assert.ok(styles.includes("@media (max-width: 720px)"));
```

- [ ] **Step 2: Run the regression to verify it fails**

Run: `source scripts/use_local_node.sh && node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: failure because the compact class and removed large heading are not yet present.

- [ ] **Step 3: Implement the compact switch**

Render the switcher as a short accessible group with an invisible-or-visually-small mode label and the existing `Materials` / `Companion` buttons. Remove the title and descriptive copy. Replace the card CSS with right-aligned compact styles, preserve active/inactive button contrast, and add a narrow-screen rule that keeps the control right-aligned without overlap.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
source scripts/use_local_node.sh
node frontend/tests/ai-learning-companion-shell-regression.mjs
npm run test:frontend
npm run build
```

Expected: all frontend regressions pass and both Vite builds complete.

- [ ] **Step 5: Commit and publish**

```bash
git add frontend/src/react/components/LearningModeSwitcher.js frontend/styles/01-section.css frontend/tests/ai-learning-companion-shell-regression.mjs
git commit -m "style: compact workspace switcher"
git push origin main
```
