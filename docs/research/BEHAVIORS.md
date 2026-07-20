# Reference Behaviors

## Interaction model

- Landing CTA: click-driven transition from hero to setup.
- Scene page navigation: click-driven page replacement; each page contains eight selectable cards.
- Scene selection: click-driven, active card ring/fill, background media source replacement.
- Music and duration: click-driven controls; selection uses a warm translucent active state.
- Active timer: time-driven. The visible time must derive from timestamps, not render count.
- Pause/resume: click-driven state transition; resume keeps the same selected room and audio mix.
- Focus Mode: click-driven entry, click/overlay/keyboard exit; timer and media continue without restarting.
- Settings/Trail/Companion: click-driven overlay/drawer toggles. The room stays mounted behind them.
- Exit: click-driven confirmation before ending and saving.
- Hover/focus/pressed: CSS-driven warm-ink and border/shadow feedback; all icon-only controls need explicit labels.

## Transition evidence

- Background scene transition is an opacity/crossfade interaction, not a hard instant swap.
- The observed page uses approximately 0.3s control transitions and approximately 0.5–0.8s large surface/media transitions.
- Focus Mode uses a compact card entering from the lower-left; hidden HUD content does not cause a page layout shift.
- Settings and side panels use a spring-like/soft slide entry with a dimming scrim.

## Responsive behaviors

- `>= 1024px`: wide centered scene panel plus narrow vertical controls.
- `768px`: scene setup becomes a constrained two-column composition with two-column cards and a full-height controls column.
- `390px`: one-column scrollable setup; horizontal scene rows; controls follow content; enter action is full-width.
- Active room controls remain touch targets at least 44px and reposition into a compact mobile dock/sheet.

## Media behaviors

- Use the current scene's video and poster only; preload the likely next scene, not the entire library.
- On `visibilitychange`, pause or lower inactive media/audio and reconcile time from the last timestamp when visible again.
- On media failure, retain the poster/local cover and show no bright flash or empty black frame.
- Scene changes must dispose previous video/audio resources and avoid duplicate playback.

