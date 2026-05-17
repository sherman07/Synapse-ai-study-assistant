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
const SUMMARY_NAV_COLLAPSED_KEY = "synapse.summary.nav.collapsed.v1";
let currentTypingTimer = null;
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

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage:`, error);
    return false;
  }
}

function readSummaryNavPreference() {
  try {
    return localStorage.getItem(SUMMARY_NAV_COLLAPSED_KEY) === "true";
  } catch (error) {
    console.warn("Could not read summary navigation preference:", error);
    return false;
  }
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
    activeMindChildIndex = -1;
    mindDetailPopupOpen = false;
    collapsedMindBranches = new Set();
    currentSourceFingerprint = data.source_fingerprint || currentSourceFingerprint;
    await buildCurrentSourceItems(rawSource, data.sources || []);
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

function openVisualModal(index) {
  const item = getLearningFigureByMarker(index);
  if (!item || !item.url) return;
  const title = cleanSourceFigureDisplayText(item.title) || `Source figure ${Number(index) + 1}`;
  const sourceTitle = cleanSourceFigureDisplayText(item.source_title || `Source ${item.source_index || ""}`);
  const metaParts = [
    sourceTitle,
    cleanSourceFigureDisplayText(item.location || ""),
    cleanSourceFigureDisplayText(item.visual_kind || "")
  ].filter(Boolean);
  const explanation = renderVisualExplanationSections(item);
  const overlay = document.createElement("div");
  overlay.className = "visual-modal";
  overlay.innerHTML = `
    <div class="visual-modal-content">
      <button class="visual-modal-close" type="button" aria-label="Close visual"><i class="bi bi-x-lg"></i></button>
      <img src="${escapeAttr(item.url)}" alt="${escapeAttr(title)}">
      <div class="visual-modal-caption">
        <span class="inline-visual-kicker">In-text source</span>
        ${title ? `<h4>${escapeHTML(title)}</h4>` : ""}
        ${metaParts.length ? `<p class="visual-source-meta">${escapeHTML(metaParts.join(" • "))}</p>` : ""}
        ${explanation}
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
  const caption = getVisualDetailText(item, ["what_shows", "caption"]);
  const explanation = renderVisualExplanationSections(item, { compact: true });
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
        ${explanation}
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

function printableSourceListHTML() {
  const items = sourceViewerItems.length
    ? sourceViewerItems
    : [];
  if (!items.length) return "";
  return `
    <section class="print-sources">
      <h2>Uploaded Sources</h2>
      <ul>
        ${items.map(item => `
          <li>
            <strong>${escapeHTML(item.name || item.title || "Source")}</strong>
            ${item.kind ? ` · ${escapeHTML(item.kind)}` : ""}
            ${item.size ? ` · ${escapeHTML(formatBytes(item.size))}` : ""}
            ${item.originalUrl ? `<br><span>${escapeHTML(item.originalUrl)}</span>` : ""}
          </li>
        `).join("")}
      </ul>
    </section>
  `;
}

