# Launch Blocker Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make first-use analysis responsive and trustworthy, deploy the missing durable schema, and leave Express as the only billing surface.

**Architecture:** A small thread-safe FastAPI progress registry exposes real stage and elapsed-time snapshots keyed by an opaque browser-generated request ID. The existing generation-job UI polls that registry while retaining the current `/analyze` response contract. Render Blueprint configuration adds one ten-minute Python health ping, and the Supabase schema gains explicit least-privilege grants before being applied through the connected production project.

**Tech Stack:** Python 3/FastAPI/unittest, browser JavaScript, Node.js regression tests, Render Blueprint YAML, PostgreSQL/Supabase MCP.

## Global Constraints

- Keep `/analyze` backward compatible when `analysis_request_id` is absent.
- Never store source content, filenames, user identity, or model output in progress records.
- Preserve Express `/api/billing/*` as the only billing implementation.
- Keep the Render cron scoped to the Python backend health endpoint and use a ten-minute UTC schedule.
- Keep RLS enabled and use explicit grants for every new Data API table.

---

### Task 1: Real analysis progress contract

**Files:**
- Create: `backend/core/analysis_progress.py`
- Create: `backend/tests/test_analysis_progress.py`
- Modify: `backend/app.py`
- Modify: `backend/app_sections/05_analyze.py`

**Interfaces:**
- Produces: `begin_analysis_progress(request_id)`, `update_analysis_progress(request_id, stage)`, `finish_analysis_progress(request_id, status)`, and `get_analysis_progress(request_id)`.
- Produces: `GET /analyze/progress/{request_id}` returning `{request_id, status, stage, progress_percent, message, elapsed_seconds}`.
- Extends: `POST /analyze` form with optional `analysis_request_id`.

- [ ] **Step 1: Write failing lifecycle and route tests**

Test that an invalid ID is ignored, valid IDs move through safe stages, elapsed time is nonnegative, completed progress is 100, returned payloads contain no arbitrary source data, and the route returns 404 for unknown IDs.

- [ ] **Step 2: Run tests and verify RED**

Run: `.venv/bin/python -m unittest backend.tests.test_analysis_progress -v`

Expected: import or route assertions fail because the registry does not exist.

- [ ] **Step 3: Implement the minimal registry and endpoint**

Use `threading.Lock`, `time.monotonic`, a strict `^[A-Za-z0-9_-]{12,96}$` ID rule, fixed stage metadata, and lazy TTL cleanup. Replace direct stage assignments in the analysis pipeline with a local helper that updates both logging state and the registry. Mark terminal state in `finally` without overriding a recorded success.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `.venv/bin/python -m unittest backend.tests.test_analysis_progress backend.tests.test_visual_gallery_and_cache -v`

Expected: all selected backend tests pass.

### Task 2: Honest browser progress and proactive warmup

**Files:**
- Modify: `frontend/src/legacy/controller_sections/11_generationjobs.js`
- Modify: `frontend/src/legacy/controller_sections/01_uploadedfiles.js`
- Modify: `frontend/src/legacy/controller_sections/99_boot.js`
- Modify: `frontend/styles/04-section.css`
- Create: `frontend/tests/analysis-progress-regression.mjs`

**Interfaces:**
- Consumes: `GET /analyze/progress/{request_id}` from Task 1.
- Produces: `startGenerationJobProgressPolling(jobId, requestId)`, `stopGenerationJobProgressPolling(jobId)`, and `prewarmSynapseServices()`.

- [ ] **Step 1: Write the failing frontend regression**

Assert that generation creates and submits an `analysis_request_id`, polls the progress route, renders `elapsedSeconds`, exposes stage detail in an ARIA live region, stops polling in `finally`, and starts best-effort prewarm during boot.

- [ ] **Step 2: Run the regression and verify RED**

Run: `node frontend/tests/analysis-progress-regression.mjs`

Expected: missing request-ID, polling, elapsed-time, and boot-prewarm assertions fail.

- [ ] **Step 3: Implement progress polling and rendering**

Generate a separate opaque request ID per run, include it in `FormData`, poll with short bounded fetches, and merge only recognized backend fields into the job. Maintain a one-second display timer so elapsed time remains visible between polls. Render a stage label, message, elapsed seconds, and `aria-valuenow` progress bar. Stop both poll and timer on completion, failure, cancellation, deletion, and `finally`.

- [ ] **Step 4: Implement boot prewarm**

Call Python `apiClient.warmup()` without awaiting it and issue a bounded `GET /health` to the configured data API. Log only at debug level and never block workspace initialization.

- [ ] **Step 5: Run frontend tests and verify GREEN**

Run: `node frontend/tests/analysis-progress-regression.mjs && npm run test:frontend`

Expected: all frontend regressions pass.

### Task 3: Keep-warm Blueprint and billing-route removal

**Files:**
- Create: `scripts/keep_render_warm.mjs`
- Modify: `render.yaml`
- Create: `frontend/tests/launch-operations-regression.mjs`
- Modify: `backend/app.py`

**Interfaces:**
- Cron command: `node scripts/keep_render_warm.mjs`.
- Cron env: `SYNAPSE_KEEP_WARM_URL=https://synapse-ai-backend-idnc.onrender.com/healthz`.

- [ ] **Step 1: Write failing operations regression**

Assert the Blueprint defines one `type: cron` service with `*/10 * * * *`, a bounded keep-warm script targets only the configured URL, and FastAPI no longer registers `/billing/checkout`, `/billing/portal`, or `/billing/webhook`.

- [ ] **Step 2: Run regression and verify RED**

Run: `node frontend/tests/launch-operations-regression.mjs`

Expected: cron/script assertions and duplicate-route absence assertions fail.

- [ ] **Step 3: Add cron and remove dead billing routes**

Implement the keep-warm script with `AbortSignal.timeout(20000)`, require an HTTP 2xx response, and exit nonzero on failure so Render records a failed run. Delete the three route handlers and helpers/config used only by them; retain Stripe/profile code still used by account export/deletion.

- [ ] **Step 4: Run regression and backend route tests**

Run: `node frontend/tests/launch-operations-regression.mjs && .venv/bin/python -m unittest backend.tests.test_auxiliary_api_reliability -v`

Expected: all selected tests pass.

### Task 4: Production Supabase schema and release verification

**Files:**
- Modify: `server/src/db/supabase-schema.sql`
- Modify: `server/tests/utils.test.js`

**Interfaces:**
- Migration name: `launch_learning_companion_schema`.
- Verification endpoint: `https://synapse-data-api.onrender.com/health/schema`.

- [ ] **Step 1: Add a failing schema grant regression**

Assert the SQL revokes all access from `anon`, explicitly grants CRUD to `authenticated, service_role`, and enables RLS for `learner_profiles`, `learning_subjects`, `learning_sessions`, `learning_messages`, and `learning_evidence`.

- [ ] **Step 2: Run test and verify RED**

Run: `cd server && npm test -- --test-name-pattern='Learning Companion schema grants'`

Expected: explicit grant assertion fails.

- [ ] **Step 3: Add explicit grants and apply the schema**

Place grants after all Learning Companion tables exist, apply the full idempotent SQL through the connected Supabase production project, then list public tables.

- [ ] **Step 4: Run advisors and live verification**

Run Supabase security and performance advisors. Request `/health/schema` and require HTTP 200 with `missing_tables: []`.

- [ ] **Step 5: Run complete verification**

Run:

```bash
npm run test:frontend
.venv/bin/python -m unittest discover -s backend/tests -v
cd server && npm run check
cd .. && npm run build
git diff --check
```

Expected: zero test failures, successful production build, and no whitespace errors.
