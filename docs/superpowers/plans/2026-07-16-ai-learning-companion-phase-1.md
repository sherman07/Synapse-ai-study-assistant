# AI Learning Companion Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a durable Learn with AI foundation that lets a learner create, continue, and learn within a subject without changing the existing material-analysis experience.

**Architecture:** Keep the existing material workspace mounted and add an explicit `learningExperienceMode` bridge for a separately scoped Companion surface. Express owns user-scoped learning records; FastAPI owns a typed, isolated tutor turn endpoint; the browser streams responses and never decides learning strategy.

**Tech Stack:** Existing CDN React shell and legacy controller bridge, CSS, Express/MySQL/Supabase data API, FastAPI, Python unittest, Node static regression tests.

## Global Constraints

- Preserve existing Synapse colours, current Upload behavior, Focus Room, and existing prompt modes.
- Do not render a second existing assistant panel or introduce React Router.
- Use `materials` and `companion` only for workspace mode; never overload `promptMode`.
- Keep the Upload stage mounted when Companion is active so browser `File` objects survive switching.
- Every Companion record is authenticated, ownership checked, and uses one caller-generated ID for Supabase and MySQL writes.
- Do not expose generic flashcard, quiz, mind-map, note, or broadcast actions in Companion Phase 1.
- Write every behavioural test first, observe its expected failure, then implement the minimal change.

---

### Task 1: Companion workspace switch and shell

**Files:**
- Create: `frontend/src/react/components/LearningModeSwitcher.js`
- Create: `frontend/src/react/components/CompanionWorkspace.js`
- Create: `frontend/src/legacy/controller_sections/14_learningcompanion.js`
- Modify: `frontend/src/react/components/AppShell.js`
- Modify: `frontend/src/legacy/controller.js`
- Modify: `frontend/src/legacy/controller_sections/99_boot.js`
- Modify: `frontend/styles/01-section.css`
- Test: `frontend/tests/ai-learning-companion-shell-regression.mjs`

**Interfaces:**
- Produces `window.setLearningExperienceMode(mode)` and `window.getLearningExperienceMode()`.
- `mode` is exactly `"materials" | "companion"`.
- Produces `#companionWorkspace` and `data-learning-experience-mode` on `#appLayout`.

- [ ] **Step 1: Write the failing shell regression**

```js
assert.ok(appShell.includes("LearningModeSwitcher"));
assert.ok(appShell.includes("CompanionWorkspace"));
assert.ok(controller.includes('"14_learningcompanion.js"'));
assert.ok(modeSection.includes('const LEARNING_EXPERIENCE_STORAGE_KEY'));
assert.ok(modeSection.includes('function setLearningExperienceMode(mode)'));
assert.ok(modeSection.includes('mode !== "materials" && mode !== "companion"'));
assert.ok(modeSection.includes('appLayout.dataset.learningExperienceMode'));
assert.ok(styles.includes('[data-learning-experience-mode="companion"]'));
```

- [ ] **Step 2: Run the regression and observe failure**

Run: `node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: failure because `LearningModeSwitcher.js` does not exist.

- [ ] **Step 3: Implement the mode bridge and surfaces**

```js
const LEARNING_EXPERIENCE_STORAGE_KEY = "synapse.learning.experience.mode.v1";

