import {
  FOCUS_ROOM_AMBIENT_SOUNDS,
  FOCUS_ROOM_DURATIONS,
  FOCUS_ROOM_MUSIC_TRACKS,
  FOCUS_ROOM_SCENES,
  buildFocusRoomStudyPlan,
  formatFocusRoomDuration,
  getFocusRoomAudioProfile,
  getFocusRoomMaterial,
  getFocusRoomMaterials,
  readFocusRoomDraft,
  readFocusRoomSessions,
  saveFocusRoomSession,
  writeFocusRoomDraft
} from "./data.js";
import {
  getFocusRoomAudioState,
  setFocusRoomAudioPlaying,
  stopFocusRoomAudio,
  syncFocusRoomAudio,
  toggleFocusRoomAudio
} from "./audio.js";

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
  completedTasks: [],
  flashcardIndex: 0,
  flashcardSide: "front",
  flashcardProgress: {},
  quizAnswers: {},
  quizChecked: {},
  chatMessages: [],
  chatPending: false,
  chatError: ""
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

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeStudyPlanItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => ({
      minutes: clampInteger(item?.minutes, 5, 1, MAX_DURATION_MINUTES),
      task: String(item?.task || "").trim()
    }))
    .filter(item => item.task);
}

function normalizeChatMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map(message => ({
      role: String(message?.role || "assistant"),
      text: String(message?.text || "").trim(),
      createdAt: message?.createdAt || new Date().toISOString()
    }))
    .filter(message => message.text)
    .slice(-24);
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
  const draftPlan = normalizeStudyPlanItems(draft?.studyPlan);
  if (draftPlan.length) {
    state.studyPlan = draftPlan;
  } else {
    rebuildStudyPlan();
  }
  resetFocusSessionProgress();
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
    studyPlan: normalizeStudyPlanItems(state.studyPlan),
    updatedAt: new Date().toISOString()
  };
  writeFocusRoomDraft(root);
}

function focusAudioConfig() {
  return {
    musicType: state.musicType,
    ambientSound: state.ambientSound,
    musicVolume: state.musicVolume,
    ambientVolume: state.ambientVolume
  };
}

