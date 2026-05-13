const API_BASE = "http://127.0.0.1:8001";

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
const visualGallery = document.getElementById("visualGallery");
const sectionTitle = document.getElementById("sectionTitle");
const assistant = document.getElementById("assistant");
const openAssistantBtn = document.getElementById("openAssistant");
const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("questionInput");
const voiceMessages = document.getElementById("voiceMessages");
const voiceTutorState = document.getElementById("voiceTutorState");
const voiceTutorDiagnosis = document.getElementById("voiceTutorDiagnosis");
const voiceTutorMastery = document.getElementById("voiceTutorMastery");
const voiceTutorMasteryFill = document.getElementById("voiceTutorMasteryFill");
const voiceRecordBtn = document.getElementById("voiceRecordBtn");
const voiceMuteBtn = document.getElementById("voiceMuteBtn");
const voiceTextInput = document.getElementById("voiceTextInput");
const contextLabel = document.getElementById("contextLabel");
const mindMapCanvas = document.getElementById("mindMapCanvas");
const generateBtn = document.getElementById("generateBtn");
const preferredLanguage = document.getElementById("preferredLanguage");
const detailLevel = document.getElementById("detailLevel");
const historyNav = document.getElementById("historyNav");
const historyList = document.getElementById("historyList");
const historySearch = document.getElementById("historySearch");
const mobileHistoryList = document.getElementById("mobileHistoryList");
const mobileHistorySearch = document.getElementById("mobileHistorySearch");

