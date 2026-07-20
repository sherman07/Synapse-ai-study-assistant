# FocusRoomExitDialog Specification

## Overview

- Target: `SessionSummaryModal.jsx` plus exit control in the room header.
- Interaction model: click-driven modal, keyboard Escape close, completion state.

## States

- Closed: no layout movement.
- Confirmation: title `End this focus block?`, copy explains progress will be saved, actions continue/end.
- Completion: elapsed duration, current goal/material, saved session summary and `Start another` action.
- Dialog uses an accessible title/description, focus trap, visible focus, and safe-area-aware compact layout on mobile.