function syncCurrentFocusAudio() {
  void syncFocusRoomAudio(focusAudioConfig());
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

function resetFocusSessionProgress({ resetChat = true } = {}) {
  state.completedTasks = [];
  state.flashcardIndex = 0;
  state.flashcardSide = "front";
  state.flashcardProgress = {};
  state.quizAnswers = {};
  state.quizChecked = {};
  if (resetChat) {
    state.chatMessages = [];
    state.chatPending = false;
    state.chatError = "";
  }
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

function renderAudioSourceLinks(profile) {
  const sources = [
    profile.musicTrack,
    ...profile.ambientLayers
  ].filter(source => source?.pageUrl);
  return sources.map(source => `
    <a href="${escapeAttr(source.pageUrl)}" target="_blank" rel="noreferrer">
      ${escapeHTML(source.title || source.label || "Audio source")}
    </a>
  `).join("");
}

function renderAudioNowPlaying(profile) {
  const audioState = getFocusRoomAudioState(profile);
  const ambientTitle = profile.ambientLayers.map(layer => layer.title).filter(Boolean).join(" + ");
  return `
    <div class="focus-audio-card">
      <div>
        <span class="focus-room-kicker">Theme audio</span>
        <strong>${escapeHTML(profile.musicTrack.title)}</strong>
        <span>${escapeHTML(ambientTitle)}</span>
      </div>
      <button
        class="focus-control-btn${audioState.playing ? " active" : ""}"
        type="button"
        aria-pressed="${audioState.playing ? "true" : "false"}"
        onclick="toggleFocusRoomAudioPlayback()"
      >${audioState.playing ? "Pause audio" : "Play audio"}</button>
      <div class="focus-audio-links">${renderAudioSourceLinks(profile)}</div>
      ${audioState.error ? `<p class="focus-audio-error">${escapeHTML(audioState.error)}</p>` : ""}
    </div>
  `;
}

function renderSoundControls() {
  const profile = getFocusRoomAudioProfile(focusAudioConfig());
  return `
    <div class="focus-setup-form">
      <label>
        Music
        <select onchange="updateFocusSound('musicType', this.value)">
          ${FOCUS_ROOM_MUSIC_TRACKS.map(track => `
            <option value="${escapeAttr(track.label)}"${track.label === state.musicType ? " selected" : ""}>${escapeHTML(track.label)}</option>
          `).join("")}
        </select>
      </label>
      <label>
        Music volume <span data-focus-volume-label="musicVolume">${state.musicVolume}%</span>
        <input type="range" min="0" max="100" value="${state.musicVolume}" oninput="updateFocusSound('musicVolume', this.value)" />
      </label>
      <label>
        Ambient sound
        <select onchange="updateFocusSound('ambientSound', this.value)">
          ${FOCUS_ROOM_AMBIENT_SOUNDS.map(sound => `
            <option value="${escapeAttr(sound.label)}"${sound.label === state.ambientSound ? " selected" : ""}>${escapeHTML(sound.label)}</option>
          `).join("")}
        </select>
      </label>
      <label>
        Ambient volume <span data-focus-volume-label="ambientVolume">${state.ambientVolume}%</span>
        <input type="range" min="0" max="100" value="${state.ambientVolume}" oninput="updateFocusSound('ambientVolume', this.value)" />
      </label>
      ${renderAudioNowPlaying(profile)}
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

function renderStudyPlanEditor() {
  if (!state.studyPlan.length) {
    return `<p class="focus-room-subtitle">A study plan will appear once material is available.</p>`;
  }

  return `
    <div class="focus-plan-editor">
      ${state.studyPlan.map((item, index) => `
        <article class="focus-plan-edit-item">
          <label>
            Minutes
            <input type="number" min="1" max="${MAX_DURATION_MINUTES}" value="${escapeAttr(item.minutes)}" onchange="updateFocusPlanTask(${index}, this.value, null)" />
          </label>
          <label>
            Task
            <textarea oninput="updateFocusPlanTask(${index}, null, this.value, false)" onchange="updateFocusPlanTask(${index}, null, this.value)">${escapeHTML(item.task)}</textarea>
          </label>
          <button class="focus-control-btn${state.completedTasks.includes(item.task) ? " active" : ""}" type="button" onclick="toggleFocusTask(${index})">
            ${state.completedTasks.includes(item.task) ? "Completed" : "Mark complete"}
          </button>
        </article>
      `).join("")}
    </div>
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
  stopFocusRoomAudio();
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
  syncCurrentFocusAudio();
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
  `;
  syncCurrentFocusAudio();
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

function renderFocusRoomSession() {
  const session = byId("focusRoomSession");
  if (!session) return;
  if (!state.material) {
    session.innerHTML = "";
    stopFocusRoomAudio();
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
  syncCurrentFocusAudio();
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

function focusRoomWorkspaceButton(label, action = "") {
  const materialId = state.materialId || state.material?.materialId || "";
  const actionArg = action ? `, ${jsStringAttr(action)}` : "";
  return `
    <div class="focus-session-controls">
      <button class="focus-room-primary-btn" type="button" onclick="returnFromFocusRoom(${jsStringAttr(materialId)}${actionArg})">${escapeHTML(label)}</button>
    </div>
  `;
}

function flashcardPrompt(card, index) {
  return card?.prompt || card?.front || card?.question || card?.term || `Flashcard ${index + 1}`;
}

function flashcardAnswer(card) {
  return card?.answer || card?.back || card?.definition || card?.explanation || "Return to the workspace for the saved answer.";
}

function focusFlashcards() {
  const flashcardSource = state.material?.flashcards || [];
  return Array.isArray(flashcardSource) ? flashcardSource.slice(0, 24) : [];
}

function flashcardKey(card, index) {
  return String(card?.id || card?.front || card?.term || index);
}

function focusFlashcardsCompletedCount() {
  return Object.values(plainObject(state.flashcardProgress))
    .filter(item => item && item.difficulty)
    .length;
}

function renderFlashcardStudyMode(cards) {
  const total = cards.length;
  const index = clampInteger(state.flashcardIndex, 0, 0, Math.max(0, total - 1));
  state.flashcardIndex = index;
  const card = cards[index];
  const key = flashcardKey(card, index);
  const progress = state.flashcardProgress[key] || {};
  const side = state.flashcardSide === "back" ? "back" : "front";
  const sideText = side === "back" ? flashcardAnswer(card) : flashcardPrompt(card, index);

  return `
    <article class="focus-panel-card focus-study-card">
      <span class="focus-room-kicker">Card ${index + 1} of ${total}</span>
      <h3>${escapeHTML(side === "back" ? "Answer" : "Prompt")}</h3>
      <p class="focus-room-subtitle">${escapeHTML(sideText)}</p>
      ${progress.difficulty ? `<p class="focus-room-pill">Marked ${escapeHTML(progress.difficulty)}</p>` : ""}
      <div class="focus-session-controls">
        <button class="focus-control-btn" type="button" onclick="setFocusFlashcardIndex(${index - 1})" ${index <= 0 ? "disabled" : ""}>Previous</button>
        <button class="focus-control-btn" type="button" onclick="flipFocusFlashcard()">${side === "back" ? "Show Prompt" : "Reveal Answer"}</button>
        <button class="focus-control-btn" type="button" onclick="setFocusFlashcardIndex(${index + 1})" ${index >= total - 1 ? "disabled" : ""}>Next</button>
      </div>
      <div class="focus-session-controls">
        ${["easy", "medium", "hard"].map(difficulty => `
          <button class="focus-control-btn${progress.difficulty === difficulty ? " active" : ""}" type="button" onclick="rateFocusFlashcard(${jsStringAttr(difficulty)})">
            Mark ${escapeHTML(difficulty.replace(/^\w/, letter => letter.toUpperCase()))}
          </button>
        `).join("")}
      </div>
      <p class="focus-room-subtitle">${focusFlashcardsCompletedCount()} completed in this material.</p>
    </article>
  `;
}

function quizQuestionList(quiz) {
  if (Array.isArray(quiz?.questions)) return quiz.questions;
  if (Array.isArray(quiz?.quiz?.questions)) return quiz.quiz.questions;
  return [];
}

function focusQuizQuestions() {
  const quizzes = Array.isArray(state.material?.quizzes) ? state.material.quizzes : [];
  return quizzes.flatMap(quiz => quizQuestionList(quiz).map(question => ({
    ...question,
    quizTitle: quiz?.title || quiz?.quiz?.title || "Saved quiz"
  }))).slice(0, 12);
}

function questionText(question, index) {
  return question?.question || question?.prompt || question?.stem || `Question ${index + 1}`;
}

function questionType(question) {
  return String(question?.type || "").toLowerCase();
}

function optionText(option) {
  return String(option?.label || option?.text || option).trim();
}

function questionChoices(question) {
  const choices = question?.choices || question?.options || question?.answers;
  if (Array.isArray(choices) && choices.length) {
    return choices.map(optionText).filter(Boolean);
  }
  if (questionType(question) === "true_false") {
    return ["True", "False"];
  }
  return [];
}

function correctOptionIndexes(question) {
  const indexes = question?.correctOptionIndexes || question?.correct_option_indexes || question?.correctIndexes;
  return Array.isArray(indexes)
    ? indexes.map(index => Number(index)).filter(Number.isInteger)
    : [];
}

function arraysEqualNumbers(left, right) {
  const a = Array.isArray(left) ? [...left].map(Number).filter(Number.isInteger).sort((x, y) => x - y) : [];
  const b = Array.isArray(right) ? [...right].map(Number).filter(Number.isInteger).sort((x, y) => x - y) : [];
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function optionIndexForAnswer(question, value) {
  if (Number.isInteger(value)) return value;
  const number = Number(value);
  if (typeof value !== "string" && Number.isInteger(number)) return number;
  const choices = questionChoices(question);
  const normalized = normalizeAnswer(value);
  return choices.findIndex(choice => normalizeAnswer(choice) === normalized);
}

function booleanAnswerForQuestion(question, value) {
  if (typeof value === "boolean") return value;
  if (value === 0) return true;
  if (value === 1) return false;
  const choices = questionChoices(question);
  const normalized = normalizeAnswer(value);
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  if (normalizeAnswer(choices[0]) === normalized) return true;
  if (normalizeAnswer(choices[1]) === normalized) return false;
  return null;
}

function coerceQuizAnswer(question, value, currentAnswer) {
  const type = questionType(question);
  if (type === "multiple_choice") {
    const index = optionIndexForAnswer(question, value);
    if (!Number.isInteger(index) || index < 0) return [];
    const current = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    if (current.includes(index)) {
      return current.filter(item => item !== index);
    }
    return [...current, index].sort((a, b) => a - b);
  }
  if (type === "single_choice") {
    const index = optionIndexForAnswer(question, value);
    return Number.isInteger(index) && index >= 0 ? index : "";
  }
  if (type === "true_false") {
    const answer = booleanAnswerForQuestion(question, value);
    return answer === null ? "" : answer;
  }
  return String(value || "");
}

function correctAnswerText(question) {
  const answer = question?.correctAnswer ?? question?.correct_answer ?? question?.answer ?? question?.correct;
  const indexes = correctOptionIndexes(question);
  if (indexes.length) {
    const choices = questionChoices(question);
    return indexes.map(index => choices[index] || "").filter(Boolean).join(", ");
  }
  if (typeof question?.correctBoolean === "boolean" || typeof question?.correct_boolean === "boolean") {
    const choices = questionChoices(question);
    const correct = typeof question.correctBoolean === "boolean" ? question.correctBoolean : question.correct_boolean;
    return correct ? (choices[0] || "True") : (choices[1] || "False");
  }
  if (question?.expectedAnswer || question?.expected_answer) {
    return String(question.expectedAnswer || question.expected_answer || "").trim();
  }
  if (Array.isArray(answer)) return answer.map(item => String(item)).join(", ");
  return String(answer || "").trim();
}

function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isQuizAnswerCorrect(question, answer) {
  const type = questionType(question);
  if (type === "single_choice") {
    const correct = correctOptionIndexes(question)[0];
    const selected = optionIndexForAnswer(question, answer);
    return Number.isInteger(correct) ? selected === correct : null;
  }
  if (type === "multiple_choice") {
    const correct = correctOptionIndexes(question);
    const selected = Array.isArray(answer)
      ? answer
      : [optionIndexForAnswer(question, answer)].filter(Number.isInteger);
    return correct.length ? arraysEqualNumbers(selected, correct) : null;
  }
  if (type === "true_false") {
    const correct = typeof question?.correctBoolean === "boolean" ? question.correctBoolean : question?.correct_boolean;
    const selected = booleanAnswerForQuestion(question, answer);
    return typeof correct === "boolean" && selected !== null ? selected === correct : null;
  }
  const correct = correctAnswerText(question);
  if (!correct) return null;
  return normalizeAnswer(answer) === normalizeAnswer(correct);
}

function isFocusQuizAnswerPresent(question, answer) {
  const type = questionType(question);
  if (type === "multiple_choice") return Array.isArray(answer) && answer.length > 0;
  if (type === "single_choice") return Number.isInteger(answer);
  if (type === "true_false") return typeof answer === "boolean";
  return String(answer || "").trim().length > 0;
}

function quizAnswerMatchesChoice(question, answer, choiceIndex) {
  const type = questionType(question);
  if (type === "multiple_choice") return Array.isArray(answer) && answer.includes(choiceIndex);
  if (type === "single_choice") return answer === choiceIndex;
  if (type === "true_false") return answer === (choiceIndex === 0);
  return normalizeAnswer(answer) === normalizeAnswer(questionChoices(question)[choiceIndex]);
}

function focusQuizScore() {
  const checked = Object.values(plainObject(state.quizChecked)).filter(item => item && item.hasKnownAnswer);
  if (!checked.length) return null;
  const correct = checked.filter(item => item.correct).length;
  return Math.round((correct / checked.length) * 100);
}

function focusQuizMistakes() {
  const questions = focusQuizQuestions();
  return Object.entries(plainObject(state.quizChecked))
    .filter(([, result]) => result && result.hasKnownAnswer && !result.correct)
    .map(([index]) => questionText(questions[Number(index)], Number(index)))
    .filter(Boolean);
}

function renderFocusQuizMode(questions) {
  const score = focusQuizScore();
  return `
    <div class="focus-quiz-stack">
      ${score === null ? "" : `<p class="focus-room-pill">Current score ${score}%</p>`}
      ${questions.map((question, index) => {
        const answer = state.quizAnswers[index];
        const checked = state.quizChecked[index] || null;
        const choices = questionChoices(question);
        const textAnswer = typeof answer === "string" ? answer : "";
        const hasAnswer = isFocusQuizAnswerPresent(question, answer);
        return `
          <article class="focus-panel-card">
            <span class="focus-room-kicker">${escapeHTML(question.quizTitle || "Quiz")} / Question ${index + 1}</span>
            <h3>${escapeHTML(questionText(question, index))}</h3>
            ${choices.length ? `
              <div class="focus-session-controls">
                ${choices.map((choice, choiceIndex) => `
                  <button class="focus-control-btn${quizAnswerMatchesChoice(question, answer, choiceIndex) ? " active" : ""}" type="button" onclick="answerFocusQuizQuestion(${index}, ${choiceIndex})">
                    ${escapeHTML(choice)}
                  </button>
                `).join("")}
              </div>
            ` : `
              <textarea class="focus-answer-input" oninput="answerFocusQuizQuestion(${index}, this.value, false)">${escapeHTML(textAnswer)}</textarea>
            `}
            <div class="focus-session-controls">
              <button class="focus-room-primary-btn" type="button" onclick="checkFocusQuizQuestion(${index})" ${hasAnswer ? "" : "disabled"}>Check answer</button>
            </div>
            ${checked ? `
              <p class="focus-room-subtitle">
                ${checked.hasKnownAnswer ? (checked.correct ? "Correct" : "Review this one") : "Answer saved for review"}
                ${checked.explanation ? ` - ${escapeHTML(checked.explanation)}` : ""}
              </p>
            ` : ""}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function focusAssistantReply(question) {
  const prompt = String(question || "").trim();
  const summary = String(state.material?.summaryText || state.material?.aiSummary || "").slice(0, 420);
  const heading = state.material?.studyHeadings?.[0] || state.material?.materialTitle || "this material";
  const goal = state.studyGoal || `Study ${state.material?.materialTitle || "this material"}`;
  if (!prompt) return "";
  return [
    `For ${heading}: ${summary || "use the selected material as your main source."}`,
    `Your current goal is: ${goal}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ");
}

function focusAssistantChatHistory() {
  return normalizeChatMessages(state.chatMessages)
    .slice(-10)
    .map(message => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.text
    }));
}

async function requestFocusAssistantAnswer(question, chatHistory) {
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch !== "function") {
    return {
      answer: focusAssistantReply(question),
      offline: true
    };
  }

  const material = state.material || {};
  const response = await globalThis.apiClient.fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      selected_section: material.studyHeadings?.[0] || "",
      preferred_language: globalThis.preferredLanguage?.value || "auto",
      title: material.materialTitle || "Study material",
      summary: material.aiSummary || material.summaryText || "",
      sections: plainObject(material.sections),
      source_identity: material.materialId || state.materialId || "",
      source_fingerprint: material.sourceFingerprint || "",
      chat_history: chatHistory
    })
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    throw new Error("Backend returned non-JSON response.");
  }

  if (!response.ok || data?.error) {
    throw new Error(data?.error || "AI request failed.");
  }

  return {
    answer: data?.answer || "No answer returned.",
    usedExternalResearch: Boolean(data?.used_external_research),
    researchSources: Array.isArray(data?.research_sources) ? data.research_sources : []
  };
}