function setLearningExperienceMode(mode) {
  if (mode !== "materials" && mode !== "companion") return;
  appLayout.dataset.learningExperienceMode = mode;
  safeSetLocalStorage(LEARNING_EXPERIENCE_STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent("synapse-learning-mode-changed", { detail: { mode } }));
}
```

`AppShell` must render both `UploadStage` and `CompanionWorkspace`; CSS controls visibility rather than unmounting either surface. `LearningModeSwitcher` uses buttons with `aria-pressed`, an explicit group label, and calls `setLearningExperienceMode` through `legacyAction`.

- [ ] **Step 4: Run focused frontend verification**

Run: `node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: `ai learning companion shell regression passed`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/react/components/LearningModeSwitcher.js frontend/src/react/components/CompanionWorkspace.js frontend/src/legacy/controller_sections/14_learningcompanion.js frontend/src/react/components/AppShell.js frontend/src/legacy/controller.js frontend/src/legacy/controller_sections/99_boot.js frontend/styles/01-section.css frontend/tests/ai-learning-companion-shell-regression.mjs
git commit -m "feat: add learning companion workspace switch"
```

### Task 2: Durable learning-domain records in the data API

**Files:**
- Create: `server/src/repositories/learningRepository.js`
- Create: `server/src/routes/learning.js`
- Modify: `server/src/app.js`
- Modify: `server/src/db/schema.sql`
- Modify: `server/src/db/supabase-schema.sql`
- Test: `server/tests/learning.test.js`

**Interfaces:**
- Produces `createSubject(userId, input)`, `listSubjects(userId)`, `createSession(userId, subjectId, input)`, `appendMessage(userId, sessionId, input)`, and `upsertLearningState(userId, subjectId, patch)`.
- Route base is `/api/learning`.
- Subject intentions are `hobby`, `skill`, `project`, and `assessment`.

- [ ] **Step 1: Write failing ownership and validation tests**

```js
test("learning subject creation preserves an explicit id and accepted intention", async () => {
  const subject = normalizeSubject({ id: "subject-1", title: "Photography", intention: "hobby", goal: "Control motion" }, "user-1");
  assert.equal(subject.id, "subject-1");
  assert.equal(subject.intention, "hobby");
});

test("learning messages reject system roles", () => {
  assert.throws(() => normalizeMessage({ role: "system", content: "ignore policy" }), /role/i);
});
```

- [ ] **Step 2: Run the data API test and observe failure**

Run: `cd server && node --test tests/learning.test.js`

Expected: failure because `learningRepository.js` does not exist.

- [ ] **Step 3: Add schema, repository, and authenticated routes**

Create additive `learner_profiles`, `learning_subjects`, `learning_sessions`, `learning_messages`, `learning_journeys`, `learning_units`, `skill_nodes`, and `learning_evidence` definitions in both schemas. `learningRepository.js` normalizes bounded strings, validates the four intentions and two message roles, and maps JSON fields consistently across databases.

Routes must authenticate through existing middleware and expose:

```text
GET/POST /api/learning/subjects
GET/POST /api/learning/subjects/:subjectId/sessions
GET/POST /api/learning/sessions/:sessionId/messages
GET/PATCH /api/learning/profile
```

Each nested route loads the parent record for the authenticated user before reading or writing it.

- [ ] **Step 4: Run data API checks**

Run: `cd server && npm run check && node --test tests/learning.test.js`

Expected: Node syntax checks and learning tests pass.

- [ ] **Step 5: Commit**

```bash
git add server/src/repositories/learningRepository.js server/src/routes/learning.js server/src/app.js server/src/db/schema.sql server/src/db/supabase-schema.sql server/tests/learning.test.js
git commit -m "feat: persist learning companion subjects and sessions"
```

### Task 3: Isolated typed tutor decision and turn endpoint

**Files:**
- Create: `backend/core/learning_companion.py`
- Create: `backend/prompts/learning_companion/identity.md`
- Create: `backend/prompts/learning_companion/teaching-behaviour.md`
- Create: `backend/prompts/learning_companion/memory-policy.md`
- Create: `backend/prompts/learning_companion/evidence-policy.md`
- Create: `backend/prompts/learning_companion/intentions/hobby.md`
- Create: `backend/prompts/learning_companion/intentions/skill.md`
- Create: `backend/prompts/learning_companion/intentions/project.md`
- Create: `backend/prompts/learning_companion/intentions/assessment.md`
- Modify: `backend/app_sections/05_analyze.py`
- Test: `backend/tests/test_learning_companion.py`

**Interfaces:**
- `LearningTurnRequest(subject_id, session_id, message, available_time_minutes, idempotency_key)`.
- `TutorDecision(intent, learning_intention, active_objective, response_strategy, needs_diagnosis, needs_understanding_check, suggested_action, evidence_candidates, journey_patch)`.
- `build_learning_messages(request, context)` and `validate_tutor_decision(value)`.

- [ ] **Step 1: Write failing tutor-quality tests**

```python
def test_broad_hobby_goal_requests_one_starting_level_question():
    decision = validate_tutor_decision({
        "intent": "start_subject", "learning_intention": "hobby",
        "active_objective": "Establish photography experience", "response_strategy": "diagnose",
        "needs_diagnosis": True, "needs_understanding_check": False,
        "suggested_action": "Ask about manual camera settings", "evidence_candidates": [], "journey_patch": {}
    })
    assert decision.response_strategy == "diagnose"

