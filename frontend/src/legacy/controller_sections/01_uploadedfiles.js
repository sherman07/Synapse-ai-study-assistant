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
const sourceInput = document.getElementById("sourceInput");
const uploadStage = document.getElementById("uploadStage");
const analysisStage = document.getElementById("analysisStage");
const resultGrid = document.getElementById("resultGrid");
const mainNotes = document.getElementById("mainNotes");
const loadingBox = document.getElementById("loadingBox");
const summaryNav = document.getElementById("summaryNav");
const summaryNavToggle = document.getElementById("summaryNavToggle");
const sectionsContainer = document.getElementById("sections");
const summaryContent = document.getElementById("summaryContent");
const visualGallery = document.getElementById("visualGallery");
const sectionTitle = document.getElementById("sectionTitle");
const fullNotesBtn = document.getElementById("fullNotesBtn");
const sourceViewerBtn = document.getElementById("sourceViewerBtn");
const downloadNotesBtn = document.getElementById("downloadNotesBtn");
const notesTranslateLanguage = document.getElementById("notesTranslateLanguage");
const sourceViewerPanel = document.getElementById("sourceViewerPanel");
const sourceViewerTabs = document.getElementById("sourceViewerTabs");
const sourceViewerTitle = document.getElementById("sourceViewerTitle");
const sourceViewerMeta = document.getElementById("sourceViewerMeta");
const sourceViewerBody = document.getElementById("sourceViewerBody");
const sourceZoomLabel = document.getElementById("sourceZoomLabel");
const assistant = document.getElementById("assistant");
const openAssistantBtn = document.getElementById("openAssistant");
const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("questionInput");
const voiceMessages = document.getElementById("voiceMessages");
const voiceTutorState = document.getElementById("voiceTutorState");
const voiceTutorDiagnosis = document.getElementById("voiceTutorDiagnosis");
const voiceTutorMastery = document.getElementById("voiceTutorMastery");
const voiceTutorMasteryFill = document.getElementById("voiceTutorMasteryFill");
const voiceTutorProgressLabel = document.getElementById("voiceTutorProgressLabel");
const voiceRecordBtn = document.getElementById("voiceRecordBtn");
const voiceMuteBtn = document.getElementById("voiceMuteBtn");
const voiceTextInput = document.getElementById("voiceTextInput");
const contextLabel = document.getElementById("contextLabel");
const mindMapCanvas = document.getElementById("mindMapCanvas");
const generateBtn = document.getElementById("generateBtn");
const preferredLanguage = document.getElementById("preferredLanguage");
const detailLevel = document.getElementById("detailLevel");
const promptMode = document.getElementById("promptMode");
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
const SOURCE_DB_NAME = "synapse.source.assets.v1";
const SOURCE_DB_STORE = "sourceAssets";
const SOURCE_DB_VERSION = 1;
const SOURCE_HISTORY_LIMIT = 20;
const MAX_SOURCE_PREVIEW_BYTES = 80 * 1024 * 1024;
const ANALYSIS_TIMEOUT_MS = Number(window.SYNAPSE_ANALYSIS_TIMEOUT_MS || 8 * 60 * 1000);
const SUMMARY_NAV_COLLAPSED_KEY = "synapse.summary.nav.collapsed.v1";
const VISUAL_STORE_CONFIG = {
  dbName: VISUAL_DB_NAME,
  version: VISUAL_DB_VERSION,
  storeName: VISUAL_DB_STORE,
  errorLabel: "visual cache"
};
const SOURCE_STORE_CONFIG = {
  dbName: SOURCE_DB_NAME,
  version: SOURCE_DB_VERSION,
  storeName: SOURCE_DB_STORE,
  errorLabel: "source cache"
};
let currentSourceFingerprint = "";
let currentHistoryId = "";
let currentPrimarySourceIdentity = "";
let currentMindMap = null;
let storedTitle = "Study Notes";
let activeTool = "mindmap";
let activeMindBranchIndex = 0;
let activeMindPointIndex = 0;
let activeMindChildIndex = -1;
let mindDetailPopupOpen = false;
let mindDetailPopupLeft = 24;
let mindDetailPopupTop = 72;
let mindDetailPopupPlacement = "right";
let collapsedMindBranches = new Set();
let visualGalleryData = [];
let sourceViewerItems = [];
let sourceViewerOpen = false;
let activeSourceItemId = "";
let sourceViewerZoom = 100;
let summaryNavCollapsed = false;
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

