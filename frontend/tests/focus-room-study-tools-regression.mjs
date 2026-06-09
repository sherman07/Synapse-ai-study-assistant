import assert from "node:assert/strict";

function makeClassList() {
  const values = new Set();
  return {
    add(name) {
      values.add(name);
    },
    remove(name) {
      values.delete(name);
    },
    toggle(name, force) {
      const shouldAdd = force === undefined ? !values.has(name) : Boolean(force);
      if (shouldAdd) values.add(name);
      else values.delete(name);
      return shouldAdd;
    },
    contains(name) {
      return values.has(name);
    }
  };
}

function makeElement() {
  return {
    classList: makeClassList(),
    hidden: false,
    innerHTML: "",
    style: {},
    textContent: ""
  };
}

function makeLocalStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    dump() {
      return Object.fromEntries(values.entries());
    }
  };
}

const elements = {
  appLayout: makeElement(),
  focusLearningPanel: makeElement(),
  focusRoomSession: makeElement(),
  focusRoomSetup: makeElement(),
  focusRoomSurface: makeElement(),
  focusSessionSummary: makeElement(),
  focusStudyHistory: makeElement(),
  openAssistant: makeElement()
};
const storage = makeLocalStorage();
let askRequest = null;

globalThis.document = {
  body: {
    classList: makeClassList(),
    style: {}
  },
  getElementById(id) {
    return elements[id] || null;
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  }
};
globalThis.apiClient = {
  async fetch(path, options) {
    askRequest = {
      path,
      payload: JSON.parse(options.body)
    };
    return {
      ok: true,
      async json() {
        return {
          answer: "Backend tutor says net force controls acceleration.",
          used_external_research: false,
          research_sources: []
        };
      }
    };
  }
};
globalThis.location = { hash: "#/focus-room/history-tools" };
globalThis.localStorage = storage;
globalThis.addEventListener = () => {};
globalThis.requestAnimationFrame = callback => callback();
globalThis.getSynapseFocusRoomMaterials = () => [{
  materialId: "history-tools",
  materialTitle: "Forces Review",
  materialType: "Generated notes",
  aiSummary: "# Forces\n\nNewton's second law connects net force and acceleration.",
  summaryText: "Newton's second law connects net force and acceleration.",
  studyHeadings: ["Forces", "Worked examples"],
  flashcards: [
    { front: "Net force", back: "Mass times acceleration." },
    { front: "Free-body diagram", back: "A diagram of all external forces." }
  ],
  quizzes: [{
    id: "quiz-tools",
    title: "Forces Quiz",
    questions: [{
      id: "q1",
      type: "multiple_choice",
      question: "What is Newton's second law?",
      options: ["F = ma", "E = mc^2"],
      correctOptionIndexes: [0],
      explanation: "Net force equals mass times acceleration."
    }]
  }],
  mindMap: { branches: [{ title: "Forces" }] },
  studyPlan: []
}];
globalThis.getSynapseFocusRoomCurrentMaterial = () => null;

const controller = await import(`../src/focus-room/controller.js?study-tools=${Date.now()}`);
controller.initFocusRoom();
globalThis.startFocusRoomSession();
globalThis.toggleFocusLearningPanel();

globalThis.setFocusPanelTab("flashcards");
assert.ok(elements.focusLearningPanel.innerHTML.includes("Card 1 of 2"));
globalThis.flipFocusFlashcard();
assert.ok(elements.focusLearningPanel.innerHTML.includes("Mass times acceleration."));
globalThis.rateFocusFlashcard("hard");
assert.ok(elements.focusLearningPanel.innerHTML.includes("Card 2 of 2"));

globalThis.setFocusPanelTab("quiz");
globalThis.answerFocusQuizQuestion(0, "F = ma");
globalThis.checkFocusQuizQuestion(0);
assert.ok(elements.focusLearningPanel.innerHTML.includes("Correct"));
assert.ok(elements.focusLearningPanel.innerHTML.includes("100%"));

globalThis.setFocusPanelTab("plan");
globalThis.updateFocusPlanTask(0, 12, "Review vector force examples");
assert.ok(elements.focusLearningPanel.innerHTML.includes("Review vector force examples"));
globalThis.toggleFocusTask(0);

globalThis.setFocusPanelTab("chat");
await globalThis.askFocusAssistant("Explain this simply.");
assert.equal(askRequest.path, "/ask");
assert.equal(askRequest.payload.question, "Explain this simply.");
assert.ok(askRequest.payload.summary.includes("Newton's second law"));
assert.deepEqual(askRequest.payload.chat_history, []);
assert.ok(elements.focusLearningPanel.innerHTML.includes("Backend tutor says net force controls acceleration."));

globalThis.endFocusRoomSession();
const sessions = JSON.parse(storage.getItem("synapse.focusRoom.sessions.v1"));
assert.equal(sessions[0].flashcardsCompleted, 1);
assert.equal(sessions[0].quizScore, 100);
assert.deepEqual(sessions[0].mistakesMade, []);
assert.ok(sessions[0].completedTasks.includes("Review vector force examples"));

globalThis.startFocusRoomSession();
globalThis.setFocusPanelTab("plan");
assert.ok(elements.focusLearningPanel.innerHTML.includes("Review vector force examples"));
globalThis.endFocusRoomSession();
const freshSessions = JSON.parse(storage.getItem("synapse.focusRoom.sessions.v1"));
assert.equal(freshSessions[0].flashcardsCompleted, 0);
assert.equal(freshSessions[0].quizScore, null);
assert.deepEqual(freshSessions[0].mistakesMade, []);
assert.deepEqual(freshSessions[0].completedTasks, []);

console.log("focus room study tools regression passed");
