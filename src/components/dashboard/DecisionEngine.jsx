import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  GitBranch,
  Quote,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { synthesizeDecisions } from "../../lib/clientAnalyzer";

export default function DecisionEngine({ records = [], onDrillDownTopic }) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusOverrides, setStatusOverrides] = useState({});

  const rawDecisions = useMemo(() => synthesizeDecisions(records), [records]);

  const decisions = useMemo(() => {
    return rawDecisions.map((d) => ({
      ...d,
      status: statusOverrides[d.id] || d.status,
    }));
  }, [rawDecisions, statusOverrides]);

  const filteredDecisions = useMemo(() => {
    if (severityFilter === "all") return decisions;
    return decisions.filter((d) => d.severity.toLowerCase() === severityFilter.toLowerCase());
  }, [decisions, severityFilter]);

  const stats = useMemo(() => {
    const critical = decisions.filter((d) => d.severity === "Critical").length;
    const high = decisions.filter((d) => d.severity === "High").length;
    const medium = decisions.filter((d) => d.severity === "Medium").length;
    const resolved = decisions.filter((d) => d.status === "Resolved").length;
    return { critical, high, medium, resolved, total: decisions.length };
  }, [decisions]);

  const toggleStatus = (id) => {
    setStatusOverrides((prev) => {
      const curr = prev[id] || decisions.find((d) => d.id === id)?.status || "In Review";
      const next = curr === "In Review" ? "Action Planned" : curr === "Action Planned" ? "Resolved" : "In Review";
      return { ...prev, [id]: next };
    });
  };

  const workflowSteps = [
    { num: "1", title: "Collect Evidence", desc: "Aggregate volume & quote instances from feedback" },
    { num: "2", title: "Evaluate Significance", desc: "Assess urgency threshold & negative velocity" },
    { num: "3", title: "Assess Severity & Impact", desc: "Prioritize P0-P3 & map affected cohorts" },
    { num: "4", title: "Generate Recommendations", desc: "AI synthesis of high-ROI action plans" },
    { num: "5", title: "Validate Decision", desc: "Statistical confidence & quote citation check" },
  ];

  return (
    <div className="decision-engine-view">
      {/* LangGraph Visual Workflow Ribbon */}
      <div className="shadcn-card workflow-banner">
        <div className="workflow-header">
          <div className="workflow-title-wrap">
            <span className="badge-ai-flow">
              <GitBranch size={13} /> LangGraph Decision Workflow
            </span>
            <h2>Multi-Step Decision & Recommendation Engine</h2>
            <p>
              Autonomous decision reasoning powered by AI graph evaluation — transforms thousands of raw responses into prioritized, high-conviction action items.
            </p>
          </div>
          <div className="kpi-mini-group">
            <div className="kpi-mini-stat crit">
              <span className="kpi-label">P0 Critical</span>
              <span className="kpi-val">{stats.critical}</span>
            </div>
            <div className="kpi-mini-stat high">
              <span className="kpi-label">P1 High</span>
              <span className="kpi-val">{stats.high}</span>
            </div>
            <div className="kpi-mini-stat res">
              <span className="kpi-label">Actioned</span>
              <span className="kpi-val">{stats.resolved}</span>
            </div>
          </div>
        </div>

        <div className="workflow-pipeline">
          {workflowSteps.map((step, idx) => (
            <div key={step.num} className="workflow-node">
              <div className="node-badge">
                <span className="node-num">{step.num}</span>
                <span className="node-name">{step.title}</span>
              </div>
              <p className="node-desc">{step.desc}</p>
              {idx < workflowSteps.length - 1 && (
                <div className="node-connector">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision Items Filter Bar */}
      <div className="decision-controls-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${severityFilter === "all" ? "active" : ""}`}
            onClick={() => setSeverityFilter("all")}
          >
            All Decisions ({decisions.length})
          </button>
          <button
            type="button"
            className={`filter-pill pill-critical ${severityFilter === "critical" ? "active" : ""}`}
            onClick={() => setSeverityFilter("critical")}
          >
            <Flame size={13} /> Critical ({stats.critical})
          </button>
          <button
            type="button"
            className={`filter-pill pill-high ${severityFilter === "high" ? "active" : ""}`}
            onClick={() => setSeverityFilter("high")}
          >
            <AlertTriangle size={13} /> High Priority ({stats.high})
          </button>
          <button
            type="button"
            className={`filter-pill ${severityFilter === "medium" ? "active" : ""}`}
            onClick={() => setSeverityFilter("medium")}
          >
            Medium ({stats.medium})
          </button>
        </div>

        <span className="filter-count-label">
          Showing {filteredDecisions.length} prioritized decisions
        </span>
      </div>

      {/* Decision Cards List */}
      <div className="decision-cards-grid">
        {filteredDecisions.length === 0 ? (
          <div className="empty-state-card">
            <CheckCircle2 size={32} className="text-emerald" />
            <h3>No issues found under this severity level</h3>
            <p>Your feedback signals are healthy for this filter tier.</p>
          </div>
        ) : (
          filteredDecisions.map((decision) => {
            const isCritical = decision.severity === "Critical";
            const isHigh = decision.severity === "High";

            return (
              <div
                key={decision.id}
                className={`shadcn-card decision-card severity-${decision.severity.toLowerCase()}`}
              >
                <div className="decision-card-top">
                  <div className="decision-meta-left">
                    <span
                      className={`severity-badge sev-${decision.severity.toLowerCase()}`}
                    >
                      {isCritical && <Flame size={12} />}
                      {isHigh && <AlertTriangle size={12} />}
                      {decision.severity} Priority
                    </span>
                    <span className="topic-title">{decision.topic}</span>
                    <span className="evidence-pill">
                      {decision.totalMentions} mentions ({decision.negativeRatio}% negative)
                    </span>
                  </div>

                  <div className="decision-meta-right">
                    <button
                      type="button"
                      className={`status-toggle-btn status-${decision.status.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => toggleStatus(decision.id)}
                      title="Click to toggle status"
                    >
                      {decision.status === "Resolved" ? (
                        <CheckCircle2 size={13} />
                      ) : decision.status === "Action Planned" ? (
                        <Clock size={13} />
                      ) : (
                        <SlidersHorizontal size={13} />
                      )}
                      {decision.status}
                    </button>

                    <button
                      type="button"
                      className="drill-down-btn"
                      onClick={() => onDrillDownTopic?.(decision.topic)}
                      title="Drill into these records"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </div>

                <div className="decision-body">
                  <div className="recommendation-box">
                    <div className="rec-header">
                      <Sparkles size={14} className="sparkle-icon" />
                      <strong>AI Recommendation:</strong>
                    </div>
                    <p className="rec-text">{decision.recommendation}</p>
                    <div className="rec-impact">
                      <span className="impact-tag">Expected Impact:</span> {decision.expectedImpact}
                    </div>
                  </div>

                  {/* Evidence & Confidence Metrics */}
                  <div className="decision-metrics-row">
                    <div className="metric-col">
                      <span className="metric-label">Validation Confidence</span>
                      <div className="confidence-bar-wrap">
                        <div
                          className="confidence-fill"
                          style={{ width: `${decision.confidenceScore}%` }}
                        />
                        <span className="confidence-num">{decision.confidenceScore}%</span>
                      </div>
                    </div>
                    <div className="metric-col">
                      <span className="metric-label">Dominant Emotion</span>
                      <span className="emotion-chip">{decision.topEmotion}</span>
                    </div>
                    <div className="metric-col">
                      <span className="metric-label">Sources Impacted</span>
                      <span className="source-list">{decision.affectedSources.slice(0, 2).join(", ")}</span>
                    </div>
                  </div>

                  {/* Verbatim Quotes Carousel/Drawer */}
                  {decision.evidenceQuotes && decision.evidenceQuotes.length > 0 && (
                    <div className="evidence-quotes-section">
                      <div className="quotes-title">
                        <Quote size={12} /> Verbatim Evidence from Users ({decision.evidenceQuotes.length})
                      </div>
                      <div className="quotes-list">
                        {decision.evidenceQuotes.map((quote, qIdx) => (
                          <div key={qIdx} className="quote-bubble">
                            <span className="quote-mark">“</span>
                            <span className="quote-text">{quote}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
