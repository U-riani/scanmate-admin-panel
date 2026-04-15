// frontend\src\queries\transferRecountMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createTransferRecount } from "../api/transferService";

export function useCreateTransferRecount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransferRecount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transfers });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transferLines(variables.parent_document_id),
      });
    },
  });
}