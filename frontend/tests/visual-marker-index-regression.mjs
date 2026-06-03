import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const controllerPath = path.resolve(__dirname, "../src/legacy/controller_sections/01_uploadedfiles.js");
const controllerSource = fs.readFileSync(controllerPath, "utf8");
const start = controllerSource.indexOf("function sourceFigureText");
const end = controllerSource.indexOf("function cleanSourceFigureDisplayText");

assert.notEqual(start, -1, "sourceFigureText should exist");
assert.notEqual(end, -1, "cleanSourceFigureDisplayText should exist");

const visualHelpersSource = controllerSource.slice(start, end);
const makeHelpers = new Function(`
  let visualGalleryData = [];
  ${visualHelpersSource}
  return {
    setVisualGalleryData(items) {
      visualGalleryData = sanitizeLearningFigures(items);
    },
    getLearningFigureByMarker
  };
`);

const helpers = makeHelpers();
helpers.setVisualGalleryData([{
  index: 1,
  url: "data:image/png;base64,AA==",
  title: "Result table",
  what_shows: "A table with data, results, comparison groups, and statistical evidence.",
  visual_kind: "data/table"
}]);

assert.equal(helpers.getLearningFigureByMarker(0), null);
assert.equal(helpers.getLearningFigureByMarker(1)?.title, "Result table");

console.log("visual marker index regression passed");
