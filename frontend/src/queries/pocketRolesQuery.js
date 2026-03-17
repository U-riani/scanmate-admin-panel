import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getPocketRoles } from "../api/pocketRolesService";

export function usePocketRoles() {
  return useQuery({
    queryKey: QUERY_KEYS.pocketRoles,
    queryFn: getPocketRoles,
  });
}
