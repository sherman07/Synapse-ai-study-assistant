import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadSectionPath = path.resolve(__dirname, "../src/legacy/controller_sections/01_uploadedfiles.js");
const visualSectionPath = path.resolve(__dirname, "../src/legacy/controller_sections/02_openvisualmodal.js");
const uploadSource = fs.readFileSync(uploadSectionPath, "utf8");
const visualSource = fs.readFileSync(visualSectionPath, "utf8");

assert.ok(
  uploadSource.includes("data.visual_gallery || data.visuals || []"),
  "analyzeMaterials should accept visual_gallery and visuals response aliases"
);
assert.ok(
  uploadSource.includes("visualGallery: compactVisualGalleryForStorage(visualGalleryData)"),
  "generated history entries should persist compact visual metadata"
);
assert.ok(
  visualSource.includes("visualGallery: compactVisualGalleryForStorage(visualGalleryData)"),
  "translated history entries should preserve compact visual metadata"
);
assert.ok(
  !uploadSource.includes("visualGallery: [],"),
  "generated history entries should not discard visual metadata"
);

console.log("history visual persistence regression passed");
