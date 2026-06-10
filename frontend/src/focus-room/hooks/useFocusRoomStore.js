import { create } from "zustand/react";
import {
  FOCUS_ROOM_SCENES,
  formatFocusRoomDuration,
  getFocusRoomMaterial,
  readFocusRoomDraft,
  readFocusRoomSessions,
  saveFocusRoomSession,
  writeFocusRoomDraft
} from "../data.js";
import {
  DEFAULT_DURATION_MINUTES,
  DEFAULT_SCENE_ID,
  MAX_DURATION_MINUTES,
  PANEL_TABS,
  buildPlanForState,
  clampDuration,
  clampInteger,
  clampVolume,
  coerceQuizAnswer,
  correctAnswerText,
  currentScene,
  durationSeconds,
  flashcardKey,
  focusAssistantReply,
  focusFlashcards,
  focusQuizQuestions,
  isQuizAnswerCorrect,
  normalizeChatMessages,
  normalizeDraftRoot,
  normalizeStudyPlanItems,
  questionText,
  sceneById
} from "../utils.js";

function initialScene() {
  return FOCUS_ROOM_SCENES[0] || currentScene(DEFAULT_SCENE_ID);
}

function readDraftForMaterial(materialId) {
  const id = String(materialId || "");
  if (!id) return null;
  const root = normalizeDraftRoot(readFocusRoomDraft());
  const draft = root.materials[id];
  return draft && typeof draft === "object" ? draft : null;
}

function persistDraftFromState(source) {
  const materialId = String(source.selectedMaterialId || source.selectedMaterial?.materialId || "");
  if (!materialId) return;
  const root = normalizeDraftRoot(readFocusRoomDraft());
  root.materials[materialId] = {
    materialId,
    selectedScene: source.selectedScene,
    musicType: source.musicType,
    ambientSound: source.ambientSound,
    musicVolume: clampVolume(source.musicVolume),
    ambientVolume: clampVolume(source.ambientVolume),
    durationMinutes: clampDuration(source.pomodoroDuration),
    studyGoal: source.studyGoal,
    studyPlan: normalizeStudyPlanItems(source.studyPlan),
    updatedAt: new Date().toISOString()
  };
  writeFocusRoomDraft(root);
}

function hydratedMaterialState(material, previous = {}) {
  const scene = currentScene(previous.selectedScene);
  const draft = readDraftForMaterial(material?.materialId);
  const selectedScene = sceneById(draft?.selectedScene) ? draft.selectedScene : scene.id;
  const activeScene = currentScene(selectedScene);
  const musicType = String(draft?.musicType || activeScene.musicType || "Deep Focus");
  const ambientSound = String(draft?.ambientSound || activeScene.ambientSound || "Nature");
  const musicVolume = clampVolume(draft?.musicVolume, previous.musicVolume ?? 60);
  const ambientVolume = clampVolume(draft?.ambientVolume, previous.ambientVolume ?? 50);
  const pomodoroDuration = clampDuration(draft?.durationMinutes, previous.pomodoroDuration ?? DEFAULT_DURATION_MINUTES);
  const studyGoal = String(draft?.studyGoal || `Study ${material?.materialTitle || "this material"}`);
  const draftPlan = normalizeStudyPlanItems(draft?.studyPlan);
  const studyPlan = draftPlan.length ? draftPlan : buildPlanForState(material, studyGoal, pomodoroDuration);

  return {
    selectedScene,
    musicType,
    ambientSound,
    musicVolume,
    ambientVolume,
    pomodoroDuration,
    studyGoal,
    studyPlan
  };
}

function resetProgressState() {
  return {
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {}
  };
}

function countFocusFlashcardsCompleted(state) {
  return Object.values(state.flashcardProgress || {})
    .filter(item => item && item.difficulty)
    .length;
}

function focusQuizScoreFromState(state) {
  const checked = Object.values(state.quizChecked || {}).filter(item => item && item.hasKnownAnswer);
  if (!checked.length) return null;
  const correct = checked.filter(item => item.correct).length;
  return Math.round((correct / checked.length) * 100);
}

