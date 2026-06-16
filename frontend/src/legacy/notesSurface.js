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

const ACADEMIC_BADGE_BY_SECTION = [
  [/^Academic Overview$/i, ["Source-based", "Academic interpretation"]],
  [/^Central Argument$/i, ["Academic interpretation", "Source-based"]],
  [/^Conceptual Framework$/i, ["Source-based", "Academic interpretation"]],
  [/^Key Tensions\s*\/\s*Debates$/i, ["Source-based", "Academic interpretation"]],
  [/^Critical Analysis$/i, ["Source-based", "Academic interpretation", "Limitation"]],
  [/^Strengths and Limits of the Source$/i, ["Source-based", "Limitation"]],
  [/^Essay-Ready Thesis Statements$/i, ["Essay use"]],
  [/^Model Academic Paragraph$/i, ["Essay use", "Limitation"]],
  [/^Professional Vocabulary Bank$/i, ["Essay use"]],
  [/^High-Grade Discussion Points$/i, ["Academic interpretation"]],
  [/^(?:Essay\s*\/\s*Tutorial Use|How to use this in an essay or tutorial)$/i, ["Essay use"]],
];

const BADGE_CLASS_BY_LABEL = new Map([
  ["Direct from source", "source"],
  ["Inferred from source", "inferred"],
  ["Tutor explanation", "tutor"],
  ["Not enough evidence", "needs-evidence"],
  ["Not enough evidence from source", "needs-evidence"],
  ["Source-based", "source-based"],
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

function inferAcademicSectionChips(title) {
  const clean = cleanSectionTitleText(title);
  for (const [pattern, chips] of ACADEMIC_BADGE_BY_SECTION) {
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

function isAcademicAnalysisMode(value) {
  const key = String(value || "").trim().toLowerCase().replace(/[-\s/]+/g, "_");
  return key === "professor_mode" || key === "academic" || key === "academic_analysis" || key === "academic_analysis_mode";
}

function academicSectionKind(title) {
  const clean = cleanSectionTitleText(title);
  if (/^Academic Overview$/i.test(clean)) return "overview";
  if (/^Central Argument$/i.test(clean)) return "central-argument";
  if (/^Conceptual Framework$/i.test(clean)) return "conceptual-framework";
  if (/^Key Tensions\s*\/\s*Debates$/i.test(clean)) return "key-tensions";
  if (/^Critical Analysis$/i.test(clean)) return "critical-analysis";
  if (/^Strengths and Limits of the Source$/i.test(clean)) return "strengths-limits";
  if (/^Essay-Ready Thesis Statements$/i.test(clean)) return "essay-thesis";
  if (/^Model Academic Paragraph$/i.test(clean)) return "model-paragraph";
  if (/^Professional Vocabulary Bank$/i.test(clean)) return "vocabulary-bank";
  if (/^High-Grade Discussion Points$/i.test(clean)) return "discussion-points";
  if (/^(?:Essay\s*\/\s*Tutorial Use|How to use this in an essay or tutorial)$/i.test(clean)) return "essay-use";
  return "standard";
}

function academicSectionClass(kind) {
  const classes = ["academic-analysis-section"];
  if (kind === "overview") classes.push("academic-overview-card");
  if (kind === "central-argument") classes.push("central-argument-card");
  if (kind === "conceptual-framework") classes.push("conceptual-framework-card");
  if (kind === "key-tensions") classes.push("key-tensions-card");
  if (kind === "critical-analysis") classes.push("critical-analysis-section");
  if (kind === "strengths-limits") classes.push("strengths-limits-card");
  if (kind === "essay-thesis") classes.push("essay-thesis-card");
  if (kind === "model-paragraph") classes.push("model-paragraph-card");
  if (kind === "vocabulary-bank") classes.push("vocabulary-bank-card");
  if (kind === "discussion-points") classes.push("discussion-points-card");
  if (kind === "essay-use") classes.push("essay-use-card");
  return classes.join(" ");
}

function academicBodyClass(kind) {
  if (kind === "key-tensions") return "academic-section-body key-tensions-grid";
  if (kind === "essay-thesis") return "academic-section-body essay-thesis-grid";
  if (kind === "vocabulary-bank") return "academic-section-body vocabulary-bank-table";
  if (kind === "discussion-points") return "academic-section-body discussion-checklist";
  return "academic-section-body";
}

function renderAcademicHeader(section, chips) {
  const chipRow = chips.length
    ? `<div class="notes-section-chip-row">${chips.map(chipHtml).join("")}</div>`
    : "";
  return `
    <div class="academic-section-header">
      <h2>${section.headingInnerHtml}</h2>
      ${chipRow}
    </div>
  `.trim();
}

function renderAcademicSection(section, index, collapseSecondary) {
  const titleText = cleanSectionTitleText(section.headingInnerHtml);
  const chips = inferAcademicSectionChips(titleText);
  const kind = academicSectionKind(titleText);
  const bodyHtml = decorateStandaloneBadges(section.bodyHtml || "");
  const open = !collapseSecondary || index <= 1 || kind === "critical-analysis" ? " open" : "";
  const headerHtml = renderAcademicHeader(section, chips);
  const bodyClass = academicBodyClass(kind);
  const sectionClass = academicSectionClass(kind);

  if (kind === "critical-analysis") {
    return `
      <details class="${sectionClass}"${open} data-section-title="${escapeAttrValue(titleText)}">
        <summary class="academic-section-summary">
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

function renderAcademicAnalysisSurface(source, collapseSecondary) {
  const { preludeHtml, sections } = splitHtmlSections(source);
  if (!sections.length) return source;

  const prelude = preludeHtml.trim()
    ? `<section class="academic-analysis-title-card">${decorateStandaloneBadges(preludeHtml)}</section>`
    : "";
  const renderedSections = sections
    .map((section, index) => renderAcademicSection(section, index, collapseSecondary))
    .join("\n");
  return `
    <div class="academic-analysis-surface">
      ${prelude}
      ${renderedSections}
    </div>
  `.trim();
}

function renderStudyNotesSurface(html, options = {}) {
  const source = decorateStandaloneBadges(String(html || "").trim());
  if (!source) return "";

  if (isAcademicAnalysisMode(options.promptMode)) {
    return renderAcademicAnalysisSurface(source, Boolean(options.collapseSecondary));
  }

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
