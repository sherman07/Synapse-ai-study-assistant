import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const css = fs.readFileSync(path.join(repoRoot, "frontend/styles/04-section.css"), "utf8");
const index = fs.readFileSync(path.join(repoRoot, "frontend/index.html"), "utf8");
const style = fs.readFileSync(path.join(repoRoot, "frontend/style.css"), "utf8");
const historyController = fs.readFileSync(path.join(repoRoot, "frontend/src/legacy/controller_sections/09_togglesourceviewer.js"), "utf8");

assert.ok(css.includes(".app-layout.loading-state .history-nav"));

const loadingHistoryBlock = css.match(/\.app-layout\.loading-state \.history-nav\s*\{[^}]+\}/)?.[0] || "";
assert.ok(loadingHistoryBlock.includes("display: block"));
assert.ok(!loadingHistoryBlock.includes("pointer-events: none"));

const hiddenLoadingBlock = css.match(/\.loading-state #summaryNav,[^}]+\}/)?.[0] || "";
assert.ok(!hiddenLoadingBlock.includes(".history-nav"));

const loadingNotesBlock = css.match(/\.app-layout\.loading-state \.notes-area\s*\{[^}]+\}/)?.[0] || "";
assert.ok(loadingNotesBlock.includes("margin-left: 300px"));
assert.ok(loadingNotesBlock.includes("width: calc(100% - 300px)"));

assert.ok(index.includes("style.css?v=ai-broadcast-v7"));
assert.ok(style.includes("04-section.css?v=ai-broadcast-v7"));
assert.ok(style.includes("07-section.css?v=ai-broadcast-v7"));
assert.ok(historyController.includes('onclick="loadHistoryEntry'));

console.log("loading history navigation regression passed");
