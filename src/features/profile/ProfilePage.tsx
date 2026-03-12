import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Search,
  LayoutGrid,
  Bookmark,
  Clock,
  LogOut,
  Briefcase,
  Zap,
  Settings,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Logo } from "../../components/common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useLogout } from "../auth/hooks/useLogout";
import "./ProfilePage.css";

export function ProfilePage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { handleLogout: handleSignOut } = useLogout();

  const getJobTitleDisplay = () => {
    if (!user?.professionalProfile) return "Professional";
    const { core_role, industry } = user.professionalProfile;
    if (core_role && industry) {
      return `${core_role.replace(/_/g, " ")} in ${industry.replace(
        /_/g,
        " ",
      )}`;
    }
    return (
      core_role?.replace(/_/g, " ") ||
      industry?.replace(/_/g, " ") ||
      "Professional"
    );
  };

  const getPrimaryPainPoint = () => {
    if (!user?.professionalProfile?.main_pain_points?.length) return null;
    return user.professionalProfile.main_pain_points[0];
  };

  return (
    <div className="profile-page">
      {/* ─── Top Navbar ─────────────────────────── */}
      <header className="profile-navbar">
        <div className="profile-navbar__inner">
          <Logo className="profile-navbar__logo" size={28} />

          {/* Desktop Nav */}
          <nav className="profile-navbar__links">
            <Link to="/chat" className="profile-navbar__link">
              <Search size={18} />
              <span>Discover</span>
            </Link>
            <Link to="/catalogue" className="profile-navbar__link">
              <LayoutGrid size={18} />
              <span>Catalog</span>
            </Link>
            <Link to="/catalogue?view=saved" className="profile-navbar__link">
              <Bookmark size={18} />
              <span>Saved</span>
            </Link>
            <Link to="/profile" className="profile-navbar__link active">
              <User size={18} />
              <span>Profile</span>
            </Link>
          </nav>

          <button
            className="profile-navbar__signout profile-navbar__signout--desktop"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>

          {/* Mobile Hamburger */}
          <button
            className="profile-navbar__hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ─── Mobile Menu Overlay ────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="profile-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="profile-mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="profile-mobile-menu__header">
                <span className="profile-mobile-menu__title">Menu</span>
                <button
                  className="profile-mobile-menu__close"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="profile-mobile-menu__nav">
                <Link
                  to="/"
                  className="profile-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/chat"
                  className="profile-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search size={18} />
                  <span>Discover</span>
                </Link>
                <Link
                  to="/catalogue"
                  className="profile-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutGrid size={18} />
                  <span>Catalog</span>
                </Link>
                <Link
                  to="/catalogue?view=saved"
                  className="profile-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark size={18} />
                  <span>Saved</span>
                </Link>
                <Link
                  to="/profile"
                  className="profile-mobile-menu__link active"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
              </nav>

              <div className="profile-mobile-menu__footer">
                <button
                  className="profile-mobile-menu__signout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ───────────────────────── */}
      <main className="profile-main">
        {/* Profile Card */}
        <section className="profile-card">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div className="profile-info">
            <h1>{user?.name || "Loading..."}</h1>
            <div className="profile-email">
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
            <div className="profile-tags">
              <div
                className="profile-tag"
                style={{ textTransform: "capitalize" }}
              >
                <Briefcase size={14} />
                <span>{getJobTitleDisplay()}</span>
              </div>
              {getPrimaryPainPoint() && (
                <div className="profile-tag">
                  <Zap size={14} />
                  <span>{getPrimaryPainPoint()}</span>
                </div>
              )}
            </div>
          </div>
          <button
            className="profile-edit-btn"
            onClick={() => navigate("/onboarding")}
          >
            <Settings size={18} />
            <span>Edit Profile</span>
          </button>
        </section>

        {/* Stats Grid */}
        <section className="profile-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-value">12</span>
            <span className="profile-stat-label">Tools Saved</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">28</span>
            <span className="profile-stat-label">Searches</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">5</span>
            <span className="profile-stat-label">Categories</span>
          </div>
        </section>

        {/* Recent Searches */}
        <section className="profile-section">
          <h2>Recent Searches</h2>
          <div className="profile-searches-list">
            <div className="profile-search-item">
              <span className="profile-search-text">
                Best AI tools for writing blog posts
              </span>
              <div className="profile-search-time">
                <Clock size={14} />
                <span>2 hours ago</span>
              </div>
            </div>
            <div className="profile-search-item">
              <span className="profile-search-text">
                Video editing AI tools
              </span>
              <div className="profile-search-time">
                <Clock size={14} />
                <span>Yesterday</span>
              </div>
            </div>
            <div className="profile-search-item">
              <span className="profile-search-text">
                Design tools for social media
              </span>
              <div className="profile-search-time">
                <Clock size={14} />
                <span>3 days ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
