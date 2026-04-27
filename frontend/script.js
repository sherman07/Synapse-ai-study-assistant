const API_BASE = "http://127.0.0.1:8000";

let sections = {};
let fullSummary = "";
let selectedSection = "";
let chatHistory = [];
let assistantExpanded = false;

const pdfUpload = document.getElementById("pdfUpload");
const sectionsContainer = document.getElementById("sections");
const summaryContent = document.getElementById("summaryContent");
const sectionTitle = document.getElementById("sectionTitle");
const loadingBox = document.getElementById("loadingBox");
const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("questionInput");
const assistant = document.getElementById("assistant");
const openAssistantBtn = document.getElementById("openAssistant");
const mainNotes = document.getElementById("mainNotes");

async function uploadPDF() {
  const file = pdfUpload.files[0];

  if (!file) {
    showAlert("Please upload a PDF first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/upload-pdf`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Failed to generate notes.");
    }

    const data = await response.json();

    fullSummary = data.summary || "";
    sections = data.sections || {};

    renderSections();
    showFullSummary();

  } catch (error) {
    console.error(error);
    showAlert("Something went wrong. Check backend server and API key.");
  } finally {
    setLoading(false);
  }
}

function renderSections() {
  sectionsContainer.innerHTML = "";

  const titles = Object.keys(sections);

  if (titles.length === 0) {
    sectionsContainer.innerHTML = `
      <div class="text-secondary small">
        No sections generated yet.
      </div>
    `;
    return;
  }

  titles.forEach((title) => {
    const btn = document.createElement("button");
    btn.className = "section-btn";
    btn.innerHTML = `<i class="bi bi-chevron-right me-2"></i>${title}`;

    btn.onclick = () => {
      selectedSection = title;
      sectionTitle.innerText = title;

      document.querySelectorAll(".section-btn").forEach((b) => {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      summaryContent.innerHTML = markdownToHTML(sections[title]);
    };

    sectionsContainer.appendChild(btn);
  });
}

function showFullSummary() {
  selectedSection = "";
  sectionTitle.innerText = "Generated Study Notes";

  document.querySelectorAll(".section-btn").forEach((b) => {
    b.classList.remove("active");
  });

  if (!fullSummary) {
    summaryContent.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-file-earmark-text"></i>
        <h3>No notes generated yet</h3>
        <p>Upload a PDF and click “Generate Notes”.</p>
      </div>
    `;
    return;
  }

  summaryContent.innerHTML = markdownToHTML(fullSummary);
}

async function askAI() {
  const question = questionInput.value.trim();

  if (!question) return;

  addMessage("user", question);
  questionInput.value = "";

  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: question,
        selected_section: selectedSection
      })
    });

    if (!response.ok) {
      throw new Error("AI request failed.");
    }

    const data = await response.json();

    addMessage("assistant", data.answer || "No answer returned.");

  } catch (error) {
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

  const roleName = role === "user" ? "You" : "Assistant";

  div.innerHTML = `
    <strong>${roleName}</strong>
    <div>${markdownToHTML(text)}</div>
  `;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
    </div>
  `;
}

function closeAssistant() {
  assistant.classList.add("hidden");
  openAssistantBtn.style.display = "block";

  if (window.innerWidth >= 992) {
    mainNotes.classList.remove("col-lg-7");
    mainNotes.classList.add("col-lg-10");
  }
}

function openAssistant() {
  assistant.classList.remove("hidden");
  openAssistantBtn.style.display = "none";

  if (window.innerWidth >= 992) {
    mainNotes.classList.remove("col-lg-10");
    mainNotes.classList.add("col-lg-7");
  }
}

function expandAssistant() {
  assistantExpanded = !assistantExpanded;

  if (assistantExpanded) {
    assistant.classList.add("expanded");
  } else {
    assistant.classList.remove("expanded");
  }
}

function setLoading(isLoading) {
  if (isLoading) {
    loadingBox.classList.remove("d-none");
    summaryContent.classList.add("d-none");
  } else {
    loadingBox.classList.add("d-none");
    summaryContent.classList.remove("d-none");
  }
}

function showAlert(message) {
  alert(message);
}

function markdownToHTML(text) {
  if (!text) return "";

  let html = escapeHTML(text);

  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
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

questionInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askAI();
  }
});