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
const languageOptionsSource = read("frontend/src/react/components/LanguageOptions.js");
const constantsSource = read("frontend/src/react/constants.js");
const uploadStylesPrimary = read("frontend/styles/01-section.css");
const uploadStylesSecondary = read("frontend/styles/04-section.css");

assert.ok(
  uploadStageSource.includes("Choose the language for notes, explanations, image guides, flashcards, and quizzes."),
  "Preferred output language should explain what content uses the selected language"
);
assert.ok(
  languageOptionsSource.includes("Auto (English default)"),
  "Language selector should show that Auto generates English by default"
);
assert.ok(
  uploadStageSource.includes("Choose the response style Synapse should use for the generated notes."),
  "Prompt mode should explain what the selected mode changes"
);
assert.ok(
  constantsSource.includes("Goes beyond the source to explain deeper meaning, useful background knowledge, concept connections, application, mistakes, and high-quality student thinking."),
  "Professional Mode should define the requested short UI description"
);
assert.ok(
  uploadStageSource.includes('id: "promptModeDescription"'),
  "Upload stage should render a prompt-mode description under the select"
);
assert.ok(
  uploadStageSource.includes("Choose how deeply Synapse studies and explains the uploaded material."),
  "AI study depth should explain content-depth control"
);
assert.ok(
  uploadStageSource.includes("AI study depth"),
  "Upload stage should label the control as AI study depth"
);
assert.ok(
  !uploadStageSource.includes("Choose the target word range"),
  "Upload stage should not describe depth as a word-range control"
);
assert.ok(
  !uploadStageSource.includes("Note length"),
  "Upload stage should not label the depth control as note length"
);
assert.ok(
  !constantsSource.match(/\b\d{3,4}-\d{3,4} words\b/),
  "Study depth options should not promise word ranges"
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
