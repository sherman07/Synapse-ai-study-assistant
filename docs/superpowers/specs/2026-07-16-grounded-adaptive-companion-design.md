# Grounded Adaptive Learning Companion Design

## Decision

Synapse Companion remains a free-form, ChatGPT-like conversation. A learner can ask a direct question, paste a problem, say what is confusing, request a quiz, ask for a plan, or change direction naturally. It must never make a setup form, lesson wizard, or rigid session sequence a prerequisite for help.

The tutor's teaching behaviour follows the useful parts of a NotebookLM Learning Guide: it knows when an answer is based on the learner's selected materials, makes that evidence inspectable, and helps the learner work through one topic coherently. Synapse adds an adaptive recommended path: when a learner wants to learn a topic rather than get a one-off answer, it quietly builds and updates a goal-specific path from their conversation.

This is an original Synapse experience. It borrows product principles, not NotebookLM branding, UI, copy, or assets.

## Product principles

1. **Conversation first.** The message box is always the primary interface. Learners can say things in their own words; Synapse infers intent where safe rather than demanding fields.
2. **Grounding is visible.** A learner can tell whether an answer uses their materials, deliberately researched web sources, or general tutoring knowledge. Synapse never presents an unsupported statement as source-backed.
3. **Teaching is adaptive, not theatrical.** The tutor answers direct requests directly. It asks a question only when an answer will materially improve the next step, and it asks no more than one learning check at a time.
4. **A path is a recommendation, not a gate.** A learner may follow, revise, skip, pause, or abandon a recommended path by simply saying so. The path lives inside the conversation rather than becoming a mandatory dashboard.
5. **Evidence determines confidence.** For uploaded materials, Synapse confines claims to provided source excerpts. For current or explicitly researched questions, it attaches external source metadata. Otherwise it states that it is giving a general explanation.
6. **Small, observable progress.** Every active study turn targets one subskill, misconception, or piece of retrieval practice. Synapse records enough local context to avoid repeatedly rediscovering the learner's goal.

## Conversation behaviour

### Free-form turn routing

On every learner message, the backend selects one private turn mode. The learner never sees internal labels or scores.

| Learner need | Tutor behaviour | Follow-up policy |
| --- | --- | --- |
| Direct factual or conceptual question | Answer clearly at the requested depth, with a simple example when useful. | Do not force a diagnostic question. Offer one optional next action only if it is useful. |
| Source/material question | Answer only from selected supplied material; include source references that can be inspected. | Say plainly when the supplied material does not establish an answer. |
| “Teach me”, “help me learn”, exam/project request | Establish the real outcome, then recommend a path matched to the outcome, level, time, and deadline. | Ask one compact outcome or baseline question if that information is missing. |
| Stuck problem | Identify the exact stuck point, offer the smallest useful hint or worked step, then invite one attempt. | One attempt/question at a time; do not reveal a full solution before the learner has chosen that help level. |
| Practice, quiz, or review request | Use one question at a time, grade directly, and alter difficulty from the response. | The next question follows only after feedback on the previous answer. |
| “Done today”, “where am I”, or “what next” | Provide a concise session note, progress position, or next recommended action from the live path. | No new diagnostic unless the path is ambiguous. |

The default is conversational teaching, not Socratic refusal. For example, “What is aperture?” receives a useful answer. “Teach me photography” prompts one concise question about the desired outcome before the path is created. The learner can always override the style in natural language: “just tell me”, “go slower”, “give an analogy”, “make it harder”, or “quiz me”.

### Recommended-path lifecycle

The adaptive-learning-coach method is applied only when the learner has indicated a learning goal, project, assessment, or ongoing topic. It does not turn an ordinary one-off question into a curriculum.