function renderFocusChatPanel() {
  return `
    <article class="focus-panel-card">
      <h3>AI Study Assistant</h3>
      <p class="focus-room-subtitle">Ask about the selected material and current study goal.</p>
      <div class="focus-chat-list">
        ${state.chatMessages.length ? state.chatMessages.map(message => `
          <div class="focus-chat-message ${message.role === "user" ? "user" : "assistant"}">
            <span class="focus-room-kicker">${message.role === "user" ? "You" : "Synapse"}</span>
            <p>${escapeHTML(message.text)}</p>
          </div>
        `).join("") : `<p class="focus-room-subtitle">Try: Explain this topic more simply.</p>`}
        ${state.chatPending ? `
          <div class="focus-chat-message assistant">
            <span class="focus-room-kicker">Synapse</span>
            <p>Thinking...</p>
          </div>
        ` : ""}
      </div>
      ${state.chatError ? `<p class="focus-room-subtitle">${escapeHTML(state.chatError)}</p>` : ""}
      <textarea id="focusChatInput" class="focus-answer-input" placeholder="Ask about this material..."></textarea>
      <div class="focus-session-controls">
        <button class="focus-room-primary-btn" type="button" onclick="askFocusAssistant(document.getElementById('focusChatInput')?.value || '')" ${state.chatPending ? "disabled" : ""}>Ask</button>
        <button class="focus-control-btn" type="button" onclick="askFocusAssistant('Test me on this material.')" ${state.chatPending ? "disabled" : ""}>Test me</button>
      </div>
    </article>
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
            <button class="focus-control-btn" type="button" onclick="openFocusRoomMaterial(${jsStringAttr(material.materialId)})">
              <strong>${escapeHTML(material.materialTitle || "Study material")}</strong>
              <span>${escapeHTML(material.materialType || "Generated notes")}</span>
            </button>
          </li>
        `).join("")}
      </ul>
    `;
  }

  if (state.panelTab === "flashcards") {
    const cards = focusFlashcards();
    if (!cards.length) {
      return `
        <article class="focus-panel-card">
          <h3>Flashcards</h3>
          <p class="focus-room-subtitle">No flashcards are attached to this material yet. Return to the Synapse workspace to generate a flashcard deck from these notes, then reopen the Focus Room.</p>
          ${focusRoomWorkspaceButton("Open Flashcard Generator", "flashcards")}
        </article>
      `;
    }
    return `
      ${renderFlashcardStudyMode(cards)}
      ${focusRoomWorkspaceButton("Open Flashcard Workspace", "flashcards")}
    `;
  }

  if (state.panelTab === "quiz") {
    const questions = focusQuizQuestions();
    if (!questions.length) {
      return `
        <article class="focus-panel-card">
          <h3>Quiz</h3>
          <p class="focus-room-subtitle">No saved quizzes are attached to this material yet. Return to the Synapse workspace to generate a quiz from these notes, then reopen the Focus Room.</p>
          ${focusRoomWorkspaceButton("Open Quiz Generator", "quiz")}
        </article>
      `;
    }
    return `
      ${renderFocusQuizMode(questions)}
      ${focusRoomWorkspaceButton("Open Quiz Workspace", "quiz")}
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
        ${focusRoomWorkspaceButton("Open Mind Map Workspace", "mindmap")}
      </article>
    `;
  }

  if (state.panelTab === "chat") {
    return `
      ${renderFocusChatPanel()}
      ${focusRoomWorkspaceButton("Open Workspace Assistant", "assistant")}
    `;
  }

  if (state.panelTab === "plan") {
    return `
      <article class="focus-panel-card">
        <h3>Study Plan</h3>
        ${renderStudyPlanEditor()}
        ${focusRoomWorkspaceButton("Open Timeline Workspace", "timeline")}
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
          <h3>Flashcards</h3>
          <p class="focus-timer-value">${escapeHTML(record.flashcardsCompleted)}</p>
        </div>
        <div class="focus-history-card">
          <h3>Quiz score</h3>
          <p class="focus-timer-value">${record.quizScore === null ? "N/A" : `${escapeHTML(record.quizScore)}%`}</p>
        </div>
        <div class="focus-history-card">
          <h3>Completed tasks</h3>
          <p class="focus-timer-value">${escapeHTML(record.completedTasks.length)}</p>
        </div>
      </div>
      ${record.mistakesMade.length ? `<p class="focus-room-subtitle">Review: ${escapeHTML(record.mistakesMade.join("; "))}</p>` : ""}
      ${record.persisted === false ? `<p class="focus-room-subtitle">This session is visible for now, but could not be saved to this device history.</p>` : ""}
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
            ${session.persisted === false ? `<span>Not saved to device history</span>` : ""}
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
  if (state.route !== "session" || !state.material) {
    clearFocusTimer();
    return;
  }

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

  setFocusRoomAudioPlaying(true);
  clearFocusTimer();
  state.route = "session";
  state.timerStatus = "idle";
  state.startedAt = null;
  state.elapsedSeconds = 0;
  state.summaryRecord = null;
  state.panelOpen = false;
  resetFocusSessionProgress();
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

  setFocusRoomAudioPlaying(true);
  clearFocusTimer();
  if (state.timerStatus === "completed" || state.elapsedSeconds >= durationSeconds()) {
    state.elapsedSeconds = 0;
    resetFocusSessionProgress();
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
  if (options.pauseAudio !== false) {
    setFocusRoomAudioPlaying(false);
    syncCurrentFocusAudio();
  }
  if (state.timerStatus === "studying") {
    state.timerStatus = "paused";
  }
  if (shouldRender && state.route === "session") {
    renderFocusRoomSession();
  }
}

