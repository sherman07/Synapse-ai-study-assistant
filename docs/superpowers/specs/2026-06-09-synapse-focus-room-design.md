# Synapse Focus Room Design

Date: 2026-06-09

## Goal

Build a polished Synapse Focus Room MVP that turns the existing upload and generated-notes workspace into a connected study session experience. The first release should feel like a core Synapse feature: users can move from an analysed material into an immersive study room, configure the study environment, use AI study artifacts during the session, end the session, and see saved local progress.

## Connection Standard

The current Synapse workspace and the Focus Room must feel like two modes of the same product, not two separate pages. The upload and analysis workspace remains the place where users prepare learning materials; the Focus Room becomes the place where users study those prepared materials. Existing Synapse outputs, including summary notes, source context, study tools, flashcards, quizzes, timeline or mind map content, tutor prompts, generated-note history, and local progress, should flow into the Focus Room through one shared material adapter.

The connection must work in both directions:

- From workspace to Focus Room: active analysis and history items expose a direct `Study in Focus Room` action.
- From Focus Room to workspace: users can return to the source workspace without losing the selected material context.
- From Focus Room to history: ended sessions save a readable study record that remains discoverable alongside the existing study workflow.
- From missing artifacts to existing tools: if a Focus Room panel needs flashcards, quizzes, or a study path that does not exist yet, the empty state points users back to the existing Synapse generation tool instead of creating a disconnected duplicate flow.

## Assumptions

- The frontend is currently a static app that uses React from a CDN and a legacy controller. There is no npm build step.
- This pass uses local browser storage and existing generated-note history instead of adding backend persistence.
- Static hash routes are used for this MVP: `#/focus-room`, `#/focus-room/:materialId`, and `#/study-history`. This avoids requiring server rewrites for `/focus-room/:materialId`.
- Existing generated notes are treated as study materials. Where the current workspace already has flashcards, quizzes, timeline, mind map, tutor context, or summary content, the Focus Room reuses them.
- Missing AI artifacts should be shown honestly. The UI can offer to return to the workspace or generate the artifact through existing controls, but it must not pretend unavailable data exists.

## User Flow

1. The user uploads and analyses study material in the current Synapse workspace.
2. The workspace exposes a clear `Study in Focus Room` action for the current analysis and generated-note history items.
3. Selecting that action opens `#/focus-room/:materialId` with the material loaded.
4. If no material is selected, `#/focus-room` lets the user choose from available generated-note materials.
5. The setup screen lets the user choose a scene, sound balance, Pomodoro duration, and study goal.
6. Starting the session opens the immersive room with a timer, progress, controls, current task, and AI Learning Panel.
7. The user can review summary content, flashcards, quizzes, mind map or timeline content, study plan, and assistant prompts without leaving the room.
8. Ending the session opens a summary modal or page.
9. The session summary is saved locally and visible from the Focus Room history surface and workspace entry points.

## Architecture

### Static Route Layer

Add a small client route handler that listens to `hashchange` and initial page load.

- Workspace route: default existing workspace view.
- Focus setup route: `#/focus-room/:materialId?`.
- Study history route: `#/study-history`.
- Return action: clears or changes the hash back to the workspace without reloading the app.

This route layer should hide/show dedicated Focus Room DOM roots while preserving existing workspace IDs that the legacy controller depends on.

### Shared Study Data

Create a focused frontend module for Focus Room state. It should adapt existing local history records into material objects.

The adapter is the integration boundary for both current Synapse modes. Workspace UI, generated-note history, and Focus Room panels should read material data through this adapter instead of inventing separate material shapes for each surface.

```js
studyMaterial = {
  materialId,
  materialTitle,
  materialType,
  uploadedContent,
  aiSummary,
  flashcards,
  quizzes,
  mindMap,
  studyPlan,
  progressHistory
}
```

For this MVP, `materialId` maps to current generated-note history IDs where possible. If the current unsaved analysis does not have a history ID yet, use a stable temporary ID and encourage saving through existing history behavior where needed.

```js
studySession = {
  sessionId,
  materialId,
  studyGoal,
  selectedScene,
  musicType,
  ambientSound,
  musicVolume,
  ambientVolume,
  pomodoroDuration,
  startedAt,
  endedAt,
  totalFocusTime,
  flashcardsCompleted,
  quizScore,
  completedTasks,
  aiReflection
}
```

Persist sessions to local storage under a namespaced key such as `synapse.focusRoom.sessions.v1`.

### UI Components

The implementation can use focused React markup components plus a small controller module, matching the current architecture.

