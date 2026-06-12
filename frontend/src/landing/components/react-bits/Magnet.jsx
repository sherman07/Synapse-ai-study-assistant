import { useRef } from "react";

export function Magnet({ children, className = "", strength = 0.22 }) {
  const ref = useRef(null);

  function handleMove(event) {
    const element = ref.current;
    if (!element || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    element.style.setProperty("--magnet-x", `${x}px`);
    element.style.setProperty("--magnet-y", `${y}px`);
  }

  function handleLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--magnet-x", "0px");
    element.style.setProperty("--magnet-y", "0px");
  }

  return (
    <span className={`magnet-wrap ${className}`} ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </span>
  );
}