const HISTORY_STORAGE_KEY = "synapse.generated.history.v6";
const ACTIVE_HISTORY_KEY = "synapse.active.generated.v6";
const TUTOR_CHAT_STORAGE_KEY = "synapse.tutor.chat.history.v1";
const TUTOR_CHAT_HISTORY_LIMIT = 80;
const VOICE_TUTOR_STORAGE_KEY = "synapse.voice.tutor.history.v1";
const VOICE_TUTOR_HISTORY_LIMIT = 80;
const VISUAL_DB_NAME = "synapse.visual.assets.v1";
const VISUAL_DB_STORE = "visualGalleries";
const VISUAL_DB_VERSION = 1;
const VISUAL_HISTORY_LIMIT = 20;
let currentTypingTimer = null;
let currentSourceFingerprint = "";
let currentHistoryId = "";
let currentPrimarySourceIdentity = "";
let currentMindMap = null;
let storedTitle = "Study Notes";
let activeTool = "mindmap";
let activeMindBranchIndex = 0;
let activeMindPointIndex = 0;
let visualGalleryData = [];
let voiceTutorHistory = [];
let voiceTutorLastState = null;
let voiceTutorBusy = false;
let voiceRealtimePeer = null;
let voiceRealtimeChannel = null;
let voiceRealtimeStream = null;
let voiceRealtimeAudio = null;
let voiceRealtimeConnected = false;
let voiceRealtimeConnecting = false;
let voiceRealtimeMuted = false;
let voiceRealtimeAssistantDraft = "";
let voiceRealtimeResponseActive = false;
let voiceRealtimeTranscriptCommitted = false;
let voiceRealtimeLastTranscriptText = "";
let voiceRealtimeLastTranscriptAt = 0;
let voiceRealtimeLastSpeechAt = 0;
let voiceRealtimeNoTranscriptTimer = null;

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage:`, error);
    return false;
  }
}

const TIMELINE_STORAGE_KEY = "synapse.timeline.path.v1";
const TIMELINE_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "warm_up", label: "Warm up" },
  { value: "learn", label: "Learn" },
  { value: "apply", label: "Apply" },
  { value: "check", label: "Check" },
  { value: "revise", label: "Revise" }
];
const STUDY_PATH_QUESTION_TYPE_OPTIONS = [
  { value: "short_answer", label: "Short answer", hint: "Answer in 2-3 sentences." },
  { value: "single_choice", label: "Single choice", hint: "Choose the best answer." },
  { value: "multiple_choice", label: "Multiple choice", hint: "Select every correct answer." },
  { value: "true_false", label: "True / False", hint: "Judge the statement and explain why." },
  { value: "case_analysis", label: "Case analysis", hint: "Apply the concept to a concrete case." },
  { value: "compare", label: "Compare", hint: "Explain similarities and differences." },
  { value: "essay_outline", label: "Essay outline", hint: "Plan a short answer structure." },
  { value: "diagram_prompt", label: "Diagram prompt", hint: "Read or sketch the visual logic." }
];
let currentTimeline = null;
let activeTimelineIndex = 0;
let activeTimelineFilter = "all";
let timelineError = "";
let isTimelineGenerating = false;
let timelineCompletedIds = new Set();
let timelinePracticeAnswers = {};

const QUIZ_STORAGE_KEY = "synapse.quiz.settings.v2";
const QUIZ_HISTORY_STORAGE_KEY = "synapse.quiz.history.v1";
const QUIZ_HISTORY_LIMIT = 16;
const QUIZ_TYPE_OPTIONS = [
  { value: "single_choice", label: "Single choice", description: "4 options, only 1 correct answer" },
  { value: "multiple_choice", label: "Multiple choice", description: "Multiple correct answers for careful distinction" },
  { value: "true_false", label: "True / False", description: "Quickly test concept boundaries" },
  { value: "short_answer", label: "Short answer", description: "Explain the key idea in your own words" },
  { value: "case_analysis", label: "Case analysis", description: "Apply the concept to a concrete scenario" },
  { value: "essay", label: "Essay", description: "Organise evidence into a complete response" }
];
const QUIZ_LANGUAGE_OPTIONS = [
  { value: "multi_language", label: "Multi-language", description: "Match the current notes and keep useful source terms." },
  { value: "english", label: "English", description: "Write all quiz content in English." },
  { value: "simplified_chinese", label: "简体中文", description: "使用简体中文生成题目。" },
  { value: "traditional_chinese", label: "繁體中文", description: "使用繁體中文生成題目。" },
  { value: "mixed_chinese_english", label: "中文 + English keywords", description: "中文解释，保留关键英文术语。" },
  { value: "japanese", label: "日本語", description: "日本語で出題します。" },
  { value: "korean", label: "한국어", description: "한국어로 문제를 생성합니다." },
  { value: "french", label: "Français", description: "Rédiger le quiz en français." },
  { value: "spanish", label: "Español", description: "Redactar el quiz en español." },
  { value: "german", label: "Deutsch", description: "Das Quiz auf Deutsch schreiben." },
  { value: "italian", label: "Italiano", description: "Scrivere il quiz in italiano." },
  { value: "portuguese", label: "Português", description: "Escrever o quiz em português." },
  { value: "arabic", label: "العربية", description: "إنشاء الاختبار باللغة العربية." },
  { value: "hindi", label: "हिन्दी", description: "हिन्दी में प्रश्न बनाएं." },
  { value: "vietnamese", label: "Tiếng Việt", description: "Tạo câu hỏi bằng tiếng Việt." },
  { value: "thai", label: "ไทย", description: "สร้างแบบทดสอบเป็นภาษาไทย." },
  { value: "indonesian", label: "Bahasa Indonesia", description: "Buat kuis dalam Bahasa Indonesia." },
  { value: "malay", label: "Bahasa Melayu", description: "Bina kuiz dalam Bahasa Melayu." },
  { value: "russian", label: "Русский", description: "Создать тест на русском языке." }
];
const QUIZ_DEFAULT_SETTINGS = {
  examMode: false,
  preferredLanguage: "english",
  totalQuestions: 6,
  questionTypes: [{ type: "single_choice", count: 6 }]
};
let quizSettings = loadQuizSettings();
let quizSettingsDraft = null;
let currentQuiz = null;
let quizHistory = [];
let quizAnswers = {};
let quizRevealedAnswers = new Set();
let quizReport = null;
let quizError = "";
let isQuizGenerating = false;
let activeQuizQuestionIndex = 0;
let activeQuizHistoryId = "";

const FLASHCARD_STORAGE_KEY = "synapse.flashcards.deck.v1";
const FLASHCARD_SETTINGS_KEY = "synapse.flashcards.settings.v1";
const FLASHCARD_DEFAULT_SETTINGS = {
  preferredLanguage: "english",
  countMode: "auto",
  customCount: 20
};
let flashcardSettings = loadFlashcardSettings();
let currentFlashcards = [];
let activeFlashcardIndex = 0;
let flashcardSide = "front";
let flashcardError = "";
let isFlashcardGenerating = false;

function sourceFigureText(item) {
  if (!item || typeof item !== "object") return "";
  return [
    item.title,
    item.caption,
    item.what_shows,
    item.argument_supported,
    item.cross_source_connection,
    item.how_to_read,
    item.exam_use,
    item.location,
    item.source_title,
    item.visual_kind
  ].filter(Boolean).join(" ").toLowerCase();
}

function countSourceFigureSignals(text, patterns) {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
}

function isRelevantLearningFigure(item) {
  if (!item || !item.url) return false;
  const text = sourceFigureText(item);
  if (!text) return false;

  if (/unavailable in this cached view|regenerate from the source files/i.test(text)) return false;
  if (/\b(stock|dreamstime|getty|unsplash|product photo|phone photo|generic photo|decorative photo)\b/i.test(text)) {
    return false;
  }

  const trustedKinds = new Set([
    "data/table",
    "graph/chart",
    "diagram/model",
    "experiment/event",
    "formula/calculation",
    "method/result figure"
  ]);
  if (trustedKinds.has(String(item.visual_kind || "").toLowerCase())) return true;

  const teachingSignals = countSourceFigureSignals(text, [
    /\b(table|figure|fig\.|graph|chart|plot|scatter|correlation|axis|axes|curve|diagram|schema|schematic|model|flow|process|timeline)\b/i,
    /\b(data|results?|statistics?|mean|median|weighted|arithmetic|percentage|rate|sample|condition|control|comparison|versus|vs)\b/i,
    /\b(experiment|method|procedure|trial|task|stimulus|response|event|habituation|possible|impossible|observed|violation|looking time)\b/i,
    /\b(genotype|phenotype|heritability|chromosome|maoa|allele|gene|environment|iq|biomarker)\b/i,
    /\b(mri|fmri|eeg|bold|activation|neuroimaging|brain scan|action potential|resting potential|synapse)\b/i,
    /(图表|统计|数据|结果|实验|流程|机制|模型|公式|对比|比较|相关|相关性|基因|遗传|染色体|表型|脑成像|神经影像|激活|坐标|曲线)/
  ]);

  const decorativeSignals = countSourceFigureSignals(text, [
    /\b(title slide|cover|agenda|outline|contents|today|welcome|overview|learning objectives?)\b/i,
    /\b(lecturer|professor|dr\.|email|contact|office|university|department|course code|canvas)\b/i,
    /\b(photo|photograph|portrait|headshot|people|person|children|child|boy|girl|landscape|stock|getty|dreamstime|unsplash|logo|decorative|background|product photo|phone photo)\b/i,
    /(封面|目录|大纲|学习目标|照片|头像|人物照|风景|装饰|背景|作者|讲师|联系方式|邮箱|学校|标志)/
  ]);

  if (teachingSignals <= 0) return false;
  if (decorativeSignals > 0 && teachingSignals < 3) return false;
  if (decorativeSignals > teachingSignals) return false;
  return true;
}

function sanitizeLearningFigures(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => item && typeof item === "object" ? { ...item, index: Number.isFinite(Number(item.index)) ? Number(item.index) : index } : item)
    .filter(isRelevantLearningFigure);
}

function getLearningFigureByMarker(index) {
  const markerIndex = Number(index);
  if (!Number.isFinite(markerIndex)) return null;
  const byStoredIndex = (visualGalleryData || []).find(item => Number(item?.index) === markerIndex);
  if (isRelevantLearningFigure(byStoredIndex)) return byStoredIndex;
  const direct = (visualGalleryData || [])[markerIndex];
  if (isRelevantLearningFigure(direct)) return direct;
  return sanitizeLearningFigures(visualGalleryData).find(item => Number(item.index) === markerIndex) || null;
}

function cleanSourceFigureDisplayText(value) {
  return String(value || "")
    .replace(/\b(?:IN-TEXT SOURCE FIGURE|VISUAL EVIDENCE)\s+FROM\s+.+?\s+—\s+/gi, "")
    .replace(/\b(?:embedded image on\s+)?(?:PPT slide|PDF page|slide|page)\s+\d+\s*\.?\s*/gi, "")
    .replace(/\b(?:Current slide text preview|Nearby slide context|Page text preview|Slide text preview)\s*:\s*/gi, "")
    .replace(/\bTeaching-signal-count=\d+;\s*decorative-signal-count=\d+(?:;\s*visual-score=-?\d+)?\.?/gi, "")
    .replace(/\bImage-count=\d+;\s*drawing-count=\d+;\s*visual-score=-?\d+\.?/gi, "")
    .replace(/\bUse only if the actual image is\b.*$/gi, "")
    .replace(/\bThis is an image extracted from the slide, not the full slide screenshot\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

const NOTE_SECTION_LABEL_PATTERN = /^(Learning question|Source and argument map|Core notes|Key terms(?: and mechanisms)?|Sources?\s*(?:\(|:)|Core argument|Key ideas?|Concepts? explained|Source evidence|Reading the source evidence|Worked examples?|Evidence matrix|Comparison table|Exam strategy|Common mistakes|Revision(?: checklist)?|Conclusion|学习问题|来源与论点地图|來源與論點地圖|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|核心论点|核心論點|关键概念|關鍵概念|源内证据|源內證據|证据矩阵|證據矩陣|例子与证据|例子與證據|概念比较表|概念比較表|考试策略|考試策略|常见错误|常見錯誤|复习|復習|结论|結論)\b.*$/i;

function normalizeSectionTitle(title) {
  return String(title || "")
    .replace(/^#{1,4}\s+/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function hydrateSectionsFromSummary(existingSections, summary) {
  const existing = existingSections && typeof existingSections === "object" && !Array.isArray(existingSections) ? existingSections : {};
  if (Object.keys(existing).length > 1 || !summary) return existing;

  const parsed = {};
  let currentTitle = "";
  let currentContent = [];

  function commitSection() {
    const title = normalizeSectionTitle(currentTitle);
    const content = currentContent.join("\n").trim();
    if (title && content) parsed[title] = content;
  }

  String(summary || "").split("\n").forEach(rawLine => {
    const line = rawLine.replace(/\s+$/g, "");
    const trimmed = line.trim();
    const markdownHeading = trimmed.match(/^#{1,3}\s+(.+?)\s*$/);
    const promotedHeading = !markdownHeading && NOTE_SECTION_LABEL_PATTERN.test(trimmed) && trimmed.length <= 150;

    if (markdownHeading || promotedHeading) {
      const nextTitle = normalizeSectionTitle(markdownHeading ? markdownHeading[1] : trimmed);
      if (nextTitle) {
        commitSection();
        currentTitle = nextTitle;
        currentContent = [];
        return;
      }
    }

    currentContent.push(line);
  });

  commitSection();
  return Object.keys(parsed).length > 1 ? parsed : existing;
}

function isMostlyEnglishText(text) {
  const value = String(text || "");
  const latinWords = (value.match(/\b[A-Za-z]{3,}\b/g) || []).length;
  const cjkChars = (value.match(/[\u4e00-\u9fff]/g) || []).length;
  return latinWords >= 30 && cjkChars < latinWords * 0.35;
}

function removeAutoBilingualHeadings(summary, language = "auto") {
  if (String(language || "auto") !== "auto" || !isMostlyEnglishText(summary)) {
    return summary || "";
  }
  return String(summary || "").split("\n").map(line => {
    const match = line.match(/^(\s*#{1,4}\s+)(.+?)\s*$/);
    if (!match) return line;
    const [, prefix, heading] = match;
    if (!heading.includes("/")) return line;
    const [left, right] = heading.split("/", 2).map(part => part.trim());
    if (/[A-Za-z]/.test(left) && /[\u4e00-\u9fff]/.test(right)) {
      return `${prefix}${left}`;
    }
    return line;
  }).join("\n");
}

function cleanAutoLanguageSectionTitles(sectionMap, summary, language = "auto") {
  if (String(language || "auto") !== "auto" || !isMostlyEnglishText(summary)) {
    return sectionMap || {};
  }
  return Object.fromEntries(Object.entries(sectionMap || {}).map(([title, content]) => {
    if (!String(title).includes("/")) return [title, content];
    const [left, right] = String(title).split("/", 2).map(part => part.trim());
    if (/[A-Za-z]/.test(left) && /[\u4e00-\u9fff]/.test(right)) {
      return [left, content];
    }
    return [title, content];
  }));
}

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
  formData.append("detail_level", "auto");
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

    const outputLanguage = preferredLanguage ? preferredLanguage.value : "auto";
    fullSummary = removeAutoBilingualHeadings(data.summary || "", outputLanguage);
    storedTitle = data.title || makeHistoryTitle(fullSummary) || "Study Notes";
    sections = cleanAutoLanguageSectionTitles(hydrateSectionsFromSummary(data.sections || {}, fullSummary), fullSummary, outputLanguage);
    connectionsData = data.connections || [];
    currentMindMap = data.mind_map || data.mindMap || data.brainstorm || null;
    visualGalleryData = sanitizeLearningFigures(data.visual_gallery);
    currentPrimarySourceIdentity = data.primary_source_identity || "";
    currentHistoryId = "";
    resetTimelineState();
    resetQuizState();
    resetFlashcardState();
    resetVoiceTutorState();
    activeMindBranchIndex = 0;
    activeMindPointIndex = 0;
    currentSourceFingerprint = data.source_fingerprint || currentSourceFingerprint;
    console.info("Synapse adaptive depth", {
      depth: data.generation_depth || data.detail_level,
      label: data.depth_label,
      reason: data.depth_reason,
      cached: Boolean(data.cached)
    });

    showAnalysisView({ scrollToTop: true });

    renderSections();
    renderConnections();
    switchTool("mindmap");
    renderMindMap(currentMindMap);
    renderVisualGallery();
    const savedEntry = saveHistoryEntry({
      title: data.title || null,
      summary: fullSummary,
      sections,
      connections: connectionsData,
      mindMap: currentMindMap,
      // Do not store base64 slide images in localStorage; they can exceed browser quota.
      visualGallery: [],
      language: data.output_language || outputLanguage,
      detailLevel: data.detail_level || data.generation_depth || "auto",
      depthLabel: data.depth_label || data.generation_depth || data.detail_level || "Auto",
      depthReason: data.depth_reason || "",
      sourceFingerprint: data.source_fingerprint || currentSourceFingerprint,
      clientFingerprint: currentSourceFingerprint,
      primarySourceIdentity: data.primary_source_identity || "",
      sources: data.sources || [],
      visualGalleryCount: visualGalleryData.length,
      cached: Boolean(data.cached)
    });
    if (savedEntry && savedEntry.id) {
      currentHistoryId = savedEntry.id;
      safeSetLocalStorage(ACTIVE_HISTORY_KEY, savedEntry.id);
      await saveVisualGalleryAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint, visualGalleryData);
      if (!visualGalleryData.length) {
        const restoredVisuals = await loadVisualGalleryAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint);
        if (restoredVisuals.length) {
          visualGalleryData = sanitizeLearningFigures(restoredVisuals);
          renderVisualGallery();
        }
      }
    }
    loadTimelineForCurrentNote();
    loadQuizHistoryForCurrentNote();
    loadFlashcardsForCurrentNote();
    loadTutorChatHistoryForCurrentNote();
    loadVoiceTutorHistoryForCurrentNote();
    typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);
    requestAnimationFrame(() => renderMindMap(currentMindMap));
  } catch (error) {
    console.error(error);
    showAnalysisView({ scrollToTop: true });
    visualGalleryData = [];
    renderVisualGallery();
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


function renderVisualGallery() {
  if (!visualGallery) return;
  visualGallery.classList.add("d-none");
  visualGallery.innerHTML = "";
}

function openVisualModal(index) {
  const item = getLearningFigureByMarker(index);
  if (!item || !item.url) return;
  const title = cleanSourceFigureDisplayText(item.title) || `Source figure ${Number(index) + 1}`;
  const sourceTitle = cleanSourceFigureDisplayText(item.source_title || `Source ${item.source_index || ""}`);
  const caption = cleanSourceFigureDisplayText(item.caption || item.what_shows || "");
  const overlay = document.createElement("div");
  overlay.className = "visual-modal";
  overlay.innerHTML = `
    <div class="visual-modal-content">
      <button class="visual-modal-close" type="button" aria-label="Close visual"><i class="bi bi-x-lg"></i></button>
      <img src="${escapeAttr(item.url)}" alt="${escapeAttr(title)}">
      <div class="visual-modal-caption">
        <strong>${escapeHTML(sourceTitle)}</strong>
        ${title ? `<h4>${escapeHTML(title)}</h4>` : ""}
        ${caption ? `<p>${escapeHTML(caption)}</p>` : ""}
      </div>
    </div>
  `;
  overlay.addEventListener("click", event => {
    if (event.target === overlay || event.target.closest(".visual-modal-close")) overlay.remove();
  });
  document.body.appendChild(overlay);
}


function renderInlineVisualCard(index) {
  const item = getLearningFigureByMarker(index);
  if (!item || !item.url) {
    return "";
  }
  const title = cleanSourceFigureDisplayText(item.title) || `Source figure ${Number(index) + 1}`;
  const source = cleanSourceFigureDisplayText(item.source_title || `Source ${item.source_index || ""}`);
  const caption = cleanSourceFigureDisplayText(item.caption || item.what_shows || "");
  return `
    <figure class="inline-visual-card" onclick="openVisualModal(${Number(index)})">
      <div class="inline-visual-image-wrap">
        <img src="${escapeAttr(item.url)}" alt="${escapeAttr(title)}" loading="lazy">
      </div>
      <figcaption>
        <div class="inline-visual-kicker">In-text source</div>
        <h4>${escapeHTML(title)}</h4>
        <p><strong>${escapeHTML(source)}</strong></p>
        ${caption ? `<p>${escapeHTML(shorten(caption, 180))}</p>` : ""}
      </figcaption>
    </figure>
  `;
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
  btn.title = title;
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
  sectionTitle.innerText = "Study Notes";
  contextLabel.textContent = "Current Notes";
  document.querySelectorAll(".section-btn").forEach(button => button.classList.remove("active"));
  typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);
}

function getToolPanelId(toolName) {
  const ids = {
    mindmap: "toolPanelMindMap",
    timeline: "toolPanelTimeline",
    quiz: "toolPanelQuiz",
    flashcards: "toolPanelFlashcards"
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
  } else if (toolName === "timeline") {
    document.getElementById("toolBtnTimeline")?.classList.add("active");
  } else if (toolName === "quiz") {
    document.getElementById("toolBtnQuiz")?.classList.add("active");
  } else if (toolName === "flashcards") {
    document.getElementById("toolBtnFlashcards")?.classList.add("active");
  }

  if (toolName === "mindmap") {
    requestAnimationFrame(() => renderMindMap(currentMindMap));
  } else if (toolName === "timeline") {
    renderTimelinePanel();
  } else if (toolName === "quiz") {
    renderQuizPanel();
    if (!isQuizGenerating && (!currentQuiz || !Array.isArray(currentQuiz.questions) || !currentQuiz.questions.length)) {
      requestAnimationFrame(() => openQuizSettingsModal());
    }
  } else if (toolName === "flashcards") {
    renderFlashcardPanel();
  }
}

function cloneQuizSettings(settings) {
  return JSON.parse(JSON.stringify(settings || QUIZ_DEFAULT_SETTINGS));
}

function loadQuizSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || "null");
    return normalizeQuizSettings(saved || QUIZ_DEFAULT_SETTINGS);
  } catch {
    return cloneQuizSettings(QUIZ_DEFAULT_SETTINGS);
  }
}

function normalizeQuizType(type) {
  return QUIZ_TYPE_OPTIONS.some(option => option.value === type) ? type : "single_choice";
}

function normalizeQuizLanguage(language) {
  return QUIZ_LANGUAGE_OPTIONS.some(option => option.value === language) ? language : "multi_language";
}

function getQuizLanguageLabel(language) {
  return QUIZ_LANGUAGE_OPTIONS.find(option => option.value === normalizeQuizLanguage(language))?.label || "Multi-language";
}

function cloneFlashcardSettings(settings) {
  return JSON.parse(JSON.stringify(settings || FLASHCARD_DEFAULT_SETTINGS));
}

function normalizeFlashcardLanguage(language) {
  return QUIZ_LANGUAGE_OPTIONS.some(option => option.value === language) ? language : "english";
}

function normalizeFlashcardSettings(settings) {
  const source = settings && typeof settings === "object" ? settings : FLASHCARD_DEFAULT_SETTINGS;
  const countMode = ["auto", "30", "60", "custom"].includes(String(source.countMode)) ? String(source.countMode) : "auto";
  return {
    preferredLanguage: normalizeFlashcardLanguage(source.preferredLanguage),
    countMode,
    customCount: Math.max(1, Math.min(Number.parseInt(source.customCount, 10) || 20, 80))
  };
}

function loadFlashcardSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(FLASHCARD_SETTINGS_KEY) || "null");
    return normalizeFlashcardSettings(saved || FLASHCARD_DEFAULT_SETTINGS);
  } catch {
    return cloneFlashcardSettings(FLASHCARD_DEFAULT_SETTINGS);
  }
}

function clampQuizNumber(value, fallback = 1) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(1, Math.min(number, 40));
}

function normalizeQuizSettings(settings) {
  const source = settings && typeof settings === "object" ? settings : QUIZ_DEFAULT_SETTINGS;
  const rows = Array.isArray(source.questionTypes) && source.questionTypes.length
    ? source.questionTypes
    : QUIZ_DEFAULT_SETTINGS.questionTypes;
  const questionTypes = rows.map(row => ({
    type: normalizeQuizType(row.type),
    count: clampQuizNumber(row.count, 1)
  }));
  const totalQuestions = clampQuizNumber(source.totalQuestions || questionTypes.reduce((sum, row) => sum + row.count, 0), 6);
  return {
    examMode: Boolean(source.examMode),
    preferredLanguage: normalizeQuizLanguage(source.preferredLanguage),
    totalQuestions,
    questionTypes
  };
}

function resetQuizState() {
  currentQuiz = null;
  quizHistory = [];
  quizAnswers = {};
  quizRevealedAnswers = new Set();
  quizReport = null;
  quizError = "";
  isQuizGenerating = false;
  activeQuizQuestionIndex = 0;
  activeQuizHistoryId = "";
  renderQuizPanel();
}

function normalizeTimelineType(value) {
  const clean = String(value || "").toLowerCase().replace(/[\s-]+/g, "_");
  if (TIMELINE_TYPE_OPTIONS.some(option => option.value === clean)) return clean;
  if (["lecture_flow", "flow", "overview", "sequence"].includes(clean)) return "warm_up";
  if (["concept", "definition", "method", "mechanism"].includes(clean)) return "learn";
  if (["evidence", "data", "study", "experiment", "figure", "example", "case", "application"].includes(clean)) return "apply";
  if (["exam", "assessment", "test"].includes(clean)) return "check";
  if (["revision", "review", "mistake", "common_mistake"].includes(clean)) return "revise";
  return "learn";
}

function getTimelineTypeLabel(value) {
  const type = normalizeTimelineType(value);
  return TIMELINE_TYPE_OPTIONS.find(option => option.value === type)?.label || "Concepts";
}

function normalizeStudyPathQuestionType(value) {
  const clean = String(value || "").toLowerCase().replace(/[\s-]+/g, "_");
  if (STUDY_PATH_QUESTION_TYPE_OPTIONS.some(option => option.value === clean)) return clean;
  if (["mcq", "choice", "single", "single_choice_question"].includes(clean)) return "single_choice";
  if (["multi", "multiple", "multiple_choice_question"].includes(clean)) return "multiple_choice";
  if (["tf", "truefalse", "true_or_false", "true_false_question"].includes(clean)) return "true_false";
  if (["short", "short_response", "open_response", "open_ended"].includes(clean)) return "short_answer";
  if (["case", "application", "scenario"].includes(clean)) return "case_analysis";
  if (["essay", "outline", "exam_outline"].includes(clean)) return "essay_outline";
  if (["diagram", "figure", "visual", "graph", "chart"].includes(clean)) return "diagram_prompt";
  if (["contrast", "compare_contrast", "comparison"].includes(clean)) return "compare";
  return "short_answer";
}

function getStudyPathQuestionTypeMeta(value) {
  const type = normalizeStudyPathQuestionType(value);
  return STUDY_PATH_QUESTION_TYPE_OPTIONS.find(option => option.value === type) || STUDY_PATH_QUESTION_TYPE_OPTIONS[0];
}

function normalizeStudyPathQuestionOptions(value) {
  return Array.isArray(value)
    ? value.map(option => String(option || "").trim()).filter(Boolean).slice(0, 6)
    : [];
}

function normalizeStudyPathCorrectIndexes(value, options) {
  const rawValues = Array.isArray(value) ? value : (value == null ? [] : [value]);
  const indexes = [];
  rawValues.forEach(raw => {
    let index = null;
    if (Number.isInteger(raw)) {
      index = raw;
    } else {
      const text = String(raw || "").trim();
      if (/^\d+$/.test(text)) {
        index = Number.parseInt(text, 10);
      } else if (/^[A-F]$/i.test(text)) {
        index = text.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
      } else {
        index = options.findIndex(option => option.toLowerCase() === text.toLowerCase());
      }
    }
    if (Number.isInteger(index) && index >= 0 && index < options.length && !indexes.includes(index)) {
      indexes.push(index);
    }
  });
  return indexes;
}

function normalizeStudyPathBoolean(value) {
  if (typeof value === "boolean") return value;
  const text = String(value || "").trim().toLowerCase();
  if (["true", "yes", "correct", "right", "对", "正确", "是"].includes(text)) return true;
  if (["false", "no", "incorrect", "wrong", "错", "错误", "否"].includes(text)) return false;
  return null;
}

function normalizeStudyPathPracticeQuestion(raw, event, index) {
  const fallbackPrompt = String(
    event?.active_prompt || event?.activePrompt || event?.recall_prompt || event?.recallPrompt ||
    event?.task || event?.summary || `Answer one short question about checkpoint ${index + 1}.`
  ).trim();
  const source = raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw
    : { prompt: typeof raw === "string" ? raw : fallbackPrompt };
  const type = normalizeStudyPathQuestionType(source.type || source.question_type || source.questionType || event?.question_type);
  let options = normalizeStudyPathQuestionOptions(source.options || source.choices);
  if (type === "true_false" && options.length < 2) options = ["True", "False"];
  const prompt = String(source.prompt || source.question || source.title || fallbackPrompt).trim();
  const correctOptionIndexes = normalizeStudyPathCorrectIndexes(
    source.correct_option_indexes ?? source.correctOptionIndexes ?? source.correct_indexes ?? source.answer_index ?? source.answer,
    options
  );
  const correctBoolean = normalizeStudyPathBoolean(source.correct_boolean ?? source.correctBoolean ?? source.answer);
  return {
    type,
    prompt,
    options,
    correctOptionIndexes,
    correctBoolean,
    expectedAnswer: String(source.expected_answer || source.expectedAnswer || source.answer_guide || source.answerGuide || "").trim(),
    explanation: String(source.explanation || source.rationale || "").trim(),
    sourceReference: String(source.source_reference || source.sourceReference || event?.source_reference || event?.sourceReference || "").trim()
  };
}

function getTimelineNoteKey() {
  if (currentHistoryId) return `history:${currentHistoryId}`;
  if (currentSourceFingerprint) return `fingerprint:${currentSourceFingerprint}`;
  return "";
}

function getTimelineStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIMELINE_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function setTimelineStore(store) {
  return safeSetLocalStorage(TIMELINE_STORAGE_KEY, JSON.stringify(store || {}));
}

function normalizeTimelineEvent(event, index) {
  const title = String(event?.title || event?.label || `Checkpoint ${index + 1}`).trim();
  const estimatedMinutes = Math.max(3, Math.min(Number.parseInt(event?.estimated_minutes || event?.estimatedMinutes || event?.minutes, 10) || 8, 60));
  return {
    id: event?.id || `tl-${index + 1}`,
    order: Number.isFinite(Number(event?.order)) ? Number(event.order) : index + 1,
    marker: String(event?.marker || event?.time || event?.step || `Task ${index + 1}`).trim(),
    type: normalizeTimelineType(event?.type),
    title,
    section: String(event?.section || "").trim(),
    summary: String(event?.summary || event?.what_happens || "").trim(),
    detail: String(event?.detail || event?.explanation || event?.why || "").trim(),
    task: String(event?.task || event?.action || event?.study_task || event?.studyTask || "").trim(),
    activePrompt: String(event?.active_prompt || event?.activePrompt || event?.recall_prompt || event?.recallPrompt || "").trim(),
    practiceQuestion: normalizeStudyPathPracticeQuestion(event?.practice_question || event?.practiceQuestion || event?.question, event, index),
    deliverable: String(event?.deliverable || event?.output || "").trim(),
    masteryCheck: String(event?.mastery_check || event?.masteryCheck || event?.checkpoint || "").trim(),
    estimatedMinutes,
    priority: String(event?.priority || "medium").trim().toLowerCase(),
    evidence: String(event?.evidence || event?.source_evidence || "").trim(),
    whyItMatters: String(event?.why_it_matters || event?.whyItMatters || "").trim(),
    misconception: String(event?.misconception || event?.common_mistake || "").trim(),
    examUse: String(event?.exam_use || event?.examUse || "").trim(),
    sourceReference: String(event?.source_reference || event?.sourceReference || "").trim(),
    relatedTerms: Array.isArray(event?.related_terms || event?.relatedTerms)
      ? (event.related_terms || event.relatedTerms).map(term => String(term).trim()).filter(Boolean).slice(0, 6)
      : []
  };
}

function normalizeTimeline(data) {
  const events = Array.isArray(data?.events) ? data.events : [];
  const normalizedEvents = events
    .map(normalizeTimelineEvent)
    .filter(event => event.title && (event.summary || event.detail || event.evidence))
    .sort((a, b) => a.order - b.order)
    .slice(0, 18);
  return {
    title: String(data?.title || `${storedTitle || "Study"} Timeline`).trim(),
    summary: String(data?.summary || "").trim(),
    generatedAt: data?.generated_at || data?.generatedAt || new Date().toISOString(),
    events: normalizedEvents
  };
}

function persistTimelineForCurrentNote() {
  const key = getTimelineNoteKey();
  if (!key || !currentTimeline || !Array.isArray(currentTimeline.events) || !currentTimeline.events.length) return;
  const store = getTimelineStore();
  store[key] = {
    title: storedTitle,
    updatedAt: new Date().toISOString(),
    timeline: currentTimeline,
    completedIds: Array.from(timelineCompletedIds),
    practiceAnswers: timelinePracticeAnswers
  };
  setTimelineStore(store);
}

function loadTimelineForCurrentNote() {
  const store = getTimelineStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const record = keys.map(key => store[key]).find(item => item && item.timeline);
  currentTimeline = record ? normalizeTimeline(record.timeline) : null;
  timelineCompletedIds = new Set(Array.isArray(record?.completedIds) ? record.completedIds.map(id => String(id)) : []);
  timelinePracticeAnswers = record?.practiceAnswers && typeof record.practiceAnswers === "object" && !Array.isArray(record.practiceAnswers)
    ? record.practiceAnswers
    : {};
  Object.values(timelinePracticeAnswers).forEach(state => {
    if (state && state.status === "checking") state.status = "idle";
  });
  activeTimelineIndex = 0;
  activeTimelineFilter = "all";
  timelineError = "";
}

function deleteTimelinePath(historyId, sourceFingerprint = "") {
  const store = getTimelineStore();
  delete store[`history:${historyId}`];
  if (sourceFingerprint) delete store[`fingerprint:${sourceFingerprint}`];
  setTimelineStore(store);
}

function getTimelineEventsForFilter() {
  const events = currentTimeline?.events || [];
  if (activeTimelineFilter === "all") return events;
  return events.filter(event => event.type === activeTimelineFilter);
}

function renderTimelinePanel() {
  const panel = document.getElementById("timelinePanelContent");
  if (!panel) return;
  const hasNotes = Boolean(fullSummary && fullSummary.trim());

  if (isTimelineGenerating) {
    panel.innerHTML = `
      <div class="timeline-loading-card">
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <div>
          <strong>Building study path...</strong>
          <p>Synapse is turning the notes into concrete learning tasks, short practice questions, and revision checkpoints.</p>
        </div>
      </div>
    `;
    return;
  }

  if (timelineError) {
    panel.innerHTML = `
      <div class="alert alert-danger">
        <strong>Study path generation failed.</strong><br>${escapeHTML(timelineError)}
      </div>
      ${renderTimelineLaunchCard(hasNotes)}
    `;
    return;
  }

  if (!currentTimeline || !Array.isArray(currentTimeline.events) || !currentTimeline.events.length) {
    panel.innerHTML = renderTimelineLaunchCard(hasNotes);
    return;
  }

  panel.innerHTML = renderTimeline();
  renderMath();
}

function renderTimelineLaunchCard(hasNotes) {
  return `
    <div class="timeline-launch-card">
      <div class="timeline-launch-icon"><i class="bi bi-signpost-split"></i></div>
      <div class="timeline-launch-copy">
        <h4>Create a study path</h4>
        <p>${hasNotes
          ? "Turn the current notes into a guided sequence of learning tasks, short questions, and revision checks."
          : "Generate notes first, then build an interactive study path from them."}</p>
      </div>
      <button class="btn btn-primary timeline-generate-btn" type="button" onclick="generateTimeline(false)" ${hasNotes ? "" : "disabled"}>
        <i class="bi bi-stars me-1"></i>Generate study path
      </button>
    </div>
  `;
}

function renderTimeline() {
  const events = getTimelineEventsForFilter();
  if (activeTimelineIndex >= events.length) activeTimelineIndex = 0;
  const activeEvent = events[activeTimelineIndex] || events[0];
  const allEvents = currentTimeline.events || [];
  const completedCount = allEvents.filter(event => timelineCompletedIds.has(event.id)).length;
  const totalMinutes = allEvents.reduce((sum, event) => sum + (event.estimatedMinutes || 0), 0);
  const progressPercent = allEvents.length ? Math.round((completedCount / allEvents.length) * 100) : 0;
  const filterButtons = TIMELINE_TYPE_OPTIONS.map(option => {
    const count = option.value === "all"
      ? (currentTimeline.events || []).length
      : (currentTimeline.events || []).filter(event => event.type === option.value).length;
    return `
      <button class="timeline-filter-btn ${activeTimelineFilter === option.value ? "active" : ""}" type="button"
        onclick="setTimelineFilter('${escapeAttr(option.value)}')" ${count ? "" : "disabled"}>
        ${escapeHTML(option.label)} <span>${count}</span>
      </button>
    `;
  }).join("");

  const eventNodes = events.map((event, index) => `
    <button class="timeline-node ${index === activeTimelineIndex ? "active" : ""}" type="button"
      onclick="selectTimelineEvent(${index})">
      <span class="timeline-node-check ${timelineCompletedIds.has(event.id) ? "done" : ""}">${timelineCompletedIds.has(event.id) ? "✓" : index + 1}</span>
      <span class="timeline-node-marker">${escapeHTML(event.marker || `Task ${index + 1}`)} · ${event.estimatedMinutes || 8} min</span>
      <span class="timeline-node-title">${escapeHTML(event.title)}</span>
      <span class="timeline-node-type">${escapeHTML(getTimelineTypeLabel(event.type))}</span>
    </button>
  `).join("");

  return `
    <div class="timeline-shell">
      <div class="timeline-hero">
        <div>
          <div class="timeline-kicker">Guided study path</div>
          <h4>${escapeHTML(currentTimeline.title || "Study Path")}</h4>
          <p>${escapeHTML(currentTimeline.summary || "Move through concrete tasks that help you understand, practise, and check the notes.")}</p>
          <div class="timeline-progress-row">
            <span>${completedCount}/${allEvents.length} done</span>
            <span>${totalMinutes || "Auto"} min plan</span>
            <span>${progressPercent}% complete</span>
          </div>
          <div class="timeline-progress-track" aria-label="Study path progress">
            <div style="width:${progressPercent}%"></div>
          </div>
        </div>
        <button class="btn btn-outline-primary btn-sm" type="button" onclick="generateTimeline(true)">
          <i class="bi bi-arrow-clockwise me-1"></i>Regenerate
        </button>
      </div>

      <div class="timeline-filters">${filterButtons}</div>

      <div class="timeline-layout">
        <div class="timeline-rail" aria-label="Timeline events">
          ${eventNodes || `<div class="timeline-empty-small">No items in this filter.</div>`}
        </div>
        <div class="timeline-detail">
          ${activeEvent ? renderTimelineDetail(activeEvent) : `<div class="timeline-empty-small">Choose another filter.</div>`}
        </div>
      </div>
    </div>
  `;
}

function renderTimelineDetail(event) {
  const done = timelineCompletedIds.has(event.id);
  const answerState = getTimelinePracticeState(event.id);
  const canMarkDone = done || answerState.status === "correct";
  return `
    <article class="timeline-detail-card">
      <div class="timeline-detail-head">
        <span class="timeline-detail-badge">${escapeHTML(getTimelineTypeLabel(event.type))}</span>
        <span class="timeline-detail-marker">${escapeHTML(event.marker)} · ${event.estimatedMinutes || 8} min</span>
      </div>
      <h4>${escapeHTML(event.title)}</h4>
      ${event.summary ? `<div class="timeline-summary">${markdownToHTML(event.summary)}</div>` : ""}
      <div class="timeline-task-card">
        <div>
          <strong>Do this now</strong>
          <p>${markdownToHTML(event.task || event.detail || event.summary || "Review this checkpoint and produce a short explanation in your own words.")}</p>
        </div>
        <button class="timeline-complete-btn ${done ? "done" : ""}" type="button"
          onclick="toggleTimelineComplete('${escapeAttr(event.id)}')" ${canMarkDone ? "" : "disabled"}
          title="${canMarkDone ? "" : "Answer and check the practice question first."}">
          ${done ? "Done" : (canMarkDone ? "Mark done" : "Answer first")}
        </button>
      </div>
      ${renderStudyPathPracticeQuestion(event, answerState)}
      ${event.activePrompt ? `<div class="timeline-block recall"><strong>Active recall prompt</strong><div>${markdownToHTML(event.activePrompt)}</div></div>` : ""}
      ${event.deliverable ? `<div class="timeline-block"><strong>Output</strong><div>${markdownToHTML(event.deliverable)}</div></div>` : ""}
      ${event.masteryCheck ? `<div class="timeline-block exam"><strong>Mastery check</strong><div>${markdownToHTML(event.masteryCheck)}</div></div>` : ""}
      ${event.detail ? `<div class="timeline-block"><strong>Support</strong><div>${markdownToHTML(event.detail)}</div></div>` : ""}
      ${event.evidence ? `<div class="timeline-block evidence"><strong>Source evidence</strong><div>${markdownToHTML(event.evidence)}</div></div>` : ""}
      ${event.whyItMatters ? `<div class="timeline-block"><strong>Why it matters</strong><div>${markdownToHTML(event.whyItMatters)}</div></div>` : ""}
      ${event.misconception ? `<div class="timeline-block warning"><strong>Watch out</strong><div>${markdownToHTML(event.misconception)}</div></div>` : ""}
      ${event.examUse ? `<div class="timeline-block exam"><strong>Exam use</strong><div>${markdownToHTML(event.examUse)}</div></div>` : ""}
      ${event.relatedTerms.length ? `
        <div class="timeline-term-row">
          ${event.relatedTerms.map(term => `<span>${escapeHTML(term)}</span>`).join("")}
        </div>
      ` : ""}
      <div class="timeline-actions">
        <button class="btn btn-outline-primary btn-sm" type="button" onclick="openTimelineEventNotes()">
          <i class="bi bi-journal-text me-1"></i>Open notes
        </button>
        <button class="btn btn-primary btn-sm" type="button" onclick="askTimelineEventTutor()">
          <i class="bi bi-chat-square-text me-1"></i>Ask tutor
        </button>
      </div>
    </article>
  `;
}

function renderStudyPathPracticeQuestion(event, answerState = {}) {
  const question = event?.practiceQuestion;
  if (!question || !question.prompt) return "";
  const meta = getStudyPathQuestionTypeMeta(question.type);
  const correctAnswer = getStudyPathCorrectAnswerText(question);
  const isCorrect = answerState.status === "correct";
  const answerGuide = [
    correctAnswer ? `<div><strong>Correct answer:</strong> ${escapeHTML(correctAnswer)}</div>` : "",
    question.expectedAnswer ? `<div>${markdownToHTML(question.expectedAnswer)}</div>` : "",
    question.explanation ? `<div class="study-path-answer-explanation">${markdownToHTML(question.explanation)}</div>` : ""
  ].filter(Boolean).join("");
  return `
    <section class="study-path-question-card">
      <div class="study-path-question-head">
        <span><i class="bi bi-question-circle me-1"></i>Practice question</span>
        <span class="study-path-question-type">${escapeHTML(meta.label)}</span>
      </div>
      <div class="study-path-question-prompt">${markdownToHTML(question.prompt)}</div>
      ${question.sourceReference ? `<div class="study-path-question-source"><i class="bi bi-link-45deg me-1"></i>${escapeHTML(question.sourceReference)}</div>` : ""}
      ${renderStudyPathQuestionInput(event.id, question, meta, answerState)}
      <div class="study-path-question-actions">
        <button class="btn btn-primary btn-sm" type="button" onclick="checkStudyPathAnswer('${escapeAttr(event.id)}')"
          ${answerState.status !== "checking" && !isCorrect ? "" : "disabled"}>
          ${answerState.status === "checking" ? `<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Checking...` : "Check answer"}
        </button>
        <span>${isCorrect ? "Correct. You can mark this task done." : "Answer the question, then check it."}</span>
      </div>
      ${renderStudyPathQuestionFeedback(answerState)}
      ${isCorrect && answerGuide ? `
        <details class="study-path-answer-guide">
          <summary>Answer guide</summary>
          ${answerGuide}
        </details>
      ` : ""}
    </section>
  `;
}

function getStudyPathCorrectAnswerText(question) {
  if (!question || !Array.isArray(question.options) || !question.options.length) return "";
  if (question.type === "true_false" && typeof question.correctBoolean === "boolean") {
    const index = question.correctBoolean ? 0 : 1;
    return `${String.fromCharCode(65 + index)}. ${question.options[index] || ""}`;
  }
  const indexes = Array.isArray(question.correctOptionIndexes) ? question.correctOptionIndexes : [];
  return indexes
    .filter(index => Number.isInteger(index) && index >= 0 && index < question.options.length)
    .map(index => `${String.fromCharCode(65 + index)}. ${question.options[index] || ""}`)
    .join("; ");
}

function renderStudyPathQuestionInput(eventId, question, meta, answerState = {}) {
  if (question.type === "single_choice" || question.type === "multiple_choice") {
    return renderStudyPathChoiceOptions(eventId, question, question.type === "multiple_choice" ? "checkbox" : "radio", answerState);
  }
  if (question.type === "true_false") {
    return renderStudyPathChoiceOptions(eventId, {
      ...question,
      options: question.options?.length >= 2 ? question.options.slice(0, 2) : ["True", "False"]
    }, "radio", answerState);
  }
  return `
    <textarea class="study-path-answer-box" rows="${question.type === "essay_outline" ? 5 : 3}"
      placeholder="${escapeAttr(meta.hint || "Write a quick answer before opening the guide.")}"
      oninput="updateStudyPathTextAnswer('${escapeAttr(eventId)}', this.value)">${escapeHTML(answerState.answer || "")}</textarea>
  `;
}

function renderStudyPathChoiceOptions(eventId, question, inputType, answerState = {}) {
  const answer = answerState.answer;
  return `
    <div class="study-path-question-options">
      ${(question.options || []).map((option, index) => `
        <label class="study-path-option">
          <input class="form-check-input" type="${inputType}" name="study-path-${escapeAttr(eventId)}" value="${index}"
            ${isStudyPathChoiceSelected(answer, index, inputType) ? "checked" : ""}
            onchange="updateStudyPathChoiceAnswer('${escapeAttr(eventId)}', ${index}, '${inputType}', this.checked)">
          <span>${String.fromCharCode(65 + index)}</span>
          <p>${escapeHTML(option)}</p>
        </label>
      `).join("")}
    </div>
  `;
}

function renderStudyPathQuestionFeedback(answerState = {}) {
  if (!answerState.feedback || answerState.status === "checking") return "";
  const statusClass = answerState.status === "correct"
    ? "correct"
    : (answerState.status === "retry" ? "retry" : "incorrect");
  return `
    <div class="study-path-question-feedback ${statusClass}">
      ${markdownToHTML(answerState.feedback)}
    </div>
  `;
}

function getTimelinePracticeState(eventId) {
  const id = String(eventId || "");
  const current = timelinePracticeAnswers[id];
  return current && typeof current === "object"
    ? current
    : { answer: null, status: "idle", feedback: "" };
}

function setTimelinePracticeState(eventId, patch = {}, shouldRender = false) {
  const id = String(eventId || "");
  if (!id) return;
  const previous = getTimelinePracticeState(id);
  timelinePracticeAnswers[id] = {
    ...previous,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  persistTimelineForCurrentNote();
  if (shouldRender) renderTimelinePanel();
}

function updateStudyPathTextAnswer(eventId, value) {
  const previous = getTimelinePracticeState(eventId);
  const shouldReset = ["correct", "incorrect", "retry", "error"].includes(previous.status);
  setTimelinePracticeState(eventId, {
    answer: value,
    status: shouldReset ? "idle" : previous.status,
    feedback: shouldReset ? "" : previous.feedback
  });
}

function updateStudyPathChoiceAnswer(eventId, optionIndex, inputType, checked) {
  const previous = getTimelinePracticeState(eventId);
  let answer = inputType === "checkbox" && Array.isArray(previous.answer) ? [...previous.answer] : previous.answer;
  if (inputType === "checkbox") {
    if (!Array.isArray(answer)) answer = [];
    if (checked && !answer.includes(optionIndex)) answer.push(optionIndex);
    if (!checked) answer = answer.filter(index => index !== optionIndex);
    answer.sort((a, b) => a - b);
  } else {
    answer = optionIndex;
  }
  const shouldReset = ["correct", "incorrect", "retry", "error"].includes(previous.status);
  setTimelinePracticeState(eventId, {
    answer,
    status: shouldReset ? "idle" : previous.status,
    feedback: shouldReset ? "" : previous.feedback
  });
}

function isStudyPathChoiceSelected(answer, optionIndex, inputType) {
  if (inputType === "checkbox") return Array.isArray(answer) && answer.includes(optionIndex);
  return isStudyPathSingleChoiceValue(answer) && Number(answer) === optionIndex;
}

function isStudyPathAnswerPresent(question, answer) {
  if (!question) return false;
  if (question.type === "multiple_choice") return Array.isArray(answer) && answer.length > 0;
  if (question.type === "single_choice" || question.type === "true_false") return isStudyPathSingleChoiceValue(answer);
  return String(answer || "").trim().length > 0;
}

function isStudyPathSingleChoiceValue(answer) {
  return answer !== null && answer !== undefined && answer !== "" && Number.isInteger(Number(answer));
}

function getTimelineEventIndexById(eventId) {
  return (currentTimeline?.events || []).findIndex(event => String(event.id) === String(eventId));
}

function getTimelineEventById(eventId) {
  const index = getTimelineEventIndexById(eventId);
  return index >= 0 ? currentTimeline.events[index] : null;
}

function makeStudyPathAnswerPayload(question, answer) {
  if (question.type === "single_choice" || question.type === "true_false") {
    const index = Number(answer);
    return {
      selected_indexes: Number.isInteger(index) ? [index] : [],
      selected_options: Number.isInteger(index) ? [question.options?.[index] || ""] : [],
      text: Number.isInteger(index) ? question.options?.[index] || "" : ""
    };
  }
  if (question.type === "multiple_choice") {
    const indexes = Array.isArray(answer) ? answer.map(Number).filter(Number.isInteger) : [];
    return {
      selected_indexes: indexes,
      selected_options: indexes.map(index => question.options?.[index] || "").filter(Boolean),
      text: indexes.map(index => question.options?.[index] || "").filter(Boolean).join("; ")
    };
  }
  return { text: String(answer || "").trim() };
}

async function checkStudyPathAnswer(eventId) {
  const event = getTimelineEventById(eventId);
  if (!event || !event.practiceQuestion) return;
  const state = getTimelinePracticeState(eventId);
  if (!isStudyPathAnswerPresent(event.practiceQuestion, state.answer)) {
    setTimelinePracticeState(eventId, {
      status: "error",
      feedback: "Answer the practice question before checking it."
    }, true);
    return;
  }

  setTimelinePracticeState(eventId, {
    status: "checking",
    feedback: ""
  }, true);

  try {
    const response = await fetch(`${API_BASE}/timeline/check-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: storedTitle,
        summary: fullSummary,
        sections,
        preferred_language: preferredLanguage ? preferredLanguage.value : "auto",
        event: {
          id: event.id,
          type: event.type,
          title: event.title,
          section: event.section,
          summary: event.summary,
          detail: event.detail,
          task: event.task,
          evidence: event.evidence,
          source_reference: event.sourceReference
        },
        question: event.practiceQuestion,
        answer: makeStudyPathAnswerPayload(event.practiceQuestion, state.answer)
      })
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Answer check failed with status ${response.status}.`);
    }
    if (data.correct) {
      setTimelinePracticeState(eventId, {
        status: "correct",
        feedback: data.feedback || "Correct. You can mark this task done."
      }, true);
      return;
    }

    const eventIndex = getTimelineEventIndexById(eventId);
    const targetEvent = eventIndex >= 0 ? currentTimeline.events[eventIndex] : event;
    const rawQuestion = data.new_question || data.practice_question || data.replacement_question;
    if (rawQuestion && targetEvent) {
      targetEvent.practiceQuestion = normalizeStudyPathPracticeQuestion(rawQuestion, targetEvent, eventIndex >= 0 ? eventIndex : 0);
    }
    timelineCompletedIds.delete(String(eventId));
    setTimelinePracticeState(eventId, {
      answer: null,
      status: "retry",
      feedback: data.feedback || "Not quite. A new question has been loaded for another try."
    }, true);
  } catch (error) {
    console.error(error);
    setTimelinePracticeState(eventId, {
      status: "error",
      feedback: error.message || "Could not check this answer."
    }, true);
  }
}

function setTimelineFilter(value) {
  activeTimelineFilter = TIMELINE_TYPE_OPTIONS.some(option => option.value === value) ? value : "all";
  activeTimelineIndex = 0;
  renderTimelinePanel();
}

function selectTimelineEvent(index) {
  const events = getTimelineEventsForFilter();
  activeTimelineIndex = Math.max(0, Math.min(index, events.length - 1));
  renderTimelinePanel();
}

function toggleTimelineComplete(eventId) {
  const id = String(eventId || "");
  if (!id) return;
  if (timelineCompletedIds.has(id)) {
    timelineCompletedIds.delete(id);
  } else {
    const answerState = getTimelinePracticeState(id);
    if (answerState.status !== "correct") {
      setTimelinePracticeState(id, {
        status: "error",
        feedback: "Check and pass the practice question before marking this task done."
      }, true);
      return;
    }
    timelineCompletedIds.add(id);
  }
  persistTimelineForCurrentNote();
  renderTimelinePanel();
}

async function generateTimeline(force = false) {
  if (!fullSummary || !fullSummary.trim()) {
    alert("Generate notes first, then create a study path.");
    return;
  }
  if (!force && currentTimeline?.events?.length) {
    switchTool("timeline");
    renderTimelinePanel();
    return;
  }

  isTimelineGenerating = true;
  timelineError = "";
  switchTool("timeline");
  renderTimelinePanel();

  try {
    const response = await fetch(`${API_BASE}/timeline/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: storedTitle,
        summary: fullSummary,
        sections,
        source_fingerprint: currentSourceFingerprint,
        preferred_language: preferredLanguage ? preferredLanguage.value : "auto"
      })
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Study path generation failed with status ${response.status}.`);
    }
    currentTimeline = normalizeTimeline(data);
    timelineCompletedIds = new Set();
    timelinePracticeAnswers = {};
    activeTimelineFilter = "all";
    activeTimelineIndex = 0;
    persistTimelineForCurrentNote();
  } catch (error) {
    console.error(error);
    timelineError = error.message || "Study path generation failed.";
  } finally {
    isTimelineGenerating = false;
    renderTimelinePanel();
  }
}

function getActiveTimelineEvent() {
  const events = getTimelineEventsForFilter();
  return events[activeTimelineIndex] || null;
}

function openTimelineEventNotes() {
  const event = getActiveTimelineEvent();
  if (!event) return;
  activateSectionFromMap(event.section || event.title);
}

function askTimelineEventTutor() {
  const event = getActiveTimelineEvent();
  if (!event) return;
  const practicePrompt = event.practiceQuestion?.prompt
    ? `Help me answer this ${getStudyPathQuestionTypeMeta(event.practiceQuestion.type).label.toLowerCase()} study-path question from "${event.title}": ${event.practiceQuestion.prompt}`
    : "";
  const prompt = practicePrompt || `Help me complete this study task from "${event.title}": ${event.activePrompt || event.task || event.detail || event.summary || event.evidence}`;
  switchTab("chat", document.querySelector('.asst-tab[onclick*="chat"]'));
  openAssistant();
  if (questionInput) {
    questionInput.value = prompt;
    questionInput.focus();
  }
}

function resetTimelineState() {
  currentTimeline = null;
  activeTimelineIndex = 0;
  activeTimelineFilter = "all";
  timelineError = "";
  isTimelineGenerating = false;
  timelineCompletedIds = new Set();
  timelinePracticeAnswers = {};
  renderTimelinePanel();
}

function setupTimelineTool() {
  const switcher = document.querySelector(".tool-switcher");
  const timelineButton = switcher
    ? Array.from(switcher.querySelectorAll(".tool-switch-btn")).find(button =>
      button.id === "toolBtnTimeline"
      || button.querySelector(".bi-clock-history")
      || button.querySelector(".bi-signpost-split")
      || button.textContent.trim().toLowerCase().includes("timeline")
      || button.textContent.trim().toLowerCase().includes("study path")
    )
    : null;

  if (timelineButton) {
    timelineButton.id = "toolBtnTimeline";
    timelineButton.disabled = false;
    timelineButton.classList.remove("disabled");
    timelineButton.setAttribute("aria-disabled", "false");
    timelineButton.innerHTML = `<i class="bi bi-signpost-split me-1"></i>Study Path`;
    timelineButton.onclick = () => switchTool("timeline", timelineButton);
  }

  const studyToolsCard = document.querySelector(".study-tools-card");
  if (studyToolsCard && !document.getElementById("toolPanelTimeline")) {
    const mindPanel = document.getElementById("toolPanelMindMap");
    const timelinePanelHTML = `
      <div id="toolPanelTimeline" class="tool-panel">
        <div class="tool-panel-head d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h3>Study Path</h3>
            <p>Turn the notes into an actionable study sequence with tasks, short questions, and mastery checks.</p>
          </div>
          <button class="btn btn-outline-primary btn-sm flex-shrink-0" type="button" onclick="generateTimeline(true)">
            <i class="bi bi-arrow-clockwise me-1"></i>Regenerate
          </button>
        </div>
        <div id="timelinePanelContent"></div>
      </div>
    `;
    if (mindPanel) {
      mindPanel.insertAdjacentHTML("afterend", timelinePanelHTML);
    } else {
      studyToolsCard.insertAdjacentHTML("beforeend", timelinePanelHTML);
    }
  }

  loadTimelineForCurrentNote();
  renderTimelinePanel();
}

function setupFlashcardTool() {
  const switcher = document.querySelector(".tool-switcher");
  if (switcher && !document.getElementById("toolBtnFlashcards")) {
    switcher.insertAdjacentHTML("beforeend", `
      <button id="toolBtnFlashcards" class="tool-switch-btn" type="button" onclick="switchTool('flashcards', this)">
        <i class="bi bi-card-text me-1"></i>Flashcards
      </button>
    `);
  }

  const studyToolsCard = document.querySelector(".study-tools-card");
  if (studyToolsCard && !document.getElementById("toolPanelFlashcards")) {
    studyToolsCard.insertAdjacentHTML("beforeend", `
      <div id="toolPanelFlashcards" class="tool-panel">
        <div class="tool-panel-head d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h3>Flashcards</h3>
            <p>Build a source-grounded concept deck for fast active recall.</p>
          </div>
          <button class="btn btn-outline-primary btn-sm flex-shrink-0" type="button" onclick="clearFlashcardsAndShowBuilder()">
            <i class="bi bi-sliders me-1"></i>Deck settings
          </button>
        </div>
        <div id="flashcardPanelContent"></div>
      </div>
    `);
  }

  loadFlashcardsForCurrentNote();
  renderFlashcardPanel();
}

function setupQuizTool() {
  const switcher = document.querySelector(".tool-switcher");
  const quizButton = switcher
    ? Array.from(switcher.querySelectorAll(".tool-switch-btn")).find(button =>
      button.id === "toolBtnQuiz" || button.querySelector(".bi-patch-question") || button.textContent.trim().toLowerCase().includes("quiz")
    )
    : null;

  if (quizButton) {
    quizButton.id = "toolBtnQuiz";
    quizButton.disabled = false;
    quizButton.classList.remove("disabled");
    quizButton.setAttribute("aria-disabled", "false");
    quizButton.innerHTML = `<i class="bi bi-patch-question me-1"></i>Quiz`;
    quizButton.onclick = () => switchTool("quiz", quizButton);
  }

  const studyToolsCard = document.querySelector(".study-tools-card");
  if (studyToolsCard && !document.getElementById("toolPanelQuiz")) {
    studyToolsCard.insertAdjacentHTML("beforeend", `
      <div id="toolPanelQuiz" class="tool-panel">
        <div class="tool-panel-head d-flex align-items-start justify-content-between gap-3 mb-3">
          <div>
            <h3>Quiz</h3>
            <p>Generate source-grounded questions from the current notes to practise understanding, application, and exam phrasing.</p>
          </div>
          <button class="btn btn-outline-primary btn-sm flex-shrink-0" type="button" onclick="openQuizSettingsModal()">
            <i class="bi bi-sliders me-1"></i>Quiz settings
          </button>
        </div>
        <div id="quizPanelContent"></div>
      </div>
    `);
  }

  renderQuizPanel();
}

function getQuizTypeLabel(type) {
  return QUIZ_TYPE_OPTIONS.find(option => option.value === type)?.label || type;
}

function getQuizDifficultyLabel(value) {
  const labels = {
    easy: "Basic",
    medium: "Medium",
    hard: "Challenge"
  };
  return labels[String(value || "").toLowerCase()] || "Medium";
}

function quizTypePlanTotal(settings = quizSettings) {
  return (settings.questionTypes || []).reduce((sum, row) => sum + clampQuizNumber(row.count, 1), 0);
}

function quizSettingsSummaryHTML(settings = quizSettings) {
  const rows = (settings.questionTypes || []).map(row =>
    `<span class="quiz-summary-pill">${escapeHTML(getQuizTypeLabel(row.type))} × ${clampQuizNumber(row.count, 1)}</span>`
  ).join("");
  return `
    <div class="quiz-summary-pills" aria-label="Quiz settings summary">
      <span class="quiz-summary-pill quiz-summary-pill-primary">${settings.examMode ? "Exam mode" : "Practice mode"}</span>
      <span class="quiz-summary-pill">${escapeHTML(getQuizLanguageLabel(settings.preferredLanguage))}</span>
      <span class="quiz-summary-pill">${settings.totalQuestions} questions</span>
      ${rows}
    </div>
  `;
}

function getQuizNoteKey() {
  if (currentHistoryId) return `history:${currentHistoryId}`;
  if (currentSourceFingerprint) return `fingerprint:${currentSourceFingerprint}`;
  return "";
}

function getQuizHistoryStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUIZ_HISTORY_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function setQuizHistoryStore(store) {
  return safeSetLocalStorage(QUIZ_HISTORY_STORAGE_KEY, JSON.stringify(store || {}));
}

function makeQuizHistoryId() {
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeStoredQuizRecord(record) {
  if (!record || typeof record !== "object") return null;
  const quiz = normalizeClientQuiz(record.quiz || record);
  if (!quiz.questions.length) return null;
  const answers = record.answers && typeof record.answers === "object" && !Array.isArray(record.answers)
    ? record.answers
    : {};
  const revealedIds = Array.isArray(record.revealedIds)
    ? record.revealedIds.map(id => String(id)).filter(Boolean)
    : [];
  return {
    id: record.id || makeQuizHistoryId(),
    title: record.title || quiz.title || `${storedTitle || "Study"} Quiz`,
    createdAt: record.createdAt || record.created_at || new Date().toISOString(),
    updatedAt: record.updatedAt || record.updated_at || record.createdAt || new Date().toISOString(),
    noteTitle: record.noteTitle || storedTitle || "Study Notes",
    settings: normalizeQuizSettings(record.settings || quizSettings),
    quiz,
    answers,
    revealedIds,
    report: record.report || null
  };
}

function getQuizHistoryRecordsForCurrentNote() {
  const store = getQuizHistoryStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const rawRecords = keys.flatMap(key => Array.isArray(store[key]) ? store[key] : []);
  const seen = new Set();
  return rawRecords
    .map(normalizeStoredQuizRecord)
    .filter(Boolean)
    .filter(record => {
      if (seen.has(record.id)) return false;
      seen.add(record.id);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, QUIZ_HISTORY_LIMIT);
}

function applyQuizHistoryRecord(record, options = {}) {
  const normalized = normalizeStoredQuizRecord(record);
  if (!normalized) return;
  currentQuiz = normalized.quiz;
  quizAnswers = { ...normalized.answers };
  quizRevealedAnswers = new Set(normalized.revealedIds || []);
  quizReport = normalized.report || null;
  activeQuizQuestionIndex = 0;
  activeQuizHistoryId = normalized.id;
  if (options.render !== false) {
    switchTool("quiz");
    renderQuizPanel();
  }
}

function loadQuizHistoryForCurrentNote() {
  quizHistory = getQuizHistoryRecordsForCurrentNote();
  if (quizHistory.length) {
    applyQuizHistoryRecord(quizHistory[0], { render: false });
  } else {
    currentQuiz = null;
    quizAnswers = {};
    quizRevealedAnswers = new Set();
    quizReport = null;
    activeQuizQuestionIndex = 0;
    activeQuizHistoryId = "";
  }
}

function persistCurrentQuizToHistory(options = {}) {
  const key = getQuizNoteKey();
  if (!key || !currentQuiz || !Array.isArray(currentQuiz.questions) || !currentQuiz.questions.length) return;
  const now = new Date().toISOString();
  const store = getQuizHistoryStore();
  const existing = Array.isArray(store[key]) ? store[key] : [];
  const recordId = options.isNew || !activeQuizHistoryId ? makeQuizHistoryId() : activeQuizHistoryId;
  activeQuizHistoryId = recordId;
  const record = {
    id: recordId,
    title: currentQuiz.title || `${storedTitle || "Study"} Quiz`,
    noteTitle: storedTitle || "Study Notes",
    createdAt: options.isNew ? now : (existing.find(item => item?.id === recordId)?.createdAt || now),
    updatedAt: now,
    settings: quizSettings,
    quiz: currentQuiz,
    answers: quizAnswers,
    revealedIds: Array.from(quizRevealedAnswers),
    report: quizReport
  };
  const nextRecords = [
    record,
    ...existing.filter(item => item && item.id !== recordId)
  ].slice(0, QUIZ_HISTORY_LIMIT);
  store[key] = nextRecords;
  setQuizHistoryStore(store);
  quizHistory = getQuizHistoryRecordsForCurrentNote();
}

function deleteQuizHistory(historyId, sourceFingerprint = "") {
  const store = getQuizHistoryStore();
  delete store[`history:${historyId}`];
  if (sourceFingerprint) delete store[`fingerprint:${sourceFingerprint}`];
  setQuizHistoryStore(store);
}

function deleteQuizHistoryRecord(event, recordId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const key = getQuizNoteKey();
  if (!key) return;
  const store = getQuizHistoryStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : "",
    key
  ].filter(Boolean);
  keys.forEach(itemKey => {
    const records = Array.isArray(store[itemKey]) ? store[itemKey] : [];
    store[itemKey] = records.filter(record => record && record.id !== recordId);
  });
  setQuizHistoryStore(store);
  loadQuizHistoryForCurrentNote();
  renderQuizPanel();
  openQuizHistoryModal();
}

function loadQuizHistoryRecord(recordId) {
  const record = quizHistory.find(item => item.id === recordId);
  if (!record) return;
  closeQuizHistoryModal();
  applyQuizHistoryRecord(record);
}

function buildQuizAvoidancePayload() {
  const seen = new Set();
  return quizHistory
    .flatMap(record => (record.quiz?.questions || []).map(question => ({
      type: question.type,
      question: question.question,
      source_reference: question.sourceReference || "",
      options: Array.isArray(question.options) ? question.options.slice(0, 5) : []
    })))
    .filter(item => {
      const signature = String(item.question || "").trim().toLowerCase();
      if (!signature || seen.has(signature)) return false;
      seen.add(signature);
      return true;
    })
    .slice(0, 80);
}

function formatQuizHistoryDate(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "Saved quiz";
  }
}

function renderQuizHistoryPreview(limit = 3) {
  if (!quizHistory.length) return "";
  const rows = quizHistory.slice(0, limit).map(record => {
    const types = (record.settings?.questionTypes || [])
      .map(row => `${getQuizTypeLabel(row.type)} × ${clampQuizNumber(row.count, 1)}`)
      .join(" · ");
    return `
      <button class="quiz-history-mini-card ${record.id === activeQuizHistoryId ? "active" : ""}" type="button"
        onclick="loadQuizHistoryRecord('${escapeAttr(record.id)}')">
        <span class="quiz-history-mini-title">${escapeHTML(record.title)}</span>
        <span class="quiz-history-mini-meta">${formatQuizHistoryDate(record.createdAt)} · ${record.quiz.questions.length} questions</span>
        <span class="quiz-history-mini-types">${escapeHTML(types || getQuizLanguageLabel(record.settings?.preferredLanguage))}</span>
      </button>
    `;
  }).join("");
  return `
    <div class="quiz-history-preview">
      <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
        <div>
          <div class="quiz-history-kicker">Saved quiz history</div>
          <div class="text-secondary small">Each note keeps its own generated quizzes and answer progress.</div>
        </div>
        <button class="btn btn-outline-primary btn-sm" type="button" onclick="openQuizHistoryModal()">
          <i class="bi bi-clock-history me-1"></i>View all
        </button>
      </div>
      <div class="quiz-history-mini-grid">${rows}</div>
    </div>
  `;
}

function openQuizHistoryModal() {
  document.getElementById("quizHistoryOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "quizHistoryOverlay";
  overlay.className = "visual-modal";
  overlay.style.background = "rgba(248, 250, 252, 0.78)";
  overlay.style.backdropFilter = "blur(12px)";
  const rows = quizHistory.length
    ? quizHistory.map(record => `
      <div class="quiz-history-row ${record.id === activeQuizHistoryId ? "active" : ""}">
        <button class="quiz-history-row-main" type="button" onclick="loadQuizHistoryRecord('${escapeAttr(record.id)}')">
          <span class="quiz-history-row-title">${escapeHTML(record.title)}</span>
          <span class="quiz-history-row-meta">${formatQuizHistoryDate(record.createdAt)} · ${record.quiz.questions.length} questions · ${escapeHTML(getQuizLanguageLabel(record.settings?.preferredLanguage))}</span>
          <span class="quiz-history-row-question">${escapeHTML(record.quiz.questions[0]?.question || "Open this quiz")}</span>
        </button>
        <button class="btn btn-outline-secondary quiz-history-delete" type="button" title="Delete quiz"
          onclick="deleteQuizHistoryRecord(event, '${escapeAttr(record.id)}')">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
    `).join("")
    : `<div class="text-secondary">No saved quizzes for this note yet.</div>`;
  overlay.innerHTML = `
    <div class="visual-modal-content quiz-history-modal">
      <button class="visual-modal-close" type="button" aria-label="Close quiz history" onclick="closeQuizHistoryModal()">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="visual-modal-caption">
        <h3>Quiz history</h3>
        <p class="text-secondary mb-4">Saved only for the current notes. Pick any previous quiz to continue or review.</p>
        <div class="quiz-history-list">${rows}</div>
      </div>
    </div>
  `;
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeQuizHistoryModal();
  });
  document.body.appendChild(overlay);
}

function closeQuizHistoryModal() {
  document.getElementById("quizHistoryOverlay")?.remove();
}

function renderQuizPanel() {
  const panel = document.getElementById("quizPanelContent");
  if (!panel) return;

  if (isQuizGenerating) {
    panel.innerHTML = `
      <div class="border rounded-4 p-4 bg-light shadow-sm">
        <div class="d-flex align-items-start gap-3">
          <span class="spinner-border spinner-border-sm mt-1" aria-hidden="true"></span>
          <div>
            <div class="fw-bold">Generating quiz...</div>
            <p class="text-secondary mb-0 mt-1">Questions will follow your settings and cover key concepts, source evidence, examples, and common mistakes.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (quizError) {
    panel.innerHTML = `
      <div class="alert alert-danger">
        <strong>Quiz generation failed.</strong><br>${escapeHTML(quizError)}
      </div>
      ${renderQuizEmptyActions()}
    `;
    return;
  }

  if (currentQuiz && Array.isArray(currentQuiz.questions) && currentQuiz.questions.length) {
    panel.innerHTML = renderQuiz();
    renderMath();
    return;
  }

  panel.innerHTML = renderQuizEmptyActions();
}

