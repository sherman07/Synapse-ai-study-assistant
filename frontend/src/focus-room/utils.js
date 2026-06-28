import {
  FOCUS_ROOM_DURATIONS,
  FOCUS_ROOM_SCENES,
  buildFocusRoomStudyPlan
} from "./data.js";

export const DEFAULT_SCENE_ID = FOCUS_ROOM_SCENES[0]?.id || "morning-window";
export const DEFAULT_DURATION_MINUTES = FOCUS_ROOM_DURATIONS[0] || 25;
export const MIN_DURATION_MINUTES = 10;
export const MAX_DURATION_MINUTES = 180;
export const SOUND_MIN = 0;
export const SOUND_MAX = 100;
export const PANEL_TAB_LIST = ["materials", "notes", "sources", "chat", "quiz", "flashcards", "mindmap", "plan", "workspace", "history"];
export const PANEL_TABS = new Set(PANEL_TAB_LIST);

export const spring = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};

export function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function clampInteger(value, fallback, min, max) {
  return Math.round(clampNumber(value, fallback, min, max));
}

export function clampVolume(value, fallback = 50) {
  return clampInteger(value, fallback, SOUND_MIN, SOUND_MAX);
}

export function clampDuration(value, fallback = DEFAULT_DURATION_MINUTES) {
  return clampInteger(value, fallback, MIN_DURATION_MINUTES, MAX_DURATION_MINUTES);
}

export function sceneById(sceneId) {
  return FOCUS_ROOM_SCENES.find(scene => scene.id === sceneId) || null;
}

export function currentScene(sceneId = DEFAULT_SCENE_ID) {
  return sceneById(sceneId) || FOCUS_ROOM_SCENES[0] || {
    id: DEFAULT_SCENE_ID,
    name: "Focus Room",
    kicker: "Focus",
    description: "A quiet study space.",
    image: "",
    ambientSound: "Nature",
    musicType: "Deep Focus"
  };
}

export function parseFocusPath(pathname = "/focus-room") {
  const path = String(pathname || "/focus-room").split("?")[0];
  if (path === "/study-history") {
    return { name: "history", materialId: "" };
  }
  if (path === "/focus-room" || path.startsWith("/focus-room/")) {
    const rawId = path.slice("/focus-room".length).replace(/^\/+/, "");
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

export function normalizeStudyPlanItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => ({
      minutes: clampInteger(item?.minutes, 5, 1, MAX_DURATION_MINUTES),
      task: String(item?.task || "").trim()
    }))
    .filter(item => item.task);
}

export function normalizeChatMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .map(message => ({
      role: String(message?.role || "assistant") === "user" ? "user" : "assistant",
      text: String(message?.text || "").trim(),
      createdAt: message?.createdAt || new Date().toISOString()
    }))
    .filter(message => message.text)
    .slice(-24);
}

