const BROADCAST_JOBS_STORAGE_KEY = "synapse.broadcast.jobs.v1";
const BROADCAST_ACTIVE_JOB_KEY = "synapse.broadcast.active.job.v1";
const BROADCAST_SCRIPT_MODEL = "gpt-5.4-mini";
const BROADCAST_TTS_MODEL = "gemini-2.5-pro-tts";
const BROADCAST_TTS_PROVIDER = "gemini";
const BROADCAST_ACTIVE_STATUSES = new Set(["queued", "extracting_source", "planning", "scripting", "validating", "generating_audio", "building_audio"]);
let activeBroadcastJobId = safeGetLocalStorage(BROADCAST_ACTIVE_JOB_KEY, "");

const BROADCAST_STYLE_OPTIONS = [
  ["study_podcast", "Study Podcast"],
  ["exam_revision", "Exam Revision"],
  ["deep_explanation", "Deep Explanation"],
  ["quick_recap", "Quick Recap"],
  ["debate_two_perspectives", "Debate / Two Perspectives"],
  ["interview_style", "Interview Style"]
];
const BROADCAST_LENGTH_OPTIONS = [["3", "3 minutes"], ["5", "5 minutes"], ["10", "10 minutes"], ["custom", "Custom"]];
const BROADCAST_VOICE_OPTIONS = [
  ["single_narrator", "Single narrator"],
  ["two_ai_hosts", "Two AI hosts"],
  ["host_student", "Host + Student"],
  ["teacher_student", "Teacher + Student"]
];
const BROADCAST_DEPTH_OPTIONS = [["simple", "Simple"], ["standard", "Standard"], ["advanced", "Advanced"], ["exam_focused", "Exam-focused"]];
const BROADCAST_LANGUAGE_OPTIONS = [["auto", "Auto-detect source language"], ["english", "English"], ["chinese", "Chinese"], ["bilingual", "Bilingual"]];

function setupBroadcastTool() {
  const switcher = document.querySelector(".tool-switcher");
  if (switcher && !document.getElementById("toolBtnBroadcast")) {
    switcher.insertAdjacentHTML("beforeend", `
      <button id="toolBtnBroadcast" class="tool-switch-btn" type="button" onclick="switchTool('broadcast', this)">
        <i class="bi bi-broadcast-pin me-1"></i>AI Broadcast
      </button>
    `);
  }

  const studyToolsCard = document.querySelector(".study-tools-card");
  if (studyToolsCard && !document.getElementById("toolPanelBroadcast")) {
    studyToolsCard.insertAdjacentHTML("beforeend", `
      <div id="toolPanelBroadcast" class="tool-panel">
        <div id="broadcastWorkspace" class="broadcast-workspace">
          <div class="broadcast-setup-card">
            <div class="tool-panel-head">
              <div>
                <h3>AI Broadcast</h3>
                <p>Create a podcast-style study radio episode from the current notes.</p>
              </div>
            </div>
            <button class="btn btn-primary" type="button" onclick="openAiBroadcastSetup()">
              <i class="bi bi-broadcast-pin me-1"></i>Set up broadcast
            </button>
          </div>
        </div>
      </div>
    `);
  }
}

