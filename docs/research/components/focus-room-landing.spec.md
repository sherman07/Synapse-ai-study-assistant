# FocusRoomLanding Specification

## Overview

- Target: `frontend/src/focus-room/components/FocusRoomLanding.jsx`.
- Interaction model: click-driven landing transition with animated media background.
- Reference screenshot: `docs/design-references/innook-landing-1440x900.png` and `innook-landing-390x844.png`.

## Desktop geometry

- App container: max-width 1440px, centered, 48px horizontal inset, 48px top inset, 20px bottom inset.
- Header: one low-opacity 1px separator, brand on the left, history/language controls on the right.
- Hero: centered, approximately 39dvh minimum height.
- Display heading: Innook Songti Subset, 76px at desktop, 1.08 line-height, warm cream ink, slight tracking.
- CTA: 160×52px capsule, warm translucent fill, inset highlight, soft deep shadow.
- Footer: full-width 24px radius glass surface, approximately 162px high at 1512×827, 20px vertical and 28px horizontal padding.

## Glass treatment

- Surface fallback: `rgba(36, 31, 26, .34)`.
- Control fallback: `rgba(244, 231, 211, .08)`.
- Border: warm cream at approximately 16–42% opacity.
- Highlight: inset `0 1px 1px rgba(255,255,255,.16)`.
- Shadow: `0 18px 60px rgba(0,0,0,.2)`.
- Supported browsers add backdrop blur and saturation; the fallback remains readable without it.

## States

- Default landing: local looping muted home video with local poster fallback.
- Start studying: changes the shell to the scene-selection state without losing the selected Synapse material.
- Workspace: returns to the existing Synapse workspace route.
- Focus Trail: opens existing Synapse history/auth behavior.
- Reduced motion: media and control transitions are disabled.

## Responsive behavior

- Tablet/mobile: header insets shrink, language control becomes icon-sized, hero heading scales down, footer becomes a stacked grid.
- Mobile: content remains vertically scrollable; all controls remain touch-sized and the CTA remains centered.
