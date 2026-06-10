import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { spring } from "../utils.js";
import { GlassButton } from "./GlassButton.jsx";

export function StudyPlanDrawer() {
  const open = useFocusRoomStore(state => state.activeDrawer === "plan");
  const studyPlan = useFocusRoomStore(state => state.studyPlan);
  const completedTasks = useFocusRoomStore(state => state.completedTasks);
  const closeDrawer = useFocusRoomStore(state => state.closeDrawer);
  const updatePlanTask = useFocusRoomStore(state => state.updatePlanTask);
  const toggleTask = useFocusRoomStore(state => state.toggleTask);

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="extra-panel drawer-open liquid-glass"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={spring}
          aria-label="Study plan drawer"
        >
          <div className="drawer-head">
            <div>
              <span className="focus-kicker">Study Plan</span>
              <h2>Plan this block</h2>
            </div>
            <GlassButton aria-label="Close study plan" onClick={closeDrawer}><X size={16} aria-hidden="true" /></GlassButton>
          </div>
          <div className="plan-editor">
            {studyPlan.map((item, index) => (
              <article className="plan-edit-item liquid-glass-lite" key={`${item.task}-${index}`}>
                <label className="focus-field">
                  Minutes
                  <input value={item.minutes} type="number" min="1" max="180" onChange={event => updatePlanTask(index, event.target.value, null)} />
                </label>
                <label className="focus-field">
                  Task
                  <textarea value={item.task} onChange={event => updatePlanTask(index, null, event.target.value)} />
                </label>
                <GlassButton
                  variant={completedTasks.includes(item.task) ? "primary" : "ghost"}
                  onClick={() => toggleTask(index)}
                >
                  {completedTasks.includes(item.task) ? "Completed" : "Mark complete"}
                </GlassButton>
              </article>
            ))}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
