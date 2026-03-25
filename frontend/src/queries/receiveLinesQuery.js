import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getReceiveLines } from "../api/receiveService";

export function useReceiveLines(documentId) {
  return useQuery({
    queryKey: QUERY_KEYS.receiveLines(documentId),
    queryFn: () => getReceiveLines(documentId),
    enabled: !!documentId,
  });
}
