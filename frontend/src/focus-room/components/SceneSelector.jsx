import { FOCUS_ROOM_GALLERY_SCENES, FOCUS_ROOM_SCENES } from "../data.js";
import { useFocusRoomStore } from "../hooks/useFocusRoomStore.js";
import { SceneCard } from "./SceneCard.jsx";

export function SceneSelector({ variant = "default" }) {
  const selectedScene = useFocusRoomStore(state => state.selectedScene);
  const selectScene = useFocusRoomStore(state => state.selectScene);
  const scenes = variant === "gallery"
    ? FOCUS_ROOM_GALLERY_SCENES
    : FOCUS_ROOM_SCENES.filter(scene => !scene.galleryOnly);

  return (
    <div className={`scene-selector scene-selector-${variant}`.trim()} aria-label="Study scenes">
      {scenes.map(scene => <SceneCard key={scene.id} scene={scene} active={scene.id === selectedScene} onSelect={selectScene} variant={variant} />)}
    </div>
  );
}