function resetFocusRoomTimer() {
  clearFocusTimer();
  setFocusRoomAudioPlaying(false);
  state.timerStatus = "idle";
  state.startedAt = null;
  state.elapsedSeconds = 0;
  state.summaryRecord = null;
  resetFocusSessionProgress();
  if (state.route === "session") {
    renderFocusRoomSession();
  }
}

function skipFocusRoomTimer() {
  clearFocusTimer();
  setFocusRoomAudioPlaying(false);
  state.elapsedSeconds = durationSeconds();
  state.timerStatus = "completed";
  if (!state.startedAt) {
    state.startedAt = new Date().toISOString();
  }
  renderFocusRoomSession();
}

function endFocusRoomSession() {
  clearFocusTimer();
  setFocusRoomAudioPlaying(false);
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
    flashcardsCompleted: focusFlashcardsCompletedCount(),
    quizScore: focusQuizScore(),
    mistakesMade: focusQuizMistakes(),
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

function normalizeWorkspaceAction(action) {
  const value = String(action || "").trim().toLowerCase();
  if (["flashcards", "quiz", "assistant", "mindmap", "timeline"].includes(value)) {
    return value;
  }
  return "";
}

function runFocusWorkspaceAction(action) {
  const nextAction = normalizeWorkspaceAction(action);
  if (!nextAction) return;

  const run = () => {
    if (nextAction === "assistant") {
      if (typeof globalThis.openAssistant === "function") {
        globalThis.openAssistant();
      }
      return;
    }

    if (typeof globalThis.switchTool === "function") {
      globalThis.switchTool(nextAction);
    }
  };

  if (typeof globalThis.requestAnimationFrame === "function") {
    globalThis.requestAnimationFrame(run);
  } else {
    setTimeout(run, 0);
  }
}

async function returnFromFocusRoom(materialId = "", action = "") {
  pauseFocusRoomTimer({ render: false });
  closeFocusSummary();
  const returnMaterialId = String(materialId || state.materialId || state.material?.materialId || "");
  if (typeof globalThis.returnFromFocusRoomToWorkspace === "function") {
    try {
      const result = globalThis.returnFromFocusRoomToWorkspace(returnMaterialId);
      if (result && typeof result.then === "function") {
        await result;
      }
      routeWorkspace();
      runFocusWorkspaceAction(action);
      return;
    } catch (error) {
      console.error("Could not return from Focus Room:", error);
    }
  }
  globalThis.location.hash = "";
  routeWorkspace();
  runFocusWorkspaceAction(action);
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
    document.querySelectorAll('[data-focus-volume-label="musicVolume"]').forEach(label => {
      label.textContent = `${state.musicVolume}%`;
    });
    syncCurrentFocusAudio();
  } else if (key === "ambientVolume") {
    state.ambientVolume = clampVolume(value, state.ambientVolume);
    document.querySelectorAll('[data-focus-volume-label="ambientVolume"]').forEach(label => {
      label.textContent = `${state.ambientVolume}%`;
    });
    syncCurrentFocusAudio();
  } else if (key === "musicType") {
    state.musicType = String(value || state.musicType);
    renderActiveRoute();
  } else if (key === "ambientSound") {
    state.ambientSound = String(value || state.ambientSound);
    renderActiveRoute();
  }
  persistDraft();
}

