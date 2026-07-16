# Chat-First Learning Companion Design

## Decision

Replace the current Companion setup form with a conversational learning surface. It must feel like a focused ChatGPT conversation: a clear thread, assistant and learner messages, and a composer fixed at the bottom of the reading area. The adaptive-learning-coach skill governs the tutor's behaviour, but its fields and stages are never exposed as a learner-facing form.

This is a focused replacement of the Companion workspace. The existing Materials workflow, its uploaded sources, and the history sidebar remain available and unchanged.

## Learner experience

When the learner opens Companion, Synapse shows a short greeting and an empty message composer. There are no required subject, goal, intention, or time inputs. A learner can begin with any natural message, such as a topic, a question, an exam concern, or a project goal.

Synapse conducts discovery in ordinary language. It infers what it can from the message and asks at most one useful follow-up question at a time. It only asks about intention, prior knowledge, outcome, available time, or deadline when that information would improve the next response. It must answer a direct question directly instead of forcing a discovery sequence.

The tutor applies the skill's learning principles internally:

- establish the learner's real outcome and current level gradually;
- choose the smallest high-leverage next step;
- explain with a concrete example when useful;
- invite recall, teach-back, prediction, or a tiny application when an understanding check is useful;
- give feedback that preserves correct reasoning and targets the likely misconception;
- make time-sensitive claims only after current web research; and
- end normal turns with one clear next action.

The screen has only one persistent utility control: **New chat**. It starts a fresh local conversation after confirmation and never discards the active chat without that confirmation. It does not add a course dashboard, subject picker, learning journey card, quizzes, or permanent action chips.

## Interface

`CompanionWorkspace` becomes a full-height, single-column conversation card within the existing Synapse content area.

- Header: `Synapse` identity, `Learning companion` label, compact online/offline state, and New chat.
- Conversation: centered readable column, assistant messages aligned left, learner messages aligned right, timestamps omitted, and an accessible live region for new tutor content.
- Empty thread: one welcoming assistant message that makes it clear the learner can write freely.
- Composer: multiline text area at the bottom, send button, Enter-to-send and Shift+Enter for a newline, disabled only while a reply is in progress.
- Recovery: a failed reply leaves the learner's message visible and provides a concise retry button in the thread. It never replaces the screen with `Server error.`

The UI must work at desktop and narrow mobile widths. It must respect reduced-motion preferences and retain keyboard focus in the composer after sending or retrying.

## Conversation and persistence model

The browser owns the immediate chat experience. A local, versioned record stores the active thread as bounded user/assistant messages, a generated thread ID, and update time. The record is read synchronously enough to render a prior conversation without depending on the Express learning-record API.

The current Express learning API is optional enrichment rather than a prerequisite. Its unavailability must not block loading, starting, sending, retrying, or reopening a local chat. Existing server-side learning subjects are not rendered as a second navigation surface in this iteration.

Each new learner message is added to local state and persisted before requesting a reply. A successful assistant reply is then appended and persisted. A failed reply is represented as a retryable transient state, not an assistant message. New chat only replaces the stored thread after the learner confirms.

## Tutor API

The existing `POST /learning-companion/respond` endpoint remains the tutor endpoint, but accepts a chat-first request:

```json
{
  "message": "I want to learn photography",
  "messages": [{"role": "assistant", "content": "..."}],
  "availableTimeMinutes": null
}
```

`subject` is optional. For the first turns, the endpoint derives a provisional topic and learning intention from the conversation and produces a normal conversational reply. It returns the same compact tutor decision shape currently consumed by the client, including the reply, state, next prompt, and research metadata. It must never reject a valid first message because a subject title or intention was not preselected.

If an API key or provider is unavailable, the endpoint returns a clear error. The browser converts it into a retryable reply failure and keeps the learner's draft/history intact.

For requests with current, latest, or similarly time-sensitive language, the tutor uses the existing research path. Stable concepts do not trigger web research by default.

## Boundaries

The implementation keeps responsibilities narrow:

- `CompanionWorkspace` renders interaction state and delegates persistence/network calls.
- A chat client module reads/writes the versioned local thread and requests tutor turns.
- The FastAPI route validates chat-first input, derives safe defaults, and formats the adaptive tutor prompt.
- Companion-specific CSS is scoped to the workspace and does not change the Materials or Focus Room UI.

No new dependency, router, database migration, background job, streaming protocol, or generic dashboard is part of this replacement.

## Error handling

- Loading local chat must succeed even if all network services fail.
- Network, server, and malformed tutor replies show a short in-thread recovery message with Retry.
- Retrying resends the preserved learner message once; it does not duplicate it in local history.
- An empty or whitespace-only message is not sent.
- A request in progress cannot be sent again; the learner can continue editing only after it resolves or fails.

## Verification

Automated tests cover:

- rendering the chat-first empty state without the legacy setup form;
- local thread save, reload, reset, and bounded history behaviour;
- sending a first free-text message without a subject payload;
- FastAPI acceptance of the chat-first request and retention of validation for malformed messages;
- retry state without duplicate learner messages; and
- DOM/CSS regression checks for composer controls, New chat, and absence of legacy form labels.

Build and focused frontend/backend test commands must pass. A visual browser check verifies the deployed layout exposes the Companion switch, chat composer, New chat control, and retry treatment at a desktop viewport.
