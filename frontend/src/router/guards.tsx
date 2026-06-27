import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RoleType } from "@/types";
import { useAuthStore } from "../store/auth.store";

export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

interface ProtectedRouteProps {
  roles?: RoleType[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && user) {
    const hasRole = roles.includes(user.activeRole);
    if (!hasRole) {
      return <Navigate to="/auth/switch-role" state={{ requiredRoles: roles, from: location }} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
