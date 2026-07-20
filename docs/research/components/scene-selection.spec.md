# SceneSelectionOverlay Specification

## Overview

- Target: `frontend/src/focus-room/components/FocusRoomSetup.jsx` and scene subcomponents.
- Interaction model: click-driven; keyboard-selectable cards and page controls.
- Reference screenshots: `innook-selection-1440x900.png`, `innook-selection-1280x800.png`, `innook-selection-768x1024.png`, `innook-selection-390x844.png`.

## Computed reference geometry

- Desktop 1440: setup `(256,130,928,570)`, scene panel `(256,130,845,570)`, capsule `(1122,220,62,391)`.
- Desktop 1280: setup `(176,116,928,561)`, scene panel `(176,116,847,561)`, capsule `(1042,211,62,372)`.
- Tablet 768: setup `(64,85,640,921)`, scene panel `(64,96,433,910)`, controls `(513,96,191,910)`.
- Mobile 390: setup `(12,67,367,834)`, scene panel `(12,77,367,328)`, controls `(12,419,367,478)`; document scroll height about 916px.
- Scene panel: warm glass gradient, 1px cream border at about 30% opacity, 26–28px radius, inset highlight and deep shadow.
- Desktop cards: 4 columns × 2 rows, approximately 185×220, 12–14px padding, 17–20px radius, selected ring and brighter text.
- Mobile cards: one column horizontal rows approximately 338×98, selected state remains visible.

## Content and controls

- Preserve all existing Synapse scenes and add page pagination if more than eight scenes are available.
- Expose five music categories, 25/45/50/90 minutes, and count-up.
- Use a primary full-width `Enter Focus Room` action on mobile and a circular/right-arrow treatment on desktop.
- Keep study material title/outline/goal visible without turning setup into a generic dashboard.

## Accessibility

- Cards are buttons with title/category in accessible name, `aria-pressed`, and visible focus ring.
- Previous/next buttons have labels and disabled state at page limits.
- Every music/duration control has text, not icon-only semantics.

