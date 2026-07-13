import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const style = fs.readFileSync(path.join(repoRoot, "frontend/style.css"), "utf8");

for (const cssName of [
  "04-section.css",
  "07-section.css",
  "08-section.css",
  "09-focus-room.css",
]) {
  assert.ok(
    style.includes(`@import url("./styles/${cssName}");`),
    `Vite workspace stylesheet import must be query-free: ${cssName}`,
  );
}

assert.doesNotMatch(
  style,
  /@import url\("\.\/styles\/(?:04|07|08|09-[^)]+\.css)\?[^)]*"\);/,
  "local CSS imports must not carry query strings that Vite leaves unresolved",
);

console.log("Vite CSS import regression passed");
