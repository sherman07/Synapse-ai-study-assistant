# Chat-First Learning Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Companion setup form with a resilient, ChatGPT-style adaptive tutor conversation.

**Architecture:** The React workspace owns one local, versioned conversation thread and renders it without waiting for the Express learning-record API. A small client module persists messages and calls FastAPI. The FastAPI tutor endpoint accepts first-turn free text, derives safe defaults for the adaptive-learning-coach prompt, and returns the existing compact tutor decision contract.

**Tech Stack:** React 18 via `createElement`, browser `localStorage`, Vite, FastAPI, Python `unittest`, Node assertion tests, existing Synapse API client.

## Global Constraints

- Do not change the Materials workspace, Focus Room, mode-switch implementation, database schema, or add dependencies.
- Keep the visible Companion surface to a single conversation and New chat; do not add dashboards, lesson cards, or input forms.
- Persist the user message before calling the tutor; failed replies must be retryable without duplicate user messages.
- Do not call the Express `/api/learning/*` service from the initial chat flow.
- Current-information requests may use the existing tutor research path; stable questions must not search by default.

---

### Task 1: Add a testable local conversation store

**Files:**
- Create: `frontend/src/legacy/learningCompanionChatStore.js`
- Create: `frontend/tests/learning-companion-chat-store.mjs`

**Interfaces:**
- Produces `loadLearningCompanionThread(storage)`, `saveLearningCompanionThread(thread, storage)`, `createLearningCompanionThread({id, now})`, `appendLearningCompanionMessage(thread, message, {now})`, and `resetLearningCompanionThread({id, now}, storage)`.
- The thread shape is `{ version: 1, id: string, updatedAt: string, messages: Array<{id, role, content, status?}> }`.
- `CompanionWorkspace` consumes these functions in Task 3.

- [ ] **Step 1: Write the failing store test**

```js
import assert from "node:assert/strict";
import {
  appendLearningCompanionMessage,
  createLearningCompanionThread,
  loadLearningCompanionThread,
  resetLearningCompanionThread,
  saveLearningCompanionThread,
} from "../src/legacy/learningCompanionChatStore.js";

const storage = new Map();
storage.getItem = storage.get.bind(storage);
storage.setItem = storage.set.bind(storage);
storage.removeItem = storage.delete.bind(storage);
const thread = createLearningCompanionThread({ id: "thread-1", now: () => "2026-07-16T00:00:00.000Z" });
const saved = appendLearningCompanionMessage(thread, { id: "user-1", role: "user", content: "Teach me photography" }, { now: () => "2026-07-16T00:01:00.000Z" });
saveLearningCompanionThread(saved, storage);
assert.deepEqual(loadLearningCompanionThread(storage), saved);
assert.deepEqual(resetLearningCompanionThread({ id: "thread-2", now: () => "2026-07-16T00:02:00.000Z" }, storage).messages, []);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node frontend/tests/learning-companion-chat-store.mjs`

Expected: failure because `learningCompanionChatStore.js` does not exist.

- [ ] **Step 3: Implement the minimal bounded store**

```js
const CHAT_STORAGE_KEY = "synapse.learning.companion.chat.v1";
const MAX_MESSAGES = 80;

export function createLearningCompanionThread({ id, now = () => new Date().toISOString() } = {}) {
  return { version: 1, id: id || globalThis.crypto?.randomUUID?.() || `thread-${Date.now()}`, updatedAt: now(), messages: [] };
}

export function appendLearningCompanionMessage(thread, message, { now = () => new Date().toISOString() } = {}) {
  const messages = [...(thread?.messages || []), message].slice(-MAX_MESSAGES);
  return { ...thread, version: 1, messages, updatedAt: now() };
}
```

Add safe `try/catch` storage reads/writes, reject invalid stored shapes by returning a new empty thread, preserve only non-empty `user` and `assistant` messages, and export the named helpers above. `resetLearningCompanionThread` creates and saves a fresh thread.

- [ ] **Step 4: Run the store test to verify it passes**

Run: `node frontend/tests/learning-companion-chat-store.mjs`

Expected: `learning companion chat store passed`.

- [ ] **Step 5: Commit the store**

```bash
git add frontend/src/legacy/learningCompanionChatStore.js frontend/tests/learning-companion-chat-store.mjs
git commit -m "feat: persist companion chat locally"
```

