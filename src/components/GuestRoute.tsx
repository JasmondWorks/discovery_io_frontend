import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute — inverse of ProtectedRoute.
 * If the user is already authenticated, redirect them to /chat.
 * While the auth state is still initialising (silent refresh in flight),
 * render nothing so we don't flash the auth page.
 */
export function GuestRoute() {
  const { user, isInitialised } = useAuth();

  // Still resolving session — render nothing to avoid flash
  if (!isInitialised) return null;

  // Logged in → send them to the app
  if (user) {
    const destination =
      user.onboardingCompleted === false ? "/onboarding" : "/chat";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
