# Focus Room Liquid Glass Redesign Design

## Context

The Synapse Focus Room is a standalone static frontend experience rendered from `frontend/src/focus-room/controller.js`, backed by state and helpers in `frontend/src/focus-room/data.js`, and styled by `frontend/styles/09-focus-room.css`. The current functionality must remain intact: material loading, scene selection, sound settings, Pomodoro timer, study plan, AI Learning Panel tabs, workspace return actions, study history, session persistence, draft persistence, and the upload/workspace connection.

The approved visual direction is **A. Cinematic Split Stage** with an iOS liquid glass interface. The redesign should make the page feel like a premium immersive AI study room instead of a normal dashboard.

## Goals

- Make the selected Focus Room scene image cover the viewport as the main visual layer.
- Add a dark cinematic overlay that keeps white text and transparent panels readable.
- Replace heavy dashboard blocks with floating liquid glass surfaces.
- Restructure the setup, active session, and AI Learning Panel layouts where needed to match the approved direction.
- Preserve all existing Focus Room behavior and public action hooks.
- Keep the implementation scoped to the Focus Room modules and targeted regression updates.

## Non-Goals

- Do not redesign the broader Synapse workspace outside Focus Room entry points.
- Do not change backend APIs, storage keys, material normalization, or generated study content formats.
- Do not add a frontend build step or new runtime dependency.
- Do not remove audio attribution, workspace routing, saved sessions, flashcards, quizzes, mind map, AI chat, or study plan behavior.

## Visual System

The visual system uses a full-screen scene background, dark overlay, and translucent UI surfaces.

Core liquid glass style:

- Background: `rgba(255, 255, 255, 0.10)` to `rgba(255, 255, 255, 0.18)` for default glass.
- Backdrop: `blur(24px)` to `blur(32px)` plus `saturate(180%)`.
- Border: `1px solid rgba(255, 255, 255, 0.26)` to `0.36`.
- Highlight: inset top line using `inset 0 1px 0 rgba(255, 255, 255, 0.32)` or stronger.
- Shadow: soft black drop shadows around `0 24px 80px rgba(0, 0, 0, 0.30-0.40)`.
- Radius: 24-32px for panels, 999px for buttons and pills.
- Active state: near-white glass, approximately `rgba(255, 255, 255, 0.84-0.90)`, with dark text.
- Inputs and selects: translucent glass, white text, visible focus ring, soft placeholder color.
- Sliders: minimal translucent tracks with a bright filled section.

The design should avoid solid white form controls, dense dashboard cards, heavy borders, and large opaque panels.

## Setup Page

The setup page becomes a full-screen preparation room using the selected scene as the background.

Left column:

- Step label: `Step 01`.
- Heading: `Choose your study scene`.
- Compact current material strip, rendered as a glass surface.
- Scene card grid using image-backed cards.
- Each scene card shows the scene image, gradient overlay, kicker pill, title, and short description.
- Selected scene gets a brighter border and subtle glow.

Right column:

- Step label: `Step 02`.
- Heading: `Set sound atmosphere`.
- Music selector, music volume slider, ambient selector, ambient volume slider, and now-playing/audio source information.
- Step label: `Step 03`.
- Heading: `Set Pomodoro`.
- Duration capsules for 25m, 45m, 50m, and 90m.
- Custom duration input.
- Goal textarea.
- Compact study plan preview.
- Large liquid glass `Enter Focus Room` button.

Behavior remains unchanged: selecting a scene still updates default music and ambient sound, duration still rebuilds the study plan, goal edits still persist the draft, and entering the room still starts the same session flow.

## Active Study Room

The active session uses the approved Cinematic Split Stage layout.

Top area:

- Left side brand: Synapse Focus Room with current scene/sound status.
- Navigation/control pills: Scene, Music, Plan, Materials.
- Right actions: AI Learning Panel, Workspace, Study History, End.
- Actions remain wired to existing controller functions.

Main area:

- Left floating timer card.
- The timer card shows current scene/sound mode, large timer, progress text, thin progress bar, and Start/Pause/Reset/Skip controls.
- Right floating context panel.
- The context panel shows study plan, sound controls, current material information, and goal summary.

Bottom area:

