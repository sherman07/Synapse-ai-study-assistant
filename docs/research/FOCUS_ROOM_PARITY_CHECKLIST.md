# Focus Room Parity Checklist

## Reference parity

- [x] Landing reference captured at desktop and mobile.
- [x] Scene selection captured at 1440, 1280, 768, and 390 widths.
- [x] Scene page pagination observed.
- [x] Music category and timer selection observed.
- [x] Active room, pause, resume, and completion flow observed.
- [x] Focus Mode observed.
- [x] Settings and independent mixer categories observed.
- [x] Focus Trail unauthenticated state observed; authenticated state marked blocked.
- [x] Companion Room unauthenticated state observed; authenticated state marked blocked.
- [x] Exit confirmation observed.
- [ ] Reference light preference observed through browser surface.
- [ ] Reference reduced-motion rendering observed through browser surface.

## Implementation parity

- [ ] Full viewport local scene media with poster fallback and crossfade.
- [ ] Responsive scene setup at desktop, laptop, tablet, mobile portrait/landscape.
- [ ] Minimal Synapse header with glass controls.
- [ ] Bottom session dock and compact Focus Mode timer.
- [ ] Timestamp-based idle/running/paused/completed/break/restoring timer state machine.
- [ ] Autosave, refresh restoration, hidden-tab reconciliation, duplicate-timer guard.
- [ ] Settings panel with all required scene/audio controls.
- [ ] Independent audio channels with cleanup and crossfade.
- [ ] Focus Trail and Companion Room using existing auth state without invented private UI.
- [ ] Synapse Tools glass drawer preserving material, notes, search, sources, AI Tutor, quiz, flashcards, mind map, notes, history, and progress.
- [ ] Existing generated content and APIs preserved.
- [ ] Keyboard focus, Escape close, reduced motion, high zoom, safe area, screen-reader labels.
- [ ] Empty, loading, unavailable-media, unauthenticated, and long-content states.
- [ ] Unit/interaction tests for timer, persistence, scene selection, pause/resume, Focus Mode, tools.
- [ ] Production build and browser console clean.
- [ ] Side-by-side visual QA at 1440 and 390.

