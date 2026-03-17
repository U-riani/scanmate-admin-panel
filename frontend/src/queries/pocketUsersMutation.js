import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { createPocketUser, deletePocketUser, resetPocketUserPassword, updatePocketUser } from "../api/pocketUsersService";

export function useCreatePocketUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPocketUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pocketUsers });
    },
  });
}

export function useUpdatePocketUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updatePocketUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pocketUsers });
    },
  });
}

export function useDeletePocketUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePocketUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pocketUsers });
    },
  });
}

export function useResetPocketUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }) => resetPocketUserPassword(id, password),
  });
}
