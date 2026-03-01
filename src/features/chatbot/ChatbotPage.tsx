import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  Bookmark,
  User,
  Send,
  Sparkles,
  Loader2,
  Check,
  Edit3,
  ExternalLink,
  Trophy,
  Star,
  AlertTriangle,
  Lightbulb,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { Logo } from "../../components/common/Logo";
import "./ChatbotPage.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  type?: "text" | "diagnosis" | "results";
  diagnosis?: {
    persona: string;
    task: string;
    successCriteria: string;
  };
  tools?: Array<{
    id: string;
    name: string;
    rank: number;
    description: string;
    usefulness: number;
    relevance: number;
    reliability: number;
    tradeoff: string;
    guidance: string;
    url: string;
  }>;
}

const MOCK_TOOLS = [
  {
    id: "1",
    name: "Copy.ai",
    rank: 1,
    description:
      "Advanced AI copywriting tool with specific templates for every marketing use case.",
    usefulness: 98,
    relevance: 95,
    reliability: 92,
    tradeoff: "Can sometimes feel overwhelming with too many options.",
    guidance:
      'Start with the "Social Media Post" template for best results.',
    url: "https://copy.ai",
  },
  {
    id: "2",
    name: "Jasper",
    rank: 2,
    description:
      "Enterprise-grade content platform that helps teams stay on brand across all channels.",
    usefulness: 94,
    relevance: 91,
    reliability: 95,
    tradeoff: "More expensive than other tools on this list.",
    guidance:
      'Use the "Brand Voice" feature to upload your existing content.',
    url: "https://jasper.ai",
  },
  {
    id: "3",
    name: "Writesonic",
    rank: 3,
    description:
      "SEO-optimized content generator that excels at long-form articles and ad copies.",
    usefulness: 89,
    relevance: 88,
    reliability: 90,
    tradeoff: "Output quality can vary depending on prompt specificity.",
    guidance: 'Use "Photosonic" integration for matching images.',
    url: "https://writesonic.com",
  },
  {
    id: "4",
    name: "Anyword",
    rank: 4,
    description:
      "Data-driven copywriting platform that predicts how your audience will react.",
    usefulness: 85,
    relevance: 84,
    reliability: 88,
    tradeoff: "Focuses more on performance than creative flair.",
    guidance: 'Pay attention to the "Predictive Performance Score".',
    url: "https://anyword.com",
  },
  {
    id: "5",
    name: "Rytr",
    rank: 5,
    description:
      "Simple, fast, and affordable AI writing assistant for everyday tasks.",
    usefulness: 80,
    relevance: 78,
    reliability: 85,
    tradeoff: "Lacks advanced collaboration features.",
    guidance: "The mobile app is great for drafting copies on the go.",
    url: "https://rytr.me",
  },
];