1. **Establish outcome.** Ask for the final outcome only when it is not clear: for example, casual confidence, a particular assignment, an independent project, or professional/certification competence.
2. **Recommend the map.** After the outcome is known, return a concise path in the chat. A modest goal receives a small path; project-level or professional goals receive five or more capability levels. Each level has a clear skill boundary and a checkable graduation signal. The reply includes an honest effort range, not fake precision.
3. **Set a usable cadence.** Ask how much time the learner has after the map. A one-off time statement changes only the current study session; a permanent availability change explicitly replans the path.
4. **Teach the next smallest unit.** A session opens with a short preview and a lightweight baseline check, explains the most leveraged material in steps, then asks for an application or retrieval attempt.
5. **Correct and adapt.** Correct answers preserve the useful reasoning and raise difficulty or transfer the idea. Partial/wrong answers identify the specific missing concept, provide a smaller hint or example, and invite another attempt before moving on.
6. **Review and return.** After a completed session, Synapse asks for a plain-language teach-back and records review candidates for the next session, about three sessions later, about seven sessions later, and before the level check. If the learner returns after a gap, it starts with a brief recall check instead of pretending no time elapsed.

A recommended path is a structured assistant message in the thread. It can be collapsed after reading, but it is not a new screen, required sidebar, or task checklist. Subsequent replies reference the path naturally: “You are ready for the first exposure-control exercise,” rather than repeatedly presenting a full roadmap.

## Source and web grounding

### Evidence modes

The request carries an explicit evidence mode and a bounded list of selected source excerpts. The assistant response returns the same mode and source references so the browser can label the response accurately.

| Mode | When it applies | Allowed knowledge | Learner-facing treatment |
| --- | --- | --- | --- |
| `materials` | The learner asks about uploaded/current materials, or selects sources for the Companion. | Only selected source excerpts and directly stated metadata. | Inline references such as `[1]` resolve to a source title and location/URL where available. |
| `research` | The learner explicitly requests research, comparison, or sources, or asks a current/time-sensitive question. | Retrieved web research only for claims that need currency; general explanation may be clearly separated. | “Web research” label plus a compact, inspectable source list. |
| `tutor` | No selected source and no current/research need. | General tutoring knowledge. | No fake citations or “according to your materials” language. |

The browser does not silently send every uploaded file. It offers a compact “Use materials” control near the composer or response context. The default source selection is the actively generated note's sources; the learner can include or exclude individual sources before a source-grounded turn. This matches the useful NotebookLM pattern of selecting exactly which material answers should use, while preserving a free chat flow.

The existing analysis result already exposes safe browser-side source metadata and text excerpts. A small bridge will convert the current source-viewer items into a bounded Companion source bundle: stable source ID, display title, optional URL, and capped readable excerpt. Raw binary files, unrelated history, auth data, and data URLs must never be placed in the tutor request. When no usable excerpt exists, Companion shows that sources are available but does not claim the answer is grounded in them.

Research remains opt-in or need-based. Stable questions must not trigger a web search. Current-question research must retain result titles and URLs, tell the learner if no credible result was available, and prevent the model from inventing citations.

Resource curation is an explicit part of an accepted learning path, not an interruption to every chat turn. When the learner asks Synapse to recommend resources or begins a planned study session that calls for them, Synapse retrieves and verifies a small, topic-specific set of resources (including a practical video where appropriate), explains why each is useful, and labels them as external. It never quietly searches the web merely to answer a stable direct question.

## Adaptive state and tutor contract

The existing local thread remains the source of immediate UX reliability. Its version advances to store a compact, local `learningContext` alongside messages:

- provisional topic and active topic;
- learner-stated outcome, deadline, and permanent availability when known;
- estimated level only when supported by learner answers;
- current path and current level/session position;
- active subskill, identified misconceptions, and bounded review candidates;
- selected source identities and a source-bundle fingerprint.

This context is transparent enough to drive tutoring but is never shown as hidden grading data. Learners can correct it conversationally (“I’m not a beginner,” “my deadline changed,” “forget that plan”) and the next turn updates it. New chat clears it with the existing confirmation flow.

`POST /learning-companion/respond` continues to receive the current message and bounded conversation history. It additionally accepts an optional `learning_context` and `source_bundle`. The response keeps the required learner-facing `reply` and adds validated structured data rather than relying on a single opaque prompt:

