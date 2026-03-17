import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getPocketUsers } from "../api/pocketUsersService";

export function usePocketUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.pocketUsers,
    queryFn: getPocketUsers,
  });
}
