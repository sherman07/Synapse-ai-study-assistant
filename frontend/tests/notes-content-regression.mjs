import assert from "node:assert/strict";
import { ensureRenderableSummary, sectionsToMarkdown } from "../src/legacy/notesContent.js";
import { cleanReadableSectionTitle } from "../src/legacy/sectionUtils.js";

const sectionMap = {
  "Learning Question": "What is animal cognition?",
  "Core Notes": "Comparative psychology studies cognition across species."
};

assert.equal(
  ensureRenderableSummary("# Existing\n\nKeep this.", sectionMap),
  "# Existing\n\nKeep this."
);

assert.equal(
  ensureRenderableSummary("", sectionMap),
  [
    "## Learning Question",
    "",
    "What is animal cognition?",
    "",
    "## Core Notes",
    "",
    "Comparative psychology studies cognition across species."
  ].join("\n")
);

assert.equal(sectionsToMarkdown({ Empty: "   " }), "");
assert.equal(cleanReadableSectionTitle("Source evidence / example matrix"), "Worked Examples and Evidence");

console.log("notes content regression passed");