export function ChatbotPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatPhase, setChatPhase] = useState<
    "idle" | "searching" | "diagnosis" | "results"
  >("idle");
  const [_currentDiagnosis, setCurrentDiagnosis] = useState<
    ChatMessage["diagnosis"] | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Add initial welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content:
          'Hi! 👋 I\'m your AI discovery assistant. Tell me about a task or workflow, and I\'ll recommend the best AI tools for you. For example, try "I need help writing blog posts" or "What tools can help me edit videos?"',
        time: getCurrentTime(),
        type: "text",
      };
      setMessages([welcomeMsg]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || chatPhase === "searching") return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      time: getCurrentTime(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatPhase("searching");

    setTimeout(() => {
      const diagnosis = {
        persona: "Creative Professional",
        task:
          messageText.length > 60
            ? messageText.substring(0, 57) + "..."
            : messageText,
        successCriteria:
          "Must be user-friendly, reliable, and fit existing workflow.",
      };
      setCurrentDiagnosis(diagnosis);

      const diagMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've analyzed your request. Here's what I understand:",
        time: getCurrentTime(),
        type: "diagnosis",
        diagnosis,
      };
      setMessages((prev) => [...prev, diagMsg]);
      setChatPhase("diagnosis");
    }, 1500);
  };

  const handleConfirmDiagnosis = () => {
    const confirmMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: "Yes, that's correct. Please find tools for me.",
      time: getCurrentTime(),
      type: "text",
    };
    setMessages((prev) => [...prev, confirmMsg]);
    setChatPhase("searching");

    setTimeout(() => {
      const resultsMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Here are 5 tools I've curated for you based on your request. Each tool is ranked by usefulness, relevance, and reliability:",
        time: getCurrentTime(),
        type: "results",
        tools: MOCK_TOOLS,
      };
      setMessages((prev) => [...prev, resultsMsg]);
      setChatPhase("results");
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="chat-page">
      {/* ─── Top Navbar ─────────────────────────── */}
      <header className="chat-navbar">
        <div className="chat-navbar__inner">
          <Logo className="chat-navbar__logo" size={20} />

          {/* Desktop Nav */}
          <nav className="chat-navbar__links">
            <Link to="/chat" className="chat-navbar__link active">
              <Search size={16} />
              <span>Discover</span>
            </Link>
            <Link to="/catalogue" className="chat-navbar__link">
              <LayoutGrid size={16} />
              <span>Catalog</span>
            </Link>
            <a href="#" className="chat-navbar__link">
              <Bookmark size={16} />
              <span>Saved</span>
            </a>
            <Link to="/profile" className="chat-navbar__link">
              <User size={16} />
              <span>Profile</span>
            </Link>
          </nav>

          <button
            className="chat-navbar__signout chat-navbar__signout--desktop"
            onClick={() => navigate("/")}
          >
            <LogOut size={16} />
            <span>Sign out</span>
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
                  className="chat-mobile-menu__link active"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search size={18} />
                  <span>Discover</span>
                </Link>
                <Link
                  to="/catalogue"
                  className="chat-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutGrid size={18} />
                  <span>Catalog</span>
                </Link>
                <a
                  href="#"
                  className="chat-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark size={18} />
                  <span>Saved</span>
                </a>
                <Link
                  to="/profile"
                  className="chat-mobile-menu__link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
              </nav>

              <div className="chat-mobile-menu__footer">
                <button
                  className="chat-mobile-menu__signout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/");
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

      {/* ─── Chat Area ──────────────────────────── */}
      <main className="chat-main">
        <div className="chat-messages">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`chat-msg chat-msg--${msg.role}`}
              >
                {msg.role === "assistant" && (
                  <div className="chat-msg__label">
                    <Sparkles size={14} />
                    <span>Discover.io</span>
                  </div>
                )}
                <div className="chat-msg__bubble">
                  <p>{msg.content}</p>

                  {/* Diagnosis Card */}
                  {msg.type === "diagnosis" && msg.diagnosis && (
                    <div className="chat-diagnosis-card">
                      <div className="chat-diagnosis-card__header">
                        <Sparkles size={16} />
                        <span>Understanding Confirmed</span>
                      </div>
                      <div className="chat-diagnosis-card__body">
                        <div className="chat-diagnosis-tag">
                          <strong>Persona:</strong> {msg.diagnosis.persona}
                        </div>
                        <div className="chat-diagnosis-tag">
                          <strong>Core Task:</strong> {msg.diagnosis.task}
                        </div>
                        <div className="chat-diagnosis-tag">
                          <strong>Success Criteria:</strong>{" "}
                          {msg.diagnosis.successCriteria}
                        </div>
                      </div>
                      {chatPhase === "diagnosis" && (
                        <div className="chat-diagnosis-card__actions">
                          <button
                            className="chat-diag-btn chat-diag-btn--confirm"
                            onClick={handleConfirmDiagnosis}
                          >
                            <Check size={16} /> That's correct
                          </button>
                          <button className="chat-diag-btn chat-diag-btn--edit">
                            <Edit3 size={16} /> Let me clarify
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results Cards */}
                  {msg.type === "results" && msg.tools && (
                    <div className="chat-results-list">
                      {msg.tools.map((tool) => (
                        <div key={tool.id} className="chat-tool-card">
                          <div className="chat-tool-card__header">
                            <div className="chat-tool-card__rank">
                              {tool.rank === 1 ? (
                                <Trophy size={16} />
                              ) : (
                                <span>#{tool.rank}</span>
                              )}
                            </div>
                            <div className="chat-tool-card__name-group">
                              <h4>{tool.name}</h4>
                              <p>{tool.description}</p>
                            </div>
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat-tool-card__link"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>

                          <div className="chat-tool-card__scores">
                            <div className="chat-score-item">
                              <Star size={14} />
                              <span>Usefulness</span>
                              <div className="chat-score-bar">
                                <div
                                  className="chat-score-bar__fill"
                                  style={{ width: `${tool.usefulness}%` }}
                                />
                              </div>
                              <span className="chat-score-value">
                                {tool.usefulness}%
                              </span>
                            </div>
                            <div className="chat-score-item">
                              <Star size={14} />
                              <span>Relevance</span>
                              <div className="chat-score-bar">
                                <div
                                  className="chat-score-bar__fill"
                                  style={{ width: `${tool.relevance}%` }}
                                />
                              </div>
                              <span className="chat-score-value">
                                {tool.relevance}%
                              </span>
                            </div>
                            <div className="chat-score-item">
                              <Star size={14} />
                              <span>Reliability</span>
                              <div className="chat-score-bar">
                                <div
                                  className="chat-score-bar__fill"
                                  style={{ width: `${tool.reliability}%` }}
                                />
                              </div>
                              <span className="chat-score-value">
                                {tool.reliability}%
                              </span>
                            </div>
                          </div>

                          <div className="chat-tool-card__details">
                            <div className="chat-tool-detail">
                              <AlertTriangle size={14} />
                              <span>
                                <strong>Trade-off:</strong> {tool.tradeoff}
                              </span>
                            </div>
                            <div className="chat-tool-detail">
                              <Lightbulb size={14} />
                              <span>
                                <strong>How to use:</strong> {tool.guidance}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {chatPhase === "searching" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="chat-msg chat-msg--assistant"
            >
              <div className="chat-msg__label">
                <Sparkles size={14} />
                <span>Discover.io</span>
              </div>
              <div className="chat-msg__bubble chat-msg__typing">
                <Loader2 size={16} className="spinning" />
                <span>Analyzing your request...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Input Bar ────────────────────────── */}
        <div className="chat-input-area">
          <form className="chat-input-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input-bar__input"
              placeholder="Describe what you're working on..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatPhase === "searching"}
              autoFocus
            />
            <button
              type="submit"
              className="chat-input-bar__send"
              disabled={!input.trim() || chatPhase === "searching"}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="chat-input-hint">
            AI recommendations are based on curated tool data and your workflow
            context.
          </p>
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ──────────────────── */}
      {/* <nav className="chat-bottom-nav">
        <Link to="/chat" className="chat-bottom-nav__item active">
          <Search size={20} />
          <span>Discover</span>
        </Link>
        <Link to="/catalogue" className="chat-bottom-nav__item">
          <LayoutGrid size={20} />
          <span>Catalog</span>
        </Link>
        <a href="#" className="chat-bottom-nav__item">
          <Bookmark size={20} />
          <span>Saved</span>
        </a>
        <a href="#" className="chat-bottom-nav__item">
          <User size={20} />
          <span>Profile</span>
        </a>
      </nav> */}
    </div>
  );
}
