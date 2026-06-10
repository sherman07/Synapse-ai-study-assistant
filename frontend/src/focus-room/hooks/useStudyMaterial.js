import { useEffect } from "react";
import { useQuery, useQueryClient } from "../queryClient.js";
import { getFocusRoomMaterial, getFocusRoomMaterials } from "../data.js";
import { useFocusRoomStore } from "./useFocusRoomStore.js";

export function useStudyMaterial(route) {
  const queryClient = useQueryClient();
  const hydrateFocusRoute = useFocusRoomStore(state => state.hydrateFocusRoute);
  const showStudyHistory = useFocusRoomStore(state => state.showStudyHistory);

  const materialsQuery = useQuery({
    queryKey: ["focus-room", "materials"],
    queryFn: () => getFocusRoomMaterials(),
    staleTime: 1000
  });

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
    if (route.name === "history") {
      showStudyHistory();
      return;
    }
    if (route.name !== "focus") return;
    const material = route.materialId
      ? getFocusRoomMaterial(route.materialId)
      : getFocusRoomMaterial("");
    hydrateFocusRoute(route, material || null, { preserveSession: true });
  }, [hydrateFocusRoute, materialsQuery.data, route, showStudyHistory]);

  return materialsQuery;
}