function readSummaryNavPreference() {
  return safeGetLocalStorage(SUMMARY_NAV_COLLAPSED_KEY, "") === "true";
}

function applySummaryNavCollapsed() {
  if (!appLayout || !summaryNav) return;
  appLayout.classList.toggle("summary-collapsed", summaryNavCollapsed);
  summaryNav.classList.toggle("collapsed", summaryNavCollapsed);

  if (!summaryNavToggle) return;
  const expanded = !summaryNavCollapsed;
  summaryNavToggle.setAttribute("aria-expanded", String(expanded));
  summaryNavToggle.setAttribute("aria-label", expanded ? "Collapse sections" : "Expand sections");
  summaryNavToggle.title = expanded ? "Collapse sections" : "Expand sections";
  const icon = summaryNavToggle.querySelector("i");
  if (icon) {
    icon.className = expanded ? "bi bi-chevron-double-left" : "bi bi-chevron-double-right";
  }
}

function toggleSummaryNav(force = null) {
  summaryNavCollapsed = typeof force === "boolean" ? force : !summaryNavCollapsed;
  safeSetLocalStorage(SUMMARY_NAV_COLLAPSED_KEY, String(summaryNavCollapsed));
  applySummaryNavCollapsed();
}

summaryNavCollapsed = readSummaryNavPreference();
applySummaryNavCollapsed();

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
let timelineCompletionCelebrated = false;

const VISUAL_IMAGE_GUIDE_STYLE_VERSION = "grid-infographic-v5";
const VISUAL_GUIDE_STORAGE_KEY = "synapse.visual.image.guide.v6";
let currentVisualGuide = null;
let visualGuideError = "";
let isVisualGuideGenerating = false;

