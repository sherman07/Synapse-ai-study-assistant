import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const styles = fs.readFileSync(path.join(root, "frontend/styles/09-focus-room.css"), "utf8");

assert.match(styles, /Opaque liquid-glass pass/, "Focus Room should document the opaque glass readability pass");
assert.match(styles, /\.react-focus-room \.liquid-glass[\s\S]*rgba\(255, 255, 255, \.24\)/, "Liquid glass panels should use a denser fill");
assert.match(styles, /\.react-focus-room \.focus-session-dock[\s\S]*rgba\(22, 19, 17, \.64\)/, "The session dock should use a denser glass fill");
assert.match(styles, /\.react-focus-room \.focus-utility-panel[\s\S]*rgba\(25, 21, 18, \.66\)/, "The utility panel should use a denser glass fill");
assert.match(styles, /\.react-focus-room \.header-icon-button[\s\S]*rgba\(20, 17, 15, \.32\)/, "Header glass controls should use a denser fill");

console.log("focus-room-glass-opacity-regression: passed");
