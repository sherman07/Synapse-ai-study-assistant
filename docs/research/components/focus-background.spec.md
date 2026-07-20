# FocusBackground Specification

## Overview

- Target: `frontend/src/focus-room/components/FocusBackground.jsx`
- Interaction model: time-driven media plus click-driven scene changes.
- Reference: full-viewport `<video>` with `poster`, muted, autoplay, loop; cover images for setup cards.

## Contract

- Render local Synapse media only; never hotlink Innook assets.
- Keep current poster visible until the next video has loaded enough to avoid a black frame.
- Crossfade old/new media in approximately 500–800ms.
- Use `object-fit: cover`; expose object-position per scene.
- Apply a warm/dark readability overlay and optional radial highlight.
- Pause media/audio when document visibility is hidden; restore without restarting the session.
- If a source fails, retain a local image fallback and add an accessible non-blocking status.

## Responsive behavior

- 1440/1280: full viewport cover with scene-specific focal positioning.
- 768: cover remains full viewport; UI takes more vertical space.
- 390: cover remains full viewport behind a scrollable setup surface; safe-area insets apply.
- Reduced motion: no GSAP pan/zoom; use static cover or a very short opacity change.

