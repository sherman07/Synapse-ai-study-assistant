import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const historyNavigation = fs.readFileSync(path.join(repoRoot, "frontend/src/react/components/HistoryNavigation.js"), "utf8");
const mobileNavigation = fs.readFileSync(path.join(repoRoot, "frontend/src/react/components/MobileNavigation.js"), "utf8");
const boot = fs.readFileSync(path.join(repoRoot, "frontend/src/legacy/controller_sections/99_boot.js"), "utf8");
const accountController = fs.readFileSync(path.join(repoRoot, "frontend/src/legacy/controller_sections/08_extractrealtimeresponsetranscript.js"), "utf8");
const accountCss = fs.readFileSync(path.join(repoRoot, "frontend/styles/04-section.css"), "utf8");

assert.ok(historyNavigation.includes("history-account-btn"));
assert.ok(historyNavigation.includes("history-account-plan account-menu-plan"));
assert.ok(!historyNavigation.includes(">Account<"));
assert.ok(historyNavigation.includes("account-popover"));
assert.ok(historyNavigation.includes("openAccountPanel('profile')"));
assert.ok(historyNavigation.includes("signOutAccount()"));
assert.ok(!historyNavigation.includes('class="history-new-btn" type="button" onclick="resetWorkspace()"'));

assert.ok(mobileNavigation.includes("mobile-account-summary"));
assert.ok(mobileNavigation.includes("New workspace"));

for (const exportedName of [
  "renderAccountMenu",
  "openAccountPanel",
  "closeAccountPanel",
  "goToAuthPage",
  "signOutAccount"
]) {
  assert.ok(boot.includes(exportedName), `${exportedName} should be exported on window`);
}

assert.ok(accountController.includes('AUTH_SESSION_STORAGE_KEY = "synapse.auth.session.v1"'));
assert.ok(accountController.includes("function renderAccountMenu()"));
assert.ok(accountController.includes("function openAccountPanel"));

for (const selector of [
  ".account-menu",
  ".history-account-btn",
  ".history-account-plan",
  ".account-popover",
  ".account-panel-overlay",
  ".mobile-account-summary"
]) {
  assert.ok(accountCss.includes(selector), `${selector} should have CSS`);
}

console.log("account menu regression passed");
