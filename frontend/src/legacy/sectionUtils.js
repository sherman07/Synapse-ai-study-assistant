const NOTE_SECTION_LABEL_PATTERN = /^(Learning question|Source and argument map|Core notes|Key terms(?: and mechanisms)?|Sources?\s*(?:\(|:)|Core argument|Key ideas?|Concepts? explained|Source evidence|Reading the source evidence|Worked examples?|Evidence matrix|Comparison table|Exam strategy|Common mistakes|Revision(?: checklist)?|Conclusion|学习问题|来源与论点地图|來源與論點地圖|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|核心论点|核心論點|关键概念|關鍵概念|源内证据|源內證據|证据矩阵|證據矩陣|例子与证据|例子與證據|概念比较表|概念比較表|考试策略|考試策略|常见错误|常見錯誤|复习|復習|结论|結論)\b.*$/i;

function cleanReadableSectionTitle(title) {
  const value = String(title || "")
    .replace(/^#{1,4}\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/\s*[（(][^)\n）]*(?:->|→|definition|claim|evidence|visual|explicit|teach|exam|quick|writing|interpret|source|定义|定義|证据|證據|图|圖)[^)\n）]*[)）]\s*/gi, "")
    .replace(/\s*(?:—|--|-|:)\s*(?:what\b|how\b|teach\b|then\b|quick\b|high-level\b|definition\b|explicit\b|interpret\b|source\b).*$/i, "")
    .trim();
  const pairs = [
    [/^Learning question\b/i, "Learning Question"],
    [/^Source and argument map\b/i, "Source and Argument Map"],
    [/^Core notes?\b/i, "Core Notes"],
    [/^Key terms(?: and mechanisms)?\b/i, "Key Terms and Mechanisms"],
    [/^Concepts? explained(?: with source evidence)?\b/i, "Concepts Explained With Source Evidence"],
    [/^Reading the source evidence\b/i, "Reading the Source Evidence"],
    [/^Worked examples?(?: and evidence matrix)?\b/i, "Worked Examples and Evidence"],
    [/^Exam strategy(?: and common student mistakes)?\b/i, "Exam Strategy and Common Mistakes"],
    [/^How to use major pieces of source evidence\b|^Using source evidence\b/i, "Using Source Evidence"],
    [/^Revision checklist\b/i, "Revision Checklist"]
  ];
  return (pairs.find(([pattern]) => pattern.test(value)) || [null, value])[1];
}

function normalizeSectionTitle(title) {
  return cleanReadableSectionTitle(title);
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
  return Object.fromEntries(Object.entries(sectionMap || {}).map(([title, content]) => {
    const readableTitle = cleanReadableSectionTitle(title);
    if (String(language || "auto") !== "auto" || !isMostlyEnglishText(summary) || !String(readableTitle).includes("/")) {
      return [readableTitle, content];
    }
    const [left, right] = String(readableTitle).split("/", 2).map(part => part.trim());
    if (/[A-Za-z]/.test(left) && /[\u4e00-\u9fff]/.test(right)) {
      return [left, content];
    }
    return [readableTitle, content];
  }));
}

export {
  cleanAutoLanguageSectionTitles,
  cleanReadableSectionTitle,
  hydrateSectionsFromSummary,
  normalizeSectionTitle,
  removeAutoBilingualHeadings
};
