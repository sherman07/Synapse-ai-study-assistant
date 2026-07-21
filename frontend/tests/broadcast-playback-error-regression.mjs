import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(__dirname, "../src/legacy/controller_sections/12_broadcastjobs.js"),
  "utf8"
);

assert.match(
  source,
  /function showBroadcastPlaybackError\(job, error\)/,
  "playback failures should render in the player instead of using a modal alert"
);
assert.match(
  source,
  /const safeSdp = String\(sdp \|\| ""\)\.trim\(\);/,
  "realtime playback should normalize the browser SDP offer before building multipart data"
);
assert.match(
  source,
  /if \(!safeSdp\) throw new Error\("Realtime Broadcast could not create an audio offer\. Please try Play again\."\);/,
  "missing SDP should produce an actionable local playback error"
);
assert.doesNotMatch(
  source,
  /toggleBroadcastPlayback[\s\S]*?alert\(normaliseBroadcastRealtimeError\(error\)\)/,
  "the main playback failure path should not show a blocking browser alert"
);

const helperStart = source.indexOf("function buildBroadcastRealtimeFormData");
const helperEnd = source.indexOf("function broadcastPlaybackSections", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "realtime form helper should remain extractable");

const context = new Function(`
  class FormData {
    constructor() { this.entries = []; }
    append(name, value) { this.entries.push([name, String(value)]); }
  }
  function selectedBroadcastRate() { return 1; }
  ${source.slice(helperStart, helperEnd)}
  return { buildBroadcastRealtimeFormData };
`)();

assert.throws(
  () => context.buildBroadcastRealtimeFormData({ broadcastTitle: "Test" }, ""),
  /could not create an audio offer/
);

const formData = context.buildBroadcastRealtimeFormData(
  { broadcastTitle: "Test", broadcastScript: "A script." },
  "v=0\\r\\n"
);
assert.deepEqual(formData.entries[0], ["sdp", "v=0\\r\\n"]);

console.log("broadcast playback error regression passed");
