import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../constants/roles";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isInitialised } = useAuth();
  const location = useLocation();

  // While the silent refresh is in-flight, render nothing (or a spinner)
  if (!isInitialised) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Changed from unauthorized to /
  }

  return <Outlet />;
}
