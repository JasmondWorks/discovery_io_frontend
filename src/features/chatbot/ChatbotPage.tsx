import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Bookmark,
  Zap,
  Plus,
  MessageSquare,
} from "lucide-react";
import { LoadingSpinner } from "../../components/ui";
import { Navbar } from "../../components/layout/Navbar";
import toast from "react-hot-toast";
import "./ChatbotPage.css";
import { useCurrentUser } from "../users/hooks/useUsers";
import { useAnalyzeRequest, useConfirmAndRecommend } from "./hooks/useChatbot";

import type {
  ChatMessage as ApiChatMessage,
  ExpertAdvice,
  ChatIntent,
} from "../../api/types";

import {
  useCreateBookmark,
  useDeleteBookmark,
  useBookmarks,
} from "../bookmarks/hooks/useBookmarks";

// UI-specific extension of the base ChatMessage
interface ChatMessage extends Partial<ApiChatMessage> {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | ExpertAdvice;
  time?: string;
  type?: "text" | "diagnosis" | "results";
  diagnosis?: ChatIntent;
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatPhase, setChatPhase] = useState<
    "idle" | "searching" | "diagnosis" | "results"
  >("idle");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifyText, setClarifyText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: currentUser } = useCurrentUser();

  const { analyze: analyzeApi, isPending: isAnalyzing } = useAnalyzeRequest();
  const { recommend, isPending: isRecommending } = useConfirmAndRecommend();

  const isPending = isAnalyzing || isRecommending;

  const loadingMessage = isAnalyzing
    ? "Analyzing your request..."
    : "Generating your personalized recommendations...";

  const { data: bookmarksData } = useBookmarks();
  const { mutate: createBookmarkMutation } = useCreateBookmark();
  const { mutate: deleteBookmarkMutation } = useDeleteBookmark();

  const isBookmarked = (name: string) =>
    bookmarksData?.data?.some((b) => b.tool_name === name) || false;

  const toggleBookmark = (tool: any) => {
    const existing = bookmarksData?.data?.find(
      (b) => b.tool_name === tool.name,
    );

    if (existing) {
      deleteBookmarkMutation(existing.id);
    } else {
      // Check if tool.id is a real MongoDB ID or just an index
      const isRealId = tool.id && tool.id.length > 10;

      if (isRealId) {
        createBookmarkMutation(tool.id);
      } else {
        createBookmarkMutation({
          tool_name: tool.name,
          tool_description: tool.description,
          tool_url: tool.url || "#",
          tool_id: isRealId ? tool.id : undefined,
        });
      }
    }
  };

  // Close mobile menu on route change is now handled in Navbar

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

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          'Hi! I\'m your AI discovery assistant. Tell me about a task or workflow, and I\'ll recommend the best AI tools for you. For example, try "I need help writing blog posts" or "What tools can help me edit videos?"',
        time: getCurrentTime(),
        type: "text",
      },
    ]);
    setCurrentChatId(null);
    setChatPhase("idle");
    setIsClarifying(false);
    setClarifyText("");
  };

  const handleClarify = () => {
    setIsClarifying(true);
  };

  const handleSubmitClarification = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = clarifyText.trim();
    if (!text) return;
    setClarifyText("");
    setIsClarifying(false);
    handleSend(text);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isPending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      time: getCurrentTime(),
      type: "text" as const,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatPhase("searching");

    try {
      // 1. Step 1: Initial analysis/clarification
      const sessionResponse = await analyzeApi({
        input: messageText,
        userContext: currentUser?.professionalProfile,
      });

      if (sessionResponse) {
        if (!currentChatId && sessionResponse.id) {
          setCurrentChatId(sessionResponse.id);
        }

        const rawIntent = sessionResponse.extracted_intent;
        const extractedIntent: ChatIntent = {
          user_persona:
            rawIntent?.user_persona ||
            (rawIntent as any)?.uspr_persona ||
            "User",
          core_task:
            rawIntent?.core_task ||
            (rawIntent as any)?.task ||
            messageText ||
            "Task",
          success_criteria:
            rawIntent?.success_criteria ||
            (rawIntent as any)?.criteria ||
            "Successful implementation",
          is_clarification_needed: rawIntent?.is_clarification_needed ?? false,
        };

        const diagMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I've analyzed your request. Here's what I understand:",
          time: getCurrentTime(),
          type: "diagnosis" as const,
          diagnosis: extractedIntent,
        };
        setMessages((prev) => [...prev, diagMsg]);
        setChatPhase("diagnosis");
      }
    } catch (err: any) {
      console.error("API Error during analysis:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to analyze request. Please try again.",
      );
      setChatPhase("idle");
    }
  };

  const handleConfirmDiagnosis = async () => {
    const confirmMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: "Yes, that's correct. Please find tools for me.",
      time: getCurrentTime(),
      type: "text" as const,
    };
    setMessages((prev) => [...prev, confirmMsg]);
    setChatPhase("searching");

    try {
      if (!currentChatId) throw new Error("No chat session found.");

      const response = await recommend({
        chatId: currentChatId,
        confirmation: confirmMsg.content as string,
      });

      if (response?.aiMessage) {
        const assistantMsg = response.aiMessage;
        const resultsMsg: ChatMessage = {
          ...assistantMsg,
          id: assistantMsg.id || Date.now().toString(),
          role: "assistant",
          content: assistantMsg.content,
          time: getCurrentTime(),
          type: "results" as const,
        };

        setMessages((prev) => [...prev, resultsMsg]);
        setChatPhase("results");
      }
    } catch (err: any) {
      console.error("API Error during recommendation:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to get recommendations. Please try again.",
      );
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while finding the best tools. Please try again or refine your request.",
        time: getCurrentTime(),
        type: "text" as const,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setChatPhase("results");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="chat-page">
      {/* ─── Top Navbar ─────────────────────────── */}
      <Navbar />

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
                  {typeof msg.content === "string" ? (
                    <div className="chat-markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      >
                        {msg.content.trim() === "undefined"
                          ? "I'm ready to find the best tools for you. Please let me know if you'd like to proceed or clarify anything!"
                          : msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="chat-markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      >
                        {msg.content.message || ""}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Diagnosis Card */}
                  {msg.type === "diagnosis" && msg.diagnosis && (
                    <div className="chat-diagnosis-card">
                      <div className="chat-diagnosis-card__header">
                        <Sparkles size={16} />
                        <span>Understanding Confirmed</span>
                      </div>
                      <div className="chat-diagnosis-card__body">
                        <div className="chat-diagnosis-tag">
                          <strong>Persona:</strong> {msg.diagnosis.user_persona}
                        </div>
                        <div className="chat-diagnosis-tag">
                          <strong>Core Task:</strong> {msg.diagnosis.core_task}
                        </div>
                        <div className="chat-diagnosis-tag">
                          <strong>Success Criteria:</strong>{" "}
                          {msg.diagnosis.success_criteria}
                        </div>
                      </div>
                      {chatPhase === "diagnosis" && (
                        <div className="chat-diagnosis-card__actions">
                          {isClarifying ? (
                            <form
                              className="chat-clarify-form"
                              onSubmit={handleSubmitClarification}
                            >
                              <input
                                className="chat-clarify-input"
                                type="text"
                                placeholder='e.g. "I actually need NoSQL, not SQL"'
                                value={clarifyText}
                                onChange={(e) => setClarifyText(e.target.value)}
                                autoFocus
                              />
                              <div className="chat-clarify-actions">
                                <button
                                  type="submit"
                                  className="chat-diag-btn chat-diag-btn--confirm"
                                  disabled={!clarifyText.trim()}
                                >
                                  <Send size={14} /> Re-analyze
                                </button>
                                <button
                                  type="button"
                                  className="chat-diag-btn chat-diag-btn--edit"
                                  onClick={() => setIsClarifying(false)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <button
                                className="chat-diag-btn chat-diag-btn--confirm"
                                onClick={handleConfirmDiagnosis}
                              >
                                <Check size={16} /> That's correct
                              </button>
                              <button
                                className="chat-diag-btn chat-diag-btn--edit"
                                onClick={handleClarify}
                              >
                                <Edit3 size={16} /> Let me clarify
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Results Cards */}
                  {msg.type === "results" && (
                    <div className="chat-results-container">
                      {/* Tools Section */}
                      {typeof msg.content !== "string" &&
                        msg.content.recommended_tools && (
                          <div className="chat-results-list">
                            {msg.content.recommended_tools.map((t, idx) => {
                              const tool = {
                                id: (idx + 1).toString(),
                                name: t.name,
                                rank: idx + 1,
                                description: t.rationale,
                                usefulness: t.usefulness_score,
                                relevance: t.relevance_score,
                                reliability: t.reliability_score,
                                tradeoff:
                                  (msg.content as ExpertAdvice)
                                    .tradeoff_analysis ?? "",
                                guidance: t.comparison_vs_alternatives,
                                url: "#",
                              };
                              return (
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
                                    <div className="chat-tool-card__actions">
                                      <button
                                        className={`chat-tool-card__bookmark ${
                                          isBookmarked(tool.name)
                                            ? "active"
                                            : ""
                                        }`}
                                        onClick={() => toggleBookmark(tool)}
                                      >
                                        <Bookmark
                                          size={16}
                                          fill={
                                            isBookmarked(tool.name)
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      </button>
                                      <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="chat-tool-card__link"
                                      >
                                        <ExternalLink size={16} />
                                      </a>
                                    </div>
                                  </div>

                                  <div className="chat-tool-card__scores">
                                    <div className="chat-score-item">
                                      <Star size={14} />
                                      <span>Usefulness</span>
                                      <div className="chat-score-bar">
                                        <div
                                          className="chat-score-bar__fill"
                                          style={{
                                            width: `${tool.usefulness}%`,
                                          }}
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
                                          style={{
                                            width: `${tool.relevance}%`,
                                          }}
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
                                          style={{
                                            width: `${tool.reliability}%`,
                                          }}
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
                                        <strong>Trade-off:</strong>{" "}
                                        {tool.tradeoff}
                                      </span>
                                    </div>
                                    <div className="chat-tool-detail">
                                      <Lightbulb size={14} />
                                      <span>
                                        <strong>How to use:</strong>{" "}
                                        {tool.guidance}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      {/* Workflows Section */}
                      {typeof msg.content !== "string" &&
                        msg.content.recommended_workflows &&
                        msg.content.recommended_workflows.length > 0 && (
                          <div className="chat-workflows-list">
                            <h4 className="chat-section-title">
                              Recommended Workflows
                            </h4>
                            {msg.content.recommended_workflows.map(
                              (wf, idx) => (
                                <div key={idx} className="chat-workflow-card">
                                  <h5>{wf.title}</h5>
                                  <ol className="chat-workflow-steps">
                                    {wf.steps.map((step, sIdx) => (
                                      <li key={sIdx}>{step}</li>
                                    ))}
                                  </ol>
                                  <div className="chat-workflow-advantage">
                                    <Zap size={14} />
                                    <span>
                                      {wf.advantages_of_this_workflow}
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}

                      {/* Solutions Section */}
                      {typeof msg.content !== "string" &&
                        msg.content.recommended_solutions &&
                        msg.content.recommended_solutions.length > 0 && (
                          <div className="chat-solutions-list">
                            <h4 className="chat-section-title">
                              Recommended Solutions
                            </h4>
                            {msg.content.recommended_solutions.map(
                              (sol, idx) => (
                                <div key={idx} className="chat-solution-card">
                                  <h5>{sol.issue_title}</h5>
                                  <p className="chat-solution-cause">
                                    <strong>Cause:</strong>{" "}
                                    {sol.cause_explanation}
                                  </p>
                                  <ul className="chat-solution-steps">
                                    {sol.resolution_steps.map((step, sIdx) => (
                                      <li key={sIdx}>{step}</li>
                                    ))}
                                  </ul>
                                  <div className="chat-solution-benefit">
                                    <Check size={14} />
                                    <span>{sol.why_this_fix_is_optimal}</span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isPending && (
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
                <LoadingSpinner message={loadingMessage} />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Input Bar ────────────────────────── */}
        <div className="chat-input-area">
          {chatPhase === "results" && (
            <div className="chat-results-actions">
              <p className="chat-results-hint">
                <MessageSquare size={13} />
                Got the tools you need? Start a new search or refine your
                request below.
              </p>
              <button className="chat-new-search-btn" onClick={handleNewChat}>
                <Plus size={15} /> New Search
              </button>
            </div>
          )}
          <form className="chat-input-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-input-bar__input"
              placeholder={
                chatPhase === "results"
                  ? "Refine your search or ask a follow-up..."
                  : "Tell me what you need..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isPending}
              autoFocus
            />
            <button
              type="submit"
              className="chat-input-bar__send"
              disabled={!input.trim() || isPending}
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
