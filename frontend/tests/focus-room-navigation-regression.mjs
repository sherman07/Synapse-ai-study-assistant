import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const setup = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/FocusRoomSetup.jsx"), "utf8");
const page = fs.readFileSync(path.join(root, "frontend/src/focus-room/components/FocusRoomPage.jsx"), "utf8");
const store = fs.readFileSync(path.join(root, "frontend/src/focus-room/hooks/useFocusRoomStore.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "frontend/styles/09-focus-room.css"), "utf8");
const html = fs.readFileSync(path.join(root, "frontend/focus-room.html"), "utf8");

assert.match(setup, /Choose your study scene/, "Focus Room setup shows the image-based scene chooser");
assert.match(setup, /SceneSelector/, "Focus Room setup renders all available scenes");
assert.match(setup, /Enter Focus Room/, "Focus Room setup exposes the session entry action");
assert.match(setup, /data-focus-enter/, "Enter Focus Room action is tagged for automation");
assert.match(page, /FocusRoomSetup/, "Focus Room page must render setup before the session scene");
assert.match(page, /view === "setup"/, "Focus Room page must branch on setup view");
assert.match(store, /view: "setup"/, "Focus Room store must initialize in setup");
assert.match(store, /returnToSetup/, "Focus Room must support returning to setup from the session");
assert.match(styles, /\.focus-setup-scenes/, "Focus Room scene panel is styled");
assert.match(styles, /\.scene-card/, "Focus Room scene cards are styled");
assert.match(styles, /\.focus-setup-scene-preview/, "Setup should preview the selected scene");
assert.match(html, /auth-client\.js/, "Standalone Focus Room loads the shared Synapse auth client");
assert.match(html, /focus-room-loader-v11/, "Standalone Focus Room loads the cache-busted runtime");

console.log("focus-room-navigation-regression: passed");
