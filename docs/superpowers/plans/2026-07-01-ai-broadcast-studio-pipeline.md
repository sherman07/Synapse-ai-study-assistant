# AI Broadcast Studio Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first durable, high-quality AI Broadcast slice with persisted jobs, model defaults, sidebar/progress/player UI, and a transcript-first fallback when real Gemini TTS is unavailable.

**Architecture:** Add broadcast jobs as a first-class data API domain beside generated content and flashcards. The frontend adds an AI Broadcast setup/player surface that can create local fallback jobs immediately and call the data API when available. The AI pipeline is represented as a deterministic studio package first, with explicit `gpt-5.4-mini` script and `gemini-2.5-pro-tts` voice metadata so provider-backed generation can replace the placeholder path cleanly.

**Tech Stack:** Express data API, MySQL/Supabase schema files, vanilla legacy controller modules, React shell components, Node static regression tests.

---

## File Structure

- Create `frontend/tests/ai-broadcast-regression.mjs`: static regression covering backend route/schema/repository/client plus frontend setup/sidebar/player wiring.
- Create `server/src/repositories/broadcastJobsRepository.js`: user-scoped broadcast job persistence, normalization, default models, status transitions, and JSON mapping.
- Create `server/src/routes/broadcastJobs.js`: REST API for create/list/get/cancel/retry/delete.
- Modify `server/src/app.js`: mount `/api/broadcast-jobs`.
- Modify `server/src/db/schema.sql`: add MySQL `broadcast_jobs`.
- Modify `server/src/db/supabase-schema.sql`: add Supabase `broadcast_jobs`, indexes, grants, and RLS.
- Modify `frontend/src/legacy/dataApiClient.js`: add broadcast job client helpers.
- Create `frontend/src/legacy/controller_sections/12_broadcastjobs.js`: local broadcast setup, job store, progress view, transcript-first player, retry/cancel/delete/regenerate hooks.
- Modify `frontend/src/legacy/controller.js`: load broadcast controller and pass data API helpers.
- Modify `frontend/src/legacy/controller_sections/09_togglesourceviewer.js`: merge broadcast job cards into history sidebar.
- Modify `frontend/src/legacy/controller_sections/99_boot.js`: expose broadcast functions and recover jobs on boot.
- Modify `frontend/src/react/components/StudyTools.js`: add AI Broadcast tab and setup/player container.
- Modify `frontend/styles/04-section.css`: add liquid-glass compatible broadcast job/setup/player styles.

## Task 1: Red Test For Broadcast Contract

**Files:**
- Create: `frontend/tests/ai-broadcast-regression.mjs`

- [ ] **Step 1: Write the failing test**

Create a static regression test that asserts:

- Broadcast repository, route, and legacy controller module exist.
- Express mounts `/api/broadcast-jobs`.
- MySQL and Supabase schemas include `broadcast_jobs` and durable result/model fields.
- Repository includes `BROADCAST_SCRIPT_MODEL`, `gpt-5.4-mini`, `BROADCAST_TTS_MODEL`, `gemini-2.5-pro-tts`, statuses, and CRUD functions.
- Routes include create/list/get/cancel/retry/delete handlers.
- Data API client exports create/list/get/cancel/retry/delete helpers.
- Legacy loader includes `12_broadcastjobs.js`.
- History sidebar renders visible broadcast jobs.
- Boot exposes broadcast functions.
- Broadcast controller includes setup options, player, transcript-first fallback, model metadata, and follow-up actions.
- StudyTools includes `toolBtnBroadcast` and `toolPanelBroadcast`.
- Styles include setup, player, sidebar, chapter, and transcript selectors.

- [ ] **Step 2: Run test to verify it fails**

Run: `source scripts/use_local_node.sh && node frontend/tests/ai-broadcast-regression.mjs`

Expected: FAIL because `server/src/repositories/broadcastJobsRepository.js` does not exist.

## Task 2: Backend Broadcast Persistence And Routes

**Files:**
- Create: `server/src/repositories/broadcastJobsRepository.js`
- Create: `server/src/routes/broadcastJobs.js`
- Modify: `server/src/app.js`
- Modify: `server/src/db/schema.sql`
- Modify: `server/src/db/supabase-schema.sql`
- Test: `frontend/tests/ai-broadcast-regression.mjs`