### Task 2: Make the tutor endpoint accept free-text first turns

**Files:**
- Modify: `backend/app_sections/14_learning_companion.py:1-150`
- Modify: `backend/tests/test_learning_companion.py:8-75`

**Interfaces:**
- Consumes `{ message, messages, availableTimeMinutes?, subject? }`.
- Produces the existing normalized tutor-decision JSON plus a derived `subject_title` and `intention`.
- `requestLearningCompanionDecision` in Task 3 sends this direct chat payload.

- [ ] **Step 1: Write failing endpoint coverage for a subjectless first message**

```python
def test_companion_accepts_a_first_free_text_message_without_a_subject(self):
    model_reply = '{"reply":"What kind of photos do you want to make?","state":"diagnose","mastery":0}'
    with patch("backend.app.require_text_ai"), patch("backend.app.generate_chat", return_value=model_reply):
        response = TestClient(app).post("/learning-companion/respond", json={
            "message": "I want to learn photography",
            "messages": [],
        })
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.json()["intention"], "skill")
    self.assertIn("photo", response.json()["subject_title"].lower())
```

Keep the existing invalid explicit-intention test: an explicit non-empty invalid intention still returns HTTP 400 and never invokes the model.

- [ ] **Step 2: Run the focused backend test to verify it fails**

Run: `.worktrees/ai-learning-companion-phase-1/.venv/bin/python -m unittest backend.tests.test_learning_companion`

Expected: the new test fails with `A learning subject title is required.`

- [ ] **Step 3: Implement safe discovery defaults and prompt changes**

```python
def learning_companion_defaults(message: str, history: List[dict]) -> Tuple[str, str]:
    topic = normalise_space(message) or normalise_space(history[-1]["text"] if history else "") or "your learning goal"
    return truncate_text(topic, 120), "skill"

subject = data.get("subject") if isinstance(data.get("subject"), dict) else {}
title = normalise_space(str(subject.get("title") or ""))
intention = normalise_space(str(subject.get("intention") or "")).lower()
history = learning_companion_history(data.get("messages"))
message = normalise_space(str(data.get("message") or ""))
if not message:
    return analysis_error_response("Write a message for Synapse first.", 400)
if intention and intention not in LEARNING_COMPANION_INTENTIONS:
    return analysis_error_response("Learning intention must be hobby, skill, project, or assessment.", 400)
if not title:
    title, inferred_intention = learning_companion_defaults(message, history)
    intention = intention or inferred_intention
```

Adjust the current instruction so a first turn responds to the learner's message directly and asks one follow-up only when needed. Keep research detection and existing typed-decision normalization. Do not expose internal diagnosis in the learner reply.

- [ ] **Step 4: Run focused backend tests to verify they pass**

Run: `.worktrees/ai-learning-companion-phase-1/.venv/bin/python -m unittest backend.tests.test_learning_companion`

Expected: all four Companion endpoint tests pass.

- [ ] **Step 5: Commit the endpoint update**

```bash
git add backend/app_sections/14_learning_companion.py backend/tests/test_learning_companion.py
git commit -m "feat: accept chat-first companion turns"
```

### Task 3: Replace the form with a local-first conversation workspace

**Files:**
- Modify: `frontend/src/legacy/learningCompanionClient.js:1-90`
- Modify: `frontend/src/react/components/CompanionWorkspace.js:1-260`
- Modify: `frontend/tests/ai-learning-companion-shell-regression.mjs:1-45`

**Interfaces:**
- Consumes local thread helpers from Task 1 and `requestLearningCompanionDecision({ message, messages })`.
- Renders `data-learning-companion-send`, `data-learning-companion-new-chat`, and `data-learning-companion-retry` controls.
- Does not import or call `fetchLearningSubjects`, `createLearningSubject`, `createLearningSession`, or evidence APIs.

- [ ] **Step 1: Update static frontend regression assertions first**

```js
assert.ok(companionWorkspace.includes("data-learning-companion-new-chat"));
assert.ok(companionWorkspace.includes("data-learning-companion-retry"));
assert.ok(companionWorkspace.includes("loadLearningCompanionThread"));
assert.ok(!companionWorkspace.includes("companion-start-form"));
assert.ok(!companionWorkspace.includes("data-learning-companion-create-subject"));
assert.ok(!companionClient.includes('"/api/learning/subjects"'));
```

