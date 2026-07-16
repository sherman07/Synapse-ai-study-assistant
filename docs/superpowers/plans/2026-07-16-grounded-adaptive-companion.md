# Grounded Adaptive Learning Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Synapse Companion a free-form chat that teaches adaptively, recommends a living learning path when wanted, and visibly grounds source-based or researched answers.

**Architecture:** Keep the React chat and local-first thread as the interaction backbone. Add a small browser bridge that exposes the already-processed source excerpts to Companion, a versioned local learning context, and a structured backend tutor-decision contract. The FastAPI endpoint routes each natural-language turn, builds mode-specific prompt blocks, validates model output, and never lets invalid metadata prevent a normal reply.

**Tech Stack:** React 18 via `createElement`, browser `localStorage` and `CustomEvent`, existing Synapse source-viewer state, FastAPI, Python `unittest`, Node assertion tests, existing Synapse API client.

## Global Constraints

- Preserve free-form chat: no setup form, lesson wizard, mandatory dashboard, or forced quiz before a direct answer.
- Preserve the existing dark Synapse chat shell, Materials workflow, source viewer, account navigation, and retry/new-chat behaviour.
- Keep material claims strictly limited to the selected bounded source excerpts supplied with the request.
- Trigger web research only for an explicit research/source request or current/time-sensitive question; never for ordinary stable questions.
- Store compact learning context locally; do not persist raw source excerpts, binary files, data URLs, auth data, or unrelated history in the Companion thread.
- Do not add dependencies, migrations, streaming, background reminders, or third-party branding/assets.
- Retain existing decision fields (`reply`, `state`, `mastery`, `exercise`, and research metadata) so current client recovery remains compatible.
- Remove this implementation plan and its companion design spec only after the implementation, tests, visual verification, and handoff are complete, per the user request.

---

### Task 1: Add pure, bounded Companion decision helpers

**Files:**
- Create: `backend/core/learning_companion.py`
- Create: `backend/tests/test_learning_companion_contract.py`
- Modify: `backend/app.py:36-145`

**Interfaces:**
- `normalise_learning_context(value: object) -> dict` returns the safe local context shape.
- `normalise_companion_source_bundle(value: object) -> dict` returns `{fingerprint, sources}` with at most six excerpts and 24,000 total excerpt characters.
- `normalise_companion_decision(parsed, fallback_reply, message, history, prior_context, source_bundle, research_sources) -> dict` returns a compatible tutor decision plus `turn_mode`, `evidence_mode`, `learning_context`, `path_update`, and `citations`.
- `build_companion_prompt_blocks(...) -> str` creates the evidence, turn-routing, adaptive-teaching, and JSON-contract prompt sections used by the endpoint in Task 3.

- [ ] **Step 1: Write failing contract tests**

```python
from backend.core.learning_companion import (
    normalise_companion_decision,
    normalise_companion_source_bundle,
)


def test_source_bundle_drops_binary_like_urls_and_caps_excerpts():
    source_bundle = normalise_companion_source_bundle({
        "fingerprint": "note-1",
        "sources": [{
            "id": "lecture-1",
            "title": "Lecture 1",
            "url": "data:text/plain,not-allowed",
            "excerpt": "a" * 9000,
        }],
    })

    assert source_bundle["fingerprint"] == "note-1"
    assert source_bundle["sources"][0]["url"] == ""
    assert len(source_bundle["sources"][0]["excerpt"]) == 6000


def test_decision_keeps_only_citations_from_the_supplied_bundle():
    decision = normalise_companion_decision(
        {
            "reply": "The lecture defines reinforcement as a consequence that increases behaviour.",
            "turn_mode": "source_answer",
            "evidence_mode": "materials",
            "citations": [
                {"source_id": "lecture-1", "label": "Lecture 1"},
                {"source_id": "invented", "label": "Not allowed"},
            ],
            "learning_context": {"topic": "Behaviourism", "goal": "Pass the quiz"},
        },
        fallback_reply="Please try again.",
        message="What does this lecture say reinforcement is?",
        history=[],
        prior_context={},
        source_bundle={"fingerprint": "note-1", "sources": [{"id": "lecture-1", "title": "Lecture 1", "excerpt": "..."}]},
        research_sources=[],
    )

    assert decision["evidence_mode"] == "materials"
    assert decision["turn_mode"] == "source_answer"
    assert decision["citations"] == [{"source_id": "lecture-1", "label": "Lecture 1", "url": ""}]
    assert decision["learning_context"]["goal"] == "Pass the quiz"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m unittest backend.tests.test_learning_companion_contract`

