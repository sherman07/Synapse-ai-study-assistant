import assert from "node:assert/strict";
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
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+\"\.\/readableMath\.js(?:\?[^"]*)?\";\s*/, "")
  .replace(/\nexport\s+\{[\s\S]*?\};\s*$/, "");
const rendererSource = fs
  .readFileSync(rendererPath, "utf8")
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+\"\.\/readableMath\.js(?:\?[^"]*)?\";\s*/, "")
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+\"\.\/mathMarkdown\.js(?:\?[^"]*)?\";\s*/, "")
  .replace(/\nexport\s+\{[\s\S]*?\};\s*$/, "");
const source = `${readableMathSource}\n\n${mathMarkdownSource}\n\n${rendererSource}`;

const makeRenderer = new Function(
  "window",
  "document",
  `
  ${source}
  configureMarkdownRenderer({
    getLearningFigureByMarker: index => index === 0 ? { index: 0, url: "data:image/png;base64,AA==", title: "Result table" } : null,
    renderInlineVisualCard: index => '<figure data-visual-card="' + index + '"></figure>',
    renderInlineVisualReference: (index, shownIndex) => '<p data-visual-ref="' + index + ':' + shownIndex + '"></p>'
  });
  return { markdownToHTML };
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

const html = markdownToHTML([
  "The source table gives the evidence.",
  "",
  "[[VISUAL:0]]",
  "",
  "The same table matters again.",
  "",
  "[[VISUAL:0]]"
].join("\n"));

assert.equal((html.match(/data-visual-card=/g) || []).length, 1);
assert.equal((html.match(/data-visual-ref=/g) || []).length, 1);
assert.ok(!html.includes("[[VISUAL:0]]"));

console.log("visual marker regression passed");