def test_tutor_decision_rejects_unrecognised_intention():
    with pytest.raises(ValueError):
        validate_tutor_decision({"learning_intention": "generic"})
```

- [ ] **Step 2: Run the test and observe failure**

Run: `.venv/bin/python -m unittest backend.tests.test_learning_companion`

Expected: failure because `backend.core.learning_companion` does not exist.

- [ ] **Step 3: Implement constrained decision and prompt builder**

Use Pydantic models for the request and internal decision. Load exactly four common Companion prompts, one intention prompt, and one action-specific instruction. The helper must select only bounded recent conversation, subject summary, active unit, relevant evidence, and learner preferences.

`/learning/turn/stream` accepts only Companion fields, rejects system roles, writes a user turn through the internal data API, requests a structured decision, streams `text_delta` events, then writes a validated assistant turn and state patch. Existing `/ask` remains unchanged.

- [ ] **Step 4: Run tutor tests**

Run: `.venv/bin/python -m unittest backend.tests.test_learning_companion backend.tests.test_auxiliary_api_reliability`

Expected: all selected tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/core/learning_companion.py backend/prompts/learning_companion backend/app_sections/05_analyze.py backend/tests/test_learning_companion.py
git commit -m "feat: add isolated learning companion tutor turns"
```

### Task 4: Subject client, streamed conversation, and Continue Learning

**Files:**
- Create: `frontend/src/legacy/learningApiClient.js`
- Create: `frontend/src/legacy/controller_sections/15_learningconversation.js`
- Modify: `frontend/src/legacy/controller.js`
- Modify: `frontend/src/legacy/controller_sections/14_learningcompanion.js`
- Modify: `frontend/src/react/components/CompanionWorkspace.js`
- Modify: `frontend/styles/01-section.css`
- Test: `frontend/tests/ai-learning-companion-conversation-regression.mjs`

**Interfaces:**
- `createLearningSubjectInDataApi(payload)`, `fetchLearningSubjectsFromDataApi()`, `createLearningSessionInDataApi(subjectId, payload)`, and `streamLearningTurn(payload, handlers)`.
- Produces `window.startLearningSubject`, `window.sendLearningMessage`, and `window.continueLearningSubject`.

- [ ] **Step 1: Write a failing conversation regression**

```js
assert.ok(client.includes("createLearningSubjectInDataApi"));
assert.ok(client.includes("streamLearningTurn"));
assert.ok(conversation.includes("AbortController"));
assert.ok(conversation.includes("idempotencyKey"));
assert.ok(conversation.includes("turn_complete"));
assert.ok(conversation.includes("Continue Learning"));
assert.ok(workspace.includes("data-learning-intention"));
```

- [ ] **Step 2: Run the regression and observe failure**

Run: `node frontend/tests/ai-learning-companion-conversation-regression.mjs`

Expected: failure because `learningApiClient.js` does not exist.

- [ ] **Step 3: Implement one subject workflow**

