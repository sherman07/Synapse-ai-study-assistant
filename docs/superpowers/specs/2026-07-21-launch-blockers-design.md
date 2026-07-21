# Launch Blocker Remediation Design

## Scope

This change addresses the four launch blockers already approved for immediate work:

1. Apply and verify the production Supabase schema.
2. Reduce cold-start impact for the Python analysis service.
3. Show honest, staged analysis progress during long generations.
4. Remove the duplicate FastAPI billing routes while keeping the Express billing API authoritative.

Account-deletion durability, MySQL retirement, broader observability, and layout polish remain outside this change.

## Considered approaches

### Cold start

- **Render cron ping (selected):** ping the Python health endpoint every ten minutes. It is the smallest infrastructure change and directly prevents the analysis service's fifteen-minute idle spin-down. Render cron jobs have a minimum monthly charge, so the Blueprint makes that cost visible.
- **Paid Python web instance:** operationally simpler and more reliable, but changes the main service's monthly cost by more than the cron approach.
- **Browser-only prewarm:** free and useful as defense in depth, but it only starts waking the service after the user opens the workspace and cannot guarantee a warm first analysis.

The implementation combines the cron with a non-blocking browser prewarm. The cron targets only the latency-critical Python service; keeping both free web services continuously awake would exceed the shared free-instance-hour allowance.

### Generation progress

- **Poll an opaque request progress endpoint (selected):** the current POST contract remains intact while the backend publishes its real stage and elapsed time in a small in-memory registry.
- **Server-sent events:** provides push updates but requires a second streaming request lifecycle and more proxy/runtime handling.
- **Timed client-only messages:** easiest, but the messages would be estimates rather than backend truth.

The selected design sends an opaque analysis request ID with `/analyze`, polls `/analyze/progress/{id}`, and maps backend stages to user-facing messages and bounded progress percentages. Before the backend accepts the POST (including during cold start), the UI explicitly says it is waking and connecting. The final response remains the source of truth for completion and `analysis_elapsed_seconds`.

## Data flow

1. Workspace boot starts a best-effort health prewarm without blocking UI.
2. Generate creates a job and opaque request ID, starts elapsed-time rendering, and warms the backend.
3. The browser submits the existing multipart request with `analysis_request_id`.
4. FastAPI records safe stage names and elapsed time as extraction, generation, optional enrichment, persistence, and completion advance.
5. The browser polls the progress endpoint until the analysis POST resolves, then stops the timer/poller and renders the result or failure.

Progress records contain no source text, filenames, user identity, or model output and expire automatically.

## Supabase schema

Before applying the idempotent schema, add explicit grants for the Learning Companion tables. This is required for projects created under Supabase's 2026 opt-in Data API exposure defaults. All exposed tables retain RLS and owner policies. Apply the schema as a named production migration, list the resulting tables, run security/performance advisors, and verify `/health/schema` reports no missing tables.

## Billing cleanup

Delete only the three duplicate Python billing routes and helpers used exclusively by them. The Express `/api/billing/*` implementation remains unchanged. Existing account export/deletion behavior is preserved for the later durability project.

## Verification

- Backend tests cover progress lifecycle, route payload safety, and absence of FastAPI billing routes.
- Frontend regression tests cover request IDs, polling, elapsed-time/stage UI, and boot prewarm.
- Blueprint tests cover the ten-minute health cron and bounded timeouts.
- Supabase verification checks table existence, advisors, and the deployed schema-health endpoint.
- Run the full frontend, backend, and server suites plus the production build.
