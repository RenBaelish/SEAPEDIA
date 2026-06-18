import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RoleType } from '@/types';
import { useAuthStore } from "../store/auth.store";

// ─── Guest Route — redirect authenticated users away from /auth/* ──────────
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

// ─── Protected Route — requires authentication ─────────────────────────────
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
      // User is authenticated but active role doesn't match — send to role switcher
      return <Navigate to="/auth/switch-role" state={{ requiredRoles: roles, from: location }} replace />;
    }
  }

  // If children provided (e.g. wrapping DashboardShell), render them; otherwise render Outlet
  return children ? <>{children}</> : <Outlet />;
}
