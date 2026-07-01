const SOURCE_BADGE_BY_SECTION = [
  [/^Learning Question$/i, ["Inferred from source", "Must know"]],
  [/^Key Takeaways$/i, ["Direct from source", "Must know"]],
  [/^Core Concept Map$/i, ["Inferred from source"]],
  [/^Main Notes by Lecture Section$/i, ["Direct from source"]],
  [/^Key Terms Table$/i, ["Direct from source"]],
  [/^Case Study\s*\/\s*Example Breakdown$/i, ["Direct from source", "Good evidence"]],
  [/^Evidence Bank$/i, ["Direct from source", "Good evidence"]],
  [/^Exam Answer Templates$/i, ["Tutor explanation", "Exam use"]],
  [/^Common Mistakes$/i, ["Tutor explanation", "Exam use"]],
  [/^Revision Checklist$/i, ["Tutor explanation", "Must know"]],
  [/^Flashcard-ready Summary$/i, ["Tutor explanation", "Must know"]],
];

const PROFESSIONAL_BADGE_BY_SECTION = [
  [/^(?:\d+\.\s*)?Big Picture\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?The Exam Will Probably Test These Ideas\b/i, ["Exam use"]],
  [/^(?:\d+\.\s*)?What You Actually Need To Understand\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?Deep Explanation\b/i, ["Professional explanation", "Limitation"]],
  [/^(?:\d+\.\s*)?Concept Connections\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?Background Knowledge(?: Layer| Needed To Understand This Properly)?\b/i, ["Background knowledge"]],
  [/^(?:\d+\.\s*)?(?:Application To New Situations|How To Apply This To New Questions)\b/i, ["Application"]],
  [/^(?:\d+\.\s*)?Common Mistakes(?: That Lose Marks)?\b/i, ["Application", "Limitation"]],
  [/^(?:\d+\.\s*)?High-Quality Student Thinking\b/i, ["Professional explanation"]],
  [/^(?:\d+\.\s*)?How To Use This In Assessment\b/i, ["Application"]],
  [/^(?:\d+\.\s*)?Model High-Quality (?:Output|Answers)\b/i, ["Application"]],
  [/^(?:\d+\.\s*)?Exam Question Bank\b/i, ["Exam use"]],
  [/^(?:\d+\.\s*)?Memory and Practice\b/i, ["Application"]],
];

const BADGE_CLASS_BY_LABEL = new Map([
  ["Direct from source", "source"],
  ["Inferred from source", "inferred"],
  ["Tutor explanation", "tutor"],
  ["Not enough evidence", "needs-evidence"],
  ["Not enough evidence from source", "needs-evidence"],
  ["Source anchor", "source-based"],
  ["Source-based", "source-based"],
  ["Professional explanation", "professional-explanation"],
  ["Background knowledge", "background-knowledge"],
  ["Application", "application"],
  ["Academic interpretation", "academic-interpretation"],
  ["Limitation", "limitation"],
  ["Essay use", "essay-use"],
  ["External context", "external-context"],
  ["Must know", "must-know"],
  ["Good evidence", "good-evidence"],
  ["Exam use", "exam-use"],
]);

const BADGE_LABEL_PATTERN = Array.from(BADGE_CLASS_BY_LABEL.keys())
  .sort((a, b) => b.length - a.length)
  .map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const INLINE_BADGE_PATTERN = new RegExp(`\\[(${BADGE_LABEL_PATTERN})\\]`, "g");
const INLINE_BADGE_PRESENCE_PATTERN = new RegExp(`\\[(${BADGE_LABEL_PATTERN})\\]`);

function escapeAttrValue(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]+>/g, " ");
}

