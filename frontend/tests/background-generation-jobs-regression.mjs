import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");
const exists = file => fs.existsSync(path.join(repoRoot, file));

const controller = read("frontend/src/legacy/controller.js");
const uploadController = read("frontend/src/legacy/controller_sections/01_uploadedfiles.js");
const historyController = read("frontend/src/legacy/controller_sections/09_togglesourceviewer.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const styles = read("frontend/styles/04-section.css");

assert.ok(
  controller.includes('"11_generationjobs.js"'),
  "legacy controller should load the central generation job store"
);
assert.ok(
  exists("frontend/src/legacy/controller_sections/11_generationjobs.js"),
  "generation job store module should exist"
);

const jobsController = read("frontend/src/legacy/controller_sections/11_generationjobs.js");

for (const token of [
  "GENERATION_JOBS_STORAGE_KEY",
  "queued",
  "analysing",
  "generating",
  "completed",
  "failed",
  "cancelled",
  "createGenerationJob",
  "findActiveGenerationJobByNoteId",
  "openGenerationJob",
  "cancelGenerationJob",
  "retryGenerationJob",
  "renderGenerationJobProgress"
]) {
  assert.ok(jobsController.includes(token), `generation job store should include ${token}`);
}

assert.ok(
  uploadController.includes("startGenerationJobFromCurrentUpload"),
  "Generate action should create or reopen a background job"
);
assert.ok(
  uploadController.includes("runGenerationJobAnalysis"),
  "existing /analyze request should run inside a job runner"
);
assert.ok(
  !uploadController.includes("setGeneratingState(true);"),
  "Generate action should not enter one global blocking loading state"
);
assert.ok(
  !uploadController.includes('appLayout.classList.add("loading-state");'),
  "generation button path should not apply the whole-page loading-state class"
);

assert.ok(
  historyController.includes("getVisibleGenerationJobs"),
  "history sidebar should merge active and failed generation jobs"
);
assert.ok(
  historyController.includes("renderGenerationJobHistoryItemHTML"),
  "history sidebar should render job status cards"
);
assert.ok(
  jobsController.includes("openGenerationJob"),
  "clicking a generating history row should reopen its progress view"
);

for (const token of [
  "openGenerationJob",
  "cancelGenerationJob",
  "retryGenerationJob"
]) {
  assert.ok(boot.includes(token), `boot should expose ${token}`);
}

assert.ok(styles.includes(".generation-job-panel"), "job progress panel should be styled");
assert.ok(styles.includes(".history-job-status"), "sidebar job status should be styled");
assert.ok(styles.includes(".history-job-retry"), "failed sidebar retry action should be styled");

console.log("background generation jobs regression passed");
