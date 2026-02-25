import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import stickyNoteImg from "./assets/sticky-note.png";
import remindersImg from "./assets/reminders.png";
import tasksImg from "./assets/tasks.png";
import integrationsImg from "./assets/integrations.png";
import "./LandingPage.css";

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__logo">
            <span className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="11" height="11" rx="3" fill="#1a1d2e" />
                <rect x="15" width="11" height="11" rx="3" fill="#1a1d2e" />
                <rect y="15" width="11" height="11" rx="3" fill="#1a1d2e" />
                <circle cx="20.5" cy="20.5" r="4" fill="#2ec4b6" />
              </svg>
            </span>
            <span className="logo-wordmark">Discover.io</span>
          </Link>

          <nav className={`landing-nav__links ${menuOpen ? "open" : ""}`}>
            <a href="#hero" onClick={() => setMenuOpen(false)}>
              Home
            </a>
            <a href="#features" className="nav-dropdown-trigger" onClick={() => setMenuOpen(false)}>
              Features <ChevronDown size={14} />
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
            {/* Mobile-only auth links */}
            <div className="mobile-auth-links">
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="mobile-signup-btn"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </nav>

          <div className="landing-nav__actions">
            <Link to="/login" className="nav-link-btn">
              Login
            </Link>
            <Link to="/register" className="nav-cta-btn">
              Sign Up
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

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero__bg" aria-hidden="true" />

        {/* Floating cards around the hero */}
        <motion.div
          className="hero__float-card hero__float-card--sticky"
          initial={{ opacity: 0, x: -60, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <img src={stickyNoteImg} alt="Sticky notes" />
        </motion.div>

        <motion.div
          className="hero__float-card hero__float-card--reminders"
          initial={{ opacity: 0, x: 60, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <img src={remindersImg} alt="Reminders widget" />
        </motion.div>

        <motion.div
          className="hero__float-card hero__float-card--tasks"
          initial={{ opacity: 0, x: -40, y: 40 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <img src={tasksImg} alt="Today's tasks" />
        </motion.div>

        <motion.div
          className="hero__float-card hero__float-card--integrations"
          initial={{ opacity: 0, x: 40, y: 40 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <img src={integrationsImg} alt="100+ integrations" />
        </motion.div>

        {/* Center content */}
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
              <span>Discover AI Tools Smarter</span>
            </div>

            <h1>
              Smarter AI Tool{" "}
              <span className="hero__accent accent-italic">Discovery</span>,
              <br />
              Powered by{" "}
              <span className="hero__accent-light">Real Context</span>
            </h1>

            <p className="hero__subtitle">
              Describe your problem, and we'll recommend the perfect AI tools.
              No more guesswork — get context-driven, ranked recommendations
              tailored to your exact workflow.
            </p>

            <div className="hero__cta-group">
              <Link to="/register" className="hero__cta-primary">
                Start Free Trial <ArrowUpRight size={16} />
              </Link>
              <a href="#how-it-works" className="hero__cta-secondary">
                Learn More <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Trust Badges ──────────────────────────────────── */}
      <section className="trust-section">
        <div className="section__inner">
          <p className="trust-label">Trusted by 104+ Businesses</p>
          <div className="trust-logos">
            {["CoreOS", "Leapyear", "EasyTax", "Foresight", "Peregrin"].map(
              (name) => (
                <div key={name} className="trust-logo">
                  <span className="trust-logo__icon">✦</span>
                  <span className="trust-logo__name">{name}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="section__inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section__header"
          >
            <div className="section__badge">
              <span>One AI Tool Discovery Hub</span>
            </div>
            <h2>
              Everything You Need to
              <br />
              <span className="accent-italic">Find the Right Tools</span>
            </h2>
            <p>
              Our system understands your problems and recommends tools with
              context, not just keywords. Built for creatives who need results.
            </p>
          </motion.div>

          <div className="features__grid">
            {[
              {
                emoji: "💬",
                title: "Natural Language Search",
                description:
                  "Just describe your problem in plain English. Our AI understands context, not just keywords.",
              },
              {
                emoji: "🎯",
                title: "Context-Driven Matching",
                description:
                  "We diagnose your exact use case — your role, task, and success criteria — before recommending.",
              },
              {
                emoji: "📊",
                title: "Ranked Recommendations",
                description:
                  "Every tool is scored on usefulness, relevance, and reliability. No guesswork, just data.",
              },
              {
                emoji: "🛡️",
                title: "Verified & Curated",
                description:
                  "We only recommend tools from our verified database. No hallucinated products, ever.",
              },
              {
                emoji: "⚡",
                title: "Built for Creatives",
                description:
                  "Designers, developers, writers, marketers — we understand your specific workflows.",
              },
              {
                emoji: "✨",
                title: "Practical Guidance",
                description:
                  "Don't just get a list — get actionable advice on how to use each tool for your task.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="feature-card"
              >
                <div className="feature-card__icon">{feature.emoji}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About / Stats Section ────────────────────────── */}
      <section className="about-section" id="about">
        <div className="section__inner about-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="about-text"
          >
            <div className="section__badge">
              <span>About Us</span>
            </div>
            <h2>
              Simplifying AI Tool{" "}
              <span className="accent-italic">Discovery</span>
            </h2>
            <p>
              Discover.io helps creatives, developers, and professionals find AI
              tools with clarity and confidence. We go beyond generic search
              results to give you context-driven, personalized recommendations.
            </p>
            <Link to="/register" className="about-cta">
              Explore More →
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="about-stats"
          >
            <div className="stat-item">
              <span className="stat-number">100K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Tools Analyzed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </motion.div>
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
                title: "Describe Your Need",
                description:
                  'Tell us what you\'re trying to accomplish in your own words. For example: "I need an AI to clean up podcast audio."',
              },
              {
                step: "02",
                title: "We Diagnose & Confirm",
                description:
                  "Our AI extracts your persona, core task, and success criteria — then confirms with you before searching.",
              },
              {
                step: "03",
                title: "Get Curated Results",
                description:
                  "Receive a ranked list of tools with explanations, trade-offs, and practical guidance for your specific case.",
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
            <h2>Ready to find the right tool?</h2>
            <p>
              Join Discover.io and stop wasting time on tools that don't fit
              your workflow.
            </p>
            <Link to="/register" className="hero__cta-primary">
              Get Started — It's Free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-nav__logo">
              <span className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <rect width="11" height="11" rx="3" fill="#1a1d2e" />
                  <rect x="15" width="11" height="11" rx="3" fill="#1a1d2e" />
                  <rect y="15" width="11" height="11" rx="3" fill="#1a1d2e" />
                  <circle cx="20.5" cy="20.5" r="4" fill="#2ec4b6" />
                </svg>
              </span>
              <span className="logo-wordmark">Discover.io</span>
            </div>
            <p>
              AI-powered discovery for creatives. Find the right tool, every
              time.
            </p>
          </div>

          <div className="landing-footer__links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <Link to="/chat">Try Chat</Link>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
              <Link to="/onboarding">Onboarding</Link>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#about">Contact</a>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <p>&copy; 2026 Discover.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
