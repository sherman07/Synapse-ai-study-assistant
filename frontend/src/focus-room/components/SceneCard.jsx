import { motion } from "motion/react";

export function SceneCard({ scene, active, onSelect }) {
  return (
    <motion.button
      className={`scene-card ${active ? "active" : ""}`.trim()}
      type="button"
      aria-pressed={active}
      aria-label={`${scene.name}: ${scene.description}`}
      onClick={() => onSelect(scene.id)}
      style={{ backgroundImage: `url("${scene.image}")` }}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="focus-pill">{scene.kicker}</span>
      <strong>{scene.name}</strong>
      <span>{scene.description}</span>
    </motion.button>
  );
}
