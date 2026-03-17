// src/hooks/usePermission.js

import { useAuthStore } from "../store/authStore";

export function usePermission(module) {

  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  return user.role?.modules?.[module] === true;
}