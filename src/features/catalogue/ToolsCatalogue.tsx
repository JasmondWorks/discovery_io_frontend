import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bookmark,
  ExternalLink,
  Star,
  Users,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  LayoutGrid,
  User,
  LogOut,
} from "lucide-react";
import { Logo } from "../../components/common/Logo";
import { Button, LoadingSpinner, Pagination } from "../../components/ui";
import { useTools, usePersonalizedTools } from "./hooks/useCatalogue";
import {
  useBookmarks,
  useCreateBookmark,
  useDeleteBookmark,
} from "../bookmarks/hooks/useBookmarks";
import { useAuth } from "../../context/AuthContext";
import type { Tool } from "../../api/types";
import "./ToolsCatalogue.css";

const CATEGORIES = [
  "All",
  "AI Code Generation",
  "AI Marketing",
  "AI Data & Analytics",
  "AI Chatbots",
  "AI Writing",
  "AI Music",
  "AI Image Generation",
  "AI Video Generation",
  "AI productivity",
];

export default function ToolsCatalogue() {
  const { user, clearAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const activeView =
    searchParams.get("view") || (user?.onboardingCompleted ? "for-me" : "all");

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const setActiveView = (view: string) => {
    setSearchParams({ view, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ view: activeView, page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Data Fetching ──────────────────────────────────────────────────

  const {
    data: toolsData,
    isLoading: toolsLoading,
    refetch: refetchTools,
  } = useTools({
    page: currentPage,
    limit: itemsPerPage,
    search: activeView === "all" ? searchQuery : undefined,
    category:
      activeView === "all" && activeCategory !== "All"
        ? activeCategory
        : undefined,
  });

  const { data: personalizedData, isLoading: personalizedLoading } =
    usePersonalizedTools();
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks();
  const { mutate: createBookmark } = useCreateBookmark();
  const { mutate: deleteBookmark } = useDeleteBookmark();

  // Robust helper to extract array from various backend wrappers
  const extractArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (data.tools && Array.isArray(data.tools)) return data.tools;
    if (data.tools?.data && Array.isArray(data.tools.data))
      return data.tools.data;
    return [];
  };

  const apiTools = extractArray(toolsData).map((t: any) => ({
    ...t,
    id: t.id || t._id, // Normalize ID
  })) as Tool[];

  const paginationMeta = useMemo(() => {
    if (!toolsData) return null;
    const d = toolsData as any;
    if (d.totalPages !== undefined) return d;
    if (d.data?.totalPages !== undefined) return d.data;
    if (d.tools?.totalPages !== undefined) return d.tools;
    return null;
  }, [toolsData]);

  const bookmarks = extractArray(bookmarksData);

  const sanitizeTools = (list: any[]) => {
    return list
      .filter((t) => t && typeof t === "object")
      .map((t) => {
        const inner = t.tool || t;
        const toolId = inner.id || inner._id || t.tool_id || t.id || t._id;
        return {
          ...inner,
          id: toolId,
          name: inner.name || inner.tool_name || t.tool_name || t.name || "",
          description:
            inner.description ||
            inner.tool_description ||
            t.tool_description ||
            t.description ||
            "",
          url: inner.url || inner.tool_url || t.tool_url || t.url || "#",
          category: inner.category || t.category || "Featured Tools",
          emoji: inner.emoji || t.emoji || "🛠️",
          bgColor: inner.bgColor || t.bgColor || "#f3f4f6",
        };
      })
      .filter(
        (t) =>
          t.id &&
          t.name &&
          !t.name.includes("{{{") &&
          !t.name.includes("undefined"),
      ) as Tool[];
  };

  const toolsToDisplay = useMemo(() => {
    if (activeView === "all") return sanitizeTools(apiTools);
    if (activeView === "saved") return sanitizeTools(bookmarks);
    if (activeView === "for-me" && personalizedData) {
      const catalog =
        (personalizedData as any).catalog ||
        (personalizedData as any).data?.catalog ||
        {};
      return sanitizeTools(Object.values(catalog).flat());
    }
    return [];
  }, [activeView, apiTools, bookmarks, personalizedData]);

  const isSaved = (toolId: string) => {
    return bookmarks.some((b: any) => (b.tool_id || b.id || b._id) === toolId);
  };

  const handleViewAll = (category: string) => {
    setActiveCategory(category);
    setActiveView("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync searchQuery with debounce for API or just for UI
  useEffect(() => {
    if (activeView === "all") {
      const timer = setTimeout(() => {
        refetchTools();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeView, refetchTools]);

  const filteredTools = useMemo(() => {
    // If it's 'all' view, the backend already handled search + pagination
    if (activeView === "all") return toolsToDisplay;

    // Local filtering for saved/recommended
    const result = toolsToDisplay.filter((tool) => {
      const matchesCategory =
        activeCategory === "All" || tool.category === activeCategory;
      const matchesSearch =
        (tool.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Apply sorting
    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? (a.name || "").localeCompare(b.name || "")
          : (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "rating") {
        const rA = (a as any).rating || 0;
        const rB = (b as any).rating || 0;
        return sortOrder === "desc" ? rB - rA : rA - rB;
      }
      return 0;
    });
  }, [
    toolsToDisplay,
    activeCategory,
    searchQuery,
    sortBy,
    sortOrder,
    activeView,
  ]);

  const availableCategories = useMemo(() => {
    const matchingSearch = toolsToDisplay.filter(
      (tool) =>
        (tool.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
    const cats = new Set(matchingSearch.map((t) => t.category));
    return CATEGORIES.filter((cat) => cat === "All" || cats.has(cat));
  }, [toolsToDisplay, searchQuery]);

  useEffect(() => {
    if (
      activeCategory !== "All" &&
      !availableCategories.includes(activeCategory)
    ) {
      setActiveCategory("All");
    }
  }, [availableCategories, activeCategory]);

  const totalToolsCount = useMemo(() => {
    if (activeView === "all" && paginationMeta) {
      return (
        paginationMeta.total ||
        paginationMeta.totalTools ||
        filteredTools.length
      );
    }
    return filteredTools.length;
  }, [activeView, paginationMeta, filteredTools.length]);

  const savedCount = bookmarks.length;

  const groupedFilteredTools = useMemo(() => {
    if (activeView !== "for-me") return null;
    const groups: Record<string, Tool[]> = {};
    filteredTools.forEach((tool) => {
      const category = tool.category || "Featured Tools";
      if (!groups[category]) groups[category] = [];
      groups[category].push(tool);
    });
    return groups;
  }, [filteredTools, activeView]);

  const toggleSaved = (e: React.MouseEvent, tool: Tool) => {
    e.preventDefault();
    e.stopPropagation();

    const toolId = tool.id || (tool as any)._id;

    if (isSaved(toolId)) {
      deleteBookmark(toolId);
    } else {
      if (toolId) {
        createBookmark(toolId); // Pass string ID for standard catalog tools
      } else {
        createBookmark({
          tool_name: tool.name,
          tool_description: tool.description,
          tool_url: tool.url,
          tool_id: undefined,
        });
      }
    }
  };

  const getItemLink = (item: any) => {
    if (item.category === "Workflow") return `/workflow/${item.id}`;
    if (item.category === "Solution") return `/solution/${item.id}`;
    return `/tool/${item.id}`;
  };

  return (
    <div className="catalogue">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className="catalogue-nav">
        <div className="catalogue-nav__inner">
          <Logo className="catalogue-nav__logo" size={20} />
          <nav className="catalogue-nav__links">
            <Link to="/chat">Discover</Link>
            <Link to="/catalogue" className="active">
              Catalog
            </Link>
            <Link to="/profile">Profile</Link>
          </nav>
          <div className="catalogue-nav__actions"></div>
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
                <button
                  className="catalogue-mobile-menu__link logout"
                  onClick={() => {
                    clearAuth();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="catalogue-main">
        {/* View Tabs */}
        <div className="catalogue-view-tabs">
          <button
            className={`catalogue-view-tab ${activeView === "for-me" ? "active" : ""}`}
            onClick={() => setActiveView("for-me")}
          >
            Recommended for You
          </button>
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

        {activeView === "for-me" && !user?.onboardingCompleted && (
          <div className="onboarding-cta-banner">
            <div className="onboarding-cta-content">
              <h3>Unlock Personalized Results</h3>
              <p>
                Complete our 2-minute onboarding to get tools matched to your
                role and industry.
              </p>
            </div>
            <Link to="/onboarding">
              <Button variant="primary">Start Onboarding</Button>
            </Link>
          </div>
        )}

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

        {/* Filters */}
        <div className="catalogue-filters">
          <div className="catalogue-filters__categories">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                className={`catalogue-filter-chip ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="catalogue-filters__sort-wrapper" ref={sortRef}>
            <button
              className="catalogue-filters__sort"
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <SlidersHorizontal size={14} />
              Sort: {sortBy === "name" ? "Name" : "Rating"}
              <ChevronDown size={14} />
            </button>
            {isSortOpen && (
              <div className="catalogue-sort-dropdown">
                <button
                  onClick={() => {
                    setSortBy("name");
                    setSortOrder("asc");
                    setIsSortOpen(false);
                  }}
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => {
                    setSortBy("name");
                    setSortOrder("desc");
                    setIsSortOpen(false);
                  }}
                >
                  Name (Z-A)
                </button>
                <button
                  onClick={() => {
                    setSortBy("rating");
                    setSortOrder("desc");
                    setIsSortOpen(false);
                  }}
                >
                  High Rating
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="catalogue-page-header">
          <h1>
            {activeView === "saved"
              ? "Saved Tools"
              : activeView === "for-me"
                ? "Recommended for You"
                : "All Tools"}
          </h1>
          <span className="catalogue-count">
            {totalToolsCount} tool{totalToolsCount !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Tools Grid Area */}
        <div className="catalogue-grid-area">
          {toolsLoading || personalizedLoading || bookmarksLoading ? (
            <LoadingSpinner message="Loading tools..." />
          ) : filteredTools.length === 0 ? (
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
          ) : activeView === "for-me" && groupedFilteredTools ? (
            <div className="catalogue-grouped-sections">
              {Object.entries(groupedFilteredTools).map(
                ([category, categoryTools]) => (
                  <div key={category} className="catalogue-section">
                    <div className="catalogue-section-title">
                      <h2>{category}</h2>
                      <div className="catalogue-section-title-right">
                        <span className="catalogue-section-count">
                          {categoryTools.length} tools
                        </span>
                        <button
                          className="catalogue-view-all-link"
                          onClick={() => handleViewAll(category)}
                        >
                          View All <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="catalogue-grid-horizontal">
                      <AnimatePresence mode="popLayout">
                        {categoryTools.map((tool, i) => (
                          <motion.div
                            key={tool.id || `reco-${i}`}
                            className="tool-catalogue-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35, delay: i * 0.04 }}
                            layout
                          >
                            <button
                              className={`tool-catalogue-card__bookmark ${isSaved(tool.id) ? "saved" : ""}`}
                              onClick={(e) => toggleSaved(e, tool)}
                            >
                              <Bookmark size={16} />
                            </button>

                            <Link
                              to={getItemLink(tool)}
                              className="tool-catalogue-card__link-wrapper"
                            >
                              <div
                                className="tool-catalogue-card__icon-area"
                                style={{
                                  backgroundColor:
                                    (tool as any).bgColor || "#f3f4f6",
                                }}
                              >
                                <span className="tool-catalogue-card__emoji">
                                  {(tool as any).emoji || "🛠️"}
                                </span>
                              </div>
                              <div className="tool-catalogue-card__body">
                                <div className="tool-catalogue-card__category-tag">
                                  {tool.category}
                                </div>
                                <h3 className="tool-catalogue-card__name">
                                  {tool.name}
                                </h3>
                                <p className="tool-catalogue-card__desc">
                                  {(tool.description || "").substring(0, 100)}
                                  ...
                                </p>
                              </div>
                            </Link>

                            <div className="tool-catalogue-card__footer">
                              <div className="tool-catalogue-card__meta">
                                <span className="tool-catalogue-card__rating">
                                  <Star size={12} fill="currentColor" />{" "}
                                  {(tool as any).rating || 4.5}
                                </span>
                                <span className="tool-catalogue-card__users">
                                  <Users size={12} />{" "}
                                  {(tool as any).users || "1k+"}
                                </span>
                              </div>
                              <a
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tool-catalogue-card__external-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="catalogue-grid">
              <AnimatePresence mode="popLayout">
                {filteredTools.map((tool, i) => (
                  <motion.div
                    key={tool.id || `tool-${i}`}
                    className="tool-catalogue-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    layout
                  >
                    <button
                      className={`tool-catalogue-card__bookmark ${isSaved(tool.id) ? "saved" : ""}`}
                      onClick={(e) => toggleSaved(e, tool)}
                    >
                      <Bookmark size={16} />
                    </button>

                    <Link
                      to={getItemLink(tool)}
                      className="tool-catalogue-card__link-wrapper"
                    >
                      <div
                        className="tool-catalogue-card__icon-area"
                        style={{
                          backgroundColor: (tool as any).bgColor || "#f3f4f6",
                        }}
                      >
                        <span className="tool-catalogue-card__emoji">
                          {(tool as any).emoji || "🛠️"}
                        </span>
                      </div>
                      <div className="tool-catalogue-card__body">
                        <div className="tool-catalogue-card__category-tag">
                          {tool.category}
                        </div>
                        <h3 className="tool-catalogue-card__name">
                          {tool.name}
                        </h3>
                        <p className="tool-catalogue-card__desc">
                          {(tool.description || "").substring(0, 120)}
                          {(tool.description || "").length > 120 ? "..." : ""}
                        </p>
                      </div>
                    </Link>

                    <div className="tool-catalogue-card__footer">
                      <div className="tool-catalogue-card__meta">
                        <span className="tool-catalogue-card__rating">
                          <Star size={12} fill="currentColor" />{" "}
                          {(tool as any).rating || 4.8}
                        </span>
                        <span className="tool-catalogue-card__users">
                          <Users size={13} /> {(tool as any).users || "2k+"}
                        </span>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tool-catalogue-card__external-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pagination */}
        {activeView === "all" &&
          paginationMeta &&
          paginationMeta.totalPages > 1 && (
            <div className="catalogue-pagination-wrapper">
              <Pagination
                currentPage={currentPage}
                totalPages={paginationMeta.totalPages}
                onPageChange={handlePageChange}
                disabled={toolsLoading}
              />
            </div>
          )}
      </main>
    </div>
  );
}