const QUIZ_STORAGE_KEY = "synapse.quiz.settings.v3";
const QUIZ_HISTORY_STORAGE_KEY = "synapse.quiz.history.v1";
const QUIZ_HISTORY_LIMIT = 16;
const QUIZ_TYPE_OPTIONS = [
  { value: "single_choice", label: "Single choice", description: "4 options, only 1 correct answer" },
  { value: "multiple_choice", label: "Multiple choice", description: "Multiple correct answers for careful distinction" },
  { value: "true_false", label: "True / False", description: "Quickly test concept boundaries" },
  { value: "worked_problem", label: "Worked problem", description: "Exam-style calculation or proof with marks" },
  { value: "error_diagnosis", label: "Error diagnosis", description: "Find and fix a realistic wrong step" },
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
  questionTypes: [
    { type: "worked_problem", count: 2 },
    { type: "error_diagnosis", count: 1 },
    { type: "case_analysis", count: 1 },
    { type: "short_answer", count: 1 },
    { type: "single_choice", count: 1 }
  ]
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
  const figures = sanitizeLearningFigures(visualGalleryData);
  const byStoredIndex = figures.find(item => Number(item?.index) === markerIndex);
  if (isRelevantLearningFigure(byStoredIndex)) return byStoredIndex;
  return null;
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

function isUsefulVisualDetailText(value) {
  const text = cleanSourceFigureDisplayText(value);
  if (!text || text.length < 14) return false;
  if (/^(image|picture|visual|source figure|figure)$/i.test(text)) return false;
  if (/\b(direct support|nearby concept|uploaded material|source figure|visual evidence|connect this source figure|main concept|other uploaded materials|refer to this source figure|read alongside)\b/i.test(text)) {
    return false;
  }
  return true;
}

function getVisualDetailText(item, keys) {
  for (const key of keys) {
    const value = cleanSourceFigureDisplayText(item?.[key] || "");
    if (isUsefulVisualDetailText(value)) return value;
  }
  return "";
}

function visualDetailLanguageIsChinese(item) {
  return /[\u4e00-\u9fff]/.test(sourceFigureText(item));
}

function getDefaultVisualDetail(item, role) {
  const kind = String(item?.visual_kind || "").toLowerCase();
  const title = cleanSourceFigureDisplayText(item?.title || "this source figure");
  const isChinese = visualDetailLanguageIsChinese(item);
  const defaults = isChinese ? {
    what: "这个来源图表把正文里的概念变成可观察的证据：先看标题和图中元素，再判断它在比较什么、检验什么或展示什么关系。",
    why: `它的作用不是装饰，而是帮助学生把“${title}”和来源中的具体证据连接起来。`,
    how: kind.includes("graph") || kind.includes("chart")
      ? "先读标题和坐标轴，再看趋势、组间差异和异常点；最后用一句话说明这个模式支持或限制了哪个论点。"
      : kind.includes("table")
        ? "先看行列分别代表什么，再找关键数值、最大/最小值和组间差异；不要只复制数字，要解释数字的意义。"
        : kind.includes("experiment") || kind.includes("event")
          ? "先分清参与者、条件、步骤和结果，再说明这个设计如何检验一个理论解释。"
          : "先识别图中的标签、箭头、步骤或空间关系，再把它们连回正文中的机制或概念。",
    exam: "答题时先描述图中可见证据，再解释它说明了什么、不能说明什么，并把它连接到核心概念。"
  } : {
    what: "This source figure turns the nearby concept into visible evidence: read the title and visible elements first, then identify what is being compared, tested, sequenced, or measured.",
    why: `It is included because it helps the student connect ${title} to concrete source evidence rather than memorising the idea as an abstract label.`,
    how: kind.includes("graph") || kind.includes("chart")
      ? "Read the title and axes first, then describe the trend, group difference, or outlier before interpreting what the pattern supports or limits."
      : kind.includes("table")
        ? "Read the rows and columns first, then identify the key values and contrasts; explain what the numbers mean rather than copying them."
        : kind.includes("experiment") || kind.includes("event")
          ? "Identify the participant, conditions, sequence, and result, then explain how the design tests the theory."
          : "Identify the labels, arrows, steps, or spatial relationships, then connect them back to the mechanism or concept in the notes.",
    exam: "In an answer, describe what is visible, interpret the source evidence, state the limit or implication, and connect it back to the concept."
  };
  return defaults[role] || "";
}

function getVisualExplanationSections(item, options = {}) {
  const includeFallbacks = options.includeFallbacks !== false;
  const isChinese = visualDetailLanguageIsChinese(item);
  const sections = [
    {
      key: "what",
      label: isChinese ? "What to notice / 图中重点" : "What to notice",
      value: getVisualDetailText(item, ["what_shows", "caption"]) || (includeFallbacks ? getDefaultVisualDetail(item, "what") : "")
    },
    {
      key: "why",
      label: isChinese ? "Why it matters / 为什么重要" : "Why it matters",
      value: getVisualDetailText(item, ["why_relevant", "argument_supported", "cross_source_connection"]) || (includeFallbacks ? getDefaultVisualDetail(item, "why") : "")
    },
    {
      key: "how",
      label: isChinese ? "How to read it / 怎么读" : "How to read it",
      value: getVisualDetailText(item, ["how_to_read"]) || (includeFallbacks ? getDefaultVisualDetail(item, "how") : "")
    },
    {
      key: "exam",
      label: isChinese ? "Study use / 复习用法" : "Study use",
      value: getVisualDetailText(item, ["exam_use"]) || (includeFallbacks ? getDefaultVisualDetail(item, "exam") : "")
    },
    {
      key: "connection",
      label: isChinese ? "Connection / 知识连接" : "Connection",
      value: getVisualDetailText(item, ["cross_source_connection"])
    }
  ];
  const seen = new Set();
  return sections.filter(section => {
    const value = cleanSourceFigureDisplayText(section.value);
    if (!value) return false;
    const dedupeKey = value.toLowerCase();
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    section.value = value;
    return true;
  });
}

function renderVisualExplanationSections(item, options = {}) {
  const compact = Boolean(options.compact);
  const limit = compact ? 3 : 5;
  const sections = getVisualExplanationSections(item).slice(0, limit);
  if (!sections.length) return "";
  return `
    <div class="${compact ? "inline-visual-details" : "visual-detail-grid"}">
      ${sections.map(section => `
        <section class="visual-detail-item">
          <strong>${escapeHTML(section.label)}</strong>
          <p>${escapeHTML(compact ? shorten(section.value, 190) : section.value)}</p>
        </section>
      `).join("")}
    </div>
  `;
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

if (linkInput) {
  linkInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addLinksFromInput();
    }
  });
}

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

