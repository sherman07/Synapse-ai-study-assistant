import { useQuery } from "../queryClient.js";
import { getFocusRoomMaterials, getFocusRoomMaterialsWithDataApi } from "../data.js";

export function useFocusRoomMaterials() {
  return useQuery({
    queryKey: ["focus-room", "materials"],
    queryFn: () => getFocusRoomMaterialsWithDataApi(),
    initialData: () => getFocusRoomMaterials(),
    staleTime: 1000
  });
}