export function normalizeDraftRoot(rawDraft) {
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

export function buildPlanForState(material, goal, durationMinutes) {
  if (!material) return [];
  return buildFocusRoomStudyPlan({
    material,
    goal,
    durationMinutes
  });
}

export function durationSeconds(minutes) {
  const safeMinutes = clampDuration(minutes);
  return safeMinutes > 0 ? safeMinutes * 60 : 0;
}

export function progressPercent(elapsedSeconds, minutes) {
  const total = durationSeconds(minutes);
  if (!total) return 0;
  return Math.min(100, Math.max(0, (elapsedSeconds / total) * 100));
}

export function formatTimerClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  const pad = value => String(value).padStart(2, "0");
  if (hours) return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

export function panelTabLabel(tab) {
  if (tab === "notes") return "Generated Notes";
  if (tab === "sources") return "Sources";
  if (tab === "mindmap") return "Mind Map";
  if (tab === "chat") return "AI Chat";
  if (tab === "plan") return "Study Plan";
  if (tab === "workspace") return "Scratchpad";
  if (tab === "history") return "History";
  return String(tab || "").replace(/^\w/, letter => letter.toUpperCase());
}

export function focusFlashcards(material) {
  const flashcardSource = material?.flashcards || [];
  return Array.isArray(flashcardSource) ? flashcardSource.slice(0, 24) : [];
}

export function flashcardPrompt(card, index) {
  return card?.prompt || card?.front || card?.question || card?.term || `Flashcard ${index + 1}`;
}

export function flashcardAnswer(card) {
  return card?.answer || card?.back || card?.definition || card?.explanation || "Return to the workspace for the saved answer.";
}

export function flashcardKey(card, index) {
  return String(card?.id || card?.front || card?.term || index);
}

export function quizQuestionList(quiz) {
  if (Array.isArray(quiz?.questions)) return quiz.questions;
  if (Array.isArray(quiz?.quiz?.questions)) return quiz.quiz.questions;
  return [];
}

export function focusQuizQuestions(material) {
  const quizzes = Array.isArray(material?.quizzes) ? material.quizzes : [];
  return quizzes.flatMap(quiz => quizQuestionList(quiz).map(question => ({
    ...question,
    quizTitle: quiz?.title || quiz?.quiz?.title || "Saved quiz"
  }))).slice(0, 12);
}

export function questionText(question, index) {
  return question?.question || question?.prompt || question?.stem || `Question ${index + 1}`;
}

export function questionType(question) {
  return String(question?.type || "").toLowerCase();
}

export function optionText(option) {
  return String(option?.label || option?.text || option).trim();
}

export function questionChoices(question) {
  const choices = question?.choices || question?.options || question?.answers;
  if (Array.isArray(choices) && choices.length) {
    return choices.map(optionText).filter(Boolean);
  }
  if (questionType(question) === "true_false") {
    return ["True", "False"];
  }
  return [];
}

export function correctOptionIndexes(question) {
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

export function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function optionIndexForAnswer(question, value) {
  if (Number.isInteger(value)) return value;
  const number = Number(value);
  if (typeof value !== "string" && Number.isInteger(number)) return number;
  const choices = questionChoices(question);
  const normalized = normalizeAnswer(value);
  return choices.findIndex(choice => normalizeAnswer(choice) === normalized);
}

export function booleanAnswerForQuestion(question, value) {
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

export function coerceQuizAnswer(question, value, currentAnswer) {
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

export function correctAnswerText(question) {
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

export function isQuizAnswerCorrect(question, answer) {
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

export function isFocusQuizAnswerPresent(question, answer) {
  const type = questionType(question);
  if (type === "multiple_choice") return Array.isArray(answer) && answer.length > 0;
  if (type === "single_choice") return Number.isInteger(answer);
  if (type === "true_false") return typeof answer === "boolean";
  return String(answer || "").trim().length > 0;
}

export function quizAnswerMatchesChoice(question, answer, choiceIndex) {
  const type = questionType(question);
  if (type === "multiple_choice") return Array.isArray(answer) && answer.includes(choiceIndex);
  if (type === "single_choice") return answer === choiceIndex;
  if (type === "true_false") return answer === (choiceIndex === 0);
  return normalizeAnswer(answer) === normalizeAnswer(questionChoices(question)[choiceIndex]);
}

export function focusAssistantReply(question, material, studyGoal) {
  const prompt = String(question || "").trim();
  const summary = String(material?.summaryText || material?.aiSummary || "").slice(0, 420);
  const heading = material?.studyHeadings?.[0] || material?.materialTitle || "this material";
  const goal = studyGoal || `Study ${material?.materialTitle || "this material"}`;
  if (!prompt) return "";
  return [
    `For ${heading}: ${summary || "use the selected material as your main source."}`,
    `Your current goal is: ${goal}.`,
    "Try explaining the idea in one sentence, then test yourself with one example before moving on."
  ].join(" ");
}
