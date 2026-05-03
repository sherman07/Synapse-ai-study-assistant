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
const sourceInput = document.getElementById("sourceInput");
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
const mindMapCanvas = document.getElementById("mindMapCanvas");
const generateBtn = document.getElementById("generateBtn");
const preferredLanguage = document.getElementById("preferredLanguage");
const historyNav = document.getElementById("historyNav");
const historyList = document.getElementById("historyList");
const historySearch = document.getElementById("historySearch");

const HISTORY_STORAGE_KEY = "synapse.generated.history.v6";
const ACTIVE_HISTORY_KEY = "synapse.active.generated.v6";
let currentTypingTimer = null;
let currentSourceFingerprint = "";
let currentMindMap = null;
let storedTitle = "Study Notes";
let activeTool = "mindmap";
let activeMindBranchIndex = 0;
let activeMindPointIndex = 0;

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

function parseMixedSources(rawSource) {
  const text = String(rawSource || "").trim();
  const links = [];

  const urlRegex = /https?:\/\/[^\s<>()]+/g;
  const matches = text.match(urlRegex) || [];

  matches.forEach(match => {
    const cleaned = match.replace(/[),.;!?]+$/g, "");
    try {
      const url = new URL(cleaned);
      if (!links.includes(url.href)) links.push(url.href);
    } catch {
      // Ignore invalid URL-like text.
    }
  });

  return {
    links,
    freeText: text
  };
}

async function analyzeMaterials() {
  const rawSource = sourceInput ? sourceInput.value.trim() : "";

  if (uploadedFiles.length === 0 && !rawSource) {
    alert("Upload at least one file, link, video link, or text first.");
    return;
  }

  currentSourceFingerprint = await buildClientFingerprint(rawSource);


  setGeneratingState(true);

  const formData = new FormData();
  uploadedFiles.forEach(file => formData.append("files", file));

  const parsedSources = parseMixedSources(rawSource);
  formData.append("links", JSON.stringify(parsedSources.links));
  formData.append("free_text", parsedSources.freeText);
  formData.append("preferred_language", preferredLanguage ? preferredLanguage.value : "auto");
  formData.append("client_fingerprint", currentSourceFingerprint);

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
    storedTitle = data.title || makeHistoryTitle(fullSummary) || "Study Notes";
    sections = data.sections || {};
    connectionsData = data.connections || [];
    currentMindMap = data.mind_map || data.mindMap || data.brainstorm || null;
    activeMindBranchIndex = 0;
    activeMindPointIndex = 0;
    currentSourceFingerprint = data.source_fingerprint || currentSourceFingerprint;

    showAnalysisView({ scrollToTop: true });

    renderSections();
    renderConnections();
    switchTool("mindmap");
    renderMindMap(currentMindMap);
    const savedEntry = saveHistoryEntry({
      title: data.title || null,
      summary: fullSummary,
      sections,
      connections: connectionsData,
      mindMap: currentMindMap,
      language: preferredLanguage ? preferredLanguage.value : "auto",
      sourceFingerprint: data.source_fingerprint || currentSourceFingerprint,
      clientFingerprint: currentSourceFingerprint,
      cached: Boolean(data.cached)
    });
    if (savedEntry && savedEntry.id) {
      localStorage.setItem(ACTIVE_HISTORY_KEY, savedEntry.id);
    }
    typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);
    requestAnimationFrame(() => renderMindMap(currentMindMap));
  } catch (error) {
    console.error(error);
    showAnalysisView({ scrollToTop: true });
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
    appLayout.classList.add("loading-state");
    appLayout.classList.add("assistant-closed");
    assistant.classList.add("hidden");
    openAssistantBtn.style.display = "none";
    uploadStage.classList.add("d-none");
    analysisStage.classList.remove("d-none");
    loadingBox.classList.remove("d-none");
    resultGrid.classList.add("d-none");
  }
}



