import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import "./AuthPages.css";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/onboarding", { replace: true });
    }, 600);
  }

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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            id="register-submit-btn"
          >
            {loading ? (
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
