import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getWebsiteRoles } from "../api/websiteRolesService";

export function useWebsiteRoles() {
  return useQuery({
    queryKey: QUERY_KEYS.websiteRoles,
    queryFn: getWebsiteRoles,
  });
}
