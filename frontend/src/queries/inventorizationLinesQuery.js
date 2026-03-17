import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getInventorizationLines } from "../api/inventorizationLinesService";

export function useInventorizationLines(documentId) {
  return useQuery({
    queryKey: QUERY_KEYS.inventorizationLines(documentId),
    queryFn: () => getInventorizationLines(documentId),
    enabled: !!documentId,
  });
}
