const API_BASE = "http://127.0.0.1:8000";

let uploadedFiles = [];
let uploadedLinks = [];
let sections = {};
let fullSummary = "";
let selectedSection = "";
let chatHistory = [];
let assistantExpanded = false;
let connectionsData = [];

const appLayout = document.getElementById("appLayout");
const assetUpload = document.getElementById("assetUpload");
const dropZone = document.getElementById("dropZone");
const filePreview = document.getElementById("filePreview");
const linkInput = document.getElementById("linkInput");
const linkPreview = document.getElementById("linkPreview");
const uploadStage = document.getElementById("uploadStage");
const analysisStage = document.getElementById("analysisStage");
const resultGrid = document.getElementById("resultGrid");
const loadingBox = document.getElementById("loadingBox");
const sectionsContainer = document.getElementById("sections");
const summaryContent = document.getElementById("summaryContent");
const sectionTitle = document.getElementById("sectionTitle");
const assistant = document.getElementById("assistant");
const openAssistantBtn = document.getElementById("openAssistant");
const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("questionInput");
const contextLabel = document.getElementById("contextLabel");
const brainstormMap = document.getElementById("brainstormMap");
const generateBtn = document.getElementById("generateBtn");

function openFilePicker() {
  assetUpload.click();
}

assetUpload.addEventListener("change", (event) => {
  addFiles([...event.target.files]);
  assetUpload.value = "";
});