Expected: failure because `backend.core.learning_companion` does not exist.

- [ ] **Step 3: Implement the bounded normalisers and prompt-block builder**

```python
# backend/core/learning_companion.py
MAX_COMPANION_SOURCES = 6
MAX_COMPANION_SOURCE_EXCERPT_CHARS = 6000
MAX_COMPANION_SOURCE_TOTAL_CHARS = 24000
ALLOWED_TURN_MODES = {
    "direct_answer", "source_answer", "discover_outcome", "recommend_path",
    "teach", "practice", "hint", "reflect", "review", "session_summary",
}
ALLOWED_EVIDENCE_MODES = {"tutor", "materials", "research"}


def normalise_companion_source_bundle(value: object) -> dict:
    raw = value if isinstance(value, dict) else {}
    total = 0
    sources = []
    for item in raw.get("sources") if isinstance(raw.get("sources"), list) else []:
        if not isinstance(item, dict) or len(sources) >= MAX_COMPANION_SOURCES:
            continue
        source_id = clean_text(item.get("id"), 180)
        title = clean_text(item.get("title"), 180)
        excerpt = clean_text(item.get("excerpt"), MAX_COMPANION_SOURCE_EXCERPT_CHARS)
        if not source_id or not title or not excerpt:
            continue
        excerpt = excerpt[:max(0, MAX_COMPANION_SOURCE_TOTAL_CHARS - total)]
        if not excerpt:
            break
        total += len(excerpt)
        sources.append({"id": source_id, "title": title, "url": safe_http_url(item.get("url")), "excerpt": excerpt})
    return {"fingerprint": clean_text(raw.get("fingerprint"), 180), "sources": sources}
```

Implement `clean_text` with whitespace normalization and length capping, and `safe_http_url` with `urlparse`: return only `http`/`https` URLs and an empty string for `data:`, `blob:`, relative, or malformed values. Implement `normalise_learning_context` with bounded `topic`, `goal`, `deadline`, `permanent_daily_minutes`, `student_level`, `current_level_id`, `current_session`, `active_subskill`, `misconceptions`, `review_candidates`, `selected_source_ids`, and `source_fingerprint`. Clamp permanent minutes to `0..480`, lists to eight entries, and path levels to eight entries.

`normalise_companion_decision` must derive a normal reply/state/mastery/exercise compatible with the existing client, reject unknown turn/evidence modes, retain only material citations whose `source_id` appears in the supplied bundle, and retain only research citations whose `source_id` appears in the generated `web:1`, `web:2`, ... research list. Its fallback must return `evidence_mode="tutor"`, no citations, no path update, and a valid empty context.

Implement `build_companion_prompt_blocks` from named string blocks in the same module. It must state the free-chat routing rule, material-only evidence rule, research-only current-claim rule, recommended-path lifecycle, one-question active practice rule, direct correction rule, and exact JSON fields. It must include supplied source excerpts only in material mode and retrieved web text only in research mode.

Add the three helper imports in `backend/app.py` beside the other `core.*` imports.

- [ ] **Step 4: Run the contract tests to verify they pass**

Run: `python -m unittest backend.tests.test_learning_companion_contract`

Expected: both tests pass.

- [ ] **Step 5: Commit the pure contract layer**

