import { useQuery } from "../queryClient.js";
import { readFocusRoomSessions } from "../data.js";

export function useSessionHistory() {
  return useQuery({
    queryKey: ["focus-room", "sessions"],
    queryFn: () => readFocusRoomSessions(),
    staleTime: 1000
  });
}
