# SynapseToolsPanel Specification

## Overview

- Target: existing `FocusRoomToolPanel.jsx` presentation layer, restyled/recomposed rather than replaced at the data boundary.
- Interaction model: click-driven tab/drawer with preserved content state.

## Content contract

- Keep current query-backed materials and generated-content history.
- Preserve complete generated Study Material, section outline, search, notes/bookmarks, source evidence, AI Tutor grounded in active material, quiz sessions, flashcards/matching, mind maps, study plan and progress.
- Switching tabs must not restart timer, video, audio, selected material or reading position.
- Closed state leaves the cinematic room clean; open state uses a glass drawer or workspace panel.
- Desktop: right drawer with scrim. Mobile: full-height sheet/full-screen workspace with close and back controls.
- Dialog focus must be trapped while open; Escape closes without losing state.

