import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Check,
  Edit3,
  ExternalLink,
  Trophy,
  Star,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from "lucide-react";
import "./ChatView.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
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

interface ChatViewProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  chatPhase: "idle" | "searching" | "diagnosis" | "results";
  onConfirmDiagnosis: () => void;
  sidebarOpen: boolean;
}

export function ChatView({
  messages,
  onSend,
  chatPhase,
  onConfirmDiagnosis,
  sidebarOpen,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && chatPhase !== "searching") {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <main className={`chat-view ${sidebarOpen ? "" : "chat-view--expanded"}`}>
      <div className="chat-view__messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chat-welcome__inner"
            >
              <div className="chat-welcome__icon">
                <Sparkles size={32} />
              </div>
              <h1>The right AI tool for your exact use case</h1>
              <p>
                Describe your problem, task, or workflow in natural language.
                <br />
                I'll diagnose your needs and recommend the best tools.
              </p>
              <div className="chat-welcome__suggestions">
                <button
                  className="suggestion-chip"
                  onClick={() =>
                    setInput(
                      "I need an AI tool to generate social media copies for a fashion brand",
                    )
                  }
                >
                  <Sparkles size={14} /> Generate social media copies
                </button>
                <button
                  className="suggestion-chip"
                  onClick={() =>
                    setInput(
                      "Looking for a tool to clean up background noise from my podcast audio",
                    )
                  }
                >
                  <Sparkles size={14} /> Clean up podcast audio
                </button>
                <button
                  className="suggestion-chip"
                  onClick={() =>
                    setInput(
                      "I need a design tool that can generate mockups from wireframes using AI",
                    )
                  }
                >
                  <Sparkles size={14} /> Generate mockups from wireframes
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="chat-messages-list">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`chat-message chat-message--${msg.role}`}
                >
                  {msg.role === "assistant" && (
                    <div className="chat-message__avatar">
                      <Sparkles size={16} />
                    </div>
                  )}

                  <div className="chat-message__content">
                    <p>{msg.content}</p>

                    {/* Diagnosis Card */}
                    {msg.type === "diagnosis" && msg.diagnosis && (
                      <div className="diagnosis-card">
                        <div className="diagnosis-card__header">
                          <Sparkles size={16} />
                          <span>Understanding Confirmed</span>
                        </div>
                        <div className="diagnosis-card__body">
                          <div className="diagnosis-tag">
                            <strong>Persona:</strong> {msg.diagnosis.persona}
                          </div>
                          <div className="diagnosis-tag">
                            <strong>Core Task:</strong> {msg.diagnosis.task}
                          </div>
                          <div className="diagnosis-tag">
                            <strong>Success Criteria:</strong>{" "}
                            {msg.diagnosis.successCriteria}
                          </div>
                        </div>
                        {chatPhase === "diagnosis" && (
                          <div className="diagnosis-card__actions">
                            <button
                              className="diagnosis-btn diagnosis-btn--confirm"
                              onClick={onConfirmDiagnosis}
                            >
                              <Check size={16} /> That's correct
                            </button>
                            <button className="diagnosis-btn diagnosis-btn--edit">
                              <Edit3 size={16} /> Let me clarify
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Results Cards */}
                    {msg.type === "results" && msg.tools && (
                      <div className="results-list">
                        {msg.tools.map((tool) => (
                          <div key={tool.id} className="tool-card">
                            <div className="tool-card__header">
                              <div className="tool-card__rank">
                                {tool.rank === 1 ? (
                                  <Trophy size={16} />
                                ) : (
                                  <span>#{tool.rank}</span>
                                )}
                              </div>
                              <div className="tool-card__name-group">
                                <h4>{tool.name}</h4>
                                <p>{tool.description}</p>
                              </div>
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tool-card__link"
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>

                            <div className="tool-card__scores">
                              <div className="score-item">
                                <Star size={14} />
                                <span>Usefulness</span>
                                <div className="score-bar">
                                  <div
                                    className="score-bar__fill"
                                    style={{ width: `${tool.usefulness}%` }}
                                  />
                                </div>
                                <span className="score-value">
                                  {tool.usefulness}%
                                </span>
                              </div>
                              <div className="score-item">
                                <Star size={14} />
                                <span>Relevance</span>
                                <div className="score-bar">
                                  <div
                                    className="score-bar__fill"
                                    style={{ width: `${tool.relevance}%` }}
                                  />
                                </div>
                                <span className="score-value">
                                  {tool.relevance}%
                                </span>
                              </div>
                              <div className="score-item">
                                <Star size={14} />
                                <span>Reliability</span>
                                <div className="score-bar">
                                  <div
                                    className="score-bar__fill"
                                    style={{ width: `${tool.reliability}%` }}
                                  />
                                </div>
                                <span className="score-value">
                                  {tool.reliability}%
                                </span>
                              </div>
                            </div>

                            <div className="tool-card__details">
                              <div className="tool-detail">
                                <AlertTriangle size={14} />
                                <span>
                                  <strong>Trade-off:</strong> {tool.tradeoff}
                                </span>
                              </div>
                              <div className="tool-detail">
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

                  {msg.role === "user" && (
                    <div className="chat-message__avatar chat-message__avatar--user">
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
                className="chat-loading"
              >
                <div className="chat-message__avatar">
                  <Sparkles size={16} />
                </div>
                <div className="chat-loading__dots">
                  <Loader2 size={18} className="spinning" />
                  <span>Analyzing your request...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Tell me what you need..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatPhase === "searching"}
              autoFocus
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || chatPhase === "searching"}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="chat-input-hint">
            Discover.io recommends tools from our verified database only.
          </p>
        </form>
      </div>
    </main>
  );
}