```bash
git add backend/app.py backend/core/learning_companion.py backend/tests/test_learning_companion_contract.py
git commit -m "feat: add grounded companion contract"
```

### Task 2: Publish safe active-material context to the React Companion

**Files:**
- Modify: `frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js:1228-1320`
- Create: `frontend/src/legacy/learningCompanionSources.js`
- Create: `frontend/tests/learning-companion-sources.mjs`

**Interfaces:**
- Legacy code publishes `window.SynapseLearningCompanionSources = { fingerprint, sources }` and dispatches `synapse-learning-companion-sources-changed` whenever source viewer items change.
- `getLearningCompanionSources()` reads a safe current bundle.
- `subscribeToLearningCompanionSources(callback)` returns an unsubscribe function.
- `selectLearningCompanionSources(bundle, sourceIds)` returns the selected bounded request bundle without mutating browser source state.

- [ ] **Step 1: Write failing source-context tests**

```javascript
import assert from "node:assert/strict";
import { selectLearningCompanionSources } from "../src/legacy/learningCompanionSources.js";

const selected = selectLearningCompanionSources({
  fingerprint: "analysis-1",
  sources: [
    { id: "one", title: "Lecture 1", url: "https://example.com/1", excerpt: "First excerpt" },
    { id: "two", title: "Lecture 2", url: "blob:local", excerpt: "Second excerpt" },
  ],
}, ["two"]);

assert.equal(selected.fingerprint, "analysis-1");
assert.deepEqual(selected.sources, [{ id: "two", title: "Lecture 2", url: "", excerpt: "Second excerpt" }]);
console.log("learning companion sources passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node frontend/tests/learning-companion-sources.mjs`

Expected: failure because `learningCompanionSources.js` does not exist.

- [ ] **Step 3: Publish browser-safe sources from the legacy source viewer**

```javascript
const LEARNING_COMPANION_SOURCES_EVENT = "synapse-learning-companion-sources-changed";

function publishLearningCompanionSources(items = sourceViewerItems) {
  const sources = compactSourceItemsForHistory(items)
    .map(item => ({
      id: String(item.sourceIdentity || item.id || "").trim(),
      title: String(item.title || item.name || "Source").trim(),
      url: /^https?:\/\//i.test(item.url || "") ? item.url : "",
      excerpt: String(item.content || "").trim().slice(0, 6000),
    }))
    .filter(item => item.id && item.title && item.excerpt)
    .slice(0, 6);
  const detail = { fingerprint: String(currentSourceFingerprint || "").trim(), sources };
  window.SynapseLearningCompanionSources = detail;
  window.dispatchEvent(new CustomEvent(LEARNING_COMPANION_SOURCES_EVENT, { detail }));
}
```

Call `publishLearningCompanionSources()` immediately after every assignment to `sourceViewerItems` in `restoreSourceViewerItems`, `buildCurrentSourceItems`, and the existing analysis-reset block. Do not attach blobs, previews, `data:` URLs, or full history entries to the event payload.

Create `learningCompanionSources.js` with a pure `normaliseBundle`, `getLearningCompanionSources`, `subscribeToLearningCompanionSources`, and `selectLearningCompanionSources`. The normaliser must cap at six sources and 6,000 characters per excerpt, keep only `http`/`https` URLs, and return a fresh empty bundle if `window` or event data is unavailable.

- [ ] **Step 4: Run the source-context test to verify it passes**

Run: `node frontend/tests/learning-companion-sources.mjs`

Expected: `learning companion sources passed`.

- [ ] **Step 5: Commit the source bridge**

```bash
git add frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js frontend/src/legacy/learningCompanionSources.js frontend/tests/learning-companion-sources.mjs
git commit -m "feat: expose active materials to companion"
```

### Task 3: Upgrade the local thread and request client for adaptive context

