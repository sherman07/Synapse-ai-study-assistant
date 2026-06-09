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

const DEFAULT_SCENE_ID = FOCUS_ROOM_SCENES[0]?.id || "morning-window";
const DEFAULT_DURATION_MINUTES = FOCUS_ROOM_DURATIONS[0] || 25;
const MIN_DURATION_MINUTES = 10;
const MAX_DURATION_MINUTES = 180;
const SOUND_MIN = 0;
const SOUND_MAX = 100;
const PANEL_TAB_LIST = ["materials", "summary", "flashcards", "quiz", "mindmap", "chat", "plan"];
const PANEL_TABS = new Set(PANEL_TAB_LIST);

const state = {
  route: "workspace",
  materialId: "",
  material: null,
  selectedScene: DEFAULT_SCENE_ID,
  musicType: FOCUS_ROOM_SCENES[0]?.musicType || "Deep Focus",
  ambientSound: FOCUS_ROOM_SCENES[0]?.ambientSound || "Nature",
  musicVolume: 60,
  ambientVolume: 50,
  durationMinutes: DEFAULT_DURATION_MINUTES,
  studyGoal: "",
  studyPlan: [],
  timerStatus: "idle",
  startedAt: null,
  elapsedSeconds: 0,
  timerId: null,
  panelTab: "summary",
  panelOpen: false,
  summaryRecord: null,
  completedTasks: []
};

let bodyOverflowBeforeFocus = "";
let bodyScrollLocked = false;

