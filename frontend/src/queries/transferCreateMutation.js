import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createTransfer } from "../api/transferService";

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transfers });
    },
  });
}
