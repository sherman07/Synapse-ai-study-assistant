import { replaceLatexReadableSymbols } from "./readableMath.js";

const MATH_MARKDOWN_LATEX_FUNCTION_NAMES = [
  "sin", "cos", "tan", "sec", "csc", "cot",
  "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh",
  "log", "ln", "lim", "max", "min", "sup", "inf",
  "det", "rank", "tr", "dim", "ker", "span", "Pr"
];

function normalizeReadableMarkdown(text) {
  const source = String(text || "");
  if (!source.trim()) return source;

  const noteLabelPattern = /^(Definition(?:\/mechanism)?|Mechanism|Explanation|Worked example|Source example|Source evidence|Evidence|Implication|Limitation(?:\/(?:misunderstanding|mistake))?|Common mistake|Exam use|Memory hook|Why it matters|How to read it|What to remember|定义|定義|解释|解釋|来源例子|來源例子|源内证据|源內證據|证据|證據|含义|意義|局限|误区|誤區|考试用法|考試用法|常见错误|常見錯誤|记忆钩子|記憶鉤子|为什么重要|為什麼重要|怎么读|怎麼讀|需要记住)\s*[:：]\s*/i;
  const templateHeadingPattern = /^\s*(#{1,4}\s*)?(Learning question|Source and argument map|Core notes?|Key terms(?: and mechanisms)?|Concepts? explained(?: with source evidence)?|Reading the source evidence|Worked examples?(?: and evidence matrix)?|Source evidence\s*\/\s*example matrix|Exam strategy(?: and common student mistakes)?|How to use major pieces of source evidence|Revision checklist|学习问题|來源與論點地圖|来源与论点地图|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|复习清单|複習清單)\b.*$/i;
  const lines = source.split("\n");

  const hasTemplateLabel = (line) => {
    const stripped = String(line || "").trim().replace(/^[-*]\s+/, "");
    return noteLabelPattern.test(stripped);
  };

  const canonicalHeadingText = (title) => {
    const clean = String(title || "")
      .replace(/\s*[（(][^)\n）]*(?:->|→|definition|claim|evidence|visual|explicit|teach|exam|quick|writing|interpret|source|定义|定義|证据|證據|图|圖)[^)\n）]*[)）]\s*/gi, "")
      .replace(/\s*(?:—|--|-|:)\s*(?:what\b|how\b|teach\b|then\b|quick\b|high-level\b|definition\b|explicit\b|interpret\b|source\b).*$/i, "")
      .trim();
    const pairs = [
      [/^Learning question\b|^学习问题\b|^學習問題\b/i, "Learning Question"],
      [/^Source and argument map\b|^来源与论点地图\b|^來源與論點地圖\b/i, "Source and Argument Map"],
      [/^Core notes?\b|^核心笔记\b|^核心筆記\b/i, "Core Notes"],
      [/^Key terms(?: and mechanisms)?\b|^关键术语与机制\b|^關鍵術語與機制\b/i, "Key Terms and Mechanisms"],
      [/^Concepts? explained(?: with source evidence)?\b/i, "Concepts Explained With Source Evidence"],
      [/^Reading the source evidence\b/i, "Reading the Source Evidence"],
      [/^Worked examples?(?: and evidence matrix)?\b|^Source evidence\s*\/\s*example matrix\b/i, "Worked Examples and Evidence"],
      [/^Exam strategy(?: and common student mistakes)?\b/i, "Exam Strategy and Common Mistakes"],
      [/^How to use major pieces of source evidence\b|^Using source evidence\b/i, "Using Source Evidence"],
      [/^Revision checklist\b|^复习清单\b|^複習清單\b/i, "Revision Checklist"]
    ];
    return (pairs.find(([pattern]) => pattern.test(clean)) || [null, clean])[1];
  };

  const splitVisualMarkerLine = (line) => {
    if (!/\[\[VISUAL:\d+\]\]/.test(line || "")) return null;
    const trimmed = String(line || "").trim();
    if (/^\[\[VISUAL:\d+\]\]$/.test(trimmed)) return [trimmed];
    const body = trimmed.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, "");
    const match = body.match(/\[\[VISUAL:(\d+)\]\]/);
    if (!match) return [line];
    let before = body.slice(0, match.index).trim();
    let after = body.slice(match.index + match[0].length).trim();
    before = before.replace(/^(?:before|after)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*$/i, "").trim();
    before = before.replace(/^(?:before|after)\s*[:：-]?\s*$/i, "").trim();
    after = after
      .replace(/^[:：,;.\-\s]+/, "")
      .replace(/^(?:after|before)\s+(?:the\s+)?(?:visual|image|figure|source figure|source image)\s*[:：-]?\s*/i, "")
      .trim();
    return [before, match[0], after].filter(Boolean);
  };

  const polishedLines = [];
  lines.forEach((rawLine, index) => {
    let line = rawLine.replace(/\s+$/g, "");
    const stripped = line.trim();
    const templateHeading = stripped.match(templateHeadingPattern);
    if (templateHeading && !hasTemplateLabel(stripped)) {
      polishedLines.push(`${templateHeading[1] || "## "}${canonicalHeadingText(templateHeading[2])}`);
      return;
    }

    const visualSplit = splitVisualMarkerLine(line);
    if (visualSplit) {
      polishedLines.push(...visualSplit);
      return;
    }

    const orderedConcept = line.match(/^(\s*)\d+\.\s+(.+?)\s*$/);
    if (orderedConcept) {
      const nextNonBlank = lines.slice(index + 1).find(item => item.trim());
      const title = orderedConcept[2].trim();
      if (nextNonBlank && hasTemplateLabel(nextNonBlank) && title.length >= 3 && title.length <= 140 && !title.endsWith(":")) {
        polishedLines.push(`### ${title}`);
        return;
      }
    }

    const bulletLabel = line.match(/^(\s*[-*]\s+)(.+)$/);
    if (bulletLabel) {
      const rewritten = bulletLabel[2].replace(noteLabelPattern, (_, label) => `**${label}:** `);
      if (rewritten !== bulletLabel[2]) {
        polishedLines.push(rewritten);
        return;
      }
    }
    polishedLines.push(line);
  });

  const polished = polishedLines.join("\n");

  return polished.replace(/\n{4,}/g, "\n\n\n").trim();
}