function renderQuizEmptyActions() {
  const hasNotes = Boolean(fullSummary && fullSummary.trim());
  return `
    <div class="d-grid gap-4">
      <div class="quiz-launch-card">
        <div class="quiz-launch-content">
          <div class="quiz-launch-copy">
            <h4>Generate a quiz from the current notes</h4>
            <p>${hasNotes ? "Questions will use the concepts, examples, figures, and source evidence in your notes." : "Generate visual notes first, then create a quiz here."}</p>
            ${quizSettingsSummaryHTML()}
          </div>
          <div class="quiz-launch-actions">
            <button class="btn btn-outline-primary quiz-action-btn" type="button" onclick="openQuizSettingsModal()">
              <i class="bi bi-sliders me-1"></i>Quiz settings
            </button>
            <button class="btn btn-primary quiz-action-btn" type="button" onclick="generateQuiz()" ${hasNotes ? "" : "disabled"}>
              <i class="bi bi-stars me-1"></i>Generate quiz
            </button>
          </div>
        </div>
      </div>
      ${renderQuizHistoryPreview()}
    </div>
  `;
}

function openQuizSettingsModal() {
  quizSettingsDraft = cloneQuizSettings(quizSettings);
  document.getElementById("quizSettingsOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "quizSettingsOverlay";
  overlay.className = "visual-modal";
  overlay.style.background = "rgba(248, 250, 252, 0.78)";
  overlay.style.backdropFilter = "blur(12px)";
  overlay.innerHTML = `
    <div class="visual-modal-content" style="width:min(760px, 94vw); background:#f7f8fc; border:1px solid #d9e1f0;">
      <button class="visual-modal-close" type="button" aria-label="Close quiz settings" onclick="closeQuizSettingsModal()">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="visual-modal-caption">
        <h3 class="mb-4">Quiz settings</h3>

        <div class="mb-4">
          <div class="fw-semibold mb-3">Quiz mode</div>
          <div class="border rounded-4 p-3 bg-light shadow-sm">
            <div class="form-check form-switch d-flex align-items-center gap-3 m-0">
              <input id="quizExamMode" class="form-check-input flex-shrink-0" type="checkbox" role="switch"
                ${quizSettingsDraft.examMode ? "checked" : ""} onchange="updateQuizDraftExamMode(this.checked)">
              <label class="form-check-label" for="quizExamMode">
                <span class="d-block fw-bold">Enable exam mode</span>
                <span class="text-secondary">Submit all answers at the end and generate a full report</span>
              </label>
            </div>
          </div>
        </div>

        <div class="border-top pt-4 mb-4">
          <div class="d-flex justify-content-between align-items-center gap-3 mb-2">
            <label class="fw-semibold m-0" for="quizQuestionLanguage">Question language</label>
            <span class="small text-secondary">Default: English</span>
          </div>
          <select id="quizQuestionLanguage" class="form-select"
            onchange="updateQuizDraftLanguage(this.value)">
            ${QUIZ_LANGUAGE_OPTIONS.map(option => `
              <option value="${option.value}" ${quizSettingsDraft.preferredLanguage === option.value ? "selected" : ""}>
                ${escapeHTML(option.label)}
              </option>
            `).join("")}
          </select>
          <div id="quizLanguageHelp" class="small text-secondary mt-2">
            ${escapeHTML(QUIZ_LANGUAGE_OPTIONS.find(option => option.value === quizSettingsDraft.preferredLanguage)?.description || "")}
          </div>
        </div>

        <div class="border-top pt-4 mb-4">
          <div class="d-flex justify-content-between align-items-center gap-3 mb-2">
            <label class="fw-semibold m-0" for="quizTotalQuestions">Question count</label>
            <span class="small text-secondary">1-40 questions</span>
          </div>
          <input id="quizTotalQuestions" class="form-control" type="number" min="1" max="40"
            value="${quizSettingsDraft.totalQuestions}" onchange="updateQuizDraftTotal(this.value)" oninput="updateQuizDraftTotal(this.value)">
        </div>

        <div class="border-top pt-4">
          <div class="fw-semibold mb-3">Question types</div>
          <div id="quizTypeRows"></div>
          <button class="btn btn-outline-primary mt-3" type="button" onclick="addQuizTypeRow()">
            <i class="bi bi-plus-lg me-1"></i>Add question type
          </button>
          <div id="quizSettingsWarning" class="text-danger small mt-3"></div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button class="btn btn-outline-secondary" type="button" onclick="saveQuizSettingsFromModal(false)">Save</button>
          <button class="btn btn-primary" type="button" onclick="saveQuizSettingsFromModal(true)">Save & generate</button>
        </div>
      </div>
    </div>
  `;
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeQuizSettingsModal();
  });
  document.body.appendChild(overlay);
  renderQuizTypeRows();
  validateQuizSettingsDraft(false);
}

