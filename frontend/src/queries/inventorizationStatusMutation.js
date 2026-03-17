import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { updateInventorizationStatus } from "../api/inventorizationService";

export function useInventorizationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateInventorizationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventorizations });
    },
  });
}
