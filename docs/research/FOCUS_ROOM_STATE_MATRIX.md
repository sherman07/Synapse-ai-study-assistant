# Focus Room State Matrix

| State | Entry | Observable UI | Required Synapse behavior | Evidence |
|---|---|---|---|---|
| Landing | Focus Room entry | Full media hero, branding, CTA | Keep Synapse brand and material context | `innook-landing-1440x900.png`, `innook-landing-390x844.png` |
| Setup / scene page 1 | Start studying or again | 8 scene cards, prev/next, music, duration, enter | Use real material and persisted draft settings | `innook-selection-1440x900.png` |
| Setup / scene page 2 | Next scene | Second 8-scene page | Preserve selected scene/music/duration | Browser interaction sweep |
| Setup / selected | Scene/music/duration control | active ring/fill and changed background | Update draft only; no timer reset | Browser interaction sweep |
| Idle session | Enter room | `POMODORO #1`, countdown, goal, dock | Real selected material, session goal, media/audio state | Active room screenshot |
| Running | Start/resume | `学习中`, live countdown, progress | Timestamp-based state machine | Active room + timer audit |
| Paused | Pause | `已暂停`, frozen time, play/resume control | Persist pause and restore safely | Pause screenshot |
| Focus Mode | Focus Mode button | Compact timer card, hidden nonessential HUD | Preserve timer/content/audio; Escape/click exit | Focus Mode screenshot |
| Settings open | Settings header button | Translucent panel with scenes and mixer | Keep timer/media running; independent audio channels | Settings screenshot |
| Scene switching | Settings scene button | Background/poster/video changes | Crossfade and dispose stale media | Settings interaction audit |
| Focus Trail unauthenticated | Trail button | Login panel | Use existing Synapse auth/session; do not fake records | Trail screenshot; authenticated view blocked |
| Companion unauthenticated | Companion button | Idle/login panel | Use account state; retain room | Companion screenshot; authenticated view blocked |
| Exit confirmation | Exit button | Continue / end and exit dialog | Pause only on confirmation, save session | Exit screenshot |
| Completed | End and exit / timer completion | Summary and again CTA | Save focus stats and return without data loss | Completion DOM state |
| Restoring | Refresh/reopen | Session restored or safe paused state | Read active snapshot, never duplicate timers | Existing persistence model + new tests |
| Empty material | Focus Room without material | Empty setup state | Keep workspace CTA and no mock production data | Existing Synapse empty path |
| Media unavailable | Scene asset failure | Poster/fallback and error-neutral UI | No black flash, no console error | New interaction test |
| Reduced motion | OS preference | No parallax/spring/large transitions | Keep all controls functional | CSS media query requirement |