- [ ] **Step 2: Run the regression to verify it fails**

Run: `node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: failure because the existing workspace still includes the setup form and data API.

- [ ] **Step 3: Reduce the client to the direct tutor request**

```js
async function requestLearningCompanionDecision({ message, messages = [], availableTimeMinutes = null } = {}) {
  const response = await companionApiClient.fetch("/learning-companion/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, messages, availableTimeMinutes }),
    timeoutMs: 45000,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) throw new Error(body?.error || "Synapse could not reply right now.");
  return body;
}
```

Remove unused Express data API imports and exports.

- [ ] **Step 4: Implement the chat workspace**

Replace `CompanionWorkspace` with state for `thread`, `draft`, `pendingMessage`, `busy`, and `failure`. On mount, load the local thread. Render one assistant welcome message when stored messages are empty. On send, append/persist the learner message first, call the direct tutor API with bounded `thread.messages`, then append/persist the assistant reply. On failure, retain the pending message and render Retry; retry calls the API without appending another learner message. New chat uses `window.confirm`, resets the persisted thread, clears error/draft, and focuses the composer.

Use `onKeyDown` to submit plain Enter and preserve Shift+Enter. Disable sending only while busy or the trimmed draft is empty. Render reply text and source-count text only when the decision says research was required.

- [ ] **Step 5: Run frontend regressions to verify they pass**

Run: `node frontend/tests/learning-companion-chat-store.mjs && node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: both commands pass and no assertion references the legacy onboarding form.

- [ ] **Step 6: Commit the chat workspace**

```bash
git add frontend/src/legacy/learningCompanionClient.js frontend/src/react/components/CompanionWorkspace.js frontend/tests/ai-learning-companion-shell-regression.mjs
git commit -m "feat: render companion as a chat"
```

### Task 4: Restyle Companion as a focused conversation surface

**Files:**
- Modify: `frontend/styles/01-section.css:460-670, 995-1010`
- Modify: `frontend/tests/ai-learning-companion-shell-regression.mjs`

**Interfaces:**
- Styles `companion-chat`, `companion-chat-header`, `companion-chat-thread`, `companion-message`, `companion-composer`, and `companion-turn-failure` emitted by Task 3.
- Retains all existing materials-mode selectors.

- [ ] **Step 1: Add failing static checks for chat layout selectors**

```js
assert.ok(styles.includes(".companion-chat-thread"));
assert.ok(styles.includes(".companion-composer"));
assert.ok(styles.includes(".companion-turn-failure"));
assert.ok(!styles.includes(".companion-start-form"));
```

- [ ] **Step 2: Run the regression to verify it fails**

Run: `node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: failure because the old form and journey styles still exist.

- [ ] **Step 3: Replace legacy Companion styling with scoped chat styling**

Implement a constrained `min-height`, flex-column chat card; a scrollable conversation thread; distinct assistant and learner bubbles; a bottom composer with visible focus state; a compact New chat button; retry/error treatment; and responsive media rules that keep the composer usable below 720px. Keep colours and typography aligned with existing Synapse tokens. Remove all CSS selectors exclusively serving the old form, subject selector, journey, time selector, and evidence button.

- [ ] **Step 4: Run frontend tests and production build**

Run: `npm run test:frontend && npm run build`

Expected: every frontend regression passes and both Vite builds complete; existing non-module and bundle-size warnings may remain.

- [ ] **Step 5: Commit the visual replacement**

```bash
git add frontend/styles/01-section.css frontend/tests/ai-learning-companion-shell-regression.mjs
git commit -m "style: make companion a chat surface"
```

### Task 5: Verify the complete interaction

**Files:**
- Modify only if verification exposes a task-scope defect.

- [ ] **Step 1: Run focused automated verification**

Run:

```bash
node frontend/tests/learning-companion-chat-store.mjs
npm run test:frontend
.worktrees/ai-learning-companion-phase-1/.venv/bin/python -m unittest backend.tests.test_learning_companion
npm run build
```

Expected: all focused tests pass and both frontend builds complete.

- [ ] **Step 2: Perform a browser visual check**

Start the local stack, open the Companion mode, and verify:

1. no subject/goal/time form is visible;
2. the initial chat greeting and composer are visible without a server error;
3. a learner message remains visible while waiting for a tutor reply;
4. New chat clears only after confirmation; and
5. the layout remains usable at desktop and narrow mobile width.
