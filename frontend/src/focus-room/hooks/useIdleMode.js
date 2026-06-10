import { useEffect } from "react";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function useIdleMode(delay = 3000) {
  const setIdle = useFocusRoomStore(state => state.setIdle);
  const isIdle = useFocusRoomStore(state => state.isIdle);

  useEffect(() => {
    let timer;

    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), delay);
    };

    window.addEventListener("mousemove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("click", reset);
    reset();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("click", reset);
    };
  }, [delay, setIdle]);

  return isIdle;
}
