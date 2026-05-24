const SUBSCRIPT_MAP = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎",
  "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ",
  "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ",
  "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ",
  "v": "ᵥ", "x": "ₓ"
};

const SUPERSCRIPT_MAP = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾",
  "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ",
  "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ",
  "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ",
  "p": "ᵖ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ",
  "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ",
  "A": "ᴬ", "B": "ᴮ", "D": "ᴰ", "E": "ᴱ", "G": "ᴳ",
  "H": "ᴴ", "I": "ᴵ", "J": "ᴶ", "K": "ᴷ", "L": "ᴸ",
  "M": "ᴹ", "N": "ᴺ", "O": "ᴼ", "P": "ᴾ", "R": "ᴿ",
  "T": "ᵀ", "U": "ᵁ", "V": "ⱽ", "W": "ᵂ"
};

const BLACKBOARD_MAP = {
  "A": "𝔸", "B": "𝔹", "C": "ℂ", "D": "𝔻", "E": "𝔼",
  "F": "𝔽", "G": "𝔾", "H": "ℍ", "I": "𝕀", "N": "ℕ",
  "P": "ℙ", "Q": "ℚ", "R": "ℝ", "Z": "ℤ"
};

const LATEX_READABLE_SYMBOLS = {
  "\\Alpha": "Α", "\\Beta": "Β", "\\Gamma": "Γ", "\\Delta": "Δ",
  "\\Epsilon": "Ε", "\\Zeta": "Ζ", "\\Eta": "Η", "\\Theta": "Θ",
  "\\Iota": "Ι", "\\Kappa": "Κ", "\\Lambda": "Λ", "\\Mu": "Μ",
  "\\Nu": "Ν", "\\Xi": "Ξ", "\\Omicron": "Ο", "\\Pi": "Π",
  "\\Rho": "Ρ", "\\Sigma": "Σ", "\\Tau": "Τ", "\\Upsilon": "Υ",
  "\\Phi": "Φ", "\\Chi": "Χ", "\\Psi": "Ψ", "\\Omega": "Ω",
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\varepsilon": "ε", "\\zeta": "ζ", "\\eta": "η",
  "\\theta": "θ", "\\vartheta": "ϑ", "\\iota": "ι", "\\kappa": "κ",
  "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ",
  "\\omicron": "ο", "\\pi": "π", "\\varpi": "ϖ", "\\rho": "ρ",
  "\\varrho": "ϱ", "\\sigma": "σ", "\\varsigma": "ς", "\\tau": "τ",
  "\\upsilon": "υ", "\\phi": "φ", "\\varphi": "ϕ", "\\chi": "χ",
  "\\psi": "ψ", "\\omega": "ω",
  "\\times": "×", "\\cdot": "·", "\\cdotp": "·", "\\div": "÷",
  "\\pm": "±", "\\mp": "∓", "\\ast": "*", "\\star": "⋆",
  "\\circ": "∘", "\\bullet": "•", "\\oplus": "⊕", "\\otimes": "⊗",
  "\\leq": "≤", "\\le": "≤", "\\leqslant": "≤", "\\geq": "≥", "\\ge": "≥", "\\geqslant": "≥",
  "\\neq": "≠", "\\ne": "≠", "\\equiv": "≡", "\\approx": "≈",
  "\\sim": "∼", "\\simeq": "≃", "\\cong": "≅", "\\propto": "∝",
  "\\lt": "<", "\\gt": ">", "\\ll": "≪", "\\gg": "≫",
  "\\infty": "∞", "\\partial": "∂", "\\nabla": "∇", "\\angle": "∠",
  "\\perp": "⊥", "\\parallel": "∥", "\\degree": "°",
  "\\lfloor": "⌊", "\\rfloor": "⌋", "\\lceil": "⌈", "\\rceil": "⌉",
  "\\langle": "<", "\\rangle": ">", "\\ldots": "…", "\\dots": "…", "\\cdots": "…",
  "\\in": "∈", "\\notin": "∉", "\\ni": "∋", "\\subseteq": "⊆",
  "\\supseteq": "⊇", "\\subset": "⊂", "\\supset": "⊃",
  "\\emptyset": "∅", "\\varnothing": "∅", "\\setminus": "∖",
  "\\cup": "∪", "\\cap": "∩",
  "\\forall": "∀", "\\exists": "∃", "\\nexists": "∄", "\\neg": "¬",
  "\\land": "∧", "\\wedge": "∧", "\\lor": "∨", "\\vee": "∨",
  "\\therefore": "∴", "\\because": "∵",
  "\\to": "→", "\\rightarrow": "→", "\\leftarrow": "←",
  "\\leftrightarrow": "↔", "\\mapsto": "↦", "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐", "\\Leftrightarrow": "⇔", "\\implies": "⇒",
  "\\iff": "⇔", "\\uparrow": "↑", "\\downarrow": "↓",
  "\\sum": "Σ", "\\prod": "Π", "\\int": "∫", "\\iint": "∬",
  "\\iiint": "∭", "\\oint": "∮"
};

