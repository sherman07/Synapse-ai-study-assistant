import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const workspaceCss = read("frontend/style.css");
const responsiveCss = read("frontend/styles/10-responsive.css");
const indexHtml = read("frontend/index.html");

assert.match(workspaceCss, /@import url\("\.\/styles\/10-responsive\.css"\);/);
assert.match(responsiveCss, /safe-area-inset-bottom/);
assert.match(responsiveCss, /@media \(pointer: coarse\)/);
assert.match(responsiveCss, /min-height:\s*44px/);
assert.match(indexHtml, /viewport-fit=cover/);

console.log("responsive foundations regression checks passed");
