import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceViewerPath = path.resolve(__dirname, "../src/legacy/controller_sections/09_togglesourceviewer.js");
const source = fs.readFileSync(sourceViewerPath, "utf8");

assert.ok(
  source.includes("SOURCE_PREVIEW_TIMEOUT_MS"),
  "source preview should have a bounded request timeout"
);
assert.ok(
  source.includes("timeoutMs: SOURCE_PREVIEW_TIMEOUT_MS"),
  "source preview fetch should pass the timeout to the API client"
);
assert.ok(
  source.includes("readSourcePreviewJson"),
  "source preview should parse JSON through a guarded helper"
);
assert.ok(
  source.includes("Source preview returned"),
  "source preview should explain non-JSON backend responses"
);

console.log("source preview timeout regression passed");
