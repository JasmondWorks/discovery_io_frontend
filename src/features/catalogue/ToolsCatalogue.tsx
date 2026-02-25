import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Users,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  SlidersHorizontal,
} from "lucide-react";
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

export function ToolsCatalogue() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="catalogue">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="catalogue-nav">
        <div className="catalogue-nav__inner">
          <Link to="/" className="catalogue-nav__logo">
            <span className="catalogue-logo-icon">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="11" height="11" rx="3" fill="#1a1d2e" />
                <rect x="15" width="11" height="11" rx="3" fill="#1a1d2e" />
                <rect y="15" width="11" height="11" rx="3" fill="#1a1d2e" />
                <circle cx="20.5" cy="20.5" r="4" fill="#2ec4b6" />
              </svg>
            </span>
            <span className="catalogue-logo-text">Discover.io</span>
          </Link>

          <nav
            className={`catalogue-nav__links ${menuOpen ? "open" : ""}`}
          >
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <a href="/#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <Link
              to="/catalogue"
              className="active"
              onClick={() => setMenuOpen(false)}
            >
              Tools
            </Link>
            <a href="/#how-it-works" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="/#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
          </nav>

          <div className="catalogue-nav__actions">
            {/* User is authenticated, so no login/signup buttons here */}
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

      {/* ─── Main Content ──────────────────────────────────── */}
      <main className="catalogue-main">
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
          <h2>Tools</h2>
          <span className="catalogue-count">
            {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}{" "}
            found
          </span>
        </div>

        {/* Tools Grid */}
        <div className="catalogue-grid">
          {filteredTools.map((tool, i) => (
            <motion.a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tool-catalogue-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              {/* Colored Icon Area */}
              <div
                className="tool-catalogue-card__icon-area"
                style={{ backgroundColor: tool.bgColor }}
              >
                <span className="tool-catalogue-card__emoji">{tool.emoji}</span>
              </div>

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
                  <span className="tool-catalogue-card__link-icon">
                    <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="catalogue-empty">
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
          </div>
        )}
      </main>
    </div>
  );
}