function buildPrintableNotesHTML() {
  const title = storedTitle || makeHistoryTitle(fullSummary) || "Synapse Study Notes";
  const generatedAt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
  const content = markdownToHTML(fullSummary || summaryContent?.textContent || "");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(title)} - Synapse Notes</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 34px;
      color: #111827;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      line-height: 1.62;
      background: #fff;
    }
    .print-cover { border-bottom: 2px solid #e6ebf7; margin-bottom: 24px; padding-bottom: 18px; }
    .print-cover h1 { font-size: 30px; line-height: 1.12; margin: 0 0 8px; }
    .print-cover p { margin: 0; color: #667085; }
    h1, h2, h3, h4 { color: #111827; break-after: avoid; page-break-after: avoid; }
    h1 { font-size: 28px; margin-top: 28px; }
    h2 { font-size: 22px; margin-top: 26px; border-bottom: 1px solid #edf1f7; padding-bottom: 6px; }
    h3 { font-size: 18px; margin-top: 22px; }
    h4 { font-size: 15px; margin-top: 18px; }
    p, li { font-size: 11.5pt; }
    ul, ol { padding-left: 22px; }
    .markdown-table-wrap { overflow: visible; margin: 16px 0; }
    .markdown-table { width: 100%; border-collapse: collapse; font-size: 10pt; page-break-inside: avoid; }
    .markdown-table th, .markdown-table td { border: 1px solid #d9e1f2; padding: 8px; vertical-align: top; }
    .markdown-table th { background: #eef4ff; text-align: left; }
    .inline-visual-card {
      display: grid;
      grid-template-columns: minmax(0, 42%) minmax(0, 1fr);
      gap: 16px;
      border: 1px solid #d9e4ff;
      border-radius: 14px;
      padding: 14px;
      margin: 18px 0;
      page-break-inside: avoid;
      background: #fbfdff;
    }
    .inline-visual-image-wrap { display: flex; align-items: center; justify-content: center; background: #f6f8ff; border-radius: 10px; overflow: hidden; }
    .inline-visual-card img { display: block; max-width: 100%; max-height: 420px; object-fit: contain; }
    .inline-visual-kicker { text-transform: uppercase; color: #5b6ff6; font-size: 9pt; font-weight: 800; letter-spacing: .08em; }
    .inline-visual-card h4 { margin: 6px 0 4px; }
    .visual-detail-grid { display: grid; gap: 8px; }
    .visual-detail-grid div { border-left: 3px solid #d7defe; padding-left: 8px; }
    .print-sources { margin: 18px 0 26px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
    .print-sources h2 { margin-top: 0; border: 0; }
    @media print {
      body { padding: 20mm 16mm; }
      .inline-visual-card { grid-template-columns: 1fr; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <section class="print-cover">
    <h1>${escapeHTML(title)}</h1>
    <p>Exported from Synapse on ${escapeHTML(generatedAt)}. In-text source figures are included in readable form.</p>
  </section>
  ${printableSourceListHTML()}
  <main>${content}</main>
  <script>
    const waitForImages = () => Promise.all([...document.images].map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    })));
    waitForImages().then(() => setTimeout(() => window.print(), 250));
  <\/script>
</body>
</html>`;
}

function downloadNotesPDF() {
  if (!fullSummary && !summaryContent?.textContent?.trim()) {
    alert("Generate notes before exporting a PDF.");
    return;
  }
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Your browser blocked the PDF export window. Allow pop-ups for this page and try again.");
    return;
  }
  printWindow.opener = null;
  printWindow.document.open();
  printWindow.document.write(buildPrintableNotesHTML());
  printWindow.document.close();
}

async function translateCurrentNotes(targetLanguage) {
  const language = String(targetLanguage || "").trim();
  if (!language) return;
  if (!fullSummary.trim()) {
    alert("Generate notes before translating.");
    if (notesTranslateLanguage) notesTranslateLanguage.value = "";
    return;
  }

  const previousLabel = notesTranslateLanguage?.options?.[notesTranslateLanguage.selectedIndex]?.textContent || "Translate";
  if (notesTranslateLanguage) notesTranslateLanguage.disabled = true;
  if (downloadNotesBtn) downloadNotesBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/translate-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: fullSummary,
        sections,
        title: storedTitle,
        target_language: language
      })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.error) {
      throw new Error(data?.error || `Translation failed with status ${response.status}.`);
    }

    fullSummary = data.summary || fullSummary;
    storedTitle = data.title || storedTitle;
    sections = cleanAutoLanguageSectionTitles(hydrateSectionsFromSummary(data.sections || {}, fullSummary), fullSummary, language);
    selectedSection = "";
    sectionTitle.innerText = "Study Notes";
    contextLabel.textContent = "Current Notes";
    renderSections();
    typeInto(summaryContent, markdownToHTML(fullSummary), renderMath);

    const savedEntry = saveHistoryEntry({
      title: storedTitle,
      summary: fullSummary,
      sections,
      connections: connectionsData,
      mindMap: currentMindMap,
      visualGallery: [],
      language,
      detailLevel: "translated",
      depthLabel: "Translated",
      sourceFingerprint: currentSourceFingerprint,
      clientFingerprint: currentSourceFingerprint,
      primarySourceIdentity: currentPrimarySourceIdentity,
      sourceItems: compactSourceItemsForHistory(sourceViewerItems),
      visualGalleryCount: visualGalleryData.length,
      cached: false
    });
    if (savedEntry?.id) {
      currentHistoryId = savedEntry.id;
      safeSetLocalStorage(ACTIVE_HISTORY_KEY, savedEntry.id);
      await saveVisualGalleryAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint, visualGalleryData);
      await saveSourceAssets(savedEntry.id, savedEntry.sourceFingerprint || currentSourceFingerprint, sourceViewerItems);
    }
  } catch (error) {
    console.error(error);
    alert(`Could not translate notes to ${previousLabel}: ${error.message}`);
  } finally {
    if (notesTranslateLanguage) {
      notesTranslateLanguage.disabled = false;
      notesTranslateLanguage.value = "";
    }
    if (downloadNotesBtn) downloadNotesBtn.disabled = false;
  }
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

function isPossiblyIncompleteStudyPathText(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return true;
  if (/\.{3}|…$/.test(text)) return true;
  const withoutClosingPunctuation = text.replace(/[.。!?！？]+$/g, "").trim();
  return /\b(and|or|but|because|with|about|of|for|to|from|between|into|by)$/i.test(withoutClosingPunctuation)
    || /[:;,，；：]$/.test(text);
}

function getStudyPathActionText(event) {
  const task = String(event?.task || "").trim();
  const title = String(event?.title || "this checkpoint").trim();
  const summary = String(event?.summary || "").trim();
  const detail = String(event?.detail || "").trim();
  if (!task) {
    return `Study "${title}", then write a clear two-sentence explanation in your own words. Use one source detail or example from the notes if the checkpoint includes evidence.`;
  }
  if (isPossiblyIncompleteStudyPathText(task)) {
    const support = summary || detail || title;
    return `${task.replace(/[\s:;,，；：.。…]+$/, "")}. Focus on this checkpoint: ${support}`;
  }
  return task;
}

function getStudyPathFinishedText(event) {
  const deliverable = String(event?.deliverable || "").trim();
  const masteryCheck = String(event?.masteryCheck || "").trim();
  if (deliverable && masteryCheck) return `${deliverable} Mastery check: ${masteryCheck}`;
  if (deliverable) return deliverable;
  if (masteryCheck) return masteryCheck;
  if (event?.activePrompt) return `You can answer the active recall prompt without looking and explain one source detail accurately.`;
  return `You can explain this checkpoint in your own words and answer the practice question correctly.`;
}

function renderTimelineInfoBlock(label, value, className = "") {
  if (!value) return "";
  return `
    <div class="timeline-block ${className}">
      <strong>${escapeHTML(label)}</strong>
      <div>${markdownToHTML(value)}</div>
    </div>
  `;
}

function renderTimelineDetail(event) {
  const done = timelineCompletedIds.has(event.id);
  const answerState = getTimelinePracticeState(event.id);
  const canMarkDone = done || answerState.status === "correct";
  const actionText = getStudyPathActionText(event);
  const finishedText = getStudyPathFinishedText(event);
  const supportingBlocks = [
    renderTimelineInfoBlock("Active recall prompt", event.activePrompt, "recall"),
    renderTimelineInfoBlock("Output", event.deliverable),
    renderTimelineInfoBlock("Mastery check", event.masteryCheck, "exam"),
    renderTimelineInfoBlock("Support", event.detail),
    renderTimelineInfoBlock("Source evidence", event.evidence, "evidence"),
    renderTimelineInfoBlock("Why it matters", event.whyItMatters),
    renderTimelineInfoBlock("Watch out", event.misconception, "warning"),
    renderTimelineInfoBlock("Exam use", event.examUse, "exam")
  ].filter(Boolean).join("");
  return `
    <article class="timeline-detail-card">
      <div class="timeline-detail-head">
        <span class="timeline-detail-badge">${escapeHTML(getTimelineTypeLabel(event.type))}</span>
        <span class="timeline-detail-marker">${escapeHTML(event.marker)} · ${event.estimatedMinutes || 8} min</span>
      </div>
      <h4>${escapeHTML(event.title)}</h4>
      ${event.summary ? `<div class="timeline-summary">${markdownToHTML(event.summary)}</div>` : ""}
      <div class="timeline-task-card">
        <div class="timeline-task-card-top">
          <span class="timeline-task-label">Do this now</span>
          <button class="timeline-complete-btn ${done ? "done" : ""}" type="button"
            onclick="toggleTimelineComplete('${escapeAttr(event.id)}')" ${canMarkDone ? "" : "disabled"}
            title="${canMarkDone ? "" : "Answer and check the practice question first."}">
            ${done ? "Done" : (canMarkDone ? "Mark done" : "Answer first")}
          </button>
        </div>
        <div class="timeline-task-body">${markdownToHTML(actionText)}</div>
        <div class="timeline-task-success">
          <strong>Finished when</strong>
          <div>${markdownToHTML(finishedText)}</div>
        </div>
        ${canMarkDone ? "" : `<div class="timeline-task-lock"><i class="bi bi-lock me-1"></i>Answer the practice question correctly before marking this task done.</div>`}
      </div>
      ${renderStudyPathPracticeQuestion(event, answerState)}
      ${supportingBlocks ? `<div class="timeline-block-grid">${supportingBlocks}</div>` : ""}
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
        detail: cleaned || "Open this subpoint for detail."
      };
    }

    const rawLabel = child?.label || child?.title || child?.text || child?.detail || `Subpoint ${index + 1}`;
    const detail = cleanMindText(child?.detail || child?.explanation || child?.text || rawLabel);
    const label = makeReadableMindLabel(rawLabel, detail, `Subpoint ${index + 1}`);
    return {
      id: child?.id || `${parentId}-child-${index}`,
      label: fullMindText(label, `Subpoint ${index + 1}`),
      detail: detail || label || "Open this subpoint for detail."
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
        children: normaliseMindChildren([], id, cleaned, cleaned)
      };
    }

    const rawLabel = point?.label || point?.title || point?.text || point?.detail || `Point ${index + 1}`;
    const detail = cleanMindText(point?.detail || point?.explanation || point?.text || rawLabel);
    const label = makeReadableMindLabel(rawLabel, detail, `Point ${index + 1}`);
    const id = point?.id || `point-${index}`;
    const childSource = point?.children || point?.subpoints || point?.leaves || point?.items || [];
    return {
      id,
      label: fullMindText(label, `Point ${index + 1}`),
      detail: detail || label || "Open the related notes for more detail.",
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
      detail: line
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
  const detailBody = fullMindText(activeChild ? activeChild.detail : activePoint ? activePoint.detail : activeBranch.summary, "Open this branch for more detail.");
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
          <div class="mm-detail-body">${escapeHTML(detailBody)}</div>
          <div class="mm-detail-actions">
            <button class="mm-action-btn" type="button" onclick="openActiveMindMapSection()">Go to notes</button>
            <button class="mm-action-btn primary" type="button" onclick="askSelectedMindPoint()">Ask tutor</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
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
    ? `Explain this subpoint from "${branch.label}" > "${point.label}": ${child.detail}`
    : point
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
window.closeMindBranch = closeMindBranch;
window.openMindBranch = openMindBranch;
window.selectMindPoint = selectMindPoint;
window.selectMindChild = selectMindChild;
window.closeMindDetailPopup = closeMindDetailPopup;
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
  const meta = role === "assistant" && options.state
    ? `<div class="voice-message-meta">${escapeHTML(formatVoiceProgressState(options.state))}</div>`
    : "";
  div.innerHTML = `
    <strong>${role === "user" ? "You" : "Synapse Voice Tutor"}</strong>
    ${meta}
    <div>${markdownToHTML(text)}</div>`;
  voiceMessages.appendChild(div);
  renderMath();
  voiceMessages.scrollTop = voiceMessages.scrollHeight;
}

function formatVoiceProgressState(state) {
  return String(state || "Tutor")
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
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
  const explanationSignals = userTexts.filter(text => /\b(because|therefore|for example|evidence|shows|means|however|compare|whereas|source|figure|experiment|method|原因|所以|例如|证据|圖|图|实验|方法)\b/i.test(text)).length;
  const answerWordTotal = userTexts.reduce((total, text) => total + (text.match(/\b[\w'-]+\b/g) || []).length, 0);

  let mastery = 0;
  if (assistantTexts.length) mastery += 8;
  mastery += Math.min(24, userTexts.length * 6);
  mastery += Math.min(34, substantiveAnswers.length * 11);
  mastery += Math.min(12, explanationSignals * 4);
  mastery += Math.min(10, Math.floor(answerWordTotal / 28) * 2);
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

function getVoiceProgressStage(mastery, stateItem = null) {
  const state = String(stateItem?.state || "").toLowerCase();
  if (state === "error") return { label: "Needs attention", className: "error" };
  if (voiceRealtimeConnecting) return { label: "Connecting", className: "connecting" };
  if (!voiceTutorHistory.length && !voiceRealtimeConnected) return { label: "Ready to diagnose", className: "ready" };
  if (mastery >= 88 || state === "mastered") return { label: "Mastery check passed", className: "mastered" };
  if (mastery >= 75) return { label: "Review ready", className: "review" };
  if (mastery >= 55) return { label: "Applying ideas", className: "apply" };
  if (mastery >= 30) return { label: "Building understanding", className: "learn" };
  if (voiceRealtimeConnected) return { label: "Listening and diagnosing", className: "live" };
  return { label: "Warming up", className: "warm" };
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
  const progressStage = getVoiceProgressStage(mastery, stateItem);
  const state = voiceRealtimeConnecting ? "connecting" : (voiceRealtimeConnected ? "live" : (stateItem?.state || (voiceTutorHistory.length ? "saved" : "ready")));
  if (voiceTutorState) voiceTutorState.textContent = formatVoiceProgressState(state);
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
  if (voiceTutorProgressLabel) voiceTutorProgressLabel.textContent = progressStage.label;
  const masteryBox = document.querySelector(".voice-mastery");
  if (masteryBox) {
    masteryBox.dataset.stage = progressStage.className;
    masteryBox.style.setProperty("--voice-progress", `${mastery}%`);
  }
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
  const child = activeMindChildIndex >= 0 ? point?.children?.[activeMindChildIndex] : null;
  const sectionText = sections[branch.section] || sections[branch.label] || "";
  const title = child?.label
    ? `${branch.label}: ${point.label} / ${child.label}`
    : point?.label
    ? `${branch.label}: ${point.label}`
    : branch.label;
  const context = [
    `Mind map branch: ${branch.label}`,
    branch.summary ? `Branch summary: ${branch.summary}` : "",
    point ? `Selected point: ${point.label}\nPoint detail: ${point.detail}` : "",
    child ? `Selected subpoint: ${child.label}\nSubpoint detail: ${child.detail}` : "",
    sectionText ? `Related generated note section:\n${sectionText}` : ""
  ].filter(Boolean).join("\n\n");
  return {
    title,
    context: trimVoiceTopicText(context),
    scope: child ? "current mind map subpoint" : point ? "current mind map point" : "current mind map branch"
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
  const voiceLanguageName = getVoiceTutorLanguageName();
  return [
    `CURRENT TOPIC LOCK: You are tutoring only this generated topic: "${title}".`,
    `Topic scope: ${scope}.`,
    `Expected spoken language: ${voiceLanguageName}. Stay in this language unless the learner clearly gives a full sentence in another language.`,
    "If a very short transcript appears in a different writing system, treat it as a speech-recognition mistake and ask the learner to repeat or type it.",
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
  formData.append("voice_input_language", getVoiceInputLanguageCode());
  formData.append("source_identity", currentPrimarySourceIdentity || "");
  return formData;
}

function normaliseVoiceSpeechText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\s"'“”‘’`.,!?;:，。！？；：()[\]{}<>/\\|-]+/g, " ")
    .trim();
}

function countVoicePattern(text, regex) {
  return (String(text || "").match(regex) || []).length;
}

function normaliseVoiceLanguageKey(language) {
  const key = String(language || "auto").trim().toLowerCase().replace(/-/g, "_");
  const aliases = {
    en: "english",
    eng: "english",
    zh: "simplified_chinese",
    zh_cn: "simplified_chinese",
    zh_hans: "simplified_chinese",
    zh_tw: "traditional_chinese",
    zh_hant: "traditional_chinese",
    ja: "japanese",
    jp: "japanese",
    ko: "korean",
    kr: "korean",
    fr: "french",
    es: "spanish",
    de: "german",
    it: "italian",
    pt: "portuguese",
    ar: "arabic",
    hi: "hindi",
    vi: "vietnamese",
    th: "thai",
    id: "indonesian",
    ms: "malay",
    ru: "russian"
  };
  const normalised = aliases[key] || key;
  const supported = new Set([
    "auto",
    "english",
    "simplified_chinese",
    "traditional_chinese",
    "mixed_chinese_english",
    "japanese",
    "korean",
    "french",
    "spanish",
    "german",
    "italian",
    "portuguese",
    "arabic",
    "hindi",
    "vietnamese",
    "thai",
    "indonesian",
    "malay",
    "russian"
  ]);
  return supported.has(normalised) ? normalised : "auto";
}

function detectDominantVoiceLanguageKey(text) {
  const value = String(text || "");
  const chineseChars = countVoicePattern(value, /[\u4e00-\u9fff]/g);
  const japaneseChars = countVoicePattern(value, /[\u3040-\u30ff]/g);
  const koreanChars = countVoicePattern(value, /[\uac00-\ud7af]/g);
  const arabicChars = countVoicePattern(value, /[\u0600-\u06ff]/g);
  const latinWords = countVoicePattern(value, /\b[A-Za-z]{3,}\b/g);

  if (japaneseChars >= 20 && japaneseChars >= chineseChars * 0.4) return "japanese";
  if (koreanChars >= 20) return "korean";
  if (arabicChars >= 20) return "arabic";
  if (chineseChars >= 60 && chineseChars >= Math.max(25, latinWords * 0.25)) return "simplified_chinese";
  return "english";
}

function getVoiceExpectedLanguageKey() {
  const selected = normaliseVoiceLanguageKey(preferredLanguage ? preferredLanguage.value : "auto");
  if (selected !== "auto" && selected !== "mixed_chinese_english") return selected;
  if (selected === "mixed_chinese_english") return "mixed_chinese_english";
  const topic = getCurrentVoiceTutorTopicContext();
  const sourceText = [
    topic?.title || "",
    topic?.context || "",
    fullSummary || "",
    Object.entries(sections || {}).slice(0, 4).map(([title, content]) => `${title}\n${content}`).join("\n")
  ].join("\n").slice(0, 16000);
  return detectDominantVoiceLanguageKey(sourceText);
}

function getVoiceTutorLanguageName() {
  const names = {
    english: "English",
    simplified_chinese: "Simplified Chinese",
    traditional_chinese: "Traditional Chinese",
    mixed_chinese_english: "Chinese with useful English academic terms",
    japanese: "Japanese",
    korean: "Korean",
    french: "French",
    spanish: "Spanish",
    german: "German",
    italian: "Italian",
    portuguese: "Portuguese",
    arabic: "Arabic",
    hindi: "Hindi",
    vietnamese: "Vietnamese",
    thai: "Thai",
    indonesian: "Indonesian",
    malay: "Malay",
    russian: "Russian"
  };
  return names[getVoiceExpectedLanguageKey()] || "the current note language";
}

function getVoiceInputLanguageCode() {
  const codes = {
    english: "en",
    simplified_chinese: "zh",
    traditional_chinese: "zh",
    japanese: "ja",
    korean: "ko",
    french: "fr",
    spanish: "es",
    german: "de",
    italian: "it",
    portuguese: "pt",
    arabic: "ar",
    hindi: "hi",
    vietnamese: "vi",
    thai: "th",
    indonesian: "id",
    malay: "ms",
    russian: "ru"
  };
  return codes[getVoiceExpectedLanguageKey()] || "";
}

function isLikelyWrongLanguageVoiceTranscript(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  const expected = getVoiceExpectedLanguageKey();
  if (expected === "mixed_chinese_english") return false;
  const latinWords = countVoicePattern(value, /\b[A-Za-z]{2,}\b/g);
  const cjkChars = countVoicePattern(value, /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g);
  const arabicChars = countVoicePattern(value, /[\u0600-\u06ff]/g);
  const latinLetters = countVoicePattern(value, /[A-Za-z]/g);

  if (expected === "english") {
    return (cjkChars + arabicChars > 0) && latinWords === 0 && (value.length <= 28 || cjkChars + arabicChars >= 2);
  }
  if (["simplified_chinese", "traditional_chinese", "japanese", "korean", "arabic"].includes(expected)) {
    return latinLetters >= 3 && cjkChars + arabicChars === 0 && value.length <= 18;
  }
  return false;
}

function rejectWrongLanguageVoiceTranscript(transcript) {
  clearVoiceNoTranscriptTimer();
  voiceRealtimeLastTranscriptText = "";
  if (voiceTutorDiagnosis) {
    voiceTutorDiagnosis.textContent = `I may have misheard that as another language. Please repeat in ${getVoiceTutorLanguageName()} or type your answer below.`;
  }
  console.warn("Ignored likely wrong-language voice transcript:", transcript);
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
    if (isLikelyWrongLanguageVoiceTranscript(transcript)) {
      rejectWrongLanguageVoiceTranscript(transcript);
      return;
    }
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
  document.body.classList.remove("mobile-assistant-open");
  assistant.classList.add("hidden");
  appLayout.classList.add("assistant-closed");
  if (openAssistantBtn) openAssistantBtn.style.display = "block";
}

function isMobileTutorViewport() {
  return window.matchMedia("(max-width: 850px)").matches;
}

function syncAssistantMobileState() {
  if (!assistant || !appLayout) return;
  const isOpen = !assistant.classList.contains("hidden") && appLayout.classList.contains("analysis-ready");
  const shouldUseBottomSheet = isOpen && isMobileTutorViewport();
  document.body.classList.toggle("mobile-assistant-open", shouldUseBottomSheet);
}

function openAssistant() {
  assistant.classList.remove("hidden");
  appLayout.classList.remove("assistant-closed");
  if (isMobileTutorViewport()) {
    assistant.classList.remove("expanded");
    assistantExpanded = false;
  }
  if (openAssistantBtn) openAssistantBtn.style.display = "none";
  syncAssistantMobileState();
}

function expandAssistant() {
  if (isMobileTutorViewport()) {
    assistant.classList.toggle("expanded");
    assistantExpanded = assistant.classList.contains("expanded");
    syncAssistantMobileState();
    return;
  }
  assistantExpanded = !assistantExpanded;
  assistant.classList.toggle("expanded", assistantExpanded);
}

window.addEventListener("resize", syncAssistantMobileState);

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

function sourceRecordKeys(historyId, sourceFingerprint) {
  const keys = [];
  if (historyId) keys.push(`history:${historyId}`);
  if (sourceFingerprint) keys.push(`fingerprint:${sourceFingerprint}`);
  return keys;
}

function openSourceDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(SOURCE_DB_NAME, SOURCE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SOURCE_DB_STORE)) {
        const store = db.createObjectStore(SOURCE_DB_STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open source cache."));
  });
}

function transactSourceStore(mode, callback) {
  return openSourceDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(SOURCE_DB_STORE, mode);
    const store = tx.objectStore(SOURCE_DB_STORE);
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
      reject(tx.error || new Error("Source cache transaction failed."));
    };
  }));
}

function sourceKindFromFile(file) {
  const name = String(file?.name || "").toLowerCase();
  const type = String(file?.type || "").toLowerCase();
  if (type.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (type.includes("image") || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name)) return "image";
  if (type.startsWith("text/") || /\.(txt|md|csv|json|rtf)$/i.test(name)) return "text";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "presentation";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "document";
  return "file";
}

function sourceIcon(kind) {
  const icons = {
    pdf: "bi-file-earmark-pdf",
    image: "bi-image",
    text: "bi-file-text",
    presentation: "bi-file-earmark-slides",
    document: "bi-file-earmark-word",
    youtube: "bi-youtube",
    link: "bi-link-45deg",
    note: "bi-card-text",
    file: "bi-file-earmark"
  };
  return icons[kind] || icons.file;
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
}

function removeDetectedUrlsClient(text) {
  return String(text || "")
    .replace(/https?:\/\/[^\s<>()]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getYouTubeVideoIdClient(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const identityMatch = text.match(/^youtube:([A-Za-z0-9_-]{6,})/i);
  if (identityMatch) return identityMatch[1];

  try {
    const parsed = new URL(text);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === "youtu.be") {
      return parsed.pathname.replace(/^\/+/, "").split(/[/?#]/)[0] || "";
    }
    if (host.endsWith("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) return parsed.searchParams.get("v") || "";
      const pathMatch = parsed.pathname.match(/\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/);
      if (pathMatch) return pathMatch[1];
    }
  } catch {
    // Fall back to regex parsing below.
  }

  const urlMatch = text.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return urlMatch ? urlMatch[1] : "";
}

function youtubeWatchUrlFromItem(item) {
  const raw = item?.originalUrl || item?.url || item?.sourceIdentity || item?.displayName || item?.title || "";
  const videoId = getYouTubeVideoIdClient(raw) || getYouTubeVideoIdClient(item?.sourceIdentity);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : String(raw || "");
}

function youtubeEmbedUrlFromItem(item) {
  const videoId = getYouTubeVideoIdClient(item?.originalUrl || item?.url || item?.sourceIdentity || item?.displayName || item?.title);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
}

function sourceItemLooksLikeYouTube(item = {}) {
  return Boolean(
    getYouTubeVideoIdClient(item.sourceIdentity || item.source_identity) ||
    getYouTubeVideoIdClient(item.originalUrl || item.url || item.displayName || item.display_name || item.title || item.name)
  );
}

function makeSourceObjectUrl(item) {
  if (!item || item.url || !item.blob) return item?.url || "";
  try {
    item.url = URL.createObjectURL(item.blob);
  } catch (error) {
    console.warn("Could not create source preview URL:", error);
  }
  return item.url || "";
}

function revokeSourceObjectURLs(items = sourceViewerItems) {
  (items || []).forEach(item => {
    if (item?.url && String(item.url).startsWith("blob:")) {
      try {
        URL.revokeObjectURL(item.url);
      } catch {
        // Browser may already have released it.
      }
    }
  });
}

function safeSourceItemId(value, index = 0) {
  const raw = String(value || `source:${index + 1}`);
  return raw
    .replace(/[^A-Za-z0-9:_%-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 180) || `source:${index + 1}`;
}

function normaliseSourceViewerItem(item, index = 0) {
  if (!item || typeof item !== "object") return null;
  const name = item.name || item.displayName || item.display_name || item.title || item.title_candidate || `Source ${index + 1}`;
  const derivedKind = sourceKindFromFile(item.blob || item.file || { name, type: item.type || item.contentType || item.content_type || "" });
  const sourceIdentity = item.sourceIdentity || item.source_identity || "";
  let kind = (!item.kind || item.kind === "file") && derivedKind !== "file" ? derivedKind : (item.kind || derivedKind);
  if (sourceItemLooksLikeYouTube({ ...item, sourceIdentity, name })) {
    kind = "youtube";
  }
  const rawOriginalUrl = item.originalUrl || item.original_url || item.url || item.embedded_url || "";
  const youtubeUrl = kind === "youtube" ? youtubeWatchUrlFromItem({ ...item, originalUrl: rawOriginalUrl, sourceIdentity }) : "";
  const originalUrl = rawOriginalUrl || youtubeUrl;
  const rawId = item.id || `${kind}:${sourceIdentity || name}:${index}`;
  return {
    id: safeSourceItemId(rawId, index),
    index: Number(item.index || item.backendIndex || index + 1),
    name,
    title: item.title || item.title_candidate || name,
    displayName: item.displayName || item.display_name || name,
    type: item.type || item.contentType || item.content_type || "",
    size: Number(item.size || item.bytes || 0),
    kind,
    sourceIdentity,
    url: item.url || originalUrl || "",
    originalUrl,
    content: item.content || item.text || "",
    blob: item.blob || item.file || null,
    preview: item.preview || null,
    previewError: item.previewError || "",
    backendIndex: item.backendIndex || item.index || index + 1
  };
}

function restoreSourceViewerItems(items) {
  revokeSourceObjectURLs();
  sourceViewerItems = (items || [])
    .map((item, index) => normaliseSourceViewerItem(item, index))
    .filter(Boolean);
  activeSourceItemId = sourceViewerItems[0]?.id || "";
  renderSourceViewer();
}

async function buildCurrentSourceItems(rawSource, backendSources = []) {
  revokeSourceObjectURLs();
  const parsed = parseMixedSources(rawSource);
  const backendByName = new Map();
  (backendSources || []).forEach(source => {
    const name = String(source.display_name || source.title_candidate || "").toLowerCase();
    if (name) backendByName.set(name, source);
  });

  const items = uploadedFiles.map((file, index) => {
    const backend = backendByName.get(String(file.name || "").toLowerCase()) || backendSources[index] || {};
    const kind = sourceKindFromFile(file);
    return normaliseSourceViewerItem({
      id: `upload:${currentSourceFingerprint || Date.now()}:${index}`,
      index: index + 1,
      name: file.name || `Uploaded source ${index + 1}`,
      title: backend.title_candidate || file.name || `Uploaded source ${index + 1}`,
      displayName: backend.display_name || file.name || `Uploaded source ${index + 1}`,
      type: file.type || "",
      size: file.size || 0,
      kind,
      sourceIdentity: backend.source_identity || "",
      content: backend.text_excerpt || "",
      blob: file
    }, index);
  });

  parsed.links.forEach((url, index) => {
    const isYoutube = /(?:youtube\.com|youtu\.be)/i.test(url);
    items.push(normaliseSourceViewerItem({
      id: `link:${encodeURIComponent(url).slice(0, 140)}`,
      index: items.length + 1,
      name: isYoutube ? `YouTube source ${index + 1}` : `Web source ${index + 1}`,
      title: url,
      displayName: url,
      kind: isYoutube ? "youtube" : "link",
      originalUrl: url,
      url
    }, items.length));
  });

  const freeText = removeDetectedUrlsClient(parsed.freeText);
  if (freeText) {
    items.push(normaliseSourceViewerItem({
      id: `text:${await sha256Hex(freeText)}`,
      index: items.length + 1,
      name: "Pasted text",
      title: "Pasted text",
      displayName: "Pasted text",
      kind: "note",
      content: freeText
    }, items.length));
  }

  (backendSources || []).forEach((source, index) => {
    const identity = source.source_identity || "";
    const displayName = source.display_name || source.title_candidate || "";
    const isYoutube = sourceItemLooksLikeYouTube(source);
    const sourceUrl = source.embedded_url || source.url || (isYoutube ? youtubeWatchUrlFromItem({ sourceIdentity: identity }) : "");
    const alreadyIncluded = items.some(item =>
      (identity && item.sourceIdentity === identity) ||
      (displayName && item.displayName === displayName)
    );
    if (!alreadyIncluded) {
      items.push(normaliseSourceViewerItem({
        id: `meta:${identity || displayName || index}`,
        index: items.length + 1,
        name: displayName || `Source ${index + 1}`,
        title: source.title_candidate || displayName || `Source ${index + 1}`,
        displayName,
        kind: isYoutube ? "youtube" : "file",
        sourceIdentity: identity,
        originalUrl: sourceUrl,
        url: sourceUrl,
        content: source.text_excerpt || ""
      }, items.length));
    }
  });

  sourceViewerItems = items.filter(Boolean);
  activeSourceItemId = sourceViewerItems[0]?.id || "";
  renderSourceViewer();
  return sourceViewerItems;
}

function compactSourceItemsForHistory(items) {
  const truncateSourceText = (value, limit) => {
    const text = String(value || "");
    return text.length > limit ? `${text.slice(0, limit)}\n\n[Source preview truncated for browser storage.]` : text;
  };
  return (items || []).map((item, index) => ({
    id: item.id,
    index: item.index || index + 1,
    name: item.name || item.displayName || `Source ${index + 1}`,
    title: item.title || item.name || `Source ${index + 1}`,
    displayName: item.displayName || item.name || `Source ${index + 1}`,
    type: item.type || "",
    size: item.size || 0,
    kind: item.kind || "file",
    sourceIdentity: item.sourceIdentity || "",
    originalUrl: item.originalUrl || (/^https?:\/\//i.test(item.url || "") ? item.url : ""),
    url: /^https?:\/\//i.test(item.url || "") ? item.url : "",
    content: item.content ? truncateSourceText(item.content, 50000) : ""
  }));
}

function compactSourceItemsForStorage(items) {
  return (items || []).map((item, index) => {
    const compact = compactSourceItemsForHistory([item])[0] || {};
    if (item.blob && Number(item.size || item.blob.size || 0) <= MAX_SOURCE_PREVIEW_BYTES) {
      compact.blob = item.blob;
    }
    compact.index = item.index || index + 1;
    compact.updatedAt = Date.now();
    return compact;
  });
}

async function pruneSourceAssets(limit = SOURCE_HISTORY_LIMIT) {
  try {
    const db = await openSourceDB();
    const tx = db.transaction(SOURCE_DB_STORE, "readwrite");
    const store = tx.objectStore(SOURCE_DB_STORE);
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
    console.warn("Source cache pruning skipped:", error);
  }
}

async function saveSourceAssets(historyId, sourceFingerprint, items) {
  const sourceItems = compactSourceItemsForStorage(items);
  if (!sourceItems.length) return;

  const updatedAt = Date.now();
  const records = sourceRecordKeys(historyId, sourceFingerprint).map(id => ({
    id,
    historyId,
    sourceFingerprint,
    updatedAt,
    items: sourceItems
  }));

  try {
    await transactSourceStore("readwrite", store => {
      records.forEach(record => store.put(record));
    });
    pruneSourceAssets();
  } catch (error) {
    console.warn("Could not persist uploaded sources:", error);
  }
}

async function loadSourceAssets(historyId, sourceFingerprint) {
  const keys = sourceRecordKeys(historyId, sourceFingerprint);
  if (!keys.length) return [];

  try {
    const db = await openSourceDB();
    for (const key of keys) {
      const result = await new Promise((resolve, reject) => {
        const tx = db.transaction(SOURCE_DB_STORE, "readonly");
        const request = tx.objectStore(SOURCE_DB_STORE).get(key);
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
    console.warn("Could not restore uploaded sources:", error);
  }
  return [];
}

async function deleteSourceAssets(historyId, sourceFingerprint) {
  try {
    const keys = sourceRecordKeys(historyId, sourceFingerprint);
    if (!keys.length) return;
    await transactSourceStore("readwrite", store => {
      keys.forEach(key => store.delete(key));
    });
  } catch (error) {
    console.warn("Could not delete cached source files:", error);
  }
}

function renderSourceViewer() {
  if (!sourceViewerPanel || !sourceViewerTabs || !sourceViewerBody) return;
  if (sourceViewerBtn) {
    sourceViewerBtn.disabled = !sourceViewerItems.length;
    sourceViewerBtn.classList.toggle("active", sourceViewerOpen);
  }
  if (!sourceViewerOpen) {
    sourceViewerPanel.classList.add("d-none");
    if (resultGrid) resultGrid.classList.remove("source-open");
    return;
  }

  sourceViewerPanel.classList.remove("d-none");
  if (resultGrid) resultGrid.classList.add("source-open");

  if (!sourceViewerItems.length) {
    sourceViewerTabs.innerHTML = "";
    sourceViewerBody.innerHTML = `
      <div class="source-viewer-empty">
        <i class="bi bi-folder2-open"></i>
        <h3>No source file preview is available</h3>
        <p>Regenerate from uploaded files to restore source previews, or use in-text source images already embedded in the notes.</p>
      </div>
    `;
    return;
  }

  if (!activeSourceItemId || !sourceViewerItems.some(item => item.id === activeSourceItemId)) {
    activeSourceItemId = sourceViewerItems[0].id;
  }

  sourceViewerTabs.innerHTML = sourceViewerItems.map(item => `
    <button type="button"
            class="source-tab ${item.id === activeSourceItemId ? "active" : ""}"
            title="${escapeAttr(item.title || item.name)}"
            onclick="selectSourceItem('${escapeAttr(item.id)}')">
      <i class="bi ${sourceIcon(item.kind)}"></i>
      <span>${escapeHTML(shorten(item.name || item.title, 26))}</span>
    </button>
  `).join("");

  const active = sourceViewerItems.find(item => item.id === activeSourceItemId) || sourceViewerItems[0];
  renderSourceViewerBody(active);
}

function toggleSourceViewer(force = null) {
  const desired = typeof force === "boolean" ? force : !sourceViewerOpen;
  sourceViewerOpen = desired;
  renderSourceViewer();
}

function selectSourceItem(id) {
  activeSourceItemId = id;
  renderSourceViewer();
}

function changeSourceZoom(delta) {
  sourceViewerZoom = Math.max(60, Math.min(180, sourceViewerZoom + Number(delta || 0)));
  renderSourceViewer();
}

function sourceMetaLine(item) {
  const bits = [];
  if (item.kind === "youtube") bits.push("YOUTUBE VIDEO");
  else if (item.kind === "presentation") bits.push("PRESENTATION");
  else if (item.kind) bits.push(item.kind.toUpperCase());
  if (item.size) bits.push(formatBytes(item.size));
  if (item.sourceIdentity && item.sourceIdentity.startsWith("youtube:")) bits.push("Transcript source");
  return bits.filter(Boolean).join(" · ");
}

async function readSourceText(item) {
  if (item?.content) return item.content;
  if (!item?.blob) return "";
  try {
    return await item.blob.text();
  } catch {
    return "";
  }
}

function canUseBackendSourcePreview(item) {
  return Boolean(item?.blob && ["pdf", "presentation", "document"].includes(item.kind));
}

function sourceSlidePageUrl(slide) {
  return slide?.screenshot || slide?.image_data_url || "";
}

function sourcePresentationFileUrl(item) {
  return item?.blob ? makeSourceObjectUrl(item) : (item?.url || item?.originalUrl || "");
}

function sourcePresentationRenderLabel(preview) {
  const mode = preview?.render_mode || "";
  if (mode === "libreoffice") return "Original slide-page render";
  if (mode === "local-powerpoint") return "PowerPoint slide-page render";
  if (mode === "local-keynote") return "Keynote slide-page render";
  if (mode === "server-svg" || mode === "svg") return "Browser slide-page preview";
  return "Slide-page preview";
}

async function fetchSourcePreview(item) {
  if (!item) throw new Error("No source selected.");
  if (item.preview) {
    const presentationPreviewHasSlidePages =
      item.preview.kind === "presentation" &&
      (item.preview.slides || []).some((slide) => sourceSlidePageUrl(slide));
    if (item.kind !== "presentation" || presentationPreviewHasSlidePages) {
      return item.preview;
    }
    if (!item.blob) {
      throw new Error("The saved presentation preview does not contain full slide pages, and the original file is not available in this browser session. Reopen or re-upload the source to rebuild the slide reader.");
    }
  }
  if (!item.blob) {
    throw new Error("The original uploaded file is not available in this browser session. Regenerate from the source file to restore the full preview.");
  }

  const formData = new FormData();
  formData.append("file", item.blob, item.name || item.displayName || "source");
  const response = await fetch(`${API_BASE}/source-preview`, {
    method: "POST",
    body: formData
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || "Source preview could not be generated.");
  }
  item.preview = data;
  item.previewError = "";
  return data;
}

function renderSourcePreviewLoading(item) {
  sourceViewerBody.innerHTML = `
    <div class="source-loading">
      <i class="bi ${sourceIcon(item.kind)}"></i>
      <h3>Preparing source preview...</h3>
      <p>Synapse is converting this file into a readable browser view.</p>
    </div>
  `;
}

function renderSourcePreviewError(item, error) {
  const fallbackText = item?.content || "";
  const allowTextFallback = item?.kind !== "presentation" && Boolean(fallbackText);
  const url = item?.blob ? makeSourceObjectUrl(item) : "";
  sourceViewerBody.innerHTML = `
    <div class="source-file-preview">
      <i class="bi ${sourceIcon(item?.kind)}"></i>
      <h3>${escapeHTML(item?.name || "Uploaded source")}</h3>
      <p>${escapeHTML(error?.message || item?.previewError || "This source could not be previewed.")}</p>
      ${allowTextFallback ? `<button class="source-inline-action" type="button" onclick="renderSourceTextFallback('${escapeAttr(item.id)}')">Show extracted text</button>` : ""}
      ${url ? `<a href="${escapeAttr(url)}" download="${escapeAttr(item?.name || "source")}">Download original source</a>` : ""}
    </div>
  `;
}

function renderSourceTextFallback(id) {
  const item = sourceViewerItems.find(entry => entry.id === id);
  if (!item) return;
  activeSourceItemId = item.id;
  sourceViewerBody.innerHTML = `
    <pre class="source-text-preview" style="font-size:${Math.max(0.78, sourceViewerZoom / 100)}rem">${escapeHTML(item.content || "No extracted source text is available.")}</pre>
  `;
}

function renderStructuredSourcePreview(preview, item) {
  if (!preview || preview.error) {
    renderSourcePreviewError(item, new Error(preview?.error || "Source preview could not be generated."));
    return;
  }

  if (preview.kind === "pdf") {
    const pages = Array.isArray(preview.pages) ? preview.pages : [];
    const scale = Math.max(70, Math.min(160, sourceViewerZoom));
    const url = item?.blob ? makeSourceObjectUrl(item) : (item?.url || item?.originalUrl || "");
    sourceViewerBody.innerHTML = `
      <div class="source-structured-preview source-pdf-clean-preview">
        ${renderSourceOpenActions(url, "Open full PDF", item.name || "source.pdf")}
        ${preview.warning ? `<div class="source-preview-notice"><i class="bi bi-info-circle"></i>${escapeHTML(preview.warning)}</div>` : ""}
        ${pages.length ? `
          <div class="source-pdf-pages" style="--source-pdf-page-width:${scale}%">
            ${pages.map(page => `
              <article class="source-pdf-page" aria-label="PDF page ${Number(page.number || 0) || ""}">
                <img src="${escapeAttr(page.image)}" alt="PDF page ${Number(page.number || 0) || ""}">
                <span class="source-pdf-page-number">Page ${Number(page.number || 0) || ""}${preview.page_count ? ` / ${Number(preview.page_count)}` : ""}</span>
              </article>
            `).join("")}
          </div>
        ` : `
          <div class="source-viewer-empty">
            <i class="bi bi-file-earmark-pdf"></i>
            <h3>No PDF pages could be rendered</h3>
            <p>Use the open or download action to view the original file.</p>
          </div>
        `}
      </div>
    `;
    return;
  }

  if (preview.kind === "presentation") {
    const slides = Array.isArray(preview.slides) ? preview.slides : [];
    const scale = Math.max(70, Math.min(160, sourceViewerZoom));
    const slidePages = slides.filter(slide => sourceSlidePageUrl(slide));
    const totalSlides = Number(preview.slide_count || slides.length || slidePages.length || 0);
    const shownSlides = Number(preview.shown_count || slidePages.length || slides.length || 0);
    const sourceUrl = sourcePresentationFileUrl(item);
    const downloadName = item?.name || `${preview.title || "presentation"}.pptx`;
    const renderLabel = sourcePresentationRenderLabel(preview);
    if (!slidePages.length) {
      sourceViewerBody.innerHTML = `
        <div class="source-structured-preview source-presentation-preview source-presentation-unavailable">
          <div class="source-viewer-empty">
            <i class="bi bi-file-earmark-slides"></i>
            <h3>Full slide preview is unavailable</h3>
            <p>Synapse could not render this presentation as complete slide pages. For a production deployment, install LibreOffice on the backend or ask users to upload/export the deck as PDF.</p>
            ${sourceUrl ? `<a class="source-inline-action" href="${escapeAttr(sourceUrl)}" download="${escapeAttr(downloadName)}">Download original presentation</a>` : ""}
            ${preview.warning ? `<p class="source-slide-muted">${escapeHTML(preview.warning)}</p>` : ""}
          </div>
        </div>
      `;
      return;
    }

    sourceViewerBody.innerHTML = `
      <div class="source-structured-preview source-presentation-preview has-slide-pages">
        <div class="source-slide-reader">
          <div class="source-slide-reader-bar">
            <div>
              <span class="source-slide-reader-kicker">Slide reader</span>
              <strong>${shownSlides}${totalSlides ? ` / ${totalSlides}` : ""} slides</strong>
              <small>${escapeHTML(renderLabel)}</small>
            </div>
            ${sourceUrl ? `<a class="source-open-action secondary" href="${escapeAttr(sourceUrl)}" download="${escapeAttr(downloadName)}"><i class="bi bi-download"></i>Download original</a>` : ""}
          </div>
          ${preview.warning ? `<div class="source-preview-notice source-preview-notice-compact"><i class="bi bi-info-circle"></i>${escapeHTML(preview.warning)}</div>` : ""}
          <div class="source-slide-pages" style="--source-slide-page-width:${scale}%">
            ${slidePages.map(slide => {
              const number = Number(slide.number || 0) || "";
              const label = number ? `Slide ${number}${totalSlides ? ` / ${totalSlides}` : ""}` : "Slide";
              return `
                <figure class="source-slide-page" aria-label="${escapeAttr(label)}">
                  <img loading="lazy" decoding="async" src="${escapeAttr(sourceSlidePageUrl(slide))}" alt="${escapeAttr(label)}">
                  <figcaption class="source-slide-page-number">${escapeHTML(label)}</figcaption>
                </figure>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
    return;
  }

  const text = preview.text || item.content || "";
  sourceViewerBody.innerHTML = `
    <div class="source-structured-preview">
      <article class="source-slide-card">
        <div class="source-slide-header">
          <span>${escapeHTML(preview.kind || item.kind || "source")}</span>
          <strong>${escapeHTML(preview.title || item.title || item.name || "Uploaded source")}</strong>
        </div>
        <div class="source-slide-text">${markdownToHTML(text || "No readable text preview is available.")}</div>
      </article>
    </div>
  `;
  renderMath();
}

function renderSourceOpenActions(url, label = "Open full source", downloadName = "") {
  if (!url) return "";
  const downloadAttr = downloadName ? ` download="${escapeAttr(downloadName)}"` : "";
  return `
    <div class="source-open-actions">
      <a class="source-open-action" href="${escapeAttr(url)}" target="_blank" rel="noopener">
        <i class="bi bi-box-arrow-up-right"></i>${escapeHTML(label)}
      </a>
      ${downloadName ? `
        <a class="source-open-action secondary" href="${escapeAttr(url)}"${downloadAttr}>
          <i class="bi bi-download"></i>Download
        </a>
      ` : ""}
    </div>
  `;
}

function renderYoutubeSourcePreview(item) {
  const watchUrl = youtubeWatchUrlFromItem(item);
  const embedUrl = youtubeEmbedUrlFromItem(item);
  const title = item.title || item.displayName || item.name || "YouTube source";
  const transcript = item.content || "";
  sourceViewerBody.innerHTML = `
    <div class="source-youtube-stage">
      ${embedUrl ? `
        <div class="source-youtube-embed">
          <iframe
            title="${escapeAttr(title)}"
            src="${escapeAttr(embedUrl)}"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
      ` : `
        <div class="source-link-preview source-link-preview-inline">
          <i class="bi bi-youtube"></i>
          <h3>YouTube source</h3>
          <p>${escapeHTML(watchUrl || "No playable YouTube URL was saved with this source.")}</p>
        </div>
      `}
      <div class="source-youtube-info">
        <div>
          <span class="source-youtube-kicker">Linked video source</span>
          <h3>${escapeHTML(title)}</h3>
          <p>${escapeHTML(watchUrl || "This video was expanded from a link inside the uploaded material.")}</p>
        </div>
        ${watchUrl ? `<a class="source-open-action" href="${escapeAttr(watchUrl)}" target="_blank" rel="noopener"><i class="bi bi-youtube"></i>Open on YouTube</a>` : ""}
      </div>
      ${transcript ? `
        <details class="source-transcript-panel">
          <summary>Transcript / extracted source text</summary>
          <pre>${escapeHTML(transcript)}</pre>
        </details>
      ` : `
        <div class="source-preview-notice"><i class="bi bi-info-circle"></i>No transcript was stored for this video. The player is still available for source review.</div>
      `}
    </div>
  `;
}

function renderSourceViewerBody(item) {
  if (!sourceViewerBody || !item) return;
  const meta = sourceMetaLine(item);
  if (sourceViewerTitle) sourceViewerTitle.textContent = item.title || item.name || "Uploaded source";
  if (sourceViewerMeta) sourceViewerMeta.textContent = meta || "Source preview";
  if (sourceZoomLabel) sourceZoomLabel.textContent = `${sourceViewerZoom}%`;

  if (item.kind === "image" && item.blob) {
    const url = makeSourceObjectUrl(item);
    sourceViewerBody.innerHTML = `
      <div class="source-image-stage">
        ${renderSourceOpenActions(url, "Open full image", item.name || "source")}
        <img src="${escapeAttr(url)}" alt="${escapeAttr(item.name)}" style="width:${sourceViewerZoom}%">
      </div>
    `;
    return;
  }

  if (canUseBackendSourcePreview(item)) {
    renderSourcePreviewLoading(item);
    const expectedItemId = item.id;
    fetchSourcePreview(item)
      .then(preview => {
        if (activeSourceItemId !== expectedItemId) return;
        renderStructuredSourcePreview(preview, item);
      })
      .catch(error => {
        item.previewError = error?.message || "Source preview failed.";
        if (activeSourceItemId !== expectedItemId) return;
        renderSourcePreviewError(item, error);
      });
    return;
  }

  if ((item.kind === "presentation" || item.kind === "document") && item.content && !item.blob) {
    sourceViewerBody.innerHTML = `
      <div class="source-structured-preview">
        <div class="source-preview-notice"><i class="bi bi-info-circle"></i>The original file was not restored, so Synapse is showing the extracted source text saved with this note.</div>
        <article class="source-slide-card">
          <div class="source-slide-header">
            <span>${escapeHTML(item.kind)}</span>
            <strong>${escapeHTML(item.title || item.name || "Uploaded source")}</strong>
          </div>
          <div class="source-slide-text">${markdownToHTML(item.content)}</div>
        </article>
      </div>
    `;
    renderMath();
    return;
  }

  if (item.kind === "text" || item.kind === "note") {
    sourceViewerBody.innerHTML = `<div class="source-text-stage"><div class="source-loading">Loading source text...</div></div>`;
    const expectedItemId = item.id;
    readSourceText(item).then(text => {
      if (activeSourceItemId !== expectedItemId) return;
      sourceViewerBody.innerHTML = `
        <pre class="source-text-preview" style="font-size:${Math.max(0.78, sourceViewerZoom / 100)}rem">${escapeHTML(text || "No readable text preview is available.")}</pre>
      `;
    });
    return;
  }

  if (item.kind === "youtube" || item.kind === "link") {
    if (item.kind === "youtube") {
      renderYoutubeSourcePreview(item);
      return;
    }
    const url = item.originalUrl || item.url || "";
    sourceViewerBody.innerHTML = `
      <div class="source-link-preview">
        <i class="bi ${sourceIcon(item.kind)}"></i>
        <h3>${escapeHTML(item.kind === "youtube" ? "YouTube source" : "Web source")}</h3>
        <p>${escapeHTML(url)}</p>
        ${url ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">Open source link</a>` : ""}
      </div>
    `;
    return;
  }

  const url = item.blob ? makeSourceObjectUrl(item) : "";
  sourceViewerBody.innerHTML = `
    <div class="source-file-preview">
      <i class="bi ${sourceIcon(item.kind)}"></i>
      <h3>${escapeHTML(item.name || "Uploaded source")}</h3>
      <p>${escapeHTML(meta || "Synapse analysed this file. Browser preview is not available for this file type.")}</p>
      ${url ? `<a href="${escapeAttr(url)}" download="${escapeAttr(item.name || "source")}">Download original source</a>` : ""}
    </div>
  `;
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
  await deleteSourceAssets(id, target?.sourceFingerprint || target?.clientFingerprint || "");
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
  const restoredSources = await loadSourceAssets(id, currentSourceFingerprint);
  restoreSourceViewerItems(restoredSources.length ? restoredSources : (item.sourceItems || item.sources || []));

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
  activeMindChildIndex = -1;
  mindDetailPopupOpen = false;
  collapsedMindBranches = new Set();
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
if (notesTranslateLanguage) {
  notesTranslateLanguage.addEventListener("change", event => translateCurrentNotes(event.target.value));
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
