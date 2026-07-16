# Compact Workspace Switcher Design

## Decision

Remove the large `Choose your workspace` card from the learning workspace. Replace it with a compact segmented `Materials | Companion` switch positioned at the top-right of the content area.

## Behaviour

- The switch remains visible in both Materials and Companion modes.
- It uses the existing accessible button and mode-state bridge; no routing or mode semantics change.
- The active mode remains visually distinct and each option has a short label.
- The control moves with the workspace on narrow screens without covering the composer, upload controls, or hero copy.

## Layout

- Materials mode: the switch occupies the top-right of the content column and the upload hero starts at its normal visual position, without a large introductory card above it.
- Companion mode: the switch stays in the corresponding top-right position above the chat card.
- The previous large heading, explanatory paragraph, and card padding are removed.

## Scope and verification

Only `LearningModeSwitcher`, its scoped CSS, and the existing shell regression test change. Materials, Companion chat behaviour, upload inputs, history sidebar, and mode persistence remain unchanged.

Verification checks that the compact switch exists, the former large workspace copy is absent, both buttons still expose their existing targets, and the frontend regression suite/build pass.