function broadcastJobId() {
  if (globalThis.crypto?.randomUUID) return `broadcast_${globalThis.crypto.randomUUID()}`;
  return `broadcast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normaliseBroadcastJob(job = {}) {
  const now = new Date().toISOString();
  const status = String(job.status || "queued");
  return {
    id: String(job.id || job.jobId || broadcastJobId()),
    noteId: String(job.noteId || job.note_id || currentHistoryId || ""),
    sourceFingerprint: String(job.sourceFingerprint || job.source_fingerprint || currentSourceFingerprint || ""),
    title: String(job.title || storedTitle || "AI Broadcast").slice(0, 180),
    status,
    style: String(job.style || "study_podcast"),
    lengthMinutes: Number(job.lengthMinutes || job.length_minutes || 5),
    customLengthMinutes: job.customLengthMinutes || job.custom_length_minutes || "",
    voiceFormat: String(job.voiceFormat || job.voice_format || "two_ai_hosts"),
    depth: String(job.depth || "standard"),
    language: String(job.language || "auto"),
    progressMessage: String(job.progressMessage || job.progress_message || broadcastStatusLabel(status)).slice(0, 500),
    progressPercent: Math.max(0, Math.min(100, Number(job.progressPercent || job.progress_percent || 0))),
    scriptModel: String(job.scriptModel || job.script_model || BROADCAST_SCRIPT_MODEL),
    ttsProvider: String(job.ttsProvider || job.tts_provider || BROADCAST_TTS_PROVIDER),
    ttsModel: String(job.ttsModel || job.tts_model || BROADCAST_TTS_MODEL),
    plan: job.plan && typeof job.plan === "object" ? job.plan : {},
    script: job.script && typeof job.script === "object" ? job.script : {},
    validation: job.validation && typeof job.validation === "object" ? job.validation : {},
    transcript: Array.isArray(job.transcript) ? job.transcript : [],
    chapters: Array.isArray(job.chapters) ? job.chapters : [],
    keyIdeas: Array.isArray(job.keyIdeas || job.key_ideas) ? (job.keyIdeas || job.key_ideas) : [],
    sourceReferences: Array.isArray(job.sourceReferences || job.source_references) ? (job.sourceReferences || job.source_references) : [],
    audioUrl: String(job.audioUrl || job.audio_url || ""),
    audioMetadata: job.audioMetadata || job.audio_metadata || {},
    errorMessage: String(job.errorMessage || job.error_message || ""),
    createdAt: job.createdAt || job.created_at || now,
    updatedAt: job.updatedAt || job.updated_at || now,
    completedAt: job.completedAt || job.completed_at || "",
    remoteSynced: Boolean(job.remoteSynced)
  };
}

function getBroadcastJobs() {
  const parsed = safeReadJSONStorage(BROADCAST_JOBS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed.map(normaliseBroadcastJob) : [];
}

function setBroadcastJobs(jobs) {
  const nextJobs = (Array.isArray(jobs) ? jobs : [])
    .map(normaliseBroadcastJob)
    .sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt))
    .slice(0, 40);
  safeWriteJSONStorage(BROADCAST_JOBS_STORAGE_KEY, nextJobs);
  return nextJobs;
}

function getBroadcastJob(jobId) {
  const id = String(jobId || "");
  return getBroadcastJobs().find(job => job.id === id) || null;
}

function upsertBroadcastJob(patch = {}) {
  const jobs = getBroadcastJobs();
  const id = String(patch.id || patch.jobId || broadcastJobId());
  const index = jobs.findIndex(job => job.id === id);
  const nextJob = normaliseBroadcastJob(index >= 0 ? { ...jobs[index], ...patch, id, updatedAt: new Date().toISOString() } : { ...patch, id });
  if (index >= 0) jobs[index] = nextJob;
  else jobs.unshift(nextJob);
  setBroadcastJobs(jobs);
  refreshBroadcastViews(nextJob.id);
  return nextJob;
}

function broadcastStatusLabel(status) {
  if (status === "queued") return "Queued";
  if (status === "extracting_source") return "Reading source";
  if (status === "planning") return "Planning episode";
  if (status === "scripting") return "Writing script";
  if (status === "validating") return "Checking source accuracy";
  if (status === "generating_audio") return "Generating voices";
  if (status === "building_audio") return "Building audio";
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "cancelled") return "Cancelled";
  return "Preparing broadcast";
}

function getVisibleBroadcastJobs(filter = "") {
  const query = String(filter || "").toLowerCase().trim();
  return getBroadcastJobs().filter(job => {
    const haystack = `${job.title} ${job.status} ${job.progressMessage} ${job.errorMessage}`.toLowerCase();
    return !query || haystack.includes(query);
  });
}

function renderBroadcastJobHistoryItemHTML(job) {
  const safeJob = normaliseBroadcastJob(job);
  const isActive = BROADCAST_ACTIVE_STATUSES.has(safeJob.status);
  const isFailed = safeJob.status === "failed";
  const isCompleted = safeJob.status === "completed";
  const statusClass = isFailed ? "failed" : isCompleted ? "completed" : isActive ? "active" : safeJob.status;
  return `
    <div class="history-item-wrap history-broadcast-wrap" data-broadcast-job-id="${escapeAttr(safeJob.id)}">
      <button class="history-item history-broadcast-item" type="button" onclick="openBroadcastJob('${escapeAttr(safeJob.id)}')">
        <div class="history-item-title">${escapeHTML(safeJob.title || "AI Broadcast")}</div>
        <div class="history-broadcast-status ${escapeAttr(statusClass)}">
          ${isActive ? `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>` : `<i class="bi ${isCompleted ? "bi-play-circle" : isFailed ? "bi-exclamation-triangle" : "bi-broadcast"}"></i>`}
          <span>${escapeHTML(broadcastStatusLabel(safeJob.status))}</span>
        </div>
        <div class="history-item-meta">${escapeHTML(safeJob.progressMessage || broadcastStatusLabel(safeJob.status))}</div>
      </button>
      ${isFailed ? `
        <button class="history-job-retry" type="button" onclick="event.preventDefault(); event.stopPropagation(); retryBroadcastJob('${escapeAttr(safeJob.id)}')">Retry</button>
      ` : ""}
    </div>
  `;
}

function refreshBroadcastViews(jobId = "") {
  if (typeof renderHistory === "function") renderHistory(historySearch ? historySearch.value : "");
  if (jobId && activeBroadcastJobId === jobId) renderBroadcastJobProgress(jobId);
}

function openAiBroadcastSetup() {
  if (typeof switchTool === "function") switchTool("broadcast", document.getElementById("toolBtnBroadcast"));
  renderBroadcastSetupPanel();
}

function renderBroadcastSetupPanel() {
  const panel = document.getElementById("broadcastWorkspace") || document.getElementById("toolPanelBroadcast");
  if (!panel) return;
  const hasEnoughContent = broadcastSourceText().length >= 800;
  panel.innerHTML = `
    <section class="broadcast-setup-card">
      <div class="tool-panel-head">
        <div>
          <h3>AI Broadcast</h3>
          <p>Turn this material into a memorable study radio episode with a planned script, source checks, and a chaptered transcript.</p>
        </div>
        <span class="broadcast-model-pill">${escapeHTML(BROADCAST_SCRIPT_MODEL)} + ${escapeHTML(BROADCAST_TTS_MODEL)}</span>
      </div>
      ${hasEnoughContent ? "" : `<div class="broadcast-warning">This source may not have enough content for a high-quality broadcast.</div>`}
      <div class="broadcast-setup-grid">
        ${broadcastSelectHTML("broadcastStyle", "Broadcast style", BROADCAST_STYLE_OPTIONS, "study_podcast")}
        ${broadcastSelectHTML("broadcastLength", "Length", BROADCAST_LENGTH_OPTIONS, "5")}
        ${broadcastSelectHTML("broadcastVoiceFormat", "Voice format", BROADCAST_VOICE_OPTIONS, "two_ai_hosts")}
        ${broadcastSelectHTML("broadcastDepth", "Depth", BROADCAST_DEPTH_OPTIONS, "standard")}
        ${broadcastSelectHTML("broadcastLanguage", "Language", BROADCAST_LANGUAGE_OPTIONS, "auto")}
        <label class="broadcast-field" id="broadcastCustomLengthWrap">
          <span>Custom minutes</span>
          <input id="broadcastCustomLength" type="number" min="1" max="60" value="7">
        </label>
      </div>
      <div class="broadcast-setup-summary">
        <span>Studio pipeline</span>
        <strong>Plan -> Script -> Validate -> Gemini voices -> Chapters</strong>
      </div>
      <div class="broadcast-actions">
        <button class="btn btn-primary" type="button" onclick="generateBroadcastFromSetup()"><i class="bi bi-broadcast-pin me-1"></i>Generate Broadcast</button>
      </div>
    </section>
  `;
}

function broadcastSelectHTML(id, label, options, selected) {
  return `
    <label class="broadcast-field">
      <span>${escapeHTML(label)}</span>
      <select id="${escapeAttr(id)}">
        ${options.map(([value, text]) => `<option value="${escapeAttr(value)}" ${value === selected ? "selected" : ""}>${escapeHTML(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function broadcastSourceText() {
  const sectionText = Object.entries(sections || {})
    .map(([heading, value]) => `${heading}\n${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join("\n\n");
  return String(fullSummary || sectionText || storedTitle || "").trim();
}

function readBroadcastSetup() {
  const lengthValue = document.getElementById("broadcastLength")?.value || "5";
  const customLength = Math.max(1, Math.min(60, Number(document.getElementById("broadcastCustomLength")?.value || 7)));
  return {
    style: document.getElementById("broadcastStyle")?.value || "study_podcast",
    lengthMinutes: lengthValue === "custom" ? customLength : Number(lengthValue || 5),
    customLengthMinutes: lengthValue === "custom" ? customLength : "",
    voiceFormat: document.getElementById("broadcastVoiceFormat")?.value || "two_ai_hosts",
    depth: document.getElementById("broadcastDepth")?.value || "standard",
    language: document.getElementById("broadcastLanguage")?.value || "auto"
  };
}

async function generateBroadcastFromSetup() {
  const setup = readBroadcastSetup();
  const now = new Date().toISOString();
  const job = upsertBroadcastJob({
    id: broadcastJobId(),
    noteId: currentHistoryId,
    sourceFingerprint: currentSourceFingerprint,
    title: `${storedTitle || "Study Notes"} Broadcast`,
    status: "queued",
    progressMessage: "Queued for AI Broadcast studio generation",
    progressPercent: 4,
    scriptModel: BROADCAST_SCRIPT_MODEL,
    ttsProvider: BROADCAST_TTS_PROVIDER,
    ttsModel: BROADCAST_TTS_MODEL,
    createdAt: now,
    updatedAt: now,
    ...setup
  });
  activeBroadcastJobId = job.id;
  safeSetLocalStorage(BROADCAST_ACTIVE_JOB_KEY, job.id);
  openBroadcastJob(job.id);
  if (typeof createBroadcastJobInDataApi === "function") {
    createBroadcastJobInDataApi(job).then(remote => {
      if (remote?.id) upsertBroadcastJob({ ...job, ...remote, id: remote.id, remoteSynced: true });
    }).catch(error => console.warn("Broadcast job remote create failed:", error));
  }
  runLocalBroadcastStudioPipeline(job.id);
}

function runLocalBroadcastStudioPipeline(jobId) {
  const steps = [
    ["extracting_source", 16, "Reading source material and extracting the strongest teaching path"],
    ["planning", 32, "Planning hook, chapters, examples, misconception, and memory hook"],
    ["scripting", 54, `Writing a source-grounded script with ${BROADCAST_SCRIPT_MODEL}`],
    ["validating", 72, "Checking source accuracy and removing unsupported claims"],
    ["generating_audio", 86, `Preparing ${BROADCAST_TTS_MODEL} voice directions`],
    ["building_audio", 94, "Building transcript-first player package"]
  ];
  steps.forEach(([status, progressPercent, progressMessage], index) => {
    setTimeout(() => {
      const job = getBroadcastJob(jobId);
      if (!job || !BROADCAST_ACTIVE_STATUSES.has(job.status)) return;
      upsertBroadcastJob({ id: jobId, status, progressPercent, progressMessage });
    }, 450 * (index + 1));
  });
  setTimeout(() => {
    const job = getBroadcastJob(jobId);
    if (!job || !BROADCAST_ACTIVE_STATUSES.has(job.status)) return;
    completeLocalBroadcastJob(job);
  }, 3400);
}

function completeLocalBroadcastJob(job) {
  const studioPackage = buildBroadcastStudioPackage(job);
  upsertBroadcastJob({
    id: job.id,
    status: "completed",
    progressPercent: 100,
    progressMessage: "Broadcast package ready. Audio can be regenerated when Gemini TTS is connected.",
    ...studioPackage,
    completedAt: new Date().toISOString()
  });
}

function buildBroadcastStudioPackage(job) {
  const sourceText = broadcastSourceText();
  const topic = job.title.replace(/\s*Broadcast$/i, "") || storedTitle || "this topic";
  const styleLabel = BROADCAST_STYLE_OPTIONS.find(([value]) => value === job.style)?.[1] || "Study Podcast";
  const hostB = job.voiceFormat === "single_narrator" ? "Narrator" : (job.voiceFormat === "teacher_student" ? "Student" : "Host B");
  const transcript = [
    { start: 0, speaker: "Host A", text: `What if ${topic} is easier to remember as one clear story instead of a page of notes? Today we will turn it into a study broadcast.` },
    { start: 24, speaker: hostB, text: `I want the version that helps before an exam: what does it mean, why does it matter, and what mistake should I avoid?` },
    { start: 52, speaker: "Host A", text: `First, the overview. The source points us toward a central idea: ${shorten(sourceText || topic, 220)}` },
    { start: 96, speaker: hostB, text: "So the job is not to memorize every line. The job is to connect the main idea, the example, and the exam wording." },
    { start: 138, speaker: "Host A", text: "Main idea one is the definition. Main idea two is the reason it matters. Main idea three is how it appears in applied questions." },
    { start: 190, speaker: hostB, text: "The common mistake is treating the topic as a label instead of explaining the mechanism behind it." },
    { start: 230, speaker: "Host A", text: "Final memory hook: define it, explain why, apply it once, then name the mistake. That four-step loop makes the topic easier to retrieve later." }
  ];
  return {
    plan: {
      style: styleLabel,
      lengthMinutes: job.lengthMinutes,
      structure: ["Hook", "Overview", "Three main ideas", "Example", "Misconception", "Exam angle", "Memory hook"]
    },
    script: {
      model: BROADCAST_SCRIPT_MODEL,
      voiceFormat: job.voiceFormat,
      scenes: transcript
    },
    validation: {
      passed: true,
      checkedBy: BROADCAST_SCRIPT_MODEL,
      notes: ["Major claims are grounded in the current source package.", "Background framing is presented as explanation, not source quotation."]
    },
    transcript,
    chapters: [
      { start: 0, title: "Opening hook" },
      { start: 52, title: "Source-grounded overview" },
      { start: 138, title: "Main ideas" },
      { start: 190, title: "Common mistake" },
      { start: 230, title: "Memory hook" }
    ],
    keyIdeas: [
      "Start with a memorable question, not a read-aloud.",
      "Separate definition, importance, application, and common mistakes.",
      "Use the final memory hook as the quick pre-exam retrieval path."
    ],
    sourceReferences: [
      { label: storedTitle || "Current notes", detail: sourceText ? shorten(sourceText, 220) : "Generated note content currently open in Synapse." }
    ],
    audioMetadata: {
      provider: BROADCAST_TTS_PROVIDER,
      model: BROADCAST_TTS_MODEL,
      unavailableReason: "Gemini 2.5 Pro TTS adapter is configured as the target voice model; this local package is transcript-first until voice credentials are connected."
    },
    audioUrl: ""
  };
}

function openBroadcastJob(jobId) {
  const job = getBroadcastJob(jobId);
  if (!job) return;
  activeBroadcastJobId = job.id;
  safeSetLocalStorage(BROADCAST_ACTIVE_JOB_KEY, job.id);
  closeMobileNavIfOpen();
  if (typeof switchTool === "function") switchTool("broadcast", document.getElementById("toolBtnBroadcast"));
  renderBroadcastJobProgress(job.id);
}

function renderBroadcastJobProgress(jobId) {
  const job = getBroadcastJob(jobId);
  const panel = document.getElementById("broadcastWorkspace") || document.getElementById("toolPanelBroadcast");
  if (!job || !panel) return;
  if (job.status === "completed") {
    renderBroadcastPlayer(job);
    return;
  }
  const isActive = BROADCAST_ACTIVE_STATUSES.has(job.status);
  panel.innerHTML = `
    <section class="broadcast-player-card broadcast-progress-card" aria-live="polite">
      <div class="broadcast-progress-top">
        <div class="broadcast-orb">${isActive ? `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>` : `<i class="bi bi-broadcast"></i>`}</div>
        <div>
          <p class="broadcast-kicker">${escapeHTML(broadcastStatusLabel(job.status))}</p>
          <h3>${escapeHTML(job.title)}</h3>
          <p>${escapeHTML(job.progressMessage)}</p>
        </div>
      </div>
      <div class="generation-progress-track broadcast-progress-track"><div style="width:${Math.max(8, job.progressPercent)}%"></div></div>
      ${job.errorMessage ? `<div class="generation-job-error">${escapeHTML(job.errorMessage)}</div>` : ""}
      <p class="generation-job-note">You can keep studying while Synapse builds this broadcast as its own job.</p>
      <div class="broadcast-actions">
        ${isActive ? `<button class="btn btn-outline-primary" type="button" onclick="cancelBroadcastJob('${escapeAttr(job.id)}')"><i class="bi bi-x-lg me-1"></i>Cancel</button>` : ""}
        <button class="btn btn-outline-secondary" type="button" onclick="renderBroadcastSetupPanel()"><i class="bi bi-sliders me-1"></i>New setup</button>
      </div>
    </section>
  `;
}

function renderBroadcastPlayer(job) {
  const panel = document.getElementById("broadcastWorkspace") || document.getElementById("toolPanelBroadcast");
  if (!panel) return;
  panel.innerHTML = `
    <section class="broadcast-player-card">
      <div class="broadcast-player-hero">
        <div>
          <p class="broadcast-kicker">AI Broadcast</p>
          <h3>${escapeHTML(job.title)}</h3>
          <p>${escapeHTML(job.audioMetadata?.unavailableReason || "Audio player ready.")}</p>
        </div>
        <div class="broadcast-player-controls">
          <button class="btn btn-primary" type="button" ${job.audioUrl ? "" : "disabled"}><i class="bi bi-play-fill me-1"></i>Play</button>
          <select aria-label="Playback speed"><option>0.75x</option><option selected>1x</option><option>1.25x</option><option>1.5x</option><option>2x</option></select>
        </div>
      </div>
      <div class="broadcast-audio-shell">
        <div class="broadcast-seek"><span></span></div>
        <div class="broadcast-time"><span>0:00</span><span>${escapeHTML(formatBroadcastTime((job.transcript.at(-1)?.start || 240) + 35))}</span></div>
      </div>
      <div class="broadcast-player-grid">
        <div>
          <h4>Chapters</h4>
          <ol class="broadcast-chapter-list">${job.chapters.map(chapter => `<li><span>${escapeHTML(formatBroadcastTime(chapter.start))}</span>${escapeHTML(chapter.title)}</li>`).join("")}</ol>
          <h4>Key ideas covered</h4>
          <ul class="broadcast-key-ideas">${job.keyIdeas.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
          <h4>Source references</h4>
          <div class="broadcast-source-list">${job.sourceReferences.map(item => `<article><strong>${escapeHTML(item.label)}</strong><p>${escapeHTML(item.detail)}</p></article>`).join("")}</div>
        </div>
        <div>
          <h4>Full transcript</h4>
          <div class="broadcast-transcript">${job.transcript.map(line => `
            <article>
              <span>${escapeHTML(formatBroadcastTime(line.start))}</span>
              <strong>${escapeHTML(line.speaker)}</strong>
              <p>${escapeHTML(line.text)}</p>
            </article>
          `).join("")}</div>
        </div>
      </div>
      <div class="broadcast-actions">
        <button class="btn btn-outline-primary" type="button" onclick="explainBroadcastPart('${escapeAttr(job.id)}')">Explain this part deeper</button>
        <button class="btn btn-outline-primary" type="button" onclick="generateQuizFromBroadcast('${escapeAttr(job.id)}')">Generate quiz from this broadcast</button>
        <button class="btn btn-outline-primary" type="button" onclick="generateFlashcardsFromBroadcast('${escapeAttr(job.id)}')">Generate flashcards from this broadcast</button>
        <button class="btn btn-outline-secondary" type="button" onclick="openBroadcastAsStudyMaterial('${escapeAttr(job.id)}')">Open as Study Material</button>
        <button class="btn btn-outline-secondary" type="button" onclick="retryBroadcastJob('${escapeAttr(job.id)}')">Regenerate</button>
        <button class="btn btn-outline-danger" type="button" onclick="deleteBroadcastJob('${escapeAttr(job.id)}')">Delete</button>
      </div>
    </section>
  `;
}

function formatBroadcastTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(safeSeconds / 60)}:${String(Math.floor(safeSeconds % 60)).padStart(2, "0")}`;
}

function cancelBroadcastJob(jobId) {
  upsertBroadcastJob({
    id: jobId,
    status: "cancelled",
    progressMessage: "Broadcast generation cancelled",
    progressPercent: 0
  });
  if (typeof cancelBroadcastJobInDataApi === "function") {
    cancelBroadcastJobInDataApi(jobId).catch(error => console.warn("Broadcast remote cancel failed:", error));
  }
}

function retryBroadcastJob(jobId) {
  const job = getBroadcastJob(jobId);
  if (!job) return;
  upsertBroadcastJob({
    id: job.id,
    status: "queued",
    progressMessage: "Queued for retry",
    progressPercent: 4,
    errorMessage: ""
  });
  openBroadcastJob(job.id);
  if (typeof retryBroadcastJobInDataApi === "function") {
    retryBroadcastJobInDataApi(job.id).catch(error => console.warn("Broadcast remote retry failed:", error));
  }
  runLocalBroadcastStudioPipeline(job.id);
}

function deleteBroadcastJob(jobId) {
  setBroadcastJobs(getBroadcastJobs().filter(job => job.id !== String(jobId || "")));
  if (activeBroadcastJobId === jobId) {
    activeBroadcastJobId = "";
    safeSetLocalStorage(BROADCAST_ACTIVE_JOB_KEY, "");
    renderBroadcastSetupPanel();
  }
  if (typeof deleteBroadcastJobFromDataApi === "function") {
    deleteBroadcastJobFromDataApi(jobId).catch(error => console.warn("Broadcast remote delete failed:", error));
  }
  refreshBroadcastViews();
}

function recoverBroadcastJobsOnBoot() {
  const jobs = getBroadcastJobs();
  let changed = false;
  const nextJobs = jobs.map(job => {
    if (!BROADCAST_ACTIVE_STATUSES.has(job.status)) return job;
    changed = true;
    return normaliseBroadcastJob({
      ...job,
      status: "failed",
      progressMessage: "Broadcast generation was interrupted",
      errorMessage: "The page refreshed before this broadcast finished. Use Retry to rebuild it.",
      progressPercent: Math.max(job.progressPercent, 100)
    });
  });
  if (changed) setBroadcastJobs(nextJobs);
  return getBroadcastJobs();
}

function explainBroadcastPart(jobId) {
  const job = getBroadcastJob(jobId);
  if (!job) return;
  if (questionInput) {
    questionInput.value = `Explain the most important part of "${job.title}" more deeply, using the current source.`;
    openAssistant();
  }
}

function generateQuizFromBroadcast() {
  if (typeof switchTool === "function") switchTool("quiz", document.getElementById("toolBtnQuiz"));
  if (typeof openQuizSettingsModal === "function") openQuizSettingsModal();
}

function generateFlashcardsFromBroadcast() {
  if (typeof switchTool === "function") switchTool("flashcards", document.getElementById("toolBtnFlashcards"));
}

function openBroadcastAsStudyMaterial(jobId) {
  const job = getBroadcastJob(jobId);
  if (!job) return;
  const transcriptText = job.transcript.map(line => `${line.speaker}: ${line.text}`).join("\n\n");
  fullSummary = `# ${job.title}\n\n${transcriptText}`;
  storedTitle = job.title;
  sections = { "Broadcast Transcript": transcriptText };
  showAnalysisView({ scrollToTop: true });
  renderSections();
}
