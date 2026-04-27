// frontend\src\queries\transferLinesMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import {
  addTransferLines,
  deleteTransferLine,
  updateTransferLine,
  importTransferLines,
  updateTransferLineQuantity,
} from "../api/transferLinesService";

export function useAddTransferLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, products }) =>
      addTransferLines(documentId, products),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transferLines(variables.documentId),
      });
    },
  });
}

export function useImportTransferLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, products }) =>
      importTransferLines(documentId, products),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transferLines(variables.documentId),
      });
    },
  });
}

export function useUpdateTransferLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, data }) => updateTransferLine(lineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferLines"] });
    },
  });
}

export function useDeleteTransferLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransferLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferLines"] });
    },
  });
}

export function useUpdateTransferLineQuantity(documentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, payload }) =>
      updateTransferLineQuantity(lineId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transferLines(documentId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transfers,
      });
    },
  });
}
