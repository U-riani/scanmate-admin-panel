// src/components/auth/ModuleRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "../../app/paths";

export default function ModuleRoute({ module, children }) {

  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  const allowed = user.role?.modules?.[module];

  if (!allowed) {
    return <Navigate to={PATHS.ROOT} replace />;
  }

  return children;
}