const LATEX_FUNCTION_NAMES = [
  "sin", "cos", "tan", "sec", "csc", "cot",
  "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh",
  "log", "ln", "lim", "max", "min", "sup", "inf",
  "det", "rank", "tr", "dim", "ker", "span", "Pr"
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readableAccent(content, mark, name) {
  const text = String(content || "").trim();
  if (!text) return "";
  return [...text].length <= 2 ? `${text}${mark}` : `${name}(${text})`;
}

function replaceLatexReadableSymbols(value) {
  let output = String(value || "");
  output = output.replace(/\\mathbb\{([A-Za-z])\}/g, (_, ch) => BLACKBOARD_MAP[ch] || ch);
  output = output.replace(/\\mathbb\s+([A-Za-z])/g, (_, ch) => BLACKBOARD_MAP[ch] || ch);
  output = output.replace(/\\(?:operatorname|text|mathrm|mathbf|mathit|textbf|textit)\{([^{}]*)\}/g, "$1");
  output = output.replace(/\\(?:left|right|big|Big|bigg|Bigg)\b/g, "");
  output = output.replace(/\\[,;:!]\s*/g, " ");
  output = output
    .replace(/\\(?:widehat|hat)\{([^{}]+)\}/g, (_, body) => readableAccent(body, "\u0302", "hat"))
    .replace(/\\(?:overline|bar)\{([^{}]+)\}/g, (_, body) => readableAccent(body, "\u0304", "bar"))
    .replace(/\\(?:vec|overrightarrow)\{([^{}]+)\}/g, (_, body) => readableAccent(body, "\u20d7", "vec"))
    .replace(/\\tilde\{([^{}]+)\}/g, (_, body) => readableAccent(body, "\u0303", "tilde"))
    .replace(/\\dot\{([^{}]+)\}/g, (_, body) => readableAccent(body, "\u0307", "dot"))
    .replace(/\\ddot\{([^{}]+)\}/g, (_, body) => readableAccent(body, "\u0308", "ddot"));
  Object.entries(LATEX_READABLE_SYMBOLS)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([command, symbol]) => {
      output = output.replace(new RegExp(escapeRegExp(command) + "(?![A-Za-z])", "g"), symbol);
    });
  LATEX_FUNCTION_NAMES.forEach(name => {
    output = output.replace(new RegExp(`\\\\${name}(?![A-Za-z])`, "g"), name);
  });
  return output
    .replace(/<=>/g, "⇔")
    .replace(/=>/g, "⇒")
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/(?<!<)-\>/g, "→")
    .replace(/<-/g, "←");
}

