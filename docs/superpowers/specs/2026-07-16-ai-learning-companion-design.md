# AI Learning Companion — Phase 1 Design

## Decision

Build AI Learning Companion as an additive, durable learning experience inside the existing Synapse workspace. It introduces a separate **Learn with AI** experience without changing the current **Learn from Materials** workflow, Focus Room, or existing resource-generation behaviour.

Phase 1 proves the core loop:

1. A learner chooses a learning intention and starts a subject.
2. Synapse discovers their goal, current knowledge, and available time conversationally.
3. The tutor teaches one useful objective, checks understanding, and records meaningful evidence.
4. The learner can return to the same subject, journey, and next action later.

The implementation must not present a generic chat screen with a permanent row of flashcard, quiz, map, note, and broadcast buttons.

## Scope

### In scope

- A non-destructive `materials` / `companion` workspace switch.
- A Companion home and a persistent, subject-based tutor conversation.
- Four learning intentions: hobby, skill, project, and assessment.
- Available-time selection: 5 minutes, 15 minutes, 30 minutes, and deep session.
- Natural one-question-at-a-time diagnosis.
- A basic adaptive learning journey and a compact skill-tree preview.
- Learner preferences, subject memory, conversation history, and evidence of understanding.
- A dedicated tutor orchestration API with streamed responses and isolated prompts.
- Continue Learning, retryable failed turns, and mode-safe state restoration.
- Focused automated tests and tutor-quality evaluation fixtures.

### Explicitly out of scope

- Focus Room changes or integration.
- Missions, submissions, Teach Me This, Curiosity Mode, journal, projects, weekly stories, and learning rhythm. These are later phases.
- Adaptive Memory Cards, Adaptive Learning Checks, Living Knowledge Maps, Personal Learning Notes, and Audio Learning Sessions. Existing resource tools remain available in the material workflow, but are not surfaced as Companion actions in Phase 1.
- General vector retrieval, a full migration of historic local study data, durable workers, and a unified learning-object migration. Phase 1 creates compatible stable IDs and boundaries without forcing a platform rewrite.
- A global redesign, router migration, or changes to existing prompt modes.

## Existing-system constraints

The current workspace is a hybrid application: a React-rendered shell uses a legacy controller for most state and behaviour. It has a static page entry point and global selectors, so rendering a second assistant panel or importing Focus Room components would create ID, styling, and runtime conflicts.

The current `/ask` endpoint receives client-supplied note context and stores chat only in browser storage. It automatically performs external research in many cases, accepts weakly typed input, and has no durable subject, session, learner, or evidence model. The existing material uploader and source extraction are valuable but must remain independent from Companion state.

Persistence is currently split between the Express data API, FastAPI runtime files, and browser storage. Supabase is the preferred durable store through the Express API, with a best-effort MySQL mirror. New learning records use caller-generated IDs so the same logical ID reaches both stores.

## Product behaviour

### Workspace switch

`learningExperienceMode` is a new, explicit state with only two values:

- `materials`
- `companion`

It is independent from `promptMode`, note depth, provider selection, Focus Room view state, and assistant tab selection. The switch is keyboard accessible, uses a short transform/opacity transition, and disables non-essential motion for reduced-motion users.

The material workspace remains mounted while hidden. This preserves in-memory `File` objects and uncontrolled upload form values. The companion workspace also remains mounted while hidden so an in-progress streamed response, draft, and local display state are not discarded. Switching mode never starts an analysis, resets a workspace, or creates a generation job.

Serializable material draft preferences (links, pasted text, language, provider, prompt mode, and depth) may be stored locally. Files remain in memory for Phase 1; a page refresh can require re-upload rather than pretending files were preserved.

### Companion start flow

The empty state asks **What would you like to understand?** and offers focused starter actions for the four intentions:

- Explore a hobby
- Build a skill
- Complete a project
- Prepare for an assessment

After a learner submits a broad goal, the tutor asks one useful question at a time. It must not show a long questionnaire or a full course plan before it knows enough to make the first objective useful.

The minimum diagnosis data is collected progressively:

- goal and intention;
- current knowledge or prior experience;
- desired depth or outcome;
- time available for the current session when relevant;
- deadline for assessment-oriented learning;
- preferred explanation or practice format when the learner expresses one.

The tutor does not ask for data already present in the subject, session, learner profile, or current conversation.

### Tutor cycle

For each turn, the tutor selects the smallest useful next action. The normal learning cycle is:

1. Read the learner's immediate request and relevant evidence.
2. Identify or confirm one learning objective.
3. Explain at an appropriate depth, using a concrete example where useful.
4. Invite an answer, prediction, explanation, or small application when a check is useful.
5. Diagnose meaningful misconceptions from the learner's response.
6. Give corrective feedback that preserves valid reasoning, explains the likely misconception, and guides the learner before revealing an answer.
7. Record evidence and recommend one next action.

