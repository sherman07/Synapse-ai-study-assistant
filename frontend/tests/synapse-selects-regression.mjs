import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const selectScript = read("frontend/synapse-selects.js");
const selectStyles = read("frontend/synapse-selects.css");

for (const page of ["index", "landing", "login", "signup", "forgot-password"]) {
  const html = read(`frontend/${page}.html`);
  assert.ok(html.includes("synapse-selects.css?v=synapse-selects-v2"), `${page}.html should load select styles`);
  assert.ok(html.includes("synapse-selects.js?v=synapse-selects-v2"), `${page}.html should load select behavior`);
}

for (const token of [
  "role=\"combobox\"",
  "role=\"listbox\"",
  "role=\"option\"",
  "aria-selected",
  "window.SynapseSelects",
  "MutationObserver",
  "dispatchEvent(new Event(\"change\""
]) {
  assert.ok(selectScript.includes(token), `select script should include ${token}`);
}

for (const selector of [
  ".synapse-select__button",
  ".synapse-select__menu",
  ".synapse-select__option[aria-selected=\"true\"]",
  ".synapse-select--auth",
  ".synapse-select--hero",
  ".synapse-select--compact"
]) {
  assert.ok(selectStyles.includes(selector), `${selector} should have branded select styles`);
}

console.log("synapse selects regression passed");