function closeQuizSettingsModal() {
  document.getElementById("quizSettingsOverlay")?.remove();
  quizSettingsDraft = null;
}

function renderQuizTypeRows() {
  const container = document.getElementById("quizTypeRows");
  if (!container || !quizSettingsDraft) return;
  container.innerHTML = quizSettingsDraft.questionTypes.map((row, index) => `
    <div class="quiz-type-row">
      <label class="quiz-type-row-label">Question type ${index + 1}</label>
      <div class="quiz-type-control-row">
        <select class="form-select quiz-type-select" onchange="updateQuizDraftType(${index}, this.value)">
          ${QUIZ_TYPE_OPTIONS.map(option => `
            <option value="${option.value}" ${row.type === option.value ? "selected" : ""}>${escapeHTML(option.label)}</option>
          `).join("")}
        </select>
        <input class="form-control quiz-type-count" type="number" min="1" max="40" value="${clampQuizNumber(row.count, 1)}"
          onchange="updateQuizDraftCount(${index}, this.value)" oninput="updateQuizDraftCount(${index}, this.value)">
        ${quizSettingsDraft.questionTypes.length > 1 ? `
          <button class="btn btn-outline-secondary quiz-type-remove" type="button" title="Remove question type" onclick="removeQuizTypeRow(${index})">
            <i class="bi bi-trash3"></i>
          </button>
        ` : ""}
      </div>
    </div>
  `).join("");
}

