import { React, h, icon } from "../runtime.js";
import {
  appendLearningCompanionMessage,
  createLearningCompanionThread,
  loadLearningCompanionThread,
  resetLearningCompanionThread,
  saveLearningCompanionThread,
} from "../../legacy/learningCompanionChatStore.js?v=ai-learning-companion-v1";
import { requestLearningCompanionDecision } from "../../legacy/learningCompanionClient.js?v=ai-learning-companion-v1";

const MAX_CONTEXT_MESSAGES = 24;
const WELCOME_MESSAGE = {
  id: "assistant-welcome",
  role: "assistant",
  content: "Hi, I’m Synapse. Tell me what you want to learn, what’s confusing, or what you’re trying to finish, and we’ll work through the next step together.",
};

function createMessageId(prefix = "message") {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}-${uuid || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`;
}

function getLocalStorage() {
  return globalThis.localStorage;
}

function focusComposer(ref) {
  const run = () => ref.current?.focus();
  if (typeof globalThis.requestAnimationFrame === "function") {
    globalThis.requestAnimationFrame(run);
    return;
  }
  globalThis.setTimeout?.(run, 0);
}

function toConversation(messages = []) {
  return messages.slice(-MAX_CONTEXT_MESSAGES).map(message => ({
    role: message.role,
    content: message.content,
  }));
}

function sourceCountText(decision) {
  const count = Array.isArray(decision?.research_sources) ? decision.research_sources.length : 0;
  return count ? `Used ${count} current source${count === 1 ? "" : "s"}.` : "This answer needed current sources, but none were available.";
}

function messageBubble(message) {
  const isLearner = message.role === "user";
  return h(
    "article",
    {
      key: message.id || `${message.role}-${message.content}`,
      className: `companion-message ${isLearner ? "companion-message-user" : "companion-message-assistant"}`,
    },
    h("p", { className: "companion-message-role" }, isLearner ? "You" : "Synapse"),
    h("p", null, message.content),
    !isLearner && message.decision?.requires_research
      ? h("p", { className: "companion-message-research" }, sourceCountText(message.decision))
      : null,
  );
}

export function CompanionWorkspace() {
  const composerRef = React.useRef(null);
  const [thread, setThread] = React.useState(() => loadLearningCompanionThread(getLocalStorage()));
  const [draft, setDraft] = React.useState("");
  const [pendingMessage, setPendingMessage] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState("");

  React.useEffect(() => {
    setThread(loadLearningCompanionThread(getLocalStorage()));
    focusComposer(composerRef);
  }, []);

  const visibleMessages = thread.messages.length ? thread.messages : [WELCOME_MESSAGE];

  const persistThread = React.useCallback(nextThread => {
    saveLearningCompanionThread(nextThread, getLocalStorage());
    setThread(nextThread);
    return nextThread;
  }, []);

  const handleTutorReply = React.useCallback(async learnerMessage => {
    const activeThread = loadLearningCompanionThread(getLocalStorage());
    const history = toConversation(activeThread.messages);
    const decision = await requestLearningCompanionDecision({
      message: learnerMessage.content,
      messages: history,
    });
    const assistantMessage = {
      id: createMessageId("assistant"),
      role: "assistant",
      content: decision?.reply || "Synapse could not reply right now.",
      decision,
    };
    persistThread(appendLearningCompanionMessage(activeThread, assistantMessage));
    setPendingMessage(null);
    setFailure("");
    focusComposer(composerRef);
  }, [persistThread]);

  const sendDraft = React.useCallback(async () => {
    const content = draft.trim();
    if (!content || busy) return;

    const learnerMessage = {
      id: createMessageId("user"),
      role: "user",
      content,
    };

    setBusy(true);
    setFailure("");
    setPendingMessage(null);

    try {
      const nextThread = appendLearningCompanionMessage(thread, learnerMessage);
      persistThread(nextThread);
      setDraft("");
      setPendingMessage(learnerMessage);
      await handleTutorReply(learnerMessage);
    } catch (error) {
      setPendingMessage(learnerMessage);
      setFailure(error?.message || "Synapse could not reply right now.");
      focusComposer(composerRef);
    } finally {
      setBusy(false);
    }
  }, [busy, draft, handleTutorReply, persistThread, thread]);

  const handleSend = async event => {
    event.preventDefault();
    await sendDraft();
  };

  const handleComposerKeyDown = event => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void sendDraft();
  };

  const handleRetry = async () => {
    if (!pendingMessage || busy) return;
    setBusy(true);
    setFailure("");
    try {
      await handleTutorReply(pendingMessage);
    } catch (error) {
      setFailure(error?.message || "Synapse could not reply right now.");
      focusComposer(composerRef);
    } finally {
      setBusy(false);
    }
  };

  const handleNewChat = () => {
    if (busy) return;
    const confirmReset = typeof globalThis.window?.confirm === "function"
      ? globalThis.window.confirm("Start a new chat? Your current local conversation will be cleared.")
      : true;
    if (!confirmReset) return;
    const nextThread = resetLearningCompanionThread(createLearningCompanionThread(), getLocalStorage());
    setThread(nextThread);
    setDraft("");
    setPendingMessage(null);
    setFailure("");
    focusComposer(composerRef);
  };

  return h(
    "section",
    { id: "companionWorkspace", className: "companion-workspace", "aria-labelledby": "companionWorkspaceTitle" },
    h(
      "div",
      { className: "companion-workspace-card companion-chat" },
      h(
        "div",
        { className: "companion-session-meta" },
        h(
          "div",
          null,
          h("p", { className: "learning-mode-switcher-eyebrow" }, "Learning companion"),
          h("h1", { id: "companionWorkspaceTitle" }, "Synapse"),
          h("p", { className: "companion-workspace-intro" }, "A local-first conversation workspace for focused tutoring."),
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn btn-outline-primary",
            onClick: handleNewChat,
            disabled: busy,
            "data-learning-companion-new-chat": "true",
          },
          "New chat",
        ),
      ),
      h(
        "div",
        { className: "companion-messages companion-chat-thread", "aria-live": "polite" },
        visibleMessages.map(messageBubble),
        failure
          ? h(
            "div",
            { className: "companion-status companion-status-error companion-turn-failure", role: "alert" },
            h("p", null, failure),
            h(
              "button",
              {
                type: "button",
                className: "btn btn-outline-primary",
                onClick: handleRetry,
                disabled: busy || !pendingMessage,
                "data-learning-companion-retry": "true",
              },
              busy ? "Retrying…" : "Retry",
            ),
          )
          : null,
      ),
      h(
        "form",
        { className: "companion-compose companion-composer", onSubmit: handleSend },
        h("label", { className: "visually-hidden", htmlFor: "companionMessage" }, "Message Synapse"),
        h("textarea", {
          id: "companionMessage",
          ref: composerRef,
          value: draft,
          onChange: event => setDraft(event.target.value),
          onKeyDown: handleComposerKeyDown,
          placeholder: "Ask a question, describe your goal, or paste what you want help understanding…",
          disabled: busy,
          rows: 4,
        }),
        h(
          "button",
          {
            type: "submit",
            className: "btn btn-primary",
            disabled: busy || !draft.trim(),
            "data-learning-companion-send": "true",
          },
          busy ? "Thinking…" : h(React.Fragment, null, icon("bi-send", "me-2"), "Send"),
        ),
      ),
    ),
  );
}
