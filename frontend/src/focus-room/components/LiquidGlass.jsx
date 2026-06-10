import { motion } from "motion/react";
import { spring } from "../utils.js";

export function LiquidGlass({ as: Element = "section", className = "", children, ...props }) {
  return (
    <motion.div
      className={`liquid-glass ${className}`.trim()}
      initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={spring}
      {...props}
    >
      {Element === "div" ? children : <Element className="liquid-glass-inner">{children}</Element>}
    </motion.div>
  );
}
