import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import "./AuthPages.css";
import { Input } from "@/components/ui";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log(email);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/chat", { replace: true });
    }, 600);
  }

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error=""
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <span className="auth-btn__spinner" /> : "Sign In"}
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
