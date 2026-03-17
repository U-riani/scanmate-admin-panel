import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getInventorizations } from "../api/inventorizationService";

export function useInventorizations() {
  return useQuery({
    queryKey: QUERY_KEYS.inventorizations,
    queryFn: getInventorizations,
  });
}