function updateQuizDraftExamMode(checked) {
  if (!quizSettingsDraft) return;
  quizSettingsDraft.examMode = Boolean(checked);
}

function updateQuizDraftLanguage(value) {
  if (!quizSettingsDraft) return;
  quizSettingsDraft.preferredLanguage = normalizeQuizLanguage(value);
  const help = document.getElementById("quizLanguageHelp");
  if (help) {
    help.textContent = QUIZ_LANGUAGE_OPTIONS.find(option => option.value === quizSettingsDraft.preferredLanguage)?.description || "";
  }
}

function updateQuizDraftTotal(value) {
  if (!quizSettingsDraft) return;
  quizSettingsDraft.totalQuestions = clampQuizNumber(value, quizSettingsDraft.totalQuestions || 6);
  validateQuizSettingsDraft(false);
}

function updateQuizDraftType(index, value) {
  if (!quizSettingsDraft || !quizSettingsDraft.questionTypes[index]) return;
  quizSettingsDraft.questionTypes[index].type = normalizeQuizType(value);
  renderQuizTypeRows();
  validateQuizSettingsDraft(false);
}

function updateQuizDraftCount(index, value) {
  if (!quizSettingsDraft || !quizSettingsDraft.questionTypes[index]) return;
  quizSettingsDraft.questionTypes[index].count = clampQuizNumber(value, 1);
  validateQuizSettingsDraft(false);
}

function addQuizTypeRow() {
  if (!quizSettingsDraft) return;
  const used = quizTypePlanTotal(quizSettingsDraft);
  const remaining = Math.max(1, quizSettingsDraft.totalQuestions - used);
  quizSettingsDraft.questionTypes.push({ type: "short_answer", count: remaining });
  renderQuizTypeRows();
  validateQuizSettingsDraft(false);
}

function removeQuizTypeRow(index) {
  if (!quizSettingsDraft || quizSettingsDraft.questionTypes.length <= 1) return;
  quizSettingsDraft.questionTypes.splice(index, 1);
  renderQuizTypeRows();
  validateQuizSettingsDraft(false);
}

function validateQuizSettingsDraft(showWarning = true) {
  const warning = document.getElementById("quizSettingsWarning");
  if (!quizSettingsDraft) return false;
  quizSettingsDraft = normalizeQuizSettings(quizSettingsDraft);
  const sum = quizTypePlanTotal(quizSettingsDraft);
  const valid = sum === quizSettingsDraft.totalQuestions;
  if (warning) {
    warning.textContent = valid
      ? ""
      : `Question type counts add up to ${sum}; this must equal the total question count ${quizSettingsDraft.totalQuestions}.`;
  }
  return valid || !showWarning;
}

function saveQuizSettingsFromModal(shouldGenerate) {
  if (!quizSettingsDraft) return;
  if (!validateQuizSettingsDraft(true)) return;
  quizSettings = normalizeQuizSettings(quizSettingsDraft);
  safeSetLocalStorage(QUIZ_STORAGE_KEY, JSON.stringify(quizSettings));
  closeQuizSettingsModal();
  renderQuizPanel();
  if (shouldGenerate) generateQuiz();
}

async function generateQuiz() {
  if (!fullSummary || !fullSummary.trim()) {
    alert("Generate visual notes first, then create a quiz.");
    return;
  }

  quizSettings = normalizeQuizSettings(quizSettings);
  const total = quizTypePlanTotal(quizSettings);
  if (total !== quizSettings.totalQuestions) {
    openQuizSettingsModal();
    return;
  }

  isQuizGenerating = true;
  quizError = "";
  const avoidQuestions = buildQuizAvoidancePayload();
  currentQuiz = null;
  quizAnswers = {};
  quizRevealedAnswers = new Set();
  quizReport = null;
  activeQuizHistoryId = "";
  switchTool("quiz");
  renderQuizPanel();

  try {
    const response = await fetch(`${API_BASE}/quiz/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: storedTitle,
        summary: fullSummary,
        sections,
        source_fingerprint: currentSourceFingerprint,
        preferred_language: quizSettings.preferredLanguage,
        exam_mode: quizSettings.examMode,
        total_questions: quizSettings.totalQuestions,
        question_types: quizSettings.questionTypes,
        avoid_questions: avoidQuestions,
        previous_quiz_count: quizHistory.length,
        variant_seed: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      })
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Quiz generation failed with status ${response.status}.`);
    }
    currentQuiz = normalizeClientQuiz(data);
    activeQuizQuestionIndex = 0;
    persistCurrentQuizToHistory({ isNew: true });
  } catch (error) {
    console.error(error);
    quizError = error.message || "Quiz generation failed.";
  } finally {
    isQuizGenerating = false;
    renderQuizPanel();
  }
}

function setActiveQuizQuestion(index) {
  if (!currentQuiz || !Array.isArray(currentQuiz.questions) || !currentQuiz.questions.length) return;
  activeQuizQuestionIndex = Math.max(0, Math.min(index, currentQuiz.questions.length - 1));
  renderQuizPanel();
}

function normalizeClientQuiz(data) {
  const questions = Array.isArray(data.questions) ? data.questions : [];
  return {
    title: data.title || `${storedTitle || "Study"} Quiz`,
    examMode: Boolean(data.exam_mode ?? data.examMode),
    totalQuestions: questions.length,
    questions: questions.map((question, index) => ({
      id: question.id || `q${index + 1}`,
      type: normalizeQuizType(question.type),
      label: question.label || getQuizTypeLabel(normalizeQuizType(question.type)),
      question: question.question || question.prompt || `Question ${index + 1}`,
      options: Array.isArray(question.options) ? question.options : [],
      correctOptionIndexes: Array.isArray(question.correct_option_indexes)
        ? question.correct_option_indexes
        : (Array.isArray(question.correctOptionIndexes) ? question.correctOptionIndexes : []),
      correctBoolean: typeof question.correct_boolean === "boolean"
        ? question.correct_boolean
        : (typeof question.correctBoolean === "boolean" ? question.correctBoolean : null),
      expectedAnswer: question.expected_answer || question.expectedAnswer || "",
      explanation: question.explanation || "",
      sourceReference: question.source_reference || question.sourceReference || "",
      difficulty: question.difficulty || "medium",
      points: clampQuizNumber(question.points, 1),
      rubric: Array.isArray(question.rubric) ? question.rubric : []
    }))
  };
}

function renderQuiz() {
  const quiz = currentQuiz;
  const answeredCount = quiz.questions.filter(question => isQuizAnswered(question)).length;
  const reportHTML = quizReport ? renderQuizReport(quizReport) : "";
  const progressPercent = quiz.questions.length ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;
  activeQuizQuestionIndex = Math.max(0, Math.min(activeQuizQuestionIndex, quiz.questions.length - 1));
  const currentQuestion = quiz.questions[activeQuizQuestionIndex];
  return `
    <div>
      <div class="d-flex align-items-center gap-3 flex-wrap mb-4">
        <button class="btn btn-primary" type="button" onclick="openQuizSettingsModal()">
          <i class="bi bi-plus-lg me-1"></i>Generate new quiz
        </button>
        <button class="btn btn-outline-secondary" type="button" title="Quiz settings" onclick="openQuizSettingsModal()">
          <i class="bi bi-sliders"></i>
        </button>
        <button class="btn btn-outline-primary" type="button" onclick="openQuizHistoryModal()" ${quizHistory.length ? "" : "disabled"}>
          <i class="bi bi-clock-history me-1"></i>History
        </button>
      </div>

      <div class="mx-auto" style="max-width: 760px;">
        <div class="border rounded-4 p-4 p-lg-5 bg-white shadow-sm">
          <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
            <button class="btn btn-outline-secondary" type="button" aria-label="Previous question"
              onclick="setActiveQuizQuestion(${activeQuizQuestionIndex - 1})" ${activeQuizQuestionIndex <= 0 ? "disabled" : ""}>
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="text-center">
              <h3 class="mb-1">Question ${activeQuizQuestionIndex + 1} of ${quiz.questions.length}</h3>
              <div class="small text-secondary">${answeredCount}/${quiz.questions.length} answered · ${quiz.examMode ? "Exam mode" : "Practice mode"}</div>
            </div>
            <button class="btn btn-outline-secondary" type="button" aria-label="Next question"
              onclick="setActiveQuizQuestion(${activeQuizQuestionIndex + 1})" ${activeQuizQuestionIndex >= quiz.questions.length - 1 ? "disabled" : ""}>
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>

          <div class="progress mb-4" role="progressbar" aria-label="Quiz progress" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>

          ${renderQuizQuestion(currentQuestion, activeQuizQuestionIndex)}

          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mt-4">
            <button class="btn btn-outline-primary" type="button" onclick="revealQuizAnswer('${escapeAttr(currentQuestion.id)}')" ${quiz.examMode ? "disabled" : ""}>
              View answer
            </button>
            <button class="btn btn-primary" type="button" onclick="submitQuiz()">
              <i class="bi bi-check2-circle me-1"></i>${quiz.examMode ? "Submit & generate report" : "Generate report"}
            </button>
          </div>
        </div>
      </div>
      ${reportHTML}
      ${renderQuizHistoryPreview()}
    </div>
  `;
}

function renderQuizQuestion(question, index) {
  const answer = quizAnswers[question.id];
  const feedback = quizRevealedAnswers.has(question.id) && !currentQuiz.examMode
    ? renderQuestionFeedback(question, answer)
    : "";
  return `
    <article>
      <div class="d-flex justify-content-between gap-2 flex-wrap mb-3">
        <span class="badge rounded-pill text-bg-primary">${escapeHTML(question.label || getQuizTypeLabel(question.type))}</span>
        <span class="small text-secondary">${escapeHTML(getQuizDifficultyLabel(question.difficulty))} · ${question.points} ${question.points === 1 ? "point" : "points"}</span>
      </div>
      <div class="fw-semibold mb-4 fs-5">${markdownToHTML(question.question)}</div>
      ${question.sourceReference ? `<div class="small text-secondary mb-3"><i class="bi bi-link-45deg me-1"></i>Source basis: ${escapeHTML(question.sourceReference)}</div>` : ""}
      ${renderQuizAnswerInput(question)}
      ${feedback}
    </article>
  `;
}

function renderQuizAnswerInput(question) {
  if (question.type === "single_choice") {
    return renderChoiceOptions(question, "radio");
  }
  if (question.type === "multiple_choice") {
    return renderChoiceOptions(question, "checkbox");
  }
  if (question.type === "true_false") {
    const labels = Array.isArray(question.options) && question.options.length >= 2
      ? question.options
      : ["True", "False"];
    return `
      <div class="d-grid gap-2">
        ${[true, false].map((value, index) => `
          <label class="border rounded-3 p-3 bg-white">
            <input class="form-check-input me-2" type="radio" name="quiz-${escapeAttr(question.id)}" value="${value}"
              ${quizAnswers[question.id] === value ? "checked" : ""}
              onchange="updateQuizAnswer('${escapeAttr(question.id)}', ${value})">
            ${escapeHTML(labels[index])}
          </label>
        `).join("")}
      </div>
    `;
  }
  return `
    <textarea class="form-control" rows="${question.type === "essay" ? 6 : 4}"
      placeholder="Type your answer here..."
      oninput="updateQuizAnswer('${escapeAttr(question.id)}', this.value)">${escapeHTML(quizAnswers[question.id] || "")}</textarea>
  `;
}

function renderChoiceOptions(question, inputType) {
  const selected = quizAnswers[question.id];
  return `
    <div class="d-grid gap-2">
      ${(question.options || []).map((option, optionIndex) => {
        const checked = inputType === "checkbox"
          ? Array.isArray(selected) && selected.includes(optionIndex)
          : selected === optionIndex;
        return `
          <label class="border rounded-3 p-3 bg-white">
            <input class="form-check-input me-2" type="${inputType}" name="quiz-${escapeAttr(question.id)}" value="${optionIndex}"
              ${checked ? "checked" : ""}
              onchange="updateQuizChoiceAnswer('${escapeAttr(question.id)}', ${optionIndex}, '${inputType}', this.checked)">
            <span class="fw-semibold me-1">${String.fromCharCode(65 + optionIndex)}.</span>${escapeHTML(option)}
          </label>
        `;
      }).join("")}
    </div>
  `;
}

function updateQuizAnswer(questionId, value) {
  quizAnswers[questionId] = value;
  persistCurrentQuizToHistory();
}

function updateQuizChoiceAnswer(questionId, optionIndex, inputType, checked) {
  if (inputType === "checkbox") {
    const current = Array.isArray(quizAnswers[questionId]) ? [...quizAnswers[questionId]] : [];
    if (checked && !current.includes(optionIndex)) current.push(optionIndex);
    if (!checked) {
      const idx = current.indexOf(optionIndex);
      if (idx >= 0) current.splice(idx, 1);
    }
    quizAnswers[questionId] = current.sort((a, b) => a - b);
  } else {
    quizAnswers[questionId] = optionIndex;
  }
  persistCurrentQuizToHistory();
}

