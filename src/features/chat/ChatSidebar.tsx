import {
  Plus,
  Search,
  MessageSquare,
  Settings,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  Crown,
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
  return (
    <>
      <aside className={`chat-sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <span className="sidebar__logo-mark">D</span>
            {isOpen && (
              <span className="sidebar__logo-text">
                Discover<span>.io</span>
              </span>
            )}
          </div>
          <button
            className="sidebar__toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {isOpen && (
          <div className="sidebar__content">
            {/* New Search */}
            <button className="sidebar__new-chat" onClick={onNewChat}>
              <Plus size={18} />
              <span>New Search</span>
            </button>

            {/* Search previous chats */}
            <div className="sidebar__search">
              <Search size={16} />
              <input type="text" placeholder="Search conversations..." />
            </div>

            {/* Chat history */}
            <div className="sidebar__section">
              <span className="sidebar__section-label">Recent</span>
              <ul className="sidebar__chat-list">
                {chatHistory.map((chat) => (
                  <li key={chat.id} className="sidebar__chat-item">
                    <MessageSquare size={16} />
                    <div className="sidebar__chat-info">
                      <span className="sidebar__chat-title">{chat.title}</span>
                      <span className="sidebar__chat-date">{chat.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom section */}
            <div className="sidebar__bottom">
              <button className="sidebar__menu-item">
                <BookOpen size={18} />
                <span>Tools Catalogue</span>
              </button>
              <button className="sidebar__menu-item">
                <Settings size={18} />
                <span>Settings</span>
              </button>

              {/* Profile & Plan */}
              <div className="sidebar__profile">
                <div className="sidebar__profile-avatar">
                  <User size={18} />
                </div>
                <div className="sidebar__profile-info">
                  <span className="sidebar__profile-name">User</span>
                  <span className="sidebar__plan-badge">
                    <Crown size={12} /> Free
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Collapsed toggle button */}
      {!isOpen && (
        <button
          className="sidebar__toggle-floating"
          onClick={onToggle}
          aria-label="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </>
  );
}
