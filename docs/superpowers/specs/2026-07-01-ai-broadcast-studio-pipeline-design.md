# AI Broadcast Studio Pipeline Design

## Context

Synapse needs a memorable AI Broadcast feature that turns uploaded study material or existing generated notes into a podcast-style educational audio overview. The current app is a web workspace with:

- React shell components that delegate study-tool behavior to the legacy controller.
- Browser-local background generation jobs for note generation.
- Express data API persistence for generated notes through MySQL or Supabase.
- FastAPI AI generation endpoints for source analysis, tutor, quiz, flashcards, timelines, source previews, and voice tutor realtime support.

AI Broadcast should become a first-class generated artifact. It should not be a text-to-speech shortcut, and it should not block the whole workspace while running.

## Product Goal

Users can create a high-quality study radio episode from a source or note, continue studying while it generates, then open a rich broadcast player with audio, transcript, chapters, source references, and follow-up study actions.

The experience should feel produced and intentional:

- A strong opening hook.
- A structured learning arc.
- Useful host roles when two voices are selected.
- Source-grounded explanations.
- Chaptered transcript and memorable recap.
- Clear status updates while the job is running.

## Model Defaults

Use this model split by default:

- Script planning, script writing, validation, chaptering, key ideas, and source-reference generation: `gpt-5.4-mini`.
- Text-to-speech voice generation: `gemini-2.5-pro-tts`.

Both should be configured through backend environment settings rather than hard-coded at call sites:

- `BROADCAST_SCRIPT_MODEL=gpt-5.4-mini`
- `BROADCAST_TTS_MODEL=gemini-2.5-pro-tts`
- `BROADCAST_TTS_PROVIDER=gemini`

The code should expose provider adapters so a future OpenAI, ElevenLabs, or local TTS path can be added without rewriting the broadcast job pipeline.

## User Flow

1. User uploads study material or opens an existing generated note.
2. User clicks **AI Broadcast** near the existing study tools.
3. Synapse opens a setup panel with:
   - Broadcast style: Study Podcast, Exam Revision, Deep Explanation, Quick Recap, Debate / Two Perspectives, Interview Style.
   - Length: 3 minutes, 5 minutes, 10 minutes, Custom.
   - Voice format: Single Narrator, Two AI Hosts, Host + Student, Teacher + Student.
   - Depth: Simple, Standard, Advanced, Exam-focused.
   - Language: Auto-detect, English, Chinese, Bilingual.
4. User clicks **Generate Broadcast**.
5. Synapse creates a persisted broadcast job.
6. The left sidebar shows the job with status and retry/delete affordances.
7. User can continue browsing notes or using tools while the broadcast runs.
8. Clicking the sidebar item opens the job progress screen or completed broadcast player.

## Architecture

### Backend

Add a broadcast job domain to the Express data API, because generated notes and user-scoped durable study artifacts already live there.

Core API routes:

- `POST /api/broadcast-jobs`
- `GET /api/broadcast-jobs`
- `GET /api/broadcast-jobs/:id`
- `POST /api/broadcast-jobs/:id/cancel`
- `POST /api/broadcast-jobs/:id/retry`
- `DELETE /api/broadcast-jobs/:id`

The first implementation can run the job worker in-process in the Express server. The job state must still be persisted so failed, interrupted, and completed jobs remain visible. A future worker queue can replace the in-process runner behind the same repository interface.

FastAPI should own the AI-heavy broadcast generation endpoint because it already owns AI provider configuration and source generation logic. Express creates and stores jobs, calls FastAPI for pipeline steps, and persists results.

Suggested internal FastAPI endpoints:

- `POST /broadcast/plan`
- `POST /broadcast/script`
- `POST /broadcast/validate`
- `POST /broadcast/tts`
- `POST /broadcast/package`

These may be implemented as one internal orchestration endpoint first if that is simpler, as long as the pipeline state stored in Express remains step-aware.

### Database

Add `broadcast_jobs` to MySQL and Supabase schemas.

Fields:

- `id`
- `user_id`
- `source_id`
- `note_id`
- `source_fingerprint`
- `title`
- `status`
- `style`
- `length_minutes`
- `custom_length_minutes`
- `voice_format`
- `depth`
- `language`
- `progress_message`
- `progress_percent`
- `script_model`
- `tts_provider`
- `tts_model`
- `plan_json`
- `script_json`
- `validation_json`
- `transcript_json`
- `chapters_json`
- `key_ideas_json`
- `source_references_json`
- `audio_url`
- `audio_metadata_json`
- `error_message`
- `cancelled_at`
- `completed_at`
- `created_at`
- `updated_at`

Statuses:

- `queued`
- `extracting_source`
- `planning`
- `scripting`
- `validating`
- `generating_audio`
- `building_audio`
- `completed`
- `failed`
- `cancelled`

### Broadcast Pipeline

Each job runs through these stages:

1. Resolve source from generated note, uploaded source metadata, or persisted source text.
2. Chunk source and calculate source sufficiency.
3. Plan the episode structure.
4. Generate the script using `gpt-5.4-mini`.
5. Validate the script against the source.
6. Generate voices using `gemini-2.5-pro-tts`.
7. Stitch or package audio.
8. Generate transcript, chapters, key ideas, and source references.
9. Persist the final result.
10. Update frontend-visible job status.