const SOURCE_LINK_CANDIDATE_PATTERN = /(?:https?:\/\/|www\.|youtube(?:-nocookie)?\.com\/|youtu\.be\/|[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s<>()]*)?)[^\s<>()]*/gi;
function cleanSourceLinkCandidate(value) {
  return String(value || "")
    .trim()
    .replace(/^[<("'“”‘’]+/g, "")
    .replace(/[>),.;!?'"\u201c\u201d\u2018\u2019]+$/g, "")
    .trim();
}

function normalizeSourceLink(value) {
  const cleaned = cleanSourceLinkCandidate(value);
  if (!cleaned) return "";
  const youtubeId = getYouTubeVideoIdClient(cleaned);
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  const withProtocol = /^https?:\/\//i.test(cleaned)
    ? cleaned
    : (/^(?:www\.|[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i.test(cleaned) ? `https://${cleaned}` : cleaned);
  try {
    const url = new URL(withProtocol);
    if (!/^https?:$/i.test(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function uniqueSourceLinks(links) {
  const seenLinks = new Set();
  const seenYoutubeIds = new Set();
  const unique = [];
  (links || []).forEach(link => {
    const normalized = normalizeSourceLink(link);
    if (!normalized) return;
    const youtubeId = getYouTubeVideoIdClient(normalized);
    if (youtubeId) {
      if (seenYoutubeIds.has(youtubeId)) return;
      seenYoutubeIds.add(youtubeId);
      unique.push(`https://www.youtube.com/watch?v=${youtubeId}`);
      return;
    }
    if (seenLinks.has(normalized)) return;
    seenLinks.add(normalized);
    unique.push(normalized);
  });
  return unique;
}

function extractSourceLinksClient(value) {
  const matches = String(value || "").match(SOURCE_LINK_CANDIDATE_PATTERN) || [];
  return uniqueSourceLinks(matches);
}

function renderLinkPreview() {
  if (!linkPreview) return;
  if (!uploadedLinks.length) {
    linkPreview.classList.add("d-none");
    linkPreview.innerHTML = "";
    return;
  }
  linkPreview.classList.remove("d-none");
  linkPreview.innerHTML = uploadedLinks.map((url, index) => {
    const isYoutube = Boolean(getYouTubeVideoIdClient(url));
    return `
      <div class="link-chip">
        <i class="bi ${isYoutube ? "bi-youtube" : "bi-link-45deg"}"></i>
        <span title="${escapeAttr(url)}">${escapeHTML(shorten(url, 68))}</span>
        <button type="button" onclick="removeLink(${index})" aria-label="Remove link">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
  }).join("");
}

function addLinksFromInput(value = null) {
  const source = value === null ? (linkInput?.value || "") : value;
  const links = extractSourceLinksClient(source);
  if (!links.length) {
    if (linkInput && String(source || "").trim()) {
      const wrap = linkInput.closest(".multi-link-input-wrap");
      wrap?.classList.add("invalid");
      window.setTimeout(() => wrap?.classList.remove("invalid"), 1200);
    }
    return;
  }
  uploadedLinks = uniqueSourceLinks([...uploadedLinks, ...links]);
  if (linkInput && value === null) linkInput.value = "";
  renderLinkPreview();
}

function removeLink(index) {
  uploadedLinks.splice(index, 1);
  renderLinkPreview();
}

function parseMixedSources(rawSource) {
  const text = String(rawSource || "").trim();
  const links = extractSourceLinksClient(text);

  return {
    links,
    freeText: text
  };
}

async function analyzeMaterials() {
  const rawSource = sourceInput ? sourceInput.value.trim() : "";
  const parsedSources = parseMixedSources(rawSource);
  const sourceLinks = uniqueSourceLinks([...uploadedLinks, ...parsedSources.links]);

  if (uploadedFiles.length === 0 && !rawSource && !sourceLinks.length) {
    alert("Upload at least one file, link, video link, or text first.");
    return;
  }

  currentSourceFingerprint = await buildClientFingerprint(rawSource, sourceLinks);


  setGeneratingState(true);

  const formData = new FormData();
  uploadedFiles.forEach(file => formData.append("files", file));

  formData.append("links", JSON.stringify(sourceLinks));
  formData.append("free_text", parsedSources.freeText);
  formData.append("preferred_language", preferredLanguage ? preferredLanguage.value : "auto");
  formData.append("detail_level", detailLevel ? detailLevel.value : "auto");
  formData.append("prompt_mode", promptMode ? promptMode.value : "professor_mode");
  formData.append("client_fingerprint", currentSourceFingerprint);

  try {
    const response = await apiClient.fetch("/analyze", {
      method: "POST",
      body: formData,
      timeoutMs: ANALYSIS_TIMEOUT_MS
    });

    let data = null;
    try {
      const contentType = response.headers?.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        const body = await response.text().catch(() => "");
        const preview = body ? ` Response preview: ${shorten(body.replace(/\s+/g, " "), 180)}` : "";
        throw new Error(
          `Backend returned ${contentType || "non-JSON"} from ${response.url || apiClient.endpoint("/analyze")} (HTTP ${response.status}). Make sure the Python backend is running at ${apiClient.baseUrl}.${preview}`
        );
      }
      data = await response.json();
    } catch (error) {
      throw new Error(error?.message || "Backend returned non-JSON response. Check the Python terminal.");
    }

    if (!response.ok || data.error) {
      throw new Error(data.error || `Analysis failed with status ${response.status}.`);
    }

    const outputLanguage = preferredLanguage ? preferredLanguage.value : "auto";
    fullSummary = removeAutoBilingualHeadings(data.summary || "", outputLanguage);
    storedTitle = data.title || makeHistoryTitle(fullSummary) || "Study Notes";
    sections = cleanAutoLanguageSectionTitles(hydrateSectionsFromSummary(data.sections || {}, fullSummary), fullSummary, outputLanguage);
    fullSummary = ensureRenderableSummary(fullSummary, sections);
    connectionsData = data.connections || [];
    currentMindMap = data.mind_map || data.mindMap || data.brainstorm || null;
    visualGalleryData = sanitizeLearningFigures(data.visual_gallery);
    currentPrimarySourceIdentity = data.primary_source_identity || "";
    currentHistoryId = "";
    resetTimelineState();
    resetVisualGuideState();
    resetQuizState();
    resetFlashcardState();
    resetVoiceTutorState();
    activeMindBranchIndex = 0;
    activeMindPointIndex = 0;
    activeMindChildIndex = -1;
    mindDetailPopupOpen = false;
    collapsedMindBranches = new Set();
    currentSourceFingerprint = data.source_fingerprint || currentSourceFingerprint;
    await buildCurrentSourceItems(rawSource, data.sources || []);
    console.info("Synapse adaptive depth", {
      depth: data.generation_depth || data.detail_level,
      label: data.depth_label,
      reason: data.depth_reason,
      promptMode: data.prompt_mode || (promptMode ? promptMode.value : "professor_mode"),
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
      promptMode: data.prompt_mode || (promptMode ? promptMode.value : "professor_mode"),
      promptModeLabel: data.prompt_mode_label || "",
      sourceFingerprint: data.source_fingerprint || currentSourceFingerprint,
      clientFingerprint: currentSourceFingerprint,
      primarySourceIdentity: data.primary_source_identity || "",
      sources: data.sources || [],
      sourceItems: compactSourceItemsForHistory(sourceViewerItems),
      visualGalleryCount: visualGalleryData.length,
      cached: Boolean(data.cached)
    });
    if (savedEntry && savedEntry.id) {
      currentHistoryId = savedEntry.id;
      safeSetLocalStorage(ACTIVE_HISTORY_KEY, savedEntry.id);
      await saveVisualGalleryAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint, visualGalleryData);
      await saveSourceAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint, sourceViewerItems);
      if (!visualGalleryData.length) {
        const restoredVisuals = await loadVisualGalleryAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint);
        if (restoredVisuals.length) {
          visualGalleryData = sanitizeLearningFigures(restoredVisuals);
          renderVisualGallery();
        }
      }
    }
    loadTimelineForCurrentNote();
    loadVisualGuideForCurrentNote();
    loadQuizHistoryForCurrentNote();
    loadFlashcardsForCurrentNote();
    loadTutorChatHistoryForCurrentNote();
    loadVoiceTutorHistoryForCurrentNote();
    renderMasteryGraphPanel();
    renderFullNotes();
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
  renderSourceViewer();

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
