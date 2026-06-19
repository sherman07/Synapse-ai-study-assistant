import assert from "node:assert/strict";

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
    }
  };
}

const storage = makeLocalStorage();
let askRequest = null;

globalThis.localStorage = storage;
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

const material = {
  materialId: "history-tools",
  materialTitle: "Forces Review",
  materialType: "Generated notes",
  aiSummary: "# Forces\n\nNewton's second law connects net force and acceleration.",
  summaryText: "Newton's second law connects net force and acceleration.",
  studyHeadings: ["Forces", "Worked examples"],
  promptMode: "source_strict_research_mode",
  isSourceRestricted: true,
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
};

globalThis.getSynapseFocusRoomMaterials = () => [material];
globalThis.getSynapseFocusRoomCurrentMaterial = () => null;

const { useFocusRoomStore } = await import(`../src/focus-room/hooks/useFocusRoomStore.js?study-tools=${Date.now()}`);
const store = useFocusRoomStore;
store.getState().hydrateFocusRoute({ name: "focus", materialId: "history-tools" }, material);
store.getState().startSession();

store.getState().setPanelTab("flashcards");
assert.equal(store.getState().panelTab, "flashcards");
store.getState().flipFlashcard();
assert.equal(store.getState().flashcardSide, "back");
store.getState().rateFlashcard("hard");
assert.equal(store.getState().flashcardIndex, 1);

store.getState().setPanelTab("quiz");
store.getState().answerQuizQuestion(0, "F = ma");
store.getState().checkQuizQuestion(0);
assert.equal(store.getState().focusQuizScore(), 100);

store.getState().setPanelTab("plan");
store.getState().updatePlanTask(0, 12, "Review vector force examples");
assert.ok(store.getState().studyPlan[0].task.includes("Review vector force examples"));
store.getState().toggleTask(0);
store.getState().setWorkspaceNotes("Remember the direction of net force.");
store.getState().setAssistantContext({
  sectionTitle: "Forces",
  excerpt: "Newton's second law connects net force and acceleration."
});

store.getState().setPanelTab("chat");
await store.getState().askAssistant("Explain this simply.");
assert.equal(askRequest.path, "/ask");
assert.equal(askRequest.payload.question, "Explain this simply.");
assert.ok(askRequest.payload.summary.includes("Newton's second law"));
assert.deepEqual(askRequest.payload.chat_history, []);
assert.equal(askRequest.payload.selected_section, "Forces");
assert.equal(askRequest.payload.selected_excerpt.includes("net force"), true);
assert.equal(askRequest.payload.source_strict, true);
assert.ok(store.getState().chatMessages.some(message => message.text.includes("Backend tutor says")));

store.getState().endSession();
const sessions = JSON.parse(storage.getItem("synapse.focusRoom.sessions.v1"));
assert.equal(sessions[0].flashcardsCompleted, 1);
assert.equal(sessions[0].quizScore, 100);
assert.deepEqual(sessions[0].mistakesMade, []);
assert.ok(sessions[0].completedTasks.includes("Review vector force examples"));

store.getState().startSession();
assert.equal(store.getState().flashcardIndex, 0);
assert.equal(store.getState().focusQuizScore(), null);
assert.deepEqual(store.getState().completedTasks, []);

console.log("focus room study tools regression passed");