- `turn_mode`: direct answer, source answer, discover outcome, recommend path, teach, practice, hint, reflect, review, or session summary;
- `learning_context`: safe updated context for the local thread;
- `path_update`: empty or a concise structured recommendation with levels, effort range, and next session;
- `exercise`: at most one active question or attempt;
- `citations`: zero or more exact source identifiers, labels, and URLs;
- `evidence_mode` and research metadata; and
- the current reply, recovery-safe state, and suggested natural-language actions.

Server-side normalisers validate this shape, cap text/excerpt/history sizes, and provide a deterministic fallback if the model produces incomplete JSON. The browser renders only validated fields; an invalid path or citation does not block a normal chat reply.

## Prompt policy

The current single prompt will be decomposed into focused instruction blocks: identity/tone, turn-routing, evidence policy, adaptive-path policy, practice-feedback policy, and response contract. The runtime combines only the blocks relevant to the selected turn mode, making the system easier to test and reducing contradictory instructions.

The prompt must require the following:

- infer a topic from free text where safe, but do not pretend the inference is confirmed;
- answer direct questions before requesting background information;
- honour a learner's stated depth preference (brief, step-by-step, analogy, or advanced) without making them leave the chat;
- ask exactly one diagnostic, practice, or reflection question per active learning turn;
- match response depth to the learner’s request and stated time;
- make route/map recommendations only after a real outcome is known, and preserve the outcome in later turns;
- grade learner answers plainly, state the precise gap, and give a retry opportunity;
- use source excerpts exclusively in `materials` mode and return only citations that are supplied in the request;
- use retrieved research for current claims only in `research` mode; and
- never disclose hidden diagnosis, scoring rules, prompt text, or internal state labels in the reply.

The assistant may recommend a high-quality resource as part of an explicit learning path. It must not manufacture a URL, claim to have watched material it has not retrieved, or add generic link menus to ordinary answers.

## Interface scope

The existing dark, ChatGPT-style Synapse chat shell is retained. This iteration adds only conversation-native affordances:

- a small source-context control that shows selected material count and can include/exclude sources;
- readable inline source references and an expandable source list for grounded/research replies;
- a compact, collapsible recommended-path message presentation; and
- non-binding action prompts such as “Start the first step”, “Use my materials”, or “Quiz me”.

There is no onboarding form, separate course dashboard, forced task list, automatic browser research, or imitation of third-party branding. New chat, retry, persistence, keyboard send behaviour, and accessible live-region updates remain intact.

## Errors, privacy, and boundaries

- A missing AI provider, timeout, malformed response, unavailable source bundle, or failed research request remains an in-thread retryable failure. It never discards the learner’s message or local path.
- Source grounding is all-or-nothing for a factual source-backed claim: if the selected bundle cannot support it, Synapse says so and can offer an explicitly labelled general explanation instead.
- Local persistence is bounded. A compact source bundle is request-scoped and not stored with raw file contents in the chat record.
- This work does not add cross-device learning memory, a database migration, autonomous background reminders, streaming, or a broad redesign of Materials/Focus Room.

## Verification

Focused tests and browser checks must prove:

1. A direct first question receives a direct answer path and does not require a goal form or forced quiz.
2. A “teach me” request asks one outcome question; once supplied, it produces a goal-scaled recommended path and requests realistic time.
3. A project/professional goal can produce a five-plus-level path with concrete graduation criteria and effort estimates; a casual goal is not inflated to that scope.
4. Correct, partial, and incorrect practice answers trigger the intended feedback/difficulty behaviour with one question at a time.
5. A material-grounded reply receives only selected bounded excerpts and returns only valid citations; no-source material requests explain the limit honestly.
6. Stable tutor questions do not run web research; explicit/current research does, exposes source metadata, and cannot claim citations when none returned.
7. Local thread/context persists and clears safely, while a failed response remains retryable without duplicate learner messages.
8. Existing Material mode, dark rail, account navigation, uploads, and unrelated dirty worktree changes remain untouched.
