import { html } from "../html.js";

export function AssistantPanel() {
  return html`
    <aside id="assistant" class="assistant-panel hidden-before-analysis">
      <div class="assistant-header">
        <button class="icon-btn" title="New Chat" onclick="clearChat()"><i class="bi bi-plus-lg"></i></button>
        <div class="assistant-title">
          <span class="assistant-logo-dot"></span>
          <h4>Synapse Tutor</h4>
        </div>
        <div class="d-flex gap-2">
          <button class="icon-btn" title="Expand" onclick="expandAssistant()"><i class="bi bi-arrows-fullscreen"></i></button>
          <button class="icon-btn" title="Close" onclick="closeAssistant()"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>

      <div class="assistant-tabs">
        <button class="asst-tab active" onclick="switchTab('chat', this)"><i class="bi bi-chat-dots me-1"></i>Chat</button>
        <button class="asst-tab" onclick="switchTab('voice', this)"><i class="bi bi-mic me-1"></i>Voice</button>
        <button class="asst-tab" onclick="switchTab('connections', this)"><i class="bi bi-diagram-3 me-1"></i>Connections</button>
      </div>

      <div id="tab-chat" class="tab-panel active">
        <div id="chatMessages" class="chat-area">
          <div class="assistant-empty">
            <i class="bi bi-chat-dots"></i>
            <p>Ask questions about your generated notes.</p>
          </div>
        </div>
        <div class="quick-actions">
          <button class="btn btn-light quick-btn" onclick="quickAsk('Summarise my current notes clearly.')">Summarise</button>
          <button class="btn btn-light quick-btn" onclick="quickAsk('Explain the most difficult idea like a tutor.')">Explain concept</button>
          <button class="btn btn-light quick-btn" onclick="quickAsk('Challenge my understanding with tutorial questions.')">Challenge me</button>
        </div>
        <div class="assistant-input-card">
          <textarea id="questionInput" class="form-control" placeholder="Ask anything about your material..." rows="3"></textarea>
          <div class="input-toolbar">
            <span class="context-pill">
              <i class="bi bi-at"></i>
              <span id="contextLabel">Current Notes</span>
            </span>
            <button class="send-btn" onclick="askAI()" aria-label="Send message"><i class="bi bi-arrow-return-left"></i></button>
          </div>
        </div>
      </div>

      <div id="tab-voice" class="tab-panel">
        <div class="voice-tutor-panel">
          <div class="voice-tutor-status">
            <div>
              <span id="voiceTutorState" class="voice-state-pill">Ready</span>
              <h5>Voice Tutor</h5>
              <p id="voiceTutorDiagnosis">Start a spoken diagnostic session for the current notes.</p>
            </div>
            <div class="voice-mastery" aria-label="Voice tutor learning progress">
              <div class="voice-mastery-top">
                <span class="voice-mastery-label">Progress</span>
                <span id="voiceTutorMastery">0%</span>
              </div>
              <div class="voice-mastery-bar"><span id="voiceTutorMasteryFill"></span></div>
              <span id="voiceTutorProgressLabel" class="voice-mastery-caption">Ready to diagnose</span>
            </div>
          </div>

          <div id="voiceMessages" class="voice-chat-area">
            <div class="assistant-empty voice-empty">
              <i class="bi bi-mic"></i>
              <p>Start with what you already understand. Synapse will adapt the questions until you are ready.</p>
            </div>
          </div>

          <div id="voiceTutorActions" class="voice-actions">
            <button id="voiceRecordBtn" class="btn btn-primary voice-primary-btn" type="button" onclick="startVoiceTutorSession()">
              <i class="bi bi-telephone-fill me-1"></i>Start live tutor
            </button>
            <button id="voiceMuteBtn" class="btn btn-outline-primary voice-record-btn" type="button" onclick="toggleVoiceTutorMute()" disabled>
              <i class="bi bi-mic-mute me-1"></i>Mute mic
            </button>
            <button class="btn btn-light voice-small-btn" type="button" onclick="sendVoiceTutorText('I am stuck. Please give me a hint and a simpler question.')" disabled data-voice-requires-session>
              Hint
            </button>
          </div>

          <div class="voice-text-fallback">
            <textarea id="voiceTextInput" class="form-control" rows="2" placeholder="Type an answer if you cannot use the microphone..."></textarea>
            <button class="send-btn" type="button" onclick="sendVoiceTutorTypedAnswer()" aria-label="Send typed voice answer">
              <i class="bi bi-arrow-return-left"></i>
            </button>
          </div>

          <div class="voice-footer">
            <span class="voice-speak-toggle"><i class="bi bi-broadcast-pin"></i> GPT Realtime voice</span>
            <button class="btn btn-link voice-link-btn" type="button" onclick="resetVoiceTutorSession()">Reset voice tutor</button>
          </div>
        </div>
      </div>

      <div id="tab-connections" class="tab-panel">
        <div class="connections-panel">
          <div id="connectionsEmpty" class="assistant-empty">
            <i class="bi bi-diagram-3"></i>
            <p>Connections will appear after analysis.</p>
          </div>
          <div id="connectionsList" class="connections-list d-none"></div>
        </div>
      </div>
    </aside>
  `;
}

export function OpenAssistantButton() {
  return html`
    <button id="openAssistant" class="open-assistant-fab" onclick="openAssistant()" aria-label="Open Tutor">
      <i class="bi bi-chat-left-text me-2"></i>Open Tutor
    </button>
  `;
}
