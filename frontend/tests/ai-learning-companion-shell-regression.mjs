import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const appShell = read("frontend/src/react/components/AppShell.js");
const controller = read("frontend/src/legacy/controller.js");
const modeSection = read("frontend/src/legacy/controller_sections/14_learningcompanion.js");
const companionWorkspace = read("frontend/src/react/components/CompanionWorkspace.js");
const companionClient = read("frontend/src/legacy/learningCompanionClient.js");
const styles = read("frontend/styles/01-section.css");

assert.ok(appShell.includes("LearningModeSwitcher"));
assert.ok(appShell.includes("CompanionWorkspace"));
assert.ok(controller.includes('"14_learningcompanion.js"'));
assert.ok(modeSection.includes("const LEARNING_EXPERIENCE_STORAGE_KEY"));
assert.ok(modeSection.includes("function setLearningExperienceMode(mode)"));
assert.ok(modeSection.includes('mode !== "materials" && mode !== "companion"'));
assert.ok(modeSection.includes("appLayout.dataset.learningExperienceMode"));
assert.ok(styles.includes('[data-learning-experience-mode="companion"]'));
assert.ok(companionWorkspace.includes("data-learning-companion-create-subject"));
assert.ok(companionWorkspace.includes("data-learning-companion-send"));
assert.ok(companionWorkspace.includes("requestLearningCompanionDecision"));
assert.ok(companionClient.includes('"/api/learning/subjects"'));
assert.ok(companionClient.includes('"/learning-companion/respond"'));
assert.ok(styles.includes('[data-learning-experience-mode="companion"] .learning-experience-shell'));

console.log("ai learning companion shell regression passed");
