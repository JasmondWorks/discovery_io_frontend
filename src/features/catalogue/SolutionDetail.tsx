import { useParams, Link } from "react-router-dom";
import { useSolution } from "./hooks/useCatalogue";
import {
  ChevronLeft,
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRightCircle,
  Scale,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import "./ToolDetail.css"; // Reuse detail styles

export function SolutionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: solution, isLoading, error } = useSolution(id);

  if (isLoading) {
    return (
      <div className="detail-loading">
        <Loader2 className="spinning" size={40} />
        <p>Loading solution details...</p>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="detail-error">
        <h2>Solution not found</h2>
        <p>We couldn't find the solution you're looking for.</p>
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
        </div>
      </header>

      <main className="detail-content">
        <section className="tool-hero">
          <div
            className="tool-hero__icon"
            style={{ backgroundColor: "#eff6ff" }}
          >
            <Lightbulb size={32} className="text-blue-500" />
          </div>
          <div className="tool-hero__info">
            <div className="tool-category-badge">Solution</div>
            <h1 className="tool-name">{solution.issue_title}</h1>
            <p className="tool-tagline">{solution.description}</p>
          </div>
        </section>

        <div className="detail-grid">
          <article className="detail-main">
            <section className="detail-section">
              <div className="detail-section__header">
                <AlertCircle size={20} className="text-amber-500" />
                <h2>The Problem</h2>
              </div>
              <p>{solution.cause_explanation}</p>
            </section>

            <section className="detail-section">
              <div className="detail-section__header">
                <ArrowRightCircle size={20} className="text-emerald-500" />
                <h2>The Resolution Steps</h2>
              </div>
              <div className="workflow-steps">
                {solution.resolution_steps?.map((step, index) => (
                  <div key={index} className="workflow-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {solution.tradeoffs && (
              <section className="detail-section">
                <div className="detail-section__header">
                  <Scale size={20} className="text-purple-500" />
                  <h2>Tradeoffs</h2>
                </div>
                <p>{solution.tradeoffs}</p>
              </section>
            )}
          </article>

          <aside className="detail-sidebar">
            {solution.recommended_tools &&
              solution.recommended_tools.length > 0 && (
                <div className="sidebar-card">
                  <h3>Recommended Tools</h3>
                  <div className="recommended-tools-list">
                    {solution.recommended_tools.map((toolName, index) => (
                      <div key={index} className="recommended-tool-item">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span>{toolName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {solution.tags && solution.tags.length > 0 && (
              <div className="sidebar-card">
                <h3>Tags</h3>
                <div className="tags-cloud">
                  {solution.tags.map((tag: string, index: number) => (
                    <span key={index} className="detail-tag">
                      {tag}
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
