import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Clock,
} from "lucide-react";
import { Logo } from "../common/Logo";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useChatSessions } from "../../features/chatbot/hooks/useChatbot";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { handleLogout, isLogoutPending } = useLogout();
  const { data: chatSessionsRes } = useChatSessions();

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu whenever the user navigates to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="chat-navbar">
        <div className="chat-navbar__inner">
          <Logo className="chat-navbar__logo" size={20} />

          {/* Desktop Nav */}
          <nav className="chat-navbar__links">
            <Link
              to="/chat"
              className={`chat-navbar__link ${isActive("/chat") ? "active" : ""}`}
            >
              <Search size={16} />
              <span>Discover</span>
            </Link>
            <Link
              to="/catalogue"
              className={`chat-navbar__link ${isActive("/catalogue") ? "active" : ""}`}
            >
              <LayoutGrid size={16} />
              <span>Catalog</span>
            </Link>
            <Link
              to="/catalogue?view=saved"
              className={`chat-navbar__link ${location.search.includes("view=saved") ? "active" : ""}`}
            >
              <Bookmark size={16} />
              <span>Saved</span>
            </Link>
            <Link
              to="/profile"
              className={`chat-navbar__link ${isActive("/profile") ? "active" : ""}`}
            >
              <User size={16} />
              <span>Profile</span>
            </Link>
          </nav>

          <button
            className="chat-navbar__signout chat-navbar__signout--desktop"
            onClick={handleLogout}
            disabled={isLogoutPending}
          >
            <LogOut size={16} />
            <span>{isLogoutPending ? "Signing out..." : "Sign out"}</span>
          </button>

          {/* Mobile Hamburger */}
          <button
            className="chat-navbar__hamburger"
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
              className="chat-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="chat-mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="chat-mobile-menu__header">
                <span className="chat-mobile-menu__title">Menu</span>
                <button
                  className="chat-mobile-menu__close"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="chat-mobile-menu__nav">
                <Link
                  to="/"
                  className="chat-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/chat"
                  className={`chat-mobile-menu__link ${isActive("/chat") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search size={18} />
                  <span>Discover</span>
                </Link>
                <Link
                  to="/catalogue"
                  className={`chat-mobile-menu__link ${isActive("/catalogue") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutGrid size={18} />
                  <span>Catalog</span>
                </Link>
                <Link
                  to="/catalogue?view=saved"
                  className={`chat-mobile-menu__link ${location.search.includes("view=saved") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark size={18} />
                  <span>Saved</span>
                </Link>
                <Link
                  to="/profile"
                  className={`chat-mobile-menu__link ${isActive("/profile") ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>

                {/* History Section - Only show if on chat page or if we want global history */}
                {chatSessionsRes?.data && chatSessionsRes.data.length > 0 && (
                  <div className="chat-mobile-history">
                    <div className="chat-mobile-history__header">
                      <span>Recent Chats</span>
                    </div>
                    <div className="chat-mobile-history__list">
                      {chatSessionsRes.data.slice(0, 5).map((session) => (
                        <Link
                          key={session.id}
                          to={`/chat?session=${session.id}`}
                          className="chat-history-item"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Clock size={14} />
                          <span>{session.title || "Untitled Chat"}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </nav>

              <div className="chat-mobile-menu__footer">
                <button
                  className="chat-mobile-menu__signout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLogoutPending}
                >
                  <LogOut size={18} />
                  <span>{isLogoutPending ? "Signing out..." : "Sign out"}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
