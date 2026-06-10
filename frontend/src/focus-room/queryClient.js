import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

export const focusRoomQueryClient = new QueryClient();
export { QueryClientProvider, useQuery, useQueryClient };