function showAnalysisView({ scrollToTop = false } = {}) {
  if (uploadStage) uploadStage.classList.add("d-none");
  if (analysisStage) analysisStage.classList.remove("d-none");
  if (loadingBox) loadingBox.classList.add("d-none");
  if (resultGrid) resultGrid.classList.remove("d-none");

  appLayout.classList.remove("initial-state", "loading-state");
  appLayout.classList.add("analysis-ready", "assistant-closed");
  if (assistant) assistant.classList.add("hidden");
  if (openAssistantBtn) openAssistantBtn.style.display = "block";

  if (scrollToTop) {
    requestAnimationFrame(() => {
      const header = document.querySelector(".notes-header") || analysisStage || mainNotes;
      if (header && typeof header.scrollIntoView === "function") {
        header.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (mainNotes) mainNotes.scrollTop = 0;
    });
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

    typeInto(summaryContent, markdownToHTML(sections[title]), renderMath);

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
  typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);
}

function getToolPanelId(toolName) {
  const ids = {
    mindmap: "toolPanelMindMap",
    timeline: "toolPanelTimeline",
    quiz: "toolPanelQuiz"
  };
  return ids[toolName] || `toolPanel${toolName.charAt(0).toUpperCase()}${toolName.slice(1)}`;
}

function switchTool(toolName, clickedBtn = null) {
  activeTool = toolName;
  document.querySelectorAll(".tool-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".tool-switch-btn").forEach(button => {
    if (!button.disabled) button.classList.remove("active");
  });

  const panel = document.getElementById(getToolPanelId(toolName));
  if (panel) panel.classList.add("active");

  if (clickedBtn && !clickedBtn.disabled) {
    clickedBtn.classList.add("active");
  } else if (toolName === "mindmap") {
    document.getElementById("toolBtnMindMap")?.classList.add("active");
  }

  if (toolName === "mindmap") {
    requestAnimationFrame(() => renderMindMap(currentMindMap));
  }
}


