import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const landingHtml = fs.readFileSync(path.join(repoRoot, "frontend/landing.html"), "utf8");
const landingCss = fs.readFileSync(path.join(repoRoot, "frontend/landing-auth.css"), "utf8");

assert.equal((landingHtml.match(/data-cycle-step="/g) || []).length, 6);
assert.ok(!landingHtml.includes("landing-step-arrow"));
assert.ok(landingCss.includes("grid-template-columns: repeat(3, minmax(0, 1fr))"));
assert.ok(landingCss.includes('.landing-step[data-cycle-step="3"]::after'));
assert.ok(landingCss.includes('.landing-step[data-cycle-step="4"]'));
assert.ok(landingCss.includes("grid-column: 3"));
assert.ok(landingCss.includes('.landing-step[data-cycle-step="6"]::after'));

const step4ArrowBlock = landingCss.match(/\.landing-step\[data-cycle-step="4"\]::after\s*\{[^}]+\}/)?.[0] || "";
assert.ok(step4ArrowBlock.includes("display: none"));

const step6ArrowBlock = landingCss.match(/\.landing-step\[data-cycle-step="6"\]::after\s*\{[^}]+\}/)?.[0] || "";
assert.ok(step6ArrowBlock.includes('content: "\\2191"'));
assert.ok(step6ArrowBlock.includes("animation: arrow-pulse-up"));

const badgeBlock = landingCss.match(/\.landing-pricing-badge\s*\{[^}]+\}/)?.[0] || "";
assert.ok(badgeBlock.includes("top: 18px"));
assert.ok(badgeBlock.includes("min-width: 168px"));
assert.ok(badgeBlock.includes("white-space: nowrap"));
assert.ok(badgeBlock.includes("z-index: 4"));

const featuredBlock = landingCss.match(/\.landing-pricing-featured\s*\{[^}]+\}/)?.[0] || "";
assert.ok(featuredBlock.includes("padding-top: 72px"));

console.log("landing layout regression passed");
