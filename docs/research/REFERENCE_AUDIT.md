# Innook Reference Audit

## Audit scope

- URL: `https://innook.cn/`
- Capture date: 2026-07-18
- Browser: Chrome via browser automation
- Captured viewports: 1440×900, 1280×800, 768×1024, 390×844
- Captured artifacts: `docs/design-references/innook-landing-*.png` and `innook-selection-*.png`
- Current browser preferences observed: dark color scheme, reduced motion not enabled.

## Asset and licensing decision

The public page loads Innook logos, cover images, videos, and a custom serif font from `innook.cn` and `media.innook.cn`. The user explicitly authorized reproduction for this task. The scene covers, landing/selection videos, and display font used for the visual clone are therefore downloaded into `frontend/assets/focus-room/innook/`; production code does not hotlink the reference. Innook logos and brand wording are not used: the rendered brand remains Synapse. Existing audio sources in Synapse remain governed by their current attribution/license metadata.

## Global visual system

- Full-viewport cinematic media, `object-fit: cover`, with a dark readability gradient and a warm cream ink color (`#f4e7d3`).
- Body uses near-black fallback (`rgb(5,5,4)`); the main app shell is black.
- Body font is Arial/system sans; display headings use `"Innook Songti Subset", "Songti SC", STSong, "Noto Serif CJK SC", "Source Han Serif SC", serif`.
- Glass treatment uses warm translucent surfaces, hairline cream borders, inset white highlights, deep soft shadows, and very subtle radial highlights. The live page reports `backdrop-filter: none` in this browser, so the clone must provide blur when supported plus a solid translucent fallback.
- Desktop header has 48px horizontal inset and roughly 22–52px top inset depending on viewport. Header content is separated from the page with a 1px low-opacity line.
- Primary content is centered; desktop setup max width is approximately 1060px, with a wide scene panel and a narrow vertical capsule control rail.
- Text is quiet, low-contrast warm cream; active controls use brighter ink, a translucent warm fill, and a cream border/ring.

## Landing state

At 1440×900 the landing state is a single viewport with a 960×720 source cover/video scaled to fill 1440×900. The hero is centered around the horizontal midpoint, with a small uppercase kicker, a large serif heading, a 160×52 pill CTA, and two small app download pills below. A rounded glass footer card spans almost the full width near the bottom.

At 390×844 the content becomes vertically scrollable (`scrollHeight` observed at 956px), the heading splits into two lines, download pills remain functional, and footer/social content flows below the hero rather than being permanently compressed into the desktop footer row.

## Scene-selection state

- Entered by the landing `开始学习` action; URL/state stays inside the app.
- Desktop scene selection uses a 2×4 card grid inside a wide rounded glass panel. The first page contains 8 scenes, and the next-page control swaps in another 8 scenes.
- At 1440×900 the primary panel is approximately `845×570` at `(256,130)` and the right capsule is approximately `62×391` at `(1122,220)`.
- At 1280×800 the main setup stays desktop-like: layout approximately `928×561` at `(176,116)`, scene panel `847×561`, capsule `62×372`.
- At 768×1024 the layout becomes a two-column stacked-height composition: scene panel approximately `433×910` and settings panel approximately `191×910`; scene cards become 2 columns.
- At 390×844 the scene panel and controls become a single vertical column. Cards become horizontal rows approximately `338×98`, controls follow at the bottom, and the document scrolls to approximately 916px.
- Desktop right capsule exposes five music categories: Lo-fi Chill, Ambient Piano, Nature Ambient, Acoustic Warm, Deep Focus; then 25, 45, 50, 90 minutes and count-up; the final circular arrow enters the room.
- Mobile controls expose the same functionality in labeled horizontal controls and a full-width enter button.

## Active room

- Full viewport cinematic video/cover media remains visible behind all UI.
- Header keeps the logo at left and four compact glass circular actions at right: Focus Trail, Companion Room, Settings, Exit.
- Desktop bottom dock is approximately `896×92` at `(272,772)` for 1440×900. It contains Pomodoro label/status, large live time, progress line, today goal, pause/play, and Focus Mode controls.
- The initial session begins at `POMODORO #1`, status `学习中`, with a 25:00 countdown in the observed flow.
- Pausing changes status to `已暂停`, freezes the time, and swaps the pause icon to resume/play.
- Focus Mode hides the normal dock and exposes a smaller floating timer card at the lower-left, while the top header remains. It shows session number, status, remaining time, progress percentage, and a full-viewport exit affordance.
- Exiting a running room opens a compact confirmation dialog: `结束这一轮专注？`, with `继续专注` and `结束并退出`. Ending produces a completion state with elapsed duration and `再来一轮`.

## Settings, trail, and companion panels

- Settings is an absolute glass panel on desktop, approximately `768×560` at 1440×900, anchored from the right side below the header. It has scene library, five music radio buttons, master music slider, random-track action, scene sound preset selector, save-current-mix action, and independent sliders for white/pink/brown noise, rain/waves/wind/fire/train/cafe/street/forest/summer night/waterfall, and typing/page-turning/writing.
- Scene switching inside settings crossfades the current background from one media source to another and updates recommended scene sound.
- Focus Trail opens a right-side glass drawer but is blocked by an unauthenticated login surface. The audit did not submit credentials or invent the authenticated view.
- Companion Room opens a left-side glass panel showing an idle state and a login CTA. The unauthenticated state is fully inspectable and will be represented in Synapse with the user session/identity already available.

## Media and loading observations

- The landing and room use muted looping `<video>` elements with a poster image. Scene selection uses cover images for thumbnails and switches the background video source.
- Initial media can continue playing while controls mount. A poster is available before the video is ready.
- Local Synapse implementation will not request Innook media. It will reuse local licensed/owned scene assets and supply a fallback surface when media is unavailable.

## Unavailable states

- Authenticated Focus Trail and Companion Room states were blocked by the reference login requirement and were not probed.
- Light system preference and reduced-motion rendering were not switchable through the connected browser surface; media-query defaults were observed as dark and no-preference. Synapse implementation must still honor both CSS media queries.