function isQuizAnswered(question) {
  const value = quizAnswers[question.id];
  if (question.type === "multiple_choice") return Array.isArray(value) && value.length > 0;
  if (question.type === "single_choice") return Number.isInteger(value);
  if (question.type === "true_false") return typeof value === "boolean";
  return typeof value === "string" && value.trim().length > 0;
}

function revealQuizAnswer(questionId) {
  quizRevealedAnswers.add(questionId);
  persistCurrentQuizToHistory();
  renderQuizPanel();
}

function arraysEqualNumbers(a, b) {
  const left = Array.isArray(a) ? [...a].sort((x, y) => x - y) : [];
  const right = Array.isArray(b) ? [...b].sort((x, y) => x - y) : [];
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function gradeQuestion(question) {
  const answer = quizAnswers[question.id];
  if (question.type === "single_choice") {
    const correct = question.correctOptionIndexes[0];
    return { objective: true, correct: answer === correct, earned: answer === correct ? question.points : 0, possible: question.points };
  }
  if (question.type === "multiple_choice") {
    const correct = arraysEqualNumbers(answer, question.correctOptionIndexes);
    return { objective: true, correct, earned: correct ? question.points : 0, possible: question.points };
  }
  if (question.type === "true_false") {
    const correct = answer === question.correctBoolean;
    return { objective: true, correct, earned: correct ? question.points : 0, possible: question.points };
  }
  return { objective: false, correct: null, earned: null, possible: question.points, answered: isQuizAnswered(question) };
}

function submitQuiz() {
  if (!currentQuiz) return;
  quizReport = gradeCurrentQuiz();
  if (!currentQuiz.examMode) {
    currentQuiz.questions.forEach(question => quizRevealedAnswers.add(question.id));
  }
  persistCurrentQuizToHistory();
  renderQuizPanel();
}

function gradeCurrentQuiz() {
  const rows = currentQuiz.questions.map(question => ({ question, grade: gradeQuestion(question) }));
  const objectiveRows = rows.filter(row => row.grade.objective);
  const subjectiveRows = rows.filter(row => !row.grade.objective);
  const objectiveEarned = objectiveRows.reduce((sum, row) => sum + row.grade.earned, 0);
  const objectivePossible = objectiveRows.reduce((sum, row) => sum + row.grade.possible, 0);
  const missed = objectiveRows.filter(row => !row.grade.correct);
  const unanswered = rows.filter(row => !isQuizAnswered(row.question));
  return {
    rows,
    objectiveEarned,
    objectivePossible,
    objectivePercent: objectivePossible ? Math.round((objectiveEarned / objectivePossible) * 100) : null,
    subjectiveCount: subjectiveRows.length,
    subjectiveAnswered: subjectiveRows.filter(row => row.grade.answered).length,
    missed,
    unanswered
  };
}

function renderQuizReport(report) {
  const score = report.objectivePercent === null
    ? "mostly written questions"
    : `${report.objectiveEarned}/${report.objectivePossible} (${report.objectivePercent}%)`;
  const weakItems = report.missed.slice(0, 3).map(row => escapeHTML(row.question.sourceReference || row.question.question)).join("</li><li>");
  return `
    <div class="alert alert-primary">
      <div class="fw-bold mb-1">Quiz report</div>
      <div>Objective score: ${score}</div>
      ${report.subjectiveCount ? `<div>Written questions: ${report.subjectiveAnswered}/${report.subjectiveCount} answered. Self-check with the model answer and rubric.</div>` : ""}
      ${report.unanswered.length ? `<div class="mt-2">Unanswered questions: ${report.unanswered.length}.</div>` : ""}
      ${weakItems ? `<div class="mt-2">Review next:</div><ul class="mb-0"><li>${weakItems}</li></ul>` : `<div class="mt-2">Strong objective-question performance. Try a harder mix of question types next.</div>`}
    </div>
  `;
}

function renderQuestionFeedback(question, answer) {
  const grade = gradeQuestion(question);
  const tfLabels = Array.isArray(question.options) && question.options.length >= 2 ? question.options : ["True", "False"];
  const correctLabel = question.type === "true_false"
    ? (question.correctBoolean ? tfLabels[0] : tfLabels[1])
    : question.correctOptionIndexes.map(index => `${String.fromCharCode(65 + index)}. ${question.options[index] || ""}`).join("；");
  const status = grade.objective
    ? (grade.correct ? `<span class="badge text-bg-success">Correct</span>` : `<span class="badge text-bg-danger">Review needed</span>`)
    : `<span class="badge text-bg-info">Model answer</span>`;
  return `
    <div class="mt-3 border-top pt-3">
      <div class="mb-2">${status}</div>
      ${grade.objective ? `<p class="mb-2"><strong>Correct answer:</strong> ${escapeHTML(correctLabel)}</p>` : ""}
      ${question.expectedAnswer ? `<p class="mb-2"><strong>Model answer:</strong> ${escapeHTML(question.expectedAnswer)}</p>` : ""}
      ${question.explanation ? `<p class="mb-2"><strong>Explanation:</strong> ${escapeHTML(question.explanation)}</p>` : ""}
      ${question.rubric && question.rubric.length ? `
        <div class="small text-secondary">Rubric:</div>
        <ul class="mb-0">${question.rubric.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
      ` : ""}
    </div>
  `;
}

function getFlashcardNoteKey() {
  if (currentHistoryId) return `history:${currentHistoryId}`;
  if (currentSourceFingerprint) return `fingerprint:${currentSourceFingerprint}`;
  return "";
}

function getFlashcardStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FLASHCARD_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function setFlashcardStore(store) {
  return safeSetLocalStorage(FLASHCARD_STORAGE_KEY, JSON.stringify(store || {}));
}

function normalizeClientFlashcard(card, index) {
  const front = String(card?.front || card?.term || card?.question || `Card ${index + 1}`).trim();
  const back = String(card?.back || card?.definition || card?.answer || "").trim();
  return {
    id: card?.id || `fc${index + 1}`,
    front,
    back: back || "Open the notes for the supporting explanation.",
    hint: String(card?.hint || "").trim(),
    sourceReference: String(card?.source_reference || card?.sourceReference || "").trim(),
    difficulty: String(card?.difficulty || "medium").trim().toLowerCase(),
    tags: Array.isArray(card?.tags) ? card.tags.map(tag => String(tag).trim()).filter(Boolean).slice(0, 4) : []
  };
}

function normalizeClientFlashcardDeck(data) {
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  return cards.map(normalizeClientFlashcard).filter(card => card.front && card.back);
}

function persistFlashcardsForCurrentNote() {
  const key = getFlashcardNoteKey();
  if (!key) return;
  const store = getFlashcardStore();
  store[key] = {
    title: storedTitle,
    updatedAt: new Date().toISOString(),
    settings: flashcardSettings,
    cards: currentFlashcards
  };
  setFlashcardStore(store);
}

function loadFlashcardsForCurrentNote() {
  const store = getFlashcardStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const record = keys.map(key => store[key]).find(item => item && Array.isArray(item.cards));
  currentFlashcards = record ? normalizeClientFlashcardDeck(record) : [];
  if (record?.settings) {
    flashcardSettings = normalizeFlashcardSettings(record.settings);
  }
  activeFlashcardIndex = 0;
  flashcardSide = "front";
  flashcardError = "";
}

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
          <span class="flashcard-main-text">${escapeHTML(sideText)}</span>
          ${flashcardSide === "front" && card.hint ? `<span class="flashcard-hint">Hint: ${escapeHTML(card.hint)}</span>` : ""}
          ${flashcardSide === "back" && card.sourceReference ? `<span class="flashcard-source">Source basis: ${escapeHTML(card.sourceReference)}</span>` : ""}
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
    const response = await fetch(`${API_BASE}/flashcards/generate`, {
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
              ${escapeHTML(card.front)}
            </span>
            <span>
              <strong>Back</strong>
              ${escapeHTML(card.back)}
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



const SUBSCRIPT_MAP = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "m": "ₘ", "n": "ₙ"
};

function readableSubscripts(value) {
  return String(value || "")
    .replace(/_\{([0-9ijkmn]+)\}/g, (_, chars) => chars.split("").map(ch => SUBSCRIPT_MAP[ch] || ch).join(""))
    .replace(/_([0-9ijkmn])\b/g, (_, ch) => SUBSCRIPT_MAP[ch] || ch);
}

function matrixLatexToReadable(value) {
  return String(value || "").replace(
    /\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}([\s\S]*?)\\end\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}/g,
    (_, body) => {
      const rows = String(body || "")
        .replace(/\\(?:ldots|dots|cdots)/g, "…")
        .split(/\\\\|\\cr/g)
        .map(row => row.split("&").map(cell => readableSubscripts(cleanMindText(cell))).filter(Boolean).join(", "))
        .filter(Boolean);
      if (!rows.length) return "[]";
      return `[${rows.join("; ")}]`;
    }
  );
}

function plainMatrixWordsToReadable(value) {
  return readableSubscripts(String(value || "")
    .replace(/\b(?:begin|end)?\s*bmatrix\b/gi, " ")
    .replace(/\b(?:begin|end)?\s*pmatrix\b/gi, " ")
    .replace(/\b(?:begin|end)?\s*matrix\b/gi, " ")
    .replace(/\\\\/g, "; ")
    .replace(/&/g, ", ")
    .replace(/\s+/g, " ")
    .trim());
}

function cleanMindText(text) {
  if (!text) return "";
  let value = String(text);
  value = matrixLatexToReadable(value);

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
  return (points || []).slice(0, 8).map((point, index) => {
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
      branches: mindMap.branches.slice(0, 11).map((branch, index) => ({
        id: branch.id || `branch-${index}`,
        label: shortMindText(branch.label || branch.section || `Branch ${index + 1}`, 52),
        section: branch.section || branch.label || `Section ${index + 1}`,
        summary: cleanMindText(branch.summary || ""),
        points: normaliseMindPoints(branch.points || [])
      }))
    };
  }

  const fallbackBranches = Object.keys(sections).slice(0, 11).map((sectionName, index) => {
    const rawLines = String(sections[sectionName] || "")
      .split(/\n+/)
      .map(line => cleanMindText(line.replace(/^[\-•*]\s*/, "").replace(/^\d+[.)]\s*/, "")))
      .filter(Boolean);

    const points = rawLines.slice(0, 8).map((line, pointIndex) => ({
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

  const colors = ["#ff7a45", "#19a65a", "#22b8cf", "#8f5fe8", "#f6c343", "#ef4444", "#0ea5e9", "#14b8a6", "#a855f7", "#f97316", "#64748b"];
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

  const priorChatHistory = chatHistory.slice(-10);
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
        preferred_language: preferredLanguage ? preferredLanguage.value : "auto",
        title: storedTitle,
        summary: fullSummary,
        sections,
        source_identity: currentPrimarySourceIdentity,
        source_fingerprint: currentSourceFingerprint,
        chat_history: priorChatHistory.map(message => ({
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

function addMessage(role, text, options = {}) {
  const shouldPersist = options.persist !== false;
  const shouldAnimate = options.animate ?? role === "assistant";
  removeAssistantEmptyState();
  chatHistory.push({ role, text, createdAt: new Date().toISOString() });
  if (shouldPersist) persistTutorChatHistory();
  renderTutorChatMessage(role, text, { animate: shouldAnimate });
}

function renderTutorChatMessage(role, text, options = {}) {
  const div = document.createElement("div");
  div.className = `chat-message ${role}`;
  const bodyId = `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  div.innerHTML = `
    <strong>${role === "user" ? "You" : "Synapse"}</strong>
    <div id="${bodyId}"></div>`;

  chatMessages.appendChild(div);
  const body = document.getElementById(bodyId);

  if (role === "assistant" && options.animate) {
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
  persistTutorChatHistory();
  renderTutorChatHistory();
}

function getTutorChatKey() {
  if (currentHistoryId) return `history:${currentHistoryId}`;
  if (currentSourceFingerprint) return `fingerprint:${currentSourceFingerprint}`;
  return "";
}

function getTutorChatStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TUTOR_CHAT_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function setTutorChatStore(store) {
  return safeSetLocalStorage(TUTOR_CHAT_STORAGE_KEY, JSON.stringify(store || {}));
}

function normaliseTutorChatMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter(message => message && ["user", "assistant"].includes(message.role) && String(message.text || "").trim())
    .slice(-TUTOR_CHAT_HISTORY_LIMIT)
    .map(message => ({
      role: message.role,
      text: String(message.text || ""),
      createdAt: message.createdAt || new Date().toISOString()
    }));
}

function persistTutorChatHistory() {
  const key = getTutorChatKey();
  if (!key) return;
  const store = getTutorChatStore();
  store[key] = normaliseTutorChatMessages(chatHistory);
  setTutorChatStore(store);
}

function deleteTutorChatHistory(historyId, sourceFingerprint = "") {
  const store = getTutorChatStore();
  delete store[`history:${historyId}`];
  if (sourceFingerprint) delete store[`fingerprint:${sourceFingerprint}`];
  setTutorChatStore(store);
}

function loadTutorChatHistoryForCurrentNote() {
  const store = getTutorChatStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const saved = keys.map(key => store[key]).find(messages => Array.isArray(messages));
  chatHistory = normaliseTutorChatMessages(saved || []);
  renderTutorChatHistory();
}

function renderTutorChatHistory() {
  if (!chatMessages) return;
  chatMessages.innerHTML = "";
  if (!chatHistory.length) {
    chatMessages.innerHTML = `
      <div class="assistant-empty">
        <i class="bi bi-chat-dots"></i>
        <p>Ask questions about your generated notes.</p>
      </div>`;
    return;
  }
  chatHistory.forEach(message => renderTutorChatMessage(message.role, message.text, { animate: false }));
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getVoiceTutorKey() {
  if (currentHistoryId) return `history:${currentHistoryId}`;
  if (currentSourceFingerprint) return `fingerprint:${currentSourceFingerprint}`;
  return "";
}

function getVoiceTutorStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VOICE_TUTOR_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function setVoiceTutorStore(store) {
  return safeSetLocalStorage(VOICE_TUTOR_STORAGE_KEY, JSON.stringify(store || {}));
}

function normaliseVoiceTutorHistory(items) {
  return (Array.isArray(items) ? items : [])
    .filter(item => item && ["user", "assistant"].includes(item.role) && String(item.text || "").trim())
    .slice(-VOICE_TUTOR_HISTORY_LIMIT)
    .map(item => ({
      role: item.role,
      text: String(item.text || ""),
      state: item.state || "",
      mastery: Number.isFinite(Number(item.mastery)) ? Number(item.mastery) : null,
      diagnosis: item.diagnosis || "",
      createdAt: item.createdAt || new Date().toISOString()
    }));
}

function persistVoiceTutorHistory() {
  const key = getVoiceTutorKey();
  if (!key) return;
  const store = getVoiceTutorStore();
  store[key] = normaliseVoiceTutorHistory(voiceTutorHistory);
  setVoiceTutorStore(store);
}

function deleteVoiceTutorHistory(historyId, sourceFingerprint = "") {
  const store = getVoiceTutorStore();
  delete store[`history:${historyId}`];
  if (sourceFingerprint) delete store[`fingerprint:${sourceFingerprint}`];
  setVoiceTutorStore(store);
}

function loadVoiceTutorHistoryForCurrentNote() {
  const store = getVoiceTutorStore();
  const keys = [
    currentHistoryId ? `history:${currentHistoryId}` : "",
    currentSourceFingerprint ? `fingerprint:${currentSourceFingerprint}` : ""
  ].filter(Boolean);
  const saved = keys.map(key => store[key]).find(items => Array.isArray(items));
  voiceTutorHistory = normaliseVoiceTutorHistory(saved || []);
  voiceTutorLastState = [...voiceTutorHistory].reverse().find(item => item.role === "assistant") || null;
  renderVoiceTutorHistory();
}

function resetVoiceTutorState() {
  stopRealtimeVoiceTutor({ silent: true });
  voiceTutorHistory = [];
  voiceTutorLastState = null;
  voiceTutorBusy = false;
  renderVoiceTutorHistory();
}

function resetVoiceTutorSession() {
  stopRealtimeVoiceTutor({ silent: true });
  voiceTutorHistory = [];
  voiceTutorLastState = null;
  persistVoiceTutorHistory();
  renderVoiceTutorHistory();
}

function renderVoiceTutorHistory() {
  if (!voiceMessages) return;
  voiceMessages.innerHTML = "";
  if (!voiceTutorHistory.length) {
    voiceMessages.innerHTML = `
      <div class="assistant-empty voice-empty">
        <i class="bi bi-mic"></i>
        <p>Start with what you already understand. Synapse will adapt the questions until you are ready.</p>
      </div>`;
  } else {
    voiceTutorHistory.forEach(item => renderVoiceTutorMessage(item.role, item.text, { persist: false, state: item.state, mastery: item.mastery }));
  }
  updateVoiceTutorStatus(voiceTutorLastState);
  updateVoiceTutorControls();
  voiceMessages.scrollTop = voiceMessages.scrollHeight;
}

function renderVoiceTutorMessage(role, text, options = {}) {
  if (!voiceMessages) return;
  voiceMessages.querySelector(".assistant-empty")?.remove();
  const div = document.createElement("div");
  div.className = `voice-message ${role}`;
  const meta = role === "assistant" && (options.state || Number.isFinite(Number(options.mastery)))
    ? `<div class="voice-message-meta">${escapeHTML(options.state || "Tutor")} ${Number.isFinite(Number(options.mastery)) ? `· ${Math.round(Number(options.mastery))}%` : ""}</div>`
    : "";
  div.innerHTML = `
    <strong>${role === "user" ? "You" : "Synapse Voice Tutor"}</strong>
    ${meta}
    <div>${markdownToHTML(text)}</div>`;
  voiceMessages.appendChild(div);
  renderMath();
  voiceMessages.scrollTop = voiceMessages.scrollHeight;
}

function estimateVoiceTutorProgress(candidateRole = "", candidateText = "") {
  const candidate = candidateRole && String(candidateText || "").trim()
    ? [{ role: candidateRole, text: String(candidateText || ""), createdAt: new Date().toISOString() }]
    : [];
  const items = normaliseVoiceTutorHistory([...voiceTutorHistory, ...candidate]);
  const userTexts = items
    .filter(item => item.role === "user")
    .map(item => String(item.text || "").trim())
    .filter(Boolean);
  const assistantTexts = items
    .filter(item => item.role === "assistant" && item.state !== "error")
    .map(item => String(item.text || "").trim())
    .filter(Boolean);
  const stuckPattern = /\b(no idea|don't know|do not know|not sure|idk|lost|confused|答不上|不知道|不会|不懂|没懂|沒懂)\b/i;
  const substantiveAnswers = userTexts.filter(text => text.length >= 28 && !stuckPattern.test(text));
  const stuckCount = userTexts.filter(text => stuckPattern.test(text) || text.length < 10).length;

  let mastery = 0;
  if (assistantTexts.length) mastery += 8;
  mastery += Math.min(28, userTexts.length * 7);
  mastery += Math.min(36, substantiveAnswers.length * 12);
  if (substantiveAnswers.length >= 1 && assistantTexts.length >= 2) mastery += 6;
  if (substantiveAnswers.length >= 3) mastery += 10;
  mastery -= Math.min(18, stuckCount * 6);

  const cap = userTexts.length === 0
    ? 12
    : substantiveAnswers.length === 0
      ? 30
      : substantiveAnswers.length < 2
        ? 55
        : substantiveAnswers.length < 4
          ? 78
          : 94;
  const previous = Number.isFinite(Number(voiceTutorLastState?.mastery)) ? Number(voiceTutorLastState.mastery) : 0;
  const rounded = Math.round(Math.max(previous, Math.max(0, Math.min(cap, mastery))));
  const state = rounded >= 85
    ? "review_ready"
    : rounded >= 65
      ? "applying"
      : rounded >= 35
        ? "learning"
        : userTexts.length
          ? "warming_up"
          : "live";
  const diagnosis = rounded >= 85
    ? "Strong progress. The tutor will keep checking application and source-evidence use before ending."
    : rounded >= 65
      ? "Good progress. Keep answering application questions to confirm transfer."
      : rounded >= 35
        ? "Progress is building. Keep explaining in your own words."
        : "Start by saying what you understand, even if it is partial.";
  return { mastery: rounded, state, diagnosis };
}

function addVoiceTutorMessage(role, text, extras = {}) {
  const progress = estimateVoiceTutorProgress(role, text);
  const providedMastery = Number(extras.mastery);
  const hasProvidedMastery = Number.isFinite(providedMastery) && (providedMastery > 0 || extras.state === "error" || extras.forceMastery);
  const shouldUseEstimatedMastery = role === "assistant" && extras.state !== "error" && !hasProvidedMastery;
  const item = {
    role,
    text,
    state: extras.state || (role === "assistant" ? progress.state : ""),
    mastery: hasProvidedMastery
      ? providedMastery
      : shouldUseEstimatedMastery
        ? progress.mastery
        : null,
    diagnosis: extras.diagnosis || (role === "assistant" ? progress.diagnosis : ""),
    createdAt: new Date().toISOString()
  };
  voiceTutorHistory.push(item);
  voiceTutorHistory = normaliseVoiceTutorHistory(voiceTutorHistory);
  if (role === "assistant") voiceTutorLastState = item;
  persistVoiceTutorHistory();
  renderVoiceTutorMessage(role, text, { state: item.state, mastery: item.mastery });
  updateVoiceTutorStatus(voiceTutorLastState);
  updateVoiceTutorControls();
}

function updateVoiceTutorStatus(stateItem) {
  const mastery = Math.max(0, Math.min(100, Math.round(Number(stateItem?.mastery || 0))));
  const state = voiceRealtimeConnecting ? "connecting" : (voiceRealtimeConnected ? "live" : (stateItem?.state || (voiceTutorHistory.length ? "saved" : "ready")));
  if (voiceTutorState) voiceTutorState.textContent = state.replace(/_/g, " ");
  if (voiceTutorDiagnosis) {
    voiceTutorDiagnosis.textContent = voiceRealtimeConnected
      ? "Live GPT Realtime tutor is listening. Speak naturally, or type a fallback message below."
      : stateItem?.diagnosis || (
          voiceTutorHistory.length
            ? "Start a live tutor call to continue this note-specific voice session."
            : "Start a live diagnostic session for the current notes."
        );
  }
  if (voiceTutorMastery) voiceTutorMastery.textContent = `${mastery}%`;
  if (voiceTutorMasteryFill) voiceTutorMasteryFill.style.width = `${mastery}%`;
}

function updateVoiceTutorControls() {
  const hasNotes = Boolean(fullSummary && fullSummary.trim());
  const requiresSession = document.querySelectorAll("[data-voice-requires-session]");
  requiresSession.forEach(button => {
    button.disabled = !voiceRealtimeConnected || voiceTutorBusy;
  });
  if (voiceRecordBtn) {
    voiceRecordBtn.disabled = !hasNotes || (voiceTutorBusy && !voiceRealtimeConnecting && !voiceRealtimeConnected);
    voiceRecordBtn.classList.toggle("recording", voiceRealtimeConnected || voiceRealtimeConnecting);
    voiceRecordBtn.innerHTML = voiceRealtimeConnecting
      ? `<i class="bi bi-hourglass-split me-1"></i>Connecting...`
      : voiceRealtimeConnected
        ? `<i class="bi bi-telephone-x-fill me-1"></i>End live tutor`
        : `<i class="bi bi-telephone-fill me-1"></i>Start live tutor`;
  }
  if (voiceMuteBtn) {
    voiceMuteBtn.disabled = !voiceRealtimeConnected || !voiceRealtimeStream;
    voiceMuteBtn.classList.toggle("recording", voiceRealtimeMuted);
    voiceMuteBtn.innerHTML = voiceRealtimeMuted
      ? `<i class="bi bi-mic-fill me-1"></i>Unmute mic`
      : `<i class="bi bi-mic-mute me-1"></i>Mute mic`;
  }
}

function setVoiceTutorBusy(isBusy) {
  voiceTutorBusy = Boolean(isBusy);
  updateVoiceTutorControls();
}

function trimVoiceTopicText(value, limit = 9000) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function getActiveMindMapVoiceContext() {
  if (activeTool !== "mindmap") return null;
  const data = getMindMapData(currentMindMap);
  const branch = data.branches[activeMindBranchIndex] || data.branches[0];
  if (!branch) return null;
  const point = branch.points[activeMindPointIndex] || null;
  const sectionText = sections[branch.section] || sections[branch.label] || "";
  const title = point?.label
    ? `${branch.label}: ${point.label}`
    : branch.label;
  const context = [
    `Mind map branch: ${branch.label}`,
    branch.summary ? `Branch summary: ${branch.summary}` : "",
    point ? `Selected point: ${point.label}\nPoint detail: ${point.detail}` : "",
    sectionText ? `Related generated note section:\n${sectionText}` : ""
  ].filter(Boolean).join("\n\n");
  return {
    title,
    context: trimVoiceTopicText(context),
    scope: point ? "current mind map point" : "current mind map branch"
  };
}

function getCurrentVoiceTutorTopicContext() {
  if (selectedSection && sections[selectedSection]) {
    return {
      title: selectedSection,
      context: trimVoiceTopicText(sections[selectedSection]),
      scope: "selected generated note section"
    };
  }

  const visibleTitle = sectionTitle?.innerText?.trim() || "";
  if (visibleTitle && visibleTitle !== "Study Notes" && summaryContent?.textContent?.trim()) {
    return {
      title: visibleTitle,
      context: trimVoiceTopicText(summaryContent.textContent),
      scope: "currently visible generated topic"
    };
  }

  const preferredOverviewTitle = Object.keys(sections).find(title => /overview|learning question|core/i.test(title));
  const overviewContext = preferredOverviewTitle ? sections[preferredOverviewTitle] : "";
  if ((storedTitle && storedTitle !== "Study Notes") || overviewContext || fullSummary) {
    const resolvedNoteTitle = storedTitle && storedTitle !== "Study Notes"
      ? storedTitle
      : makeHistoryTitle(fullSummary || overviewContext || preferredOverviewTitle || "", preferredOverviewTitle || "Current generated topic");
    return {
      title: resolvedNoteTitle,
      context: trimVoiceTopicText(overviewContext || fullSummary, 6500),
      scope: overviewContext ? "current note overview" : "current generated notes"
    };
  }

  const mindMapContext = getActiveMindMapVoiceContext();
  if (mindMapContext?.context) return mindMapContext;

  return {
    title: storedTitle || "Current generated topic",
    context: trimVoiceTopicText(fullSummary, 6500),
    scope: "current generated notes"
  };
}

function getVoiceTutorStarterSentence(title) {
  const safeTitle = trimVoiceTopicText(title || storedTitle || "this topic", 120);
  return `Hi, I'm your Synapse tutor for ${safeTitle}. We'll build this step by step.`;
}

function buildRealtimeTutorTopicInstruction(extraInstruction = "") {
  const topic = getCurrentVoiceTutorTopicContext();
  const title = topic.title || storedTitle || "Current generated topic";
  const scope = topic.scope || "current generated topic";
  const context = trimVoiceTopicText(topic.context || fullSummary || "", 5200);
  const extra = String(extraInstruction || "").trim();
  const starter = getVoiceTutorStarterSentence(title);
  return [
    `CURRENT TOPIC LOCK: You are tutoring only this generated topic: "${title}".`,
    `Topic scope: ${scope}.`,
    context ? `Topic context:\n${context}` : "",
    `Common first spoken sentence: On the first assistant turn in this live session, start exactly with: "${starter}"`,
    "Do not ask what subject, course, material, or topic the learner is working on. You already know it from CURRENT TOPIC LOCK.",
    "If the learner says they have no idea, says they are lost, or gives a very short answer, immediately start from the basics of this exact topic with a 2-3 sentence explanation, then ask one simple check question.",
    "If the learner asks outside this topic, briefly redirect back to the current topic.",
    "Every assistant turn must end with exactly one clear next step: either a short question for the learner to answer, a prompt to continue explaining, or an invitation to try a mini-example. Never end a tutoring turn with only a statement.",
    extra
  ].filter(Boolean).join("\n\n");
}

function buildVoiceTutorSessionFormData(sdp) {
  const formData = new FormData();
  const topic = getCurrentVoiceTutorTopicContext();
  formData.append("sdp", sdp);
  formData.append("history", JSON.stringify(voiceTutorHistory.map(item => ({
    role: item.role,
    text: item.text,
    state: item.state,
    mastery: item.mastery
  }))));
  formData.append("title", storedTitle || "Current Notes");
  formData.append("summary", fullSummary || "");
  formData.append("sections", JSON.stringify(sections || {}));
  formData.append("selected_section", selectedSection || "");
  formData.append("topic_title", topic.title || storedTitle || "Current generated topic");
  formData.append("topic_context", topic.context || "");
  formData.append("topic_scope", topic.scope || "current generated topic");
  formData.append("preferred_language", preferredLanguage ? preferredLanguage.value : "auto");
  formData.append("source_identity", currentPrimarySourceIdentity || "");
  return formData;
}

function normaliseVoiceSpeechText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\s"'“”‘’`.,!?;:，。！？；：()[\]{}<>/\\|-]+/g, " ")
    .trim();
}

function getRecentVoiceMessage(role) {
  return [...voiceTutorHistory].reverse().find(item => item.role === role && String(item.text || "").trim()) || null;
}

function isDuplicateVoiceUserTranscript(text, windowMs = 8000) {
  const normalised = normaliseVoiceSpeechText(text);
  if (!normalised) return true;
  const lastUser = getRecentVoiceMessage("user");
  if (!lastUser) return false;
  const lastCreatedAt = Date.parse(lastUser.createdAt || "");
  const recentlyAdded = Number.isFinite(lastCreatedAt) ? Date.now() - lastCreatedAt < windowMs : true;
  return recentlyAdded && normaliseVoiceSpeechText(lastUser.text) === normalised;
}

function isLikelyVoiceAssistantEcho(text) {
  const normalised = normaliseVoiceSpeechText(text);
  if (!normalised || normalised.length < 8) return false;
  const lastAssistant = getRecentVoiceMessage("assistant");
  const assistantText = normaliseVoiceSpeechText(`${voiceRealtimeAssistantDraft || ""} ${lastAssistant?.text || ""}`);
  if (!assistantText) return false;
  return assistantText.includes(normalised) || (
    normalised.length > 30 && normalised.includes(assistantText.slice(0, Math.min(assistantText.length, 80)))
  );
}

function clearVoiceNoTranscriptTimer() {
  if (voiceRealtimeNoTranscriptTimer) {
    clearTimeout(voiceRealtimeNoTranscriptTimer);
    voiceRealtimeNoTranscriptTimer = null;
  }
}

function scheduleVoiceNoTranscriptNotice() {
  clearVoiceNoTranscriptTimer();
  voiceRealtimeNoTranscriptTimer = setTimeout(() => {
    if (!voiceRealtimeConnected) return;
    if (Date.now() - voiceRealtimeLastTranscriptAt < 4500) return;
    if (voiceTutorDiagnosis) {
      voiceTutorDiagnosis.textContent = "I heard audio activity but did not receive a transcript. Check the browser microphone permission, or type your answer below.";
    }
  }, 5200);
}

function sendRealtimeEvent(event) {
  if (!voiceRealtimeChannel || voiceRealtimeChannel.readyState !== "open") return false;
  try {
    voiceRealtimeChannel.send(JSON.stringify(event));
    return true;
  } catch (error) {
    console.error("Failed to send Realtime event", error);
    return false;
  }
}

function requestRealtimeTutorResponse(instructions = "") {
  if (voiceRealtimeResponseActive) return false;
  const response = {
    output_modalities: ["audio"]
  };
  response.instructions = buildRealtimeTutorTopicInstruction(instructions);
  const sent = sendRealtimeEvent({
    type: "response.create",
    response
  });
  if (sent) voiceRealtimeResponseActive = true;
  return sent;
}

function extractRealtimeResponseTranscript(response) {
  const fragments = [];
  const outputItems = Array.isArray(response?.output) ? response.output : [];
  outputItems.forEach(item => {
    const contentItems = Array.isArray(item?.content) ? item.content : [];
    contentItems.forEach(part => {
      if (typeof part?.transcript === "string") fragments.push(part.transcript);
      else if (typeof part?.text === "string") fragments.push(part.text);
    });
  });
  if (!fragments.length && typeof response?.output_text === "string") {
    fragments.push(response.output_text);
  }
  return fragments.join(" ").replace(/\s+/g, " ").trim();
}

function sendRealtimeTextMessage(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  if (voiceRealtimeResponseActive) {
    addVoiceTutorMessage("assistant", "One moment. I am finishing the current explanation, then you can send your next answer.", {
      state: "live",
      mastery: voiceTutorLastState?.mastery || 0
    });
    return false;
  }
  const sent = sendRealtimeEvent({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: value }]
    }
  });
  if (sent) {
    addVoiceTutorMessage("user", value);
    requestRealtimeTutorResponse(
      `The learner just said: "${value}". Respond as the live tutor for the locked current topic. If this means they do not know the answer, begin teaching the locked topic directly instead of asking what subject they are studying. Keep it conversational and ask one next question.`
    );
  }
  return sent;
}

function handleRealtimeTutorEvent(rawEvent) {
  let event;
  try {
    event = JSON.parse(rawEvent.data);
  } catch {
    return;
  }
  if (event.type === "error") {
    const message = event.error?.message || "Realtime voice session error.";
    console.error(event);
    voiceRealtimeResponseActive = false;
    setVoiceTutorBusy(false);
    addVoiceTutorMessage("assistant", `Error: ${message}`, { state: "error", mastery: voiceTutorLastState?.mastery || 0 });
    return;
  }
  if (event.type === "response.created") {
    voiceRealtimeResponseActive = true;
    voiceRealtimeTranscriptCommitted = false;
    clearVoiceNoTranscriptTimer();
    return;
  }
  if (event.type === "input_audio_buffer.speech_started") {
    voiceRealtimeLastSpeechAt = Date.now();
    clearVoiceNoTranscriptTimer();
    if (voiceTutorDiagnosis) voiceTutorDiagnosis.textContent = "Listening to your answer...";
    return;
  }
  if (event.type === "input_audio_buffer.speech_stopped" || event.type === "input_audio_buffer.committed") {
    if (voiceTutorDiagnosis) voiceTutorDiagnosis.textContent = "Processing what you said...";
    scheduleVoiceNoTranscriptNotice();
    return;
  }
  if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
    const transcript = String(event.transcript || "").trim();
    clearVoiceNoTranscriptTimer();
    voiceRealtimeLastTranscriptText = transcript;
    voiceRealtimeLastTranscriptAt = Date.now();
    if (isLikelyVoiceAssistantEcho(transcript)) {
      if (voiceTutorDiagnosis) {
        voiceTutorDiagnosis.textContent = "Ignored echo from the tutor audio. Speak again when you are ready, or type below.";
      }
      return;
    }
    if (!isDuplicateVoiceUserTranscript(transcript)) {
      addVoiceTutorMessage("user", transcript);
    }
    window.setTimeout(() => {
      if (!voiceRealtimeConnected || voiceRealtimeResponseActive) return;
      requestRealtimeTutorResponse(
        `The learner just said aloud: "${transcript}". Respond as the live tutor for the locked current topic. Diagnose their answer, then ask one focused follow-up. If they are stuck, teach the basics of this exact topic instead of asking what subject they are studying.`
      );
    }, 350);
    return;
  }
  if (event.type === "conversation.item.input_audio_transcription.failed") {
    const message = event.error?.message || "I could not transcribe that clearly. Please try again or type the answer below.";
    addVoiceTutorMessage("assistant", message, {
      state: "listening",
      mastery: voiceTutorLastState?.mastery || 0
    });
    return;
  }
  if ((event.type === "response.audio_transcript.delta" || event.type === "response.output_audio_transcript.delta" || event.type === "response.text.delta") && event.delta) {
    voiceRealtimeAssistantDraft += event.delta;
    return;
  }
  if (event.type === "response.audio_transcript.done" || event.type === "response.output_audio_transcript.done") {
    const transcript = event.transcript || voiceRealtimeAssistantDraft;
    voiceRealtimeAssistantDraft = "";
    if (transcript && transcript.trim()) {
      voiceRealtimeTranscriptCommitted = true;
      addVoiceTutorMessage("assistant", transcript.trim(), {
        state: "live",
        mastery: voiceTutorLastState?.mastery || 0,
        diagnosis: "Realtime tutor responded from the current note context."
      });
    }
    return;
  }
  if (event.type === "response.done") {
    const failedMessage = event.response?.status === "failed"
      ? (event.response?.status_details?.error?.message || "Realtime voice response failed.")
      : "";
    const transcript = voiceRealtimeTranscriptCommitted
      ? ""
      : (voiceRealtimeAssistantDraft.trim() || extractRealtimeResponseTranscript(event.response));
    voiceRealtimeAssistantDraft = "";
    voiceRealtimeResponseActive = false;
    if (failedMessage) {
      addVoiceTutorMessage("assistant", `Error: ${failedMessage}`, {
        state: "error",
        mastery: voiceTutorLastState?.mastery || 0
      });
      setVoiceTutorBusy(false);
      return;
    }
    if (transcript) {
      voiceRealtimeTranscriptCommitted = true;
      addVoiceTutorMessage("assistant", transcript, {
        state: "live",
        mastery: voiceTutorLastState?.mastery || 0,
        diagnosis: "Realtime tutor responded from the current note context."
      });
    }
    setVoiceTutorBusy(false);
    return;
  }
  if (event.type === "response.cancelled" || event.type === "response.failed") {
    voiceRealtimeResponseActive = false;
    setVoiceTutorBusy(false);
    if (event.type === "response.failed") {
      addVoiceTutorMessage("assistant", `Error: ${event.error?.message || "Realtime voice response failed."}`, {
        state: "error",
        mastery: voiceTutorLastState?.mastery || 0,
        diagnosis: "The live tutor response failed before it could finish."
      });
    }
    return;
  }
  if (event.type === "response.output_text.delta" && event.delta) {
    voiceRealtimeAssistantDraft += event.delta;
  }
}

function createRealtimeAudioElement() {
  if (voiceRealtimeAudio) return voiceRealtimeAudio;
  const audio = document.createElement("audio");
  audio.autoplay = true;
  audio.playsInline = true;
  audio.style.display = "none";
  document.body.appendChild(audio);
  voiceRealtimeAudio = audio;
  return audio;
}

async function waitForIceGathering(peer) {
  if (peer.iceGatheringState === "complete") return;
  await new Promise(resolve => {
    const timeout = setTimeout(resolve, 1200);
    peer.addEventListener("icegatheringstatechange", () => {
      if (peer.iceGatheringState === "complete") {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}

function getVoiceTutorConnectionErrorMessage(error) {
  const name = error?.name || "";
  const message = error?.message || "Realtime voice session failed.";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone permission is off. Please allow microphone access in Chrome/system settings, then start the live tutor again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No microphone was found. Connect or enable a microphone, then start the live tutor again.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The microphone is being used by another app or cannot start. Close other mic apps, then try again.";
  }
  return message;
}

async function startRealtimeVoiceTutor() {
  if (!fullSummary || !fullSummary.trim()) {
    alert("Generate notes first, then start Voice Tutor.");
    return;
  }
  if (voiceRealtimeConnected || voiceRealtimeConnecting || voiceTutorBusy) return;
  if (!navigator.mediaDevices || !window.RTCPeerConnection) {
    alert("Realtime voice needs microphone and WebRTC support. Try a modern Chrome browser.");
    return;
  }

  setVoiceTutorBusy(true);
  voiceRealtimeConnecting = true;
  updateVoiceTutorStatus(voiceTutorLastState);
  try {
    voiceRealtimePeer = new RTCPeerConnection();
    voiceRealtimeAudio = createRealtimeAudioElement();
    voiceRealtimePeer.ontrack = event => {
      const [stream] = event.streams;
      if (stream) voiceRealtimeAudio.srcObject = stream;
    };
    voiceRealtimePeer.onconnectionstatechange = () => {
      const state = voiceRealtimePeer?.connectionState || "";
      if (["failed", "disconnected", "closed"].includes(state)) {
        voiceRealtimeResponseActive = false;
        setVoiceTutorBusy(false);
        updateVoiceTutorStatus(voiceTutorLastState);
        updateVoiceTutorControls();
      }
    };
    voiceRealtimeStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    const micTracks = voiceRealtimeStream.getAudioTracks();
    if (!micTracks.length) {
      throw new Error("No microphone audio track was available. Check browser microphone permission.");
    }
    micTracks.forEach(track => {
      track.enabled = true;
      track.onended = () => {
        voiceRealtimeMuted = true;
        updateVoiceTutorControls();
        if (voiceTutorDiagnosis) voiceTutorDiagnosis.textContent = "Microphone stopped. Restart the live tutor to continue speaking.";
      };
      voiceRealtimePeer.addTrack(track, voiceRealtimeStream);
    });

    voiceRealtimeChannel = voiceRealtimePeer.createDataChannel("oai-events");
    voiceRealtimeChannel.onmessage = handleRealtimeTutorEvent;
    voiceRealtimeChannel.onopen = () => {
      voiceRealtimeConnecting = false;
      voiceRealtimeConnected = true;
      voiceRealtimeMuted = false;
      setVoiceTutorBusy(false);
      updateVoiceTutorStatus({ state: "live", mastery: voiceTutorLastState?.mastery || 0 });
      updateVoiceTutorControls();
      sendRealtimeEvent({
        type: "session.update",
        session: {
          type: "realtime",
          instructions: buildRealtimeTutorTopicInstruction(
            "Begin the live tutoring session now. Start with the common first spoken sentence exactly once, then ask what the learner already understands about that exact topic. Never ask what subject they are working on."
          )
        }
      });
      requestRealtimeTutorResponse(
        "Begin now. Start with the common first spoken sentence exactly once, then ask what the learner already understands about this topic. Do not ask what subject they are working on."
      );
    };
    voiceRealtimeChannel.onclose = () => {
      voiceRealtimeConnected = false;
      voiceRealtimeConnecting = false;
      updateVoiceTutorStatus(voiceTutorLastState);
      updateVoiceTutorControls();
    };

    const offer = await voiceRealtimePeer.createOffer();
    await voiceRealtimePeer.setLocalDescription(offer);
    await waitForIceGathering(voiceRealtimePeer);
    const response = await fetch(`${API_BASE}/voice-tutor/realtime-call`, {
      method: "POST",
      body: buildVoiceTutorSessionFormData(voiceRealtimePeer.localDescription.sdp)
    });
    const answerSdp = await response.text();
    if (!response.ok) {
      let message = answerSdp || "Realtime voice session failed.";
      try {
        const parsed = JSON.parse(answerSdp);
        message = parsed.error || message;
      } catch {}
      throw new Error(message);
    }
    await voiceRealtimePeer.setRemoteDescription({
      type: "answer",
      sdp: answerSdp
    });
  } catch (error) {
    console.error(error);
    addVoiceTutorMessage("assistant", `Error: ${getVoiceTutorConnectionErrorMessage(error)}`, { state: "error", mastery: voiceTutorLastState?.mastery || 0 });
    stopRealtimeVoiceTutor({ silent: true });
    setVoiceTutorBusy(false);
    voiceRealtimeConnecting = false;
    updateVoiceTutorStatus(voiceTutorLastState);
    updateVoiceTutorControls();
  }
}

function startVoiceTutorSession() {
  if (!fullSummary || !fullSummary.trim()) {
    alert("Generate notes first, then start Voice Tutor.");
    return;
  }
  if (voiceRealtimeConnected || voiceRealtimeConnecting) {
    stopRealtimeVoiceTutor();
    return;
  }
  startRealtimeVoiceTutor();
}

function sendVoiceTutorText(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  if (!voiceRealtimeConnected) {
    alert("Start the live tutor first, then type or speak your answer.");
    return false;
  }
  return sendRealtimeTextMessage(value);
}

function sendVoiceTutorTypedAnswer() {
  const value = voiceTextInput ? voiceTextInput.value.trim() : "";
  if (!value) return;
  if (sendVoiceTutorText(value) && voiceTextInput) {
    voiceTextInput.value = "";
  }
}

function toggleVoiceTutorMute() {
  if (!voiceRealtimeStream) return;
  voiceRealtimeMuted = !voiceRealtimeMuted;
  voiceRealtimeStream.getAudioTracks().forEach(track => {
    track.enabled = !voiceRealtimeMuted;
  });
  if (voiceRealtimeMuted) {
    if (voiceTutorDiagnosis) voiceTutorDiagnosis.textContent = "Microphone muted. Unmute when you want to answer aloud.";
  } else {
    if (voiceTutorDiagnosis) voiceTutorDiagnosis.textContent = "Microphone unmuted. Speak naturally, or type a fallback message below.";
  }
  updateVoiceTutorControls();
}

function stopRealtimeVoiceTutor({ silent = false } = {}) {
  clearVoiceNoTranscriptTimer();
  if (voiceRealtimeChannel) {
    try { voiceRealtimeChannel.close(); } catch {}
  }
  if (voiceRealtimePeer) {
    try { voiceRealtimePeer.close(); } catch {}
  }
  if (voiceRealtimeStream) {
    voiceRealtimeStream.getTracks().forEach(track => track.stop());
  }
  if (voiceRealtimeAudio) {
    voiceRealtimeAudio.pause();
    voiceRealtimeAudio.srcObject = null;
    voiceRealtimeAudio.remove();
  }
  voiceRealtimePeer = null;
  voiceRealtimeChannel = null;
  voiceRealtimeStream = null;
  voiceRealtimeAudio = null;
  voiceRealtimeConnected = false;
  voiceRealtimeConnecting = false;
  voiceRealtimeMuted = false;
  voiceRealtimeAssistantDraft = "";
  voiceRealtimeResponseActive = false;
  voiceRealtimeTranscriptCommitted = false;
  voiceRealtimeLastTranscriptText = "";
  voiceRealtimeLastTranscriptAt = 0;
  voiceRealtimeLastSpeechAt = 0;
  if (!silent && voiceTutorLastState?.state !== "error") {
    updateVoiceTutorStatus(voiceTutorLastState);
  }
  updateVoiceTutorControls();
}

function switchTab(tabName, clickedBtn) {
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".asst-tab").forEach(button => button.classList.remove("active"));
  document.getElementById(`tab-${tabName}`).classList.add("active");
  clickedBtn?.classList.add("active");
  if (tabName === "voice") updateVoiceTutorControls();
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
  let inTable = false;

  function isTableLine(value) {
    return /^\s*\|.*\|\s*$/.test(value || "");
  }

  function isTableSeparator(value) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(value || "");
  }

  function splitTableCells(value) {
    return String(value || "")
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(cell => cell.trim());
  }

  function closeTable() {
    if (inTable) {
      output.push("</tbody></table></div>");
      inTable = false;
    }
  }

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

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const nextLine = lines[index + 1] || "";

    const visualMarker = trimmed.match(/^\[\[VISUAL:(\d+)\]\]$/);
    if (visualMarker) {
      closeLists();
      closeTable();
      output.push(renderInlineVisualCard(Number(visualMarker[1])));
      return;
    }

    if (isTableLine(line) && isTableSeparator(nextLine)) {
      closeLists();
      closeTable();
      const headers = splitTableCells(line);
      output.push('<div class="markdown-table-wrap"><table class="markdown-table"><thead><tr>' + headers.map(cell => `<th>${cell}</th>`).join("") + '</tr></thead><tbody>');
      inTable = true;
      return;
    }

    if (isTableSeparator(line)) {
      return;
    }

    if (inTable && isTableLine(line)) {
      const cells = splitTableCells(line);
      output.push('<tr>' + cells.map(cell => `<td>${cell}</td>`).join("") + '</tr>');
      return;
    }

    if (inTable && !isTableLine(line)) {
      closeTable();
    }

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
  closeTable();

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
  // v22: show the generated content immediately.
  // The loading animation stays unchanged while the backend is generating; this
  // only removes the slow post-generation typing effect that made long notes feel
  // like they were still generating.
  if (!element) return;
  if (currentTypingTimer) {
    clearInterval(currentTypingTimer);
    currentTypingTimer = null;
  }
  element.innerHTML = String(html || "");
  if (typeof done === "function") done();
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
  return safeSetLocalStorage(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 20)));
}

function openVisualDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(VISUAL_DB_NAME, VISUAL_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(VISUAL_DB_STORE)) {
        const store = db.createObjectStore(VISUAL_DB_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open visual cache."));
  });
}

function visualRecordKeys(historyId, sourceFingerprint) {
  const keys = [];
  if (historyId) keys.push(`history:${historyId}`);
  if (sourceFingerprint) keys.push(`fingerprint:${sourceFingerprint}`);
  return keys;
}

function transactVisualStore(mode, callback) {
  return openVisualDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(VISUAL_DB_STORE, mode);
    const store = tx.objectStore(VISUAL_DB_STORE);
    let result;
    try {
      result = callback(store);
    } catch (error) {
      db.close();
      reject(error);
      return;
    }
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error("Visual cache transaction failed."));
    };
  }));
}

