function deleteFlashcardDeck(historyId, sourceFingerprint = "") {
  const store = getFlashcardStore();
  delete store[`history:${historyId}`];
  if (sourceFingerprint) delete store[`fingerprint:${sourceFingerprint}`];
  setFlashcardStore(store);
}

function resetFlashcardState() {
  currentFlashcards = [];
  activeFlashcardIndex = 0;
  flashcardSide = "front";
  flashcardError = "";
  isFlashcardGenerating = false;
  renderFlashcardPanel();
}

function flashcardCountValue(settings = flashcardSettings) {
  if (settings.countMode === "30") return 30;
  if (settings.countMode === "60") return 60;
  if (settings.countMode === "custom") return Math.max(1, Math.min(Number.parseInt(settings.customCount, 10) || 20, 80));
  return null;
}

function renderFlashcardPanel() {
  const panel = document.getElementById("flashcardPanelContent");
  if (!panel) return;

  if (isFlashcardGenerating) {
    panel.innerHTML = `
      <div class="flashcard-builder-card">
        <div class="d-flex align-items-start gap-3">
          <span class="spinner-border spinner-border-sm mt-1" aria-hidden="true"></span>
          <div>
            <div class="fw-bold">Building flashcard deck...</div>
            <p class="text-secondary mb-0 mt-1">Synapse is turning the current notes into concise recall prompts.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (flashcardError) {
    panel.innerHTML = `
      <div class="alert alert-danger">
        <strong>Flashcard generation failed.</strong><br>${escapeHTML(flashcardError)}
      </div>
      ${renderFlashcardBuilder()}
    `;
    return;
  }

  panel.innerHTML = currentFlashcards.length ? renderFlashcardStudyView() : renderFlashcardBuilder();
  renderMath();
}

function renderFlashcardBuilder() {
  const hasNotes = Boolean(fullSummary && fullSummary.trim());
  const countModes = [
    { value: "auto", label: "Auto", helper: "Synapse chooses the useful amount." },
    { value: "30", label: "30", helper: "A full short-review set." },
    { value: "60", label: "60", helper: "A broad exam-prep deck." },
    { value: "custom", label: "Custom", helper: "Pick your own count." }
  ];
  const currentMode = normalizeFlashcardSettings(flashcardSettings).countMode;
  const activeMode = countModes.find(mode => mode.value === currentMode) || countModes[0];
  return `
    <div class="flashcard-builder-wrap">
      <div class="flashcard-builder-card">
        <div class="flashcard-builder-kicker"><i class="bi bi-lightning-charge"></i> Active recall deck</div>
        <h4>Generate flashcards from these notes</h4>
        <p>Cards will focus on definitions, contrasts, processes, examples, data, and source figures that are useful to remember.</p>

        <label class="flashcard-field-label" for="flashcardLanguage">Card language</label>
        <select id="flashcardLanguage" class="form-select flashcard-language-select" onchange="updateFlashcardLanguage(this.value)">
          ${QUIZ_LANGUAGE_OPTIONS.map(option => `
            <option value="${option.value}" ${flashcardSettings.preferredLanguage === option.value ? "selected" : ""}>${escapeHTML(option.label)}</option>
          `).join("")}
        </select>

        <div class="flashcard-field-label mt-4">Card count</div>
        <div class="flashcard-count-row" role="group" aria-label="Flashcard count">
          ${countModes.map(mode => `
            <button class="flashcard-count-btn ${currentMode === mode.value ? "active" : ""}" type="button" onclick="setFlashcardCountMode('${mode.value}')">
              ${escapeHTML(mode.label)}
            </button>
          `).join("")}
        </div>
        <div class="flashcard-count-help">${escapeHTML(activeMode.helper)}</div>
        ${currentMode === "custom" ? `
          <input class="form-control flashcard-custom-count" type="number" min="1" max="80"
            value="${flashcardSettings.customCount}" oninput="updateFlashcardCustomCount(this.value)" onchange="updateFlashcardCustomCount(this.value)">
        ` : ""}

        <button class="btn btn-primary flashcard-generate-btn" type="button" onclick="generateFlashcards()" ${hasNotes ? "" : "disabled"}>
          <i class="bi bi-stars me-2"></i>Generate flashcards
        </button>
      </div>
    </div>
  `;
}

function renderFlashcardStudyView() {
  const total = currentFlashcards.length;
  activeFlashcardIndex = Math.max(0, Math.min(activeFlashcardIndex, total - 1));
  const card = currentFlashcards[activeFlashcardIndex];
  const sideText = flashcardSide === "front" ? card.front : card.back;
  return `
    <div class="flashcard-study-wrap">
      <div class="flashcard-study-shell">
        <div class="flashcard-study-top">
          <span>Card ${activeFlashcardIndex + 1} of ${total}</span>
          <button type="button" onclick="flipFlashcard()">
            <i class="bi bi-arrow-repeat me-1"></i>${flashcardSide === "front" ? "Reveal" : "Show front"}
          </button>
        </div>
        <button class="flashcard-stage ${flashcardSide === "back" ? "back" : ""}" type="button" onclick="flipFlashcard()">
          <span class="flashcard-side-label">${flashcardSide === "front" ? "Prompt" : "Answer"}</span>
          <div class="flashcard-main-text">${markdownToHTML(sideText)}</div>
          ${flashcardSide === "front" && card.hint ? `<div class="flashcard-hint"><strong>Hint:</strong> ${markdownToHTML(card.hint)}</div>` : ""}
          ${flashcardSide === "back" && card.sourceReference ? `<div class="flashcard-source"><strong>Source basis:</strong> ${inlineMarkdownHTML(card.sourceReference)}</div>` : ""}
        </button>
        <div class="flashcard-nav-row">
          <button class="btn btn-outline-primary" type="button" onclick="setActiveFlashcard(${activeFlashcardIndex - 1})" ${activeFlashcardIndex <= 0 ? "disabled" : ""}>
            <i class="bi bi-chevron-left me-1"></i>Previous
          </button>
          <button class="btn btn-outline-primary" type="button" onclick="setActiveFlashcard(${activeFlashcardIndex + 1})" ${activeFlashcardIndex >= total - 1 ? "disabled" : ""}>
            Next<i class="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>
      <div class="flashcard-footer-actions">
        <button type="button" onclick="openFlashcardListModal()">All flashcards</button>
        <button type="button" onclick="regenerateFlashcards()"><i class="bi bi-arrow-clockwise me-1"></i>Regenerate</button>
      </div>
    </div>
  `;
}

function setFlashcardCountMode(mode) {
  flashcardSettings = normalizeFlashcardSettings({ ...flashcardSettings, countMode: mode });
  safeSetLocalStorage(FLASHCARD_SETTINGS_KEY, JSON.stringify(flashcardSettings));
  renderFlashcardPanel();
}

function updateFlashcardCustomCount(value) {
  flashcardSettings = normalizeFlashcardSettings({ ...flashcardSettings, customCount: value, countMode: "custom" });
  safeSetLocalStorage(FLASHCARD_SETTINGS_KEY, JSON.stringify(flashcardSettings));
}

function updateFlashcardLanguage(value) {
  flashcardSettings = normalizeFlashcardSettings({ ...flashcardSettings, preferredLanguage: value });
  safeSetLocalStorage(FLASHCARD_SETTINGS_KEY, JSON.stringify(flashcardSettings));
}

function clearFlashcardsAndShowBuilder() {
  currentFlashcards = [];
  activeFlashcardIndex = 0;
  flashcardSide = "front";
  flashcardError = "";
  renderFlashcardPanel();
}

async function generateFlashcards() {
  if (!fullSummary || !fullSummary.trim()) {
    alert("Generate visual notes first, then create flashcards.");
    return;
  }

  flashcardSettings = normalizeFlashcardSettings(flashcardSettings);
  safeSetLocalStorage(FLASHCARD_SETTINGS_KEY, JSON.stringify(flashcardSettings));
  isFlashcardGenerating = true;
  flashcardError = "";
  currentFlashcards = [];
  activeFlashcardIndex = 0;
  flashcardSide = "front";
  switchTool("flashcards");
  renderFlashcardPanel();

  try {
    const response = await apiClient.fetch("/flashcards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: storedTitle,
        summary: fullSummary,
        sections,
        source_fingerprint: currentSourceFingerprint,
        preferred_language: flashcardSettings.preferredLanguage,
        count_mode: flashcardSettings.countMode,
        card_count: flashcardCountValue(flashcardSettings)
      })
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Flashcard generation failed with status ${response.status}.`);
    }
    currentFlashcards = normalizeClientFlashcardDeck(data);
    if (!currentFlashcards.length) throw new Error("No usable flashcards were returned.");
    persistFlashcardsForCurrentNote();
  } catch (error) {
    console.error(error);
    flashcardError = error.message || "Flashcard generation failed.";
  } finally {
    isFlashcardGenerating = false;
    renderFlashcardPanel();
  }
}

