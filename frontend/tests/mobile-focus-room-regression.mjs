import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const focusCss = read("frontend/styles/09-focus-room.css");
const focusHtml = read("frontend/focus-room.html");

assert.match(focusCss, /@media \(max-width: 639px\)/);
assert.match(focusCss, /\.top-nav[\s\S]*safe-area-inset-top/);
assert.match(focusCss, /\.focus-tool-panel[\s\S]*safe-area-inset-bottom/);
assert.match(focusHtml, /styles\/10-responsive\.css/);

console.log("mobile focus room regression checks passed");