This is a behavioural model, not an eleven-step response template. Direct factual questions can receive a direct answer. A difficult goal can span the cycle across multiple turns.

The adaptive-learning-coach methodology informs the design: discover the final goal, use high-leverage 80/20 sequencing, adapt to available time, ask one question at a time, use teach-back where appropriate, and schedule later review from evidence. It is intentionally not copied verbatim: a video or image is not mandatory per session, a complete roadmap is not always shown immediately, and persistent records replace conversation-only mental tracking.

## Frontend design

### Component hierarchy

```text
AppShell
├── LearningModeSwitcher
├── MaterialWorkspace (existing UploadStage, preserved)
└── CompanionWorkspace
    ├── CompanionHome
    │   ├── ContinueLearningCard
    │   ├── LearningIntentPicker
    │   └── RecentSubjects
    └── SubjectWorkspace
        ├── SubjectNavigation
        ├── LearningConversation
        ├── LearningContextDrawer
        │   ├── CurrentObjective
        │   ├── LearningJourneyPanel
        │   └── SkillTreePreview
        └── SessionTimePicker
```

`CompanionWorkspace` is a new, separately scoped surface in the existing React shell. The legacy controller owns only bridge functions and compatibility state; it does not decide tutor strategy. New styles are scoped under a Companion root to avoid existing broad `.chat-message`, `.history-list`, and Focus Room selectors.

On desktop, the conversation is primary and the context drawer is optional. On smaller screens, the drawer becomes a tab or overlay. The learner can always see the active subject, current objective, and one next action without requiring a permanent three-column layout.

### Interaction states

- Empty: intent picker, examples, and an input.
- Diagnosing: concise assistant question, with the conversation retained.
- Teaching: streamed response, lightweight source/provenance space reserved for future evidence mode, and one contextual next action.
- Checking: a single answerable prompt, not a generic quiz UI.
- Recovering: preserved user message with retry and continue-without-extra-context choices where applicable.
- Resuming: the prior session summary, active objective, and suggested next action.

No Phase 1 screen displays permanent generation-tool navigation. A contextual recommendation may be represented in the tutor decision data but is not rendered unless the referenced tool is implemented and appropriate for Companion mode.

## Persistent data model

All new tables are additive and user-owned. JSON is used only for bounded structured payloads; relationship-bearing data is normalized.

### `learner_profiles`

| Field | Purpose |
|---|---|
| `id`, `user_id` | Stable profile identity and ownership |
| `memory_enabled` | Controls long-term preference storage |
| `preferences_json` | Explanation depth, preferred activity formats, and stated learning preferences |
| `updated_at` | Transparent memory recency |

### `learning_subjects`

| Field | Purpose |
|---|---|
| `id`, `user_id` | Subject identity and ownership |
| `title`, `intention`, `goal` | Learner-facing subject identity and purpose |
| `status` | Active, paused, completed, or archived |
| `current_session_id`, `current_unit_id` | Fast Continue Learning resolution |
| `summary` | Compact durable subject summary, not raw chat history |
| `created_at`, `updated_at` | Ordering and recency |

### `learning_sessions` and `learning_messages`

Sessions represent a returnable study episode. Messages are ordered durable turns.

`learning_sessions` stores `subject_id`, `available_time_minutes`, `active_objective`, `status`, `summary`, and timestamps.

`learning_messages` stores `session_id`, `sequence`, `role`, `content`, `turn_status`, `idempotency_key`, `decision_json`, and timestamps. Roles are limited to `user` and `assistant`; client-provided system messages are rejected.

### `learning_journeys` and `learning_units`

Journeys preserve adaptive progression without treating a static outline as a course.

`learning_journeys` stores the subject relationship, goal, current state, and version.

`learning_units` stores position, title, objective, prerequisite references, status, confidence band, recommended next action, and a bounded evidence summary. Unit statuses are `not_started`, `exploring`, `learning`, `needs_practice`, `developing`, `understood`, `review_due`, and `mastered`.

### `skill_nodes` and `learning_evidence`

`skill_nodes` stores a stable subject-local concept key, label, parent, prerequisite references, and display order.

`learning_evidence` is append-only and stores the subject, optional session/unit/skill node, evidence type, concise observation, result, and source message. Valid evidence types are `explanation`, `practice`, `application`, `correction`, `recall`, and `self_report`.

Skill state is materialized from evidence, using the learner-facing values `unexplored`, `introduced`, `developing`, `practised`, `applied`, `reliable`, and `review_due`. A skill cannot become reliable solely because an assistant explained it.

## API design

### Express data API

New authenticated, ownership-checked routes:

```text
GET/POST   /api/learning/subjects
GET/PATCH  /api/learning/subjects/:subjectId
GET/POST   /api/learning/subjects/:subjectId/sessions
GET/POST   /api/learning/sessions/:sessionId/messages
GET/POST   /api/learning/subjects/:subjectId/journeys
PATCH      /api/learning/units/:unitId
GET/POST   /api/learning/subjects/:subjectId/skills
POST       /api/learning/evidence
GET/PATCH  /api/learning/profile
```

