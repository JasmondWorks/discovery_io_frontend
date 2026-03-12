import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import "./AuthPages.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRegister } from "./hooks/useRegister";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { handleRegister, isRegisterPending } = useRegister();
  const { setAuth } = useAuth();

  const form = useForm<RegisterSchema>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    // resolver: zodResolver(registerSchema),
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = form.handleSubmit(async (data) => {
    setError(null);
    try {
      const registerRes = await handleRegister(
        data.name,
        data.email,
        data.password,
      );

      // registerRes already contains the full user — no extra getMe call needed
      const user = registerRes.user;
      setAuth(user, registerRes.accessToken);

      toast.success("Account created successfully!");

      if (!user.onboardingCompleted) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/chat", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    }
  });

  return (
    <div className="auth-page">
      {/* Logo */}
      <Logo className="auth-logo" size={24} />

      {/* Card */}
      <div className="auth-card">
        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">
          Start discovering AI tools tailored to you.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              {...form.register("name")}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              {...form.register("email")}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              {...form.register("password")}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={isRegisterPending}
            id="register-submit-btn"
          >
            {isRegisterPending ? (
              <span className="auth-btn__spinner" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
