import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { importInventorizationLines } from "../api/inventorizationLinesService";
import { createInventorization } from "../api/inventorizationService";

export function useCreateInventorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventorization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventorizations });
    },
  });
}

export function useImportInventorizationLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, rows }) => importInventorizationLines(documentId, rows),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.inventorizationLines(variables.documentId),
      });
    },
  });
}