function mapReadableScript(chars, map, fallbackPrefix = "") {
  const text = String(chars || "").trim();
  if (!text) return "";
  const mapped = [...text].map(ch => map[ch] || map[ch.toLowerCase()] || "").join("");
  return mapped && mapped.length === text.length ? mapped : `${fallbackPrefix}${text}`;
}

function readableSubscripts(value) {
  return String(value || "")
    .replace(/_\{([A-Za-z0-9+\-=()]+)\}/g, (_, chars) => mapReadableScript(chars, SUBSCRIPT_MAP, "_"))
    .replace(/([A-Za-z0-9α-ωΑ-Ω∫∬∭∮ΣΠ∂∇)\]])_([A-Za-z0-9]{1,4})(?![A-Za-z0-9])/g, (_, base, chars) => `${base}${mapReadableScript(chars, SUBSCRIPT_MAP, "_")}`)
    .replace(/_([A-Za-z0-9]{1,4})(?![A-Za-z0-9])/g, (_, chars) => mapReadableScript(chars, SUBSCRIPT_MAP, "_"));
}

function readableSuperscripts(value) {
  return String(value || "")
    .replace(/\^\{\\?top\}/gi, "ᵀ")
    .replace(/\^\\?top\b/gi, "ᵀ")
    .replace(/\^\{([A-Za-z0-9+\-=()]+)\}/g, (_, chars) => mapReadableScript(chars, SUPERSCRIPT_MAP, "^"))
    .replace(/([A-Za-z0-9α-ωΑ-Ω∫∬∭∮ΣΠ∂∇)\]])\^([A-Za-z0-9+\-=]{1,4})(?![A-Za-z0-9])/g, (_, base, chars) => `${base}${mapReadableScript(chars, SUPERSCRIPT_MAP, "^")}`)
    .replace(/\^([A-Za-z0-9+\-=]{1,4})(?![A-Za-z0-9])/g, (_, chars) => mapReadableScript(chars, SUPERSCRIPT_MAP, "^"));
}

function readableMathSymbols(value) {
  return readableSubscripts(readableSuperscripts(String(value || "")))
    .replace(/\bdet\s*\(/gi, "det(")
    .replace(/\brank\s*\(/gi, "rank(");
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

function plainNestedMatricesToReadable(value) {
  return String(value || "").replace(
    /\[\s*(\[[^\[\]\n]*\]\s*(?:,\s*\[[^\[\]\n]*\]\s*)+)\]/g,
    (match) => {
      const rows = [];
      String(match || "").replace(/\[\s*([^\[\]\n]*?)\s*\]/g, (_, row) => {
        const cells = row
          .split(/\s*,\s*/)
          .map(cell => readableSubscripts(cleanMindText(cell)))
          .filter(Boolean);
        if (cells.length) rows.push(cells.join(", "));
        return "";
      });
      return rows.length ? `[${rows.join("; ")}]` : match;
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
  value = plainNestedMatricesToReadable(value);

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
  value = replaceLatexReadableSymbols(value);
  value = value.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  value = value.replace(/sqrt\s*\(\s*([^()]+?)\s*\)/gi, "√($1)");
  value = value.replace(/sqrt\s*([0-9A-Za-z]+)/gi, "√($1)");
  value = value.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  value = value.replace(/([A-Za-z0-9\)])\^\{([^{}]+)\}/g, "$1^$2");
  value = value.replace(/\\top\b/g, "T");
  value = replaceLatexReadableSymbols(value);

  value = replaceLatexReadableSymbols(value);
  value = value.replace(/\blim_\{([^{}]+)\}/gi, "lim as $1");
  value = readableMathSymbols(value);

  // Remove remaining command names and braces.
  value = value.replace(/\\[a-zA-Z]+/g, "");
  value = value.replace(/[{}]/g, "");
  value = value.replace(/\\/g, "");
  value = readableMathSymbols(value);
  value = value.replace(/\s+/g, " ").trim();
  return value;
}

export {
  cleanMindText,
  replaceLatexReadableSymbols
};
