import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getTransferLines } from "../api/transferLinesService";

export function useTransferLines(documentId) {
  return useQuery({
    queryKey: QUERY_KEYS.transferLines(documentId),
    queryFn: () => getTransferLines(documentId),
    enabled: !!documentId,
  });
}
