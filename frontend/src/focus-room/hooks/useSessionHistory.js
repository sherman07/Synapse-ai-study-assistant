import { useQuery } from "../queryClient.js";
import { readFocusRoomSessionsWithDataApi } from "../data.js";

export function useSessionHistory() {
  return useQuery({
    queryKey: ["focus-room", "sessions"],
    queryFn: () => readFocusRoomSessionsWithDataApi(),
    staleTime: 1000
  });
}
