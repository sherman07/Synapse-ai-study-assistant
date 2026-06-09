import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const guardSource = fs.readFileSync(path.resolve(__dirname, "../src/legacy/devReloadGuard.js"), "utf8");
const index = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");

function createWindow(port, hostname = "127.0.0.1") {
  class FakeWebSocket {
    constructor(url) {
      this.url = url;
      this.listeners = {};
    }

    addEventListener(type, handler) {
      this.listeners[type] = [...(this.listeners[type] || []), handler];
    }

    dispatch(type, event) {
      for (const handler of this.listeners[type] || []) {
        handler(event);
      }
    }
  }

  const win = {
    location: { hostname, port, host: `${hostname}:${port}` },
    WebSocket: FakeWebSocket
  };
  vm.runInNewContext(guardSource, { window: win });
  return win;
}

for (const port of ["5500", "5501"]) {
  const win = createWindow(port);
  assert.equal(win.__synapseLiveServerReloadGuard, true);

  const socket = new win.WebSocket(`ws://127.0.0.1:${port}/ws`);
  let messageHandled = false;
  let stopped = false;
  socket.onmessage = () => {
    messageHandled = true;
  };
  socket.dispatch("message", {
    data: "reload",
    stopImmediatePropagation: () => {
      stopped = true;
    }
  });
  assert.equal(stopped, true, `reload should be stopped on ${port}`);
  assert.equal(messageHandled, false, `reload should not reach onmessage on ${port}`);
}

const ipv6Window = createWindow("5500", "[::1]");
assert.equal(ipv6Window.__synapseLiveServerReloadGuard, true);

const productionWindow = createWindow("443");
assert.equal(productionWindow.__synapseLiveServerReloadGuard, undefined);
assert.ok(index.includes("devReloadGuard.js?v=live-server-guard-v4"));

console.log("dev reload guard regression passed");
