import { useEffect } from "react";
import { useQueryClient } from "../queryClient.js";
import { useFocusRoomStore } from "./useFocusRoomStore.js";
import { useFocusRoomMaterials } from "./useFocusRoomMaterials.js";

function resolveMaterial(materials, materialId) {
  const items = Array.isArray(materials) ? materials : [];
  const requestedId = String(materialId || "");
  if (!requestedId) return items[0] || null;
  return items.find(item => item.materialId === requestedId) || items[0] || null;
}

export function useStudyMaterial(route) {
  const queryClient = useQueryClient();
  const hydrateFocusRoute = useFocusRoomStore(state => state.hydrateFocusRoute);
  const showStudyHistory = useFocusRoomStore(state => state.showStudyHistory);
  const setMaterialsState = useFocusRoomStore(state => state.setMaterialsState);

  const materialsQuery = useFocusRoomMaterials();

  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["focus-room", "materials"] });
      queryClient.invalidateQueries({ queryKey: ["focus-room", "sessions"] });
    };
    window.addEventListener("synapse-focus-room-materials-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("synapse-focus-room-materials-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [queryClient]);

  useEffect(() => {
    setMaterialsState({
      items: Array.isArray(materialsQuery.data) ? materialsQuery.data : [],
      status: materialsQuery.isError
        ? "error"
        : ((materialsQuery.isPending || materialsQuery.isFetching) && !(materialsQuery.data || []).length ? "loading" : "ready"),
      error: materialsQuery.error?.message || ""
    });
  }, [
    materialsQuery.data,
    materialsQuery.error?.message,
    materialsQuery.isError,
    materialsQuery.isFetching,
    materialsQuery.isPending,
    setMaterialsState
  ]);

  useEffect(() => {
    if (route.name === "history") {
      showStudyHistory();
      return;
    }
    if (route.name !== "focus") return;
    const material = resolveMaterial(materialsQuery.data, route.materialId);
    hydrateFocusRoute(route, material || null, { preserveSession: true });
  }, [hydrateFocusRoute, materialsQuery.data, route, showStudyHistory]);

  return materialsQuery;
}
