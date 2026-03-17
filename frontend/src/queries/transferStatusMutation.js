import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { updateTransferStatus } from "../api/transferService";

export function useTransferStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateTransferStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transfers });
    },
  });
}