function regenerateFlashcards() {
  currentFlashcards = [];
  generateFlashcards();
}

function flipFlashcard() {
  if (!currentFlashcards.length) return;
  flashcardSide = flashcardSide === "front" ? "back" : "front";
  renderFlashcardPanel();
}

function setActiveFlashcard(index) {
  if (!currentFlashcards.length) return;
  activeFlashcardIndex = Math.max(0, Math.min(index, currentFlashcards.length - 1));
  flashcardSide = "front";
  renderFlashcardPanel();
}

function openFlashcardListModal() {
  if (!currentFlashcards.length) return;
  document.getElementById("flashcardListOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "flashcardListOverlay";
  overlay.className = "visual-modal flashcard-list-overlay";
  overlay.innerHTML = `
    <div class="flashcard-list-modal">
      <button class="visual-modal-close" type="button" aria-label="Close flashcards" onclick="closeFlashcardListModal()">
        <i class="bi bi-x-lg"></i>
      </button>
      <h3>All flashcards</h3>
      <div class="flashcard-list-table">
        ${currentFlashcards.map((card, index) => `
          <button class="flashcard-list-row" type="button" onclick="jumpToFlashcardFromList(${index})">
            <span class="flashcard-list-number">Card ${index + 1}</span>
            <span>
              <strong>Front</strong>
              ${escapeHTML(cleanMindText(card.front))}
            </span>
            <span>
              <strong>Back</strong>
              ${escapeHTML(cleanMindText(card.back))}
            </span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeFlashcardListModal();
  });
  document.body.appendChild(overlay);
}

