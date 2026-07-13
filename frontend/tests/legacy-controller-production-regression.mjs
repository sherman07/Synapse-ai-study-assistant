import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const loaderSource = fs.readFileSync(
  path.join(repoRoot, "frontend", "src", "legacy", "loadLegacyController.js"),
  "utf8"
);
const copyRuntimeSource = fs.readFileSync(
  path.join(repoRoot, "scripts", "copy_frontend_runtime_assets.mjs"),
  "utf8"
);

assert.match(
  loaderSource,
  /function frontendRuntimeBaseUrl\(/,
  "the legacy controller must derive a public frontend base URL instead of its Vite bundle URL"
);
assert.match(
  loaderSource,
  /new URL\("src\/legacy\/controller\.js", frontendRuntimeBaseUrl\(\)\)/,
  "the browser must load the controller from a real static module URL"
);
assert.doesNotMatch(
  loaderSource,
  /new URL\("\.\/controller\.js", import\.meta\.url\)/,
  "Vite turns the old controller URL into a data URL, which breaks controller imports in production"
);
assert.match(
  copyRuntimeSource,
  /"src\/legacy"/,
  "the production build must publish the legacy controller modules and controller sections"
);

console.log("legacy controller production regression checks passed");
