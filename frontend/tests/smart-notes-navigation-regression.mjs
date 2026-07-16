import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGeneratedNoteNavigation } from "../src/legacy/notesNavigation.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const layoutCss = fs.readFileSync(path.join(repoRoot, "frontend/styles/01-section.css"), "utf8");
const responsiveCss = fs.readFileSync(path.join(repoRoot, "frontend/styles/04-section.css"), "utf8");

const generatedNotes = `# BUS115 Week 9

## 1. The money market: what it actually explains

Money demand and money supply determine the nominal interest rate.

### A useful distinction

Do not confuse this with the loanable-funds market.

## 2. Fractional-reserve banking in one chain

Banks retain reserves and lend the remainder.
`;

const entries = buildGeneratedNoteNavigation(generatedNotes, {
  "Big Picture": "A generic backend label that must not replace the generated heading.",
});

assert.deepEqual(
  entries.map(entry => entry.title),
  [
    "1. The money market: what it actually explains",
    "2. Fractional-reserve banking in one chain",
  ],
  "navigation should use the actual top-level generated note headings"
);

assert.match(
  layoutCss,
  /grid-template-columns:\s*clamp\(232px, 16vw, 280px\) minmax\(560px, 1fr\) clamp\(330px, 22vw, 400px\)/,
  "the desktop workspace should reserve a readable main column while both side panels are open"
);
assert.match(
  responsiveCss,
  /@media \(max-width: 1180px\) and \(min-width: 851px\)[\s\S]*?\.app-layout:not\(\.assistant-closed\)\s*\{\s*grid-template-columns: 220px minmax\(0, 1fr\);/,
  "at laptop widths, an open tutor should become a drawer instead of shrinking the generated notes"
);
assert.match(entries[0].markdown, /A useful distinction/, "each navigation item should retain its generated section content");

const fallback = buildGeneratedNoteNavigation("", {
  "Source-only overview": "Fallback content",
});
assert.deepEqual(
  fallback,
  [{ title: "Source-only overview", markdown: "Fallback content" }],
  "structured section data should remain a safe fallback when a summary has no headings"
);

console.log("smart notes navigation regression passed");