- `FocusRoom`
- `FocusRoomSetup`
- `StudySceneSelector`
- `SceneCard`
- `PomodoroTimer`
- `SoundControlPanel`
- `UploadedMaterialPanel`
- `AIStudyAssistant`
- `FlashcardStudyMode`
- `QuizStudyMode`
- `MindMapViewer`
- `StudyPlanPanel`
- `SessionSummary`
- `StudyHistory`

Keep component boundaries practical. Do not introduce a large framework or new dependency.

## Screens

### Workspace Integration

Add a prominent `Study in Focus Room` action after analysis is ready and on generated-note history items.

Expected behavior:

- Current analysis button opens Focus Room with the active material.
- History item action opens Focus Room for that saved material.
- The action should not disrupt existing history loading or delete behavior.

### Focus Room Setup

The setup screen should feel calm, premium, and practical.

Required controls:

- Scene cards: Morning Window, Rainy Cafe, Library Night, Ocean Study Room, Mountain Cabin, Minimal Desk.
- Sound controls: music type, ambient sound, music volume, ambient volume.
- Timer presets: 25, 45, 50, and 90 minutes.
- Custom duration input.
- Study goal textarea.
- AI-derived simple study plan preview from material title, available summary headings, and goal.

Scene cards should use real-feeling visual assets selected or generated for this pass. If asset generation is blocked, use polished CSS scenic treatments as a fallback, with stable dimensions and no broken or generic empty boxes.

### Main Focus Room

The main session is full-screen and low-distraction.

Required elements:

- Background scene.
- Large Pomodoro timer.
- Status: Ready, Studying, Paused, Break, Completed.
- Study goal and current task.
- Progress bar.
- Start, Pause, Resume, Skip, Reset, and End Session controls.
- Music and ambient volume controls.
- Immersive mode button.
- AI Learning Panel button.

The timer must continue accurately while the page is active. If the route changes away from Focus Room, pause or clearly preserve state rather than silently losing the session.

### AI Learning Panel

The panel should be useful without becoming visually noisy.

Tabs:

- Materials: selected material and other available generated-note materials.
- Summary: current generated summary.
- Flashcards: available flashcard deck and local progress controls.
- Quiz: available quiz questions and local score tracking.
- Mind Map: existing mind map canvas content or timeline/study path fallback.
- AI Chat: prompt shortcuts and bridge to existing assistant context.
- Study Plan: editable plan tied to the session goal and duration.

If a tab has no data, show a high-quality empty state with a concrete next action.

### Session Summary And History

Ending a session creates a summary with:

- Total focus time.
- Material studied.
- Study goal.
- Pomodoro duration.
- Flashcards completed.
- Quiz score.
- Mistakes made, when available.
- AI reflection generated locally from available session facts.
- Recommended next step.
- Scene used.
- Session date.

Study history should be readable from Focus Room and discoverable from the workspace. It does not replace existing generated-note history.

## Visual Quality Bar

- Use calm, image-led or scene-led composition, with restrained glass panels and strong readability.
- Avoid a marketing landing page. The Focus Room should open as a usable product surface.
- Avoid nested cards and decorative clutter.
- Use stable panel, toolbar, timer, scene-card, and tab dimensions so text and controls do not jump.
- Keep typography sized for tool use, not hero copy, except for the timer.
- Ensure desktop, tablet, and mobile layouts do not overlap.
- Use icon buttons for timer and panel controls where Bootstrap Icons already provide suitable symbols.
- Keep colors connected to Synapse but avoid a one-note purple or blue-only palette.

## Error Handling

- If no materials exist, show an empty state that links back to the upload workspace.
- If a material ID is missing or stale, show available materials and a return-to-workspace action.
- If local storage is unavailable, keep the session in memory and clearly show that history cannot be saved.
- If existing AI artifacts are unavailable, show empty states instead of broken tabs.

## Testing And Verification

Use the narrowest meaningful checks for this static app:

- `node scripts/validate_static_site.mjs`
- Relevant frontend regression tests, especially history and auth-routing checks.
- Manual browser verification on the local static frontend:
  - Workspace opens normally.
  - Existing upload and analysis flow still renders.
  - `Study in Focus Room` opens the setup screen with the selected material.
  - Timer starts, pauses, resets, and ends correctly.
  - Session summary saves locally and appears in Focus Room history.
  - Mobile and desktop layouts do not overlap.

## Out Of Scope For This MVP

- Backend session APIs.
- Account-level cloud persistence.
- Real audio streaming or licensed music catalogs.
- Real AI generation endpoints beyond existing workspace capabilities.
- Replacing the existing legacy controller.
- A fully custom asset pipeline or npm build system.

These can be added after the static MVP proves the workflow and UI.
