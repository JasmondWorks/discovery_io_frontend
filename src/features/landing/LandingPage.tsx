import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  MessageSquare,
  BarChart3,
  Bookmark,
  LayoutGrid,
  Users,
  Wrench,
  FolderOpen,
  Search,
} from "lucide-react";
import { Logo } from "../../components/common/Logo";
import chatMockupImg from "./assets/chat-mockup.png";
import catalogImg from "./assets/catalog-illustration.png";
import techBannerImg from "./assets/tech-banner.png";
import "./LandingPage.css";

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav__inner">
          <Logo className="landing-nav__logo" size={28} />

          {/* Desktop nav links */}
          <nav className="landing-nav__links">
            <a href="#hero">Features</a>
            <a href="#how-it-works">How It Works</a>
            <Link to="/catalogue">Catalog</Link>
          </nav>

          <div className="landing-nav__actions">
            <Link to="/login" className="nav-link-btn">
              Log in
            </Link>
            <Link to="/register" className="nav-cta-btn">
              Get Started
            </Link>
          </div>

          <button
            className="landing-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ─── Mobile Menu Overlay ────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="landing-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="landing-mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="landing-mobile-menu__header">
                <span className="landing-mobile-menu__title">Menu</span>
                <button
                  className="landing-mobile-menu__close"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="landing-mobile-menu__nav">
                <a
                  href="#hero"
                  className="landing-mobile-menu__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <Search size={18} />
                  <span>Features</span>
                </a>
                <a
                  href="#how-it-works"
                  className="landing-mobile-menu__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <BarChart3 size={18} />
                  <span>How It Works</span>
                </a>
                <Link
                  to="/catalogue"
                  className="landing-mobile-menu__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutGrid size={18} />
                  <span>Catalog</span>
                </Link>
              </nav>

              <div className="landing-mobile-menu__footer">
                <Link
                  to="/login"
                  className="landing-mobile-menu__login"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="landing-mobile-menu__signup"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero__bg" aria-hidden="true" />

        <div className="hero__content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hero__text"
          >
            {/* Badge */}
            <div className="hero__badge">
              <Sparkles size={14} />
              <span>AI-Powered Tool Discovery</span>
            </div>

            <h1>
              Find the perfect{" "}
              <span className="hero__accent">AI tool</span>
              <br />
              for your workflow
            </h1>

            <p className="hero__subtitle">
              Describe what you're working on. Discover.io listens to what you
              need and recommends AI tools that are relevant, reliable and built
              for your specific use case.
            </p>

            <div className="hero__cta-group">
              <Link to="/register" className="hero__cta-primary">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link to="/catalogue" className="hero__cta-secondary">
                Explore Tools <ArrowRight size={16} />
              </Link>
            </div>

            {/* Stats */}
            <div className="hero__stats">
              <div className="hero__stat">
                <Users size={16} />
                <span>
                  <strong>2.5K+</strong> Users
                </span>
              </div>
              <div className="hero__stat">
                <Wrench size={16} />
                <span>
                  <strong>1,000+</strong> AI Tools
                </span>
              </div>
              <div className="hero__stat">
                <FolderOpen size={16} />
                <span>
                  <strong>50+</strong> Categories
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Why Discover.io? ────────────────────────────────── */}
      <section className="why-section" id="features">
        <div className="section__inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section__header"
          >
            <h2>Why Discover.io?</h2>
            <p>
              Stop scrolling through generic AI tool directories. Get recommendations
              that actually fit your workflow.
            </p>
          </motion.div>

          <div className="why-grid">
            {[
              {
                icon: <MessageSquare size={24} />,
                title: "Conversational Discovery",
                description:
                  "Describe your workflow in natural language. Our AI understands context, not just keywords.",
              },
              {
                icon: <BarChart3 size={24} />,
                title: "Personalized Rankings",
                description:
                  "AI-driven recommendations ranked by relevance to your specific use case and workflow.",
              },
              {
                icon: <Bookmark size={24} />,
                title: "Save & Revisit",
                description:
                  "Bookmark your favorite tools and revisit your history and saved recommendations anytime.",
              },
              {
                icon: <LayoutGrid size={24} />,
                title: "Curated Catalog",
                description:
                  "Browse 1,000+ verified AI tools organized by category, with ratings and reviews.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="why-card"
              >
                <div className="why-card__icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── See It in Action ────────────────────────────────── */}
      <section className="action-section" id="action">
        <div className="section__inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section__header"
          >
            <h2>See it in Action</h2>
            <p>
              A preview of what our conversational discovery can do for
              you — it's that easy.
            </p>
          </motion.div>

          <div className="action-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="action-card"
            >
              <h3>Chat with AI</h3>
              <p>
                Describe your workflow, ask questions, and get personalized
                suggestions. Our AI understands context and provides recommendations
                tailored to your needs.
              </p>
              <div className="action-card__image">
                <img src={chatMockupImg} alt="Chat with AI mockup" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="action-card"
            >
              <h3>Browse the Catalog</h3>
              <p>
                Explore our curated collection of AI tools filtered by category. Read
                reviews and find the best tools for your workflow.
              </p>
              <div className="action-card__image">
                <img src={catalogImg} alt="Browse the catalog" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────── */}
      <section className="how-it-works" id="how-it-works">
        <div className="section__inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section__header"
          >
            <h2>How It Works</h2>
            <p>Three simple steps to find your perfect AI tool.</p>
          </motion.div>

          <div className="steps">
            {[
              {
                step: "01",
                title: "Tell us about you",
                description:
                  "Share your role, expertise, and preferences during a simple onboarding flow.",
              },
              {
                step: "02",
                title: "Describe your need",
                description:
                  "Describe what you're working on — our AI understands context, not just keywords.",
              },
              {
                step: "03",
                title: "Get recommendations",
                description:
                  "Receive ranked, curated tools with explanations, trade-offs, and practical guidance.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="step-card"
              >
                <span className="step-card__number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Banner ─────────────────────────────────────── */}
      <section className="tech-banner-section">
        <div className="section__inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="tech-banner"
          >
            <img src={techBannerImg} alt="AI Tools Connected" />
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="section__inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="cta-box"
          >
            <h2>Ready to discover your AI toolkit?</h2>
            <p>
              Join thousands of creative professionals who find the tools they need, fast.
            </p>
            <Link to="/register" className="cta-box__btn">
              Get Started for Free <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <Logo className="landing-nav__logo" size={22} />
          </div>
          <p className="landing-footer__copy">
            &copy; 2026 Discover.io. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
