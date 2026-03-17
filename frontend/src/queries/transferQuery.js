import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getTransfers } from "../api/transferService";

export function useTransfers() {
  return useQuery({
    queryKey: QUERY_KEYS.transfers,
    queryFn: getTransfers,
  });
}