**Files:**
- Modify: `frontend/src/legacy/learningCompanionChatStore.js:1-155`
- Modify: `frontend/src/legacy/learningCompanionClient.js:1-25`
- Modify: `frontend/tests/learning-companion-chat-store.mjs:1-54`
- Create: `frontend/tests/learning-companion-client.mjs`

**Interfaces:**
- Thread version `2` is `{ version, id, updatedAt, messages, learningContext }`.
- `updateLearningCompanionThreadContext(thread, learningContext, {now})` replaces only validated local learning context while retaining messages.
- `requestLearningCompanionDecision({ message, messages, learningContext, sourceBundle, availableTimeMinutes })` sends the new optional request fields without changing existing callers that omit them.

- [ ] **Step 1: Add failing migration and client payload tests**

```javascript
import fs from "node:fs";
import path from "node:path";

const migrated = loadLearningCompanionThread({
  getItem: () => JSON.stringify({ version: 1, id: "old", updatedAt: "2026-07-16T00:00:00.000Z", messages: [] }),
});
assert.equal(migrated.version, 2);
assert.deepEqual(migrated.learningContext, {});

const client = fs.readFileSync(path.join(process.cwd(), "frontend/src/legacy/learningCompanionClient.js"), "utf8");
assert.match(client, /learning_context:\s*learningContext\s*\|\|\s*\{\}/);
assert.match(client, /source_bundle:\s*sourceBundle\s*\|\|\s*\{\s*fingerprint:\s*"",\s*sources:\s*\[\]\s*\}/);
console.log("learning companion client passed");
```

Put the migration assertion in `frontend/tests/learning-companion-chat-store.mjs`. Put the client source assertion in `frontend/tests/learning-companion-client.mjs`; it makes no network request.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node frontend/tests/learning-companion-chat-store.mjs && node frontend/tests/learning-companion-client.mjs`

Expected: the store remains version `1` and the client body has no `learning_context`/`source_bundle` fields.

- [ ] **Step 3: Implement version-two local context and request payloads**

```javascript
const THREAD_VERSION = 2;

function createEmptyThread({ id, now = getDefaultNow } = {}) {
  return { version: THREAD_VERSION, id: normalizeThreadId(id), updatedAt: now(), messages: [], learningContext: {} };
}

export function updateLearningCompanionThreadContext(thread, learningContext, { now = getDefaultNow } = {}) {
  const base = isValidThread(thread) ? thread : createEmptyThread({ id: thread?.id, now });
  return { ...base, version: THREAD_VERSION, learningContext: normalizeLearningContext(learningContext), updatedAt: now() };
}
```

Migrate a valid version-one record in `loadLearningCompanionThread` to version two with `{}` context. Keep existing message validation and storage-error recovery. The browser-side context normaliser must keep only short scalar topic/goal/deadline/level/session values, eight-item arrays, and a compact path; it must never store source excerpts.

Extend the client function signature and body exactly as follows:

```javascript
body: JSON.stringify({
  message,
  messages,
  availableTimeMinutes,
  learning_context: learningContext || {},
  source_bundle: sourceBundle || { fingerprint: "", sources: [] },
}),
```

Retain the existing response/error checks.

- [ ] **Step 4: Run the store and client tests to verify they pass**

Run: `node frontend/tests/learning-companion-chat-store.mjs && node frontend/tests/learning-companion-client.mjs`

Expected: both scripts print their pass messages.

- [ ] **Step 5: Commit adaptive local state**

```bash
git add frontend/src/legacy/learningCompanionChatStore.js frontend/src/legacy/learningCompanionClient.js frontend/tests/learning-companion-chat-store.mjs frontend/tests/learning-companion-client.mjs
git commit -m "feat: persist companion learning context"
```

### Task 4: Route and validate grounded adaptive tutor turns in FastAPI

**Files:**
- Modify: `backend/app_sections/14_learning_companion.py:1-165`
- Modify: `backend/tests/test_learning_companion.py:1-95`

**Interfaces:**
- The route accepts optional snake-case `learning_context`/`source_bundle` and camel-case aliases for compatibility.
- The route chooses `materials` when selected excerpts exist and the learner asks about them, `research` for explicit/current research, otherwise `tutor`.
- The response uses the Task 1 normaliser and returns compatible old fields plus the new validated contract.

- [ ] **Step 1: Add failing endpoint behaviour tests**

```python
def test_material_question_receives_only_selected_source_context(self):
    model_reply = '''{
      "reply": "The selected lecture says positive reinforcement increases a behaviour.",
      "turn_mode": "source_answer",
      "evidence_mode": "materials",
      "citations": [{"source_id": "lecture-1", "label": "Lecture 1"}],
      "learning_context": {"topic": "Behaviourism"}
    }'''
    with patch("backend.app.require_text_ai"), patch("backend.app.generate_chat", return_value=model_reply) as generate:
        response = TestClient(app).post("/learning-companion/respond", json={
            "message": "What does the lecture say reinforcement is?",
            "source_bundle": {"fingerprint": "note-1", "sources": [{
                "id": "lecture-1", "title": "Lecture 1", "excerpt": "Positive reinforcement increases behaviour.",
            }]},
        })
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.json()["evidence_mode"], "materials")
    self.assertEqual(response.json()["citations"][0]["source_id"], "lecture-1")
    self.assertIn("Positive reinforcement", generate.call_args.args[0][1]["content"])


