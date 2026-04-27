import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getReceiveLines, updateReceiveLineQuantity } from "../api/receiveService";

export function useReceiveLines(documentId) {
  return useQuery({
    queryKey: QUERY_KEYS.receiveLines(documentId),
    queryFn: () => getReceiveLines(documentId),
    enabled: !!documentId,
  });
}

export function useUpdateReceiveLineQuantity(documentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, payload }) =>
      updateReceiveLineQuantity(lineId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.receiveLines(documentId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.receives,
      });
    },
  });
}