function decodeBasicEntities(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function cleanSectionTitleText(value) {
  return decodeBasicEntities(stripTags(value)).replace(/\s+/g, " ").trim();
}

function chipHtml(label) {
  const variant = BADGE_CLASS_BY_LABEL.get(label) || "plain";
  return `<span class="notes-section-chip ${variant}">${label}</span>`;
}

function inferSectionChips(title) {
  const clean = cleanSectionTitleText(title);
  for (const [pattern, chips] of SOURCE_BADGE_BY_SECTION) {
    if (pattern.test(clean)) return chips;
  }
  return [];
}

function inferProfessionalSectionChips(title) {
  const clean = cleanSectionTitleText(title);
  for (const [pattern, chips] of PROFESSIONAL_BADGE_BY_SECTION) {
    if (pattern.test(clean)) return chips;
  }
  return [];
}

function decorateStandaloneBadges(html) {
  let output = String(html || "");
  output = output.replace(
    new RegExp(`<p>\\s*\\[(${BADGE_LABEL_PATTERN})\\]\\s*<\\/p>`, "g"),
    (_, label) => `<div class="notes-inline-badges">${chipHtml(label)}</div>`
  );
  output = output.replace(
    new RegExp(`<li>\\s*\\[(${BADGE_LABEL_PATTERN})\\]\\s*<\\/li>`, "g"),
    (_, label) => `<li><span class="notes-inline-badges">${chipHtml(label)}</span></li>`
  );
  output = output.replace(
    /<p>([\s\S]*?)<\/p>/g,
    (match, inner) => INLINE_BADGE_PRESENCE_PATTERN.test(inner)
      ? `<p>${inner.replace(INLINE_BADGE_PATTERN, (_, label) => chipHtml(label))}</p>`
      : match
  );
  output = output.replace(
    /<li>([\s\S]*?)<\/li>/g,
    (match, inner) => INLINE_BADGE_PRESENCE_PATTERN.test(inner)
      ? `<li>${inner.replace(INLINE_BADGE_PATTERN, (_, label) => chipHtml(label))}</li>`
      : match
  );
  return output;
}

function stripDuplicateSectionBodyBadges(html, sectionChips) {
  const duplicateLabels = (sectionChips || [])
    .filter(label => BADGE_CLASS_BY_LABEL.has(label))
    .map(label => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!duplicateLabels.length) return html;
  const duplicatePattern = duplicateLabels.join("|");
  let output = String(html || "");
  output = output.replace(
    new RegExp(`(<p>\\s*)\\[(${duplicatePattern})\\]\\s*`, "gi"),
    "$1"
  );
  output = output.replace(
    new RegExp(`(<li>\\s*)\\[(${duplicatePattern})\\]\\s*`, "gi"),
    "$1"
  );
  return output;
}

function splitHtmlSections(html) {
  const source = String(html || "");
  const headingPattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const sections = [];
  let preludeHtml = "";
  let lastBodyStart = 0;
  let match = null;

  while ((match = headingPattern.exec(source))) {
    if (!sections.length) {
      preludeHtml = source.slice(0, match.index);
    } else {
      sections[sections.length - 1].bodyHtml = source.slice(lastBodyStart, match.index);
    }
    sections.push({
      headingHtml: match[0],
      headingInnerHtml: match[1],
      bodyHtml: "",
    });
    lastBodyStart = headingPattern.lastIndex;
  }

  if (sections.length) {
    sections[sections.length - 1].bodyHtml = source.slice(lastBodyStart);
  }

  return {
    preludeHtml,
    sections,
  };
}

function renderNotesSection(section, index, collapseSecondary) {
  const titleText = cleanSectionTitleText(section.headingInnerHtml);
  const chips = inferSectionChips(titleText);
  const open = !collapseSecondary || index === 0 ? " open" : "";
  const chipRow = chips.length
    ? `<div class="notes-section-chip-row">${chips.map(chipHtml).join("")}</div>`
    : "";
  const bodyHtml = decorateStandaloneBadges(section.bodyHtml || "");
  return `
    <details class="notes-section"${open} data-section-title="${escapeAttrValue(titleText)}">
      <summary class="notes-section-summary">
        <div class="notes-section-heading-wrap">
          <span class="notes-section-heading">${section.headingInnerHtml}</span>
          ${chipRow}
        </div>
        <span class="notes-section-chevron" aria-hidden="true"></span>
      </summary>
      <div class="notes-section-body">
        ${bodyHtml}
      </div>
    </details>
  `.trim();
}

function isProfessionalMode(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[-\s/]+/g, "_");
  return key === "professor_mode"
    || key === "professional"
    || key === "professional_mode"
    || key === "academic"
    || key === "academic_analysis"
    || key === "academic_analysis_mode";
}

function professionalSectionKind(title) {
  const clean = cleanSectionTitleText(title);
  if (/^(?:\d+\.\s*)?Big Picture\b/i.test(clean)) return "big-picture";
  if (/^(?:\d+\.\s*)?The Exam Will Probably Test These Ideas\b/i.test(clean)) return "exam-focus";
  if (/^(?:\d+\.\s*)?What You Actually Need To Understand\b/i.test(clean)) return "core-understanding";
  if (/^(?:\d+\.\s*)?Deep Explanation\b/i.test(clean)) return "deep-explanation";
  if (/^(?:\d+\.\s*)?Concept Connections\b/i.test(clean)) return "concept-connections";
  if (/^(?:\d+\.\s*)?Background Knowledge(?: Layer| Needed To Understand This Properly)?\b/i.test(clean)) return "background";
  if (/^(?:\d+\.\s*)?(?:Application To New Situations|How To Apply This To New Questions)\b/i.test(clean)) return "application";
  if (/^(?:\d+\.\s*)?Common Mistakes(?: That Lose Marks)?\b/i.test(clean)) return "common-mistakes";
  if (/^(?:\d+\.\s*)?High-Quality Student Thinking\b/i.test(clean)) return "high-quality-thinking";
  if (/^(?:\d+\.\s*)?How To Use This In Assessment\b/i.test(clean)) return "assessment-use";
  if (/^(?:\d+\.\s*)?Model High-Quality (?:Output|Answers)\b/i.test(clean)) return "model-output";
  if (/^(?:\d+\.\s*)?Exam Question Bank\b/i.test(clean)) return "question-bank";
  if (/^(?:\d+\.\s*)?Memory and Practice\b/i.test(clean)) return "memory-practice";
  return "standard";
}

