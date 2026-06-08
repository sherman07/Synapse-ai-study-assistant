# Synapse Focus Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished static Focus Room MVP that connects current Synapse upload/analysis outputs, generated tools, and local history into an immersive study session flow.

**Architecture:** Add a small Focus Room app surface beside the existing workspace, using hash routes so the static frontend does not need server rewrites. Keep data integration behind one legacy bridge and one Focus Room data adapter, then render setup, session, learning panel, summary, and session history from a dedicated controller. Preserve existing workspace DOM IDs and controller behavior.

**Tech Stack:** Static HTML/CSS, React 18 CDN markup helpers, legacy browser controller modules, Bootstrap Icons, localStorage, Node regression scripts.

---

## File Structure

- Create `frontend/src/react/components/FocusRoom.js`: static DOM shell for setup, session, panel, summary, and history roots.
- Modify `frontend/src/react/components/AppShell.js`: include `FocusRoom()` after the current workspace layout.
- Modify `frontend/src/react/components/AnalysisStage.js`: add the current-material `Study in Focus Room` CTA.
- Create `frontend/src/focus-room/data.js`: scene catalog, material adapter helpers, session storage, study plan derivation, duration formatting.
- Create `frontend/src/focus-room/controller.js`: hash routing, setup rendering, timer state, panel tabs, session summary saving, global Focus Room handlers.
- Create `frontend/src/legacy/controller_sections/10_focusroombridge.js`: bridge existing generated-note state and history into normalized Focus Room material records.
- Modify `frontend/src/legacy/controller.js`: load `10_focusroombridge.js` after the existing source/history controller section.
- Modify `frontend/src/legacy/controller_sections/99_boot.js`: expose bridge functions and trigger initial Focus Room CTA rendering.
- Modify `frontend/src/legacy/controller_sections/01_uploadedfiles.js`: refresh Focus Room CTA when analysis view opens.
- Modify `frontend/src/legacy/controller_sections/09_togglesourceviewer.js`: add Focus Room action buttons to history rows and refresh Focus Room surfaces after history changes.
- Create `frontend/styles/09-focus-room.css`: high-quality responsive Focus Room visuals.
- Modify `frontend/style.css`: import the Focus Room stylesheet.
- Create `frontend/assets/focus-room/`: generated scene images for the six study scenes.
- Create `frontend/tests/focus-room-integration-regression.mjs`: string and behavior checks for routing, imports, bridge exposure, CTA wiring, and CSS import.
- Create `frontend/tests/focus-room-data-regression.mjs`: module tests for material normalization, plan generation, and session storage.

## Task 1: Add Failing Focus Room Regression Tests

**Files:**
- Create: `frontend/tests/focus-room-integration-regression.mjs`
- Create: `frontend/tests/focus-room-data-regression.mjs`

- [ ] **Step 1: Create the integration regression test**

Write `frontend/tests/focus-room-integration-regression.mjs`:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const main = read("frontend/src/main.js");
const appShell = read("frontend/src/react/components/AppShell.js");
const analysisStage = read("frontend/src/react/components/AnalysisStage.js");
const controller = read("frontend/src/legacy/controller.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const uploadSection = read("frontend/src/legacy/controller_sections/01_uploadedfiles.js");
const historySection = read("frontend/src/legacy/controller_sections/09_togglesourceviewer.js");
const style = read("frontend/style.css");

assert.ok(main.includes("initFocusRoom"), "main.js should initialize the Focus Room controller");
assert.ok(appShell.includes("FocusRoom()"), "AppShell should render the Focus Room shell");
assert.ok(analysisStage.includes("focusRoomCta"), "analysis header should include the current-material Focus Room CTA");
assert.ok(controller.includes("\"10_focusroombridge.js\""), "legacy controller should load the Focus Room bridge");
assert.ok(boot.includes("getSynapseFocusRoomMaterials"), "boot should expose Focus Room material bridge helpers");
assert.ok(boot.includes("openSynapseFocusRoom"), "boot should expose the Focus Room opener");
assert.ok(uploadSection.includes("renderFocusRoomWorkspaceActions"), "analysis view should refresh Focus Room CTAs");
assert.ok(historySection.includes("history-focus-room-btn"), "history rows should include a Focus Room action");
assert.ok(style.includes("09-focus-room.css"), "global stylesheet should import Focus Room styles");

const focusComponent = read("frontend/src/react/components/FocusRoom.js");
for (const id of [
  "focusRoomSurface",
  "focusRoomSetup",
  "focusRoomSession",
  "focusLearningPanel",
  "focusSessionSummary",
  "focusStudyHistory"
]) {
  assert.ok(focusComponent.includes(id), `FocusRoom shell should include #${id}`);
}

const focusController = read("frontend/src/focus-room/controller.js");
for (const token of [
  "hashchange",
  "#/focus-room",
  "renderFocusRoomSetup",
  "renderFocusRoomSession",
  "saveFocusRoomSession",
  "returnFromFocusRoom"
]) {
  assert.ok(focusController.includes(token), `Focus Room controller should include ${token}`);
}

console.log("focus room integration regression passed");
```

- [ ] **Step 2: Create the data regression test**

Write `frontend/tests/focus-room-data-regression.mjs`:

```js
import assert from "node:assert/strict";

const values = new Map();
globalThis.localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  }
};

const data = await import("../src/focus-room/data.js");

assert.equal(data.FOCUS_ROOM_SESSION_KEY, "synapse.focusRoom.sessions.v1");
assert.equal(data.FOCUS_ROOM_SCENES.length, 6);
assert.ok(data.FOCUS_ROOM_SCENES.every(scene => scene.id && scene.name && scene.image), "each scene should have an image-backed identity");

const material = data.normalizeFocusRoomMaterial({
  id: "history-1",
  title: "Vector Calculus Review",
  summary: "# Key Ideas\n\nGradients measure steepest increase.\n\n## Worked Examples\nUse partial derivatives.",
  sections: {
    "Key Ideas": "Gradients measure steepest increase.",
    "Worked Examples": "Use partial derivatives."
  },
  mindMap: { branches: [{ title: "Gradients" }] },
  sourceFingerprint: "abc123"
});

assert.equal(material.materialId, "history-1");
assert.equal(material.materialTitle, "Vector Calculus Review");
assert.equal(material.aiSummary.includes("Gradients"), true);
assert.deepEqual(material.studyHeadings.slice(0, 2), ["Key Ideas", "Worked Examples"]);

const plan = data.buildFocusRoomStudyPlan({
  material,
  goal: "Prepare for tomorrow's quiz",
  durationMinutes: 45
});

assert.equal(plan.length, 4);
assert.ok(plan[0].task.includes("Prepare for tomorrow's quiz"));
assert.ok(plan.some(item => item.task.includes("Worked Examples")));

const session = data.saveFocusRoomSession({
  sessionId: "session-1",
  materialId: "history-1",
  materialTitle: "Vector Calculus Review",
  studyGoal: "Prepare for tomorrow's quiz",
  selectedScene: "morning-window",
  pomodoroDuration: 45,
  startedAt: "2026-06-09T00:00:00.000Z",
  endedAt: "2026-06-09T00:30:00.000Z",
  totalFocusTime: 1800,
  flashcardsCompleted: 3,
  quizScore: 80,
  completedTasks: ["Review Key Ideas"],
  aiReflection: "You completed a focused review session."
});

assert.equal(session.materialTitle, "Vector Calculus Review");
assert.equal(data.readFocusRoomSessions().length, 1);
assert.equal(data.formatFocusRoomDuration(3661), "1h 1m");

