import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./features/landing/LandingPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { OnboardingFlow } from "./features/onboarding/OnboardingFlow";
import { ChatLayout } from "./features/chat/ChatLayout";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingFlow
            onComplete={() => {
              window.location.href = "/chat";
            }}
          />
        }
      />
      <Route path="/chat" element={<ChatLayout />} />
      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
