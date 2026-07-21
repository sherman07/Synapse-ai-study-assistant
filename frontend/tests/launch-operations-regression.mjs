import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const blueprint = read("render.yaml");
const backend = read("backend/app.py");
const keepWarmPath = path.join(repoRoot, "scripts/keep_render_warm.mjs");

assert.ok(fs.existsSync(keepWarmPath), "keep-warm script should exist");
const keepWarm = read("scripts/keep_render_warm.mjs");

for (const token of [
  "type: cron",
  "name: synapse-analysis-keep-warm",
  'schedule: "*/10 * * * *"',
  "node scripts/keep_render_warm.mjs",
  "SYNAPSE_KEEP_WARM_URL",
  "https://synapse-ai-backend-idnc.onrender.com/healthz"
]) {
  assert.ok(blueprint.includes(token), `Render Blueprint should include ${token}`);
}

assert.ok(keepWarm.includes("AbortSignal.timeout(20000)"), "keep-warm request should have a 20-second timeout");
assert.ok(keepWarm.includes("response.ok"), "keep-warm should fail on non-2xx responses");
assert.ok(keepWarm.includes("process.exitCode = 1"), "keep-warm failures should be visible to Render");

for (const route of [
  '@app.post("/billing/checkout")',
  '@app.post("/billing/portal")',
  '@app.post("/billing/webhook")'
]) {
  assert.ok(!backend.includes(route), `FastAPI should no longer register ${route}`);
}

assert.ok(
  backend.includes('@app.post("/account/delete")'),
  "billing cleanup should preserve the existing account deletion endpoint"
);

console.log("launch operations regression passed");
