import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadSectionPath = path.resolve(__dirname, "../src/legacy/controller_sections/01_uploadedfiles.js");
const uploadSource = fs.readFileSync(uploadSectionPath, "utf8");

assert.ok(
  uploadSource.includes("fullSummary = removeAutoBilingualHeadings(data.summary || \"\", outputLanguage);"),
  "main notes should be built from data.summary only"
);

assert.ok(
  uploadSource.includes("visualGalleryData = normalizeLearningFigures(data.visual_gallery || data.source_evidence_cards || data.figure_cards || data.visuals || []);"),
  "source evidence cards should be stored in separate visual gallery state"
);

assert.ok(
  uploadSource.includes("currentPrimarySourceIdentity = data.primary_source_identity || data.source_identity || \"\";"),
  "analysis response handling should accept both primary_source_identity and source_identity"
);

const renderStart = uploadSource.indexOf("function renderVisualGallery()");
assert.notEqual(renderStart, -1, "renderVisualGallery should exist");
const nextFunction = uploadSource.indexOf("\nfunction ", renderStart + 1);
const renderBody = uploadSource.slice(renderStart, nextFunction === -1 ? uploadSource.length : nextFunction);

assert.ok(
  renderBody.includes("visualGallery.classList.remove(\"d-none\")"),
  "source evidence cards should render in the dedicated visual gallery panel"
);
assert.ok(
  renderBody.includes("visual-gallery-head"),
  "visual gallery panel should use the dedicated source-evidence gallery layout"
);
assert.ok(
  !renderBody.includes("summaryContent"),
  "visual gallery rendering must not mutate the main notes markdown container"
);
assert.ok(
  !renderBody.includes("fullSummary"),
  "visual gallery rendering must not append source evidence cards into the summary string"
);

console.log("source evidence separation regression passed");
