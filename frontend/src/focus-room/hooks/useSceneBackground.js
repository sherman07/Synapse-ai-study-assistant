import { currentScene } from "../utils.js";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function useSceneBackground() {
  const selectedScene = useFocusRoomStore(state => state.selectedScene);
  return currentScene(selectedScene);
}
