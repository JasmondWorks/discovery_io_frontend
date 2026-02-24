import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  Home,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import "./ChatSidebar.css";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  date: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chatHistory: ChatSession[];
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onNewChat,
  chatHistory,
}: ChatSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`chat-sidebar ${isOpen ? "" : "chat-sidebar--collapsed"}`}
    >
      {/* Toggle */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
      </button>

      {isOpen && (
        <>
          {/* Logo */}
          <div className="sidebar-logo">
            <span className="sidebar-logo__icon">✦</span>
            <span className="sidebar-logo__text">Discover.io</span>
          </div>

          {/* New Chat */}
          <button className="sidebar-new-chat" onClick={onNewChat}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <Link
              to="/"
              className={`sidebar-nav__link ${location.pathname === "/" ? "active" : ""}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link
              to="/chat"
              className={`sidebar-nav__link ${location.pathname === "/chat" ? "active" : ""}`}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </Link>
            <Link
              to="/onboarding"
              className={`sidebar-nav__link ${location.pathname === "/onboarding" ? "active" : ""}`}
            >
              <Settings size={18} />
              <span>Onboarding</span>
            </Link>
          </nav>

          {/* Chat History */}
          <div className="sidebar-history">
            <div className="sidebar-history__header">
              <Clock size={14} />
              <span>Recent Chats</span>
            </div>
            <div className="sidebar-history__list">
              {chatHistory.map((session) => (
                <button key={session.id} className="sidebar-history__item">
                  <Search size={14} />
                  <div className="history-item__content">
                    <span className="history-item__title">{session.title}</span>
                    <span className="history-item__date">{session.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="sidebar-user">
            <div className="sidebar-user__avatar">U</div>
            <div className="sidebar-user__info">
              <span className="sidebar-user__name">User</span>
              <span className="sidebar-user__email">user@example.com</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
