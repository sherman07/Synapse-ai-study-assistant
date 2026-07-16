import { React, h, icon } from "../runtime.js";
import { buildLearningJourney } from "../learningJourney.js?v=ai-learning-companion-v1";
import {
  appendLearningMessage,
  createLearningSession,
  createLearningSubject,
  createLearningEvidence,
  fetchLearningEvidence,
  fetchLearningMessages,
  fetchLearningSubjects,
  requestLearningCompanionDecision,
} from "../../legacy/learningCompanionClient.js?v=ai-learning-companion-v1";

const INTENTIONS = [
  ["hobby", "Explore a hobby"],
  ["skill", "Build a skill"],
  ["project", "Finish a project"],
  ["assessment", "Prepare for assessment"],
];

function turnKey(prefix = "turn") {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}-${uuid || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`;
}

function messageBubble(message) {
  const isLearner = message.role === "user";
  return h(
    "article",
    { key: message.id || `${message.role}-${message.sequence}`, className: `companion-message ${isLearner ? "companion-message-user" : "companion-message-assistant"}` },
    h("p", { className: "companion-message-role" }, isLearner ? "You" : "Synapse"),
    h("p", null, message.content),
    !isLearner && message.decision?.next_prompt
      ? h("p", { className: "companion-message-next" }, `Next: ${message.decision.next_prompt}`)
      : null,
    !isLearner && message.decision?.requires_research
      ? h("p", { className: "companion-message-research" }, message.decision.research_sources?.length ? `Used ${message.decision.research_sources.length} current source${message.decision.research_sources.length === 1 ? "" : "s"}.` : "This question needs current sources; none were available." )
      : null,
  );
}

function subjectOption(subject) {
  return h("option", { key: subject.id, value: subject.id }, subject.title);
}

function latestTutorText(messages) {
  const latest = [...messages].reverse().find(item => item.role === "assistant");
  return latest?.decision?.next_prompt || latest?.content || "";
}

export function CompanionWorkspace() {
  const [subjects, setSubjects] = React.useState([]);
  const [subject, setSubject] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [evidence, setEvidence] = React.useState([]);
  const [draft, setDraft] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [intention, setIntention] = React.useState("skill");
  const [availableTime, setAvailableTime] = React.useState(20);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadSubjects = React.useCallback(async () => {
    try {
      const items = await fetchLearningSubjects();
      setSubjects(items);
      if (!subject && items[0]) setSubject(items[0]);
    } catch (loadError) {
      setError(loadError.message || "Your learning subjects could not be loaded.");
    }
  }, [subject]);

  React.useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const openSubject = async nextSubject => {
    setError("");
    setSubject(nextSubject);
    const currentSession = nextSubject.currentSessionId ? { id: nextSubject.currentSessionId } : null;
    setSession(currentSession);
    if (!currentSession) {
      setMessages([]);
      try {
        setEvidence(await fetchLearningEvidence(nextSubject.id));
      } catch (loadError) {
        setError(loadError.message || "This learning evidence could not be loaded.");
      }
      return;
    }
    try {
      const [loadedMessages, loadedEvidence] = await Promise.all([
        fetchLearningMessages(currentSession.id),
        fetchLearningEvidence(nextSubject.id),
      ]);
      setMessages(loadedMessages);
      setEvidence(loadedEvidence);
    } catch (loadError) {
      setError(loadError.message || "This learning conversation could not be loaded.");
    }
  };

  const beginSession = async nextSubject => {
    const createdSession = await createLearningSession(nextSubject.id, { availableTimeMinutes: availableTime });
    const decision = await requestLearningCompanionDecision({
      subject: nextSubject,
      availableTimeMinutes: availableTime,
      messages: [],
      message: "",
    });
    const opening = await appendLearningMessage(createdSession.id, {
      role: "assistant",
      content: decision.reply,
      decision,
      idempotencyKey: `${createdSession.id}-opening`,
    });
    const updatedSubject = { ...nextSubject, currentSessionId: createdSession.id };
    setSubjects(previous => previous.map(item => item.id === nextSubject.id ? updatedSubject : item));
    setSubject(updatedSubject);
    setSession(createdSession);
    setMessages([opening]);
  };

  const handleCreate = async event => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Name the subject you want to learn first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await createLearningSubject({ title, goal, intention });
      setSubjects(previous => [created, ...previous]);
      setEvidence([]);
      await beginSession(created);
      setTitle("");
      setGoal("");
    } catch (createError) {
      setError(createError.message || "Synapse could not start this learning subject.");
    } finally {
      setBusy(false);
    }
  };

  const recordEvidence = async () => {
    if (!subject || busy) return;
    const latestTutor = [...messages].reverse().find(item => item.role === "assistant");
    setBusy(true);
    setError("");
    try {
      const item = await createLearningEvidence(subject.id, {
        sessionId: session?.id || null,
        evidenceType: "self_check",
        label: latestTutor?.decision?.next_prompt || `Self-check for ${subject.title}`,
        payload: { messageId: latestTutor?.id || null, intention: subject.intention },
      });
      setEvidence(previous => [item, ...previous]);
    } catch (evidenceError) {
      setError(evidenceError.message || "Synapse could not save that self-check.");
    } finally {
      setBusy(false);
    }
  };

  const journey = buildLearningJourney({ intention: subject?.intention, hasSession: Boolean(session), evidence });

  const handleSend = async event => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !subject || busy) return;
    setBusy(true);
    setError("");
    try {
      if (!session) {
        await beginSession(subject);
        return;
      }
      const learnerMessage = await appendLearningMessage(session.id, {
        role: "user",
        content,
        idempotencyKey: turnKey("learner"),
      });
      const history = [...messages, learnerMessage].map(item => ({ role: item.role, content: item.content }));
      setMessages(previous => [...previous, learnerMessage]);
      setDraft("");
      const decision = await requestLearningCompanionDecision({
        subject,
        availableTimeMinutes: availableTime,
        messages: history,
        message: content,
      });
      const tutorMessage = await appendLearningMessage(session.id, {
        role: "assistant",
        content: decision.reply,
        decision,
        idempotencyKey: turnKey("tutor"),
      });
      setMessages(previous => [...previous, tutorMessage]);
    } catch (sendError) {
      setError(sendError.message || "Synapse could not send that learning turn.");
    } finally {
      setBusy(false);
    }
  };

  return h(
    "section",
    { id: "companionWorkspace", className: "companion-workspace", "aria-labelledby": "companionWorkspaceTitle" },
    h(
      "div",
      { className: "companion-workspace-card" },
      h("p", { className: "learning-mode-switcher-eyebrow" }, "AI Learning Companion"),
      h("h1", { id: "companionWorkspaceTitle" }, subject ? subject.title : "What would you like to learn?"),
      h("p", { className: "companion-workspace-intro" }, subject ? "A continuing conversation that adapts to your goal, evidence, and available time." : "Start a learning thread and Synapse will guide the next small step—not hand you a generic resource dashboard."),
      error ? h("p", { className: "companion-status companion-status-error", role: "alert" }, error) : null,
      subjects.length > 0
        ? h("label", { className: "companion-subject-picker" }, "Continue learning", h("select", { value: subject?.id || "", onChange: event => openSubject(subjects.find(item => item.id === event.target.value) || null) }, subjects.map(subjectOption)))
        : null,
      !subject
        ? h(
          "form",
          { className: "companion-start-form", onSubmit: handleCreate },
          h("label", null, "Subject", h("input", { value: title, onChange: event => setTitle(event.target.value), placeholder: "e.g. Digital photography", disabled: busy, "data-learning-companion-create-subject": "true" })),
          h("label", null, "Why are you learning it?", h("select", { value: intention, onChange: event => setIntention(event.target.value), disabled: busy }, INTENTIONS.map(([value, label]) => h("option", { key: value, value }, label)))),
          h("label", null, "Goal (optional)", h("input", { value: goal, onChange: event => setGoal(event.target.value), placeholder: "e.g. Take sharper action photos", disabled: busy })),
          h("label", null, "Time available now", h("select", { value: availableTime, onChange: event => setAvailableTime(Number(event.target.value)), disabled: busy }, [5, 10, 20, 30, 45, 60].map(minutes => h("option", { key: minutes, value: minutes }, `${minutes} minutes`)))),
          h("button", { type: "submit", className: "btn btn-primary", disabled: busy }, busy ? "Starting…" : "Start learning"),
        )
        : h(
          "div",
          { className: "companion-session" },
          h("div", { className: "companion-session-meta" }, h("span", null, `${subject.intention} learning`), h("label", null, "Time now", h("select", { value: availableTime, onChange: event => setAvailableTime(Number(event.target.value)), disabled: busy }, [5, 10, 20, 30, 45, 60].map(minutes => h("option", { key: minutes, value: minutes }, `${minutes} min`))))),
          h("aside", { className: "companion-journey", "aria-label": "Learning journey" }, h("div", null, h("p", { className: "companion-journey-label" }, "Learning journey"), h("strong", null, evidence.length ? `${evidence.length} evidence ${evidence.length === 1 ? "check" : "checks"}` : "First evidence check"), h("p", null, latestTutorText(messages) || "Start a session to identify your next focused step.")), h("button", { type: "button", className: "btn btn-outline-primary", onClick: recordEvidence, disabled: busy, "data-learning-companion-record-evidence": "true" }, icon("bi-check2-circle", "me-2"), "I can explain this")),
          h("ol", { className: "companion-journey-stages" }, journey.map(stage => h("li", { key: stage.id, className: stage.complete ? "complete" : "" }, h("span", { "aria-hidden": "true" }, stage.complete ? "✓" : "•"), stage.label))),
          h("div", { className: "companion-messages", "aria-live": "polite" }, messages.length ? messages.map(messageBubble) : h("p", { className: "companion-empty" }, "Start this session when you are ready. Synapse will ask one useful first question.")),
          h("form", { className: "companion-compose", onSubmit: handleSend }, h("label", { className: "visually-hidden", htmlFor: "companionMessage" }, "Message Synapse"), h("textarea", { id: "companionMessage", value: draft, onChange: event => setDraft(event.target.value), placeholder: session ? "Write your answer or ask for help…" : "Start this session…", disabled: busy, rows: 3 }), h("button", { type: "submit", className: "btn btn-primary", disabled: busy, "data-learning-companion-send": "true" }, busy ? "Thinking…" : h(React.Fragment, null, icon("bi-send", "me-2"), session ? "Send" : "Begin session"))),
        ),
    ),
  );
}