function professionalSectionClass(kind) {
  const classes = ["professional-mode-section"];
  if (kind === "big-picture") classes.push("professional-big-picture-card");
  if (kind === "exam-focus") classes.push("professional-exam-focus-card");
  if (kind === "core-understanding") classes.push("professional-core-understanding-card");
  if (kind === "concept-connections") classes.push("professional-concept-connections-card");
  if (kind === "deep-explanation") classes.push("professional-deep-explanation-section");
  if (kind === "background") classes.push("professional-background-card");
  if (kind === "application") classes.push("professional-application-card");
  if (kind === "high-quality-thinking") classes.push("professional-high-quality-thinking-card");
  if (kind === "common-mistakes") classes.push("professional-common-mistakes-card");
  if (kind === "assessment-use") classes.push("professional-assessment-use-card");
  if (kind === "model-output") classes.push("professional-model-output-card");
  if (kind === "question-bank") classes.push("professional-question-bank-card");
  if (kind === "memory-practice") classes.push("professional-memory-practice-card");
  return classes.join(" ");
}

function professionalBodyClass(kind) {
  if (kind === "concept-connections") return "professional-section-body professional-connections-grid";
  if (kind === "application") return "professional-section-body professional-application-steps";
  if (kind === "common-mistakes") return "professional-section-body professional-mistakes-list";
  if (kind === "memory-practice") return "professional-section-body professional-memory-list";
  return "professional-section-body";
}

function renderProfessionalHeader(section, chips) {
  const chipRow = chips.length
    ? `<div class="notes-section-chip-row">${chips.map(chipHtml).join("")}</div>`
    : "";
  return `
    <div class="professional-section-header">
      <h2>${section.headingInnerHtml}</h2>
      ${chipRow}
    </div>
  `.trim();
}

function renderProfessionalSection(section, index, collapseSecondary) {
  const titleText = cleanSectionTitleText(section.headingInnerHtml);
  const chips = inferProfessionalSectionChips(titleText);
  const kind = professionalSectionKind(titleText);
  const bodyHtml = decorateStandaloneBadges(stripDuplicateSectionBodyBadges(section.bodyHtml || "", chips));
  const open = !collapseSecondary || index <= 1 || kind === "deep-explanation" ? " open" : "";
  const headerHtml = renderProfessionalHeader(section, chips);
  const bodyClass = professionalBodyClass(kind);
  const sectionClass = professionalSectionClass(kind);

  if (kind === "deep-explanation") {
    return `
      <details class="${sectionClass}"${open} data-section-title="${escapeAttrValue(titleText)}">
        <summary class="professional-section-summary">
          ${headerHtml}
          <span class="notes-section-chevron" aria-hidden="true"></span>
        </summary>
        <div class="${bodyClass}">
          ${bodyHtml}
        </div>
      </details>
    `.trim();
  }

  return `
    <section class="${sectionClass}" data-section-title="${escapeAttrValue(titleText)}">
      ${headerHtml}
      <div class="${bodyClass}">
        ${bodyHtml}
      </div>
    </section>
  `.trim();
}

function renderProfessionalModeSurface(source, collapseSecondary) {
  const { preludeHtml, sections } = splitHtmlSections(source);
  if (!sections.length) return source;

  const prelude = preludeHtml.trim()
    ? `<section class="professional-mode-title-card">${decorateStandaloneBadges(preludeHtml)}</section>`
    : "";
  const renderedSections = sections
    .map((section, index) => renderProfessionalSection(section, index, collapseSecondary))
    .join("\n");
  return `
    <div class="professional-mode-surface">
      ${prelude}
      ${renderedSections}
    </div>
  `.trim();
}

function renderStudyNotesSurface(html, options = {}) {
  const rawSource = String(html || "").trim();
  if (!rawSource) return "";

  if (isProfessionalMode(options.promptMode)) {
    return renderProfessionalModeSurface(rawSource, Boolean(options.collapseSecondary));
  }

  const source = decorateStandaloneBadges(rawSource);
  const { preludeHtml, sections } = splitHtmlSections(source);
  if (!sections.length) return source;

  const collapseSecondary = Boolean(options.collapseSecondary);
  const prelude = preludeHtml.trim()
    ? `<section class="notes-summary-card">${decorateStandaloneBadges(preludeHtml)}</section>`
    : "";
  const renderedSections = sections
    .map((section, index) => renderNotesSection(section, index, collapseSecondary))
    .join("\n");
  return `${prelude}${prelude && renderedSections ? "\n" : ""}${renderedSections}`.trim();
}

function shouldCollapseSecondarySections() {
  try {
    return Boolean(globalThis.matchMedia && globalThis.matchMedia("(max-width: 850px)").matches);
  } catch {
    return false;
  }
}

export {
  decorateStandaloneBadges,
  renderStudyNotesSurface,
  shouldCollapseSecondarySections,
};
