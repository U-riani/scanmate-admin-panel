import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createWarehouse, deleteWarehouse, updateWarehouse } from "../api/warehouseService";

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.warehouses });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.warehouses });
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.warehouses });
    },
  });
}