function cleanMindText(text) {
  if (!text) return "";
  let value = String(text);

  // Markdown cleanup
  value = value.replace(/```[\s\S]*?```/g, " ");
  value = value.replace(/`([^`]*)`/g, "$1");
  value = value.replace(/\*\*([^*]+)\*\*/g, "$1");
  value = value.replace(/__([^_]+)__/g, "$1");
  value = value.replace(/\*([^*]+)\*/g, "$1");

  // Math wrappers
  value = value.replace(/\$\$([\s\S]*?)\$\$/g, "$1");
  value = value.replace(/\$([^$]+)\$/g, "$1");
  value = value.replace(/\\\(/g, "").replace(/\\\)/g, "");
  value = value.replace(/\\\[/g, "").replace(/\\\]/g, "");

  // Common LaTeX commands converted to readable text.
  value = value.replace(/\\(?:mathbf|mathrm|mathbb|mathit|textbf|textit)\{([^{}]*)\}/g, "$1");
  value = value.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  value = value.replace(/sqrt\s*\(\s*([^()]+?)\s*\)/gi, "√($1)");
  value = value.replace(/sqrt\s*([0-9A-Za-z]+)/gi, "√($1)");
  value = value.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  value = value.replace(/([A-Za-z0-9\)])\^\{([^{}]+)\}/g, "$1^$2");

  const replacements = [
    [/\\left/g, ""], [/\\right/g, ""],
    [/\\langle/g, "<"], [/\\rangle/g, ">"],
    [/\\times/g, "×"], [/\\cdot/g, "·"],
    [/\\to/g, "→"], [/\\le/g, "≤"], [/\\ge/g, "≥"], [/\\neq/g, "≠"], [/\\approx/g, "≈"],
    [/\\infty/g, "∞"], [/\\theta/g, "θ"], [/\\alpha/g, "α"], [/\\beta/g, "β"], [/\\gamma/g, "γ"], [/\\Delta/g, "Δ"], [/\\nabla/g, "∇"]
  ];
  replacements.forEach(([pattern, replacement]) => {
    value = value.replace(pattern, replacement);
  });

  // Remove remaining command names and braces.
  value = value.replace(/\\[a-zA-Z]+/g, "");
  value = value.replace(/[{}]/g, "");
  value = value.replace(/\\/g, "");
  value = value.replace(/\s+/g, " ").trim();
  return value;
}



function makeReadableMindLabel(label, detail = "", fallback = "Key point") {
  const cleaned = cleanMindText(label || detail || fallback);
  const formulaScore = (cleaned.match(/[=<>√×^]|\d/g) || []).length;
  const alphaScore = (cleaned.match(/[A-Za-z\u4e00-\u9fff]/g) || []).length;
  if (cleaned.length > 70 || (formulaScore > 8 && formulaScore >= alphaScore / 2)) {
    const detailText = cleanMindText(detail || cleaned);
    const beforeColon = detailText.split(":")[0].trim();
    if (beforeColon && beforeColon.length >= 4 && beforeColon.length <= 42 && !/[=<>√×^]/.test(beforeColon)) {
      return beforeColon;
    }
    if (/derivative/i.test(detailText)) return "Derivative calculation";
    if (/cross product/i.test(detailText)) return "Cross product";
    if (/curvature/i.test(detailText)) return "Curvature formula";
    if (/vector function/i.test(detailText)) return "Vector function";
    if (/square root|sqrt/i.test(detailText)) return "Square root step";
    if (/sum of squares/i.test(detailText)) return "Sum of squares";
    return fallback;
  }
  return cleaned || fallback;
}

function shortMindText(text, limit = 60) {
  const cleaned = cleanMindText(text);
  return shorten(cleaned || "Untitled", limit);
}

function normaliseMindPoints(points = []) {
  return (points || []).slice(0, 5).map((point, index) => {
    if (typeof point === "string") {
      const cleaned = cleanMindText(point);
      return {
        id: `point-${index}`,
        label: shortMindText(makeReadableMindLabel(cleaned, cleaned, `Point ${index + 1}`), 58),
        detail: cleaned || "Open the related notes for more detail."
      };
    }

    const rawLabel = point?.label || point?.title || point?.text || point?.detail || `Point ${index + 1}`;
    const detail = cleanMindText(point?.detail || point?.explanation || point?.text || rawLabel);
    const label = makeReadableMindLabel(rawLabel, detail, `Point ${index + 1}`);
    return {
      id: point?.id || `point-${index}`,
      label: shortMindText(label, 58),
      detail: detail || label || "Open the related notes for more detail."
    };
  }).filter(point => point.label);
}

function getMindMapData(mindMap) {
  if (mindMap && Array.isArray(mindMap.branches) && mindMap.branches.length) {
    return {
      center: shortMindText(mindMap.center || storedTitle || "Study Notes", 86),
      branches: mindMap.branches.slice(0, 6).map((branch, index) => ({
        id: branch.id || `branch-${index}`,
        label: shortMindText(branch.label || branch.section || `Branch ${index + 1}`, 52),
        section: branch.section || branch.label || `Section ${index + 1}`,
        summary: cleanMindText(branch.summary || ""),
        points: normaliseMindPoints(branch.points || [])
      }))
    };
  }

  const fallbackBranches = Object.keys(sections).slice(0, 6).map((sectionName, index) => {
    const rawLines = String(sections[sectionName] || "")
      .split(/\n+/)
      .map(line => cleanMindText(line.replace(/^[\-•*]\s*/, "").replace(/^\d+[.)]\s*/, "")))
      .filter(Boolean);

    const points = rawLines.slice(0, 5).map((line, pointIndex) => ({
      id: `fallback-${index}-${pointIndex}`,
      label: shortMindText(line, 58),
      detail: line
    }));

    return {
      id: `fallback-${index}`,
      label: sectionName === "Overview" ? "Summary" : sectionName,
      section: sectionName,
      summary: rawLines[0] || "Open this section for more detail.",
      points: points.length ? points : [{ id: `fallback-${index}-0`, label: "Open related notes", detail: "Open this section for more detail." }]
    };
  });

  return {
    center: shortMindText(storedTitle || "Study Notes", 86),
    branches: fallbackBranches
  };
}

function renderMindMap(mindMap) {
  const panel = document.getElementById("toolPanelMindMap");
  if (panel) panel.classList.add("active");
  document.getElementById("toolBtnMindMap")?.classList.add("active");

  const data = getMindMapData(mindMap);
  currentMindMap = data;

  if (!mindMapCanvas) return;
  if (!data.branches.length) {
    mindMapCanvas.innerHTML = `<div class="mindmap-empty">Mind map will appear after analysis.</div>`;
    return;
  }

  if (activeMindBranchIndex >= data.branches.length) activeMindBranchIndex = 0;
  const activeBranch = data.branches[activeMindBranchIndex] || data.branches[0];
  if (activeMindPointIndex >= activeBranch.points.length) activeMindPointIndex = 0;
  const activePoint = activeBranch.points[activeMindPointIndex] || null;

  const colors = ["#ff7a45", "#19a65a", "#22b8cf", "#8f5fe8", "#f6c343", "#ef4444"];
  const activeColor = colors[activeMindBranchIndex % colors.length];

  const branchHTML = data.branches.map((branch, index) => {
    const color = colors[index % colors.length];
    return `
      <button class="mm-branch-node ${index === activeMindBranchIndex ? "active" : ""}"
              type="button"
              style="--branch-color:${color};"
              onclick="selectMindBranch(${index})">
        <span class="mm-node-dot"></span>
        <span class="mm-node-label">${escapeHTML(shortMindText(branch.label, 52))}</span>
      </button>
    `;
  }).join("");

  const pointsHTML = activeBranch.points.map((point, index) => `
    <button class="mm-point-node ${index === activeMindPointIndex ? "active" : ""}"
            type="button"
            style="--branch-color:${activeColor};"
            onclick="selectMindPoint(${activeMindBranchIndex}, ${index})">
      <span class="mm-point-index">${index + 1}</span>
      <span class="mm-node-label">${escapeHTML(shortMindText(point.label, 62))}</span>
    </button>
  `).join("");

  const detailTitle = cleanMindText(activePoint ? activePoint.label : activeBranch.label);
  const detailBody = cleanMindText(activePoint ? activePoint.detail : activeBranch.summary || "Open this branch for more detail.");

  mindMapCanvas.innerHTML = `
    <div class="mm-layout">
      <div class="mm-root-zone">
        <button class="mm-root-node" type="button" onclick="showFullSummary()">
          <span class="mm-root-dot"></span>
          <span class="mm-root-label">${escapeHTML(shortMindText(data.center || "Study Notes", 86))}</span>
        </button>
      </div>

      <div class="mm-branch-zone">
        <div class="mm-zone-title">Main branches</div>
        <div class="mm-branch-list">${branchHTML}</div>
      </div>

      <div class="mm-point-zone">
        <div class="mm-zone-title">${escapeHTML(shortMindText(activeBranch.label, 64))}</div>
        <div class="mm-points-list">${pointsHTML || `<div class="mindmap-empty-small">No sub-points yet.</div>`}</div>
      </div>

      <div class="mm-detail-zone">
        <div class="mm-detail-card" style="--branch-color:${activeColor};">
          <div class="mm-detail-head">
            <span>${escapeHTML(shortMindText(activeBranch.label, 58))}</span>
            <button type="button" onclick="openActiveMindMapSection()">Open notes</button>
          </div>
          <div class="mm-detail-title">${escapeHTML(detailTitle)}</div>
          <div class="mm-detail-body">${escapeHTML(detailBody)}</div>
          <div class="mm-detail-actions">
            <button class="mm-action-btn" type="button" onclick="openActiveMindMapSection()">Go to notes</button>
            <button class="mm-action-btn primary" type="button" onclick="askSelectedMindPoint()">Ask tutor</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function selectMindBranch(index) {
  activeMindBranchIndex = index;
  activeMindPointIndex = 0;
  renderMindMap(currentMindMap);
}

