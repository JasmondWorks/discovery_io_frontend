import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Plus,
  Search,
  Compass,
  Grid3X3,
  Send,
  Mic,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  Globe,
  Loader2,
  Bot,
  Check,
  Edit3,
  ExternalLink,
  Trophy,
  Star,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import robotMascot from "./robot-mascot.png";
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

interface HistoryItem {
  id: string;
  text: string;
  date: "Today" | "Yesterday";
}

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: "1",
    text: "AI tools for social media",
    date: "Today",
  },
  {
    id: "2",
    text: "Podcast audio cleanup",
    date: "Today",
  },
  {
    id: "3",
    text: "Code review assistants",
    date: "Yesterday",
  },
  {
    id: "4",
    text: "Design tools for wireframes",
    date: "Yesterday",
  },
  {
    id: "5",
    text: "SEO content writing tools",
    date: "Yesterday",
  },
];

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatPhase, setChatPhase] = useState<
    "idle" | "searching" | "diagnosis" | "results"
  >("idle");
  const [_currentDiagnosis, setCurrentDiagnosis] = useState<
    ChatMessage["diagnosis"] | null
  >(null);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate AI diagnosis after a short delay
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

    // Simulate results
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

  const handleNewChat = () => {
    setMessages([]);
    setChatPhase("idle");
    setCurrentDiagnosis(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const todayHistory = HISTORY_ITEMS.filter((h) => h.date === "Today");
  const yesterdayHistory = HISTORY_ITEMS.filter((h) => h.date === "Yesterday");

  return (
    <div className="chatbot-page">
      {/* ─── Dark Sidebar ─────────────────────────── */}
      <aside className="chatbot-sidebar">
        <button className="chatbot-sidebar__btn" title="Home" onClick={() => navigate("/")}>
          <Home size={20} />
          <span className="chatbot-sidebar__label">Home</span>
        </button>
        <button className="chatbot-sidebar__btn" title="New Chat" onClick={handleNewChat}>
          <Plus size={20} />
          <span className="chatbot-sidebar__label">New Chat</span>
        </button>
        <button className="chatbot-sidebar__btn" title="Search">
          <Search size={20} />
          <span className="chatbot-sidebar__label">Search</span>
        </button>
        <button className="chatbot-sidebar__btn" title="Explore">
          <Compass size={20} />
          <span className="chatbot-sidebar__label">Explore</span>
        </button>
        <button className="chatbot-sidebar__btn" title="Tools Catalogue" onClick={() => navigate("/catalogue")}>
          <Grid3X3 size={20} />
          <span className="chatbot-sidebar__label">Tools</span>
        </button>

        <div className="chatbot-sidebar__spacer" />

        <button className="chatbot-sidebar__profile" title="Profile">
          <div className="chatbot-sidebar__avatar">
            <Bot size={20} />
          </div>
          <span className="chatbot-sidebar__label">Profile</span>
        </button>
      </aside>

      {/* ─── Main Content ─────────────────────────── */}
      <div className="chatbot-main">
        {/* ─── Chat Area ──────────────────────────── */}
        <div className="chatbot-chat-area">
          {messages.length === 0 ? (
            <div className="chatbot-welcome">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="chatbot-welcome__inner"
              >
                {/* Robot mascot */}
                <div className="chatbot-welcome__mascot">
                  <img src={robotMascot} alt="AI Assistant" />
                </div>

                {/* Welcome content */}
                <div className="chatbot-welcome__icon">
                  <Sparkles size={28} />
                </div>
                <h1 className="chatbot-welcome__title">
                  The right AI tool for your exact use case
                </h1>
                <p className="chatbot-welcome__subtitle">
                  Describe your problem, task, or workflow in natural language.
                  <br />
                  I'll diagnose your needs and recommend the best tools.
                </p>

                {/* Suggestion chips in welcome */}
                <div className="chatbot-welcome__suggestions">
                  <button
                    className="chatbot-suggestion-chip"
                    onClick={() =>
                      handleSend(
                        "I need an AI tool to generate social media copies for a fashion brand"
                      )
                    }
                  >
                    <Sparkles size={14} /> Generate social media copies
                  </button>
                  <button
                    className="chatbot-suggestion-chip"
                    onClick={() =>
                      handleSend(
                        "Looking for a tool to clean up background noise from my podcast audio"
                      )
                    }
                  >
                    <Sparkles size={14} /> Clean up podcast audio
                  </button>
                  <button
                    className="chatbot-suggestion-chip"
                    onClick={() =>
                      handleSend(
                        "I need a design tool that can generate mockups from wireframes using AI"
                      )
                    }
                  >
                    <Sparkles size={14} /> Generate mockups from wireframes
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="chatbot-messages">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`chatbot-msg chatbot-msg--${msg.role}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="chatbot-msg__avatar">
                        <img src={robotMascot} alt="AI" />
                      </div>
                    )}
                    <div className="chatbot-msg__content">
                      <p>{msg.content}</p>

                      {/* Diagnosis Card */}
                      {msg.type === "diagnosis" && msg.diagnosis && (
                        <div className="chatbot-diagnosis-card">
                          <div className="chatbot-diagnosis-card__header">
                            <Sparkles size={16} />
                            <span>Understanding Confirmed</span>
                          </div>
                          <div className="chatbot-diagnosis-card__body">
                            <div className="chatbot-diagnosis-tag">
                              <strong>Persona:</strong> {msg.diagnosis.persona}
                            </div>
                            <div className="chatbot-diagnosis-tag">
                              <strong>Core Task:</strong> {msg.diagnosis.task}
                            </div>
                            <div className="chatbot-diagnosis-tag">
                              <strong>Success Criteria:</strong>{" "}
                              {msg.diagnosis.successCriteria}
                            </div>
                          </div>
                          {chatPhase === "diagnosis" && (
                            <div className="chatbot-diagnosis-card__actions">
                              <button
                                className="chatbot-diag-btn chatbot-diag-btn--confirm"
                                onClick={handleConfirmDiagnosis}
                              >
                                <Check size={16} /> That's correct
                              </button>
                              <button className="chatbot-diag-btn chatbot-diag-btn--edit">
                                <Edit3 size={16} /> Let me clarify
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Results Cards */}
                      {msg.type === "results" && msg.tools && (
                        <div className="chatbot-results-list">
                          {msg.tools.map((tool) => (
                            <div key={tool.id} className="chatbot-tool-card">
                              <div className="chatbot-tool-card__header">
                                <div className="chatbot-tool-card__rank">
                                  {tool.rank === 1 ? (
                                    <Trophy size={16} />
                                  ) : (
                                    <span>#{tool.rank}</span>
                                  )}
                                </div>
                                <div className="chatbot-tool-card__name-group">
                                  <h4>{tool.name}</h4>
                                  <p>{tool.description}</p>
                                </div>
                                <a
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="chatbot-tool-card__link"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              </div>

                              <div className="chatbot-tool-card__scores">
                                <div className="chatbot-score-item">
                                  <Star size={14} />
                                  <span>Usefulness</span>
                                  <div className="chatbot-score-bar">
                                    <div
                                      className="chatbot-score-bar__fill"
                                      style={{ width: `${tool.usefulness}%` }}
                                    />
                                  </div>
                                  <span className="chatbot-score-value">
                                    {tool.usefulness}%
                                  </span>
                                </div>
                                <div className="chatbot-score-item">
                                  <Star size={14} />
                                  <span>Relevance</span>
                                  <div className="chatbot-score-bar">
                                    <div
                                      className="chatbot-score-bar__fill"
                                      style={{ width: `${tool.relevance}%` }}
                                    />
                                  </div>
                                  <span className="chatbot-score-value">
                                    {tool.relevance}%
                                  </span>
                                </div>
                                <div className="chatbot-score-item">
                                  <Star size={14} />
                                  <span>Reliability</span>
                                  <div className="chatbot-score-bar">
                                    <div
                                      className="chatbot-score-bar__fill"
                                      style={{ width: `${tool.reliability}%` }}
                                    />
                                  </div>
                                  <span className="chatbot-score-value">
                                    {tool.reliability}%
                                  </span>
                                </div>
                              </div>

                              <div className="chatbot-tool-card__details">
                                <div className="chatbot-tool-detail">
                                  <AlertTriangle size={14} />
                                  <span>
                                    <strong>Trade-off:</strong> {tool.tradeoff}
                                  </span>
                                </div>
                                <div className="chatbot-tool-detail">
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

                      <span className="chatbot-msg__time">{msg.time}</span>
                    </div>

                    {msg.role === "user" && (
                      <div className="chatbot-msg__avatar chatbot-msg__avatar--user">
                        <span>Y</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {chatPhase === "searching" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="chatbot-msg chatbot-msg--assistant"
                >
                  <div className="chatbot-msg__avatar">
                    <img src={robotMascot} alt="AI" />
                  </div>
                  <div className="chatbot-msg__content chatbot-msg__typing">
                    <Loader2 size={16} className="spinning" />
                    <span>Analyzing your request...</span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ─── Input Bar ────────────────────────── */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-bar-top">
              <span className="chatbot-input-plan">
                Unlock more with <strong>Pro Plan</strong>
              </span>
              <span className="chatbot-input-version">
                <Sparkles size={12} />
                Powered by Assistant v2.6
              </span>
            </div>
            <form className="chatbot-input-bar" onSubmit={handleSubmit}>
              <button type="button" className="chatbot-input-bar__add">
                <Plus size={18} />
              </button>
              <input
                type="text"
                className="chatbot-input-bar__input"
                placeholder="Describe what you need an AI tool for..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={chatPhase === "searching"}
                autoFocus
              />
              <button type="button" className="chatbot-input-bar__mic">
                <Mic size={18} />
              </button>
              <button
                type="submit"
                className="chatbot-input-bar__send"
                disabled={!input.trim() || chatPhase === "searching"}
              >
                <Send size={18} />
              </button>
            </form>

            {/* Suggestion Chips */}
            <div className="chatbot-chips">
              <button
                className="chatbot-chip"
                onClick={() =>
                  handleSend(
                    "I need an AI tool to generate social media copies for a fashion brand"
                  )
                }
              >
                <Sparkles size={14} />
                Social Media
              </button>
              <button
                className="chatbot-chip"
                onClick={() =>
                  handleSend(
                    "Looking for a tool to clean up background noise from my podcast audio"
                  )
                }
              >
                <Sparkles size={14} />
                Audio Cleanup
              </button>
              <button
                className="chatbot-chip"
                onClick={() =>
                  handleSend(
                    "I need a design tool that can generate mockups from wireframes using AI"
                  )
                }
              >
                <Globe size={14} />
                Design Mockups
              </button>
              <button className="chatbot-chip chatbot-chip--more">
                <MoreHorizontal size={14} />
              </button>
            </div>

            <p className="chatbot-input-hint">
              Discover.io recommends tools from our verified database only.
            </p>
          </div>
        </div>

        {/* ─── History Panel ──────────────────────── */}
        <aside className="chatbot-history">
          <div className="chatbot-history__section">
            <button className="chatbot-history__heading">
              Today <ChevronDown size={14} />
            </button>
            <div className="chatbot-history__list">
              {todayHistory.map((item) => (
                <button
                  key={item.id}
                  className={`chatbot-history__item ${selectedHistory === item.id ? "active" : ""}`}
                  onClick={() => setSelectedHistory(item.id)}
                >
                  <Search size={14} />
                  <span className="chatbot-history__text">{item.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="chatbot-history__section">
            <button className="chatbot-history__heading">
              Yesterday <ChevronDown size={14} />
            </button>
            <div className="chatbot-history__list">
              {yesterdayHistory.map((item) => (
                <button
                  key={item.id}
                  className={`chatbot-history__item ${selectedHistory === item.id ? "active" : ""}`}
                  onClick={() => setSelectedHistory(item.id)}
                >
                  <Search size={14} />
                  <span className="chatbot-history__text">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