function compactVisualGalleryForStorage(items) {
  return sanitizeLearningFigures(items)
    .filter(item => item && item.url)
    .map(item => ({
      index: item.index,
      source_index: item.source_index,
      source_title: item.source_title || "",
      location: item.location || "",
      visual_kind: item.visual_kind || "",
      caption: item.caption || "",
      url: item.url,
      title: item.title || "",
      what_shows: item.what_shows || "",
      argument_supported: item.argument_supported || "",
      cross_source_connection: item.cross_source_connection || "",
      how_to_read: item.how_to_read || "",
      exam_use: item.exam_use || ""
    }));
}

async function pruneVisualGalleryAssets(limit = VISUAL_HISTORY_LIMIT) {
  try {
    const db = await openVisualDB();
    const tx = db.transaction(VISUAL_DB_STORE, "readwrite");
    const store = tx.objectStore(VISUAL_DB_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const records = Array.isArray(request.result) ? request.result : [];
      const historyRecords = records
        .filter(record => String(record.id || "").startsWith("history:"))
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
      const keepHistoryIds = new Set(historyRecords.slice(0, limit).map(record => record.id));
      const keepFingerprints = new Set(historyRecords.slice(0, limit).map(record => record.sourceFingerprint).filter(Boolean));
      records.forEach(record => {
        const id = String(record.id || "");
        if (id.startsWith("history:") && !keepHistoryIds.has(id)) store.delete(id);
        if (id.startsWith("fingerprint:") && !keepFingerprints.has(record.sourceFingerprint)) store.delete(id);
      });
    };
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn("Visual cache pruning skipped:", error);
  }
}

