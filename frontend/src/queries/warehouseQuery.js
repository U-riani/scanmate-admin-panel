import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getWarehouses } from "../api/warehouseService";

export function useWarehouses() {
  return useQuery({
    queryKey: QUERY_KEYS.warehouses,
    queryFn: getWarehouses,
  });
}
