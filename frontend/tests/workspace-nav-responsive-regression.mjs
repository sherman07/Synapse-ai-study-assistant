import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const historyNav = read("frontend/src/react/components/HistoryNavigation.js");
const appShell = read("frontend/src/react/components/AppShell.js");
const uploaded = read("frontend/src/legacy/controller_sections/01_uploadedfiles.js");
const boot = read("frontend/src/legacy/controller_sections/99_boot.js");
const layoutCss = read("frontend/styles/01-section.css");
const sectionCss = read("frontend/styles/02-section.css");

assert.match(historyNav, /historyNavToggle/, "learning rail should expose a hide/show toggle");
assert.match(historyNav, /toggleHistoryNav/, "learning rail toggle should call toggleHistoryNav");
assert.match(historyNav, /bi-chevron-double-left/, "expanded rail should show a left chevron to hide");
assert.match(appShell, /workspace-shell/, "learning rail should live outside the notes/tutor grid shell");
assert.match(appShell, /has-learning-rail/, "app layout should advertise the learning rail for spacing");
assert.match(appShell, /historyNavExpand/, "collapsed rail should expose a floating expand control");
assert.match(appShell, /bi-chevron-double-right/, "expand control should show a right chevron");

assert.match(uploaded, /HISTORY_NAV_COLLAPSED_KEY/, "history collapse preference should persist");
assert.match(uploaded, /function toggleHistoryNav/, "toggleHistoryNav should exist");
assert.match(uploaded, /function applyHistoryNavCollapsed/, "history collapse should sync layout classes");
assert.match(uploaded, /history-collapsed/, "layout should use a history-collapsed class");
assert.match(boot, /toggleHistoryNav/, "boot should expose toggleHistoryNav");

assert.match(
  layoutCss,
  /\.app-layout\.has-learning-rail:not\(\.history-collapsed\)\s*\{[\s\S]*?padding-left: 280px;/,
  "open learning rail should reserve horizontal space instead of overlaying content"
);
assert.match(
  layoutCss,
  /\.workspace-shell:has\(\.app-layout\.history-collapsed\) \.history-nav\.dark-learning-rail[\s\S]*?transform: translateX\(-100%\);/,
  "collapsed learning rail should slide off-canvas"
);
assert.match(
  layoutCss,
  /\.result-grid\.source-open\s*\{[\s\S]*?minmax\(0, 1fr\) minmax\(280px, 0\.95fr\)/,
  "sources split should stay fluid instead of fixed 440/560 mins"
);
assert.match(
  layoutCss,
  /\.app-layout:not\(\.assistant-closed\) \.result-grid\.source-open\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/,
  "sources + tutor should stack on typical widths so notes are not crushed"
);
assert.match(
  sectionCss,
  /\.app-layout:not\(\.assistant-closed\) \.source-open \.source-viewer-panel/,
  "sources panel should reflow when the tutor is open"
);

console.log("workspace-nav-responsive-regression: passed");
