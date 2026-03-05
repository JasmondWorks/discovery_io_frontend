import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/react-query";
import { setupInterceptors } from "./api/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { LandingPage } from "./features/landing/LandingPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { OnboardingFlow } from "./features/onboarding/OnboardingFlow";
import { ChatbotPage } from "./features/chatbot/ChatbotPage";
import { ToolsCatalogue } from "./features/catalogue/ToolsCatalogue";
import { ProfilePage } from "./features/profile/ProfilePage";
import "./App.css";

function AppRoutes() {
  const { accessTokenRef, clearAuth, setAuth, user } = useAuth();
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protect these routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/onboarding"
          element={
            <OnboardingFlow
              onComplete={() => {
                navigate("/chat");
              }}
            />
          }
        />
        <Route path="/chat" element={<ChatbotPage />} />
        <Route path="/catalogue" element={<ToolsCatalogue />} />
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
      </AuthProvider>
      {/* Only renders in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