function selectMindPoint(branchIndex, pointIndex) {
  activeMindBranchIndex = branchIndex;
  activeMindPointIndex = pointIndex;
  renderMindMap(currentMindMap);
}

function openActiveMindMapSection() {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[activeMindBranchIndex];
  if (!branch) return;
  activateSectionFromMap(branch.section || branch.label);
}

function askSelectedMindPoint() {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[activeMindBranchIndex];
  if (!branch) return;
  const point = branch.points[activeMindPointIndex];
  const prompt = point
    ? `Explain this point from "${branch.label}": ${point.detail}`
    : `Explain the key ideas in "${branch.label}".`;
  switchTab("chat", document.querySelector('.asst-tab[onclick*="chat"]'));
  openAssistant();
  if (questionInput) {
    questionInput.value = prompt;
    questionInput.focus();
  }
}

function activateSectionFromMap(sectionName) {
  const exact = Object.keys(sections).find(key => key === sectionName || key.toLowerCase() === String(sectionName).toLowerCase());
  if (!exact) return;
  const buttons = [...document.querySelectorAll(".section-btn")];
  const target = buttons.find(button => (button.querySelector("span")?.textContent?.trim() || "") === exact);
  if (target) {
    target.click();
  } else {
    selectedSection = exact;
    sectionTitle.innerText = exact;
    contextLabel.textContent = shorten(exact, 22);
    typeInto(summaryContent, markdownToHTML(sections[exact]), renderMath);
  }
  document.getElementById("summaryContent")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusMindMapPoint(sectionName, pointText) {
  activateSectionFromMap(sectionName);
  if (questionInput) {
    questionInput.value = `Explain this point from "${sectionName}": ${pointText}`;
  }
}

window.selectMindBranch = selectMindBranch;
window.selectMindPoint = selectMindPoint;
window.openActiveMindMapSection = openActiveMindMapSection;
window.askSelectedMindPoint = askSelectedMindPoint;

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
  const bodyId = `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  div.innerHTML = `
    <strong>${role === "user" ? "You" : "Synapse"}</strong>
    <div id="${bodyId}"></div>`;

  chatMessages.appendChild(div);
  const body = document.getElementById(bodyId);

  if (role === "assistant") {
    typeInto(body, markdownToHTML(text), () => {
      renderMath();
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 8);
  } else {
    body.innerHTML = markdownToHTML(text);
    renderMath();
  }

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
  localStorage.removeItem(ACTIVE_HISTORY_KEY);
  location.reload();
}

function normalizePlainMathText(text) {
  return String(text || "")
    .replace(/sqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "√($1)")
    .replace(/sqrt\s*([0-9A-Za-z]+)/gi, "√($1)");
}

function markdownToHTML(text) {
  if (!text) return "";

  text = normalizePlainMathText(text);
  let safe = escapeHTML(text);

  // Protect display math blocks before markdown parsing
  const mathBlocks = [];
  safe = safe.replace(/\\\[[\s\S]*?\\\]/g, (match) => {
    const id = `@@MATH_BLOCK_${mathBlocks.length}@@`;
    mathBlocks.push(match);
    return id;
  });

  // Protect inline math before markdown parsing
  const inlineMath = [];
  safe = safe.replace(/\\\([\s\S]*?\\\)/g, (match) => {
    const id = `@@INLINE_MATH_${inlineMath.length}@@`;
    inlineMath.push(match);
    return id;
  });

  const lines = safe.split("\n");
  const output = [];
  let inList = false;
  let inOrderedList = false;

  function closeLists() {
    if (inList) {
      output.push("</ul>");
      inList = false;
    }
    if (inOrderedList) {
      output.push("</ol>");
      inOrderedList = false;
    }
  }

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith("@@MATH_BLOCK_")) {
      closeLists();
      output.push(`<div class="math-block">${trimmed}</div>`);
    } else if (/^####\s+/.test(line)) {
      closeLists();
      output.push(`<h4>${line.replace(/^####\s+/, "")}</h4>`);
    } else if (/^###\s+/.test(line)) {
      closeLists();
      output.push(`<h3>${line.replace(/^###\s+/, "")}</h3>`);
    } else if (/^##\s+/.test(line)) {
      closeLists();
      output.push(`<h2>${line.replace(/^##\s+/, "")}</h2>`);
    } else if (/^#\s+/.test(line)) {
      closeLists();
      output.push(`<h1>${line.replace(/^#\s+/, "")}</h1>`);
    } else if (/^-\s+/.test(line)) {
      if (inOrderedList) {
        output.push("</ol>");
        inOrderedList = false;
      }
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${line.replace(/^-\s+/, "")}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
      if (!inOrderedList) {
        output.push("<ol>");
        inOrderedList = true;
      }
      output.push(`<li>${line.replace(/^\d+\.\s+/, "")}</li>`);
    } else if (trimmed === "") {
      closeLists();
    } else {
      closeLists();
      output.push(`<p>${line}</p>`);
    }
  });

  closeLists();

  let html = output.join("");

  // Restore math blocks
  mathBlocks.forEach((block, index) => {
    html = html.replace(`@@MATH_BLOCK_${index}@@`, block);
  });

  inlineMath.forEach((block, index) => {
    html = html.replace(`@@INLINE_MATH_${index}@@`, block);
  });

  return html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

