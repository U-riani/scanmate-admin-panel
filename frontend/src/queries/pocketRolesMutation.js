import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createPocketRole, deletePocketRole, updatePocketRole } from "../api/pocketRolesService";

export function useCreatePocketRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPocketRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pocketRoles });
    },
  });
}

export function useUpdatePocketRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }) => updatePocketRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pocketRoles });
    },
  });
}

export function useDeletePocketRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePocketRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pocketRoles });
    },
  });
}