def test_learning_request_recommends_path_after_outcome_is_known(self):
    model_reply = '''{
      "reply": "Here is a path toward building independent web apps.",
      "turn_mode": "recommend_path",
      "path_update": {"title": "Independent web apps", "levels": [
        {"id": "one", "title": "HTML foundations", "graduation": "Build a semantic page"},
        {"id": "two", "title": "CSS layout", "graduation": "Recreate a responsive layout"},
        {"id": "three", "title": "JavaScript", "graduation": "Build an interactive form"},
        {"id": "four", "title": "React", "graduation": "Build a stateful interface"},
        {"id": "five", "title": "Ship a project", "graduation": "Deploy an app"}
      ], "total_hours": "80–120", "next_session": "Tell me your permanent daily time."},
      "learning_context": {"topic": "web development", "goal": "build independent projects"}
    }'''
    with patch("backend.app.require_text_ai"), patch("backend.app.generate_chat", return_value=model_reply):
        response = TestClient(app).post("/learning-companion/respond", json={
            "message": "I want to build projects independently.",
            "learning_context": {"topic": "web development", "goal": "build independent projects"},
        })
    self.assertEqual(response.status_code, 200)
    self.assertEqual(response.json()["turn_mode"], "recommend_path")
    self.assertEqual(len(response.json()["path_update"]["levels"]), 5)
