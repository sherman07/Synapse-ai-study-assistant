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
const appShellEntry = read("frontend/src/react/App.js");
const appShell = read("frontend/src/react/components/AppShell.js");
const analysisStage = read("frontend/src/react/components/AnalysisStage.js");
const styleRoot = read("frontend/style.css");
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
const backendApp = read("backend/app.py");
const backendBroadcastMode = read("backend/app_sections/13_broadcast_mode.py");
const studyTools = read("frontend/src/react/components/StudyTools.js");
const styles = read("frontend/styles/04-section.css");
const serverEnvExample = read("server/.env.example");
const backendEnvExample = read("backend/.env.example");
const geminiEnvExample = read("backend/.env.gemini.example");
const broadcastAssetVersion = "ai-broadcast-v8";

assert.ok(rootIndex.includes("frontend/landing.html"), "root index should keep the landing page as the public entry");
assert.ok(appShim.includes("frontend/index.html"), "app shim should open the study workspace frontend");
assert.ok(index.includes(broadcastAssetVersion), "workspace HTML should bust cached React shell assets");
assert.ok(styleRoot.includes('@import url("./styles/04-section.css");'), "root CSS should import broadcast styles");
assert.ok(main.includes(broadcastAssetVersion), "main module should bust cached React and controller loader imports");
assert.ok(appShellEntry.includes(broadcastAssetVersion), "React app entry should bust cached AppShell imports");
assert.ok(appShell.includes(broadcastAssetVersion), "AppShell should bust cached child component imports");
assert.ok(analysisStage.includes(`StudyTools.js?v=${broadcastAssetVersion}`), "AnalysisStage should bust cached StudyTools imports");
assert.ok(loader.includes(broadcastAssetVersion), "controller script URL should bust cached controller");
assert.ok(legacyController.includes(`CONTROLLER_VERSION = "${broadcastAssetVersion}"`), "legacy controller sections should use the broadcast cache key");
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
  "gpt-4o-mini-tts",
  "BROADCAST_TTS_PROVIDER",
  "openai",
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
  "setupBroadcastTool",
  "restartBroadcastPlayback",
  "seekBroadcastSection"
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
  "Calm study narrator",
  "Exam preparation coach",
  "Natural podcast style",
  "Deep explanation mode",
  "Quick revision mode",
  "gpt-5.4-mini",
  "gpt-4o-mini-tts",
  "collectBroadcastModeContext",
  "requestBroadcastModePackage",
  "replaceBroadcastJob",
  ".slice(0, 1)",
  'apiClient.fetch("/broadcast/generate"',
  'apiClient.fetch("/broadcast/realtime-call"',
  "speakerInstructions",
  "qualityChecks",
  "renderBroadcastSetupPanel",
  "renderBroadcastJobProgress",
  "renderBroadcastPlayer",
  "toggleBroadcastPlayback",
  "playBroadcastRealtime",
  "buildBroadcastRealtimeFormData",
  "requestBroadcastRealtimeSpeech",
  "output_modalities: [\"audio\"]",
  "handleBroadcastRealtimeEvent",
  "RTCPeerConnection",
  "openai-realtime",
  "restartBroadcastPlayback",
  "seekBroadcastSection",
  "Regenerate Broadcast",
  "Open Current Broadcast",
  "GPT Realtime speaker ready",
  "Play streams the broadcast through the same OpenAI Realtime voice stack as Voice Tutor.",
  "This source may not have enough content for a high-quality broadcast.",
  "Generate quiz from this broadcast",
  "Generate flashcards from this broadcast",
  "Open as Study Material"
]) {
  assert.ok(broadcastController.includes(token), `broadcast controller should include ${token}`);
}
assert.ok(!/response:\s*\{[\s\S]*?\n\s*modalities:\s*\["audio"\]/.test(broadcastController), "broadcast response events must use the current Realtime output_modalities field");

assert.ok(studyTools.includes("toolBtnBroadcast"), "Study tools should include AI Broadcast tab button");
assert.ok(studyTools.includes("toolPanelBroadcast"), "Study tools should include AI Broadcast panel");

for (const source of [serverEnvExample, backendEnvExample, geminiEnvExample]) {
  assert.ok(source.includes("BROADCAST_TTS_MODEL=gpt-4o-mini-tts"), "env examples should document OpenAI Broadcast TTS");
}
assert.ok(serverEnvExample.includes("BROADCAST_SCRIPT_MODEL=gpt-5.4-mini"), "server env should document the broadcast script model");
assert.ok(backendEnvExample.includes("BROADCAST_SCRIPT_MODEL=gpt-5.4-mini"), "backend env should document the broadcast script model");
assert.ok(backendEnvExample.includes("BROADCAST_TTS_PROVIDER=openai"), "backend env should document OpenAI TTS provider");
assert.ok(backendEnvExample.includes("OPENAI_REALTIME_MODEL=gpt-realtime-2"), "backend env should document the realtime speaker model");
assert.ok(backendEnvExample.includes("OPENAI_REALTIME_VOICE=marin"), "backend env should document the realtime speaker voice");

assert.ok(backendApp.includes('"13_broadcast_mode.py"'), "FastAPI app should load Broadcast Mode section");
for (const token of [
  '@app.post("/broadcast/generate")',
  '@app.post("/broadcast/tts")',
  '@app.post("/broadcast/realtime-call")',
  "BROADCAST_SPEAKER_INSTRUCTIONS",
  "gpt-4o-mini-tts",
  "REALTIME_MODEL",
  "REALTIME_VOICE",
  "https://api.openai.com/v1/realtime/calls",
  "Generated Synapse content package",
  "Do not create a generic podcast",
  "split_broadcast_script_for_tts",
  "client.audio.speech.create",
  "qualityChecks"
]) {
  assert.ok(backendBroadcastMode.includes(token), `backend Broadcast Mode should include ${token}`);
}

for (const token of [
  ".broadcast-setup-card",
  ".broadcast-player-card",
  ".history-broadcast-status",
  ".broadcast-chapter-list",
  ".broadcast-transcript",
  ".broadcast-voice-direction"
]) {
  assert.ok(styles.includes(token), `broadcast styles should include ${token}`);
}
assert.ok(styles.includes(".broadcast-transcript article.is-playing"), "broadcast styles should highlight the active transcript line");

console.log("ai broadcast regression passed");
