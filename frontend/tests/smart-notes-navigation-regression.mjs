import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGeneratedNoteNavigation } from "../src/legacy/notesNavigation.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const layoutCss = fs.readFileSync(path.join(repoRoot, "frontend/styles/01-section.css"), "utf8");
const themeCss = fs.readFileSync(path.join(repoRoot, "frontend/styles/00-theme.css"), "utf8");
const responsiveCss = fs.readFileSync(path.join(repoRoot, "frontend/styles/04-section.css"), "utf8");
const navigationController = fs.readFileSync(path.join(repoRoot, "frontend/src/legacy/controller_sections/02_openvisualmodal.js"), "utf8");
const analysisController = fs.readFileSync(path.join(repoRoot, "frontend/src/legacy/controller_sections/01_uploadedfiles.js"), "utf8");
const resetController = fs.readFileSync(path.join(repoRoot, "frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js"), "utf8");

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
assert.equal(
  entries[0].anchor,
  "section-1-the-money-market-what-it-actually-explains",
  "top-level headings should receive stable anchors for in-page navigation"
);
assert.deepEqual(
  entries[0].children.map(child => child.title),
  ["A useful distinction"],
  "a section should expose its nested headings for the disclosure menu"
);

const continuationHeadingNote = `## 1. Big Picture\nOverview.\n\n## 2. The Exam Will Probably Test These Ideas\n### Likely exam questions in natural wording\n## Key Terms and Mechanisms\n### Question-level mechanisms\n\n## 3. What You Actually Need To Understand\nCore understanding.`;
const continuationEntries = buildGeneratedNoteNavigation(continuationHeadingNote);
assert.deepEqual(
  continuationEntries.map(entry => entry.title),
  [
    "1. Big Picture",
    "2. The Exam Will Probably Test These Ideas",
    "3. What You Actually Need To Understand",
  ],
  "unnumbered continuation headings must not become new top-level sections"
);
assert.deepEqual(
  continuationEntries[1].children.map(child => child.title),
  ["Likely exam questions in natural wording", "Key Terms and Mechanisms"],
  "continuation headings should remain under the numbered section they explain"
);
assert.deepEqual(
  continuationEntries[1].children[1].children.map(child => child.title),
  ["Question-level mechanisms"],
  "headings below a continuation heading should remain nested under that heading"
);
assert.match(
  themeCss,
  /html\[data-theme="dark"\] \.notes-card[\s\S]*?background: var\(--color-surface-primary\)/,
  "generated note cards must adopt a readable dark surface instead of the light renderer default"
);
assert.match(
  themeCss,
  /html\[data-theme="dark"\] \.summary-content h1[\s\S]*?color: var\(--color-text-primary\)/,
  "generated note headings must use the dark theme text token"
);
assert.match(
  navigationController,
  /section-nav-toggle[\s\S]*?aria-expanded/,
  "sections with nested headings should provide a separate disclosure control"
);
assert.match(
  navigationController,
  /navigateToGeneratedHeading\(/,
  "the section label should navigate the full generated note instead of replacing it with a fragment"
);
assert.match(
  navigationController,
  /createSectionButton\(child, isMobile, depth \+ 1\)/,
  "nested headings should render as recursive navigation groups"
);
assert.match(
  analysisController,
  /appLayout\.classList\.add\([^;]*"generated-notes-state"\)/,
  "opening generated notes must set a dedicated navigation state"
);
assert.match(
  layoutCss,
  /\.app-layout\.generated-notes-state \.history-nav\s*\{\s*display: none !important;/,
  "the home history rail must be forcibly hidden in a generated class"
);
assert.match(
  layoutCss,
  /\.app-layout\.generated-notes-state #summaryNav\s*\{\s*display: block !important;/,
  "the generated-note title rail must remain visible in a generated class"
);
assert.match(
  resetController,
  /classList\.remove\([^;]*"generated-notes-state"\)/,
  "returning home must clear the generated-only navigation state"
);

const fallback = buildGeneratedNoteNavigation("", {
  "Source-only overview": "Fallback content",
});
assert.deepEqual(
  fallback,
  [{ title: "Source-only overview", markdown: "Fallback content", anchor: "section-source-only-overview", children: [] }],
  "structured section data should remain a safe fallback when a summary has no headings"
);

console.log("smart notes navigation regression passed");
