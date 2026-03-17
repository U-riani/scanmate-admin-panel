import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../app/queryKeys";
import { getUsers } from "../api/usersService";

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users,
    queryFn: getUsers,
  });
}