The API validates ownership at every parent relationship. It accepts caller-generated UUID-like IDs or generates one once before both Supabase and MySQL writes. It does not reuse browser storage keys as durable identities.

### FastAPI tutor API

Add a typed, Companion-specific endpoint:

```text
POST /learning/turn/stream
```

The request contains `subject_id`, `session_id`, `message`, `available_time_minutes`, an idempotency key, and optional explicit source attachments. FastAPI loads bounded context through the internal data API, makes the tutor decision, streams the answer, validates the final state patch, and persists the assistant result and learning updates through the data API.

Server-sent events are:

```text
turn_started
text_delta
state_patch
suggested_action
turn_complete
turn_error
```

The existing `/ask` endpoint remains unchanged for existing material workflows. Companion does not send client-built note summaries, raw old history, or arbitrary system roles as authority.

### Tutor decision contract

The model produces a validated internal decision before response generation. It includes:

```text
intent
learning_intention
active_objective
response_strategy
needs_diagnosis
needs_understanding_check
needs_uploaded_retrieval
needs_web_research
journey_patch
evidence_candidates
memory_candidates
suggested_action
```

The contract is application data, not user-visible model reasoning. Invalid patches are rejected or reduced to a safe no-update result rather than corrupting learner state.

## Prompt isolation and research policy

Companion prompts live in `backend/prompts/learning_companion/` and are composed from a shared identity, teaching behaviour, memory policy, evidence policy, one intention prompt, and one action prompt. They are built independently from note-generation prompt modes.

Phase 1 defines `needs_web_research`, `needs_uploaded_retrieval`, `source_policy`, and `citation_required` in the decision contract, but does not expose unreliable research. Existing behaviour that searches DuckDuckGo for every non-strict tutor question is not reused.

The next evidence phase will add conditional research, authority ranking, source cards, claim-to-source links, conflict handling, and uploaded-source retrieval. Until then, Companion either answers stable concepts directly or clearly states when current or source-specific evidence is unavailable.

## Error handling and recovery

- Persist the user message before model work with an idempotency key.
- Mark a failed assistant turn without deleting the user message or prior state.
- Retry reuses the same turn identity and does not duplicate messages or evidence.
- A disconnected stream preserves completed text only after a validated `turn_complete`; otherwise the UI offers retry.
- A mode switch does not abort a valid Companion turn. Navigation away may hide the surface but does not clear its session.
- Invalid state patches, unavailable data API calls, and context-budget overflows become understandable retryable errors.
- Context includes a bounded recent message window plus selected subject summary, active objective, relevant evidence, and learner preferences. Exact formulas, assessment instructions, and source excerpts are not replaced by vague summaries when they are explicitly attached.

## Database migration approach

1. Add matching MySQL and Supabase schema definitions for the seven new learning tables.
2. Add repository normalizers and authenticated routes before connecting the UI.
3. Use explicit stable IDs for every mirrored write.
4. Do not migrate historical local chats, paths, quizzes, or mastery data in Phase 1; preserve them in their existing material workflow.
5. Do not change or remove existing generated-content, flashcard, broadcast, progress, or Focus Room tables.

This avoids conflating the Companion foundation with the larger future unified-learning-object migration.

## Verification strategy

### Backend and persistence tests

- Subject, session, message, journey, skill, evidence, and profile ownership checks.
- Supabase/MySQL normalization receives identical caller-generated IDs.
- Duplicate idempotency key does not create duplicate user or assistant turns.
- Invalid role, oversized context, and unowned IDs are rejected.
- Assistant failure leaves the learner's previous state and user message intact.

### Tutor-quality fixtures

- A beginner hobby goal asks one useful starting question rather than producing a long article.
- A learner with known prerequisites is not restarted at the beginning.
- An incorrect learner explanation records a meaningful misconception and gives guided correction.
- A five-minute session contains one objective, an example, and one understanding check.
- A one-off shorter time change does not rewrite the full journey; an explicitly permanent change can.
- Each learning intention produces distinct priorities and next actions.

### Frontend tests

- Mode switch preserves material input and Companion draft/session state.
- Keyboard navigation, focus visibility, reduced motion, and mobile drawer behaviour.
- Continue Learning opens the correct subject, session, unit, and suggested next action.
- Stream interruption and retry do not duplicate messages.
- Existing material analysis and current prompt modes remain unaffected.

## Phase 1 acceptance criteria

Phase 1 is complete when a user can start a hobby, skill, project, or assessment subject; receive a conversational diagnosis; choose available time; learn through a persistent subject session; return to the exact next action; see a basic adaptive journey and evidence-backed skill state; and switch safely between Companion and Upload experiences.

The implementation will preserve current theme colours, avoid Focus Room changes, and leave existing resource generators available only in their current workflows until their learning-specific redesign is built.