function byId(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

function jsStringAttr(value) {
  return escapeAttr(JSON.stringify(String(value ?? "")));
}

function panelTabLabel(tab) {
  if (tab === "mindmap") return "Mind Map";
  return String(tab || "").replace(/^\w/, letter => letter.toUpperCase());
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function clampInteger(value, fallback, min, max) {
  return Math.round(clampNumber(value, fallback, min, max));
}

function clampVolume(value, fallback = 50) {
  return clampInteger(value, fallback, SOUND_MIN, SOUND_MAX);
}

function clampDuration(value, fallback = DEFAULT_DURATION_MINUTES) {
  return clampInteger(value, fallback, MIN_DURATION_MINUTES, MAX_DURATION_MINUTES);
}

function currentScene() {
  return FOCUS_ROOM_SCENES.find(scene => scene.id === state.selectedScene) || FOCUS_ROOM_SCENES[0] || {
    id: DEFAULT_SCENE_ID,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}

function sceneById(sceneId) {
  return FOCUS_ROOM_SCENES.find(scene => scene.id === sceneId) || null;
}

function parseRoute() {
  const hash = String(globalThis.location?.hash || "");
  const routeHash = hash.split("?")[0];

  if (routeHash === "#/study-history") {
    return { name: "history", materialId: "" };
  }

  if (routeHash === "#/focus-room" || routeHash.startsWith("#/focus-room/")) {
    const rawId = routeHash.slice("#/focus-room".length).replace(/^\/+/, "");
    let materialId = "";
    try {
      materialId = rawId ? decodeURIComponent(rawId) : "";
    } catch {
      materialId = rawId;
    }
    return { name: "focus", materialId };
  }

  return { name: "workspace", materialId: "" };
}

function setElementVisible(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.classList.toggle("d-none", !visible);
}

function setBodyFocusLock(active) {
  document.body.classList.toggle("focus-room-open", active);
  if (active && !bodyScrollLocked) {
    bodyOverflowBeforeFocus = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
    bodyScrollLocked = true;
    return;
  }
  if (!active && bodyScrollLocked) {
    document.body.style.overflow = bodyOverflowBeforeFocus;
    bodyOverflowBeforeFocus = "";
    bodyScrollLocked = false;
  }
}

function setWorkspaceVisible(visible) {
  const focusSurface = byId("focusRoomSurface");
  setElementVisible(focusSurface, !visible);
  setElementVisible(byId("appLayout"), visible);
  setElementVisible(byId("openAssistant"), visible);
  setBodyFocusLock(!visible);
}

function setFocusView(view) {
  setElementVisible(byId("focusRoomSetup"), view === "setup");
  setElementVisible(byId("focusRoomSession"), view === "session");
  setElementVisible(byId("focusStudyHistory"), view === "history");
  if (view !== "session") {
    state.panelOpen = false;
  }
  renderLearningPanel();
}

function normalizeDraftRoot(rawDraft) {
  if (!rawDraft || typeof rawDraft !== "object") {
    return { materials: {} };
  }

  if (rawDraft.materials && typeof rawDraft.materials === "object") {
    return {
      ...rawDraft,
      materials: { ...rawDraft.materials }
    };
  }

  const materialId = String(rawDraft.materialId || "");
  if (materialId) {
    return {
      materials: {
        [materialId]: rawDraft
      }
    };
  }

  return { materials: {} };
}

function readDraftForMaterial(materialId) {
  const id = String(materialId || "");
  if (!id) return null;
  const root = normalizeDraftRoot(readFocusRoomDraft());
  const draft = root.materials[id];
  return draft && typeof draft === "object" ? draft : null;
}

function hydrateDraft(material) {
  const scene = currentScene();
  const draft = readDraftForMaterial(material?.materialId);
  const selectedScene = sceneById(draft?.selectedScene) ? draft.selectedScene : scene.id;
  state.selectedScene = selectedScene;
  const activeScene = currentScene();
  state.musicType = String(draft?.musicType || activeScene.musicType || "Deep Focus");
  state.ambientSound = String(draft?.ambientSound || activeScene.ambientSound || "Nature");
  state.musicVolume = clampVolume(draft?.musicVolume, state.musicVolume);
  state.ambientVolume = clampVolume(draft?.ambientVolume, state.ambientVolume);
  state.durationMinutes = clampDuration(draft?.durationMinutes, state.durationMinutes);
  state.studyGoal = String(draft?.studyGoal || `Study ${material?.materialTitle || "this material"}`);
  rebuildStudyPlan();
}

function persistDraft() {
  if (!state.materialId) return;
  const root = normalizeDraftRoot(readFocusRoomDraft());
  root.materials[state.materialId] = {
    materialId: state.materialId,
    selectedScene: state.selectedScene,
    musicType: state.musicType,
    ambientSound: state.ambientSound,
    musicVolume: clampVolume(state.musicVolume),
    ambientVolume: clampVolume(state.ambientVolume),
    durationMinutes: clampDuration(state.durationMinutes),
    studyGoal: state.studyGoal,
    updatedAt: new Date().toISOString()
  };
  writeFocusRoomDraft(root);
}

function rebuildStudyPlan() {
  if (!state.material) {
    state.studyPlan = [];
    return;
  }
  state.studyPlan = buildFocusRoomStudyPlan({
    material: state.material,
    goal: state.studyGoal,
    durationMinutes: state.durationMinutes
  });
}

function renderBackground(scene = currentScene()) {
  const image = scene?.image || "";
  return `<div class="focus-room-bg" style="background-image: url(&quot;${escapeAttr(image)}&quot;);"></div>`;
}

function renderTopbar({ kicker, title, subtitle, actions = "" }) {
  return `
    <div class="focus-room-topbar">
      <div class="focus-room-title-block">
        <p class="focus-room-kicker">${escapeHTML(kicker)}</p>
        <h1 class="focus-room-title">${escapeHTML(title)}</h1>
        ${subtitle ? `<p class="focus-room-subtitle">${escapeHTML(subtitle)}</p>` : ""}
      </div>
      <div class="focus-control-row">
        ${actions}
      </div>
    </div>
  `;
}

function renderMaterialCard(material) {
  const headings = Array.isArray(material?.studyHeadings) ? material.studyHeadings.slice(0, 4) : [];
  const headingText = headings.length ? headings.join(", ") : "Generated study notes";
  return `
    <article class="focus-material-card">
      <p class="focus-room-kicker">${escapeHTML(material?.materialType || "Study material")}</p>
      <h2 class="focus-material-title">${escapeHTML(material?.materialTitle || "Study material")}</h2>
      <p class="focus-material-meta">${escapeHTML(headingText)}</p>
    </article>
  `;
}

function renderSceneCards() {
  return FOCUS_ROOM_SCENES.map(scene => {
    const active = scene.id === state.selectedScene;
    return `
      <button
        class="focus-scene-card${active ? " active" : ""}"
        type="button"
        style="background-image: url(&quot;${escapeAttr(scene.image)}&quot;);"
        aria-pressed="${active ? "true" : "false"}"
        onclick="selectFocusScene(${jsStringAttr(scene.id)})"
      >
        <span class="focus-room-pill">${escapeHTML(scene.kicker)}</span>
        <strong class="focus-scene-name">${escapeHTML(scene.name)}</strong>
        <span class="focus-scene-description">${escapeHTML(scene.description)}</span>
      </button>
    `;
  }).join("");
}

function renderSoundControls() {
  return `
    <div class="focus-setup-form">
      <label>
        Music
        <select onchange="updateFocusSound('musicType', this.value)">
          ${["Deep Focus", "Lo-fi", "Piano", "Minimal"].map(label => `
            <option value="${escapeAttr(label)}"${label === state.musicType ? " selected" : ""}>${escapeHTML(label)}</option>
          `).join("")}
        </select>
      </label>
      <label>
        Music volume <span id="focusMusicVolumeValue">${state.musicVolume}%</span>
        <input type="range" min="0" max="100" value="${state.musicVolume}" oninput="updateFocusSound('musicVolume', this.value)" />
      </label>
      <label>
        Ambient sound
        <select onchange="updateFocusSound('ambientSound', this.value)">
          ${["Nature", "Rain", "White Noise", "Ocean", "Wind"].map(label => `
            <option value="${escapeAttr(label)}"${label === state.ambientSound ? " selected" : ""}>${escapeHTML(label)}</option>
          `).join("")}
        </select>
      </label>
      <label>
        Ambient volume <span id="focusAmbientVolumeValue">${state.ambientVolume}%</span>
        <input type="range" min="0" max="100" value="${state.ambientVolume}" oninput="updateFocusSound('ambientVolume', this.value)" />
      </label>
    </div>
  `;
}

function renderDurationControls() {
  return `
    <div class="focus-duration-grid">
      ${FOCUS_ROOM_DURATIONS.map(minutes => {
        const active = minutes === state.durationMinutes;
        return `
          <button
            class="focus-duration-btn${active ? " active" : ""}"
            type="button"
            aria-pressed="${active ? "true" : "false"}"
            onclick="setFocusDuration(${minutes})"
          >${minutes}m</button>
        `;
      }).join("")}
    </div>
    <div class="focus-setup-form">
      <label>
        Custom duration
        <input type="number" min="${MIN_DURATION_MINUTES}" max="${MAX_DURATION_MINUTES}" step="5" value="${state.durationMinutes}" onchange="setFocusDuration(this.value)" />
      </label>
    </div>
  `;
}

function renderStudyPlanList({ interactive = false } = {}) {
  if (!state.studyPlan.length) {
    return `<p class="focus-room-subtitle">A study plan will appear once material is available.</p>`;
  }

  return `
    <ul class="focus-plan-list">
      ${state.studyPlan.map((item, index) => {
        const task = String(item.task || "");
        const completed = state.completedTasks.includes(task);
        const inner = `
          <strong>${escapeHTML(item.minutes)}m</strong>
          <span>${escapeHTML(task)}</span>
        `;
        return `
          <li class="focus-plan-item">
            ${interactive ? `
              <button
                class="focus-control-btn${completed ? " active" : ""}"
                type="button"
                aria-pressed="${completed ? "true" : "false"}"
                onclick="toggleFocusTask(${index})"
              >${inner}</button>
            ` : inner}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function renderGoalEditor() {
  return `
    <div class="focus-setup-form">
      <label>
        Study goal
        <textarea oninput="updateFocusGoal(this.value)">${escapeHTML(state.studyGoal)}</textarea>
      </label>
    </div>
  `;
}

function renderNoMaterialState() {
  const setup = byId("focusRoomSetup");
  if (!setup) return;
  const scene = currentScene();
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
    <section class="focus-room-setup-layout">
      <article class="focus-room-panel">
        <h3>Waiting for material</h3>
        <p class="focus-room-subtitle">Return to the workspace, generate study notes, or choose a saved history item to start a Focus Room session.</p>
      </article>
      <article class="focus-room-panel">
        <h3>Saved sessions</h3>
        ${renderHistoryList({ compact: true })}
      </article>
    </section>
  `;
}

function renderFocusRoomSetup() {
  const setup = byId("focusRoomSetup");
  if (!setup) return;
  if (!state.material) {
    renderNoMaterialState();
    return;
  }

  const scene = currentScene();
  setup.innerHTML = `
    ${renderBackground(scene)}
    ${renderTopbar({
      kicker: "Synapse Focus Room",
      title: scene.name,
      subtitle: `Prepare a ${state.durationMinutes} minute focus block for ${state.material.materialTitle}.`,
      actions: `
        <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
        <button class="focus-room-ghost-btn" type="button" onclick="showFocusStudyHistory()">Study History</button>
      `
    })}
    <section class="focus-room-setup-layout">
      <div class="focus-room-panel">
        <h3>Material</h3>
        ${renderMaterialCard(state.material)}
        <div class="focus-control-row">
          <span class="focus-room-pill">${escapeHTML(state.musicType)}</span>
          <span class="focus-room-pill">${escapeHTML(state.ambientSound)}</span>
          <span class="focus-room-pill">${escapeHTML(state.durationMinutes)}m</span>
        </div>
        <h3>Scenes</h3>
        <div class="focus-scene-grid">${renderSceneCards()}</div>
      </div>
      <div class="focus-room-panel">
        <h3>Sound</h3>
        ${renderSoundControls()}
        <h3>Duration</h3>
        ${renderDurationControls()}
        <h3>Goal</h3>
        ${renderGoalEditor()}
        <h3>Study plan</h3>
        <div id="focusPlanPreview">${renderStudyPlanList()}</div>
        <div class="focus-session-controls">
          <button class="focus-room-primary-btn" type="button" onclick="startFocusRoomSession()">Enter Focus Room</button>
        </div>
      </div>
    </section>
  `;
}

function durationSeconds() {
  const minutes = clampDuration(state.durationMinutes);
  return minutes > 0 ? minutes * 60 : 0;
}

function progressPercent() {
  const total = durationSeconds();
  if (!total) return 0;
  return Math.min(100, Math.max(0, (state.elapsedSeconds / total) * 100));
}

function formatTimerClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const pad = value => String(value).padStart(2, "0");
  if (hours) return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

function timerActionLabel() {
  if (state.timerStatus === "paused") return "Resume";
  if (state.timerStatus === "completed") return "Restart";
  return "Start";
}

function renderFocusRoomSession() {
  const session = byId("focusRoomSession");
  if (!session) return;
  if (!state.material) {
    session.innerHTML = "";
    return;
  }

  const scene = currentScene();
  const total = durationSeconds();
  const remaining = total ? Math.max(0, total - state.elapsedSeconds) : 0;
  session.innerHTML = `
    ${renderBackground(scene)}
    <div class="focus-session-toolbar">
      <div class="focus-room-title-block">
        <p class="focus-room-kicker">${escapeHTML(scene.kicker)} / ${escapeHTML(state.timerStatus)}</p>
        <h1 class="focus-room-title">${escapeHTML(state.material.materialTitle)}</h1>
        <p class="focus-room-subtitle">${escapeHTML(state.studyGoal)}</p>
      </div>
      <div class="focus-control-row">
        <button class="focus-room-ghost-btn" type="button" onclick="toggleFocusLearningPanel()">AI Learning Panel</button>
        <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
        <button class="focus-session-end-btn" type="button" onclick="endFocusRoomSession()">End</button>
      </div>
    </div>
    <section class="focus-session-layout">
      <div class="focus-timer-card">
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
      </div>
      <div class="focus-session-panel">
        <h3>Study plan</h3>
        ${renderStudyPlanList({ interactive: true })}
        <h3>Sound</h3>
        ${renderSoundControls()}
      </div>
    </section>
  `;
  renderLearningPanel();
  renderFocusSessionSummary();
}

function renderLearningPanel() {
  const panel = byId("focusLearningPanel");
  if (!panel) return;
  const visible = state.route === "session" && state.panelOpen && !!state.material;
  setElementVisible(panel, visible);
  if (!visible) {
    panel.innerHTML = "";
    return;
  }

  panel.innerHTML = `
    <div class="focus-control-row">
      <h3>AI Learning Panel</h3>
      <button class="focus-icon-btn" type="button" aria-label="Close AI Learning Panel" onclick="toggleFocusLearningPanel()">x</button>
    </div>
    <div class="focus-tab-row" role="tablist">
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
    ${renderPanelContent()}
  `;
}

function renderPanelContent() {
  if (!state.material) return "";

  if (state.panelTab === "materials") {
    const materials = getFocusRoomMaterials();
    if (!materials.length) {
      return `<p class="focus-room-subtitle">No Focus Room materials are available yet. Return to the workspace and generate study notes first.</p>`;
    }
    return `
      <ul class="focus-plan-list">
        ${materials.map(material => `
          <li class="focus-plan-item">
            <button class="focus-control-btn" type="button" onclick="openSynapseFocusRoom(${jsStringAttr(material.materialId)})">
              <strong>${escapeHTML(material.materialTitle || "Study material")}</strong>
              <span>${escapeHTML(material.materialType || "Generated notes")}</span>
            </button>
          </li>
        `).join("")}
      </ul>
    `;
  }

  if (state.panelTab === "flashcards") {
    const cards = Array.isArray(state.material.flashcards) ? state.material.flashcards.slice(0, 5) : [];
    if (!cards.length) {
      return `<p class="focus-room-subtitle">No flashcards are attached to this material yet.</p>`;
    }
    return `
      <ul class="focus-plan-list">
        ${cards.map(card => `
          <li class="focus-plan-item">
            <strong>${escapeHTML(card.question || card.front || card.term || "Flashcard")}</strong>
            <span>${escapeHTML(card.answer || card.back || card.definition || "")}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  if (state.panelTab === "quiz") {
    const quizzes = Array.isArray(state.material.quizzes) ? state.material.quizzes.slice(0, 5) : [];
    if (!quizzes.length) {
      return `<p class="focus-room-subtitle">No quiz questions are attached to this material yet.</p>`;
    }
    return `
      <ul class="focus-plan-list">
        ${quizzes.map((quiz, index) => `
          <li class="focus-plan-item">
            <strong>Question ${index + 1}</strong>
            <span>${escapeHTML(quiz.question || quiz.prompt || quiz.title || "Practice question")}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  if (state.panelTab === "mindmap") {
    if (!state.material.mindMap) {
      return `<p class="focus-room-subtitle">No mind map is attached to this material yet. Return to the workspace and generate one from your notes.</p>`;
    }
    let mindMapJSON = "";
    try {
      mindMapJSON = JSON.stringify(state.material.mindMap, null, 2);
    } catch {
      mindMapJSON = String(state.material.mindMap);
    }
    return `
      <article class="focus-panel-card">
        <h3>Mind Map</h3>
        <pre class="focus-room-subtitle">${escapeHTML(mindMapJSON)}</pre>
      </article>
    `;
  }

  if (state.panelTab === "chat") {
    return `
      <article class="focus-panel-card">
        <h3>Assistant</h3>
        <p class="focus-room-subtitle">Return to the workspace to continue with the Synapse assistant for this material.</p>
        <div class="focus-session-controls">
          <button class="focus-room-primary-btn" type="button" onclick="returnFromFocusRoom(${jsStringAttr(state.materialId)})">Workspace Assistant</button>
        </div>
      </article>
    `;
  }

  if (state.panelTab === "plan") {
    return `
      <article class="focus-panel-card">
        <h3>Study Plan</h3>
        ${renderStudyPlanList({ interactive: true })}
      </article>
    `;
  }

  const summary = String(state.material.summaryText || state.material.aiSummary || "").slice(0, 700);
  return `
    <article class="focus-panel-card">
      <h3>Material summary</h3>
      <p class="focus-room-subtitle">${escapeHTML(summary || "Study notes will appear here when Synapse has generated them.")}</p>
    </article>
  `;
}

function renderFocusSessionSummary() {
  const summary = byId("focusSessionSummary");
  if (!summary) return;
  if (!state.summaryRecord) {
    summary.innerHTML = "";
    setElementVisible(summary, false);
    return;
  }

  const record = state.summaryRecord;
  summary.innerHTML = `
    <article class="focus-summary-card" role="dialog" aria-modal="true" aria-label="Focus session summary">
      <p class="focus-room-kicker">Session complete</p>
      <h2 class="focus-room-title">${escapeHTML(record.materialTitle)}</h2>
      <p class="focus-room-subtitle">${escapeHTML(record.aiReflection)}</p>
      <div class="focus-history-grid">
        <div class="focus-history-card">
          <h3>Focus time</h3>
          <p class="focus-timer-value">${escapeHTML(formatFocusRoomDuration(record.totalFocusTime))}</p>
        </div>
        <div class="focus-history-card">
          <h3>Completed tasks</h3>
          <p class="focus-timer-value">${escapeHTML(record.completedTasks.length)}</p>
        </div>
      </div>
      <p class="focus-room-subtitle">${escapeHTML(record.recommendedNextStep)}</p>
      <div class="focus-session-controls">
        <button class="focus-room-primary-btn" type="button" onclick="closeFocusSummary()">Stay</button>
        <button class="focus-room-ghost-btn" type="button" onclick="showFocusStudyHistory()">View History</button>
        <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
      </div>
    </article>
  `;
  setElementVisible(summary, true);
}

function renderHistoryList({ compact = false } = {}) {
  const sessions = readFocusRoomSessions();
  if (!sessions.length) {
    return `<p class="focus-room-subtitle">No Focus Room sessions saved yet.</p>`;
  }

  return `
    <ul class="focus-history-list">
      ${sessions.slice(0, compact ? 4 : 40).map(session => {
        const date = session.sessionDate || session.endedAt || session.startedAt || "";
        const readableDate = date ? new Date(date).toLocaleString() : "Saved session";
        return `
          <li class="focus-history-session">
            <strong>${escapeHTML(session.materialTitle || "Study material")}</strong>
            <span>${escapeHTML(readableDate)} / ${escapeHTML(formatFocusRoomDuration(session.totalFocusTime || 0))}</span>
            ${session.studyGoal ? `<span>${escapeHTML(session.studyGoal)}</span>` : ""}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function renderStudyHistory() {
  const history = byId("focusStudyHistory");
  if (!history) return;
  const scene = currentScene();
  history.innerHTML = `
    ${renderBackground(scene)}
    ${renderTopbar({
      kicker: "Synapse Focus Room",
      title: "Study History",
      subtitle: "Review recent Focus Room sessions saved on this device.",
      actions: `
        <button class="focus-room-back-btn" type="button" onclick="returnFromFocusRoom()">Workspace</button>
      `
    })}
    <section class="focus-history-grid">
      <article class="focus-history-card">
        <h3>Recent sessions</h3>
        ${renderHistoryList()}
      </article>
      <article class="focus-history-card">
        <h3>Next step</h3>
        <p class="focus-room-subtitle">Choose a material from the workspace to start another protected study block.</p>
      </article>
    </section>
  `;
}

function clearFocusTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function tickFocusTimer() {
  const total = durationSeconds();
  state.elapsedSeconds = total
    ? Math.min(total, state.elapsedSeconds + 1)
    : state.elapsedSeconds + 1;

  if (total && state.elapsedSeconds >= total) {
    clearFocusTimer();
    state.timerStatus = "completed";
  }

  renderFocusRoomSession();
}

function startFocusRoomSession() {
  if (!state.material) {
    renderFocusRoomSetup();
    return;
  }

  clearFocusTimer();
  state.route = "session";
  state.timerStatus = "idle";
  state.startedAt = null;
  state.elapsedSeconds = 0;
  state.summaryRecord = null;
  state.completedTasks = [];
  state.panelOpen = false;
  rebuildStudyPlan();
  persistDraft();
  setWorkspaceVisible(false);
  setFocusView("session");
  renderFocusRoomSession();
}

function startFocusRoomTimer() {
  if (state.route !== "session") {
    startFocusRoomSession();
  }
  if (!state.material) return;

  clearFocusTimer();
  if (state.timerStatus === "completed" || state.elapsedSeconds >= durationSeconds()) {
    state.elapsedSeconds = 0;
    state.completedTasks = [];
  }
  if (!state.startedAt || state.timerStatus === "completed") {
    state.startedAt = new Date().toISOString();
  }
  state.summaryRecord = null;
  state.timerStatus = "studying";
  state.timerId = setInterval(tickFocusTimer, 1000);
  renderFocusRoomSession();
}

function pauseFocusRoomTimer(options = {}) {
  const shouldRender = options.render !== false;
  clearFocusTimer();
  if (state.timerStatus === "studying") {
    state.timerStatus = "paused";
  }
  if (shouldRender && state.route === "session") {
    renderFocusRoomSession();
  }
}

function resetFocusRoomTimer() {
  clearFocusTimer();
  state.timerStatus = "idle";
  state.startedAt = null;
  state.elapsedSeconds = 0;
  state.summaryRecord = null;
  state.completedTasks = [];
  if (state.route === "session") {
    renderFocusRoomSession();
  }
}

function skipFocusRoomTimer() {
  clearFocusTimer();
  state.elapsedSeconds = durationSeconds();
  state.timerStatus = "completed";
  if (!state.startedAt) {
    state.startedAt = new Date().toISOString();
  }
  renderFocusRoomSession();
}

function endFocusRoomSession() {
  clearFocusTimer();
  const now = new Date().toISOString();
  const material = state.material || getFocusRoomMaterial(state.materialId);
  if (!material) return;

  const total = durationSeconds();
  const totalFocusTime = total ? Math.min(total, state.elapsedSeconds) : state.elapsedSeconds;
  const record = saveFocusRoomSession({
    materialId: material.materialId,
    materialTitle: material.materialTitle,
    studyGoal: state.studyGoal,
    selectedScene: state.selectedScene,
    musicType: state.musicType,
    ambientSound: state.ambientSound,
    musicVolume: state.musicVolume,
    ambientVolume: state.ambientVolume,
    pomodoroDuration: state.durationMinutes,
    startedAt: state.startedAt || now,
    endedAt: now,
    totalFocusTime,
    flashcardsCompleted: state.completedTasks.length,
    completedTasks: state.completedTasks,
    recommendedNextStep: "Return to your notes, review any unchecked tasks, then start another short focus block."
  });

  state.summaryRecord = record;
  state.timerStatus = "completed";
  state.elapsedSeconds = total ? Math.min(total, state.elapsedSeconds) : state.elapsedSeconds;
  renderFocusRoomSession();
}

function closeFocusSummary() {
  state.summaryRecord = null;
  renderFocusSessionSummary();
}

function returnFromFocusRoom(materialId = "") {
  pauseFocusRoomTimer({ render: false });
  closeFocusSummary();
  const returnMaterialId = String(materialId || state.materialId || state.material?.materialId || "");
  if (typeof globalThis.returnFromFocusRoomToWorkspace === "function") {
    try {
      const result = globalThis.returnFromFocusRoomToWorkspace(returnMaterialId);
      if (result && typeof result.catch === "function") {
        result.catch(error => {
          console.error("Could not return from Focus Room:", error);
          globalThis.location.hash = "";
        });
      }
      return;
    } catch (error) {
      console.error("Could not return from Focus Room:", error);
    }
  }
  globalThis.location.hash = "";
}

function selectFocusScene(sceneId) {
  const scene = sceneById(sceneId);
  if (!scene) return;
  state.selectedScene = scene.id;
  state.musicType = scene.musicType || state.musicType;
  state.ambientSound = scene.ambientSound || state.ambientSound;
  persistDraft();
  renderActiveRoute();
}

function setFocusDuration(value) {
  state.durationMinutes = clampDuration(value, state.durationMinutes);
  rebuildStudyPlan();
  persistDraft();
  renderActiveRoute();
}

function updateFocusGoal(value) {
  state.studyGoal = String(value ?? "");
  rebuildStudyPlan();
  persistDraft();
  const preview = byId("focusPlanPreview");
  if (preview && state.route === "setup") {
    preview.innerHTML = renderStudyPlanList();
  } else {
    renderActiveRoute();
  }
}

function updateFocusSound(key, value) {
  if (key === "musicVolume") {
    state.musicVolume = clampVolume(value, state.musicVolume);
    const label = byId("focusMusicVolumeValue");
    if (label) label.textContent = `${state.musicVolume}%`;
  } else if (key === "ambientVolume") {
    state.ambientVolume = clampVolume(value, state.ambientVolume);
    const label = byId("focusAmbientVolumeValue");
    if (label) label.textContent = `${state.ambientVolume}%`;
  } else if (key === "musicType") {
    state.musicType = String(value || state.musicType);
    renderActiveRoute();
  } else if (key === "ambientSound") {
    state.ambientSound = String(value || state.ambientSound);
    renderActiveRoute();
  }
  persistDraft();
}

function setFocusPanelTab(tab) {
  const nextTab = String(tab || "summary");
  state.panelTab = PANEL_TABS.has(nextTab) ? nextTab : "summary";
  state.panelOpen = true;
  renderLearningPanel();
}

function toggleFocusLearningPanel() {
  state.panelOpen = !state.panelOpen;
  renderLearningPanel();
}

function toggleFocusTask(index) {
  const planItem = state.studyPlan[Number(index)];
  if (!planItem) return;
  const task = String(planItem.task || "");
  if (state.completedTasks.includes(task)) {
    state.completedTasks = state.completedTasks.filter(item => item !== task);
  } else {
    state.completedTasks = [...state.completedTasks, task];
  }
  renderFocusRoomSession();
}

function showFocusStudyHistory() {
  globalThis.location.hash = "#/study-history";
}

function renderActiveRoute() {
  if (state.route === "setup") {
    renderFocusRoomSetup();
  } else if (state.route === "session") {
    renderFocusRoomSession();
  } else if (state.route === "history") {
    renderStudyHistory();
  }
}

function routeFocusRoom(route, options = {}) {
  const materials = getFocusRoomMaterials();
  const material = route.materialId
    ? getFocusRoomMaterial(route.materialId)
    : getFocusRoomMaterial("");
  const hasMaterial = !!material && (materials.length > 0 || !!material.aiSummary);
  const previousMaterialId = state.materialId;

  state.route = "setup";
  state.material = hasMaterial ? material : null;
  state.materialId = hasMaterial ? material.materialId : String(route.materialId || "");
  state.summaryRecord = null;

  if (!hasMaterial) {
    state.studyPlan = [];
    setWorkspaceVisible(false);
    setFocusView("setup");
    renderFocusRoomSetup();
    return;
  }

  if (previousMaterialId !== state.materialId || !options.preserveSession) {
    hydrateDraft(material);
  } else {
    rebuildStudyPlan();
  }

  if (options.preserveSession && previousMaterialId === state.materialId && state.timerStatus !== "idle") {
    state.route = "session";
    setWorkspaceVisible(false);
    setFocusView("session");
    renderFocusRoomSession();
    return;
  }

  state.panelOpen = false;
  setWorkspaceVisible(false);
  setFocusView("setup");
  renderFocusRoomSetup();
}

function routeStudyHistory() {
  state.route = "history";
  state.summaryRecord = null;
  setWorkspaceVisible(false);
  setFocusView("history");
  renderStudyHistory();
}

function routeWorkspace() {
  pauseFocusRoomTimer({ render: false });
  state.route = "workspace";
  state.summaryRecord = null;
  state.panelOpen = false;
  setWorkspaceVisible(true);
  renderLearningPanel();
  renderFocusSessionSummary();
}

function handleRouteChange(options = {}) {
  const route = parseRoute();
  if (!options.preserveTimer) {
    pauseFocusRoomTimer({ render: false });
  }

  if (route.name === "focus") {
    routeFocusRoom(route, { preserveSession: !!options.preserveSession });
  } else if (route.name === "history") {
    routeStudyHistory();
  } else {
    routeWorkspace();
  }
}

function exposeFocusRoomGlobals() {
  Object.assign(globalThis, {
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
}

function initFocusRoom() {
  if (globalThis.__synapseFocusRoomControllerReady) return;
  globalThis.__synapseFocusRoomControllerReady = true;
  exposeFocusRoomGlobals();
  globalThis.addEventListener("hashchange", () => handleRouteChange());
  globalThis.addEventListener("synapse-focus-room-materials-updated", () => {
    const route = parseRoute();
    if (route.name !== "workspace") {
      handleRouteChange({ preserveSession: true, preserveTimer: true });
    }
  });
  handleRouteChange({ preserveTimer: true });
}

export { initFocusRoom };
