import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "../../components/common/Logo";
import "./AuthPages.css";
import { Input } from "@/components/ui";
import { useLogin } from "./hooks/useLogin";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();

  const form = useForm<LoginSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const { handleLogin, isLoginPending } = useLogin();

  const handleSubmit = form.handleSubmit(async (data) => {
    setError(null);
    try {
      const loginRes = await handleLogin(data.email, data.password);

      // loginRes already contains the full user object — no extra getMe needed
      const user = loginRes.user;
      setAuth(user, loginRes.accessToken);

      toast.success("Welcome back!");

      if (!user.onboardingCompleted) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/chat", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    }
  });

  return (
    <div className="auth-page">
      {/* Logo */}
      <Logo className="auth-logo" size={24} />

      {/* Card */}
      <div className="auth-card">
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to continue your discovery.</p>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              {...form.register("email")}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              error=""
              {...form.register("password")}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isLoginPending}
            id="login-submit-btn"
          >
            {isLoginPending ? (
              <span className="auth-btn__spinner" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