function renderMath() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(error => {
      console.error("MathJax render error:", error);
    });
  }
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


function typeInto(element, html, done = null, speed = 4) {
  if (!element) return;
  if (currentTypingTimer) {
    clearInterval(currentTypingTimer);
    currentTypingTimer = null;
  }

  const tokens = String(html || "").match(/<[^>]+>|&[^;]+;|\s+|[^\s<>&]+/g) || [];
  let index = 0;
  let output = "";
  element.innerHTML = "";

  currentTypingTimer = setInterval(() => {
    let batch = 0;
    while (index < tokens.length && batch < 5) {
      output += tokens[index];
      index += 1;
      batch += 1;
    }
    element.innerHTML = output;

    if (index >= tokens.length) {
      clearInterval(currentTypingTimer);
      currentTypingTimer = null;
      if (typeof done === "function") done();
    }
  }, speed);
}

async function buildClientFingerprint(rawSource) {
  const language = preferredLanguage ? preferredLanguage.value : "auto";
  const hashParts = [`language:${language}`, `source:${String(rawSource || "").trim()}`];

  for (const file of uploadedFiles) {
    const buffer = await file.arrayBuffer();
    const fileHash = await sha256Hex(buffer);
    hashParts.push(`file:${file.name}:${file.size}:${file.type}:${fileHash}`);
  }

  return sha256Hex(hashParts.join("||"));
}

