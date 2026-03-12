import { useParams, Link } from "react-router-dom";
import { useWorkflow } from "./hooks/useCatalogue";
import {
  ChevronLeft,
  Layers,
  CheckCircle2,
  Loader2,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import "./ToolDetail.css"; // Reuse detail styles

export function WorkflowDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: workflow, isLoading, error } = useWorkflow(id);

  if (isLoading) {
    return (
      <div className="detail-loading">
        <Loader2 className="spinning" size={40} />
        <p>Loading workflow details...</p>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="detail-error">
        <h2>Workflow not found</h2>
        <p>We couldn't find the workflow you're looking for.</p>
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
            style={{ backgroundColor: "#ecfdf5" }}
          >
            <Zap size={32} className="text-emerald-500" />
          </div>
          <div className="tool-hero__info">
            <div className="tool-category-badge">Workflow</div>
            <h1 className="tool-name">{workflow.title}</h1>
            <p className="tool-tagline">{workflow.description}</p>

            <div className="tool-stats">
              <div className="tool-stat">
                <Layers size={16} className="stat-icon" />
                <span>{workflow.steps?.length || 0} Steps</span>
              </div>
              <div className="tool-stat">
                <Clock size={16} className="stat-icon" />
                <span>{workflow.complexity || "Intermediate"}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="detail-grid">
          <article className="detail-main">
            <section className="detail-section">
              <h2>Implementation Steps</h2>
              <div className="workflow-steps">
                {workflow.steps?.map((step, index) => (
                  <div key={index} className="workflow-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {workflow.use_cases && workflow.use_cases.length > 0 && (
              <section className="detail-section">
                <h2>Best Use Cases</h2>
                <ul className="use-cases-list">
                  {workflow.use_cases.map((useCase, index) => (
                    <li key={index}>
                      <Target size={18} className="text-blue-500 mr-2" />
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className="detail-sidebar">
            {workflow.recommended_tools &&
              workflow.recommended_tools.length > 0 && (
                <div className="sidebar-card">
                  <h3>Recommended Tools</h3>
                  <div className="recommended-tools-list">
                    {workflow.recommended_tools.map((toolName, index) => (
                      <div key={index} className="recommended-tool-item">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span>{toolName}</span>
                      </div>
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
