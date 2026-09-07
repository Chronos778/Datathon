import { useMemo } from "react";
import { Sparkles } from "lucide-react";

export default function WordCloud({ records = [], onSelectWord }) {
  const words = useMemo(() => {
    const frequency = {};
    const sentiments = {};

    records.forEach((record) => {
      const items = [...record.keywords, ...record.topics];
      items.forEach((item) => {
        if (!item || item.length < 3) return;
        const normalized = item.toLowerCase();
        frequency[normalized] = (frequency[normalized] || 0) + 1;
        sentiments[normalized] ||= { positive: 0, negative: 0, mixed: 0 };
        const s = record.sentiment.toLowerCase();
        if (s.includes("pos")) sentiments[normalized].positive += 1;
        else if (s.includes("neg")) sentiments[normalized].negative += 1;
        else sentiments[normalized].mixed += 1;
      });
    });

    const entries = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 32);

    if (entries.length === 0) return [];
    const maxCount = entries[0][1];
    const minCount = entries[entries.length - 1][1];
    const range = Math.max(1, maxCount - minCount);

    return entries.map(([word, count]) => {
      const s = sentiments[word] || { positive: 0, negative: 0, mixed: 0 };
      let dominant = "neutral";
      if (s.positive > s.negative && s.positive > s.mixed) dominant = "positive";
      else if (s.negative > s.positive && s.negative > s.mixed) dominant = "negative";
      else if (s.mixed > 0 || s.positive === s.negative) dominant = "mixed";

      // Scale between 13px and 28px
      const scale = 13 + ((count - minCount) / range) * 15;

      return {
        word,
        count,
        scale: Math.round(scale),
        dominant,
      };
    });
  }, [records]);

  if (!words.length) return null;

  return (
    <div className="shadcn-card word-cloud-card">
      <div className="card-header-row">
        <div>
          <div className="card-eyebrow">
            <Sparkles size={13} /> Thematic Frequency
          </div>
          <h3>Topic & Keyword Cloud</h3>
          <p>Click any keyword to instantly filter and drill down</p>
        </div>
        <div className="cloud-legend">
          <span className="legend-chip pos"><span className="dot" /> Positive</span>
          <span className="legend-chip neg"><span className="dot" /> Negative</span>
          <span className="legend-chip mix"><span className="dot" /> Neutral / Mixed</span>
        </div>
      </div>

      <div className="word-cloud-container">
        {words.map(({ word, count, scale, dominant }) => (
          <button
            key={word}
            type="button"
            className={`cloud-tag cloud-${dominant}`}
            style={{ fontSize: `${scale}px` }}
            onClick={() => onSelectWord?.(word)}
            title={`${word}: ${count} mentions (${dominant})`}
          >
            {word}
            <span className="tag-count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
