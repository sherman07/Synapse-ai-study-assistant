import assert from "node:assert/strict";
import { ensureRenderableSummary, sectionsToMarkdown } from "../src/legacy/notesContent.js";

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

console.log("notes content regression passed");
