import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AuthPages.css";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // Simulate brief loading then navigate
    setTimeout(() => {
      setLoading(false);
      navigate("/chat", { replace: true });
    }, 600);
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden="true" />

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="auth-logo__icon">✦</span>
          <span className="auth-logo__text">Discover.io</span>
        </Link>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to continue to your account</p>

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
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? <span className="auth-btn__spinner" /> : "Sign in"}
          </button>
        </form>

        <Link to="/chat" className="auth-guest-link">
          Continue as Guest →
        </Link>

        <p className="auth-footer-text">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </p>

        <Link to="/" className="auth-back-link">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