console.log("focus room data regression passed");
```

- [ ] **Step 3: Run both tests and verify they fail**

Run:

```bash
node frontend/tests/focus-room-integration-regression.mjs
node frontend/tests/focus-room-data-regression.mjs
```

Expected:

```text
AssertionError
Error [ERR_MODULE_NOT_FOUND]
```

The first test should fail because Focus Room files are not wired yet. The second should fail because `frontend/src/focus-room/data.js` does not exist yet.

- [ ] **Step 4: Commit the failing tests**

Run:

```bash
git add frontend/tests/focus-room-integration-regression.mjs frontend/tests/focus-room-data-regression.mjs
git commit -m "test: add focus room regression coverage"
```

Expected:

```text
[branch <sha>] test: add focus room regression coverage
```

## Task 2: Add Focus Room Data Adapter

**Files:**
- Create: `frontend/src/focus-room/data.js`
- Test: `frontend/tests/focus-room-data-regression.mjs`

- [ ] **Step 1: Implement the data module**

Create `frontend/src/focus-room/data.js`:

```js
const FOCUS_ROOM_SESSION_KEY = "synapse.focusRoom.sessions.v1";
const FOCUS_ROOM_DRAFT_KEY = "synapse.focusRoom.draft.v1";
const FOCUS_ROOM_SESSION_LIMIT = 40;

const FOCUS_ROOM_SCENES = [
  {
    id: "morning-window",
    name: "Morning Window",
    kicker: "Bright focus",
    description: "Soft daylight, quiet desk, gentle outdoor calm.",
    image: "./assets/focus-room/morning-window.webp",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  },
  {
    id: "rainy-cafe",
    name: "Rainy Cafe",
    kicker: "Low hum",
    description: "Window rain, warm lights, steady cafe ambience.",
    image: "./assets/focus-room/rainy-cafe.webp",
    ambientSound: "Rain",
    musicType: "Lo-fi"
  },
  {
    id: "library-night",
    name: "Library Night",
    kicker: "Quiet review",
    description: "Desk lamp, bookshelves, late-night concentration.",
    image: "./assets/focus-room/library-night.webp",
    ambientSound: "White Noise",
    musicType: "Piano"
  },
  {
    id: "ocean-study-room",
    name: "Ocean Study Room",
    kicker: "Open air",
    description: "Blue horizon, slow waves, clean study energy.",
    image: "./assets/focus-room/ocean-study-room.webp",
    ambientSound: "Ocean",
    musicType: "Deep Focus"
  },
  {
    id: "mountain-cabin",
    name: "Mountain Cabin",
    kicker: "Warm retreat",
    description: "Snow view, wood textures, protected concentration.",
    image: "./assets/focus-room/mountain-cabin.webp",
    ambientSound: "Wind",
    musicType: "Piano"
  },
  {
    id: "minimal-desk",
    name: "Minimal Desk",
    kicker: "Clean reset",
    description: "Neutral light, uncluttered desk, no distractions.",
    image: "./assets/focus-room/minimal-desk.webp",
    ambientSound: "White Noise",
    musicType: "Minimal"
  }
];

const FOCUS_ROOM_DURATIONS = [25, 45, 50, 90];

