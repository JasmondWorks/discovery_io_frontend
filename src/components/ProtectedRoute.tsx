/**
 * ProtectedRoute.tsx
 *
 * Wraps any route that requires authentication.
 *
 * While auth state is loading   → renders a spinner
 * If not authenticated          → redirects to /login
 * If authenticated              → renders the child route
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "./ProtectedRoute.css";

interface Props {
  /** Optionally restrict to specific roles, e.g. ["ADMIN", "SUPER_ADMIN"] */
  roles?: string[];
}

export function ProtectedRoute({ roles }: Props) {
  const { authenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" role="status" aria-label="Checking session">
        <span className="auth-spinner" />
        <p>Verifying session…</p>
      </div>
    );
  }

  if (!authenticated) {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based guard (optional)
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed — render children
  return <Outlet />;
}
