import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readableMathPath = path.resolve(__dirname, "../src/legacy/readableMath.js");
const mathMarkdownPath = path.resolve(__dirname, "../src/legacy/mathMarkdown.js");
const rendererPath = path.resolve(__dirname, "../src/legacy/markdownRenderer.js");
const readableMathSource = fs
  .readFileSync(readableMathPath, "utf8")
  .replace(/\nexport\s+\{[\s\S]*?\};\s*$/, "");
const mathMarkdownSource = fs
  .readFileSync(mathMarkdownPath, "utf8")
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+\"\.\/readableMath\.js\";\s*/, "")
  .replace(/\nexport\s+\{[\s\S]*?\};\s*$/, "");
const rendererSource = fs
  .readFileSync(rendererPath, "utf8")
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+\"\.\/readableMath\.js\";\s*/, "")
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+\"\.\/mathMarkdown\.js\";\s*/, "")
  .replace(/\nexport\s+\{[\s\S]*?\};\s*$/, "");
const source = `${readableMathSource}\n\n${mathMarkdownSource}\n\n${rendererSource}`;

const makeRenderer = new Function(
  "window",
  "document",
  `
  ${source}
  configureMarkdownRenderer({
    getLearningFigureByMarker: () => null,
    renderInlineVisualReference: () => "",
    renderInlineVisualCard: () => ""
  });
  return { markdownToHTML, prepareMathMarkdown, splitMarkdownTableCells };
  `
);

const documentStub = {
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ dataset: {}, addEventListener() {} }),
  head: { appendChild() {} }
};

const { markdownToHTML } = makeRenderer(
  { addEventListener() {}, SYNAPSE_DESMOS_API_KEY: "" },
  documentStub
);