async function sha256Hex(input) {
  const data = input instanceof ArrayBuffer
    ? input
    : new TextEncoder().encode(String(input));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setHistory(items) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

function makeHistoryTitle(source, fallback = "Generated Study Notes") {
  const raw = typeof source === "object" && source !== null
    ? (source.title || source.summary || source.fullSummary || "")
    : String(source || "");

  const text = normaliseTitleText(raw);
  if (!text) return fallback;

  const explicitTopicPatterns = [
    /\b(FINEARTS\s*\d{3,4}[A-Z]?\s*[-–—:]?\s*[^.\n,;:]{0,55})/i,
    /\b(WTRENG\s*\d{3,4}[A-Z]?\s*[-–—:]?\s*[^.\n,;:]{0,55})/i,
    /\b([A-Z]{2,}\s*\d{3,4}[A-Z]?\s*[-–—:]?\s*[^.\n,;:]{0,55})/,
    /\b([A-Z][A-Za-z\s]+ Act\s+\d{4})\b/,
    /\b(Zero Carbon Act|Privacy Act|Resource Management Act|GDPR|Legislation Act\s+\d{4})\b/i,
    /\b(Pythagorean Theorem|Curvature of Vector Function|Cross Product|Infant Incubator|AI-powered|AI powered)[^.\n,;:]*/i
  ];

  for (const pattern of explicitTopicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return cleanTitle(match[1], fallback);
  }

  const topicPatterns = [
    /(?:source material|material|document|lesson|video|workshop|case study)\s+(?:is|was|appears to be|focuses on|examines|explores|discusses|covers|teaches|is related to)\s+(?:a|an|the)?\s*([^.;\n]{10,110})/i,
    /(?:focuses on|examines|explores|discusses|covers|teaches|demonstrates|shows)\s+(?:how to\s+)?(?:a|an|the)?\s*([^.;\n]{10,110})/i,
    /(?:about|on)\s+(?:a|an|the)?\s*([^.;\n]{10,90})/i
  ];

  for (const pattern of topicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return cleanTitle(match[1], fallback);
  }

  const firstUseful = text
    .split(/[.!?。！？]/)
    .map(part => part.trim())
    .find(part => part.length > 10 && !/^(synapse summary|summary|core argument|key ideas)$/i.test(part));

  return cleanTitle(firstUseful || text, fallback);
}

function normaliseTitleText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_`]/g, "")
    .replace(/\\\[|\\\]|\\\(|\\\)/g, " ")
    .replace(/^\s*Synapse Summary[:\s-]*/i, "")
    .replace(/^\s*Summary[:\s-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(title, fallback = "Generated Study Notes") {
  let cleaned = normaliseTitleText(title)
    .replace(/^(that|the|this|source material|material|document|lesson|video|workshop|case study)\s+/i, "")
    .replace(/^(how to|understanding how to|understanding|to demonstrate how to|demonstrate how to)\s+/i, "")
    .replace(/\s+(which|that|because|where|while|through|by|including|with)\s+.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return fallback;

  const words = cleaned.split(" ");
  let sliced = words.slice(0, 7).join(" ");

  if (/^(to|how|appears|related|based|source|material|document)\b/i.test(sliced) && words.length > 7) {
    sliced = words.slice(1, 8).join(" ");
  }

  sliced = sliced.replace(/[,:;\-–—]+$/g, "").trim();

  if (sliced.split(" ").length <= 2 && words.length > 2 && !/[A-Z]{2,}|\d{4}/.test(sliced)) {
    sliced = words.slice(0, 5).join(" ");
  }

  return shorten(sliced || fallback, 58);
}

function saveHistoryEntry(payload) {
  const items = getHistory();
  const sourceFingerprint = payload.sourceFingerprint || payload.clientFingerprint || currentSourceFingerprint || "";
  const existingIndex = sourceFingerprint
    ? items.findIndex(item => item.sourceFingerprint === sourceFingerprint || item.clientFingerprint === sourceFingerprint)
    : -1;

  const entry = {
    ...payload,
    id: existingIndex >= 0 ? items[existingIndex].id : Date.now().toString(),
    title: makeHistoryTitle(payload.title || payload.summary),
    createdAt: existingIndex >= 0 ? items[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceFingerprint,
    clientFingerprint: payload.clientFingerprint || sourceFingerprint,
  };

  const nextItems = existingIndex >= 0
    ? [entry, ...items.filter((_, index) => index !== existingIndex)]
    : [entry, ...items];

  setHistory(nextItems);
  renderHistory();
  return entry;
}

function findHistoryByFingerprint(fingerprint) {
  if (!fingerprint) return null;
  return getHistory().find(item =>
    item.sourceFingerprint === fingerprint ||
    item.clientFingerprint === fingerprint
  ) || null;
}

function renderHistory(filter = "") {
  if (!historyList) return;
  const query = String(filter || "").toLowerCase().trim();
  const items = getHistory().filter(item => {
    const haystack = `${item.title || ""} ${item.summary || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  if (!items.length) {
    historyList.innerHTML = `<p class="history-empty">No matching generated notes yet.</p>`;
    return;
  }

  historyList.innerHTML = items.map(item => `
    <div class="history-item-wrap">
      <button class="history-item" type="button" onclick="loadHistoryEntry('${escapeAttr(item.id)}')">
        <div class="history-item-title">${escapeHTML(makeHistoryTitle(item))}</div>
        <div class="history-item-meta">${formatHistoryDate(item.createdAt)}</div>
      </button>
      <button class="history-delete-btn" type="button"
              title="Delete this history item"
              aria-label="Delete ${escapeAttr(makeHistoryTitle(item))}"
              onclick="deleteHistoryEntry(event, '${escapeAttr(item.id)}')">
        <i class="bi bi-trash3"></i>
      </button>
    </div>
  `).join("");
}

function deleteHistoryEntry(event, id) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const items = getHistory();
  const target = items.find(item => item.id === id);
  const title = target ? makeHistoryTitle(target) : "this history item";

  const confirmed = window.confirm(`Delete "${title}" from history?`);
  if (!confirmed) return;

  setHistory(items.filter(item => item.id !== id));
  renderHistory(historySearch ? historySearch.value : "");
}

