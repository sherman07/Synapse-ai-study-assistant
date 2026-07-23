# SceneSelectionOverlay Specification

## Reference update — Innook selector

- Target reference: `https://innook.cn/`, scene-selection state accessed from the primary study CTA; confirmed against the user-provided July 23 screenshot.
- Interaction model: click-driven. A centered scene gallery selects the active study scene; the tall rail selects a sound mood and duration, and its arrow enters the room.
- Product adaptation: retain Synapse's real scene, audio, goal, timer, and persistence actions while cloning the reference's sparse visual hierarchy.

## Reference geometry at 1512 × 827

- Canvas: near-black `#050504`; the setup state does not show the cinematic room background.
- Header: 1px warm separator from `x=80` to `x=1430`, approximately `y=96`; brand left and two circular utility actions right.
- Setup composition: centered layout about `928px` wide and `574px` tall, beginning approximately `y=120`.
- Gallery: about `843px × 574px`; warm glass border, approximately 26–28px radius, 30px inset.
- Scene grid: four columns × two rows. Cards are about `184px × 221px`, with a square image region and a 36px copy row beneath; horizontal gap about 16px, vertical gap about 15px.
- Control rail: 64px wide and about 398px high; warm translucent capsule with 1px cream border, 999px radius, and vertically grouped music, duration, and entry controls.

## Visual tokens

- Heading: `Innook Songti Subset, Songti SC, STSong, Noto Serif CJK SC, serif`; 29.5px, weight 400, warm cream at ~84% opacity.
- Body/controls: clean system sans; cream ink `rgb(244, 231, 211)` at 70–100% opacity.
- Glass: `linear-gradient(rgba(42,39,35,.58), rgba(30,27,24,.34))` over `rgba(244,231,211,.05)`; 1px `rgba(244,231,211,.32)` border; inset white highlight and broad soft black shadow.
- Selected card: warm cream outline and brighter copy. Hover: subtle 0.5px upward translation over 300ms.

## Synapse behavior mapping

- Scene card → `selectScene(sceneId)`.
- Music mood rail → `setSound("musicType", value)` and, where appropriate, `setSound("ambientSound", value)`.
- Duration rail → `setPomodoroDuration(minutes)` or `setTimerMode("countup")`.
- Enter arrow → `startSession()`.
- Goal remains available through a compact intent action so the original Focus Room requirement is preserved without changing the reference's primary composition.

## Reference content used in the clone

- The setup gallery is a fixed 4 × 2 layout, matching the reference exactly: 清晨窗边, 木屋黄昏, 末世客厅, 绿植咖啡, 晚霞教室, 东京夜景, 雪窗木屋, 竹林小屋.
- It uses the local Innook-derived scene assets already present in `frontend/assets/focus-room/innook/`; no placeholder images are used.
- Gallery-only items map to real Synapse scene IDs and audio profiles, so selecting one still changes the active focus session rather than merely changing the visual selection.

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

- Preserve the six original Synapse scenes in the normal scene drawer; use the eight reference scenes only for this setup gallery.
- Expose five music categories, 25/45/50/90 minutes, and count-up.
- Use a primary full-width `Enter Focus Room` action on mobile and a circular/right-arrow treatment on desktop.
- Keep study material title/outline/goal visible without turning setup into a generic dashboard.

## Accessibility

- Cards are buttons with title/category in accessible name, `aria-pressed`, and visible focus ring.
- Previous/next buttons have labels and disabled state at page limits.
- Every music/duration control has text, not icon-only semantics.
