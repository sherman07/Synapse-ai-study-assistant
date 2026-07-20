# RoomSettingsPanel Specification

## Overview

- Target: `frontend/src/focus-room/components/FocusRoomDrawers.jsx` and `SoundControlPanel.jsx`.
- Interaction model: click-driven side panel with independent range controls.
- Reference: `innook` settings screenshot at 1440×900.

## Layout

- Desktop absolute glass panel anchored top/right under header, roughly 768×560 in the observed viewport.
- Use 23–25px radius, warm translucent surface, low-opacity border/inset highlight, soft shadow, and a dim scrim.
- Mobile becomes a full-height bottom sheet or full-screen panel; keep all options reachable by scroll.

## Required controls

- Scene library and scene switching.
- Music categories and master volume.
- Random track and save-current-mix.
- White, pink, brown noise.
- Light/heavy rain, ocean waves, wind, fireplace, train, café, street, forest, summer night, waterfall.
- Typing, page-turning, writing.
- Every channel has its own persisted volume and accessible slider label.

