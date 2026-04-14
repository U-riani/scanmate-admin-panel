// frontend\src\queries\receiveMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
// import { importReceiveLines } from "../api/receiveLinesService";
import {
  createReceive,
  importReceiveLines,
  updateReceiveStatus,
  createRecountDocument,
} from "../api/receiveService";

export function useCreateReceive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReceive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receives });
    },
  });
}

export function useImportReceiveLines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, rows }) => importReceiveLines(documentId, rows),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.receiveLines(variables.documentId),
      });
    },
  });
}

export function useReceiveStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, prevStatus, nextStatus }) =>
      updateReceiveStatus(id, prevStatus, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receives });
    },
  });
}

export function useCreateRecount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecountDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receives });
      queryClient.invalidateQueries({ queryKey: ["receiveLines"] });
    },
  });
}

// export function useImportReceiveLines() {
//   return useMutation({
//     mutationFn: ({ documentId, rows }) =>
//       api.post(`/receives/${documentId}/lines/import`, rows),
//   });
// }