function loadHistoryEntry(id, options = {}) {
  const item = getHistory().find(entry => entry.id === id);
  if (!item) return;

  fullSummary = item.summary || "";
  storedTitle = item.title || makeHistoryTitle(fullSummary) || "Study Notes";
  sections = item.sections || {};
  connectionsData = item.connections || [];
  currentSourceFingerprint = item.sourceFingerprint || item.clientFingerprint || "";

  localStorage.setItem(ACTIVE_HISTORY_KEY, id);
  showAnalysisView({ scrollToTop: !options.preserveScroll });

  sectionTitle.innerText = "Summary";
  contextLabel.textContent = "Current Notes";
  renderSections();
  renderConnections();
  currentMindMap = item.mindMap || item.mind_map || item.brainstorm || null;
  activeMindBranchIndex = 0;
  activeMindPointIndex = 0;
  switchTool("mindmap");
  renderMindMap(currentMindMap);
  typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);
}

function formatHistoryDate(value) {
  if (!value) return "Saved notes";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "Saved notes";
  }
}

function cleanExistingHistoryTitles() {
  const items = getHistory();
  if (!items.length) return;

  let changed = false;
  const cleaned = items.map(item => {
    const cleanTitle = makeHistoryTitle(item);
    if (cleanTitle !== item.title) changed = true;
    return { ...item, title: cleanTitle };
  });

  if (changed) setHistory(cleaned);
}

if (historySearch) {
  historySearch.addEventListener("input", event => renderHistory(event.target.value));
}
cleanExistingHistoryTitles();
renderHistory();

const activeHistoryId = localStorage.getItem(ACTIVE_HISTORY_KEY);
if (activeHistoryId && getHistory().some(item => item.id === activeHistoryId)) {
  loadHistoryEntry(activeHistoryId, { preserveScroll: true });
}

if (questionInput) questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askAI();
  }
});