import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const layoutStyles = read("frontend/styles/01-section.css");
const themeStyles = read("frontend/styles/00-theme.css");
const index = read("frontend/index.html");

assert.match(
  layoutStyles,
  /\.app-layout\.generated-notes-state \.history-nav\s*\{\s*display:\s*none !important;/,
  "generated notes should hide the learning/history rail"
);

assert.match(
  layoutStyles,
  /\.app-layout\.generated-notes-state #summaryNav\s*\{\s*display:\s*none !important;/,
  "generated notes should hide the section-outline rail"
);

assert.doesNotMatch(
  layoutStyles,
  /#summaryNav:not\(\.collapsed\)\s*\{\s*display:\s*flex !important;/,
  "a more-specific outline rule must not restore the hidden rail"
);

assert.match(
  layoutStyles,
  /\.app-layout\.generated-notes-state\.assistant-closed[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  "generated notes should reclaim the full document width when the tutor is closed"
);

assert.ok(
  !themeStyles.includes(".app-layout.generated-notes-state.analysis-ready #summaryNav"),
  "laptop theme overrides must not restore the generated-note outline"
);

assert.ok(
  (index.match(/generated-notes-document-first-v2/g) || []).length === 2,
  "both workspace and theme stylesheet cache keys should ship the navigation removal"
);

console.log("generated notes navigation regression passed");