function readJSON(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    console.warn(`Could not read ${key}:`, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not write ${key}:`, error);
    return false;
  }
}

function stripHTML(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromSummary(summary) {
  const line = String(summary || "")
    .split(/\n+/)
    .map(item => item.replace(/^#+\s*/, "").trim())
    .find(item => item.length > 4);
  return line ? line.slice(0, 72) : "Generated Study Notes";
}

function headingsFromMaterial(source) {
  const sectionKeys = source?.sections && typeof source.sections === "object"
    ? Object.keys(source.sections).filter(Boolean)
    : [];
  if (sectionKeys.length) return sectionKeys.slice(0, 8);

  return String(source?.summary || source?.aiSummary || "")
    .split("\n")
    .map(line => line.match(/^#{1,4}\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeFocusRoomMaterial(source = {}) {
  const materialId = String(source.materialId || source.id || source.historyId || source.sourceFingerprint || "current-material");
  const aiSummary = String(source.aiSummary || source.summary || source.fullSummary || "");
  const materialTitle = String(source.materialTitle || source.title || titleFromSummary(aiSummary));
  const sourceFingerprint = String(source.sourceFingerprint || source.clientFingerprint || "");

  return {
    materialId,
    materialTitle,
    materialType: source.materialType || source.type || "Generated notes",
    uploadedContent: source.uploadedContent || source.sourceText || "",
    aiSummary,
    summaryText: stripHTML(aiSummary),
    sections: source.sections || {},
    studyHeadings: headingsFromMaterial(source),
    flashcards: Array.isArray(source.flashcards) ? source.flashcards : [],
    quizzes: Array.isArray(source.quizzes) ? source.quizzes : [],
    mindMap: source.mindMap || source.mind_map || null,
    studyPlan: Array.isArray(source.studyPlan) ? source.studyPlan : [],
    progressHistory: Array.isArray(source.progressHistory) ? source.progressHistory : [],
    sourceFingerprint,
    createdAt: source.createdAt || "",
    updatedAt: source.updatedAt || ""
  };
}

function getLegacyMaterials() {
  if (typeof globalThis.getSynapseFocusRoomMaterials === "function") {
    const materials = globalThis.getSynapseFocusRoomMaterials();
    return Array.isArray(materials) ? materials.map(normalizeFocusRoomMaterial) : [];
  }
  return [];
}

function getLegacyCurrentMaterial() {
  if (typeof globalThis.getSynapseFocusRoomCurrentMaterial === "function") {
    return normalizeFocusRoomMaterial(globalThis.getSynapseFocusRoomCurrentMaterial());
  }
  return null;
}

function getFocusRoomMaterials() {
  const materials = getLegacyMaterials();
  const current = getLegacyCurrentMaterial();
  if (current && current.aiSummary && !materials.some(item => item.materialId === current.materialId)) {
    return [current, ...materials];
  }
  return materials;
}

function getFocusRoomMaterial(materialId) {
  const id = String(materialId || "");
  const materials = getFocusRoomMaterials();
  return materials.find(item => item.materialId === id) || materials[0] || null;
}

function buildFocusRoomStudyPlan({ material, goal, durationMinutes }) {
  const minutes = Math.max(10, Number(durationMinutes) || 25);
  const headings = material?.studyHeadings?.length
    ? material.studyHeadings
    : ["Key ideas", "Examples", "Practice", "Review"];
  const goalText = String(goal || "").trim() || `Study ${material?.materialTitle || "this material"}`;
  const firstBlock = Math.max(5, Math.round(minutes * 0.2));
  const secondBlock = Math.max(8, Math.round(minutes * 0.4));
  const thirdBlock = Math.max(5, Math.round(minutes * 0.2));
  const finalBlock = Math.max(5, minutes - firstBlock - secondBlock - thirdBlock);

  return [
    { minutes: firstBlock, task: `Set the goal: ${goalText}` },
    { minutes: secondBlock, task: `Review ${headings[0] || "the core ideas"}` },
    { minutes: thirdBlock, task: `Practice with ${headings[1] || headings[0] || "the generated examples"}` },
    { minutes: finalBlock, task: "Summarize mistakes and choose the next study step" }
  ];
}

function readFocusRoomDraft() {
  return readJSON(FOCUS_ROOM_DRAFT_KEY, null);
}

function writeFocusRoomDraft(draft) {
  return writeJSON(FOCUS_ROOM_DRAFT_KEY, draft || null);
}

function readFocusRoomSessions() {
  const parsed = readJSON(FOCUS_ROOM_SESSION_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveFocusRoomSession(session) {
  const now = new Date().toISOString();
  const record = {
    sessionId: session.sessionId || `focus-${Date.now()}`,
    materialId: String(session.materialId || ""),
    materialTitle: session.materialTitle || "Study material",
    studyGoal: session.studyGoal || "",
    selectedScene: session.selectedScene || "morning-window",
    musicType: session.musicType || "Deep Focus",
    ambientSound: session.ambientSound || "Nature",
    musicVolume: Number(session.musicVolume ?? 60),
    ambientVolume: Number(session.ambientVolume ?? 50),
    pomodoroDuration: Number(session.pomodoroDuration || 25),
    startedAt: session.startedAt || now,
    endedAt: session.endedAt || now,
    totalFocusTime: Math.max(0, Number(session.totalFocusTime || 0)),
    flashcardsCompleted: Math.max(0, Number(session.flashcardsCompleted || 0)),
    quizScore: Number.isFinite(Number(session.quizScore)) ? Number(session.quizScore) : null,
    mistakesMade: Array.isArray(session.mistakesMade) ? session.mistakesMade : [],
    completedTasks: Array.isArray(session.completedTasks) ? session.completedTasks : [],
    aiReflection: session.aiReflection || "You protected a focused study block and created momentum for the next session.",
    recommendedNextStep: session.recommendedNextStep || "Review the hardest item, then start another short focus block.",
    sessionDate: session.sessionDate || now
  };
  const next = [record, ...readFocusRoomSessions().filter(item => item.sessionId !== record.sessionId)].slice(0, FOCUS_ROOM_SESSION_LIMIT);
  writeJSON(FOCUS_ROOM_SESSION_KEY, next);
  return record;
}

function formatFocusRoomDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export {
  FOCUS_ROOM_DRAFT_KEY,
  FOCUS_ROOM_DURATIONS,
  FOCUS_ROOM_SCENES,
  FOCUS_ROOM_SESSION_KEY,
  buildFocusRoomStudyPlan,
  formatFocusRoomDuration,
  getFocusRoomMaterial,
  getFocusRoomMaterials,
  normalizeFocusRoomMaterial,
  readFocusRoomDraft,
  readFocusRoomSessions,
  saveFocusRoomSession,
  writeFocusRoomDraft
};
```

- [ ] **Step 2: Run the data regression test**

Run:

```bash
node frontend/tests/focus-room-data-regression.mjs
```

Expected:

```text
focus room data regression passed
```

- [ ] **Step 3: Commit the data adapter**

Run:

```bash
git add frontend/src/focus-room/data.js frontend/tests/focus-room-data-regression.mjs
git commit -m "feat: add focus room data adapter"
```

Expected:

```text
[branch <sha>] feat: add focus room data adapter
```

## Task 3: Add Focus Room Shell Markup

**Files:**
- Create: `frontend/src/react/components/FocusRoom.js`
- Modify: `frontend/src/react/components/AppShell.js`
- Modify: `frontend/src/react/components/AnalysisStage.js`
- Test: `frontend/tests/focus-room-integration-regression.mjs`

- [ ] **Step 1: Create the Focus Room shell component**

Create `frontend/src/react/components/FocusRoom.js`:

```js
import { html } from "../html.js";

export function FocusRoom() {
  return html`
    <section id="focusRoomSurface" class="focus-room-surface d-none" aria-live="polite">
      <div id="focusRoomSetup" class="focus-room-view focus-room-setup-view"></div>
      <div id="focusRoomSession" class="focus-room-view focus-room-session-view d-none"></div>
      <aside id="focusLearningPanel" class="focus-learning-panel d-none" aria-label="AI Learning Panel"></aside>
      <div id="focusSessionSummary" class="focus-summary-overlay d-none"></div>
      <div id="focusStudyHistory" class="focus-room-view focus-history-view d-none"></div>
    </section>
  `;
}
```

- [ ] **Step 2: Render the shell from AppShell**

Modify `frontend/src/react/components/AppShell.js`:

```js
import { html, joinHtml } from "../html.js";
import { MobileNavigation } from "./MobileNavigation.js";
import { HistoryNavigation } from "./HistoryNavigation.js?v=account-menu-v2";
import { SummaryNavigation } from "./SummaryNavigation.js";
import { UploadStage } from "./UploadStage.js";
import { AnalysisStage } from "./AnalysisStage.js";
import { AssistantPanel, OpenAssistantButton } from "./AssistantPanel.js";
import { FocusRoom } from "./FocusRoom.js";

export function AppShellMarkup() {
  return joinHtml([
    MobileNavigation(),
    html`
      <div id="appLayout" class="app-layout initial-state">
        ${HistoryNavigation()}
        ${SummaryNavigation()}
        <main id="mainNotes" class="notes-area">
          ${UploadStage()}
          ${AnalysisStage()}
        </main>
        ${AssistantPanel()}
      </div>
    `,
    FocusRoom(),
    OpenAssistantButton(),
  ]);
}
```

- [ ] **Step 3: Add current-analysis CTA markup**

In `frontend/src/react/components/AnalysisStage.js`, replace the existing header button area:

```html
<button class="btn btn-outline-primary new-upload-btn" onclick="resetWorkspace()">
  <i class="bi bi-plus-lg me-1"></i>New upload
</button>
```

with:

```html
<div class="analysis-header-actions">
  <button id="focusRoomCta" class="btn btn-primary focus-room-entry-btn d-none" type="button" onclick="openSynapseFocusRoom()">
    <i class="bi bi-door-open me-1"></i>Study in Focus Room
  </button>
  <button class="btn btn-outline-primary new-upload-btn" onclick="resetWorkspace()">
    <i class="bi bi-plus-lg me-1"></i>New upload
  </button>
</div>
```

- [ ] **Step 4: Run the integration regression test and verify partial failure**

Run:

```bash
node frontend/tests/focus-room-integration-regression.mjs
```

Expected:

```text
AssertionError
```

The shell and CTA assertions should pass. Bridge, controller, and CSS assertions should still fail.

- [ ] **Step 5: Commit the shell markup**

Run:

```bash
git add frontend/src/react/components/FocusRoom.js frontend/src/react/components/AppShell.js frontend/src/react/components/AnalysisStage.js
git commit -m "feat: add focus room shell"
```

Expected:

```text
[branch <sha>] feat: add focus room shell
```

## Task 4: Generate Scene Assets And Add Focus Room Styles

**Files:**
- Create: `frontend/assets/focus-room/morning-window.webp`
- Create: `frontend/assets/focus-room/rainy-cafe.webp`
- Create: `frontend/assets/focus-room/library-night.webp`
- Create: `frontend/assets/focus-room/ocean-study-room.webp`
- Create: `frontend/assets/focus-room/mountain-cabin.webp`
- Create: `frontend/assets/focus-room/minimal-desk.webp`
- Create: `frontend/styles/09-focus-room.css`
- Modify: `frontend/style.css`

- [ ] **Step 1: Generate six scene images**

Use the `imagegen` skill during execution and save the outputs as WebP files in `frontend/assets/focus-room/`. Use these prompts:

```text
Morning Window: cinematic realistic calm study desk beside a large morning window, soft sunrise over green hills, laptop and notebook on desk, premium AI study app background, bright but readable, no text, no people, 16:9

Rainy Cafe: cinematic realistic quiet cafe window on a rainy day, warm lamps, laptop and coffee on table, rain streaks on glass, calm productive study mood, no text, no people, 16:9

Library Night: cinematic realistic late-night library study desk, bookshelves, warm desk lamp, laptop and notes, calm focused atmosphere, no text, no people, 16:9

Ocean Study Room: cinematic realistic study room facing blue ocean through wide window, soft daylight, desk with laptop and notes, airy calm focus, no text, no people, 16:9

Mountain Cabin: cinematic realistic mountain cabin study desk, snowy mountains through window, warm wood interior, laptop and notebook, cozy focused atmosphere, no text, no people, 16:9

Minimal Desk: cinematic realistic minimal modern study desk, clean neutral room, soft daylight, laptop notebook and glass of water, uncluttered premium focus environment, no text, no people, 16:9
```

Verify:

```bash
ls frontend/assets/focus-room/*.webp
```

Expected:

```text
frontend/assets/focus-room/library-night.webp
frontend/assets/focus-room/minimal-desk.webp
frontend/assets/focus-room/morning-window.webp
frontend/assets/focus-room/mountain-cabin.webp
frontend/assets/focus-room/ocean-study-room.webp
frontend/assets/focus-room/rainy-cafe.webp
```

- [ ] **Step 2: Add the Focus Room stylesheet**

Create `frontend/styles/09-focus-room.css` with this content:

```css
.focus-room-surface {
  position: fixed;
  inset: 0;
  z-index: 2200;
  min-height: 100dvh;
  overflow: hidden;
  color: #f8fafc;
  background: #0d1424;
  font-family: Inter, system-ui, Arial, sans-serif;
}

.focus-room-surface.d-none,
.focus-room-view.d-none,
.focus-learning-panel.d-none,
.focus-summary-overlay.d-none {
  display: none !important;
}

.focus-room-view {
  min-height: 100dvh;
  overflow-y: auto;
}

.focus-room-bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.focus-room-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7, 11, 22, 0.72), rgba(7, 11, 22, 0.42) 42%, rgba(7, 11, 22, 0.66)),
    linear-gradient(180deg, rgba(7, 11, 22, 0.28), rgba(7, 11, 22, 0.72));
}

.focus-room-topbar,
.focus-session-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px clamp(18px, 4vw, 48px);
}

.focus-room-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.focus-room-brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(16px);
}

.focus-room-brand strong,
.focus-room-title {
  overflow-wrap: anywhere;
}

.focus-room-pill,
.focus-room-glass,
.focus-scene-card,
.focus-panel-card,
.focus-timer-card,
.focus-summary-card {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(12, 18, 32, 0.46);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(22px);
}

.focus-room-pill {
  min-height: 44px;
  border-radius: 999px;
  padding: 0 18px;
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
}

.focus-room-setup-layout {
  width: min(1440px, calc(100% - 32px));
  margin: 0 auto 42px;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(340px, 0.72fr);
  gap: 24px;
}

.focus-panel-card {
  border-radius: 28px;
  padding: clamp(20px, 3vw, 34px);
}

.focus-scene-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.focus-scene-card {
  border-radius: 22px;
  padding: 12px;
  color: #f8fafc;
  text-align: left;
  cursor: pointer;
}

.focus-scene-card[aria-pressed="true"] {
  border-color: rgba(125, 211, 252, 0.88);
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.18), 0 24px 80px rgba(0, 0, 0, 0.24);
}

.focus-scene-image {
  height: 154px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  margin-bottom: 14px;
}

.focus-session-layout {
  width: min(1280px, calc(100% - 32px));
  min-height: calc(100dvh - 94px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
  align-items: end;
  gap: 24px;
  padding-bottom: 34px;
}

.focus-timer-card {
  border-radius: 28px;
  padding: 28px;
}

.focus-timer-value {
  font-size: clamp(4rem, 11vw, 8.5rem);
  line-height: 0.9;
  letter-spacing: 0;
  font-weight: 750;
}

.focus-progress-track {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.22);
}

.focus-progress-fill {
  height: 100%;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7dd3fc, #fef3c7);
}

.focus-control-row,
.focus-tab-row,
.focus-duration-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.focus-icon-btn,
.focus-control-btn,
.focus-tab-btn,
.focus-duration-btn {
  min-height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
}

.focus-icon-btn {
  width: 44px;
  padding: 0;
}

.focus-control-btn.primary,
.focus-duration-btn.active,
.focus-tab-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
}

.focus-learning-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(520px, 100vw);
  height: 100dvh;
  z-index: 2250;
  padding: 22px;
  overflow-y: auto;
  background: rgba(8, 13, 24, 0.82);
  border-left: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(24px);
}

.focus-summary-overlay {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: grid;
  place-items: center;
  padding: 22px;
  background: rgba(4, 8, 17, 0.68);
  backdrop-filter: blur(16px);
}

.focus-summary-card {
  width: min(760px, 100%);
  max-height: calc(100dvh - 44px);
  overflow-y: auto;
  border-radius: 28px;
  padding: 28px;
}

.focus-history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.history-focus-room-btn {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(74, 124, 255, 0.22);
  background: #eef4ff;
  color: #2f5fe8;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.analysis-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .focus-room-setup-layout,
  .focus-session-layout {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .focus-scene-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .focus-room-topbar,
  .focus-session-toolbar {
    padding: 16px;
    align-items: flex-start;
  }

  .focus-room-pill {
    min-height: 40px;
    padding: 0 13px;
  }

  .focus-panel-card,
  .focus-timer-card,
  .focus-summary-card {
    border-radius: 22px;
    padding: 18px;
  }

  .focus-timer-value {
    font-size: clamp(3.4rem, 18vw, 5.6rem);
  }
}
```

- [ ] **Step 3: Import the stylesheet**

Append this line to `frontend/style.css`:

```css
@import url("./styles/09-focus-room.css?v=focus-room-v1");
```

- [ ] **Step 4: Run CSS and integration checks**

Run:

```bash
node frontend/tests/focus-room-integration-regression.mjs
git diff --check -- frontend/styles/09-focus-room.css frontend/style.css
```

Expected:

```text
AssertionError
```

The style import should pass, while controller and bridge assertions should still fail. `git diff --check` should print no output.

- [ ] **Step 5: Commit styles and assets**

Run:

```bash
git add frontend/assets/focus-room frontend/styles/09-focus-room.css frontend/style.css
git commit -m "feat: add focus room scenes and styles"
```

Expected:

```text
[branch <sha>] feat: add focus room scenes and styles
```

## Task 5: Add Legacy Focus Room Bridge

**Files:**
- Create: `frontend/src/legacy/controller_sections/10_focusroombridge.js`
- Modify: `frontend/src/legacy/controller.js`
- Modify: `frontend/src/legacy/controller_sections/99_boot.js`
- Modify: `frontend/src/legacy/controller_sections/01_uploadedfiles.js`
- Modify: `frontend/src/legacy/controller_sections/09_togglesourceviewer.js`
- Test: `frontend/tests/focus-room-integration-regression.mjs`

- [ ] **Step 1: Create the bridge section**

Create `frontend/src/legacy/controller_sections/10_focusroombridge.js`:

```js
function getFocusRoomSummaryText() {
  return fullSummary || summaryContent?.textContent || "";
}

function getSynapseFocusRoomCurrentMaterial() {
  const summary = getFocusRoomSummaryText();
  if (!summary || !summary.trim()) return null;
  return {
    materialId: currentHistoryId || currentSourceFingerprint || "current-material",
    materialTitle: storedTitle || makeHistoryTitle(summary) || "Current Study Notes",
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: summary,
    sections,
    flashcards: Array.isArray(currentFlashcards) ? currentFlashcards : [],
    quizzes: Array.isArray(quizHistory) ? quizHistory : [],
    mindMap: currentMindMap,
    studyPlan: currentTimeline?.events || [],
    progressHistory: [],
    sourceFingerprint: currentSourceFingerprint,
    createdAt: "",
    updatedAt: ""
  };
}

function focusRoomMaterialFromHistoryItem(item) {
  return {
    materialId: item.id,
    materialTitle: item.title || makeHistoryTitle(item),
    materialType: "Generated notes",
    uploadedContent: "",
    aiSummary: item.summary || "",
    sections: item.sections || {},
    flashcards: [],
    quizzes: [],
    mindMap: item.mindMap || item.mind_map || item.brainstorm || null,
    studyPlan: [],
    progressHistory: [],
    sourceFingerprint: item.sourceFingerprint || item.clientFingerprint || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || ""
  };
}

function getSynapseFocusRoomMaterials() {
  const historyMaterials = getHistory().map(focusRoomMaterialFromHistoryItem);
  const currentMaterial = getSynapseFocusRoomCurrentMaterial();
  if (currentMaterial && !historyMaterials.some(item => item.materialId === currentMaterial.materialId)) {
    return [currentMaterial, ...historyMaterials];
  }
  return historyMaterials;
}

function getSynapseFocusRoomMaterial(materialId) {
  const id = String(materialId || "");
  return getSynapseFocusRoomMaterials().find(item => item.materialId === id) || null;
}

function renderFocusRoomWorkspaceActions() {
  const button = document.getElementById("focusRoomCta");
  if (!button) return;
  const material = getSynapseFocusRoomCurrentMaterial();
  button.classList.toggle("d-none", !material);
  button.disabled = !material;
  if (material) {
    button.setAttribute("data-material-id", material.materialId);
    button.setAttribute("aria-label", `Study ${material.materialTitle} in Focus Room`);
  }
}

function notifyFocusRoomMaterialsChanged() {
  window.dispatchEvent(new CustomEvent("synapse-focus-room-materials-updated", {
    detail: {
      currentMaterialId: getSynapseFocusRoomCurrentMaterial()?.materialId || "",
      count: getSynapseFocusRoomMaterials().length
    }
  }));
}

function openSynapseFocusRoom(materialId = "") {
  const requestedId = materialId || getSynapseFocusRoomCurrentMaterial()?.materialId || "";
  const suffix = requestedId ? `/${encodeURIComponent(requestedId)}` : "";
  window.location.hash = `#/focus-room${suffix}`;
}

function returnFromFocusRoomToWorkspace(materialId = "") {
  const id = String(materialId || "");
  if (id && getHistory().some(item => item.id === id)) {
    loadHistoryEntry(id, { preserveScroll: true });
  }
  window.location.hash = "";
  renderFocusRoomWorkspaceActions();
}
```

- [ ] **Step 2: Load the bridge section**

In `frontend/src/legacy/controller.js`, add the bridge file after `09_togglesourceviewer.js`:

```js
  "09_togglesourceviewer.js",
  "10_focusroombridge.js",
```

- [ ] **Step 3: Expose bridge functions on window**

In `frontend/src/legacy/controller_sections/99_boot.js`, add these names to `Object.assign(window, { ... })`:

```js
  getSynapseFocusRoomCurrentMaterial,
  getSynapseFocusRoomMaterial,
  getSynapseFocusRoomMaterials,
  notifyFocusRoomMaterialsChanged,
  openSynapseFocusRoom,
  renderFocusRoomWorkspaceActions,
  returnFromFocusRoomToWorkspace,
```

After `renderHistory();`, add:

```js
renderFocusRoomWorkspaceActions();
notifyFocusRoomMaterialsChanged();
```

- [ ] **Step 4: Refresh the CTA when analysis view opens**

In `frontend/src/legacy/controller_sections/01_uploadedfiles.js`, inside `showAnalysisView`, after `renderSourceViewer();`, add:

```js
  if (typeof renderFocusRoomWorkspaceActions === "function") {
    renderFocusRoomWorkspaceActions();
  }
  if (typeof notifyFocusRoomMaterialsChanged === "function") {
    notifyFocusRoomMaterialsChanged();
  }
```

- [ ] **Step 5: Add Focus Room action buttons to history rows**

In `frontend/src/legacy/controller_sections/09_togglesourceviewer.js`, update `renderHistoryItemsHTML(items)` so each `.history-item-wrap` includes this button before the delete button:

```html
      <button class="history-focus-room-btn" type="button"
              title="Study in Focus Room"
              aria-label="Study ${escapeAttr(makeHistoryTitle(item))} in Focus Room"
              onclick="event.preventDefault(); event.stopPropagation(); openSynapseFocusRoom('${escapeAttr(item.id)}')">
        <i class="bi bi-door-open"></i>
      </button>
```

In `saveHistoryEntry(payload)`, after `renderHistory();`, add:

```js
  if (typeof renderFocusRoomWorkspaceActions === "function") renderFocusRoomWorkspaceActions();
  if (typeof notifyFocusRoomMaterialsChanged === "function") notifyFocusRoomMaterialsChanged();
```

In `deleteHistoryEntry(event, id)`, after `renderHistory(historySearch ? historySearch.value : "");`, add:

```js
  if (typeof renderFocusRoomWorkspaceActions === "function") renderFocusRoomWorkspaceActions();
  if (typeof notifyFocusRoomMaterialsChanged === "function") notifyFocusRoomMaterialsChanged();
```

In `loadHistoryEntry(id, options = {})`, after `renderFullNotes();`, add:

```js
  if (typeof renderFocusRoomWorkspaceActions === "function") renderFocusRoomWorkspaceActions();
  if (typeof notifyFocusRoomMaterialsChanged === "function") notifyFocusRoomMaterialsChanged();
```

- [ ] **Step 6: Run the integration regression test and verify partial failure**

Run:

```bash
node frontend/tests/focus-room-integration-regression.mjs
```

Expected:

```text
AssertionError
```

Bridge assertions should pass. Focus Room controller assertions should still fail.

- [ ] **Step 7: Commit the bridge**

Run:

```bash
git add frontend/src/legacy/controller.js frontend/src/legacy/controller_sections/10_focusroombridge.js frontend/src/legacy/controller_sections/99_boot.js frontend/src/legacy/controller_sections/01_uploadedfiles.js frontend/src/legacy/controller_sections/09_togglesourceviewer.js
git commit -m "feat: bridge workspace materials to focus room"
```

Expected:

```text
[branch <sha>] feat: bridge workspace materials to focus room
```

## Task 6: Add Focus Room Controller

**Files:**
- Create: `frontend/src/focus-room/controller.js`
- Modify: `frontend/src/main.js`
- Test: `frontend/tests/focus-room-integration-regression.mjs`
- Test: `frontend/tests/focus-room-data-regression.mjs`

- [ ] **Step 1: Implement the Focus Room controller**

Create `frontend/src/focus-room/controller.js` with these exported and global behaviors:

```js
import {
  FOCUS_ROOM_DURATIONS,
  FOCUS_ROOM_SCENES,
  buildFocusRoomStudyPlan,
  formatFocusRoomDuration,
  getFocusRoomMaterial,
  getFocusRoomMaterials,
  readFocusRoomDraft,
  readFocusRoomSessions,
  saveFocusRoomSession,
  writeFocusRoomDraft
} from "./data.js";

const state = {
  route: "workspace",
  materialId: "",
  material: null,
  selectedScene: FOCUS_ROOM_SCENES[0].id,
  musicType: FOCUS_ROOM_SCENES[0].musicType,
  ambientSound: FOCUS_ROOM_SCENES[0].ambientSound,
  musicVolume: 60,
  ambientVolume: 50,
  durationMinutes: 50,
  studyGoal: "",
  studyPlan: [],
  status: "Ready",
  startedAt: null,
  elapsedSeconds: 0,
  timerId: null,
  panelTab: "summary",
  panelOpen: false,
  summaryRecord: null,
  completedTasks: new Set()
};

function byId(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentScene() {
  return FOCUS_ROOM_SCENES.find(scene => scene.id === state.selectedScene) || FOCUS_ROOM_SCENES[0];
}

function parseRoute() {
  const hash = window.location.hash || "";
  if (hash.startsWith("#/study-history")) return { name: "history", materialId: "" };
  if (hash.startsWith("#/focus-room")) {
    const id = decodeURIComponent(hash.replace(/^#\/focus-room\/?/, ""));
    return { name: "focus", materialId: id };
  }
  return { name: "workspace", materialId: "" };
}

function setWorkspaceVisible(visible) {
  byId("appLayout")?.classList.toggle("d-none", !visible);
  byId("openAssistant")?.classList.toggle("d-none", !visible);
  byId("focusRoomSurface")?.classList.toggle("d-none", visible);
}

function routeFocusRoom() {
  const route = parseRoute();
  state.route = route.name;
  state.materialId = route.materialId;

  if (route.name === "workspace") {
    pauseFocusRoomTimer();
    setWorkspaceVisible(true);
    return;
  }

  setWorkspaceVisible(false);

  if (route.name === "history") {
    renderStudyHistory();
    return;
  }

  state.material = getFocusRoomMaterial(route.materialId);
  if (!state.material) {
    renderMaterialEmptyState();
    return;
  }

  hydrateDraft();
  renderFocusRoomSetup();
}

function hydrateDraft() {
  const draft = readFocusRoomDraft();
  if (!draft || draft.materialId !== state.material?.materialId) {
    state.studyGoal = `Study ${state.material?.materialTitle || "this material"}`;
    state.studyPlan = buildFocusRoomStudyPlan({
      material: state.material,
      goal: state.studyGoal,
      durationMinutes: state.durationMinutes
    });
    return;
  }
  Object.assign(state, {
    selectedScene: draft.selectedScene || state.selectedScene,
    musicType: draft.musicType || state.musicType,
    ambientSound: draft.ambientSound || state.ambientSound,
    musicVolume: Number(draft.musicVolume ?? state.musicVolume),
    ambientVolume: Number(draft.ambientVolume ?? state.ambientVolume),
    durationMinutes: Number(draft.durationMinutes || state.durationMinutes),
    studyGoal: draft.studyGoal || state.studyGoal
  });
  state.studyPlan = buildFocusRoomStudyPlan({
    material: state.material,
    goal: state.studyGoal,
    durationMinutes: state.durationMinutes
  });
}

function persistDraft() {
  writeFocusRoomDraft({
    materialId: state.material?.materialId || "",
    selectedScene: state.selectedScene,
    musicType: state.musicType,
    ambientSound: state.ambientSound,
    musicVolume: state.musicVolume,
    ambientVolume: state.ambientVolume,
    durationMinutes: state.durationMinutes,
    studyGoal: state.studyGoal
  });
}

function renderFocusRoomSetup() {
  const root = byId("focusRoomSetup");
  if (!root) return;
  byId("focusRoomSession")?.classList.add("d-none");
  byId("focusStudyHistory")?.classList.add("d-none");
  root.classList.remove("d-none");
  const scene = currentScene();
  root.innerHTML = `
    <div class="focus-room-bg" style="background-image:url('${scene.image}')"></div>
    <header class="focus-room-topbar">
      <div class="focus-room-brand">
        <span class="focus-room-brand-mark"><i class="bi bi-journal-bookmark"></i></span>
        <div>
          <strong>Synapse Focus Room</strong>
          <div>${escapeHTML(state.material.materialTitle)}</div>
        </div>
      </div>
      <div class="focus-control-row">
        <button class="focus-room-pill" type="button" onclick="showFocusStudyHistory()"><i class="bi bi-clock-history"></i>History</button>
        <button class="focus-room-pill" type="button" onclick="returnFromFocusRoom()"><i class="bi bi-arrow-left"></i>Workspace</button>
      </div>
    </header>
    <main class="focus-room-setup-layout">
      <section class="focus-panel-card">
        <p class="focus-room-title">Step 01</p>
        <h1>Choose your study scene</h1>
        <div class="focus-scene-grid">
          ${FOCUS_ROOM_SCENES.map(item => `
            <button class="focus-scene-card" type="button" aria-pressed="${item.id === state.selectedScene}" onclick="selectFocusScene('${item.id}')">
              <div class="focus-scene-image" style="background-image:url('${item.image}')"></div>
              <span>${escapeHTML(item.kicker)}</span>
              <h3>${escapeHTML(item.name)}</h3>
              <p>${escapeHTML(item.description)}</p>
            </button>
          `).join("")}
        </div>
      </section>
      <aside class="focus-panel-card">
        <p class="focus-room-title">Step 02</p>
        <h2>Set the atmosphere</h2>
        ${renderSoundControls()}
        <p class="focus-room-title">Step 03</p>
        <h2>Set the Pomodoro</h2>
        ${renderDurationControls()}
        <label class="focus-room-title" for="focusStudyGoal">Study goal</label>
        <textarea id="focusStudyGoal" class="form-control" rows="3" onchange="updateFocusGoal(this.value)">${escapeHTML(state.studyGoal)}</textarea>
        ${renderStudyPlanPreview()}
        <button class="focus-control-btn primary w-100 mt-3" type="button" onclick="startFocusRoomSession()">
          Enter Focus Room <i class="bi bi-arrow-right"></i>
        </button>
      </aside>
    </main>
  `;
}

function renderSoundControls() {
  return `
    <label>Music volume</label>
    <input type="range" min="0" max="100" value="${state.musicVolume}" oninput="updateFocusSound('musicVolume', this.value)">
    <label>Ambient volume</label>
    <input type="range" min="0" max="100" value="${state.ambientVolume}" oninput="updateFocusSound('ambientVolume', this.value)">
  `;
}

function renderDurationControls() {
  return `
    <div class="focus-duration-grid">
      ${FOCUS_ROOM_DURATIONS.map(minutes => `
        <button class="focus-duration-btn ${minutes === state.durationMinutes ? "active" : ""}" type="button" onclick="setFocusDuration(${minutes})">${minutes} min</button>
      `).join("")}
    </div>
    <input class="form-control mt-2" type="number" min="10" max="180" value="${state.durationMinutes}" onchange="setFocusDuration(this.value)">
  `;
}

function renderStudyPlanPreview() {
  return `
    <ol class="focus-study-plan">
      ${state.studyPlan.map((item, index) => `
        <li>
          <button type="button" onclick="toggleFocusTask(${index})" aria-pressed="${state.completedTasks.has(index)}">
            ${item.minutes} min: ${escapeHTML(item.task)}
          </button>
        </li>
      `).join("")}
    </ol>
  `;
}

function renderFocusRoomSession() {
  const root = byId("focusRoomSession");
  if (!root) return;
  const scene = currentScene();
  byId("focusRoomSetup")?.classList.add("d-none");
  byId("focusStudyHistory")?.classList.add("d-none");
  root.classList.remove("d-none");
  root.innerHTML = `
    <div class="focus-room-bg" style="background-image:url('${scene.image}')"></div>
    <header class="focus-session-toolbar">
      <div class="focus-room-brand">
        <span class="focus-room-brand-mark"><i class="bi bi-door-open"></i></span>
        <div><strong>${escapeHTML(state.material.materialTitle)}</strong><div>${escapeHTML(scene.name)}</div></div>
      </div>
      <div class="focus-control-row">
        <button class="focus-room-pill" type="button" onclick="toggleFocusLearningPanel()"><i class="bi bi-stars"></i>AI Learning Panel</button>
        <button class="focus-room-pill" type="button" onclick="returnFromFocusRoom()"><i class="bi bi-arrow-left"></i>Workspace</button>
      </div>
    </header>
    <main class="focus-session-layout">
      <section class="focus-timer-card">
        <div class="focus-room-title">Pomodoro #1 <span>${escapeHTML(state.status)}</span></div>
        <div class="focus-timer-value">${formatTimer()}</div>
        <div class="focus-progress-track"><div class="focus-progress-fill" style="width:${focusProgressPercent()}%"></div></div>
        <p>${escapeHTML(state.studyGoal)}</p>
        <div class="focus-control-row">
          ${renderTimerButtons()}
        </div>
      </section>
      <section class="focus-panel-card">
        <h2>Current study plan</h2>
        ${renderStudyPlanPreview()}
        ${renderSoundControls()}
      </section>
    </main>
  `;
  renderFocusLearningPanel();
}

function renderTimerButtons() {
  if (state.status === "Studying") {
    return `
      <button class="focus-control-btn primary" type="button" onclick="pauseFocusRoomTimer()"><i class="bi bi-pause"></i>Pause</button>
      <button class="focus-control-btn" type="button" onclick="endFocusRoomSession()"><i class="bi bi-x-lg"></i>End</button>
    `;
  }
  return `
    <button class="focus-control-btn primary" type="button" onclick="startFocusRoomTimer()"><i class="bi bi-play"></i>${state.elapsedSeconds ? "Resume" : "Start"}</button>
    <button class="focus-control-btn" type="button" onclick="resetFocusRoomTimer()"><i class="bi bi-arrow-counterclockwise"></i>Reset</button>
    <button class="focus-control-btn" type="button" onclick="skipFocusRoomTimer()"><i class="bi bi-skip-forward"></i>Skip</button>
    <button class="focus-control-btn" type="button" onclick="endFocusRoomSession()"><i class="bi bi-x-lg"></i>End</button>
  `;
}

function formatTimer() {
  const remaining = Math.max(0, state.durationMinutes * 60 - state.elapsedSeconds);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function focusProgressPercent() {
  return Math.min(100, Math.round((state.elapsedSeconds / (state.durationMinutes * 60)) * 100));
}

function renderFocusLearningPanel() {
  const panel = byId("focusLearningPanel");
  if (!panel) return;
  panel.classList.toggle("d-none", !state.panelOpen);
  if (!state.panelOpen) return;
  const tabs = ["materials", "summary", "flashcards", "quiz", "mindmap", "chat", "plan"];
  panel.innerHTML = `
    <div class="focus-control-row">
      <strong>AI Learning Panel</strong>
      <button class="focus-icon-btn" type="button" onclick="toggleFocusLearningPanel()" aria-label="Close panel"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="focus-tab-row">
      ${tabs.map(tab => `<button class="focus-tab-btn ${state.panelTab === tab ? "active" : ""}" type="button" onclick="setFocusPanelTab('${tab}')">${tab}</button>`).join("")}
    </div>
    <div class="focus-panel-body">${renderFocusPanelBody()}</div>
  `;
}

function renderFocusPanelBody() {
  if (state.panelTab === "materials") {
    return getFocusRoomMaterials().map(item => `
      <button class="focus-control-btn" type="button" onclick="openSynapseFocusRoom('${item.materialId}')">${escapeHTML(item.materialTitle)}</button>
    `).join("");
  }
  if (state.panelTab === "summary") {
    return state.material.aiSummary ? `<div>${escapeHTML(state.material.summaryText).slice(0, 2200)}</div>` : renderPanelEmpty("Summary", "Return to the workspace and generate notes for this material.");
  }
  if (state.panelTab === "flashcards") return renderPanelEmpty("Flashcards", "Use the existing Synapse flashcard generator, then return to this room.");
  if (state.panelTab === "quiz") return renderPanelEmpty("Quiz", "Use the existing Synapse quiz generator, then continue this session.");
  if (state.panelTab === "mindmap") return state.material.mindMap ? `<pre>${escapeHTML(JSON.stringify(state.material.mindMap, null, 2))}</pre>` : renderPanelEmpty("Mind Map", "Generate a mind map or study path from the workspace.");
  if (state.panelTab === "chat") return `<button class="focus-control-btn primary" type="button" onclick="returnFromFocusRoom('', 'assistant')">Ask in Synapse Assistant</button>`;
  return renderStudyPlanPreview();
}

function renderPanelEmpty(title, action) {
  return `<div class="focus-panel-card"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(action)}</p><button class="focus-control-btn" type="button" onclick="returnFromFocusRoom('${state.material?.materialId || ""}')">Open workspace tools</button></div>`;
}

function renderMaterialEmptyState() {
  setWorkspaceVisible(false);
  const root = byId("focusRoomSetup");
  if (!root) return;
  root.classList.remove("d-none");
  byId("focusRoomSession")?.classList.add("d-none");
  root.innerHTML = `
    <div class="focus-room-bg"></div>
    <main class="focus-room-setup-layout">
      <section class="focus-panel-card">
        <h1>No study material yet</h1>
        <p>Upload or open generated Synapse notes first, then send them into the Focus Room.</p>
        <button class="focus-control-btn primary" type="button" onclick="returnFromFocusRoom()">Back to upload workspace</button>
      </section>
    </main>
  `;
}

function renderStudyHistory() {
  setWorkspaceVisible(false);
  const root = byId("focusStudyHistory");
  if (!root) return;
  byId("focusRoomSetup")?.classList.add("d-none");
  byId("focusRoomSession")?.classList.add("d-none");
  root.classList.remove("d-none");
  const sessions = readFocusRoomSessions();
  root.innerHTML = `
    <header class="focus-room-topbar">
      <h1>Focus Room History</h1>
      <button class="focus-room-pill" type="button" onclick="returnFromFocusRoom()"><i class="bi bi-arrow-left"></i>Workspace</button>
    </header>
    <main class="focus-room-setup-layout">
      <section class="focus-panel-card">
        <div class="focus-history-grid">
          ${sessions.length ? sessions.map(renderHistoryCard).join("") : "<p>No focus sessions saved yet.</p>"}
        </div>
      </section>
    </main>
  `;
}

function renderHistoryCard(session) {
  return `
    <article class="focus-panel-card">
      <h3>${escapeHTML(session.materialTitle)}</h3>
      <p>${escapeHTML(session.studyGoal || "Focused study session")}</p>
      <strong>${formatFocusRoomDuration(session.totalFocusTime)}</strong>
      <p>${escapeHTML(session.recommendedNextStep)}</p>
    </article>
  `;
}

function startFocusRoomSession() {
  state.status = "Ready";
  state.startedAt = new Date().toISOString();
  state.elapsedSeconds = 0;
  state.completedTasks = new Set();
  persistDraft();
  renderFocusRoomSession();
}

function startFocusRoomTimer() {
  if (state.timerId) return;
  state.status = "Studying";
  if (!state.startedAt) state.startedAt = new Date().toISOString();
  state.timerId = window.setInterval(() => {
    state.elapsedSeconds = Math.min(state.durationMinutes * 60, state.elapsedSeconds + 1);
    if (state.elapsedSeconds >= state.durationMinutes * 60) {
      state.status = "Completed";
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
    renderFocusRoomSession();
  }, 1000);
  renderFocusRoomSession();
}

function pauseFocusRoomTimer() {
  if (state.timerId) window.clearInterval(state.timerId);
  state.timerId = null;
  if (state.status === "Studying") state.status = "Paused";
}

function resetFocusRoomTimer() {
  pauseFocusRoomTimer();
  state.elapsedSeconds = 0;
  state.status = "Ready";
  renderFocusRoomSession();
}

function skipFocusRoomTimer() {
  pauseFocusRoomTimer();
  state.elapsedSeconds = state.durationMinutes * 60;
  state.status = "Completed";
  renderFocusRoomSession();
}

function endFocusRoomSession() {
  pauseFocusRoomTimer();
  const record = saveFocusRoomSession({
    materialId: state.material.materialId,
    materialTitle: state.material.materialTitle,
    studyGoal: state.studyGoal,
    selectedScene: state.selectedScene,
    musicType: state.musicType,
    ambientSound: state.ambientSound,
    musicVolume: state.musicVolume,
    ambientVolume: state.ambientVolume,
    pomodoroDuration: state.durationMinutes,
    startedAt: state.startedAt,
    endedAt: new Date().toISOString(),
    totalFocusTime: state.elapsedSeconds,
    completedTasks: [...state.completedTasks].map(index => state.studyPlan[index]?.task).filter(Boolean),
    aiReflection: `You studied ${state.material.materialTitle} for ${formatFocusRoomDuration(state.elapsedSeconds)}.`,
    recommendedNextStep: "Review one weak area, then run another focused block."
  });
  state.summaryRecord = record;
  renderSessionSummary();
}

function renderSessionSummary() {
  const root = byId("focusSessionSummary");
  if (!root || !state.summaryRecord) return;
  root.classList.remove("d-none");
  root.innerHTML = `
    <section class="focus-summary-card">
      <h2>Session complete</h2>
      <p>${escapeHTML(state.summaryRecord.aiReflection)}</p>
      <dl>
        <dt>Material</dt><dd>${escapeHTML(state.summaryRecord.materialTitle)}</dd>
        <dt>Focus time</dt><dd>${formatFocusRoomDuration(state.summaryRecord.totalFocusTime)}</dd>
        <dt>Goal</dt><dd>${escapeHTML(state.summaryRecord.studyGoal)}</dd>
        <dt>Next step</dt><dd>${escapeHTML(state.summaryRecord.recommendedNextStep)}</dd>
      </dl>
      <div class="focus-control-row">
        <button class="focus-control-btn primary" type="button" onclick="closeFocusSummary()">Stay in room</button>
        <button class="focus-control-btn" type="button" onclick="showFocusStudyHistory()">View history</button>
        <button class="focus-control-btn" type="button" onclick="returnFromFocusRoom('${state.material.materialId}')">Back to workspace</button>
      </div>
    </section>
  `;
}

function closeFocusSummary() {
  byId("focusSessionSummary")?.classList.add("d-none");
}

function selectFocusScene(sceneId) {
  const scene = FOCUS_ROOM_SCENES.find(item => item.id === sceneId);
  if (!scene) return;
  state.selectedScene = scene.id;
  state.musicType = scene.musicType;
  state.ambientSound = scene.ambientSound;
  persistDraft();
  renderFocusRoomSetup();
}

function updateFocusSound(key, value) {
  state[key] = Number(value);
  persistDraft();
}

function setFocusDuration(value) {
  state.durationMinutes = Math.max(10, Math.min(180, Number(value) || 25));
  state.studyPlan = buildFocusRoomStudyPlan({ material: state.material, goal: state.studyGoal, durationMinutes: state.durationMinutes });
  persistDraft();
  renderFocusRoomSetup();
}

function updateFocusGoal(value) {
  state.studyGoal = String(value || "");
  state.studyPlan = buildFocusRoomStudyPlan({ material: state.material, goal: state.studyGoal, durationMinutes: state.durationMinutes });
  persistDraft();
  renderFocusRoomSetup();
}

function toggleFocusTask(index) {
  if (state.completedTasks.has(index)) state.completedTasks.delete(index);
  else state.completedTasks.add(index);
  if (state.route === "focus") renderFocusRoomSession();
}

function toggleFocusLearningPanel() {
  state.panelOpen = !state.panelOpen;
  renderFocusLearningPanel();
}

function setFocusPanelTab(tab) {
  state.panelTab = tab;
  renderFocusLearningPanel();
}

function returnFromFocusRoom(materialId = "") {
  pauseFocusRoomTimer();
  closeFocusSummary();
  if (typeof globalThis.returnFromFocusRoomToWorkspace === "function") {
    globalThis.returnFromFocusRoomToWorkspace(materialId || state.material?.materialId || "");
  } else {
    window.location.hash = "";
  }
}

function showFocusStudyHistory() {
  window.location.hash = "#/study-history";
}

function initFocusRoom() {
  window.addEventListener("hashchange", routeFocusRoom);
  window.addEventListener("synapse-focus-room-materials-updated", () => {
    if (state.route === "focus" || state.route === "history") routeFocusRoom();
  });
  Object.assign(window, {
    closeFocusSummary,
    endFocusRoomSession,
    pauseFocusRoomTimer,
    resetFocusRoomTimer,
    returnFromFocusRoom,
    selectFocusScene,
    setFocusDuration,
    setFocusPanelTab,
    showFocusStudyHistory,
    skipFocusRoomTimer,
    startFocusRoomSession,
    startFocusRoomTimer,
    toggleFocusLearningPanel,
    toggleFocusTask,
    updateFocusGoal,
    updateFocusSound
  });
  routeFocusRoom();
}

export { initFocusRoom };
```

- [ ] **Step 2: Initialize the controller**

Modify `frontend/src/main.js`:

```js
import { App } from "./react/App.js?v=account-landing-v3";
import { initFocusRoom } from "./focus-room/controller.js";
import { loadLegacyController } from "./legacy/loadLegacyController.js?v=account-landing-v3";
```

Then call `initFocusRoom()` after the legacy controller load calls in both branches:

```js
  loadLegacyController();
  initFocusRoom();
```

and:

```js
  requestAnimationFrame(() => {
    loadLegacyController();
    initFocusRoom();
  });
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
node frontend/tests/focus-room-data-regression.mjs
node frontend/tests/focus-room-integration-regression.mjs
```

Expected:

```text
focus room data regression passed
focus room integration regression passed
```

- [ ] **Step 4: Commit the controller**

Run:

```bash
git add frontend/src/focus-room/controller.js frontend/src/main.js frontend/tests/focus-room-integration-regression.mjs
git commit -m "feat: add focus room routing and session controller"
```

Expected:

```text
[branch <sha>] feat: add focus room routing and session controller
```

## Task 7: Polish Existing Tool Connections Inside The Panel

**Files:**
- Modify: `frontend/src/focus-room/controller.js`
- Modify: `frontend/src/legacy/controller_sections/10_focusroombridge.js`
- Test: `frontend/tests/focus-room-data-regression.mjs`

- [ ] **Step 1: Extend bridge material records with stored quiz and flashcard metadata**

In `frontend/src/legacy/controller_sections/10_focusroombridge.js`, add:

```js
function getFocusRoomFlashcardsForCurrentNote() {
  const store = getFlashcardStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const record = keys.map(key => store[key]).find(item => item && Array.isArray(item.cards));
  return record?.cards || currentFlashcards || [];
}

function getFocusRoomQuizRecordsForCurrentNote() {
  const records = Array.isArray(quizHistory) ? quizHistory : [];
  return records.map(record => ({
    id: record.id,
    title: record.title,
    questions: record.quiz?.questions || [],
    report: record.report || null
  }));
}
```

In `getSynapseFocusRoomCurrentMaterial()`, replace the existing `flashcards` and `quizzes` fields with:

```js
    flashcards: getFocusRoomFlashcardsForCurrentNote(),
    quizzes: getFocusRoomQuizRecordsForCurrentNote(),
```

Keep `focusRoomMaterialFromHistoryItem(item)` using empty arrays for `flashcards` and `quizzes`, because saved history tool records are loaded into the legacy state when the user opens that material.

- [ ] **Step 2: Improve panel bodies for flashcards and quizzes**

In `frontend/src/focus-room/controller.js`, replace the flashcard and quiz branches in `renderFocusPanelBody()`:

```js
  if (state.panelTab === "flashcards") {
    const cards = state.material.flashcards || [];
    if (!cards.length) return renderPanelEmpty("Flashcards", "Use the existing Synapse flashcard generator, then return to this room.");
    return cards.slice(0, 12).map((card, index) => `
      <article class="focus-panel-card">
        <strong>Card ${index + 1}</strong>
        <p>${escapeHTML(card.front || card.question || "")}</p>
        <details><summary>Answer</summary><p>${escapeHTML(card.back || card.answer || "")}</p></details>
      </article>
    `).join("");
  }
  if (state.panelTab === "quiz") {
    const quizzes = state.material.quizzes || [];
    if (!quizzes.length) return renderPanelEmpty("Quiz", "Use the existing Synapse quiz generator, then continue this session.");
    return quizzes.map(record => `
      <article class="focus-panel-card">
        <h3>${escapeHTML(record.title || "Generated quiz")}</h3>
        <p>${record.questions?.length || 0} questions available</p>
        <button class="focus-control-btn" type="button" onclick="returnFromFocusRoom('${state.material.materialId}')">Open quiz in workspace</button>
      </article>
    `).join("");
  }
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
node frontend/tests/focus-room-data-regression.mjs
node frontend/tests/focus-room-integration-regression.mjs
```

Expected:

```text
focus room data regression passed
focus room integration regression passed
```

- [ ] **Step 4: Commit tool panel polish**

Run:

```bash
git add frontend/src/focus-room/controller.js frontend/src/legacy/controller_sections/10_focusroombridge.js
git commit -m "feat: connect focus room panel to study tools"
```

Expected:

```text
[branch <sha>] feat: connect focus room panel to study tools
```

## Task 8: Full Verification And Browser QA

**Files:**
- Verify only.

- [ ] **Step 1: Run static validation**

Run:

```bash
node scripts/validate_static_site.mjs
```

Expected:

```text
Static site validation passed
```

If the script prints a different success line, record the exact success line in the final implementation summary.

- [ ] **Step 2: Run targeted frontend regressions**

Run:

```bash
node frontend/tests/focus-room-data-regression.mjs
node frontend/tests/focus-room-integration-regression.mjs
node frontend/tests/loading-history-nav-regression.mjs
node frontend/tests/auth-routing-regression.mjs
node frontend/tests/flashcard-matching-regression.mjs
```

Expected:

```text
focus room data regression passed
focus room integration regression passed
loading history navigation regression passed
auth routing regression passed
flashcard matching regression passed
```

- [ ] **Step 3: Start the static frontend**

Run:

```bash
.venv/bin/python run_frontend.py
```

Expected:

```text
Serving HTTP on
```

Keep the server running until browser QA is complete.

- [ ] **Step 4: Browser QA with the Browser plugin**

Open:

```text
http://127.0.0.1:5173/frontend/index.html
```

Verify:

- Workspace loads normally.
- Generated-note history still renders and delete buttons still work.
- A loaded analysis shows `Study in Focus Room`.
- A history row shows the door icon action.
- `#/focus-room/:materialId` opens setup with the selected material title.
- Scene cards show image-backed scenes.
- Timer starts, pauses, resets, skips, and ends.
- Ending a session opens a session summary.
- `#/study-history` shows the saved session.
- Back to workspace restores the selected material context.
- At desktop and mobile widths, text and controls do not overlap.

- [ ] **Step 5: Stop the static frontend**

Stop the server process with `Ctrl-C` in the running terminal session.

Expected:

```text
Keyboard interrupt received
```

- [ ] **Step 6: Final status**

Run:

```bash
git status --short
```

Expected:

```text
 M ...
```

Only files touched by the Focus Room implementation should be staged or committed by the implementation worker. Existing unrelated dirty files from before this plan should remain untouched unless the user explicitly asks to include them.
