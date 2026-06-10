import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { getFocusRoomMaterials } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { spring } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function MaterialPanel() {
  const open = useFocusRoomStore(state => state.activeDrawer === "materials");
  const closeDrawer = useFocusRoomStore(state => state.closeDrawer);
  const materials = getFocusRoomMaterials();

  const openMaterial = materialId => {
    const suffix = materialId ? `/${encodeURIComponent(materialId)}` : "";
    globalThis.location.hash = `#/focus-room${suffix}`;
    closeDrawer();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="extra-panel drawer-open liquid-glass"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={spring}
          aria-label="Materials drawer"
        >
          <div className="drawer-head">
            <div>
              <span className="focus-kicker">Materials</span>
              <h2>Uploaded study material</h2>
            </div>
            <GlassButton aria-label="Close materials" onClick={closeDrawer}><X size={16} aria-hidden="true" /></GlassButton>
          </div>
          <div className="material-list">
            {materials.length ? materials.map(material => (
              <button className="material-row liquid-glass-lite" key={material.materialId} type="button" onClick={() => openMaterial(material.materialId)}>
                <strong>{material.materialTitle || "Study material"}</strong>
                <span>{material.materialType || "Generated notes"}</span>
              </button>
            )) : <p>No Focus Room materials are available yet.</p>}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
