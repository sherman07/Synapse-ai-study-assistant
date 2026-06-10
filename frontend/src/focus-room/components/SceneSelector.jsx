import { FOCUS_ROOM_SCENES } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { SceneCard } from "./SceneCard.jsx";

export function SceneSelector() {
  const selectedScene = useFocusRoomStore(state => state.selectedScene);
  const selectScene = useFocusRoomStore(state => state.selectScene);

  return (
    <div className="scene-selector">
      {FOCUS_ROOM_SCENES.map(scene => (
        <SceneCard
          key={scene.id}
          scene={scene}
          active={scene.id === selectedScene}
          onSelect={selectScene}
        />
      ))}
    </div>
  );
}
