import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";
import { setupInterceptors } from "./api/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestRoute } from "./components/GuestRoute";
import { Toaster } from "react-hot-toast";

import { LandingPage } from "./features/landing/LandingPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { OnboardingFlow } from "./features/onboarding/OnboardingFlow";
import { ChatbotPage } from "./features/chatbot/ChatbotPage";

import { ProfilePage } from "./features/profile/ProfilePage";
import { ToolDetail } from "./features/catalogue/ToolDetail";
import { WorkflowDetail } from "./features/catalogue/WorkflowDetail";
import { SolutionDetail } from "./features/catalogue/SolutionDetail";
import "./App.css";
import ToolsCatalogue from "./features/catalogue/ToolsCatalogue";

function AppRoutes() {
  const { accessTokenRef, clearAuth, setAuth, user, accessToken } = useAuth();
  const navigate = useNavigate();

  // Wire interceptors once on mount
  useEffect(() => {
    setupInterceptors(
      () => accessTokenRef.current,
      clearAuth,
      () => navigate("/login", { replace: true }),
    );
  }, [accessTokenRef, clearAuth, navigate]);

  // Listen for token refresh events from the interceptor
  useEffect(() => {
    const handler = (e: Event) => {
      const { accessToken } = (e as CustomEvent).detail;
      if (user) {
        setAuth(user, accessToken);
      }
    };
    window.addEventListener("auth:tokenRefreshed", handler);
    return () => window.removeEventListener("auth:tokenRefreshed", handler);
  }, [user, setAuth]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Auth pages — redirect logged-in users to /chat */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protect these routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/onboarding"
          element={
            <OnboardingFlow
              onComplete={async () => {
                // Refresh user from server to get onboardingCompleted: true
                try {
                  const { getMe } = await import("./api/authApi");
                  const meRes = await getMe();
                  const freshUser = (meRes as any).user ?? meRes;
                  if (freshUser && accessToken) {
                    setAuth(freshUser, accessToken);
                  }
                } catch {
                  // Fallback: optimistically patch the flag in-memory
                  if (user && accessToken)
                    setAuth(
                      { ...user, onboardingCompleted: true },
                      accessToken,
                    );
                }
                navigate("/chat", { replace: true });
              }}
            />
          }
        />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/catalogue" element={<ToolsCatalogue />} />
        <Route path="/tool/:id" element={<ToolDetail />} />
        <Route path="/workflow/:id" element={<WorkflowDetail />} />
        <Route path="/solution/:id" element={<SolutionDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
      {/* Only renders in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