- [ ] **Step 1: Add repository, routes, schema, and app mount**

Implement a broadcast repository following generated-content and flashcard repository patterns. Use environment defaults:

```js
const BROADCAST_SCRIPT_MODEL = process.env.BROADCAST_SCRIPT_MODEL || "gpt-5.4-mini";
const BROADCAST_TTS_PROVIDER = process.env.BROADCAST_TTS_PROVIDER || "gemini";
const BROADCAST_TTS_MODEL = process.env.BROADCAST_TTS_MODEL || "gemini-2.5-pro-tts";
```

Use persisted statuses:

```js
const BROADCAST_STATUSES = new Set([
  "queued",
  "extracting_source",
  "planning",
  "scripting",
  "validating",
  "generating_audio",
  "building_audio",
  "completed",
  "failed",
  "cancelled"
]);
```

Add route handlers for create/list/get/cancel/retry/delete and mount them in `server/src/app.js` at `/api/broadcast-jobs`.

- [ ] **Step 2: Run regression**

Run: `source scripts/use_local_node.sh && node frontend/tests/ai-broadcast-regression.mjs`

Expected: still FAIL because frontend data client and UI wiring are missing.

## Task 3: Frontend Broadcast Data Client

**Files:**
- Modify: `frontend/src/legacy/dataApiClient.js`
- Modify: `frontend/src/legacy/controller.js`
- Test: `frontend/tests/ai-broadcast-regression.mjs`

- [ ] **Step 1: Add data API helpers**

Add helpers named:

```js
createBroadcastJobInDataApi
fetchBroadcastJobsFromDataApi
fetchBroadcastJobFromDataApi
cancelBroadcastJobInDataApi
retryBroadcastJobInDataApi
deleteBroadcastJobFromDataApi
```

Export them and pass them through `LegacyControllerLoader` utilities.

- [ ] **Step 2: Run regression**

Run: `source scripts/use_local_node.sh && node frontend/tests/ai-broadcast-regression.mjs`

Expected: still FAIL because controller/UI wiring is missing.

## Task 4: Broadcast Controller, Sidebar, And UI Shell

**Files:**
- Create: `frontend/src/legacy/controller_sections/12_broadcastjobs.js`
- Modify: `frontend/src/legacy/controller.js`
- Modify: `frontend/src/legacy/controller_sections/09_togglesourceviewer.js`
- Modify: `frontend/src/legacy/controller_sections/99_boot.js`
- Modify: `frontend/src/react/components/StudyTools.js`
- Modify: `frontend/styles/04-section.css`
- Test: `frontend/tests/ai-broadcast-regression.mjs`

- [ ] **Step 1: Implement broadcast controller**

Create a local broadcast job store with:

```js
const BROADCAST_JOBS_STORAGE_KEY = "synapse.broadcast.jobs.v1";
```

Implement setup rendering, create/generate, progress view, transcript-first completed player, retry, cancel, delete, and sidebar card HTML. Use the model metadata `gpt-5.4-mini` and `gemini-2.5-pro-tts` in job/result data.

- [ ] **Step 2: Wire sidebar and boot**

Merge broadcast jobs into `renderHistory`, expose broadcast functions on `window`, and recover interrupted active jobs on boot.

- [ ] **Step 3: Add StudyTools AI Broadcast tab and styles**

Add `toolBtnBroadcast`, `toolPanelBroadcast`, and liquid-glass compatible setup/player styles without changing theme colors.

- [ ] **Step 4: Run regression**

Run: `source scripts/use_local_node.sh && node frontend/tests/ai-broadcast-regression.mjs`

Expected: PASS.

## Task 5: Broader Verification

**Files:**
- Test: `frontend/tests/background-generation-jobs-regression.mjs`
- Test: `frontend/tests/ai-broadcast-regression.mjs`

- [ ] **Step 1: Run focused regressions**

Run:

```bash
source scripts/use_local_node.sh
node frontend/tests/background-generation-jobs-regression.mjs
node frontend/tests/ai-broadcast-regression.mjs
```

Expected: both PASS.

- [ ] **Step 2: Inspect diff**

Run: `git diff --stat && git diff --check`

Expected: only AI Broadcast implementation files and no whitespace errors.
