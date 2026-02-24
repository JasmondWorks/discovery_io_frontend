import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Target,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  Zap,
  Shield,
  MessageSquare,
} from "lucide-react";
import "./LandingPage.css";

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav__inner">
          <Link to="/" className="landing-nav__logo">
            <span className="logo-mark">D</span>
            <span className="logo-wordmark">
              Discover<span>.io</span>
            </span>
          </Link>

          <nav className={`landing-nav__links ${menuOpen ? "open" : ""}`}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </nav>

          <div className="landing-nav__actions">
            <Link to="/login" className="nav-link-btn">
              Log In
            </Link>
            <Link to="/register" className="nav-cta-btn">
              Get Started <ArrowRight size={16} />
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
      <section className="hero">
        <div className="hero__orb hero__orb--1" aria-hidden="true" />
        <div className="hero__orb hero__orb--2" aria-hidden="true" />

        <div className="hero__content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hero__text"
          >
            <div className="hero__badge">
              <Sparkles size={14} />
              <span>AI-Powered Discovery</span>
            </div>

            <h1>
              The right AI tool for
              <br />
              your <span className="hero__accent">exact use case</span>
            </h1>

            <p className="hero__subtitle">
              No more wasting time on tools that don't fit. Discover.io listens
              to what you need and recommends AI tools that are relevant,
              reliable and built for your specific needs.
            </p>

            <div className="hero__cta-group">
              <Link to="/register" className="hero__cta-primary">
                Start Discovering <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="hero__cta-secondary">
                See How It Works
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="hero__visual"
          >
            <div className="hero__mockup">
              <div className="mockup__header">
                <div className="mockup__dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="mockup__title">Discover.io</span>
              </div>
              <div className="mockup__body">
                <div className="mockup__message mockup__message--user">
                  I need an AI tool to generate social media copies for a
                  fashion brand
                </div>
                <div className="mockup__message mockup__message--ai">
                  <div className="mockup__ai-header">
                    <Sparkles size={14} /> Understanding your needs...
                  </div>
                  <div className="mockup__diagnosis">
                    <div className="mockup__tag">
                      <strong>Persona:</strong> Social Media Marketer
                    </div>
                    <div className="mockup__tag">
                      <strong>Task:</strong> Generate brand-aligned fashion copy
                    </div>
                    <div className="mockup__tag">
                      <strong>Criteria:</strong> On-brand tone, multi-platform
                    </div>
                  </div>
                </div>
                <div className="mockup__message mockup__message--ai">
                  Here are 5 tools curated for you →
                </div>
              </div>
              <div className="mockup__input">
                <Search size={16} />
                <span>Tell me what you need...</span>
              </div>
            </div>
          </motion.div>
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
            <h2>Why Discover.io?</h2>
            <p>
              Stop scrolling through endless lists. Get AI tool recommendations
              that actually fit your workflow.
            </p>
          </motion.div>

          <div className="features__grid">
            {[
              {
                icon: <MessageSquare size={24} />,
                title: "Natural Language Search",
                description:
                  "Just describe your problem in plain English. Our AI understands context, not just keywords.",
              },
              {
                icon: <Target size={24} />,
                title: "Context-Driven Matching",
                description:
                  "We diagnose your exact use case — your role, task, and success criteria — before recommending anything.",
              },
              {
                icon: <BarChart3 size={24} />,
                title: "Ranked Recommendations",
                description:
                  "Every tool is scored on usefulness, relevance, and reliability. No guesswork, just data.",
              },
              {
                icon: <Shield size={24} />,
                title: "Verified & Curated",
                description:
                  "We only recommend tools from our verified database. No hallucinated products, ever.",
              },
              {
                icon: <Zap size={24} />,
                title: "Built for Creatives",
                description:
                  "Designers, developers, writers, marketers — we understand your specific workflows.",
              },
              {
                icon: <Sparkles size={24} />,
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
                <div className="feature-card__icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
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
                  "Receive a ranked leaderboard of tools with explanations, trade-offs, and practical guidance for your specific case.",
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
              Get Started — It's Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="landing-footer" id="about">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-nav__logo">
              <span className="logo-mark">D</span>
              <span className="logo-wordmark">
                Discover<span>.io</span>
              </span>
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
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#about">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#about">Privacy Policy</a>
              <a href="#about">Terms of Service</a>
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
