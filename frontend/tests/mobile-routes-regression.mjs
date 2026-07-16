import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const routes = [
  "404.html", "billing-cancel.html", "billing-success.html", "focus-room.html",
  "forgot-password.html", "index.html", "landing.html", "login.html", "pricing.html",
  "privacy.html", "reset-password.html", "signup.html", "terms.html", "verify.html",
];

for (const route of routes) {
  assert.match(read(`frontend/${route}`), /viewport-fit=cover/, `${route} should support display cutouts`);
}

assert.match(read("frontend/src/landing/landing.css"), /@media \(max-width: 639px\)/);
assert.match(read("frontend/landing-auth.css"), /@media \(max-width: 639px\)/);
assert.match(read("frontend/billing-pages.css"), /@media \(max-width: 639px\)/);

console.log("mobile route regression checks passed");
