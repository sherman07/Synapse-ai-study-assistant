import assert from "node:assert/strict";
import fs from "node:fs";

const cases = [
  ["03_rendertimeline.js", "generateTimeline", "isTimelineGenerating"],
  ["04_rendervisualguidelaunch.js", "generateVisualGuide", "isVisualGuideGenerating"],
  ["05_persistcurrentquiztohistory.js", "generateQuiz", "isQuizGenerating"],
  ["06_deleteflashcarddeck.js", "generateFlashcards", "isFlashcardGenerating"],
];

function functionSource(source, functionName) {
  const start = source.indexOf(`async function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should remain available to the legacy bridge`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Could not find the end of ${functionName}`);
}

for (const [fileName, functionName, flagName] of cases) {
  const source = fs.readFileSync(`frontend/src/legacy/controller_sections/${fileName}`, "utf8");
  const body = functionSource(source, functionName);
  const guardIndex = body.indexOf(`if (${flagName}) return;`);
  const mutationIndex = body.indexOf(`${flagName} = true;`);
  assert.notEqual(guardIndex, -1, `${functionName} should ignore duplicate generation while busy`);
  assert.notEqual(mutationIndex, -1, `${functionName} should set its in-flight flag`);
  assert.ok(guardIndex < mutationIndex, `${functionName} must guard before mutating generation state`);
}

console.log("study tool generation guard regression passed");