function focusQuizMistakesFromState(state) {
  const questions = focusQuizQuestions(state.selectedMaterial);
  return Object.entries(state.quizChecked || {})
    .filter(([, result]) => result && result.hasKnownAnswer && !result.correct)
    .map(([index]) => questionText(questions[Number(index)], Number(index)))
    .filter(Boolean);
}

async function requestFocusAssistantAnswer(question, chatHistory, material) {
  if (!globalThis.apiClient || typeof globalThis.apiClient.fetch !== "function") {
    return {
      answer: focusAssistantReply(question, material, useFocusRoomStore.getState().studyGoal),
      offline: true
    };
  }

  const response = await globalThis.apiClient.fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      selected_section: material?.studyHeadings?.[0] || "",
      preferred_language: globalThis.preferredLanguage?.value || "auto",
      title: material?.materialTitle || "Study material",
      summary: material?.aiSummary || material?.summaryText || "",
      sections: material?.sections || {},
      source_identity: material?.materialId || "",
      source_fingerprint: material?.sourceFingerprint || "",
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

export const useFocusRoomStore = create((set, get) => {
  const scene = initialScene();

  return {
    route: "workspace",
    view: "setup",
    selectedMaterialId: "",
    selectedMaterial: null,
    selectedScene: scene.id,
    musicType: scene.musicType || "Deep Focus",
    ambientSound: scene.ambientSound || "Nature",
    musicVolume: 60,
    ambientVolume: 50,
    pomodoroDuration: DEFAULT_DURATION_MINUTES,
    timerStatus: "idle",
    studyGoal: "",
    studyPlan: [],
    aiPanelOpen: false,
    planDrawerOpen: false,
    workspaceOpen: false,
    historyOpen: false,
    isIdle: false,
    currentSession: null,
    sessionHistory: [],
    activeDrawer: "",
    audioPlaying: false,
    elapsedSeconds: 0,
    startedAt: null,
    panelTab: "summary",
    summaryRecord: null,
    completedTasks: [],
    flashcardIndex: 0,
    flashcardSide: "front",
    flashcardProgress: {},
    quizAnswers: {},
    quizChecked: {},
    chatMessages: [],
    chatPending: false,
    chatError: "",

    setIdle: isIdle => set({ isIdle }),

    hydrateFocusRoute(route, material, { preserveSession = false } = {}) {
      const previous = get();
      const hasMaterial = !!material;
      const selectedMaterialId = hasMaterial ? material.materialId : String(route.materialId || "");

      if (!hasMaterial) {
        set({
          route: "setup",
          view: "setup",
          selectedMaterialId,
          selectedMaterial: null,
          aiPanelOpen: false,
          planDrawerOpen: false,
          workspaceOpen: false,
          activeDrawer: "",
          summaryRecord: null,
          studyPlan: []
        });
        return;
      }

      const sameMaterial = previous.selectedMaterialId === selectedMaterialId;
      const hydrated = sameMaterial && preserveSession
        ? {}
        : hydratedMaterialState(material, previous);

      set({
        ...hydrated,
        route: preserveSession && sameMaterial && previous.view === "session" ? "session" : "setup",
        view: preserveSession && sameMaterial && previous.view === "session" ? "session" : "setup",
        selectedMaterialId,
        selectedMaterial: material,
        aiPanelOpen: false,
        planDrawerOpen: false,
        workspaceOpen: false,
        historyOpen: false,
        activeDrawer: "",
        summaryRecord: null,
        ...(sameMaterial && preserveSession ? {} : {
          timerStatus: "idle",
          elapsedSeconds: 0,
          startedAt: null,
          currentSession: null,
          ...resetProgressState(),
          chatMessages: [],
          chatPending: false,
          chatError: ""
        })
      });
    },

    showStudyHistory() {
      set({
        route: "history",
        view: "history",
        aiPanelOpen: false,
        planDrawerOpen: false,
        workspaceOpen: false,
        historyOpen: true,
        activeDrawer: "",
        summaryRecord: null,
        sessionHistory: readFocusRoomSessions()
      });
    },

    selectScene(sceneId) {
      const nextScene = sceneById(sceneId);
      if (!nextScene) return;
      set(state => {
        const next = {
          selectedScene: nextScene.id,
          musicType: nextScene.musicType || state.musicType,
          ambientSound: nextScene.ambientSound || state.ambientSound
        };
        const merged = { ...state, ...next };
        persistDraftFromState(merged);
        return next;
      });
    },

    setPomodoroDuration(value) {
      set(state => {
        const pomodoroDuration = clampDuration(value, state.pomodoroDuration);
        const studyPlan = buildPlanForState(state.selectedMaterial, state.studyGoal, pomodoroDuration);
        const next = { pomodoroDuration, studyPlan };
        persistDraftFromState({ ...state, ...next });
        return next;
      });
    },

    setStudyGoal(value) {
      set(state => {
        const studyGoal = String(value ?? "");
        const studyPlan = buildPlanForState(state.selectedMaterial, studyGoal, state.pomodoroDuration);
        const next = { studyGoal, studyPlan };
        persistDraftFromState({ ...state, ...next });
        return next;
      });
    },

    setSound(key, value) {
      set(state => {
        let next = {};
        if (key === "musicVolume") next = { musicVolume: clampVolume(value, state.musicVolume) };
        if (key === "ambientVolume") next = { ambientVolume: clampVolume(value, state.ambientVolume) };
        if (key === "musicType") next = { musicType: String(value || state.musicType) };
        if (key === "ambientSound") next = { ambientSound: String(value || state.ambientSound) };
        persistDraftFromState({ ...state, ...next });
        return next;
      });
    },

    toggleAudio() {
      set(state => ({ audioPlaying: !state.audioPlaying }));
    },

    setAudioPlaying(audioPlaying) {
      set({ audioPlaying: Boolean(audioPlaying) });
    },

    openDrawer(activeDrawer) {
      set({
        activeDrawer,
        planDrawerOpen: activeDrawer === "plan",
        workspaceOpen: activeDrawer === "workspace",
        historyOpen: activeDrawer === "history"
      });
    },

    closeDrawer() {
      set({
        activeDrawer: "",
        planDrawerOpen: false,
        workspaceOpen: false,
        historyOpen: false
      });
    },

    toggleAIPanel() {
      set(state => ({ aiPanelOpen: !state.aiPanelOpen }));
    },

    setPanelTab(tab) {
      const nextTab = String(tab || "summary");
      set({
        panelTab: PANEL_TABS.has(nextTab) ? nextTab : "summary",
        aiPanelOpen: true
      });
    },

    startSession() {
      const state = get();
      if (!state.selectedMaterial) return;
      persistDraftFromState(state);
      set({
        route: "session",
        view: "session",
        timerStatus: "idle",
        elapsedSeconds: 0,
        startedAt: null,
        summaryRecord: null,
        aiPanelOpen: false,
        activeDrawer: "",
        currentSession: {
          sessionId: `focus-${Date.now()}`,
          materialId: state.selectedMaterial.materialId,
          studyGoal: state.studyGoal,
          selectedScene: state.selectedScene,
          musicType: state.musicType,
          ambientSound: state.ambientSound,
          musicVolume: state.musicVolume,
          ambientVolume: state.ambientVolume,
          pomodoroDuration: state.pomodoroDuration,
          startedAt: null
        },
        ...resetProgressState(),
        chatMessages: [],
        chatPending: false,
        chatError: ""
      });
    },

    startTimer() {
      const state = get();
      if (!state.selectedMaterial) return;
      const shouldRestart = state.timerStatus === "completed" || state.elapsedSeconds >= durationSeconds(state.pomodoroDuration);
      set({
        view: "session",
        route: "session",
        timerStatus: "studying",
        audioPlaying: true,
        summaryRecord: null,
        elapsedSeconds: shouldRestart ? 0 : state.elapsedSeconds,
        startedAt: !state.startedAt || state.timerStatus === "completed" ? new Date().toISOString() : state.startedAt,
        ...(shouldRestart ? resetProgressState() : {})
      });
    },

    pauseTimer({ pauseAudio = true } = {}) {
      const state = get();
      set({
        timerStatus: state.timerStatus === "studying" ? "paused" : state.timerStatus,
        audioPlaying: pauseAudio ? false : state.audioPlaying
      });
    },

    resetTimer() {
      set({
        timerStatus: "idle",
        audioPlaying: false,
        startedAt: null,
        elapsedSeconds: 0,
        summaryRecord: null,
        ...resetProgressState()
      });
    },

    skipTimer() {
      const state = get();
      set({
        elapsedSeconds: durationSeconds(state.pomodoroDuration),
        timerStatus: "completed",
        audioPlaying: false,
        startedAt: state.startedAt || new Date().toISOString()
      });
    },

    tickTimer() {
      const state = get();
      if (state.view !== "session" || state.timerStatus !== "studying" || !state.selectedMaterial) return;
      const total = durationSeconds(state.pomodoroDuration);
      const elapsedSeconds = total
        ? Math.min(total, state.elapsedSeconds + 1)
        : state.elapsedSeconds + 1;
      set({
        elapsedSeconds,
        timerStatus: total && elapsedSeconds >= total ? "completed" : state.timerStatus,
        audioPlaying: total && elapsedSeconds >= total ? false : state.audioPlaying
      });
    },

    endSession() {
      const state = get();
      const material = state.selectedMaterial || getFocusRoomMaterial(state.selectedMaterialId);
      if (!material) return;
      const now = new Date().toISOString();
      const total = durationSeconds(state.pomodoroDuration);
      const totalFocusTime = total ? Math.min(total, state.elapsedSeconds) : state.elapsedSeconds;
      const record = saveFocusRoomSession({
        sessionId: state.currentSession?.sessionId,
        materialId: material.materialId,
        materialTitle: material.materialTitle,
        studyGoal: state.studyGoal,
        selectedScene: state.selectedScene,
        musicType: state.musicType,
        ambientSound: state.ambientSound,
        musicVolume: state.musicVolume,
        ambientVolume: state.ambientVolume,
        pomodoroDuration: state.pomodoroDuration,
        startedAt: state.startedAt || now,
        endedAt: now,
        totalFocusTime,
        flashcardsCompleted: countFocusFlashcardsCompleted(state),
        quizScore: focusQuizScoreFromState(state),
        mistakesMade: focusQuizMistakesFromState(state),
        completedTasks: state.completedTasks,
        recommendedNextStep: "Return to your notes, review any unchecked tasks, then start another short focus block."
      });

      set({
        summaryRecord: record,
        sessionHistory: readFocusRoomSessions(),
        timerStatus: "completed",
        audioPlaying: false,
        elapsedSeconds: total ? Math.min(total, state.elapsedSeconds) : state.elapsedSeconds
      });
    },

    closeSummary() {
      set({ summaryRecord: null });
    },

    toggleTask(index) {
      set(state => {
        const planItem = state.studyPlan[Number(index)];
        if (!planItem) return {};
        const task = String(planItem.task || "");
        const completedTasks = state.completedTasks.includes(task)
          ? state.completedTasks.filter(item => item !== task)
          : [...state.completedTasks, task];
        persistDraftFromState({ ...state, completedTasks });
        return { completedTasks };
      });
    },

    updatePlanTask(index, minutes = null, task = null) {
      set(state => {
        const taskIndex = Number(index);
        const current = state.studyPlan[taskIndex];
        if (!current) return {};
        const previousTask = String(current.task || "");
        const nextTask = task === null || task === undefined ? previousTask : String(task || "").trim();
        const nextMinutes = minutes === null || minutes === undefined
          ? current.minutes
          : clampInteger(minutes, current.minutes, 1, MAX_DURATION_MINUTES);
        const studyPlan = state.studyPlan.map((item, itemIndex) => itemIndex === taskIndex
          ? { minutes: nextMinutes, task: nextTask || previousTask }
          : item);
        let completedTasks = state.completedTasks;
        if (previousTask && previousTask !== studyPlan[taskIndex].task && completedTasks.includes(previousTask)) {
          completedTasks = completedTasks
            .filter(item => item !== previousTask)
            .concat(studyPlan[taskIndex].task);
        }
        const next = { studyPlan, completedTasks };
        persistDraftFromState({ ...state, ...next });
        return next;
      });
    },

    setFlashcardIndex(index) {
      const cards = focusFlashcards(get().selectedMaterial);
      set({
        flashcardIndex: clampInteger(index, get().flashcardIndex, 0, Math.max(0, cards.length - 1)),
        flashcardSide: "front"
      });
    },

    flipFlashcard() {
      set(state => ({
        flashcardSide: state.flashcardSide === "back" ? "front" : "back"
      }));
    },

    rateFlashcard(difficulty) {
      const state = get();
      const cards = focusFlashcards(state.selectedMaterial);
      if (!cards.length) return;
      const index = clampInteger(state.flashcardIndex, 0, 0, cards.length - 1);
      const card = cards[index];
      const value = ["easy", "medium", "hard"].includes(String(difficulty)) ? String(difficulty) : "medium";
      set({
        flashcardProgress: {
          ...state.flashcardProgress,
          [flashcardKey(card, index)]: {
            difficulty: value,
            reviewedAt: new Date().toISOString()
          }
        },
        flashcardSide: "front",
        flashcardIndex: index < cards.length - 1 ? index + 1 : index
      });
    },

    answerQuizQuestion(index, value) {
      const questionIndex = Number(index);
      const question = focusQuizQuestions(get().selectedMaterial)[questionIndex];
      if (!question) return;
      const key = String(questionIndex);
      set(state => ({
        quizAnswers: {
          ...state.quizAnswers,
          [key]: coerceQuizAnswer(question, value, state.quizAnswers[key])
        }
      }));
    },

    checkQuizQuestion(index) {
      const questions = focusQuizQuestions(get().selectedMaterial);
      const questionIndex = Number(index);
      const question = questions[questionIndex];
      if (!question) return;
      const key = String(questionIndex);
      const state = get();
      const answer = Object.prototype.hasOwnProperty.call(state.quizAnswers, key) ? state.quizAnswers[key] : "";
      const correct = isQuizAnswerCorrect(question, answer);
      const correctAnswer = correctAnswerText(question);
      set({
        quizChecked: {
          ...state.quizChecked,
          [key]: {
            answer,
            correct: correct === null ? false : correct,
            hasKnownAnswer: correct !== null,
            explanation: question.explanation || question.rationale || (correctAnswer ? `Correct answer: ${correctAnswer}` : ""),
            checkedAt: new Date().toISOString()
          }
        }
      });
    },

    async askAssistant(question) {
      const text = String(question || "").trim();
      if (!text) return;
      const state = get();
      const material = state.selectedMaterial;
      const priorChatHistory = normalizeChatMessages(state.chatMessages)
        .slice(-10)
        .map(message => ({
          role: message.role === "user" ? "user" : "assistant",
          content: message.text
        }));
      set({
        chatMessages: normalizeChatMessages([
          ...state.chatMessages,
          { role: "user", text, createdAt: new Date().toISOString() }
        ]),
        chatPending: true,
        chatError: ""
      });

      try {
        const result = await requestFocusAssistantAnswer(text, priorChatHistory, material);
        set(nextState => ({
          chatMessages: normalizeChatMessages([
            ...nextState.chatMessages,
            { role: "assistant", text: result.answer, createdAt: new Date().toISOString() }
          ]),
          chatError: result.offline ? "Using a local Focus Room reply because the AI tutor service is not connected." : ""
        }));
      } catch (error) {
        set(nextState => ({
          chatMessages: normalizeChatMessages([
            ...nextState.chatMessages,
            { role: "assistant", text: focusAssistantReply(text, material, get().studyGoal), createdAt: new Date().toISOString() }
          ]),
          chatError: `AI tutor unavailable: ${error.message || "request failed"}`
        }));
      } finally {
        set({ chatPending: false });
      }
    },

    focusFlashcardsCompletedCount() {
      return countFocusFlashcardsCompleted(get());
    },

    focusQuizScore() {
      return focusQuizScoreFromState(get());
    },

    focusQuizMistakes() {
      return focusQuizMistakesFromState(get());
    },

    formatFocusedTime() {
      return formatFocusRoomDuration(get().elapsedSeconds);
    }
  };
});