async function toggleFocusRoomAudioPlayback() {
  await toggleFocusRoomAudio(focusAudioConfig());
  renderActiveRoute();
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

function setFocusFlashcardIndex(index) {
  const cards = focusFlashcards();
  state.flashcardIndex = clampInteger(index, state.flashcardIndex, 0, Math.max(0, cards.length - 1));
  state.flashcardSide = "front";
  persistDraft();
  renderLearningPanel();
}

function flipFocusFlashcard() {
  state.flashcardSide = state.flashcardSide === "back" ? "front" : "back";
  persistDraft();
  renderLearningPanel();
}

function rateFocusFlashcard(difficulty) {
  const cards = focusFlashcards();
  if (!cards.length) return;
  const index = clampInteger(state.flashcardIndex, 0, 0, cards.length - 1);
  const card = cards[index];
  const value = ["easy", "medium", "hard"].includes(String(difficulty)) ? String(difficulty) : "medium";
  state.flashcardProgress = {
    ...state.flashcardProgress,
    [flashcardKey(card, index)]: {
      difficulty: value,
      reviewedAt: new Date().toISOString()
    }
  };
  state.flashcardSide = "front";
  if (index < cards.length - 1) {
    state.flashcardIndex = index + 1;
  }
  persistDraft();
  renderLearningPanel();
}

function answerFocusQuizQuestion(index, value, shouldRender = true) {
  const questionIndex = Number(index);
  const question = focusQuizQuestions()[questionIndex];
  if (!question) return;
  const key = String(questionIndex);
  state.quizAnswers = {
    ...state.quizAnswers,
    [key]: coerceQuizAnswer(question, value, state.quizAnswers[key])
  };
  persistDraft();
  if (shouldRender) {
    renderLearningPanel();
  }
}

function checkFocusQuizQuestion(index) {
  const questions = focusQuizQuestions();
  const questionIndex = Number(index);
  const question = questions[questionIndex];
  if (!question) return;
  const key = String(questionIndex);
  const answer = Object.prototype.hasOwnProperty.call(state.quizAnswers, key) ? state.quizAnswers[key] : "";
  const correct = isQuizAnswerCorrect(question, answer);
  const correctAnswer = correctAnswerText(question);
  state.quizChecked = {
    ...state.quizChecked,
    [key]: {
      answer,
      correct: correct === null ? false : correct,
      hasKnownAnswer: correct !== null,
      explanation: question.explanation || question.rationale || (correctAnswer ? `Correct answer: ${correctAnswer}` : ""),
      checkedAt: new Date().toISOString()
    }
  };
  persistDraft();
  renderLearningPanel();
}

function updateFocusPlanTask(index, minutes = null, task = null, shouldRender = true) {
  const taskIndex = Number(index);
  const current = state.studyPlan[taskIndex];
  if (!current) return;
  const previousTask = String(current.task || "");
  const nextTask = task === null || task === undefined ? previousTask : String(task || "").trim();
  const nextMinutes = minutes === null || minutes === undefined
    ? current.minutes
    : clampInteger(minutes, current.minutes, 1, MAX_DURATION_MINUTES);
  state.studyPlan = state.studyPlan.map((item, itemIndex) => itemIndex === taskIndex
    ? { minutes: nextMinutes, task: nextTask || previousTask }
    : item);
  if (previousTask && previousTask !== state.studyPlan[taskIndex].task && state.completedTasks.includes(previousTask)) {
    state.completedTasks = state.completedTasks
      .filter(item => item !== previousTask)
      .concat(state.studyPlan[taskIndex].task);
  }
  persistDraft();
  if (shouldRender) {
    renderActiveRoute();
  }
}

async function askFocusAssistant(question) {
  const text = String(question || "").trim();
  if (!text) return;
  const now = new Date().toISOString();
  const priorChatHistory = focusAssistantChatHistory();
  state.chatMessages = normalizeChatMessages([
    ...state.chatMessages,
    { role: "user", text, createdAt: now }
  ]);
  state.chatPending = true;
  state.chatError = "";
  persistDraft();
  renderLearningPanel();

  try {
    const result = await requestFocusAssistantAnswer(text, priorChatHistory);
    state.chatMessages = normalizeChatMessages([
      ...state.chatMessages,
      { role: "assistant", text: result.answer, createdAt: new Date().toISOString() }
    ]);
    if (result.offline) {
      state.chatError = "Using a local Focus Room reply because the AI tutor service is not connected.";
    }
  } catch (error) {
    const fallback = focusAssistantReply(text);
    state.chatMessages = normalizeChatMessages([
      ...state.chatMessages,
      { role: "assistant", text: fallback, createdAt: new Date().toISOString() }
    ]);
    state.chatError = `AI tutor unavailable: ${error.message || "request failed"}`;
  } finally {
    state.chatPending = false;
    persistDraft();
    renderLearningPanel();
  }
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
  persistDraft();
  renderFocusRoomSession();
}

function showFocusStudyHistory() {
  globalThis.location.hash = "#/study-history";
}

function openFocusRoomMaterial(materialId = "") {
  const id = String(materialId || "");
  if (typeof globalThis.openSynapseFocusRoom === "function") {
    globalThis.openSynapseFocusRoom(id);
    return;
  }
  const suffix = id ? `/${encodeURIComponent(id)}` : "";
  globalThis.location.hash = `#/focus-room${suffix}`;
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
    clearFocusTimer();
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
  clearFocusTimer();
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
    answerFocusQuizQuestion,
    askFocusAssistant,
    closeFocusSummary,
    endFocusRoomSession,
    checkFocusQuizQuestion,
    flipFocusFlashcard,
    pauseFocusRoomTimer,
    rateFocusFlashcard,
    resetFocusRoomTimer,
    returnFromFocusRoom,
    selectFocusScene,
    setFocusDuration,
    setFocusFlashcardIndex,
    setFocusPanelTab,
    openFocusRoomMaterial,
    showFocusStudyHistory,
    skipFocusRoomTimer,
    startFocusRoomSession,
    startFocusRoomTimer,
    toggleFocusRoomAudioPlayback,
    toggleFocusLearningPanel,
    toggleFocusTask,
    updateFocusPlanTask,
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