```

Keep and extend the current tests for subjectless first turns, invalid explicit intention, stable no-research questions, and current research.

- [ ] **Step 2: Run the endpoint tests to verify they fail**

Run: `python -m unittest backend.tests.test_learning_companion backend.tests.test_learning_companion_contract`

Expected: response lacks `evidence_mode`, citations, and `path_update`.

- [ ] **Step 3: Replace the monolithic companion prompt with routed blocks**

```python
learning_context = normalise_learning_context(data.get("learning_context") or data.get("learningContext"))
source_bundle = normalise_companion_source_bundle(data.get("source_bundle") or data.get("sourceBundle"))
explicit_research = learning_companion_research_request(message, title)[0] or "research" in message.lower()
uses_materials = bool(source_bundle["sources"]) and not explicit_research
evidence_mode = "research" if explicit_research else "materials" if uses_materials else "tutor"
```

Use the existing `gather_tutor_web_research` only for `research`. Do not call it for `materials` or `tutor`. Build `source_context` only from `source_bundle["sources"]`; include each source ID and title beside its excerpt. Build research source IDs as `web:1`, `web:2`, etc. Call `build_companion_prompt_blocks` with topic, message, history, learning context, source bundle, evidence mode, and research context.

Use a direct-answer fallback when there is no learning request, and a single outcome question fallback only when a learning track is explicitly requested without an outcome. Feed parsed model JSON through `normalise_companion_decision`, then append the existing `subject_title`, `intention`, `available_time_minutes`, and web-research fields before returning it.

The prompt block must enforce: direct questions answered directly; one question at a time only for active learning; path only after an outcome; material claims only from supplied excerpts; valid citations only; explicit correction/retry on practice errors; and no disclosure of hidden state.

- [ ] **Step 4: Run focused backend tests to verify they pass**

Run: `python -m unittest backend.tests.test_learning_companion backend.tests.test_learning_companion_contract`

Expected: all Companion endpoint and contract tests pass.

- [ ] **Step 5: Commit the routed tutor endpoint**

```bash
git add backend/app_sections/14_learning_companion.py backend/tests/test_learning_companion.py
git commit -m "feat: ground adaptive companion turns"
```

### Task 5: Render sources and recommended paths inside the free chat

**Files:**
- Modify: `frontend/src/react/components/CompanionWorkspace.js:1-280`
- Modify: `frontend/styles/01-section.css:582-745,1071-1135,1488-1511`
- Modify: `frontend/tests/ai-learning-companion-shell-regression.mjs:1-58`

**Interfaces:**
- The workspace reads active sources through Task 2 and sends only checked source IDs through Task 3's client.
- Assistant messages render `path_update`, `evidence_mode`, and validated citations from Task 4.
- `data-learning-companion-use-materials`, `data-learning-companion-source`, `data-learning-companion-path`, and existing send/new/retry selectors are stable regression hooks.

- [ ] **Step 1: Add failing chat-shell regression assertions**

```javascript
assert.ok(companionWorkspace.includes("getLearningCompanionSources"));
assert.ok(companionWorkspace.includes("data-learning-companion-use-materials"));
assert.ok(companionWorkspace.includes("data-learning-companion-path"));
assert.ok(companionWorkspace.includes("data-learning-companion-source"));
assert.ok(companionWorkspace.includes("learningContext"));
assert.ok(styles.includes(".companion-path-card"));
assert.ok(styles.includes(".companion-source-context"));
```

- [ ] **Step 2: Run the regression to verify it fails**

Run: `node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: failure because the workspace has no source-selection or path rendering hooks.

- [ ] **Step 3: Add source selection, decision persistence, citations, and path rendering**

```javascript
const initialSourceBundle = getLearningCompanionSources();
const [sourceBundle, setSourceBundle] = React.useState(initialSourceBundle);
const [selectedSourceIds, setSelectedSourceIds] = React.useState(() => initialSourceBundle.sources.map(source => source.id));
const sourceFingerprintRef = React.useRef(initialSourceBundle.fingerprint);

React.useEffect(() => subscribeToLearningCompanionSources(nextBundle => {
  setSourceBundle(nextBundle);
  setSelectedSourceIds(previous => {
    if (nextBundle.fingerprint !== sourceFingerprintRef.current) {
      sourceFingerprintRef.current = nextBundle.fingerprint;
      return nextBundle.sources.map(source => source.id);
    }
    return previous.filter(id => nextBundle.sources.some(source => source.id === id));
  });
}), []);

const selectedSources = selectLearningCompanionSources(sourceBundle, selectedSourceIds);
const decision = await requestLearningCompanionDecision({
  message: learnerMessage.content,
  messages: history,
  learningContext: activeThread.learningContext,
  sourceBundle: selectedSources,
});
const withContext = updateLearningCompanionThreadContext(activeThread, decision.learning_context);
const nextThread = appendLearningCompanionMessage(withContext, assistantMessage);
```

When active sources exist, render a compact `<details className="companion-source-context">` immediately above the composer. Its summary reads `Use materials` or `Using N materials`; each checkbox toggles one source ID and remains usable while idle. Selecting no sources preserves ordinary tutor chat.

Create small pure render helpers in the component:

