import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const uploadStageSource = read("frontend/src/react/components/UploadStage.js");
const constantsSource = read("frontend/src/react/constants.js");
const uploadStylesPrimary = read("frontend/styles/01-section.css");
const uploadStylesSecondary = read("frontend/styles/04-section.css");

assert.ok(
  uploadStageSource.includes("Choose the language for notes, explanations, flashcards, and quizzes."),
  "Preferred output language should explain what content uses the selected language"
);
assert.ok(
  uploadStageSource.includes("Choose the response style Synapse should use for the generated notes."),
  "Prompt mode should explain what the selected mode changes"
);
assert.ok(
  constantsSource.includes("Builds academic argument, critical analysis, thesis statements, and essay-ready explanations from the source."),
  "Academic Analysis should define the requested short UI description"
);
assert.ok(
  uploadStageSource.includes('id: "promptModeDescription"'),
  "Upload stage should render a prompt-mode description under the select"
);
assert.ok(
  uploadStageSource.includes("Choose the target word range for modes that enforce a final output limit."),
  "Note length should explain the output length control"
);
assert.ok(
  uploadStageSource.includes('id: "noteLength"'),
  "Upload stage should expose the note-length select for source-restricted mode"
);
assert.ok(
  !uploadStageSource.includes("Adaptive learning depth"),
  "Upload stage should no longer show the adaptive learning depth card"
);
assert.ok(
  uploadStylesPrimary.includes(".language-note"),
  "Upload stage helper copy should have dedicated styling"
);
assert.ok(
  uploadStylesSecondary.includes(".prompt-mode-box"),
  "Prompt mode container styling should remain in place"
);
assert.ok(
  uploadStageSource.includes('id: "noteLengthField", className: "language-box prompt-mode-box note-length-box"'),
  "Upload stage should keep the note-length field visible in the main form"
);

console.log("upload stage form regression passed");
