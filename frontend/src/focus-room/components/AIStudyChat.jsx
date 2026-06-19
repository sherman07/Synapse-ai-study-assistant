import { useState } from "react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { GlassButton } from "./GlassButton.jsx";

const EXAMPLE_PROMPTS = [
  "Explain this topic more simply.",
  "Test me on this section.",
  "What should I study next?"
];

export function AIStudyChat() {
  const [draft, setDraft] = useState("");
  const assistantContext = useFocusRoomStore(state => state.assistantContext);
  const chatMessages = useFocusRoomStore(state => state.chatMessages);
  const chatPending = useFocusRoomStore(state => state.chatPending);
  const chatError = useFocusRoomStore(state => state.chatError);
  const askAssistant = useFocusRoomStore(state => state.askAssistant);

  const ask = question => {
    askAssistant(question);
    setDraft("");
  };

  return (
    <article className="chat-panel">
      {assistantContext.sectionTitle || assistantContext.excerpt ? (
        <div className="chat-context-card liquid-glass-lite">
          <span className="focus-kicker">Current focus</span>
          <strong>{assistantContext.sectionTitle || "Selected excerpt"}</strong>
          {assistantContext.excerpt ? <p>{assistantContext.excerpt.slice(0, 240)}</p> : null}
        </div>
      ) : null}
      <div className="chat-list">
        {chatMessages.length ? chatMessages.map((message, index) => (
          <div className={`chat-message ${message.role}`} key={`${message.createdAt}-${index}`}>
            <span className="focus-kicker">{message.role === "user" ? "You" : "Synapse"}</span>
            <p>{message.text}</p>
          </div>
        )) : <p>Try: Explain this topic more simply.</p>}
        {chatPending ? (
          <div className="chat-message assistant">
            <span className="focus-kicker">Synapse</span>
            <p>Thinking...</p>
          </div>
        ) : null}
      </div>
      {chatError ? <p className="audio-error">{chatError}</p> : null}
      <textarea
        className="answer-input"
        placeholder="Ask about this material..."
        value={draft}
        onChange={event => setDraft(event.target.value)}
      />
      <div className="focus-button-row">
        <GlassButton variant="primary" disabled={chatPending || !draft.trim()} onClick={() => ask(draft)}>Ask</GlassButton>
        {EXAMPLE_PROMPTS.map(prompt => (
          <GlassButton key={prompt} disabled={chatPending} onClick={() => ask(prompt)}>{prompt}</GlassButton>
        ))}
      </div>
    </article>
  );
}
