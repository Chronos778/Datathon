import { MessagesSquare, Minus, Smile, ThumbsDown } from "lucide-react";
import { formatPercent } from "../../lib/data-processing";

const cards = [
  { key: "total", label: "Total feedback", icon: MessagesSquare },
  { key: "positive", label: "Positive", icon: Smile },
  { key: "negative", label: "Negative", icon: ThumbsDown },
  { key: "mixed", label: "Mixed / neutral", icon: Minus },
];

export default function KpiCards({ counts }) {
  return (
    <div className="kpi-grid">
      {cards.map(({ key, label, icon: Icon }) => {
        const count = key === "total" ? counts.total : counts[key];
        return (
          <article className={`kpi-card ${key}`} key={key}>
            <div>
              <span>{label}</span>
              <Icon size={17} />
            </div>
            <strong>{count.toLocaleString()}</strong>
            {key !== "total" ? (
              <small>{formatPercent(count, counts.total)}% of filtered feedback</small>
            ) : (
              <small>Responses in the current view</small>
            )}
          </article>
        );
      })}
    </div>
  );
}