["dragenter", "dragover"].forEach(type => {
  dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach(type => {
  dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  addFiles([...event.dataTransfer.files]);
});

dropZone.addEventListener("click", (event) => {
  if (!event.target.closest("button")) openFilePicker();
});

function addFiles(files) {
  if (!files.length) return;
  uploadedFiles.push(...files);
  renderFilePreview();
}

function renderFilePreview() {
  if (uploadedFiles.length === 0) {
    filePreview.classList.add("d-none");
    filePreview.innerHTML = "";
    return;
  }

  filePreview.classList.remove("d-none");
  filePreview.innerHTML = uploadedFiles.map((file, index) => `
    <div class="file-chip">
      <i class="bi ${fileIcon(file)}"></i>
      <span title="${escapeAttr(file.name)}">${escapeHTML(shorten(file.name, 42))}</span>
      <button type="button" onclick="removeFile(${index})" aria-label="Remove file">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `).join("");
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  renderFilePreview();
}

function fileIcon(file) {
  const name = (file.name || "").toLowerCase();
  if (file.type && file.type.includes("image")) return "bi-image";
  if ((file.type && file.type.includes("pdf")) || name.endsWith(".pdf")) return "bi-file-earmark-pdf";
  if (name.endsWith(".docx")) return "bi-file-earmark-word";
  return "bi-file-earmark-text";
}

function addLink() {
  const value = linkInput.value.trim();
  if (!value) return;

  try {
    new URL(value);
  } catch {
    alert("Please enter a valid URL.");
    return;
  }

  uploadedLinks.push(value);
  linkInput.value = "";
  renderLinkPreview();
}

function renderLinkPreview() {
  if (uploadedLinks.length === 0) {
    linkPreview.classList.add("d-none");
    linkPreview.innerHTML = "";
    return;
  }

  linkPreview.classList.remove("d-none");
  linkPreview.innerHTML = uploadedLinks.map((link, index) => `
    <div class="link-chip">
      <i class="bi bi-link-45deg"></i>
      <span title="${escapeAttr(link)}">${escapeHTML(shorten(link, 46))}</span>
      <button type="button" onclick="removeLink(${index})" aria-label="Remove link">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `).join("");
}

function removeLink(index) {
  uploadedLinks.splice(index, 1);
  renderLinkPreview();
}

async function analyzeMaterials() {
  if (uploadedFiles.length === 0 && uploadedLinks.length === 0) {
    alert("Upload at least one file or add one link first.");
    return;
  }

  setGeneratingState(true);

  const formData = new FormData();
  uploadedFiles.forEach(file => formData.append("files", file));
  formData.append("links", JSON.stringify(uploadedLinks));

  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: formData
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      throw new Error("Backend returned non-JSON response. Check the Python terminal.");
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Analysis failed with status ${response.status}.`);
    }

    fullSummary = data.summary || "";
    sections = data.sections || {};
    connectionsData = data.connections || [];

    loadingBox.classList.add("d-none");
    resultGrid.classList.remove("d-none");
    appLayout.classList.remove("initial-state", "assistant-closed");
    appLayout.classList.add("analysis-ready");
    assistant.classList.remove("hidden");
    openAssistantBtn.style.display = "none";

    summaryContent.innerHTML = markdownToHTML(fullSummary);
    renderSections();
    renderConnections();
    renderBrainstormMap(data.brainstorm || null);
  } catch (error) {
    console.error(error);
    loadingBox.classList.add("d-none");
    resultGrid.classList.remove("d-none");
    appLayout.classList.remove("initial-state");
    appLayout.classList.add("analysis-ready", "assistant-closed");
    assistant.classList.add("hidden");
    openAssistantBtn.style.display = "block";
    summaryContent.innerHTML = `
      <div class="alert alert-danger">
        <strong>Analysis failed.</strong><br>
        ${escapeHTML(error.message)}
      </div>`;
  } finally {
    setGeneratingState(false);
  }
}

function setGeneratingState(isGenerating) {
  generateBtn.disabled = isGenerating;
  generateBtn.innerHTML = isGenerating
    ? `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Analysing...`
    : `<i class="bi bi-stars me-2"></i>Analyze with Synapse`;

  if (isGenerating) {
    uploadStage.classList.add("d-none");
    analysisStage.classList.remove("d-none");
    loadingBox.classList.remove("d-none");
    resultGrid.classList.add("d-none");
  }
}

function renderSections() {
  sectionsContainer.innerHTML = "";

  const mobileSectionsContainer = document.getElementById("mobileSections");
  if (mobileSectionsContainer) mobileSectionsContainer.innerHTML = "";

  const titles = Object.keys(sections);

  if (titles.length === 0) {
    const empty = `<div class="text-secondary small">No sections generated yet.</div>`;
    sectionsContainer.innerHTML = empty;
    if (mobileSectionsContainer) mobileSectionsContainer.innerHTML = empty;
    return;
  }

  titles.forEach(title => {
    sectionsContainer.appendChild(createSectionButton(title, false));
    if (mobileSectionsContainer) {
      mobileSectionsContainer.appendChild(createSectionButton(title, true));
    }
  });
}

function createSectionButton(title, isMobile = false) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "section-btn";
  btn.innerHTML = `<i class="bi bi-chevron-right"></i><span>${escapeHTML(title)}</span>`;

  btn.addEventListener("click", () => {
    selectedSection = title;
    sectionTitle.innerText = title;
    contextLabel.textContent = shorten(title, 22);

    document.querySelectorAll(".section-btn").forEach(button => {
      const label = button.querySelector("span")?.textContent?.trim() || button.textContent.trim();
      button.classList.toggle("active", label === title);
    });

    summaryContent.innerHTML = markdownToHTML(sections[title]);

    if (isMobile) {
      const mobileNav = document.getElementById("mobileNav");
      const instance = bootstrap.Offcanvas.getInstance(mobileNav);
      if (instance) instance.hide();
    }
  });

  return btn;
}

function showFullSummary() {
  selectedSection = "";
  sectionTitle.innerText = "Summary";
  contextLabel.textContent = "Current Notes";
  document.querySelectorAll(".section-btn").forEach(button => button.classList.remove("active"));
  summaryContent.innerHTML = markdownToHTML(fullSummary);
}

function renderBrainstormMap(brainstorm) {
  const nodes = brainstorm?.nodes?.length ? brainstorm.nodes : Object.keys(sections).slice(0, 7);
  const center = brainstorm?.center || "Core Ideas";
  brainstormMap.innerHTML = `<div class="map-center">${escapeHTML(center)}</div>`;

  const positions = [
    [12, 14], [62, 12], [73, 38], [62, 72], [18, 72], [8, 42], [38, 8]
  ];

  nodes.slice(0, 7).forEach((node, index) => {
    const [left, top] = positions[index % positions.length];
    const nodeEl = document.createElement("div");
    nodeEl.className = "map-node";
    nodeEl.style.left = `${left}%`;
    nodeEl.style.top = `${top}%`;
    nodeEl.textContent = typeof node === "string" ? node : (node?.label || "Idea");
    brainstormMap.appendChild(nodeEl);
  });
}

function renderConnections() {
  const emptyEl = document.getElementById("connectionsEmpty");
  const listEl = document.getElementById("connectionsList");

  if (!connectionsData.length) {
    emptyEl.classList.remove("d-none");
    listEl.classList.add("d-none");
    return;
  }

  emptyEl.classList.add("d-none");
  listEl.classList.remove("d-none");
  listEl.innerHTML = connectionsData.map(conn => `
    <div class="connection-card" onclick="askConnection('${escapeAttr(conn.from)}','${escapeAttr(conn.to)}','${escapeAttr(conn.label)}')">
      <div class="connection-label">${escapeHTML(conn.label || "Connection")}</div>
      <div class="connection-desc">
        <strong>${escapeHTML(conn.from || "Idea")}</strong> →
        <strong>${escapeHTML(conn.to || "Idea")}</strong><br>
        ${escapeHTML(conn.description || "")}
      </div>
    </div>
  `).join("");
}

function askConnection(from, to, label) {
  switchTab("chat", document.querySelector('.asst-tab[onclick*="chat"]'));
  questionInput.value = `Explain the connection between "${from}" and "${to}" (${label}).`;
  askAI();
}

async function askAI() {
  const question = questionInput.value.trim();
  if (!question) return;

  addMessage("user", question);
  questionInput.value = "";
  const typingId = addTypingIndicator();

  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        selected_section: selectedSection,
        chat_history: chatHistory.slice(-6).map(message => ({
          role: message.role,
          content: message.text
        }))
      })
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      throw new Error("Backend returned non-JSON response.");
    }

    removeTypingIndicator(typingId);

    if (!response.ok || data.error) {
      throw new Error(data.error || "AI request failed.");
    }

    addMessage("assistant", data.answer || "No answer returned.");
  } catch (error) {
    removeTypingIndicator(typingId);
    console.error(error);
    addMessage("assistant", `Error: ${error.message}`);
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
    <div>${markdownToHTML(text)}</div>`;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
  const id = "typing-" + Date.now();
  const div = document.createElement("div");
  div.id = id;
  div.className = "chat-message assistant";
  div.innerHTML = `<strong>Synapse</strong><div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  document.getElementById(id)?.remove();
}

function removeAssistantEmptyState() {
  chatMessages.querySelector(".assistant-empty")?.remove();
}

function clearChat() {
  chatHistory = [];
  chatMessages.innerHTML = `
    <div class="assistant-empty">
      <i class="bi bi-chat-dots"></i>
      <p>Ask questions about your generated notes.</p>
    </div>`;
}

function switchTab(tabName, clickedBtn) {
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".asst-tab").forEach(button => button.classList.remove("active"));
  document.getElementById(`tab-${tabName}`).classList.add("active");
  clickedBtn?.classList.add("active");
}

function closeAssistant() {
  assistant.classList.add("hidden");
  appLayout.classList.add("assistant-closed");
  openAssistantBtn.style.display = "block";
}

function openAssistant() {
  assistant.classList.remove("hidden");
  appLayout.classList.remove("assistant-closed");
  openAssistantBtn.style.display = "none";
}

function expandAssistant() {
  assistantExpanded = !assistantExpanded;
  assistant.classList.toggle("expanded", assistantExpanded);
}

function resetWorkspace() {
  location.reload();
}

function markdownToHTML(text) {
  if (!text) return "";

  const lines = escapeHTML(text).split("\n");
  const output = [];
  let inList = false;

  lines.forEach(line => {
    if (/^###\s+/.test(line)) {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<h3>${line.replace(/^###\s+/, "")}</h3>`);
    } else if (/^##\s+/.test(line)) {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<h2>${line.replace(/^##\s+/, "")}</h2>`);
    } else if (/^#\s+/.test(line)) {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<h1>${line.replace(/^#\s+/, "")}</h1>`);
    } else if (/^-\s+/.test(line)) {
      if (!inList) { output.push("<ul>"); inList = true; }
      output.push(`<li>${line.replace(/^-\s+/, "")}</li>`);
    } else if (line.trim() === "") {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push("<br>");
    } else {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<p>${line}</p>`);
    }
  });

  if (inList) output.push("</ul>");

  return output.join("")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

function escapeHTML(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(str) {
  return String(str || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", " ");
}

function shorten(str, n) {
  const value = String(str || "");
  return value.length > n ? value.slice(0, n) + "…" : value;
}

questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askAI();
  }
});
