import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getWebsiteUsers } from "../api/websiteUsersService";

export function useWebsiteUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.websiteUsers,
    queryFn: getWebsiteUsers,
  });
}
