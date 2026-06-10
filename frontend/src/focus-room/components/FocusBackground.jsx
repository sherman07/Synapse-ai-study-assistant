import { useEffect } from "react";
import gsap from "gsap";
import { AnimatePresence, motion } from "motion/react";

export function FocusBackground({ scene }) {
  useEffect(() => {
    const tween = gsap.to(".focus-background", {
      scale: 1.055,
      xPercent: 0.6,
      yPercent: 0.4,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
    return () => tween.kill();
  }, [scene?.id]);

  return (
    <div className="focus-background-wrap" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene?.id || "focus-background"}
          className="focus-background"
          style={{ backgroundImage: `url("${scene?.image || ""}")` }}
          initial={{ opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1.015 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </AnimatePresence>
      <div className="focus-overlay" />
    </div>
  );
}