const cases = [
  {
    name: "readable word fraction",
    input: "Starting point: gradient = rise/run for linear functions.",
    must: ["\\frac{rise}{run}"],
    not: ["rise/run"]
  },
  {
    name: "difference quotient with Delta",
    input: "Use [f(x + \u0394x) - f(x)] / \u0394x.",
    must: ["\\frac{f(x+\\Delta x)-f(x)}{\\Delta x}"],
    not: ["[f(x + \u0394x)"]
  },
  {
    name: "nested parenthesis quotient",
    input: "Use (f(x+h)-f(x))/h for first principles.",
    must: ["\\frac{f(x+h)-f(x)}{h}"],
    not: ["(f(x+h)-f(x))/h"]
  },
  {
    name: "Delta limit",
    input: "Take the limit as \u0394x -> 0.",
    must: ["\\Delta x \\to 0"],
    not: ["\u0394x -> 0"]
  },
  {
    name: "merged prose around notation",
    input: "Notation: Leibniz (d/dx) vsLagrange(f'(x)); bothrepresent the derivative.",
    must: ["vs Lagrange", "both represent", "\\frac{d}{dx}", "f'(x)"],
    not: ["vsLagrange", "bothrepresent", "d/dx) vs"]
  },
  {
    name: "polynomial exponent range",
    input: "Use x^2+2x+1 as the function.",
    must: ["x^{2}+2x+1"],
    not: ["x^{2+2x}"]
  },
  {
    name: "negative exponent",
    input: "Important caveat: x^-1 is handled separately.",
    must: ["x^{-1}"],
    not: ["x^{-1is}"]
  },
  {
    name: "parenthesized exponent",
    input: "For n^(n-1), subtract one from the exponent.",
    must: ["n^{n-1}"],
    not: ["n^(n-1)"]
  },
  {
    name: "absolute value in prose",
    input: "Solve |x| \u2264 1.",
    must: ["\\lvert x \\rvert \\le 1"],
    not: ["|x| \u2264 1"]
  },
  {
    name: "absolute value in table",
    input: "| Case | Formula |\n| --- | --- |\n| abs | |x| \u2264 1 |",
    must: ["\\lvert x \\rvert \\le 1"],
    not: ["<td>\u2264 1</td>"]
  },
  {
    name: "log absolute value in table",
    input: "| Case | Formula |\n| --- | --- |\n| log | ln|x| + C |",
    must: ["\\ln\\lvert x \\rvert+C"],
    not: ["<td>+ C</td>"]
  },
  {
    name: "double escaped inline delimiters",
    input: String.raw`Solve \\(\\frac{1}{1+y^2}\\,dy=x\\,dx\\).`,
    must: ["\\(\\frac{1}{1+y^2}\\,dy=x\\,dx\\)"],
    not: [String.raw`\\(`, String.raw`\\frac`, String.raw`\\)`]
  },
  {
    name: "double escaped display delimiters",
    input: String.raw`\\[\\int \\frac{1}{1+y^2}\\,dy = \\arctan(y) + C\\]`,
    must: ["\\[\\int \\frac{1}{1+y^2}\\,dy = \\arctan(y) + C\\]"],
    not: [String.raw`\\[`, String.raw`\\int`, String.raw`\\frac`]
  },
  {
    name: "quad arrow cleanup",
    input: String.raw`\\quad=>\\quad`,
    must: ["⇒"],
    not: [String.raw`\quad`, String.raw`=>`]
  },
  {
    name: "space between math and prose",
    input: String.raw`Notation: Leibniz \\(\\frac{d}{dx}\\)vsLagrange\\(f'(x)\\); bothrepresent the derivative.`,
    must: ["\\(\\frac{d}{dx}\\) vs Lagrange \\(f'(x)\\)", "both represent"],
    not: [")vs", "Lagrange\\(", "bothrepresent"]
  },
  {
    name: "double escaped table math",
    input: String.raw`| Concept | Result |
| --- | --- |
| inverse trig | Integrate \\(\\frac{1}{1+y^2}\\) to get \\(\\arctan(y)\\). |`,
    must: ["\\(\\frac{1}{1+y^2}\\)", "\\(\\arctan(y)\\)"],
    not: ["@@AUTO_INLINE_MATH", String.raw`\\(`, String.raw`\\frac`]
  },
  {
    name: "matrix",
    input: "A = [[1,2],[3,4]] and det(A)= -2.",
    must: ["\\begin{bmatrix}1", "3 &amp; 4\\end{bmatrix}", "\\det(A)"],
    not: ["[[1,2]"]
  },
  {
    name: "currency does not break later math",
    input: "The book costs $50 and $x$ is the variable; slope = rise/run.",
    must: ["$50", "\\(x\\)", "\\frac{rise}{run}"],
    not: ["\\(50 and"]
  },
  {
    name: "URLs stay text",
    input: "Source: https://example.com/a/b?x=1 and f(x)=x^2.",
    must: ["https://example.com/a/b?x=1", "f(x)=x^{2}"],
    not: ["\\frac{https:"]
  },
  {
    name: "display equation does not graph by default",
    input: "$$f(x)=x^2+2x+1$$",
    must: ["\\[f(x)=x^2+2x+1\\]"],
    not: ["desmos-card", "x^{2+2x}"]
  },
  {
    name: "explicit graph context gets graph hook",
    input: "Graph this function:\n$$f(x)=x^2+2x+1$$",
    must: ["desmos-card", "y=x^{2}+2x+1"],
    not: ["x^{2+2x}"]
  }
];

let failures = 0;

for (const testCase of cases) {
  const output = markdownToHTML(testCase.input);
  const missing = (testCase.must || []).filter(fragment => !output.includes(fragment));
  const forbidden = (testCase.not || []).filter(fragment => output.includes(fragment));
  if (missing.length || forbidden.length) {
    failures += 1;
    console.error(`FAIL ${testCase.name}`);
    if (missing.length) console.error("  missing:", missing.join(", "));
    if (forbidden.length) console.error("  forbidden:", forbidden.join(", "));
    console.error(output);
  } else {
    console.log(`PASS ${testCase.name}`);
  }
}

if (failures) {
  process.exit(1);
}