async function saveVisualGalleryAssets(historyId, sourceFingerprint, items) {
  const visualItems = compactVisualGalleryForStorage(items);
  if (!visualItems.length) return;

  const updatedAt = Date.now();
  const records = visualRecordKeys(historyId, sourceFingerprint).map(id => ({
    id,
    historyId,
    sourceFingerprint,
    updatedAt,
    items: visualItems
  }));

  try {
    await transactVisualStore("readwrite", store => {
      records.forEach(record => store.put(record));
    });
    pruneVisualGalleryAssets();
  } catch (error) {
    console.warn("Could not persist source visuals:", error);
  }
}

async function loadVisualGalleryAssets(historyId, sourceFingerprint) {
  const keys = visualRecordKeys(historyId, sourceFingerprint);
  if (!keys.length) return [];

  try {
    const db = await openVisualDB();
    for (const key of keys) {
      const result = await new Promise((resolve, reject) => {
        const tx = db.transaction(VISUAL_DB_STORE, "readonly");
        const request = tx.objectStore(VISUAL_DB_STORE).get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      if (result && Array.isArray(result.items) && result.items.length) {
        db.close();
        return result.items;
      }
    }
    db.close();
  } catch (error) {
    console.warn("Could not restore source visuals:", error);
  }
  return [];
}

async function deleteVisualGalleryAssets(historyId, sourceFingerprint) {
  try {
    const keys = visualRecordKeys(historyId, sourceFingerprint);
    if (!keys.length) return;
    await transactVisualStore("readwrite", store => {
      keys.forEach(key => store.delete(key));
    });
  } catch (error) {
    console.warn("Could not delete cached source visuals:", error);
  }
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
  const query = String(filter || "").toLowerCase().trim();
  const items = getHistory().filter(item => {
    const haystack = `${item.title || ""} ${item.summary || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  const html = renderHistoryItemsHTML(items);
  if (historyList) historyList.innerHTML = html;
  if (mobileHistoryList) mobileHistoryList.innerHTML = html;
}

function renderHistoryItemsHTML(items) {
  if (!items.length) {
    return `<p class="history-empty">No matching generated notes yet.</p>`;
  }

  return items.map(item => `
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

function closeMobileNavIfOpen() {
  const mobileNav = document.getElementById("mobileNav");
  if (!mobileNav || typeof bootstrap === "undefined") return;
  const instance = bootstrap.Offcanvas.getInstance(mobileNav);
  if (instance) instance.hide();
}

async function deleteHistoryEntry(event, id) {
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
  await deleteVisualGalleryAssets(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteTutorChatHistory(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteTimelinePath(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteQuizHistory(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteFlashcardDeck(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  deleteVoiceTutorHistory(id, target?.sourceFingerprint || target?.clientFingerprint || "");
  renderHistory(historySearch ? historySearch.value : "");
}

async function loadHistoryEntry(id, options = {}) {
  const item = getHistory().find(entry => entry.id === id);
  if (!item) return;
  closeMobileNavIfOpen();

  fullSummary = removeAutoBilingualHeadings(item.summary || "", item.language || "auto");
  storedTitle = item.title || makeHistoryTitle(fullSummary) || "Study Notes";
  sections = cleanAutoLanguageSectionTitles(hydrateSectionsFromSummary(item.sections || {}, fullSummary), fullSummary, item.language || "auto");
  connectionsData = item.connections || [];
  currentSourceFingerprint = item.sourceFingerprint || item.clientFingerprint || "";
  currentHistoryId = item.id;
  currentPrimarySourceIdentity = item.primarySourceIdentity || item.primary_source_identity || "";
  const localVisuals = Array.isArray(item.visualGallery) ? item.visualGallery : [];
  const restoredVisuals = await loadVisualGalleryAssets(id, currentSourceFingerprint);
  visualGalleryData = sanitizeLearningFigures(restoredVisuals.length ? restoredVisuals : localVisuals);

  safeSetLocalStorage(ACTIVE_HISTORY_KEY, id);
  showAnalysisView({ scrollToTop: !options.preserveScroll });

  sectionTitle.innerText = "Study Notes";
  contextLabel.textContent = "Current Notes";
  renderSections();
  renderConnections();
  currentMindMap = item.mindMap || item.mind_map || item.brainstorm || null;
  resetTimelineState();
  loadTimelineForCurrentNote();
  resetQuizState();
  loadQuizHistoryForCurrentNote();
  loadFlashcardsForCurrentNote();
  loadVoiceTutorHistoryForCurrentNote();
  activeMindBranchIndex = 0;
  activeMindPointIndex = 0;
  switchTool("mindmap");
  renderMindMap(currentMindMap);
  renderVisualGallery();
  loadTutorChatHistoryForCurrentNote();
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
if (mobileHistorySearch) {
  mobileHistorySearch.addEventListener("input", event => {
    if (historySearch) historySearch.value = event.target.value;
    renderHistory(event.target.value);
  });
}
cleanExistingHistoryTitles();
renderHistory();
setupTimelineTool();
setupQuizTool();
setupFlashcardTool();

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

if (voiceTextInput) voiceTextInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendVoiceTutorTypedAnswer();
  }
});

renderVoiceTutorHistory();
