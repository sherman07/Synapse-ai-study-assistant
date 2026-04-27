const API_BASE = "http://127.0.0.1:8000";

let sections = {};
let fullSummary = "";
let selectedSection = "";
let chatHistory = [];
let assistantExpanded = false;
let visitedSections = new Set();
let questionsAsked = 0;
let wordsGenerated = 0;
let connectionsData = [];

// DOM refs
const pdfUpload        = document.getElementById("pdfUpload");
const sectionsContainer= document.getElementById("sections");
const summaryContent   = document.getElementById("summaryContent");
const sectionTitle     = document.getElementById("sectionTitle");
const loadingBox       = document.getElementById("loadingBox");
const chatMessages     = document.getElementById("chatMessages");
const questionInput    = document.getElementById("questionInput");
const assistant        = document.getElementById("assistant");
const openAssistantBtn = document.getElementById("openAssistant");
const contextLabel     = document.getElementById("contextLabel");

// ─── UPLOAD ────────────────────────────────────────────────────────────────

async function uploadPDF() {
  const file = pdfUpload.files[0];
  if (!file) { showAlert("Please upload a PDF first."); return; }

  const formData = new FormData();
  formData.append("file", file);
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/upload-pdf`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Failed to generate notes.");

    const data = await response.json();

    fullSummary      = data.summary   || "";
    sections         = data.sections  || {};
    connectionsData  = data.connections || [];
    wordsGenerated  += fullSummary.split(/\s+/).length;

    renderSections();
    showFullSummary();
    renderConnections();
    updateProgress();

  } catch (error) {
    console.error(error);
    showAlert("Something went wrong. Check your backend server and API key.");
  } finally {
    setLoading(false);
  }
}

// ─── SECTIONS ──────────────────────────────────────────────────────────────

function renderSections() {
  sectionsContainer.innerHTML = "";
  const titles = Object.keys(sections);

  if (titles.length === 0) {
    sectionsContainer.innerHTML = `<div class="text-secondary small">No sections generated yet.</div>`;
    return;
  }

  titles.forEach(title => {
    const btn = document.createElement("button");
    btn.className = "section-btn";
    btn.innerHTML = `<i class="bi bi-chevron-right me-2"></i>${title}`;

    btn.onclick = () => {
      selectedSection = title;
      sectionTitle.innerText = title;
      contextLabel.textContent = title.length > 22 ? title.slice(0, 22) + "…" : title;

      document.querySelectorAll(".section-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      summaryContent.innerHTML = markdownToHTML(sections[title]);

      visitedSections.add(title);
      updateProgress();
    };

    sectionsContainer.appendChild(btn);
  });
}

function showFullSummary() {
  selectedSection = "";
  sectionTitle.innerText = "Generated Study Notes";
  contextLabel.textContent = "Current Notes";

  document.querySelectorAll(".section-btn").forEach(b => b.classList.remove("active"));

  if (!fullSummary) {
    summaryContent.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-file-earmark-text"></i>
        <h3>No notes generated yet</h3>
        <p>Upload a PDF and click "Generate Notes".</p>
      </div>`;
    return;
  }

  summaryContent.innerHTML = markdownToHTML(fullSummary);
}

// ─── CONNECTIONS ───────────────────────────────────────────────────────────

function renderConnections() {
  const emptyEl = document.getElementById("connectionsEmpty");
  const listEl  = document.getElementById("connectionsList");

  if (!connectionsData || connectionsData.length === 0) {
    emptyEl.classList.remove("d-none");
    listEl.classList.add("d-none");
    return;
  }

  emptyEl.classList.add("d-none");
  listEl.classList.remove("d-none");
  listEl.innerHTML = "";

  connectionsData.forEach(conn => {
    const card = document.createElement("div");
    card.className = "connection-card";

    const fromShort = conn.from.length > 24 ? conn.from.slice(0, 24) + "…" : conn.from;
    const toShort   = conn.to.length > 24   ? conn.to.slice(0, 24)   + "…" : conn.to;

    card.innerHTML = `
      <div class="connection-nodes">
        <span class="connection-node" title="${conn.from}">${fromShort}</span>
        <span class="connection-arrow"><i class="bi bi-arrow-right"></i></span>
        <span class="connection-node" title="${conn.to}">${toShort}</span>
      </div>
      <div class="connection-label">${conn.label}</div>
      <div class="connection-desc">${conn.description}</div>
    `;

    // Clicking a connection card asks the AI about the link
    card.onclick = () => {
      switchTab("chat", document.querySelector('.asst-tab[onclick*="chat"]'));
      const q = `Explain the connection between "${conn.from}" and "${conn.to}" — specifically: ${conn.label}.`;
      questionInput.value = q;
      askAI();
    };

    listEl.appendChild(card);
  });
}

// ─── PROGRESS ──────────────────────────────────────────────────────────────

