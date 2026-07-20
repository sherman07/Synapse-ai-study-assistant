import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LiquidGlassFilterDefs } from "./LiquidGlass.jsx";

export function FocusBackground({ scene }) {
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    setMediaReady(false);
    setMediaError(false);
  }, [scene?.id]);

  return (
    <div className="focus-background-wrap" aria-hidden="true">
      <LiquidGlassFilterDefs />
      <AnimatePresence mode="wait">
        <motion.div
          key={scene?.id || "focus-background"}
          className="focus-background"
          style={{ backgroundImage: mediaError ? "none" : undefined }}
          initial={{ opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {scene?.image ? (
            <img
              className={`focus-background-media focus-background-poster ${mediaReady ? "is-ready" : ""}`.trim()}
              src={scene.image}
              alt=""
              onLoad={() => setMediaReady(true)}
              onError={() => setMediaError(true)}
            />
          ) : null}
          {scene?.video ? (
            <video
              className={`focus-background-media focus-background-video ${mediaReady ? "is-ready" : ""}`.trim()}
              src={scene.video}
              poster={scene.image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setMediaReady(true)}
              onError={() => setMediaError(true)}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
      <div className="focus-overlay" />
      <div className="focus-vignette" />
    </div>
  );
}
