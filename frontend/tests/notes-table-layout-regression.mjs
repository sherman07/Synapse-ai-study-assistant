import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesDir = path.resolve(__dirname, "../styles");
const tableCss = fs.readFileSync(path.join(stylesDir, "08-section.css"), "utf8");
const notesCss = fs.readFileSync(path.join(stylesDir, "02-section.css"), "utf8");

assert.match(
  tableCss,
  /\.markdown-table-wrap\s*\{[\s\S]*?max-width:\s*100%;[\s\S]*?box-sizing:\s*border-box;/,
  "markdown tables should stay contained by the note card border"
);
assert.match(
  tableCss,
  /\.markdown-table\s*\{[\s\S]*?min-width:\s*760px;[\s\S]*?table-layout:\s*auto;/,
  "wide study tables should keep readable columns and scroll inside the wrapper when needed"
);
assert.match(
  tableCss,
  /\.markdown-table td\s*\{[\s\S]*?overflow:\s*visible;[\s\S]*?overflow-wrap:\s*break-word;/,
  "table cells should show their content and wrap words instead of clipping"
);
assert.match(
  notesCss,
  /\.professional-section-body\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?max-width:\s*100%;/,
  "professional mode body content should align within the section box"
);

console.log("notes table layout regression passed");
