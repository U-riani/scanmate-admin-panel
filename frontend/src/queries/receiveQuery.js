import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getReceives } from "../api/receiveService";

export function useReceives() {
  return useQuery({
    queryKey: QUERY_KEYS.receives,
    queryFn: getReceives,
  });
}
