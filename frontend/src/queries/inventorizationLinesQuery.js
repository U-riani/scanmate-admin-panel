// frontend\src\queries\inventorizationLinesQuery.js4

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getInventorizationLines, updateInventorizationLineQuantity } from "../api/inventorizationLinesService";

export function useInventorizationLines(documentId) {
  return useQuery({
    queryKey: QUERY_KEYS.inventorizationLines(documentId),
    queryFn: () => getInventorizationLines(documentId),
    enabled: !!documentId,
  });
}

export function useUpdateInventorizationLineQuantity(documentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, payload }) =>
      updateInventorizationLineQuantity(lineId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.inventorizationLines(documentId),
      });
    },
  });
}