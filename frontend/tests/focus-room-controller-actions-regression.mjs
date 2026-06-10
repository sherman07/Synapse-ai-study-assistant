import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const controller = read("frontend/src/focus-room/controller.js");
const focusSessionHook = read("frontend/src/focus-room/hooks/useFocusSession.js");
const aiPanel = read("frontend/src/focus-room/components/AILearningPanel.jsx");
const focusUtils = read("frontend/src/focus-room/utils.js");

for (const token of [
  "createRoot",
  "QueryClientProvider",
  "HashRouter",
  "FocusRoomPage",
  "exposeFocusRoomGlobals",
  "startFocusRoomSession",
  "returnFromFocusRoom",
  "toggleFocusLearningPanel",
  "updateFocusSound"
]) {
  assert.ok(controller.includes(token), `React controller should preserve ${token}`);
}

for (const token of [
  "__synapseFocusRoomApi",
  "returnFromFocusRoomToWorkspace",
  "switchTool",
  "openAssistant",
  "explicitMaterialId",
  "typeof materialId",
  "returnMaterialId",
  "flashcards",
  "quiz",
  "assistant",
  "mindmap",
  "timeline"
]) {
  assert.ok(focusSessionHook.includes(token), `Focus session hook should preserve workspace action ${token}`);
}

for (const token of [
  "Open Flashcard Workspace",
  "Open Quiz Workspace",
  "Open Mind Map Workspace",
  "Open Workspace Assistant",
  "Open Timeline Workspace",
  "Tabs.Root",
  "Dialog.Root"
]) {
  assert.ok(aiPanel.includes(token), `AI Learning Panel should preserve ${token}`);
}

assert.ok(
  focusUtils.includes('if (tab === "plan") return "Study Plan"'),
  "AI Learning Panel plan tab should be labelled Study Plan"
);

console.log("focus room controller actions regression passed");
