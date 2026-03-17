// frontend/src/components/auth/RoleRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "../../app/paths";

export default function RoleRoute({ roles, children }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={PATHS.ROOT} replace />;
  }

  return children;
}