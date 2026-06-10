import { useEffect } from "react";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function usePomodoroTimer() {
  const timerStatus = useFocusRoomStore(state => state.timerStatus);
  const view = useFocusRoomStore(state => state.view);
  const tickTimer = useFocusRoomStore(state => state.tickTimer);

  useEffect(() => {
    if (view !== "session" || timerStatus !== "studying") return undefined;
    const timer = window.setInterval(tickTimer, 1000);
    return () => window.clearInterval(timer);
  }, [tickTimer, timerStatus, view]);
}
