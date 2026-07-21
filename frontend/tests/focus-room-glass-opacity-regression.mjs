import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const styles = fs.readFileSync(path.join(root, "frontend/styles/09-focus-room.css"), "utf8");

// Focus Room now uses ONE unified translucent glass material so every console
// surface and control reads as the same piece of glass over the scene.
assert.match(styles, /Unified glass system/, "Focus Room should document the unified glass system");
assert.match(styles, /--fr-glass:\s*linear-gradient/, "the shared glass fill token must be defined");
assert.match(styles, /--fr-glass-soft:\s*rgba\(250, 245, 237, 0\.1\)/, "the shared control fill token must be defined");
assert.match(styles, /--fr-border:\s*rgba\(250, 245, 237, 0\.22\)/, "the shared glass border token must be defined");

// The same material must cover panels, dock, timer, and control surfaces.
assert.match(
  styles,
  /\.react-focus-room \.liquid-glass,[\s\S]*?\.react-focus-room \.focus-session-dock,[\s\S]*?\.react-focus-room \.timer-card,[\s\S]*?background: var\(--fr-glass\);/,
  "core console surfaces should all share the unified glass fill"
);

// Buttons and inputs share the same translucency so nothing looks more opaque.
assert.match(
  styles,
  /\.react-focus-room \.glass-button,[\s\S]*?background: var\(--fr-glass-soft\);/,
  "buttons and inputs should share the unified control fill"
);

// Readability floor: solid fallbacks when transparency/blur is unavailable.
assert.match(styles, /@supports not \(backdrop-filter: blur\(1px\)\)[\s\S]*?rgba\(24, 21, 19, 0\.82\)/, "a no-backdrop-filter fallback must keep contrast");
assert.match(styles, /@media \(prefers-reduced-transparency: reduce\)[\s\S]*?rgba\(24, 21, 19, 0\.9\)/, "reduced-transparency users must get a near-solid surface");

// The settings panel is the wide two-column CONTROL layout.
assert.match(styles, /\.react-focus-room \.focus-utility-panel\.room-control-panel/, "the room control panel should have a dedicated wide layout");
assert.match(styles, /\.room-control-grid\s*\{[\s\S]*?grid-template-columns: minmax\(0, 0\.92fr\) minmax\(0, 1\.08fr\)/, "the control panel should use a two-column scenes/audio grid");
assert.match(styles, /\.room-control-masters\s*\{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/, "music and scene sound should sit side by side");
assert.match(styles, /\.room-channel-card\.is-active/, "active ambient cards should light up against the glass");
assert.match(
  styles,
  /\.react-focus-room \.focus-session-grid\s*\{[\s\S]*?opacity: 1;[\s\S]*?pointer-events: auto;/,
  "the floating pomodoro hero must be visible in the session stage"
);
assert.match(styles, /\.timer-card\.floating-pomodoro/, "session should use the floating pomodoro glass card");
assert.match(styles, /\.timer-editor-dock/, "the dock timer should support segmented editing");

const drawers = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/FocusRoomDrawers.jsx"), "utf8");
assert.match(drawers, /function RoomControlPanel/, "settings should render the wide RoomControlPanel");
assert.match(drawers, /Ambient atmosphere/, "settings should expose ambient atmosphere channels");
assert.match(drawers, /Focus noise/, "settings should expose focus noise channels");
assert.match(drawers, /room-control-masters/, "music and scene sound should share a masters row");

const timerCard = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/TimerCard.jsx"), "utf8");
const dock = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/BottomControlDock.jsx"), "utf8");
assert.match(timerCard, /EditableTimer/, "floating pomodoro should use the segmented editor");
assert.match(dock, /EditableTimer/, "dock timer should use the segmented editor when idle");
assert.match(dock, /size="dock"/, "dock editor should use the compact dock size");

console.log("focus-room-glass-opacity-regression: passed");
