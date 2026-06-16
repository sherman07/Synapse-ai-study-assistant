const NOTE_SECTION_LABEL_PATTERN = /^(Learning question|Key takeaways?|Core concept map|Main notes by lecture section|Key terms table|Case study\s*\/\s*example breakdown|Evidence bank|Exam answer templates|Common mistakes|Revision checklist|Flashcard-ready summary|Academic overview|Central argument|Conceptual framework|Key tensions\s*\/\s*debates|Critical analysis|Strengths and limits of the source|Essay-ready thesis statements|Model academic paragraph|Professional vocabulary bank|High-grade discussion points|Essay\s*\/\s*tutorial use|How to use this in an essay or tutorial|Source and argument map|Core notes|Key terms(?: and mechanisms)?|Sources?\s*(?:\(|:)|Core argument|Key ideas?|Concepts? explained|Source evidence(?:\s*\/\s*example matrix)?|Reading the source evidence|Worked examples?|Evidence matrix|Comparison table|Exam strategy|Conclusion|学习问题|关键结论|核心概念图|分章节主笔记|关键术语表|案例\s*\/\s*例子拆解|证据库|考试答题模板|常见错误|复习清单|闪卡速记总结|學習問題|關鍵結論|核心概念圖|分章節主筆記|關鍵術語表|案例\s*\/\s*例子拆解|證據庫|考試答題模板|常見錯誤|複習清單|閃卡速記總結|来源与论点地图|來源與論點地圖|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|核心论点|核心論點|关键概念|關鍵概念|源内证据|源內證據|证据矩阵|證據矩陣|例子与证据|例子與證據|概念比较表|概念比較表|考试策略|考試策略|复习|復習|结论|結論)\b.*$/i;

function cleanReadableSectionTitle(title) {
  const value = String(title || "")
    .replace(/^#{1,4}\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/\s*[（(][^)\n）]*(?:->|→|definition|claim|evidence|visual|explicit|teach|exam|quick|writing|interpret|source|定义|定義|证据|證據|图|圖)[^)\n）]*[)）]\s*/gi, "")
    .replace(/\s*(?:—|--|-|:)\s*(?:what\b|how\b|teach\b|then\b|quick\b|high-level\b|definition\b|explicit\b|interpret\b|source\b).*$/i, "")
    .trim();
  const pairs = [
    [/^Learning question\b/i, "Learning Question"],
    [/^Key takeaways?\b/i, "Key Takeaways"],
    [/^Core concept map\b/i, "Core Concept Map"],
    [/^Main notes by lecture section\b/i, "Main Notes by Lecture Section"],
    [/^Key terms table\b/i, "Key Terms Table"],
    [/^Case study\s*\/\s*example breakdown\b/i, "Case Study / Example Breakdown"],
    [/^Evidence bank\b/i, "Evidence Bank"],
    [/^Exam answer templates\b/i, "Exam Answer Templates"],
    [/^Source and argument map\b/i, "Source and Argument Map"],
    [/^Core notes?\b/i, "Core Notes"],
    [/^Key terms(?: and mechanisms)?\b/i, "Key Terms and Mechanisms"],
    [/^Concepts? explained(?: with source evidence)?\b/i, "Concepts Explained With Source Evidence"],
    [/^Reading the source evidence\b/i, "Reading the Source Evidence"],
    [/^Worked examples?(?: and evidence matrix)?\b|^Source evidence\s*\/\s*example matrix\b/i, "Worked Examples and Evidence"],
    [/^Exam strategy(?: and common student mistakes)?\b/i, "Exam Strategy and Common Mistakes"],
    [/^Academic overview\b/i, "Academic Overview"],
    [/^Central argument\b/i, "Central Argument"],
    [/^Conceptual framework\b/i, "Conceptual Framework"],
    [/^Key tensions\s*\/\s*debates\b/i, "Key Tensions / Debates"],
    [/^Critical analysis\b/i, "Critical Analysis"],
    [/^Strengths and limits of the source\b/i, "Strengths and Limits of the Source"],
    [/^Essay-ready thesis statements\b/i, "Essay-Ready Thesis Statements"],
    [/^Model academic paragraph\b/i, "Model Academic Paragraph"],
    [/^Professional vocabulary bank\b/i, "Professional Vocabulary Bank"],
    [/^High-grade discussion points\b/i, "High-Grade Discussion Points"],
    [/^(?:Essay\s*\/\s*tutorial use|How to use this in an essay or tutorial)\b/i, "Essay / Tutorial Use"],
    [/^How to use major pieces of source evidence\b|^Using source evidence\b/i, "Using Source Evidence"],
    [/^Revision checklist\b/i, "Revision Checklist"],
    [/^Flashcard-ready summary\b/i, "Flashcard-ready Summary"]
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