- Optional compact iOS-style control dock with music, ambient, pause, reset, and end session controls.
- The dock should remain visually secondary and should not duplicate controls in a way that creates conflicting behavior.

The active session must not feel like a web form. The background scene should remain visible through all panels, and the timer should be the primary focus.

## AI Learning Panel

The AI Learning Panel becomes a right-side liquid glass drawer.

Desktop behavior:

- Fixed to the right side.
- Width around 420-520px.
- Does not cover the full page.
- Uses the same liquid glass panel style as the rest of the room.
- Slides in smoothly from the right.
- Keeps the Focus Room visible behind it.

Mobile behavior:

- Full-width drawer.
- Safe close button at the top.
- Tabs remain usable with horizontal wrapping or scrolling.

Tabs:

- Materials.
- Summary.
- Flashcards.
- Quiz.
- Mind Map.
- AI Chat.
- Study Plan.

Existing tab rendering and workspace return actions must remain available.

## Study History And Summary

Study history and session summary should inherit the same cinematic scene background and liquid glass style.

- Empty history shows a concise glass empty state.
- Saved sessions remain readable and compact.
- Session summary remains modal-like but should use a frosted overlay and glass summary card.
- Existing in-memory fallback messaging for failed session persistence remains visible.

## Responsive Design

Desktop and laptop:

- Setup uses two columns.
- Active room uses left timer plus right context panel.
- AI drawer uses fixed right width.

Tablet:

- Setup columns may narrow or stack depending available width.
- Active room should keep the timer first and place context below or beside it.
- Controls wrap without overlap.

Mobile:

- Setup becomes one column.
- Scene cards stack or use a compact two-column layout only if there is enough width.
- Timer remains large but constrained.
- Buttons become large enough to tap and may become full-width.
- AI drawer becomes full width.
- Avoid clipping, horizontal scroll, and overlapping fixed elements.

## Error And Empty States

- No material: show the current background with a simple glass "waiting for material" state and workspace/history actions.
- Audio unavailable or blocked: show the existing audio error text inside the now-playing glass card.
- No flashcards/quizzes/mind map: preserve the existing empty messages and workspace generator actions.
- AI chat unavailable: preserve the fallback assistant response and error message.
- Session save failure: preserve the in-memory fallback and "not saved to device history" messaging.

## Architecture And Data Flow

The redesign should keep the current module boundaries.

- `frontend/src/focus-room/data.js` remains responsible for scenes, durations, audio profiles, material normalization, drafts, saved sessions, and study plan generation.
- `frontend/src/focus-room/controller.js` remains responsible for state, routing, rendering, timer behavior, AI panel behavior, workspace return actions, and global action hooks.
- `frontend/styles/09-focus-room.css` owns layout, glass styling, responsive behavior, and visual polish.
- `frontend/src/focus-room/audio.js`, when present, remains responsible for audio playback state and synchronization.

Controller changes should be surgical: add markup wrappers and class hooks needed for the approved layouts, but do not change the storage model or routing behavior.

## Verification Plan

Run focused regression checks:

- `node frontend/tests/focus-room-integration-regression.mjs`
- `node frontend/tests/focus-room-data-regression.mjs`
- `node frontend/tests/focus-room-controller-actions-regression.mjs`
- `node frontend/tests/focus-room-study-tools-regression.mjs`
- `node frontend/tests/focus-room-audio-regression.mjs` if the audio test file is present.

Manual/browser verification:

- Open `frontend/focus-room.html#/focus-room/:materialId`.
- Verify setup page layout, scene selection, sound controls, duration controls, custom duration, goal editing, and Enter Focus Room.
- Verify active session timer controls, progress bar, study plan, sound controls, current material, goal summary, and optional dock.
- Verify AI Learning Panel tabs and close behavior.
- Verify workspace return actions from flashcards, quiz, mind map, chat, and plan.
- Verify study history and session summary.
- Verify responsive behavior on desktop and mobile viewport sizes.

## Remaining Risks

- Liquid glass depends on backdrop filter support. The design should include readable translucent fallback colors for browsers that reduce or disable backdrop filtering.
- The stronger visual treatment may require careful spacing on small laptops to avoid crowding.
- Existing string-based regression tests may need narrow updates if class names or markup hooks change.
