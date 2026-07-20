import { motion } from "motion/react";
import { spring } from "../utils.js";

function updateGlassLight(event) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = rect.width ? ((event.clientX - rect.left) / rect.width) * 100 : 50;
  const y = rect.height ? ((event.clientY - rect.top) / rect.height) * 100 : 50;
  element.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, x))}%`);
  element.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, y))}%`);
}

function resetGlassLight(event) {
  event.currentTarget.style.setProperty("--glass-x", "50%");
  event.currentTarget.style.setProperty("--glass-y", "0%");
}

export function LiquidGlassFilterDefs() {
  return (
    <svg className="liquid-glass-filter-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="liquid-glass-displacement" x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.024" numOctaves="2" seed="17" result="liquid-noise" />
          <feDisplacementMap in="SourceGraphic" in2="liquid-noise" scale="7" xChannelSelector="R" yChannelSelector="B" result="refracted-surface" />
          <feColorMatrix in="refracted-surface" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.04 0" result="edge-alpha" />
          <feGaussianBlur in="edge-alpha" stdDeviation="0.25" result="soft-edge" />
          <feBlend in="soft-edge" in2="refracted-surface" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}

export function LiquidGlass({ as: Element = "section", className = "", children, ...props }) {
  const { onPointerMove, onPointerLeave, ...motionProps } = props;
  return (
    <motion.div
      className={`liquid-glass ${className}`.trim()}
      initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={spring}
      onPointerMove={event => {
        updateGlassLight(event);
        onPointerMove?.(event);
      }}
      onPointerLeave={event => {
        resetGlassLight(event);
        onPointerLeave?.(event);
      }}
      {...motionProps}
    >
      {Element === "div" ? children : <Element className="liquid-glass-inner">{children}</Element>}
    </motion.div>
  );
}