function closeFlashcardListModal() {
  document.getElementById("flashcardListOverlay")?.remove();
}

function jumpToFlashcardFromList(index) {
  closeFlashcardListModal();
  setActiveFlashcard(index);
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
  const cleaned = cleanMindText(text)
    .replace(/\s*(?:\.{3}|…)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "Untitled";
  if (!limit || cleaned.length <= limit) return cleaned;

  const sliced = cleaned.slice(0, limit).trim();
  const separators = [" ", "，", "、", ",", ";", "；", ":", "：", ")", "）"];
  const cut = Math.max(...separators.map(separator => sliced.lastIndexOf(separator)));
  const minUsefulCut = Math.min(28, Math.floor(limit * 0.45));
  return (cut >= minUsefulCut ? sliced.slice(0, cut) : sliced).trim();
}

function fullMindText(text, fallback = "Untitled") {
  const cleaned = cleanMindText(text)
    .replace(/\s*(?:\.{3}|…)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

function deriveMindChildrenFromDetail(detail = "", parentLabel = "", maxChildren = 3) {
  const cleaned = cleanMindText(detail);
  const parentKey = cleanMindText(parentLabel).toLowerCase();
  if (!cleaned || cleaned.length < 70) return [];

  const parts = cleaned
    .split(/\s*[;；]\s*|\s+→\s+|\s+--\s+|\s+—\s+|(?<=[.!?。！？])\s+|\s+\b(?:because|therefore|however|for example|e\.g\.)\b\s+/i)
    .map(part => cleanMindText(part))
    .filter(Boolean);

  const seen = new Set();
  const children = [];
  for (const part of parts) {
    if (part.length < 14 || part.length > 260) continue;
    const key = part.toLowerCase().replace(/\W+/g, "").slice(0, 80);
    if (!key || seen.has(key) || (parentKey && key === parentKey.replace(/\W+/g, "").slice(0, 80))) continue;
    seen.add(key);

    let labelSource = part.split(/[:：,，]/)[0]?.trim() || part;
    if (labelSource.length < 5 || labelSource.length > 58) labelSource = part;
    const label = fullMindText(makeReadableMindLabel(labelSource, part, "Subpoint"), "Subpoint");
    children.push({
      id: `derived-child-${children.length}-${key}`,
      label,
      detail: fullMindText(part, "Open this subpoint for detail.")
    });
    if (children.length >= maxChildren) break;
  }
  return children;
}

function normaliseMindChildren(children = [], parentId = "point", parentDetail = "", parentLabel = "") {
  const source = Array.isArray(children) ? children : [];
  const normalised = source.slice(0, 6).map((child, index) => {
    if (typeof child === "string") {
      const cleaned = cleanMindText(child);
      return {
        id: `${parentId}-child-${index}`,
        label: fullMindText(makeReadableMindLabel(cleaned, cleaned, `Subpoint ${index + 1}`), `Subpoint ${index + 1}`),
        detail: cleaned || "Open this subpoint for detail.",
        rawDetail: child
      };
    }

    const rawLabel = child?.label || child?.title || child?.text || child?.detail || `Subpoint ${index + 1}`;
    const rawDetail = child?.rawDetail || child?.detail || child?.explanation || child?.text || rawLabel;
    const detail = cleanMindText(rawDetail);
    const label = makeReadableMindLabel(rawLabel, detail, `Subpoint ${index + 1}`);
    return {
      id: child?.id || `${parentId}-child-${index}`,
      label: fullMindText(label, `Subpoint ${index + 1}`),
      detail: detail || label || "Open this subpoint for detail.",
      rawDetail
    };
  }).filter(child => child.label);

  if (normalised.length) return normalised;
  return deriveMindChildrenFromDetail(parentDetail, parentLabel, 3).map((child, index) => ({
    ...child,
    id: `${parentId}-${child.id || `derived-${index}`}`
  }));
}

function normaliseMindPoints(points = []) {
  return (points || []).slice(0, 10).map((point, index) => {
    if (typeof point === "string") {
      const cleaned = cleanMindText(point);
      const id = `point-${index}`;
      return {
        id,
        label: fullMindText(makeReadableMindLabel(cleaned, cleaned, `Point ${index + 1}`), `Point ${index + 1}`),
        detail: cleaned || "Open the related notes for more detail.",
        rawDetail: point,
        children: normaliseMindChildren([], id, cleaned, cleaned)
      };
    }

    const rawLabel = point?.label || point?.title || point?.text || point?.detail || `Point ${index + 1}`;
    const rawDetail = point?.rawDetail || point?.detail || point?.explanation || point?.text || rawLabel;
    const detail = cleanMindText(rawDetail);
    const label = makeReadableMindLabel(rawLabel, detail, `Point ${index + 1}`);
    const id = point?.id || `point-${index}`;
    const childSource = point?.children || point?.subpoints || point?.leaves || point?.items || [];
    return {
      id,
      label: fullMindText(label, `Point ${index + 1}`),
      detail: detail || label || "Open the related notes for more detail.",
      rawDetail,
      children: normaliseMindChildren(childSource, id, detail, label)
    };
  }).filter(point => point.label);
}

function firstMindSentenceMatching(text, pattern) {
  const sentences = String(text || "")
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map(sentence => cleanMindText(sentence))
    .filter(Boolean);
  return sentences.find(sentence => pattern.test(sentence)) || sentences[0] || "";
}

function buildMindPointFromPattern(sectionText, label, pattern, fallbackDetail) {
  if (!pattern.test(sectionText || "")) return null;
  const detail = firstMindSentenceMatching(sectionText, pattern) || fallbackDetail || label;
  return {
    id: `supplement-${label.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`,
    label: fullMindText(label, "Point"),
    detail: fullMindText(detail, label)
  };
}

function insertSupplementalMindBranch(data, branch, preferredIndex = 1) {
  if (!branch || !branch.label) return data;
  const newText = `${branch.label} ${branch.section || ""} ${branch.summary || ""}`.toLowerCase();
  const isDuplicate = data.branches.some(existing => {
    const existingText = `${existing.label} ${existing.section || ""} ${existing.summary || ""}`.toLowerCase();
    const existingLabel = String(existing.label || "").toLowerCase();
    const newLabel = String(branch.label || "").toLowerCase();
    return (newLabel && existingText.includes(newLabel)) || (existingLabel && newText.includes(existingLabel));
  });
  if (isDuplicate) return data;
  const branches = [...data.branches];
  branches.splice(Math.max(0, Math.min(preferredIndex, branches.length)), 0, branch);
  return { ...data, branches: branches.slice(0, 14) };
}

function enhanceMindMapData(data) {
  if (!data || !Array.isArray(data.branches)) return data;
  let enhanced = { ...data, branches: [...data.branches] };
  const branchText = enhanced.branches.map(branch => `${branch.label} ${branch.section || ""} ${branch.summary || ""}`).join(" ").toLowerCase();

  if (!/\boverview\b|概述|總覽|总览/.test(branchText) && sections.Overview) {
    const overviewLines = String(sections.Overview || "")
      .split(/\n+/)
      .map(line => cleanMindText(line.replace(/^[\-•*]\s*/, "").replace(/^\d+[.)]\s*/, "")))
      .filter(Boolean);
    enhanced = insertSupplementalMindBranch(enhanced, {
      id: "supplement-overview",
      label: "Overview / Big picture",
      section: "Overview",
      summary: firstMindSentenceMatching(sections.Overview, /./) || "Start here for the main learning frame.",
      points: normaliseMindPoints(overviewLines.slice(0, 6).map(line => ({ label: line, detail: line })))
    }, 0);
  }

  if (!/developmental approach/i.test(branchText)) {
    const entry = Object.entries(sections).find(([name, content]) => /developmental approach/i.test(`${name}\n${content}`));
    if (entry) {
      const [sectionName, sectionText] = entry;
      const points = [
        buildMindPointFromPattern(sectionText, "Analysis vs synthesis", /\banalysis\b|\bsynthesis\b/i, "Break the mind into components, then explain how those components work together during development."),
        buildMindPointFromPattern(sectionText, "Holistic, integrative view", /\bholistic\b|\bintegrative\b|\bintegration\b/i, "Developmental psychology links perception, action, cognition, emotion, and social context instead of treating them as isolated boxes."),
        buildMindPointFromPattern(sectionText, "Levels of analysis", /\blevels? of analysis\b|\bcultural\b.*\bgenetic\b|\bneural\b/i, "A developmental explanation can move between cultural, social, behavioural, neural, physiological, and genetic levels."),
        buildMindPointFromPattern(sectionText, "Ontogeny vs phylogeny", /\bontogen|phylogen|evolutionary\b/i, "Separate change across one life from change across species history, then ask how the two timelines interact."),
        buildMindPointFromPattern(sectionText, "Basic and applied research", /\bbasic research\b|\bapplied research\b|\beducational\b|\bclinical\b/i, "Use the framework to connect theory with applied fields such as education, clinical work, and intervention.")
      ].filter(Boolean);
      enhanced = insertSupplementalMindBranch(enhanced, {
        id: "supplement-developmental-approach",
        label: "Developmental approach overview",
        section: sectionName,
        summary: firstMindSentenceMatching(sectionText, /developmental approach|holistic|integrative|analysis|synthesis/i) || "Developmental psychology studies how the mind changes by connecting components, levels, and time scales.",
        points: points.length ? points : normaliseMindPoints(String(sectionText).split(/\n+/).slice(0, 7).map(line => ({ label: line, detail: line })))
      }, 1);
    }
  }

  return enhanced;
}
function getMindMapData(mindMap) {
  if (mindMap && Array.isArray(mindMap.branches) && mindMap.branches.length) {
    return enhanceMindMapData({
      center: fullMindText(mindMap.center || storedTitle || "Study Notes", "Study Notes"),
      branches: mindMap.branches.slice(0, 14).map((branch, index) => ({
        id: branch.id || `branch-${index}`,
        label: fullMindText(branch.label || branch.section || `Branch ${index + 1}`, `Branch ${index + 1}`),
        section: branch.section || branch.label || `Section ${index + 1}`,
        summary: cleanMindText(branch.summary || ""),
        rawSummary: branch.rawSummary || branch.summary || "",
        points: normaliseMindPoints(branch.points || [])
      }))
    });
  }

  const fallbackBranches = Object.keys(sections).slice(0, 14).map((sectionName, index) => {
    const rawLines = String(sections[sectionName] || "")
      .split(/\n+/)
      .map(line => cleanMindText(line.replace(/^[\-•*]\s*/, "").replace(/^\d+[.)]\s*/, "")))
      .filter(Boolean);

    const points = rawLines.slice(0, 8).map((line, pointIndex) => ({
      id: `fallback-${index}-${pointIndex}`,
      label: fullMindText(line, `Point ${pointIndex + 1}`),
      detail: line,
      rawDetail: line
    }));

    return {
      id: `fallback-${index}`,
      label: sectionName === "Overview" ? "Summary" : sectionName,
      section: sectionName,
      summary: rawLines[0] || "Open this section for more detail.",
      points: normaliseMindPoints(points.length ? points : [{ id: `fallback-${index}-0`, label: "Open related notes", detail: "Open this section for more detail." }])
    };
  });

  return enhanceMindMapData({
    center: fullMindText(storedTitle || "Study Notes", "Study Notes"),
    branches: fallbackBranches
  });
}

function getMindBranchKey(branch, index) {
  return String(branch?.id || branch?.section || branch?.label || `branch-${index}`);
}

function isMindBranchCollapsed(branch, index) {
  return collapsedMindBranches.has(getMindBranchKey(branch, index));
}

function mindMapDetailHTML(value, fallback = "Open this branch for more detail.") {
  const raw = String(value || "").trim();
  const source = cleanMindText(raw || fallback) || "Open this branch for more detail.";
  return markdownToHTML(source);
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
  const activeBranchCollapsed = isMindBranchCollapsed(activeBranch, activeMindBranchIndex);
  const activeBranchPoints = activeBranch.points || [];
  if (activeMindPointIndex >= activeBranchPoints.length || activeBranchCollapsed) activeMindPointIndex = 0;
  if (activeMindChildIndex < -1) activeMindChildIndex = -1;
  const activePoint = activeBranchCollapsed ? null : activeBranchPoints[activeMindPointIndex] || null;
  const activeChildren = activePoint?.children || [];
  if (activeMindChildIndex >= activeChildren.length || activeBranchCollapsed) activeMindChildIndex = -1;
  const activeChild = activeMindChildIndex >= 0 ? activeChildren[activeMindChildIndex] : null;

  const colors = ["#ff7a45", "#19a65a", "#22b8cf", "#8f5fe8", "#f6c343", "#ef4444", "#0ea5e9", "#14b8a6", "#a855f7", "#f97316", "#64748b"];
  const activeColor = colors[activeMindBranchIndex % colors.length];

  const branchHTML = data.branches.map((branch, index) => {
    const color = colors[index % colors.length];
    const isActive = index === activeMindBranchIndex;
    const isCollapsed = isMindBranchCollapsed(branch, index);
    const points = branch.points || [];
    const visiblePoints = isActive && !isCollapsed ? points : [];
    const leavesHTML = visiblePoints.map((point, pointIndex) => {
      const children = point.children || [];
      const isPointActive = isActive && pointIndex === activeMindPointIndex;
      const shouldShowChildren = isPointActive && !isCollapsed && children.length;
      const childHTML = shouldShowChildren
        ? `<div class="mm-subleaf-list">
            ${children.slice(0, 6).map((child, childIndex) => `
              <button class="mm-subleaf-node ${isPointActive && childIndex === activeMindChildIndex ? "active" : ""}"
                      type="button"
                      title="${escapeAttr(fullMindText(child.detail || child.label, child.label || "Subpoint"))}"
                      onclick="selectMindChild(${index}, ${pointIndex}, ${childIndex}, event)">
                ${escapeHTML(shortMindText(child.label || child.detail, 78))}
              </button>
            `).join("")}
          </div>`
        : "";
      return `
        <div class="mm-leaf-group ${isPointActive ? "active" : ""} ${children.length ? "has-children" : ""} ${shouldShowChildren ? "expanded" : ""}">
          <button class="mm-leaf-node ${isPointActive ? "active" : ""} ${children.length ? "has-children" : ""}"
                  type="button"
                  title="${escapeAttr(fullMindText(point.detail || point.label, point.label || "Point"))}"
                  onclick="selectMindPoint(${index}, ${pointIndex}, event)">
            <span>${escapeHTML(shortMindText(point.label || point.detail, 92))}</span>
            ${children.length ? `<span class="mm-child-count">${children.length}</span>` : ""}
          </button>
          ${childHTML}
        </div>
      `;
    }).join("");
    return `
      <div class="mm-tree-branch ${isActive ? "active" : ""} ${isCollapsed ? "collapsed" : ""}" style="--branch-color:${color};">
        <button class="mm-branch-node ${isActive ? "active" : ""}"
                type="button"
                title="${escapeAttr(fullMindText(branch.summary || branch.label, branch.label || "Branch"))}"
                onclick="selectMindBranch(${index})">
          <span class="mm-node-dot"></span>
          <span class="mm-node-label">${escapeHTML(shortMindText(branch.label || branch.summary, 82))}</span>
          <span class="mm-branch-count">${points.length}</span>
        </button>
        <div class="mm-leaf-list">
          ${isActive && !isCollapsed ? leavesHTML || `<div class="mindmap-empty-small">No points yet.</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  const detailTitle = fullMindText(activeChild ? activeChild.label : activePoint ? activePoint.label : activeBranch.label, "Selected point");
  const detailBodySource = activeChild
    ? (activeChild.rawDetail || activeChild.detail || activeChild.label)
    : activePoint
      ? (activePoint.rawDetail || activePoint.detail || activePoint.label)
      : (activeBranch.rawSummary || activeBranch.summary || activeBranch.label);
  const detailBodyHTML = mindMapDetailHTML(detailBodySource, "Open this branch for more detail.");
  const detailPath = activeChild && activePoint
    ? `${fullMindText(activeBranch.label, "Main branch")} / ${fullMindText(activePoint.label, "Point")}`
    : activePoint
      ? fullMindText(activeBranch.label, "Main branch")
      : activeBranchCollapsed
        ? "Closed main branch"
        : "Main branch";
  const showDetailPopup = mindDetailPopupOpen && !activeBranchCollapsed && Boolean(activePoint || activeChild);

  mindMapCanvas.innerHTML = `
    <div class="mm-shell">
      <div class="mm-map-scroll" aria-label="Scrollable mind map">
        <div class="mm-layout mm-tree-layout">
          <div class="mm-root-zone">
            <button class="mm-root-node" type="button" onclick="showFullSummary()">
              <span class="mm-root-dot"></span>
              <span class="mm-root-label">${escapeHTML(shortMindText(data.center || "Study Notes", 112))}</span>
            </button>
          </div>

          <div class="mm-tree-zone">
            <div class="mm-zone-title">Knowledge tree</div>
            <div class="mm-tree-list">${branchHTML}</div>
          </div>
        </div>
      </div>

      ${showDetailPopup ? `
        <div class="mm-detail-popover ${escapeAttr(mindDetailPopupPlacement)}" style="--branch-color:${activeColor}; --detail-x:${Math.round(mindDetailPopupLeft)}px; --detail-y:${Math.round(mindDetailPopupTop)}px;">
          <button class="mm-detail-close" type="button" onclick="closeMindDetailPopup()" aria-label="Close detail">
            <i class="bi bi-x-lg"></i>
          </button>
          <div class="mm-detail-head">
            <span>${escapeHTML(fullMindText(detailPath, "Main branch"))}</span>
          </div>
          <div class="mm-detail-title">${escapeHTML(detailTitle)}</div>
          <div class="mm-detail-body">${detailBodyHTML}</div>
          <div class="mm-detail-actions">
            <button class="mm-action-btn" type="button" onclick="openActiveMindMapSection()">Go to notes</button>
            <button class="mm-action-btn primary" type="button" onclick="askSelectedMindPoint()">Ask tutor</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
  renderMath();
}

function selectMindBranch(index) {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[index];
  if (!branch) return;
  const key = getMindBranchKey(branch, index);
  if (index === activeMindBranchIndex) {
    if (collapsedMindBranches.has(key)) {
      collapsedMindBranches.delete(key);
    } else {
      collapsedMindBranches.add(key);
    }
  } else {
    collapsedMindBranches.delete(key);
  }
  activeMindBranchIndex = index;
  activeMindPointIndex = 0;
  activeMindChildIndex = -1;
  mindDetailPopupOpen = false;
  renderMindMap(currentMindMap);
}

function closeMindBranch(index) {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[index];
  if (!branch) return;
  collapsedMindBranches.add(getMindBranchKey(branch, index));
  activeMindBranchIndex = index;
  activeMindPointIndex = 0;
  activeMindChildIndex = -1;
  mindDetailPopupOpen = false;
  renderMindMap(currentMindMap);
}

function openMindBranch(index) {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[index];
  if (branch) collapsedMindBranches.delete(getMindBranchKey(branch, index));
  activeMindBranchIndex = index;
  activeMindPointIndex = 0;
  activeMindChildIndex = -1;
  mindDetailPopupOpen = false;
  renderMindMap(currentMindMap);
}

function updateMindDetailPopupPosition(event) {
  if (!event?.currentTarget || !mindMapCanvas) {
    mindDetailPopupLeft = 24;
    mindDetailPopupTop = 72;
    mindDetailPopupPlacement = "right";
    return;
  }

  const clicked = event.currentTarget;
  const target = clicked.classList?.contains("mm-subleaf-node")
    ? clicked
    : clicked.closest(".mm-leaf-group") || clicked;
  const canvasRect = mindMapCanvas.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const gap = 18;
  const canvasWidth = mindMapCanvas.clientWidth || canvasRect.width || 900;
  const canvasHeight = mindMapCanvas.clientHeight || canvasRect.height || 520;
  const popupWidth = Math.min(390, Math.max(300, canvasWidth - 32));
  const popupHeight = Math.min(520, Math.max(300, window.innerHeight * 0.58));
  const targetLeft = targetRect.left - canvasRect.left;
  const targetRight = targetRect.right - canvasRect.left;
  const targetTop = targetRect.top - canvasRect.top;
  const targetBottom = targetRect.bottom - canvasRect.top;
  const spaceRight = canvasWidth - targetRight - gap;
  const spaceLeft = targetLeft - gap;

  if (spaceRight >= popupWidth) {
    mindDetailPopupPlacement = "right";
    mindDetailPopupLeft = targetRight + gap;
    mindDetailPopupTop = targetTop - 6;
  } else if (spaceLeft >= popupWidth) {
    mindDetailPopupPlacement = "left";
    mindDetailPopupLeft = targetLeft - popupWidth - gap;
    mindDetailPopupTop = targetTop - 6;
  } else {
    mindDetailPopupPlacement = "below";
    mindDetailPopupLeft = Math.min(Math.max(16, targetLeft), Math.max(16, canvasWidth - popupWidth - 16));
    mindDetailPopupTop = targetBottom + 12;
  }

  const maxLeft = Math.max(16, canvasWidth - popupWidth - 16);
  const maxTop = Math.max(72, canvasHeight - popupHeight - 16);
  mindDetailPopupLeft = Math.min(Math.max(16, mindDetailPopupLeft), maxLeft);
  mindDetailPopupTop = Math.min(Math.max(24, mindDetailPopupTop), maxTop);
}

function selectMindPoint(branchIndex, pointIndex, event) {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[branchIndex];
  if (branch) collapsedMindBranches.delete(getMindBranchKey(branch, branchIndex));
  activeMindBranchIndex = branchIndex;
  activeMindPointIndex = pointIndex;
  activeMindChildIndex = -1;
  mindDetailPopupOpen = true;
  updateMindDetailPopupPosition(event);
  renderMindMap(currentMindMap);
}

function selectMindChild(branchIndex, pointIndex, childIndex, event) {
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[branchIndex];
  if (branch) collapsedMindBranches.delete(getMindBranchKey(branch, branchIndex));
  activeMindBranchIndex = branchIndex;
  activeMindPointIndex = pointIndex;
  activeMindChildIndex = childIndex;
  mindDetailPopupOpen = true;
  updateMindDetailPopupPosition(event);
  renderMindMap(currentMindMap);
}

function closeMindDetailPopup() {
  mindDetailPopupOpen = false;
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
  const child = activeMindChildIndex >= 0 ? point?.children?.[activeMindChildIndex] : null;
  const prompt = child
    ? `Explain this subpoint from "${branch.label}" > "${point.label}": ${child.rawDetail || child.detail}`
    : point
    ? `Explain this point from "${branch.label}": ${point.rawDetail || point.detail}`
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
    renderSectionNotes(exact);
  }
  document.getElementById("summaryContent")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
