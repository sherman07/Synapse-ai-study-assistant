import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = file => fs.readFileSync(path.join(repoRoot, file), "utf8");

const controller = read("frontend/src/focus-room/controller.js");
const focusSessionHook = read("frontend/src/focus-room/hooks/useFocusSession.js");
const aiPanel = read("frontend/src/focus-room/components/AILearningPanel.jsx");
const focusToolPanel = read("frontend/src/focus-room/components/FocusRoomToolPanel.jsx");
const focusUtils = read("frontend/src/focus-room/utils.js");
const aiPanelImplementation = `${aiPanel}\n${focusToolPanel}`;

for (const token of [
  "createRoot",
  "FocusRoomPage",
  "exposeFocusRoomGlobals",
  "startFocusRoomSession",
  "returnFromFocusRoom",
  "toggleFocusLearningPanel",
  "updateFocusSound"
]) {
  assert.ok(controller.includes(token), `React controller should preserve ${token}`);
}
assert.ok(!controller.includes("QueryClientProvider"), "React controller should not reintroduce the React Query boot wrapper");
assert.ok(!controller.includes("HashRouter"), "React controller should not reintroduce the React Router boot wrapper");
assert.ok(
  controller.includes("FocusRoomPage.jsx?v=focus-room-react-vite-v5"),
  "React controller should cache-bust the hook-owning FocusRoomPage module"
);

for (const token of [
  "__synapseFocusRoomApi",
  "returnFromFocusRoomToWorkspace",
  "switchTool",
  "openAssistant",
  "explicitMaterialId",
  "typeof materialId",
  "returnMaterialId",
  "workspaceTarget",
  "flashcards",
  "quiz",
  "assistant",
  "mindmap",
  "timeline",
  "source",
  "notes"
]) {
  assert.ok(focusSessionHook.includes(token), `Focus session hook should preserve workspace action ${token}`);
}

assert.ok(
  focusSessionHook.includes("returnFromFocusRoomToWorkspace(returnMaterialId, workspaceTarget)"),
  "Focus Room should pass direct source/note targets to the workspace bridge"
);

for (const token of [
  "Open Flashcard Workspace",
  "Open Quiz Workspace",
  "Open Mind Map Workspace",
  "Open Workspace Assistant",
  "Open Timeline Workspace",
  "Tabs.Root",
  "Dialog.Root"
]) {
  assert.ok(aiPanelImplementation.includes(token), `AI Learning Panel should preserve ${token}`);
}

assert.ok(
  focusUtils.includes('if (tab === "plan") return "Study Plan"'),
  "AI Learning Panel plan tab should be labelled Study Plan"
);

console.log("focus room controller actions regression passed");
