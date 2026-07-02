import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");
const exists = file => fs.existsSync(path.join(repoRoot, file));

const requiredFiles = [
  "server/src/repositories/broadcastJobsRepository.js",
  "server/src/routes/broadcastJobs.js",
  "frontend/src/legacy/controller_sections/12_broadcastjobs.js"
];

for (const file of requiredFiles) {
  assert.ok(exists(file), `${file} should exist`);
}

const app = read("server/src/app.js");
const index = read("frontend/index.html");
const rootIndex = read("index.html");
const appShim = read("app.html");
const main = read("frontend/src/main.js");
const loader = read("frontend/src/legacy/loadLegacyController.js");
const mysqlSchema = read("server/src/db/schema.sql");
const supabaseSchema = read("server/src/db/supabase-schema.sql");
const repository = read("server/src/repositories/broadcastJobsRepository.js");
const routes = read("server/src/routes/broadcastJobs.js");
const dataClient = read("frontend/src/legacy/dataApiClient.js");
const legacyController = read("frontend/src/legacy/controller.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const reset = read("frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js");
const history = read("frontend/src/legacy/controller_sections/09_togglesourceviewer.js");
const broadcastController = read("frontend/src/legacy/controller_sections/12_broadcastjobs.js");
const studyTools = read("frontend/src/react/components/StudyTools.js");
const styles = read("frontend/styles/04-section.css");

assert.ok(rootIndex.includes("frontend/landing.html"), "root index should keep the landing page as the public entry");
assert.ok(appShim.includes("frontend/index.html"), "app shim should open the study workspace frontend");
assert.ok(index.includes("ai-broadcast-v2"), "workspace HTML should bust cached React shell assets");
assert.ok(main.includes("ai-broadcast-v2"), "main module should bust cached React and controller loader imports");
assert.ok(loader.includes("ai-broadcast-v2"), "controller loader should bust cached legacy controller scripts");
assert.ok(app.includes('"/api/broadcast-jobs"'), "Express app should mount broadcast job routes");

assert.ok(mysqlSchema.includes("CREATE TABLE IF NOT EXISTS broadcast_jobs"), "MySQL schema should create broadcast_jobs");
assert.ok(supabaseSchema.includes("broadcast_jobs"), "Supabase schema should create broadcast_jobs");

for (const token of [
  "script_model",
  "tts_provider",
  "tts_model",
  "transcript_json",
  "chapters_json",
  "source_references_json",
  "audio_metadata_json"
]) {
  assert.ok(mysqlSchema.includes(token), `MySQL schema should include ${token}`);
  assert.ok(supabaseSchema.includes(token), `Supabase schema should include ${token}`);
}

for (const token of [
  "BROADCAST_SCRIPT_MODEL",
  "gpt-5.4-mini",
  "BROADCAST_TTS_MODEL",
  "gemini-2.5-pro-tts",
  "queued",
  "planning",
  "scripting",
  "validating",
  "generating_audio",
  "completed",
  "failed",
  "cancelled",
  "createBroadcastJob",
  "listBroadcastJobs",
  "getBroadcastJob",
  "cancelBroadcastJob",
  "retryBroadcastJob",
  "deleteBroadcastJob"
]) {
  assert.ok(repository.includes(token), `broadcast repository should include ${token}`);
}

for (const token of [
  'router.post("/",',
  'router.get("/",',
  'router.get("/:id",',
  'router.post("/:id/cancel",',
  'router.post("/:id/retry",',
  'router.delete("/:id",'
]) {
  assert.ok(routes.includes(token), `broadcast routes should include ${token}`);
}

for (const token of [
  "createBroadcastJobInDataApi",
  "fetchBroadcastJobsFromDataApi",
  "fetchBroadcastJobFromDataApi",
  "cancelBroadcastJobInDataApi",
  "retryBroadcastJobInDataApi",
  "deleteBroadcastJobFromDataApi"
]) {
  assert.ok(dataClient.includes(token), `data API client should export ${token}`);
}

assert.ok(legacyController.includes('"12_broadcastjobs.js"'), "legacy controller should load broadcast jobs module");
assert.ok(history.includes("getVisibleBroadcastJobs"), "history sidebar should merge broadcast jobs");
assert.ok(history.includes("renderBroadcastJobHistoryItemHTML"), "history sidebar should render broadcast cards");

for (const token of [
  "openAiBroadcastSetup",
  "generateBroadcastFromSetup",
  "openBroadcastJob",
  "cancelBroadcastJob",
  "retryBroadcastJob",
  "deleteBroadcastJob",
  "recoverBroadcastJobsOnBoot",
  "setupBroadcastTool"
]) {
  assert.ok(boot.includes(token), `boot should expose ${token}`);
}

assert.ok(boot.includes("setupBroadcastTool();"), "boot should install the AI Broadcast tool dynamically");
assert.ok(reset.includes("setupBroadcastTool();"), "workspace reset should restore the AI Broadcast tool");

for (const token of [
  "BROADCAST_JOBS_STORAGE_KEY",
  "AI Broadcast",
  "function setupBroadcastTool()",
  "toolBtnBroadcast",
  "toolPanelBroadcast",
  "Study Podcast",
  "Exam Revision",
  "Deep Explanation",
  "Quick Recap",
  "Debate / Two Perspectives",
  "Interview Style",
  "gpt-5.4-mini",
  "gemini-2.5-pro-tts",
  "renderBroadcastSetupPanel",
  "renderBroadcastJobProgress",
  "renderBroadcastPlayer",
  "This source may not have enough content for a high-quality broadcast.",
  "Generate quiz from this broadcast",
  "Generate flashcards from this broadcast",
  "Open as Study Material"
]) {
  assert.ok(broadcastController.includes(token), `broadcast controller should include ${token}`);
}

assert.ok(studyTools.includes("toolBtnBroadcast"), "Study tools should include AI Broadcast tab button");
assert.ok(studyTools.includes("toolPanelBroadcast"), "Study tools should include AI Broadcast panel");

for (const token of [
  ".broadcast-setup-card",
  ".broadcast-player-card",
  ".history-broadcast-status",
  ".broadcast-chapter-list",
  ".broadcast-transcript"
]) {
  assert.ok(styles.includes(token), `broadcast styles should include ${token}`);
}

console.log("ai broadcast regression passed");