If source content is too short, create the job but show a warning before or during generation:

> This source may not have enough content for a high-quality broadcast.

If TTS fails or is unavailable, preserve the completed script package and mark audio as unavailable with a useful explanation. The UI should still let the user read the transcript and regenerate audio later.

## Script Quality

The script must follow this structure:

1. Hook / opening question.
2. Topic overview.
3. Main idea 1.
4. Main idea 2.
5. Main idea 3.
6. Example or application.
7. Common mistake / misconception.
8. Exam-style explanation when relevant.
9. Short recap.
10. Final memory hook.

For two-host formats:

- Host A guides the lesson.
- Host B asks useful student-style questions.
- Dialogue should feel natural but academically useful.
- Avoid shallow banter, fake jokes, and filler.
- Every major claim must have a source reference or be clearly marked as background explanation.

For exam-focused depth:

- Explain what the topic means.
- Explain why it matters.
- Predict likely exam question shapes.
- Show how to answer those questions.
- Name common mistakes.
- Surface key phrases, formulas, or definitions to remember.

## Validation

Add a validation step before audio generation. It should check:

- Claims are grounded in the source or marked as background.
- The requested style, depth, length, language, and voice format are followed.
- The script is not a direct read-aloud of the notes.
- Two-host scripts contain meaningful role separation.
- Exam-focused scripts include exam-answer guidance.
- Chapters and key ideas align with the transcript.

If validation fails, the pipeline should attempt one repair pass. If repair fails, mark the job failed and preserve the error.

## Frontend

### Entry Points

Add **AI Broadcast** near Mind Map, Study Path, Quiz, Exam Readiness, and generated-note actions. Keep the existing liquid-glass visual style and theme colors.

Entry points should work from:

- Current generated note.
- Existing generated note loaded from history.
- Newly uploaded material after source extraction is available.

### Setup Panel

Use compact segmented controls, select menus, and clear primary action. Do not crowd the main notes surface. The setup panel should feel like a studio setup sheet, not a form dump.

Before creating the job, show the selected style, length, voice format, depth, and language in a small summary row.

### Sidebar Jobs

Merge broadcast jobs into the left history sidebar with distinct broadcast cards:

- Active jobs show spinner, status, and progress message.
- Completed jobs show a play affordance.
- Failed jobs show retry and error summary.
- Cancelled jobs can be reopened briefly or removed.

Broadcast jobs should not hide or replace generated note jobs.

### Broadcast View

Completed view includes:

- Audio player.
- Play / pause.
- Seek bar.
- Current time / duration.
- Playback speed: 0.75x, 1x, 1.25x, 1.5x, 2x.
- Chapter list.
- Full transcript.
- Key ideas covered.
- Source references.
- Explain this part deeper.
- Generate quiz from this broadcast.
- Generate flashcards from this broadcast.
- Open as Study Material.
- Regenerate.
- Delete.
- Download audio only when storage supports a real audio URL.

If audio is unavailable, show a polished transcript-first player state with the reason and a regenerate-audio action.

## Error Handling

- Job creation failure: show inline setup-panel error.
- Source too short: warn and allow user to proceed.
- Script failure: keep job failed with retry.
- Validation failure: attempt one repair, then fail with useful message.
- TTS failure: preserve transcript package and allow audio retry.
- Cancel: stop future stages where possible and persist `cancelled`.
- Page refresh: persisted jobs should still appear in sidebar.

## Testing

Add focused regression tests for:

- Broadcast API route registration.
- Broadcast schema includes durable result fields.
- Repository normalizes status and JSON fields.
- Frontend exposes AI Broadcast entry point.
- Setup panel contains all required controls.
- Sidebar renders active, completed, and failed broadcast jobs.
- Broadcast view includes player, transcript, chapters, source references, and follow-up actions.
- Generation does not use one global loading state.
- TTS-unavailable result still renders transcript package.

Manual verification:

- Start local stack.
- Create a generated note.
- Generate a broadcast from it.
- Confirm sidebar job status changes without blocking the notes page.
- Open completed broadcast.
- Confirm transcript, chapters, source references, and player fallback render.

## Implementation Phasing

Phase 1: Durable foundations.

- Database schema.
- Repository.
- API routes.
- Frontend client methods.
- Basic sidebar integration.

Phase 2: Studio setup and completed view.

- Setup panel.
- Broadcast progress view.
- Completed player/transcript view.
- Retry, cancel, delete, regenerate UI.

Phase 3: AI pipeline.

- Source resolver and chunker.
- Planning and script generation with `gpt-5.4-mini`.
- Validation and repair pass.
- Transcript/chapter/key idea/source-reference package.

Phase 4: Voice generation.

- Gemini TTS provider adapter using `gemini-2.5-pro-tts`.
- Audio asset storage path.
- Audio metadata and download support when available.
- Transcript-first fallback when audio generation is unavailable.

## Open Implementation Notes

- Prefer matching existing repository patterns from generated content and flashcards.
- Keep changes scoped to broadcast-specific routes, repository, schema, and UI.
- Do not rewrite existing notes, quiz, flashcards, focus room, or voice tutor systems.
- Do not change theme colors.
- Keep the first worker simple, then swap to an external queue only when deployment needs it.