- `messageCitations(message)` returns only decision citations with non-empty label.
- `PathCard({ path })` returns `null` without levels, otherwise an `article` with `data-learning-companion-path`, title, effort range, level title/graduation list, and next-session text.
- `CitationList({ citations, sources })` renders research URLs as safe external links and material citations as buttons with `data-learning-companion-source`. A material button dispatches `synapse-learning-companion-open-source` with the source ID; extend the legacy source-viewer bridge in Task 2 to handle that event by selecting/opening the matching viewer item.

Render an evidence label only for `materials` (`Based on your materials`) or `research` (`Web research`). Never show internal turn mode, learner model, diagnosis, mastery, or raw source excerpts. Keep message text as plain text and retain retry/new chat keyboard behaviour.

Add scoped CSS for the source context, source checkbox rows, evidence label, citation list, and collapsible path card. Use the existing dark rail palette under `.app-layout.initial-state:has(.dark-learning-rail)`; retain mobile one-column behaviour and existing focus-visible contrast.

- [ ] **Step 4: Run frontend regressions to verify they pass**

Run: `node frontend/tests/learning-companion-sources.mjs && node frontend/tests/learning-companion-chat-store.mjs && node frontend/tests/learning-companion-client.mjs && node frontend/tests/ai-learning-companion-shell-regression.mjs`

Expected: all four scripts print pass messages.

- [ ] **Step 5: Commit the chat-native grounded UI**

```bash
git add frontend/src/react/components/CompanionWorkspace.js frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js frontend/styles/01-section.css frontend/tests/ai-learning-companion-shell-regression.mjs
git commit -m "feat: show companion sources and learning paths"
```

### Task 6: Run integrated verification, perform a browser check, and remove temporary docs

**Files:**
- Modify/Delete after successful verification: `docs/superpowers/specs/2026-07-16-grounded-adaptive-companion-design.md`
- Modify/Delete after successful verification: `docs/superpowers/plans/2026-07-16-grounded-adaptive-companion.md`

**Interfaces:**
- No production interfaces change in this task.
- Documentation removal is the final cleanup only; it must not happen before successful code/test/browser verification.

- [ ] **Step 1: Run the focused backend suite**

Run: `python -m unittest backend.tests.test_learning_companion backend.tests.test_learning_companion_contract`

Expected: all tests pass.

- [ ] **Step 2: Run the Companion frontend suite and production build**

Run: `node frontend/tests/learning-companion-sources.mjs && node frontend/tests/learning-companion-chat-store.mjs && node frontend/tests/learning-companion-client.mjs && node frontend/tests/ai-learning-companion-shell-regression.mjs && npm --prefix frontend run build`

Expected: every regression script prints its pass message and Vite exits with code `0`.

- [ ] **Step 3: Verify the live interaction in a local browser**

Run the existing local frontend/backend development commands, then verify all of the following manually at desktop and narrow widths:

1. A direct question gets a direct reply without a form or forced quiz.
2. “Teach me photography” asks one outcome question; supplying an outcome produces a visible recommended-path card.
3. In Materials with processed excerpts, selecting one source sends only that source and shows a material evidence label/citation.
4. A current/research prompt shows web-research metadata; an ordinary stable question does not.
5. Retry leaves the learner message and learning path intact; New chat clears both after confirmation.

- [ ] **Step 4: Delete the temporary design and plan Markdown files after verification succeeds**

```bash
rm docs/superpowers/specs/2026-07-16-grounded-adaptive-companion-design.md \
   docs/superpowers/plans/2026-07-16-grounded-adaptive-companion.md
git add -u docs/superpowers/specs/2026-07-16-grounded-adaptive-companion-design.md docs/superpowers/plans/2026-07-16-grounded-adaptive-companion.md
git commit -m "chore: remove companion implementation docs"
```

Expected: `git status --short` no longer lists either temporary Markdown file; unrelated user changes remain unstaged and untouched.