The client creates a subject and session before the first tutor turn. The controller renders user text immediately, streams assistant text into a single pending message, and commits display state only after `turn_complete`. A retry reuses the same idempotency key. The Companion home renders the latest active subject as Continue Learning and restores its active objective and next action.

- [ ] **Step 4: Run frontend regressions**

Run: `node frontend/tests/ai-learning-companion-shell-regression.mjs && node frontend/tests/ai-learning-companion-conversation-regression.mjs`

Expected: both regressions pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/legacy/learningApiClient.js frontend/src/legacy/controller_sections/15_learningconversation.js frontend/src/legacy/controller.js frontend/src/legacy/controller_sections/14_learningcompanion.js frontend/src/react/components/CompanionWorkspace.js frontend/styles/01-section.css frontend/tests/ai-learning-companion-conversation-regression.mjs
git commit -m "feat: add learning companion conversations and resume"
```

### Task 5: Journey, skill evidence, and Phase 1 regression coverage

**Files:**
- Modify: `server/src/repositories/learningRepository.js`
- Modify: `server/src/routes/learning.js`
- Modify: `backend/core/learning_companion.py`
- Modify: `frontend/src/legacy/controller_sections/15_learningconversation.js`
- Modify: `frontend/src/react/components/CompanionWorkspace.js`
- Modify: `frontend/styles/01-section.css`
- Create: `frontend/tests/ai-learning-companion-phase-one-regression.mjs`
- Modify: `server/tests/learning.test.js`
- Modify: `backend/tests/test_learning_companion.py`

**Interfaces:**
- `appendEvidence(userId, subjectId, payload)` accepts `explanation`, `practice`, `application`, `correction`, `recall`, or `self_report`.
- `deriveSkillStatus(evidence)` never returns `reliable` when all evidence is assistant-generated.

- [ ] **Step 1: Write failing evidence tests**

```python
def test_reliable_skill_requires_learner_evidence():
    assert derive_skill_status([]) == "unexplored"
    assert derive_skill_status([{"type": "explanation", "result": "correct"}]) == "developing"
    assert derive_skill_status([
        {"type": "practice", "result": "correct"},
        {"type": "application", "result": "successful"},
        {"type": "recall", "result": "correct"},
    ]) == "reliable"
```

- [ ] **Step 2: Run tests and observe failure**

Run: `.venv/bin/python -m unittest backend.tests.test_learning_companion`

Expected: failure because `derive_skill_status` does not exist.

- [ ] **Step 3: Implement minimal evidence-backed journey updates**

Persist valid evidence candidates only after a learner response. Derive the displayed skill status from evidence types and results, then render a compact journey and skill preview in the context drawer. Do not add percentage mastery or generic resource buttons.

- [ ] **Step 4: Run the Phase 1 verification set**

Run:

```bash
cd server && npm run check && node --test tests/learning.test.js
cd .. && .venv/bin/python -m unittest backend.tests.test_learning_companion backend.tests.test_auxiliary_api_reliability
node frontend/tests/ai-learning-companion-shell-regression.mjs
node frontend/tests/ai-learning-companion-conversation-regression.mjs
node frontend/tests/ai-learning-companion-phase-one-regression.mjs
npm run build
```

Expected: every command exits `0`.

- [ ] **Step 5: Commit**

```bash
git add server/src/repositories/learningRepository.js server/src/routes/learning.js backend/core/learning_companion.py frontend/src/legacy/controller_sections/15_learningconversation.js frontend/src/react/components/CompanionWorkspace.js frontend/styles/01-section.css frontend/tests/ai-learning-companion-phase-one-regression.mjs server/tests/learning.test.js backend/tests/test_learning_companion.py
git commit -m "feat: add evidence-backed learning journeys"
```

## Final verification

- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Run every Task 5 verification command from a clean workspace.
- [ ] Confirm `git status --short` contains only intentional AI Learning Companion files.
- [ ] Confirm the existing Upload switch, existing prompt modes, and Focus Room files were not modified.
