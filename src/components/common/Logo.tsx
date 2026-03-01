import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 28 }: LogoProps) {
  return (
    <Link to="/" className={`logo-link ${className}`}>
      <span className="logo-icon">
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
          <rect width="12" height="12" rx="3" fill="#4361EE" />
          <rect x="14" width="12" height="12" rx="3" fill="#4361EE" opacity="0.6" />
          <rect y="14" width="12" height="12" rx="3" fill="#4361EE" opacity="0.6" />
          <rect x="14" y="14" width="12" height="12" rx="3" fill="#4361EE" opacity="0.3" />
        </svg>
      </span>
      <span className="logo-wordmark">Discover.io</span>
    </Link>
  );
}
