import { useEffect } from "react";
import { X } from "lucide-react";

function MetaRow({ label, children }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <div>{children || "—"}</div>
    </div>
  );
}

export default function FeedbackDetail({ record, onClose }) {
  useEffect(() => {
    if (!record) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [record, onClose]);

  if (!record) return null;

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="feedback-drawer"
        aria-label="Feedback details"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <span className="section-label">Feedback record</span>
            <h2>Classification details</h2>
          </div>
          <button className="icon-control" type="button" onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>
        <blockquote>{record.feedback}</blockquote>
        <div className="detail-list">
          <MetaRow label="Sentiment">
            <span className={`sentiment-badge ${record.sentiment.toLowerCase()}`}>
              {record.sentiment}
            </span>
          </MetaRow>
          <MetaRow label="Sentiment confidence">
            {record.sentiment_confidence == null
              ? "—"
              : `${(record.sentiment_confidence * 100).toFixed(2)}%`}
          </MetaRow>
          <MetaRow label="Emotion">{record.emotion}</MetaRow>
          <MetaRow label="Source">{record.source}</MetaRow>
          <MetaRow label="Date">
            {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(record.date))}
          </MetaRow>
          <MetaRow label="Topics">
            <div className="tag-list">
              {record.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </MetaRow>
          <MetaRow label="Keywords">
            <div className="tag-list quiet">
              {record.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
          </MetaRow>
        </div>
        <div className="aspect-detail">
          <h3>Aspect sentiments</h3>
          {record.aspect_sentiments.length ? (
            record.aspect_sentiments.map((aspect) => (
              <div key={`${aspect.aspect}-${aspect.sentiment}`}>
                <span>{aspect.aspect}</span>
                <strong className={`${aspect.sentiment.toLowerCase()}-text`}>
                  {aspect.sentiment}
                </strong>
              </div>
            ))
          ) : (
            <p>No aspect classifications were returned.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
