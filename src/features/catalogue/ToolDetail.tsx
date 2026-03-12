import { useParams, Link } from "react-router-dom";
import { useTool } from "./hooks/useCatalogue";
import {
  ChevronLeft,
  ExternalLink,
  Star,
  Users,
  Bookmark,
  Globe,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button, LoadingSpinner } from "../../components/ui";
import {
  useBookmarks,
  useCreateBookmark,
  useDeleteBookmark,
} from "../bookmarks/hooks/useBookmarks";
import "./ToolDetail.css";

export function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: tool, isLoading, error } = useTool(id);
  const { data: bookmarksData } = useBookmarks();
  const { mutate: addBookmark } = useCreateBookmark();
  const { mutate: removeBookmark } = useDeleteBookmark();

  const bookmarks = Array.isArray(bookmarksData)
    ? bookmarksData
    : (bookmarksData as any)?.data || [];

  const normalizedToolId = tool?.id || (tool as any)?._id || id;
  const isSaved = bookmarks.some(
    (b: any) =>
      b.tool_id === normalizedToolId ||
      b.id === normalizedToolId ||
      b._id === normalizedToolId,
  );

  const toggleSaved = () => {
    if (!tool) return;

    const existingBookmark = bookmarks.find(
      (b: any) =>
        b.tool_id === normalizedToolId ||
        b.id === normalizedToolId ||
        b._id === normalizedToolId,
    );

    if (existingBookmark) {
      removeBookmark(existingBookmark.id);
    } else {
      const isRealId =
        normalizedToolId && (normalizedToolId as string).length > 10;

      if (isRealId) {
        addBookmark(normalizedToolId as string);
      } else {
        addBookmark({
          tool_name: tool.name,
          tool_description: tool.description,
          tool_url: tool.url,
          tool_id: undefined,
        });
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading tool details..." fullPage />;
  }

  if (error || !tool) {
    return (
      <div className="detail-error">
        <h2>Tool not found</h2>
        <p>We couldn't find the tool you're looking for.</p>
        <Link to="/catalogue">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="tool-detail-page">
      <header className="detail-header">
        <div className="detail-header__inner">
          <Link to="/catalogue" className="back-link">
            <ChevronLeft size={20} />
            <span>Back to Catalog</span>
          </Link>
          <div className="detail-header__actions">
            <button
              className={`bookmark-btn ${isSaved ? "active" : ""}`}
              onClick={toggleSaved}
            >
              <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="detail-content">
        <section className="tool-hero">
          <div
            className="tool-hero__icon"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            <span className="tool-hero__emoji">🛠️</span>
          </div>
          <div className="tool-hero__info">
            <div className="tool-category-badge">{tool.category}</div>
            <h1 className="tool-name">{tool.name}</h1>
            <p className="tool-tagline">{tool.description}</p>

            <div className="tool-stats">
              <div className="tool-stat">
                <Star
                  size={16}
                  className="stat-icon star"
                  fill="currentColor"
                />
                <span>4.8 Rating</span>
              </div>
              <div className="tool-stat">
                <Users size={16} className="stat-icon users" />
                <span>10k+ Users</span>
              </div>
              <div className="tool-stat">
                <Tag size={16} className="stat-icon tag" />
                <span>{tool.pricing || "Freemium"}</span>
              </div>
            </div>

            <div className="tool-actions">
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className="visit-btn">
                  Visit Website
                  <ExternalLink size={16} />
                </Button>
              </a>
            </div>
          </div>
        </section>

        <div className="detail-grid">
          <article className="detail-main">
            <section className="detail-section">
              <h2>About {tool.name}</h2>
              <p>{tool.description}</p>
              <p>
                {tool.name} is a powerful AI tool designed to help professionals
                in the {tool.category} field. It offers a wide range of features
                to streamline your workflow and enhance productivity.
              </p>
            </section>

            {tool.verified_use_cases && tool.verified_use_cases.length > 0 && (
              <section className="detail-section">
                <h2>Verified Use Cases</h2>
                <ul className="use-cases-list">
                  {tool.verified_use_cases.map((useCase, index) => (
                    <li key={index}>
                      <CheckCircle2 size={18} className="check-icon" />
                      <span>
                        {useCase
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className="detail-sidebar">
            <div className="sidebar-card">
              <h3>Platform Details</h3>
              <div className="sidebar-info-row">
                <Globe size={16} />
                <span>{tool.platform || "Web-based"}</span>
              </div>
              <div className="sidebar-info-row">
                <Tag size={16} />
                <span>{tool.pricing || "Contact for pricing"}</span>
              </div>
            </div>

            {tool.tags && tool.tags.length > 0 && (
              <div className="sidebar-card">
                <h3>Tags</h3>
                <div className="tags-cloud">
                  {tool.tags.map((tag, index) => (
                    <span key={index} className="detail-tag">
                      {tag
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
