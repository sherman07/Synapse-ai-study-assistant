import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const controllerPath = path.resolve(__dirname, "../src/legacy/controller_sections/01_uploadedfiles.js");
const controllerSource = fs.readFileSync(controllerPath, "utf8");

assert.ok(
  controllerSource.includes('detailLevel: detailLevel ? detailLevel.value : "auto"'),
  "generation jobs should snapshot the user's selected detail level"
);
assert.ok(
  controllerSource.includes('formData.append("detail_level", detailLevelValue);'),
  "job runner should send the selected detail level to the backend"
);
assert.ok(
  !controllerSource.includes('formData.append("detail_level", "auto");'),
  "analyzeMaterials should not hard-code auto detail level"
);

console.log("detail level regression passed");
