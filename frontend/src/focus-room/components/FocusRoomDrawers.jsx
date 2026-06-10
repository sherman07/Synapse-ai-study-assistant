import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { spring } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";
import { SceneSelector } from "./SceneSelector.jsx";
import { SoundControlPanel } from "./SoundControlPanel.jsx";

function DrawerShell({ title, kicker, children }) {
  const closeDrawer = useFocusRoomStore(state => state.closeDrawer);
  return (
    <motion.aside
      className="extra-panel drawer-open liquid-glass"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={spring}
    >
      <div className="drawer-head">
        <div>
          <span className="focus-kicker">{kicker}</span>
          <h2>{title}</h2>
        </div>
        <GlassButton aria-label={`Close ${title}`} onClick={closeDrawer}><X size={16} aria-hidden="true" /></GlassButton>
      </div>
      {children}
    </motion.aside>
  );
}

export function FocusRoomDrawers({ audioState }) {
  const activeDrawer = useFocusRoomStore(state => state.activeDrawer);

  return (
    <AnimatePresence>
      {activeDrawer === "scene" ? (
        <DrawerShell title="Choose Scene" kicker="Scene">
          <SceneSelector />
        </DrawerShell>
      ) : null}
      {activeDrawer === "music" ? (
        <DrawerShell title="Sound Atmosphere" kicker="Music">
          <SoundControlPanel audioState={audioState} />
        </DrawerShell>
      ) : null}
    </AnimatePresence>
  );
}
