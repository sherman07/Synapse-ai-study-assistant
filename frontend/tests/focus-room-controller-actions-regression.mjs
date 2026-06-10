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
const actions = [];
const eventHandlers = {};
const scrollToCalls = [];

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
globalThis.location = { hash: "#/focus-room/history-1" };
globalThis.localStorage = makeLocalStorage();
globalThis.addEventListener = (eventName, handler) => {
  eventHandlers[eventName] = handler;
};
globalThis.requestAnimationFrame = callback => callback();
globalThis.scrollTo = (x, y) => {
  scrollToCalls.push([x, y]);
};
globalThis.returnFromFocusRoomToWorkspace = async materialId => {
  actions.push(`restore:${materialId}`);
  globalThis.location.hash = "";
};
globalThis.switchTool = tool => actions.push(`switch:${tool}`);
globalThis.openAssistant = () => actions.push("assistant");
globalThis.getSynapseFocusRoomMaterials = () => [{
  materialId: "history-1",
  materialTitle: "Saved History Note",
  materialType: "Generated notes",
  aiSummary: "# Saved History Note\n\nReview the saved material.",
  summaryText: "Saved History Note Review the saved material.",
  studyHeadings: ["Saved History Note"],
  flashcards: [{ front: "Term", back: "Definition" }],
  quizzes: [{
    id: "quiz-1",
    title: "Saved Quiz",
    questions: [{ question: "What is connected?" }]
  }],
  mindMap: { branches: [{ title: "Branch" }] },
  studyPlan: []
}];
globalThis.getSynapseFocusRoomCurrentMaterial = () => null;

const controller = await import(`../src/focus-room/controller.js?actions=${Date.now()}`);
controller.initFocusRoom();
elements.focusRoomSurface.scrollTop = 480;
elements.focusRoomSurface.scrollLeft = 24;
globalThis.startFocusRoomSession();
assert.equal(elements.focusRoomSurface.scrollTop, 0, "Focus Room should reset vertical scroll when entering the session view");
assert.equal(elements.focusRoomSurface.scrollLeft, 0, "Focus Room should reset horizontal scroll when entering the session view");
assert.deepEqual(scrollToCalls.at(-1), [0, 0], "Focus Room should also reset the page scroll when switching views");
globalThis.toggleFocusLearningPanel();
globalThis.setFocusPanelTab("flashcards");

assert.ok(
  elements.focusLearningPanel.innerHTML.includes('returnFromFocusRoom(&quot;history-1&quot;, &quot;flashcards&quot;)'),
  "Focus Room flashcard panel should route back to the flashcard workspace"
);
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

await globalThis.returnFromFocusRoom("history-1", "quiz");
assert.deepEqual(actions, ["restore:history-1", "switch:quiz"]);
assert.equal(elements.appLayout.hidden, false);
assert.equal(elements.focusRoomSurface.hidden, true);

actions.length = 0;
globalThis.location.hash = "#/focus-room/history-1";
await globalThis.returnFromFocusRoom("history-1", "assistant");
assert.deepEqual(actions, ["restore:history-1", "assistant"]);

console.log("focus room controller actions regression passed");
