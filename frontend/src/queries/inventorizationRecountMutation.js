import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createRecountDocument } from "../api/inventorizationRecountService";

export function useCreateRecount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecountDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventorizations });
      queryClient.invalidateQueries({ queryKey: ["inventorizationLines"] });
    },
  });
}
