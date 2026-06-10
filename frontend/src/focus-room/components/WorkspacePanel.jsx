import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { spring } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function WorkspacePanel({ onWorkspace }) {
  const open = useFocusRoomStore(state => state.activeDrawer === "workspace");
  const closeDrawer = useFocusRoomStore(state => state.closeDrawer);
  const material = useFocusRoomStore(state => state.selectedMaterial);

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="extra-panel drawer-open liquid-glass"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={spring}
          aria-label="Workspace drawer"
        >
          <div className="drawer-head">
            <div>
              <span className="focus-kicker">Workspace</span>
              <h2>Return to Synapse</h2>
            </div>
            <GlassButton aria-label="Close workspace drawer" onClick={closeDrawer}><X size={16} aria-hidden="true" /></GlassButton>
          </div>
          <p>{material?.materialTitle || "Your material"} will stay connected when you return to the workspace.</p>
          <div className="focus-button-row">
            <GlassButton variant="primary" onClick={() => onWorkspace()}>Open Workspace</GlassButton>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
