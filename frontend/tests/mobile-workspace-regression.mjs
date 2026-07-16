import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const workspaceCss = read("frontend/styles/04-section.css");
const toolsCss = read("frontend/styles/07-section.css");

assert.match(workspaceCss, /\.mobile-topbar[\s\S]*safe-area-inset-left/);
assert.match(workspaceCss, /\.notes-area[\s\S]*safe-area-inset-bottom/);
assert.match(workspaceCss, /\.mobile-offcanvas[\s\S]*safe-area-inset-bottom/);
assert.match(toolsCss, /@media \(max-width: 639px\)/);
assert.match(toolsCss, /\.broadcast-player-controls[\s\S]*align-items:\s*stretch/);

console.log("mobile workspace regression checks passed");
