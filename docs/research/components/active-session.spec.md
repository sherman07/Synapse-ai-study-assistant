# ActiveSessionHUD Specification

## Overview

- Target: `frontend/src/focus-room/components/FocusRoomPage.jsx`, `ActiveSessionHUD`, `CompactFocusTimer`.
- Interaction model: time-driven timer with click-driven pause/resume and Focus Mode.
- Reference screenshot: active room at 1440×900.

## Computed reference geometry

- Header: approximately `(48,22,1344,58)` with a low-opacity bottom separator.
- Study stage: approximately `(48,80,1344,804)`.
- Desktop bottom dock: `(272,772,896,92)`, radius about 25px, translucent dark warm background, inset highlight/shadow.
- Dock columns: timer about 240px, goal about 464px, actions at right.
- Focus Mode compact card sits lower-left, approximately 272px wide in the observed 1440 view; it shows Pomodoro label, status, large time, progress line and percentage.

## Timer contract

- State machine: `idle`, `running`, `paused`, `completed`, `break`, `restoring`.
- Persist `startedAt`, `pausedAt`, `elapsedSeconds`, `durationSeconds`, `timerStatus`, selected material, goal, scene, audio mix, current session and UI content state.
- Derive elapsed/remaining from timestamps; a render or tab sleep must never add or remove a second.
- One active timer per material/session; cleanup intervals/listeners on unmount.
- Announce status changes through an `aria-live` region.

