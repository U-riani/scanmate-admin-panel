import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createWebsiteRole, deleteWebsiteRole, updateWebsiteRole } from "../api/websiteRolesService";

export function useCreateWebsiteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWebsiteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.websiteRoles });
    },
  });
}

export function useUpdateWebsiteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }) => updateWebsiteRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.websiteRoles });
    },
  });
}

export function useDeleteWebsiteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWebsiteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.websiteRoles });
    },
  });
}
