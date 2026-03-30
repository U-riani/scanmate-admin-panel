import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getInventorizations } from "../api/inventorizationService";

export function usePriceList() {
  return useQuery({
    queryKey: QUERY_KEYS.sales,
    queryFn: getInventorizations,
  });
}