function updateProgress() {
  document.getElementById("statSections").textContent    = Object.keys(sections).length || "—";
  document.getElementById("statConnections").textContent = connectionsData.length || "—";
  document.getElementById("statQuestions").textContent   = questionsAsked || "—";
  document.getElementById("statWords").textContent       = wordsGenerated > 0
    ? wordsGenerated.toLocaleString() : "—";

  const listEl = document.getElementById("sectionProgress");
  const titles = Object.keys(sections);

  if (titles.length === 0) {
    listEl.innerHTML = `<p class="text-muted small px-2">No sections yet. Upload a PDF to begin.</p>`;
    return;
  }

  listEl.innerHTML = titles.map(t => `
    <div class="section-progress-item">
      <span class="section-progress-dot ${visitedSections.has(t) ? "visited" : ""}"></span>
      ${t}
    </div>
  `).join("");
}

// ─── CHAT ──────────────────────────────────────────────────────────────────

async function askAI() {
  const question = questionInput.value.trim();
  if (!question) return;

  addMessage("user", question);
  questionInput.value = "";
  questionsAsked++;
  updateProgress();

  // Typing indicator
  const typingId = addTypingIndicator();

  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        selected_section: selectedSection,
        chat_history: chatHistory.slice(-6).map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text
        }))
      })
    });

    removeTypingIndicator(typingId);

    if (!response.ok) throw new Error("AI request failed.");

    const data = await response.json();
    const answer = data.answer || "No answer returned.";

    addMessage("assistant", answer);
    wordsGenerated += answer.split(/\s+/).length;
    updateProgress();

  } catch (error) {
    removeTypingIndicator(typingId);
    console.error(error);
    addMessage("assistant", "Error: Could not connect to the AI backend.");
  }
}

function quickAsk(question) {
  questionInput.value = question;
  askAI();
}

function addMessage(role, text) {
  removeAssistantEmptyState();
  chatHistory.push({ role, text });

  const div = document.createElement("div");
  div.className = `chat-message ${role}`;
  div.innerHTML = `
    <strong>${role === "user" ? "You" : "Synapse"}</strong>
    <div>${markdownToHTML(text)}</div>
  `;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
  const id = "typing-" + Date.now();
  const div = document.createElement("div");
  div.id = id;
  div.className = "chat-message assistant";
  div.innerHTML = `
    <strong>Synapse</strong>
    <div style="display:flex;gap:4px;align-items:center;padding:4px 0;">
      <span style="width:7px;height:7px;border-radius:50%;background:var(--primary);animation:typing-bounce 0.9s infinite 0s"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:var(--primary);animation:typing-bounce 0.9s infinite 0.15s"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:var(--primary);animation:typing-bounce 0.9s infinite 0.3s"></span>
    </div>`;

  if (!document.getElementById("typing-style")) {
    const style = document.createElement("style");
    style.id = "typing-style";
    style.textContent = `@keyframes typing-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`;
    document.head.appendChild(style);
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function removeAssistantEmptyState() {
  const empty = chatMessages.querySelector(".assistant-empty");
  if (empty) empty.remove();
}

function clearChat() {
  chatHistory = [];
  chatMessages.innerHTML = `
    <div class="assistant-empty">
      <i class="bi bi-chat-dots"></i>
      <p>Ask questions about your generated notes.</p>
    </div>`;
}

// ─── TABS ──────────────────────────────────────────────────────────────────

function switchTab(tabName, clickedBtn) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".asst-tab").forEach(b => b.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).classList.add("active");
  if (clickedBtn) clickedBtn.classList.add("active");
}

// ─── PANEL CONTROLS ────────────────────────────────────────────────────────

function closeAssistant() {
  const layout = document.querySelector(".app-layout");
  assistant.classList.add("hidden");
  layout.classList.add("assistant-closed");
  openAssistantBtn.style.display = "block";
}

function openAssistant() {
  const layout = document.querySelector(".app-layout");
  assistant.classList.remove("hidden");
  layout.classList.remove("assistant-closed");
  openAssistantBtn.style.display = "none";
}

function expandAssistant() {
  assistantExpanded = !assistantExpanded;
  assistant.classList.toggle("expanded", assistantExpanded);
}

function setLoading(isLoading) {
  loadingBox.classList.toggle("d-none", !isLoading);
  summaryContent.classList.toggle("d-none", isLoading);
}

function showAlert(message) { alert(message); }

// ─── MARKDOWN ──────────────────────────────────────────────────────────────

function markdownToHTML(text) {
  if (!text) return "";

  let html = escapeHTML(text);
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim,  "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim,   "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g,     "<em>$1</em>");
  html = html.replace(/^- (.*$)/gim,   "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ─── KEYBOARD ──────────────────────────────────────────────────────────────

questionInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    askAI();
  }
});