function normalizeLatexAliases(text) {
  let output = String(text || "");
  // Model JSON sometimes arrives with LaTeX double-escaped as text, e.g.
  // "\\(" or "\\frac". MathJax needs a single command slash, while matrix row
  // separators such as "\\" must stay untouched. Only collapse command/delimiter
  // escapes when the next character is a LaTeX command or math delimiter.
  let previous = "";
  while (output !== previous) {
    previous = output;
    output = output
      .replace(/\\\\(?=[A-Za-z()[\],;:!])/g, "\\");
  }
  return output
    .replace(/\tfrac\s*\{/g, "\\frac{")
    .replace(/\\(?:tfrac|dfrac)\s*\{/g, "\\frac{")
    .replace(/\\dfrac\s*\{/g, "\\frac{")
    .replace(/\\quad\b/g, " ")
    .replace(/\\qquad\b/g, " ")
    .replace(/\\(?:Rightarrow|Longrightarrow|implies)\b/g, "\\Rightarrow")
    .replace(/\\(?:leftarrow|gets)\b/g, "\\leftarrow");
}

function removeUnbalancedMathParentheses(value) {
  const chars = [...String(value || "")];
  const stack = [];
  const remove = new Set();
  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const previous = chars[index - 1] || "";
    if (char === "(" && previous !== "\\") {
      stack.push(index);
    } else if (char === ")" && previous !== "\\") {
      if (stack.length) {
        stack.pop();
      } else {
        remove.add(index);
      }
    }
  }
  stack.forEach(index => remove.add(index));
  return chars.filter((_, index) => !remove.has(index)).join("");
}

function repairLatexDelimiterLeakage(value) {
  const output = normalizeLatexAliases(String(value || ""))
    .replace(/\\(?:\(|\)|\[|\])/g, "");
  return removeUnbalancedMathParentheses(output);
}

function repairMergedMathProse(text) {
  return String(text || "")
    .replace(/(\\\)|\\\])(?=[A-Za-z])/g, "$1 ")
    .replace(/([A-Za-z])(?=(?:\\\(|\\\[))/g, "$1 ")
    .replace(/([.?!。！？])(?=(?:Which|What|Why|How|When|Where|Who|This|That|The|A|An|If|Because|Since|So|Then|Use|Show|Give|Write)\b)/g, "$1 ")
    .replace(/\bvs(?=[A-Z])/g, "vs ")
    .replace(/\b(Lagrange|Leibniz)\s*\(/g, "$1 (")
    .replace(/\b(Which|What|Why|How|When|Where|Who)iscorrect\b/gi, "$1 is correct")
    .replace(/\b(Which|What|Why|How|When|Where|Who)is\b/g, "$1 is")
    .replace(/\bbothrepresent\b/gi, "both represent")
    .replace(/\beachterm\b/gi, "each term")
    .replace(/\bdivideby\b/gi, "divide by")
    .replace(/\bdividedby\b/gi, "divided by")
    .replace(/\baddone\b/gi, "add one")
    .replace(/\badd1\b/gi, "add 1")
    .replace(/\bcalculatedfromfirstprinciples\b/gi, "calculated from first principles")
    .replace(/\bpowerule\b/gi, "power rule")
    .replace(/\busingarea\b/gi, "using area")
    .replace(/\bcausingdivisionbyzero\b/gi, "causing division by zero")
    .replace(/\bcorrectantiderivative\b/gi, "correct antiderivative")
    .replace(/\btotaldeposits\b/gi, "total deposits")
    .replace(/\bpotential(\d+(?:\.\d+)?\s*[KMBT])\b/gi, "potential $$$1");
}

function normalizePlainMathText(text) {
  let output = repairProseHeavyMath(normalizeLatexAliases(String(text || "")));
  const protectedSegments = protectExistingMathSegments(output);
  output = normalizeLatexAliases(replaceLatexReadableSymbols(repairMergedMathProse(protectedSegments.text)))
    .replace(/sqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "√($1)")
    .replace(/sqrt\s*([0-9A-Za-z]+)/gi, "√($1)");
  return repairMergedMathProse(protectedSegments.restore(output));
}

function isProseHeavyMathBody(body) {
  const value = String(body || "");
  if (!/[=+\-*/^_|∫ΣΠ≈≃≠≤≥<>×·⋅]|\\(?:int|frac|sqrt|lvert|rvert|ln|log|approx|sim|ne|le|ge)\b/.test(value)) return false;
  const readableFraction = value.match(/^\s*([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\s*$/);
  if (readableFraction && isReadableFractionPair(readableFraction[1], readableFraction[2])) return false;
  const words = value.match(/[A-Za-z]{3,}/g) || [];
  if (words.length < 2) return false;
  const allowed = new Set([
    ...MATH_MARKDOWN_LATEX_FUNCTION_NAMES.map(item => item.toLowerCase()),
    "frac", "sqrt", "lvert", "rvert", "left", "right", "mathrm", "operatorname", "text",
    "begin", "end", "bmatrix", "pmatrix", "matrix"
  ]);
  const proseWords = words.filter(word => !allowed.has(word.toLowerCase()));
  if (proseWords.some(word => word.length >= 14)) return true;
  return proseWords.length >= 2;
}

function repairProseHeavyMath(text) {
  return String(text || "")
    .replace(/\\\(([\s\S]{1,700}?)\\\)/g, (match, body) => (
      isProseHeavyMathBody(body) ? body : match
    ))
    .replace(/\\\[([\s\S]{1,1200}?)\\\]/g, (match, body) => (
      isProseHeavyMathBody(body) ? body : match
    ))
    .replace(/\$\$([\s\S]{1,1200}?)\$\$/g, (match, body) => (
      isProseHeavyMathBody(body) ? body : match
    ));
}

function normalizeDeltaNotation(value) {
  return String(value || "")
    .replace(/\\Delta\s*([A-Za-z])/g, "\\Delta $1")
    .replace(/Δ\s*([A-Za-z])/g, "\\Delta $1");
}

function protectLatexFragments(value, pattern, prefix = "LATEX") {
  const fragments = [];
  const text = String(value || "").replace(pattern, (match) => {
    const id = `@@${prefix}_${fragments.length}@@`;
    fragments.push(match);
    return id;
  });
  return {
    text,
    restore(output) {
      return fragments.reduce((result, fragment, index) => (
        result.split(`@@${prefix}_${index}@@`).join(fragment)
      ), String(output || ""));
    }
  };
}

function protectExistingMathSegments(value) {
  const segments = [];
  const stash = (segment) => {
    const id = `@@MATHSEG${segments.length}@@`;
    segments.push(segment);
    return id;
  };
  let text = String(value || "")
    .replace(/\$\$[\s\S]*?\$\$/g, stash)
    .replace(/\\\[[\s\S]*?\\\]/g, stash)
    .replace(/\\\([\s\S]*?\\\)/g, stash);

  DOLLAR_INLINE_MATH_PATTERN.lastIndex = 0;
  text = text.replace(DOLLAR_INLINE_MATH_PATTERN, (match, prefix, body) => (
    isDollarInlineMathBody(body) ? `${prefix}${stash(`$${body}$`)}` : match
  ));
  DOLLAR_INLINE_MATH_PATTERN.lastIndex = 0;

  return {
    text,
    restore(output) {
      return segments.reduce((result, segment, index) => (
        result.split(`@@MATHSEG${index}@@`).join(segment)
      ), String(output || ""));
    }
  };
}

const READABLE_FRACTION_WORDS = new Set([
  "rise", "run", "change", "time", "distance", "slope", "speed", "velocity",
  "cost", "benefit", "input", "output", "rate", "growth", "area", "volume",
  "force", "mass", "work", "energy", "power"
]);

function isReadableFractionPair(numerator, denominator) {
  const left = String(numerator || "").toLowerCase();
  const right = String(denominator || "").toLowerCase();
  return READABLE_FRACTION_WORDS.has(left) || READABLE_FRACTION_WORDS.has(right);
}

function convertSlashFractionsToLatex(value) {
  const protectedFractions = protectLatexFragments(value, /\\frac\s*\{[^{}\n]+\}\s*\{[^{}\n]+\}/g, "FRAC");
  let output = protectedFractions.text
    .replace(/\bd\s*\/\s*d([A-Za-z])\b/g, "\\frac{d}{d$1}")
    .replace(/\\Delta\s*([A-Za-z])\s*\/\s*\\Delta\s*([A-Za-z])/g, "\\frac{\\Delta $1}{\\Delta $2}")
    .replace(/\[([^\[\]\n]{1,220})\]\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (_, numerator, denominator) => (
      `\\frac{${numerator.trim()}}{${denominator.trim()}}`
    ))
    .replace(/\(((?:[^()\n]|\([^()\n]*\)){1,220})\)\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (_, numerator, denominator) => (
      `\\frac{${numerator.trim()}}{${denominator.trim()}}`
    ))
    .replace(/\(([^()\n]{1,160})\)\s*\/\s*(\\Delta\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?)/g, (_, numerator, denominator) => (
      `\\frac{${numerator.trim()}}{${denominator.trim()}}`
    ))
    .replace(/\b([0-9]+)\s*\/\s*([A-Za-z][A-Za-z0-9]*)\b/g, "\\frac{$1}{$2}")
    .replace(/\b([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\b/g, (match, numerator, denominator) => {
      if (!isReadableFractionPair(numerator, denominator)) return match;
      return `\\frac{${numerator}}{${denominator}}`;
    });
  output = protectedFractions.restore(output);
  return output;
}

function latexSafeMathText(value) {
  const source = convertSlashFractionsToLatex(normalizeDeltaNotation(repairLatexDelimiterLeakage(String(value || ""))))
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/\|([^|\n]{1,100})\|/g, "\\lvert $1 \\rvert")
    .replace(/∫/g, "\\int ")
    .replace(/Σ/g, "\\sum ")
    .replace(/Π/g, "\\prod ")
    .replace(/∞/g, "\\infty ")
    .replace(/∂/g, "\\partial ")
    .replace(/∇/g, "\\nabla ")
    .replace(/÷/g, "\\div ")
    .replace(/[·⋅]/g, "\\cdot ")
    .replace(/×/g, "\\times ")
    .replace(/≈/g, "\\approx ")
    .replace(/≃/g, "\\simeq ")
    .replace(/≡/g, "\\equiv ")
    .replace(/≠/g, "\\ne ")
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/→/g, "\\to ")
    .replace(/\bdet\s*\(/gi, "\\det(")
    .replace(/\bsqrt\s*\(\s*([^()\n]+?)\s*\)/gi, "\\sqrt{$1}")
    .replace(/√\s*\(\s*([^()\n]+?)\s*\)/g, "\\sqrt{$1}")
    .replace(/√\s*([0-9A-Za-z]+)/g, "\\sqrt{$1}")
    .replace(/\^\s*\(([^()\n]{1,60})\)/g, "^{$1}")
    .replace(/\^\s*([-+]?\d{1,4}|[A-Za-z])(?=$|[^A-Za-z0-9])/g, "^{$1}")
    .replace(/_\s*([A-Za-z0-9]{1,6})\b/g, "_{$1}")
    .replace(/\s+/g, " ");
  return source;
}

function plainMatrixToLatex(match) {
  const rows = [];
  String(match || "").replace(/\[\s*([^\[\]\n]*?)\s*\]/g, (_, row) => {
    const cells = row
      .split(/\s*,\s*/)
      .map(cell => latexSafeMathText(cell))
      .filter(Boolean);
    if (cells.length) rows.push(cells.join(" & "));
    return "";
  });
  if (!rows.length) return match;
  return `\\begin{bmatrix}${rows.join(" \\\\ ")}\\end{bmatrix}`;
}

function convertPlainMatricesToLatex(text) {
  return String(text || "").replace(
    /\[\s*(\[[^\[\]\n]*\]\s*(?:,\s*\[[^\[\]\n]*\]\s*)+)\]/g,
    plainMatrixToLatex
  );
}

function isMathAbsPipe(body, index) {
  const before = body.slice(0, index);
  const after = body.slice(index + 1);
  if (/\s$/.test(before) && /^\s/.test(after)) return false;
  const nextPipe = after.indexOf("|");
  if (nextPipe >= 0) {
    const insideAbs = after.slice(0, nextPipe).trim();
    const openerContext = before.trimEnd();
    if (
      insideAbs &&
      insideAbs.length <= 80 &&
      /^[A-Za-z0-9\\{}\s.+\-*/^_]+$/.test(insideAbs) &&
      (
        !openerContext ||
        openerContext.endsWith("|") ||
        /(?:\\?ln|\\?log|\\?det)$/i.test(openerContext) ||
        /[=+\-*/^(]$/.test(openerContext)
      )
    ) {
      return true;
    }
  }
  const prev = before.match(/\S(?=\s*$)/)?.[0] || "";
  const next = after.match(/^\s*(\S)/)?.[1] || "";
  if (!prev || !next) return false;
  const prevMath = /[A-Za-z0-9}\])∞πθαβγδλμσω]/.test(prev);
  const nextMath = /[A-Za-z0-9({\\√∫ΣΠ+\-≤≥≠<>πθαβγδλμσω]/.test(next) || next === ")";
  const previousPipe = before.lastIndexOf("|");
  if (previousPipe >= 0 && prevMath && nextMath) {
    const openerContext = before.slice(0, previousPipe);
    const trimmedOpenerContext = openerContext.trimEnd();
    const insideAbs = before.slice(previousPipe + 1).trim();
    if (
      insideAbs &&
      insideAbs.length <= 80 &&
      /^[A-Za-z0-9\\{}\s.+\-*/^_]+$/.test(insideAbs) &&
      (
        trimmedOpenerContext.endsWith("|") ||
        /(?:\\?ln|\\?log|\\?det|\\?frac|\\?sqrt|[=+\-*/^_(])\s*$/i.test(openerContext)
      )
    ) {
      return true;
    }
  }
  const recent = before.slice(-18);
  if (prevMath && /[)\]}.,;:]/.test(next)) return true;
  return prevMath && nextMath && /(?:\\?ln|\\?log|\\?det|\\?frac|\\?sqrt|[=+\-*/^_(]|∫|Σ|Π|√)\s*[^|]*$/i.test(recent);
}

function splitMarkdownTableCells(value, expectedCount = 0) {
  let body = String(value || "").trim();
  if (body.startsWith("|")) body = body.slice(1);
  if (body.endsWith("|")) body = body.slice(0, -1);

  const cells = [];
  let cell = "";
  let mathDelimiter = "";
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    const prev = body[index - 1] || "";
    const next = body[index + 1] || "";

    if (char === "\\" && next) {
      const pair = char + next;
      if (!mathDelimiter && (pair === "\\(" || pair === "\\[")) {
        mathDelimiter = pair === "\\(" ? "\\)" : "\\]";
      } else if (mathDelimiter && pair === mathDelimiter) {
        mathDelimiter = "";
      }
      cell += pair;
      index += 1;
      continue;
    }

    if (char === "$" && prev !== "\\") {
      if (!mathDelimiter) {
        mathDelimiter = "$";
      } else if (mathDelimiter === "$") {
        mathDelimiter = "";
      }
      cell += char;
      continue;
    }

    if (char === "|" && !mathDelimiter && prev !== "\\" && !isMathAbsPipe(body, index)) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += char;
  }
  cells.push(cell.trim());

  if (expectedCount > 0 && cells.length < expectedCount) {
    return cells.concat(Array.from({ length: expectedCount - cells.length }, () => ""));
  }
  if (expectedCount > 0 && cells.length > expectedCount) {
    const overflow = cells.length - expectedCount;
    let mergeIndex = cells.findIndex((item, index) => (
      index < cells.length - 1 &&
      /(?:\\?ln|\\?log|∫|Σ|Π|√|sqrt|frac|abs|absolute|=|x\^|x_|\($)/i.test(item)
    ));
    if (mergeIndex < 0) mergeIndex = Math.max(0, expectedCount - 2);
    return [
      ...cells.slice(0, mergeIndex),
      cells.slice(mergeIndex, mergeIndex + overflow + 1).join(" | ").trim(),
      ...cells.slice(mergeIndex + overflow + 1)
    ];
  }
  return cells;
}

function splitFormulaTrailingText(value) {
  let formula = repairMergedMathProse(String(value || "")).trimEnd();
  let trailing = "";
  const moveTrailing = (index) => {
    trailing = formula.slice(index) + trailing;
    formula = formula.slice(0, index).trimEnd();
  };
  const derivativeOperatorOnly = formula.match(/^(d\s*\/\s*d[A-Za-z]|\\frac\{d\}\{d[A-Za-z]\})([\s\S]+)$/);
  if (derivativeOperatorOnly && /^(?:\s*\)|\s+(?:vs|versus)\b|[,.;:])/.test(derivativeOperatorOnly[2])) {
    formula = derivativeOperatorOnly[1];
    trailing = derivativeOperatorOnly[2] + trailing;
    return { formula, trailing };
  }
  const arrowToProse = formula.match(/\s*(?:→|⇒|->)\s+(?=(?:derivative|antiderivative|area|proof|power|rule|calculated|using|from|by|with)\b)/i);
  if (arrowToProse && arrowToProse.index > 0) {
    moveTrailing(arrowToProse.index);
  }
  const proseAfterRelationBoundary = formula.match(/[:;]\s+(?=(?:[A-Za-z][A-Za-z-]{2,}|[A-Z][A-Za-z0-9]*(?:\s|$)))/);
  if (proseAfterRelationBoundary && proseAfterRelationBoundary.index > 0) {
    moveTrailing(proseAfterRelationBoundary.index);
  }
  const chainedFormulaBoundary = formula.match(/[:;]\s*(?=(?:[A-Za-z][A-Za-z0-9]*'?\s*\(|[A-Za-z]\s*(?:=|≈|≃|≠|≤|≥|<|>)|tangent|slope|line|where|then|with|use|show|therefore|remember)\b)/i);
  if (chainedFormulaBoundary && chainedFormulaBoundary.index > 0) {
    moveTrailing(chainedFormulaBoundary.index + 1);
  }
  const questionSentenceBoundary = formula.match(/[.?!。！？]\s*(?=(?:which|what|why|how|who|choose|select|identify|state|explain|find|compute|differentiate|integrate|solve|evaluate|determine|is|are|does|do|can|should|would|show|give|write)\b)/i);
  if (questionSentenceBoundary && questionSentenceBoundary.index > 0) {
    moveTrailing(questionSentenceBoundary.index + 1);
  }
  const relationValueThenProse = formula.match(/^([\s\S]*?[=≈≃≠≤≥<>]\s*(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\})(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\}))*)(\s+[A-Za-z][A-Za-z-]{2,}[\s\S]*)$/);
  if (relationValueThenProse && relationValueThenProse[1].length > 0) {
    moveTrailing(relationValueThenProse[1].length);
  }
  const mathTerm = String.raw`(?:[-+]?\d+(?:\.\d+)?%?|[A-Za-z\u0370-\u03ff]{1,4}(?:[A-Za-z0-9]{0,3})?(?:\^\{[^{}]+\}|\^[A-Za-z0-9+\-=]+|_\{[^{}]+\}|_[A-Za-z0-9]{1,6})?|\\frac\{[^{}]+\}\{[^{}]+\}|\([^()\n]{1,80}\))`;
  const relationThenSentence = formula.match(new RegExp(
    String.raw`^([\s\S]*?[=≈≃≠≤≥<>]\s*${mathTerm}(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*${mathTerm})*)(\s+(?:is|are|was|were|be|being|questions?|the|a|an|this|that|which|where|when|because|since|so|then|and|but)\b[\s\S]*)$`,
    "i"
  ));
  if (relationThenSentence && relationThenSentence[1].length > 0) {
    moveTrailing(relationThenSentence[1].length);
  }
  const relationThenInfinitive = formula.match(new RegExp(
    String.raw`^([\s\S]*?[=≈≃≠≤≥<>]\s*${mathTerm}(?:\s*(?:[+\-*/×·⋅]|\\times|\\cdot)\s*${mathTerm})*)(\s+to\s+(?:calculate|compute|find|solve|show|explain|keep|produce|derive|estimate|work|remember)\b[\s\S]*)$`,
    "i"
  ));
  if (relationThenInfinitive && relationThenInfinitive[1].length > 0) {
    moveTrailing(relationThenInfinitive[1].length);
  }
  const textParenthetical = formula.match(/\s+\(([^()]*)\)\s*$/);
  if (textParenthetical) {
    const parenthetical = textParenthetical[1].trim();
    const wordCount = (parenthetical.match(/[A-Za-z]{2,}/g) || []).length;
    const hasFormulaMarks = /[=<>^_\\]|[+\-*/]\s*\d|\d\s*[+\-*/]/.test(parenthetical);
    if (wordCount >= 2 && !hasFormulaMarks) {
      moveTrailing(textParenthetical.index);
    }
  }
  const trailingPatterns = [
    /(?=(?:Which|What|Why|How|Who|Choose|Select|Identify|State|Explain|Show|Give|Write)\b)/,
    /\s+\((?:explicit|show|if|required|where|since|because|when|while|which|this|that|treat|use|note|i\.e\.|e\.g\.)\b[\s\S]*$/i,
    /\s+(?:which|what|why|how|who|choose|select|identify|state|explain|show|give|write)\b[\s\S]*$/i,
    /[,;:]?\s+(?:according|special\s+case|case|or|unless|except|when|while|if|but|for)\b[\s\S]*$/i,
    /[,;:]?\s+(?:compute|find|solve|evaluate|determine)\b[\s\S]*$/i,
    /[,;:]?\s+(?:and|then|with|where|gives?|shows?|means?|makes?|causes?|causing|requires?|therefore|because|since|so|hence|thus)\s+\(?[A-Za-z\u0370-\u03ff∂∇∫ΣΠℝℂℕℤ][\s\S]*$/i,
    /[,;:]?\s+(?:the|a|an)\s+(?:correct|main|final|next|same|rule|answer|antiderivative|derivative|matrix|value|result|step)\b[\s\S]*$/i
  ];
  for (const pattern of trailingPatterns) {
    const match = formula.match(pattern);
    if (match && match.index > 0) {
      moveTrailing(match.index);
    }
  }
  const punctuation = formula.match(/([.,;:!?？。！])$/);
  if (punctuation) {
    trailing = punctuation[1] + trailing;
    formula = formula.slice(0, -1).trimEnd();
  }
  while (formula.endsWith(")")) {
    const openCount = (formula.match(/\(/g) || []).length;
    const closeCount = (formula.match(/\)/g) || []).length;
    if (closeCount <= openCount) break;
    trailing = ")" + trailing;
    formula = formula.slice(0, -1).trimEnd();
  }
  return { formula, trailing };
}

function findPlainFormulaStart(value) {
  const body = String(value || "");
  const patterns = [
    /(?:^|[^\w])(\\(?:frac|tfrac|dfrac)\s*\{)/,
    /(?:^|[^\w])((?:d\s*\/\s*d[A-Za-z]|(?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z]|\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)|\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)))/,
    /(?:^|[^\w])(((?:[-+]?\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9_{}^\\-]*|\([^()\n]{1,40}\))\s*(?:\\cdot|·|⋅|×|\*)\s*)?\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\})/,
    /\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}/,
    /(?:^|[^\w])(\([^()\n]{0,80}(?:=|≈|≃|≠|≤|≥|<|>)[^()\n]{0,80}\))/,
    /(?:^|[^\w])(\([^()\n]{1,80}\)\s*(?:=|≈|≃|≠|≤|≥|<|>))/,
    /(?:^|[^\w])((?!(?:makes?|causes?|causing|requires?|explains?|shows?|means?|because|since|where|when|while|which|that|this)\b)[A-Za-z][A-Za-z0-9]*'?\s*\([^()\n]{1,36}\)\s*(?:=|≈|≃|≠|≤|≥|<|>))/i,
    /(?:^|[^\w])((?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z][A-Za-z0-9_{}^\\-]*(?:\s*(?:\+|-|−|–|—|·|⋅|×|\*|\/)\s*(?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z0-9_{}^\\()+-]+)*\s*(?:=|≈|≃|≠|≤|≥|<|>))/,
    /(?:^|[^\w])([A-Za-z]\s*(?:=|≈|≃|≠|≤|≥|<|>)\s*)/,
    /(?:^|[^\w])(det\s*\()/i,
    /(?:^|[^\w])((?:ln|log)\s*\|[^|\n]{1,100}\|(?:\s*[+\-]\s*[A-Za-z])?)/i,
    /(?:^|[^\w])(\|[^|\n]{1,100}\|\s*(?:=|≠|≤|≥|<|>|[+\-]))/,
    /(?:^|[^\w])([∫ΣΠ]\s*[A-Za-z0-9_{}^\\()+\-*/| ]{1,80}\s*(?:d[A-Za-z]\b|=|≈|≃))/,
    /(?:^|[^\w])([A-Za-z][A-Za-z0-9]*\s*\^\s*\{[^{}]+\})/
  ];
  const starts = patterns
    .map(pattern => {
      const match = body.match(pattern);
      if (!match) return -1;
      const offset = match[1] ? match[0].indexOf(match[1]) : 0;
      return (match.index || 0) + Math.max(0, offset);
    })
    .filter(index => index >= 0);
  return starts.length ? Math.min(...starts) : -1;
}

function shouldWrapFormula(formula) {
  const value = String(formula || "");
  if (/^\s*[-+]?\d+(?:\.\d+)?\s*[A-Za-z]\s*$/.test(value)) return true;
  if (value.length < 3 || value.length > 700) return false;
  if (/(?:https?:\/\/|www\.|youtu\.?be|youtube\.com)/i.test(value)) return false;
  const parentheticalOnly = value.match(/^\s*\(([\s\S]*)\)\s*$/);
  if (parentheticalOnly) {
    const body = parentheticalOnly[1];
    const proseWords = body.match(/[A-Za-z]{3,}/g) || [];
    const hasRealMath = /[≠≤≥<>^_∫ΣΠ√]|\\(?:frac|sqrt|int|sum|prod|lvert|rvert|approx|simeq)\b|(?:^|[^A-Za-z])(?:[A-Za-z]\s*(?:=|≈|≃)|(?:=|≈|≃)\s*[-+]?\d|\d\s*[+\-*/]\s*\d)/.test(body);
    if (proseWords.length >= 2 && !hasRealMath) return false;
  }
  if (isProseHeavyMathBody(value)) return false;
  const relationMatch = value.match(/^\s*([A-Za-z][A-Za-z\s-]{3,})\s*(?:=|≈|≃|≠|≤|≥|<|>)/);
  if (relationMatch && !/[()_^'\\∫ΣΠ√]/.test(relationMatch[1])) return false;
  if (/^\s*[A-Za-z]'\s*\([^()\n]{1,20}\)\s*$/.test(value)) return true;
  if (/\\begin\{(?:bmatrix|pmatrix|matrix|vmatrix|Bmatrix|smallmatrix)\}/.test(value)) return true;
  if (/\\(?:frac|sqrt|lim|int|sum|prod)\b|\\Delta\b|(?:^|[^\w])d\s*\/\s*d[A-Za-z]\b/.test(value)) return true;
  if (/^(?:\\Delta|Δ)\s*[A-Za-z]\s*(?:→|->|=|≠|≤|≥|<|>)\s*[-+]?(?:\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*)$/.test(value.trim())) return true;
  if (/(?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z]|\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)|\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*)/.test(value)) return true;
  const readableFraction = value.match(/^\s*([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\s*$/);
  if (readableFraction && isReadableFractionPair(readableFraction[1], readableFraction[2])) return true;
  if (/\|[^|\n]{1,100}\|/.test(value)) return true;
  if (/\b(?:ln|log)\s*(?:\\lvert|\|)/i.test(value)) return true;
  if (/[=≈≃≠≤≥<>]|\\frac|\\sqrt|√|[∫ΣΠ]|[A-Za-z]\s*\^\s*(?:\{|\(|[A-Za-z0-9+\-=])|[A-Za-z]_\{?[A-Za-z0-9]/.test(value)) return true;
  return /\bdet\s*\(/i.test(value);
}

function latexFormula(value) {
  let output = latexSafeMathText(value)
    .replace(/\b(\d+)\s*x\s*(\d+)\b/gi, "$1 \\times $2")
    .replace(/\s*([=+\-*/(){}\[\],;:])\s*/g, "$1")
    .replace(/([A-Za-z0-9}\)])d([A-Za-z])\b/g, "$1\\,d$2")
    .replace(/\bln\b/g, "\\ln")
    .replace(/\blog\b/g, "\\log")
    .replace(/\s*(\\(?:cdot|times|div|ne|le|ge|to)\s*)\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
  MATH_MARKDOWN_LATEX_FUNCTION_NAMES.forEach(name => {
    if (name === "Pr") return;
    output = output.replace(new RegExp(`(?<!\\\\)\\b${name}\\b`, "g"), `\\${name}`);
  });
  return output;
}

const DOLLAR_INLINE_MATH_PATTERN = /(^|[^\\])\$(?!\d)([^\n$]{1,700}?)\$/g;

function isDollarInlineMathBody(body) {
  const value = String(body || "").trim();
  if (!value) return false;
  if (/^\d+(?:\.\d{2})?(?:\s|$)/.test(value)) return false;
  if (/^(?:[A-Za-z]|[A-Za-z][A-Za-z0-9]*'?\([^()\n]{0,30}\)|\\[A-Za-z]+(?:\{[^{}]*\})*)$/.test(value)) return true;
  if (/[=<>^_{}\\]|[+\-*/]\s*(?:\d|[A-Za-z\\])|(?:\d|[A-Za-z)])\s*[+\-*/]/.test(value)) return true;
  if (/(?:\\Delta|Δ|∫|Σ|Π|√|∞|≤|≥|≠|→)/.test(value)) return true;
  const words = value.match(/[A-Za-z]{3,}/g) || [];
  return words.length <= 1 && /[A-Za-z0-9]/.test(value);
}

function hasDollarInlineMath(value) {
  DOLLAR_INLINE_MATH_PATTERN.lastIndex = 0;
  let match;
  while ((match = DOLLAR_INLINE_MATH_PATTERN.exec(String(value || "")))) {
    if (isDollarInlineMathBody(match[2])) {
      DOLLAR_INLINE_MATH_PATTERN.lastIndex = 0;
      return true;
    }
  }
  DOLLAR_INLINE_MATH_PATTERN.lastIndex = 0;
  return false;
}

function wrapLooseInlineMath(value) {
  if (/\\\(|\\\[|\$\$/.test(value) || hasDollarInlineMath(value)) return value;
  const stashed = [];
  const stash = (formula) => {
    const id = `@@AUTO_INLINE_MATH_${stashed.length}@@`;
    stashed.push(formula);
    return id;
  };
  const restore = (text) => stashed.reduce((result, formula, index) => (
    result.split(`@@AUTO_INLINE_MATH_${index}@@`).join(formula)
  ), String(text || ""));
  const stashFormula = (formula) => {
    const split = splitFormulaTrailingText(formula);
    if (!shouldWrapFormula(split.formula)) return formula;
    return `${stash(`\\(${latexFormula(split.formula)}\\)`)}${wrapLooseInlineMath(split.trailing)}`;
  };
  let output = String(value || "");
  output = output
    .replace(/(^|[^A-Za-z0-9_@])((?:\\Delta|Δ)\s*[A-Za-z]\s*(?:→|->|=|≠|≤|≥|<|>)\s*[-+]?(?:\d+(?:\.\d+)?|[A-Za-z][A-Za-z0-9]*))/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])((?:\\Delta|Δ)\s*[A-Za-z]\s*\/\s*(?:\\Delta|Δ)\s*[A-Za-z])/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])(\[[^\[\]\n]{1,220}\]\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?))/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])(\((?:[^()\n]|\([^()\n]*\)){1,220}\)\s*\/\s*(?:(?:\\Delta|Δ)\s*[A-Za-z]|[A-Za-z][A-Za-z0-9]*|\d+(?:\.\d+)?))/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])\b([A-Za-z]{2,24})\s*\/\s*([A-Za-z]{2,24})\b/g, (match, prefix, numerator, denominator) => (
      isReadableFractionPair(numerator, denominator)
        ? `${prefix}${stashFormula(`${numerator}/${denominator}`)}`
        : match
    ))
    .replace(/(^|[^A-Za-z0-9_@])(\|[^|\n]{1,100}\|\s*(?:(?:=|≈|≃|≠|≤|≥|<|>)\s*[^,.;\n]{1,80}|(?:[+\-]\s*[A-Za-z0-9]+)?))/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])(d\s*\/\s*d[A-Za-z])(?=\s*\)|\s+(?:vs|versus)\b|[,.;:]|$)/gi, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z]'\s*\([^()\n]{1,20}\))/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])\b(derivative|antiderivative|gradient|slope|result|answer)\s*=\s*([-+]?\d+(?:\.\d+)?\s*[A-Za-z](?:\s*\^\s*(?:\{[^{}]+\}|[-+]?\d{1,4}|[A-Za-z]))?(?:\s*[+\-]\s*[-+]?\d+(?:\.\d+)?\s*[A-Za-z]?)?)/gi, (_, prefix, label, formula) => (
      `${prefix}${label} = ${stashFormula(formula)}`
    ))
    .replace(/(^|[^A-Za-z0-9_@])((?:ln|log)\s*\|[^|\n]{1,100}\|(?!\|)(?:\s*[+\-]\s*[A-Za-z])?)/gi, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])((?:[-+]?\d+(?:\.\d+)?\s*)?[A-Za-z]\s*\^\s*(?:\{[^{}]+\}|\([^()\n]{1,60}\)|[A-Za-z0-9+\-=]{1,6})(?:\s*[+\-]\s*(?:(?:\d+(?:\.\d+)?\s*)?[A-Za-z](?:\s*\^\s*(?:\{[^{}]+\}|\([^()\n]{1,60}\)|[A-Za-z0-9+\-=]{1,6}))?|\d+(?:\.\d+)?)){1,})/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])((?!(?:makes?|causes?|causing|requires?|explains?|shows?|means?|because|since|where|when|while|which|that|this)\b)[A-Za-z][A-Za-z0-9]*'?\s*\([^()\n]{1,36}\)\s*(?:=|≈|≃|≠|≤|≥)\s*[^,.;\n]{1,160})/gi, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])(\([^()\n]{1,80}\)\s*(?:=|≈|≃|≠|≤|≥|<|>)\s*[^,.;\n]{1,120})/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z]\s*(?:=|≈|≃|≠|≤|≥)\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?|[A-Za-z0-9.\u0370-\u03ff]+)(?:\s*[+\-*/]\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?|[A-Za-z0-9.\u0370-\u03ff]+)(?:\s*\^\s*(?:\{[^{}]+\}|[A-Za-z0-9+\-=]{1,6}))?)*\)?)/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])([∫ΣΠ]\s*[A-Za-z0-9_{}^()+\-*/| ]{1,100}\s*(?:d[A-Za-z]\b|(?:=|≈|≃)\s*[^,.;\n]{1,100}))/g, (_, prefix, formula) => `${prefix}${stashFormula(formula)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*\{([^{}]+)\}/g, (_, prefix, base, exponent) => `${prefix}${stash(`\\(${base}^{${latexFormula(exponent)}}\\)`)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)_\{([^{}]+)\}/g, (_, prefix, base, subscript) => `${prefix}${stash(`\\(${base}_{${latexFormula(subscript)}}\\)`)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*\(([^()\n]{1,60})\)/g, (_, prefix, base, exponent) => `${prefix}${stash(`\\(${base}^{${latexFormula(exponent)}}\\)`)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)\s*\^\s*([A-Za-z0-9+\-=]{1,6})(?![A-Za-z0-9])/g, (_, prefix, base, exponent) => `${prefix}${stash(`\\(${base}^{${latexFormula(exponent)}}\\)`)}`)
    .replace(/(^|[^A-Za-z0-9_@])([A-Za-z\u0370-\u03ff][A-Za-z0-9\u0370-\u03ff]*)_([0-9A-Za-z]{1,6})(?![A-Za-z0-9])/g, (_, prefix, base, subscript) => `${prefix}${stash(`\\(${base}_{${latexFormula(subscript)}}\\)`)}`)
    .replace(/(\([^()\n]{1,80}\)\s*_\s*[A-Za-z0-9]{1,6}\s*=\s*[A-Za-z][A-Za-z0-9]*\s*_\s*[A-Za-z0-9]{1,6})/g, (match) => stash(`\\(${latexFormula(match)}\\)`))
    .replace(/(\([^()\n]{1,80}\)\s*_\s*[A-Za-z0-9]{1,6})/g, (match) => stash(`\\(${latexFormula(match)}\\)`))
    .replace(/\bdet\s*\(\s*([A-Za-z][A-Za-z0-9_]*)\s*\)/gi, (_, variable) => stash(`\\(\\det(${variable})\\)`))
    .replace(/\b([A-Za-z][A-Za-z0-9]*)\s*\^\s*\{([^{}]+)\}/g, (_, base, exponent) => stash(`\\(${base}^{${latexFormula(exponent)}}\\)`))
    .replace(/\b([A-Za-z][A-Za-z0-9]*)_\{([^{}]+)\}/g, (_, base, subscript) => stash(`\\(${base}_{${latexFormula(subscript)}}\\)`))
    .replace(/\b([A-Za-z][A-Za-z0-9]*)\s*\^\s*([A-Za-z0-9+\-=]{1,6})\b/g, (_, base, exponent) => stash(`\\(${base}^{${latexFormula(exponent)}}\\)`))
    .replace(/\b([A-Za-z][A-Za-z0-9]*)_([0-9A-Za-z]{1,6})\b/g, (_, base, subscript) => stash(`\\(${base}_{${latexFormula(subscript)}}\\)`))
    .replace(/(?:√|sqrt)\s*\(\s*([^()\n]+?)\s*\)/gi, (_, radicand) => stash(`\\(\\sqrt{${latexFormula(radicand)}}\\)`));
  return restore(output);
}

