import assert from "node:assert/strict";

const data = await import("../src/focus-room/data.js");

assert.equal(data.FOCUS_ROOM_MUSIC_TRACKS.length, 4);
assert.deepEqual(
  data.FOCUS_ROOM_MUSIC_TRACKS.map(track => track.label),
  ["Deep Focus", "Lo-fi", "Piano", "Minimal"]
);
assert.ok(data.FOCUS_ROOM_MUSIC_TRACKS.every(track => track.streamUrl && track.pageUrl && track.attribution && track.license));

assert.deepEqual(
  data.FOCUS_ROOM_AMBIENT_SOUNDS.map(sound => sound.label),
  ["Nature", "Cafe Rain", "Rain", "White Noise", "Ocean", "Wind"]
);
assert.ok(data.FOCUS_ROOM_AMBIENT_SOUNDS.every(sound => sound.layers.length && sound.pageUrl && sound.license));

const rainyCafe = data.FOCUS_ROOM_SCENES.find(scene => scene.id === "rainy-cafe");
assert.equal(rainyCafe.ambientSound, "Cafe Rain");
const rainyCafeProfile = data.getFocusRoomAudioProfile(rainyCafe);
assert.equal(rainyCafeProfile.musicTrack.label, "Lo-fi");
assert.equal(rainyCafeProfile.ambientSound.label, "Cafe Rain");
assert.equal(rainyCafeProfile.ambientLayers.length, 2);
assert.ok(rainyCafeProfile.ambientLayers.some(layer => /Cafe/i.test(layer.title)));
assert.ok(rainyCafeProfile.ambientLayers.some(layer => /Rain/i.test(layer.title)));

const oceanProfile = data.getFocusRoomAudioProfile({ musicType: "Deep Focus", ambientSound: "Ocean" });
assert.equal(oceanProfile.musicTrack.title, "Chasing Daylight");
assert.ok(oceanProfile.ambientLayers[0].streamUrl.includes("Waves.ogg"));

class MockAudio {
  static instances = [];

  constructor(src = "") {
    this.src = src;
    this.loop = false;
    this.preload = "";
    this.crossOrigin = "";
    this.volume = 1;
    this.paused = true;
    this.playCount = 0;
    this.pauseCount = 0;
    MockAudio.instances.push(this);
  }

  play() {
    this.paused = false;
    this.playCount += 1;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.pauseCount += 1;
  }
}

globalThis.Audio = MockAudio;
const audio = await import(`../src/focus-room/audio.js?audio=${Date.now()}`);

audio.setFocusRoomAudioPlaying(true);
await audio.syncFocusRoomAudio({
  musicType: "Deep Focus",
  ambientSound: "Cafe Rain",
  musicVolume: 40,
  ambientVolume: 30
});

let audioState = audio.getFocusRoomAudioState();
assert.equal(audioState.playing, true);
assert.equal(audioState.musicTitle, "Chasing Daylight");
assert.equal(audioState.ambientTitles.length, 2);
assert.equal(MockAudio.instances.filter(item => !item.paused).length, 3);

const music = MockAudio.instances.find(item => item.src.includes("sb_chasingdaylight"));
assert.ok(music, "Deep Focus should use the sourced Chasing Daylight track");
assert.equal(music.volume, 0.4);

const cafeLayer = MockAudio.instances.find(item => item.src.includes("Cafe_ambiance.ogg"));
const rainLayer = MockAudio.instances.find(item => item.src.includes("Rain_(1).ogg"));
assert.ok(cafeLayer, "Cafe Rain should include the cafe ambience layer");
assert.ok(rainLayer, "Cafe Rain should include the rain layer");
assert.ok(cafeLayer.volume > rainLayer.volume, "Cafe ambience should sit slightly above the rain layer");

audio.setFocusRoomAudioPlaying(false);
await audio.syncFocusRoomAudio({
  musicType: "Deep Focus",
  ambientSound: "Cafe Rain",
  musicVolume: 40,
  ambientVolume: 30
});

audioState = audio.getFocusRoomAudioState();
assert.equal(audioState.playing, false);
assert.equal(MockAudio.instances.every(item => item.paused), true);

console.log("focus room audio regression passed");
