// frontend/src/components/auth/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { PATHS } from "../../app/paths";

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  return children;
}