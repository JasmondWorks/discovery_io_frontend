import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Users,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  SlidersHorizontal,
  Bookmark,
  LayoutGrid,
  Home,
  User,
} from "lucide-react";
import { Logo } from "../../components/common/Logo";
import "./ToolsCatalogue.css";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  users: string;
  url: string;
  emoji: string;
  bgColor: string;
}

const TOOLS: Tool[] = [
  {
    id: "1",
    name: "Copy.ai",
    description:
      "Advanced AI copywriting tool with templates for every marketing use case.",
    category: "Writing",
    rating: 4.8,
    users: "12.5K",
    url: "https://copy.ai",
    emoji: "✍️",
    bgColor: "#FFF3CD",
  },
  {
    id: "2",
    name: "Jasper",
    description:
      "Enterprise-grade content platform to keep teams on brand across channels.",
    category: "Writing",
    rating: 4.7,
    users: "9.8K",
    url: "https://jasper.ai",
    emoji: "📝",
    bgColor: "#FFE6E6",
  },
  {
    id: "3",
    name: "GitHub Copilot",
    description:
      "AI pair programmer that suggests code completions in real time inside your editor.",
    category: "Code",
    rating: 4.9,
    users: "25K",
    url: "https://github.com/features/copilot",
    emoji: "💻",
    bgColor: "#D4EDDA",
  },
  {
    id: "4",
    name: "Cursor",
    description:
      "AI-first code editor that helps you write, edit, and understand code faster.",
    category: "Code",
    rating: 4.8,
    users: "18K",
    url: "https://cursor.sh",
    emoji: "⌨️",
    bgColor: "#CCE5FF",
  },
  {
    id: "5",
    name: "Midjourney",
    description:
      "Generate stunning AI artwork and images from text descriptions with incredible detail.",
    category: "Design",
    rating: 4.9,
    users: "30K",
    url: "https://midjourney.com",
    emoji: "🎨",
    bgColor: "#F3E5F5",
  },
  {
    id: "6",
    name: "Figma AI",
    description:
      "Design tools enhanced with AI to speed up prototyping and component creation.",
    category: "Design",
    rating: 4.6,
    users: "22K",
    url: "https://figma.com",
    emoji: "🖌️",
    bgColor: "#FFE0E6",
  },
  {
    id: "7",
    name: "Descript",
    description:
      "Edit audio and video as easily as editing a text document with AI transcription.",
    category: "Audio",
    rating: 4.7,
    users: "8.2K",
    url: "https://descript.com",
    emoji: "🎙️",
    bgColor: "#E8D5F5",
  },
  {
    id: "8",
    name: "Tableau AI",
    description:
      "AI-powered analytics that turns your data into actionable insights automatically.",
    category: "Data",
    rating: 4.5,
    users: "15K",
    url: "https://tableau.com",
    emoji: "📊",
    bgColor: "#D6EAF8",
  },
  {
    id: "9",
    name: "Runway",
    description:
      "Generate and edit video with AI — text-to-video, green screen removal, and more.",
    category: "Video",
    rating: 4.8,
    users: "11K",
    url: "https://runwayml.com",
    emoji: "🎬",
    bgColor: "#FDEBD0",
  },
  {
    id: "10",
    name: "HubSpot AI",
    description:
      "AI-powered marketing automation including content generation and SEO optimization.",
    category: "Marketing",
    rating: 4.6,
    users: "20K",
    url: "https://hubspot.com",
    emoji: "📣",
    bgColor: "#D5F5E3",
  },
  {
    id: "11",
    name: "Notion AI",
    description:
      "Built-in AI assistant for notes, docs, and project management inside Notion.",
    category: "Productivity",
    rating: 4.7,
    users: "28K",
    url: "https://notion.so",
    emoji: "⚙️",
    bgColor: "#FFF9C4",
  },
  {
    id: "12",
    name: "Writesonic",
    description:
      "SEO-optimized content generator excelling at long-form articles and ad copies.",
    category: "Writing",
    rating: 4.5,
    users: "7.3K",
    url: "https://writesonic.com",
    emoji: "📄",
    bgColor: "#FCE4EC",
  },
];

const CATEGORIES = [
  "All",
  "Writing",
  "Code",
  "Design",
  "Audio",
  "Video",
  "Data",
  "Marketing",
  "Productivity",
];

const STORAGE_KEY = "discoverio_saved_tools";

function getSavedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setSavedIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function ToolsCatalogue() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeView, setActiveView] = useState<"all" | "saved">("all");
  const [savedToolIds, setSavedToolIds] = useState<string[]>(getSavedIds);

  // Persist saved tools to localStorage
  useEffect(() => {
    setSavedIds(savedToolIds);
  }, [savedToolIds]);

  const toggleSaved = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault(); // prevent card link navigation
    e.stopPropagation();
    setSavedToolIds((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const isSaved = (toolId: string) => savedToolIds.includes(toolId);

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;
    const matchesView =
      activeView === "all" || savedToolIds.includes(tool.id);
    return matchesSearch && matchesCategory && matchesView;
  });

  const savedCount = savedToolIds.length;

  return (
    <div className="catalogue">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="catalogue-nav">
        <div className="catalogue-nav__inner">
          <Logo className="catalogue-nav__logo" size={20} />

          {/* Desktop nav */}
          <nav className="catalogue-nav__links">
            <Link to="/chat">Discover</Link>
            <Link to="/catalogue" className="active">Catalog</Link>
            <Link to="/profile">Profile</Link>
          </nav>

          <div className="catalogue-nav__actions">
            {/* empty for authenticated user */}
          </div>

          <button
            className="catalogue-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ─── Mobile Menu Overlay ────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="catalogue-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="catalogue-mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="catalogue-mobile-menu__header">
                <span className="catalogue-mobile-menu__title">Menu</span>
                <button
                  className="catalogue-mobile-menu__close"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="catalogue-mobile-menu__nav">
                <Link
                  to="/"
                  className="catalogue-mobile-menu__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/chat"
                  className="catalogue-mobile-menu__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <Search size={18} />
                  <span>Discover</span>
                </Link>
                <Link
                  to="/catalogue"
                  className="catalogue-mobile-menu__link active"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutGrid size={18} />
                  <span>Catalog</span>
                </Link>
                <Link
                  to="/profile"
                  className="catalogue-mobile-menu__link"
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </Link>
              </nav>

              <div className="catalogue-mobile-menu__footer">
                <p className="catalogue-mobile-menu__hint">
                  Browse and discover the best AI tools
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ──────────────────────────────────── */}
      <main className="catalogue-main">
        {/* View Tabs: All Tools / Saved */}
        <div className="catalogue-view-tabs">
          <button
            className={`catalogue-view-tab ${activeView === "all" ? "active" : ""}`}
            onClick={() => setActiveView("all")}
          >
            All Tools
          </button>
          <button
            className={`catalogue-view-tab ${activeView === "saved" ? "active" : ""}`}
            onClick={() => setActiveView("saved")}
          >
            <Bookmark size={15} />
            Saved
            {savedCount > 0 && (
              <span className="catalogue-view-tab__badge">{savedCount}</span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="catalogue-search-wrapper">
          <div className="catalogue-search">
            <Search size={18} className="catalogue-search__icon" />
            <input
              type="text"
              placeholder="Search for tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalogue-search__input"
            />
            <button className="catalogue-search__btn">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="catalogue-filters">
          <div className="catalogue-filters__categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`catalogue-filter-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="catalogue-filters__sort">
            <SlidersHorizontal size={14} />
            Sort by
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Section Title */}
        <div className="catalogue-section-title">
          <h2>{activeView === "saved" ? "Saved Tools" : "Tools"}</h2>
          <span className="catalogue-count">
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}{" "}
            found
          </span>
        </div>

        {/* Tools Grid */}
        <div className="catalogue-grid">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                className="tool-catalogue-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                layout
              >
                {/* Bookmark Button */}
                <button
                  className={`tool-catalogue-card__bookmark ${isSaved(tool.id) ? "saved" : ""}`}
                  onClick={(e) => toggleSaved(e, tool.id)}
                  title={isSaved(tool.id) ? "Remove from saved" : "Save tool"}
                  aria-label={isSaved(tool.id) ? "Remove from saved" : "Save tool"}
                >
                  <Bookmark size={16} />
                </button>

                {/* Colored Icon Area */}
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tool-catalogue-card__icon-area"
                  style={{ backgroundColor: tool.bgColor }}
                >
                  <span className="tool-catalogue-card__emoji">{tool.emoji}</span>
                </a>

                {/* Card Content */}
                <div className="tool-catalogue-card__body">
                  <div className="tool-catalogue-card__category-tag">
                    {tool.category}
                  </div>
                  <h3 className="tool-catalogue-card__name">{tool.name}</h3>
                  <p className="tool-catalogue-card__desc">{tool.description}</p>
                  <div className="tool-catalogue-card__footer">
                    <div className="tool-catalogue-card__meta">
                      <span className="tool-catalogue-card__rating">
                        <Star size={13} />
                        {tool.rating}
                      </span>
                      <span className="tool-catalogue-card__users">
                        <Users size={13} />
                        {tool.users}
                      </span>
                    </div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tool-catalogue-card__link-icon"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="catalogue-empty">
            {activeView === "saved" ? (
              <>
                <div className="catalogue-empty__icon">
                  <Bookmark size={32} />
                </div>
                <p>No saved tools yet.</p>
                <p className="catalogue-empty__sub">
                  Click the bookmark icon on any tool to save it here.
                </p>
                <button
                  className="catalogue-empty__reset"
                  onClick={() => setActiveView("all")}
                >
                  Browse All Tools
                </button>
              </>
            ) : (
              <>
                <p>No tools found matching your criteria.</p>
                <button
                  className="catalogue-empty__reset"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