function wrapTextOutsideExistingMath(value) {
  const protectedSegments = protectExistingMathSegments(value);
  return protectedSegments.restore(wrapLooseInlineMath(protectedSegments.text));
}

function protectNonMathSegments(text) {
  const segments = [];
  const stash = (segment) => {
    const id = `@@TEXTSEG${segments.length}@@`;
    segments.push(segment);
    return id;
  };
  const source = String(text || "").replace(/https?:\/\/[^\s<>"']+/gi, (match) => {
    const split = String(match).match(/^(.+?)([)\].,;:!?，。；：！？]*)$/);
    const url = split ? split[1] : match;
    const trailing = split ? split[2] : "";
    return `${stash(url)}${trailing}`;
  });
  return {
    text: source,
    restore(value) {
      return segments.reduce((result, segment, index) => (
        result.replaceAll(`@@TEXTSEG${index}@@`, segment)
      ), String(value || ""));
    }
  };
}

function wrapPlainMathLine(line, forceInline = false) {
  if (!line || /^\s*```/.test(line) || /^\s*\[\[VISUAL:\d+\]\]\s*$/.test(line)) return line;
  if (/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)) return line;
  if (/^\s*\|.*\|\s*$/.test(line)) {
    const trimmed = String(line).trim();
    const cells = splitMarkdownTableCells(trimmed)
      .map(cell => wrapPlainMathLine(cell.trim(), true));
    return `| ${cells.join(" | ")} |`;
  }

  const lineMatch = String(line).match(/^(\s*(?:[-*+]\s+|\d+\.\s+|>\s*)?)(.*)$/);
  const prefix = lineMatch ? lineMatch[1] : "";
  const body = lineMatch ? lineMatch[2] : String(line);
  if (!body.trim()) return line;
  if (/\\\(|\\\[|\$\$|\$/.test(body)) {
    return prefix + wrapTextOutsideExistingMath(body);
  }

  const formulaStart = findPlainFormulaStart(body);
  if (formulaStart < 0) return prefix + wrapLooseInlineMath(body);

  const before = body.slice(0, formulaStart);
  const candidate = body.slice(formulaStart);
  const { formula, trailing } = splitFormulaTrailingText(candidate);
  if (!shouldWrapFormula(formula)) return prefix + wrapLooseInlineMath(body);

  const isStandaloneFormula = !forceInline && !prefix && !before.trim() && !trailing.trim() && formula.length <= 220;
  const latex = latexFormula(formula);
  const wrapped = isStandaloneFormula ? `\\[${latex}\\]` : `\\(${latex}\\)`;
  let trailingText = trailing;
  if (/^\)+/.test(trailingText)) {
    const beforeOpen = (before.match(/\(/g) || []).length;
    const beforeClose = (before.match(/\)/g) || []).length;
    if (beforeClose >= beforeOpen && !before.trimEnd().endsWith("(")) {
      trailingText = trailingText.replace(/^\)+/, "");
    }
  }
  return prefix + wrapLooseInlineMath(before) + wrapped + (trailingText ? wrapPlainMathLine(trailingText, true) : "");
}

function prepareMathMarkdown(text) {
  const protectedSegments = protectNonMathSegments(convertPlainMatricesToLatex(normalizePlainMathText(text)));
  const protectedMath = protectExistingMathSegments(protectedSegments.text);
  const prepared = protectedMath.text
    .split("\n")
    .map(line => wrapPlainMathLine(line))
    .join("\n");
  return protectedSegments.restore(protectedMath.restore(prepared));
}

export {
  DOLLAR_INLINE_MATH_PATTERN,
  isDollarInlineMathBody,
  latexFormula,
  normalizeReadableMarkdown,
  prepareMathMarkdown,
  repairLatexDelimiterLeakage,
  splitMarkdownTableCells
};
