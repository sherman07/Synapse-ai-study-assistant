import { useEffect } from "react";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function usePomodoroTimer() {
  const timerState = useFocusRoomStore(state => state.timerState || (state.timerStatus === "studying" ? "running" : state.timerStatus));
  const view = useFocusRoomStore(state => state.view);
  const tickTimer = useFocusRoomStore(state => state.tickTimer);

  useEffect(() => {
    if (view !== "session" || timerState !== "running" || typeof window === "undefined") return undefined;

    let active = true;
    const reconcile = () => {
      if (active) tickTimer();
    };
    const timer = window.setInterval(reconcile, 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") reconcile();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    reconcile();

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [tickTimer, timerState, view]);
}
