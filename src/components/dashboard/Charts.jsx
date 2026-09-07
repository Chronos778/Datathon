import { useState, useMemo } from "react";

export function ChartCard({ title, subtitle, action, className = "", children, id }) {
  return (
    <article className={`analytics-card ${className}`} id={id}>
      <div className="chart-heading">
        <div className="chart-heading-inner">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && <div className="chart-action-wrap">{action}</div>}
      </div>
      {children}
    </article>
  );
}

export function EmptyChart({ message = "No data matches the current filters." }) {
  return <div className="empty-chart">{message}</div>;
}

// Beautified, Large SVG Donut Chart for Sentiment Distribution (Occupies entire container)
export function SentimentDistribution({ counts, onSelect }) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const total = counts.positive + counts.negative + counts.mixed;

  const posPercent = total ? (counts.positive / total) * 100 : 0;
  const negPercent = total ? (counts.negative / total) * 100 : 0;
  const mixPercent = total ? (counts.mixed / total) * 100 : 0;
  const nss = Math.round(posPercent - negPercent);

  // Donut geometry: cx=160, cy=125, r=92 (diameter 184px, stroke 22px -> outer 206px)
  const cx = 160;
  const cy = 125;
  const r = 92;
  const c = 2 * Math.PI * r;

  const posDash = (posPercent / 100) * c;
  const negDash = (negPercent / 100) * c;
  const mixDash = (mixPercent / 100) * c;

  const posOffset = 0;
  const negOffset = -posDash;
  const mixOffset = -(posDash + negDash);

  const items = [
    { key: "positive", label: "Positive", count: counts.positive, pct: posPercent, color: "#16a34a", grad: "url(#donutPosGrad)" },
    { key: "negative", label: "Negative", count: counts.negative, pct: negPercent, color: "#dc2626", grad: "url(#donutNegGrad)" },
    { key: "mixed", label: "Mixed / Neutral", count: counts.mixed, pct: mixPercent, color: "#d97706", grad: "url(#donutMixGrad)" },
  ];

  const activeItem = items.find((it) => it.key === hoveredKey);

  return (
    <ChartCard
      title="Sentiment Distribution"
      subtitle="Classification across verified responses"
      id="sentiment"
      className="sentiment-donut-card"
    >
      {!total ? (
        <EmptyChart message="No sentiment data matches current filters." />
      ) : (
        <div className="beautified-donut-container">
          <div className="beautified-donut-wrap">
            <svg viewBox="0 0 320 250" className="beautified-donut-svg">
              <defs>
                <linearGradient id="donutPosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="donutNegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="donutMixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.18" />
                </filter>
              </defs>

              {/* Background Circular Track */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="20"
              />

              {/* Positive Arc */}
              {posDash > 0 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="url(#donutPosGrad)"
                  strokeWidth={hoveredKey === "positive" ? "25" : "20"}
                  strokeDasharray={`${Math.max(1, posDash - (items.filter(i => i.count > 0).length > 1 ? 3 : 0))} ${c}`}
                  strokeDashoffset={posOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  className="beautified-donut-segment"
                  filter={hoveredKey === "positive" ? "url(#donutGlow)" : "none"}
                  onMouseEnter={() => setHoveredKey("positive")}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onSelect?.("positive")}
                />
              )}

              {/* Negative Arc */}
              {negDash > 0 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="url(#donutNegGrad)"
                  strokeWidth={hoveredKey === "negative" ? "25" : "20"}
                  strokeDasharray={`${Math.max(1, negDash - (items.filter(i => i.count > 0).length > 1 ? 3 : 0))} ${c}`}
                  strokeDashoffset={negOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  className="beautified-donut-segment"
                  filter={hoveredKey === "negative" ? "url(#donutGlow)" : "none"}
                  onMouseEnter={() => setHoveredKey("negative")}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onSelect?.("negative")}
                />
              )}

              {/* Mixed Arc */}
              {mixDash > 0 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke="url(#donutMixGrad)"
                  strokeWidth={hoveredKey === "mixed" ? "25" : "20"}
                  strokeDasharray={`${Math.max(1, mixDash - (items.filter(i => i.count > 0).length > 1 ? 3 : 0))} ${c}`}
                  strokeDashoffset={mixOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                  className="beautified-donut-segment"
                  filter={hoveredKey === "mixed" ? "url(#donutGlow)" : "none"}
                  onMouseEnter={() => setHoveredKey("mixed")}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => onSelect?.("mixed")}
                />
              )}
            </svg>

            {/* Center Summary Display */}
            <div
              className="beautified-donut-center"
              onClick={() => onSelect?.("all")}
              title="Click to reset sentiment filter"
            >
              {activeItem ? (
                <>
                  <span className="donut-center-hover-name" style={{ color: activeItem.color }}>
                    {activeItem.label}
                  </span>
                  <span className="donut-center-hover-count">
                    {activeItem.count.toLocaleString()}
                  </span>
                  <span className="donut-center-hover-pct">
                    {activeItem.pct.toFixed(1)}% of dataset
                  </span>
                </>
              ) : (
                <>
                  <span className={`donut-center-nss ${nss >= 0 ? "pos" : "neg"}`}>
                    {nss >= 0 ? `+${nss}` : nss}%
                  </span>
                  <span className="donut-center-badge">Net Sentiment Score</span>
                  <span className="donut-center-total">{total.toLocaleString()} Responses</span>
                </>
              )}
            </div>
          </div>

          {/* Sleek Interactive Bottom Sentiment Badges */}
          <div className="donut-chips-bar">
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                className={`donut-chip-btn ${it.key} ${hoveredKey === it.key ? "hovered" : ""}`}
                onClick={() => onSelect?.(it.key)}
                onMouseEnter={() => setHoveredKey(it.key)}
                onMouseLeave={() => setHoveredKey(null)}
                title={`Filter by ${it.label}`}
              >
                <span className={`donut-chip-dot ${it.key === "positive" ? "pos" : it.key === "negative" ? "neg" : "mix"}`} />
                <span>{it.label}</span>
                <span className="donut-chip-stat">{it.pct.toFixed(0)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

// Smooth curved path generator for SVG spline graphs
function smoothCurvedPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
}

const EMOTION_PALETTE = {
  frustration: "#ef4444",
  concern: "#f97316",
  confusion: "#8b5cf6",
  satisfaction: "#10b981",
  delight: "#06b6d4",
  excitement: "#3b82f6",
  boredom: "#64748b",
  anger: "#dc2626",
  joy: "#14b8a6",
  disappointment: "#a855f7",
};

const DEFAULT_EMOTION_COLORS = [
  "#ef4444",
  "#10b981",
  "#06b6d4",
  "#f97316",
  "#8b5cf6",
  "#64748b",
  "#ec4899",
];

function getEmotionColor(label, idx) {
  if (!label) return DEFAULT_EMOTION_COLORS[idx % DEFAULT_EMOTION_COLORS.length];
  const key = label.toLowerCase().trim();
  return EMOTION_PALETTE[key] || DEFAULT_EMOTION_COLORS[idx % DEFAULT_EMOTION_COLORS.length];
}

// Emotion Distribution: Classic KDE Histogram (Generic Style)
export function EmotionDistribution({ data = [], total = 0, onSelect = () => {} }) {
  const [hoveredEmotion, setHoveredEmotion] = useState(null);

  const emotions = data.slice(0, 7);
  const totalCount = total > 0 ? total : emotions.reduce((acc, e) => acc + e.count, 0) || 1;

  // Layout constants (much wider and shorter aspect ratio)
  const w = 700;
  const h = 210;
  const padL = 64;
  const padR = 24;
  const padT = 20;
  const padB = 44;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const baselineY = padT + plotH;

  const maxVal = Math.max(...emotions.map((e) => e.count), 1);
  const rawStep = maxVal / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const tickStep = Math.ceil(rawStep / magnitude) * magnitude || 1;
  const yMax = tickStep * 4;
  const yTicks = [0, tickStep, tickStep * 2, tickStep * 3, tickStep * 4];

  const barCount = emotions.length || 1;
  const gap = 12;
  const barW = Math.max(16, (plotW - gap * (barCount + 1)) / barCount);

  const bars = emotions.map((item, i) => {
    const x = padL + gap + i * (barW + gap);
    const barH = Math.max(2, (item.count / yMax) * plotH);
    const y = baselineY - barH;
    const pct = Math.round((item.count / totalCount) * 100);
    const color = getEmotionColor(item.label, i);
    return { x, y, barH, barW, item, pct, color, idx: i };
  });

  // Calculate points for the smooth KDE curve
  const points = bars.map(b => ({
    x: b.x + b.barW / 2,
    y: Math.max(b.y - 4, padT),
    color: b.color
  }));

  // Helper for smooth curve
  const getSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    let d = `M ${padL} ${baselineY}`; // Start from bottom left
    d += ` L ${pts[0].x} ${pts[0].y}`; // Line to first point
    
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const midX = (current.x + next.x) / 2;
      d += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }
    
    d += ` L ${w - padR} ${baselineY}`; // Line to bottom right
    return d;
  };

  const curvePath = points.length > 0 ? getSmoothPath(points) : "";

  return (
    <ChartCard
      title="Emotion Distribution"
      subtitle="Volume share and probability density"
      id="emotion-distribution"
      className="compact-emotion-card"
    >
      {!emotions.length ? (
        <EmptyChart message="No emotion records found for current filters." />
      ) : (
        <div className="emotion-histogram-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
          <svg viewBox={`0 0 ${w} ${h}`} className="emotion-histogram-svg" style={{ maxWidth: '100%', height: 'auto' }}>

            {/* Horizontal grid lines */}
            {yTicks.map((val) => {
              const y = baselineY - (val / yMax) * plotH;
              return (
                <line
                  key={`grid-${val}`}
                  x1={padL}
                  y1={y}
                  x2={w - padR}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              );
            })}

            {/* Y-axis line */}
            <line x1={padL} y1={padT - 8} x2={padL} y2={baselineY} stroke="#94a3b8" strokeWidth="1.5" />

            {/* Y-axis title */}
            <text 
              x={14} 
              y={padT + plotH / 2} 
              transform={`rotate(-90 14 ${padT + plotH / 2})`}
              textAnchor="middle" 
              style={{ fontSize: "12px", fontWeight: 600, fill: "#475569" }}
            >
              Response Volume
            </text>

            {/* Y-axis tick labels */}
            {yTicks.map((val) => {
              const y = baselineY - (val / yMax) * plotH;
              return (
                <g key={`ytick-${val}`}>
                  <line x1={padL - 4} y1={y} x2={padL} y2={y} stroke="#94a3b8" strokeWidth="1.5" />
                  <text x={padL - 8} y={y + 4} textAnchor="end" style={{ fontSize: "11px", fontWeight: 500, fill: "#64748b" }}>
                    {Math.round(val).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* X-axis baseline */}
            <line x1={padL} y1={baselineY} x2={w - padR} y2={baselineY} stroke="#94a3b8" strokeWidth="1.5" />

            {/* X-axis title */}
            <text 
              x={padL + plotW / 2} 
              y={h - 10} 
              textAnchor="middle" 
              style={{ fontSize: "12px", fontWeight: 600, fill: "#475569" }}
            >
              Emotion Categories
            </text>

            {/* Bars */}
            {bars.map((b) => {
              const isHovered = hoveredEmotion === b.item.label;
              return (
                <g
                  key={b.item.label}
                  cursor="pointer"
                  onClick={() => onSelect(b.item.label)}
                  onMouseEnter={() => setHoveredEmotion(b.item.label)}
                  onMouseLeave={() => setHoveredEmotion(null)}
                >
                  {/* Main bar (Generic solid color, sharp corners) */}
                  <rect
                    x={b.x}
                    y={b.y}
                    width={b.barW}
                    height={b.barH}
                    fill={b.color}
                    fillOpacity={isHovered ? 0.8 : 0.4}
                    stroke={b.color}
                    strokeWidth="1"
                    style={{ transition: "all 0.15s ease" }}
                  />

                  {/* X-axis tick */}
                  <line x1={b.x + b.barW / 2} y1={baselineY} x2={b.x + b.barW / 2} y2={baselineY + 4} stroke="#94a3b8" strokeWidth="1.5" />

                  {/* X-axis label */}
                  <text
                    x={b.x + b.barW / 2}
                    y={baselineY + 18}
                    textAnchor="middle"
                    style={{ fontSize: "11px", fontWeight: isHovered ? 600 : 500, fill: "#475569", transition: "all 0.15s ease" }}
                  >
                    {b.item.label}
                  </text>
                </g>
              );
            })}

            {/* KDE Curve */}
            {curvePath && (
              <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" style={{ pointerEvents: "none" }} />
            )}

            {/* Peak Dots & Labels */}
            {points.map((p, i) => {
              const b = bars[i];
              const isHovered = hoveredEmotion === b.item.label;
              return (
                <g
                  key={`pt-${b.item.label}`}
                  cursor="pointer"
                  onClick={() => onSelect(b.item.label)}
                  onMouseEnter={() => setHoveredEmotion(b.item.label)}
                  onMouseLeave={() => setHoveredEmotion(null)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 3.5}
                    fill="#ffffff"
                    stroke={p.color}
                    strokeWidth="2"
                    style={{ transition: "r 0.15s ease" }}
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    style={{ fontSize: "11px", fontWeight: 700, fill: "#334155" }}
                  >
                    {b.item.count} ({b.pct}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </ChartCard>
  );
}

// Top 5 Topics Bar Chart (Faithfully matching user reference image)
export function Top5TopicsBarChart({ data = [], onSelect = () => {}, id }) {
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const topics = data.slice(0, 5);
  const maxMentions = Math.max(...topics.map((t) => t.count), 1);

  // Compute nice ticks matching reference image (0, 1/3, 2/3, 3/3)
  let step = Math.ceil(maxMentions / 3);
  if (step > 10) {
    step = Math.ceil(step / 5) * 5;
  } else if (step > 4) {
    step = Math.ceil(step / 2) * 2;
  } else {
    step = Math.max(step, 1);
  }
  const niceMax = step * 3;
  const ticks = [0, step, step * 2, niceMax];

  // Exact 5 bar colors matching reference image:
  // 1: Pink (#df389e), 2: Bright Blue (#118df0), 3: Dark Navy (#0b4277), 4: Terracotta (#e36733), 5: Deep Purple (#6b097b)
  const BAR_COLORS = ["#df389e", "#118df0", "#0b4277", "#e36733", "#6b097b"];

  return (
    <article className="analytics-card top-topics-card" id={id}>
      <div className="top-topics-heading">
        <h2>Top 5 Topics</h2>
        <p>Response volume and mentions across primary categories</p>
      </div>

      {!topics.length ? (
        <EmptyChart message="No topic mentions in current view." />
      ) : (
        <div className="top-topics-visual">
          {/* Vertical Y-Axis Title */}
          <div className="top-topics-y-axis-label">Topic</div>

          {/* Core Chart Grid: Labels on left, Plot on right */}
          <div className="top-topics-content">
            {/* Topic Labels Column */}
            <div className="top-topics-labels">
              {topics.map((topic) => (
                <div
                  key={topic.label}
                  className={`top-topics-label ${hoveredTopic === topic.label ? "active" : ""}`}
                  title={topic.label}
                  onClick={() => onSelect(topic.label)}
                >
                  {topic.label}
                </div>
              ))}
            </div>

            {/* Plot Area with Dotted Gridlines & Bars */}
            <div className="top-topics-plot-wrap">
              <div className="top-topics-plot">
                {/* Vertical Dotted Gridlines across the plot area */}
                <div className="top-topics-gridlines">
                  {ticks.map((_, idx) => {
                    const leftPct = (idx / (ticks.length - 1)) * 100;
                    return (
                      <div
                        key={idx}
                        className="top-topics-gridline"
                        style={{ left: `${leftPct}%` }}
                      />
                    );
                  })}
                </div>

                {/* The 5 Horizontal Bars */}
                <div className="top-topics-bars">
                  {topics.map((topic, index) => {
                    const pctOfMax = Math.min((topic.count / niceMax) * 100, 100);
                    const color = BAR_COLORS[index % BAR_COLORS.length];
                    const isHovered = hoveredTopic === topic.label;

                    return (
                      <div
                        key={topic.label}
                        className={`top-topics-bar-row ${isHovered ? "hovered" : ""}`}
                        onMouseEnter={() => setHoveredTopic(topic.label)}
                        onMouseLeave={() => setHoveredTopic(null)}
                        onClick={() => onSelect(topic.label)}
                        title={`Filter by ${topic.label}: ${topic.count} mentions`}
                      >
                        <div
                          className="top-topics-bar-fill"
                          style={{
                            width: `${pctOfMax}%`,
                            backgroundColor: color,
                          }}
                        >
                          {pctOfMax > 16 ? (
                            <span className="top-topics-val-inside">{topic.count}</span>
                          ) : null}
                        </div>
                        {pctOfMax <= 16 && (
                          <span className="top-topics-val-outside">{topic.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom X-Axis Numbers and Title */}
              <div className="top-topics-x-axis">
                <div className="top-topics-ticks">
                  {ticks.map((tick, idx) => {
                    const leftPct = (idx / (ticks.length - 1)) * 100;
                    return (
                      <span
                        key={idx}
                        className="top-topics-tick"
                        style={{
                          left: `${leftPct}%`,
                          transform:
                            idx === 0
                              ? "translateX(0%)"
                              : idx === ticks.length - 1
                              ? "translateX(-100%)"
                              : "translateX(-50%)",
                        }}
                      >
                        {tick}
                      </span>
                    );
                  })}
                </div>
                <div className="top-topics-x-title">Total Mentions</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// Trending Words: Rumbled Pills Layout (Medicine Jar Style)
const PILL_COLORS = [
  { bg: "rgba(37, 99, 235, 0.12)", border: "#2563eb", text: "#1e40af" },
  { bg: "rgba(6, 182, 212, 0.12)", border: "#06b6d4", text: "#0e7490" },
  { bg: "rgba(16, 185, 129, 0.12)", border: "#10b981", text: "#047857" },
  { bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b", text: "#92400e" },
  { bg: "rgba(139, 92, 246, 0.12)", border: "#8b5cf6", text: "#5b21b6" },
  { bg: "rgba(236, 72, 153, 0.12)", border: "#ec4899", text: "#9d174d" },
  { bg: "rgba(99, 102, 241, 0.12)", border: "#6366f1", text: "#3730a3" },
  { bg: "rgba(239, 68, 68, 0.12)", border: "#ef4444", text: "#991b1b" },
  { bg: "rgba(20, 184, 166, 0.12)", border: "#14b8a6", text: "#115e59" },
  { bg: "rgba(249, 115, 22, 0.12)", border: "#f97316", text: "#9a3412" },
];

export function TrendingWordsChart({ data = [], onSelect = () => {}, id = "trending-words" }) {
  const [hoveredWord, setHoveredWord] = useState(null);

  const keywords = data.slice(0, 12);
  const totalMentions = keywords.reduce((acc, k) => acc + k.count, 0) || 1;
  const maxCount = Math.max(...keywords.map((k) => k.count), 1);

  // Compute pill sizes based on frequency (min 0.72x to max 1.55x)
  const pills = keywords.map((k, idx) => {
    const ratio = k.count / maxCount;
    const scale = 0.72 + ratio * 0.83;
    const fontSize = Math.round(11 + ratio * 7);
    const padX = Math.round(10 + ratio * 10);
    const padY = Math.round(5 + ratio * 4);
    const pct = Math.round((k.count / totalMentions) * 100);
    const color = PILL_COLORS[idx % PILL_COLORS.length];

    // Pseudo-random rotation for organic look (deterministic based on index)
    const rotDeg = ((idx * 37 + idx * idx * 7) % 11) - 5; // range -5 to +5 degrees

    return {
      ...k,
      scale,
      fontSize,
      padX,
      padY,
      pct,
      color,
      rotDeg,
      idx,
    };
  });

  return (
    <ChartCard
      title="Trending Words"
      subtitle="Keyword frequency across all feedback — sized by volume"
      className="trending-words-card"
      id={id}
    >
      {!keywords.length ? (
        <EmptyChart message="No keyword data matches the current filters." />
      ) : (
        <div className="trending-pills-container">
          <div className="pills-jar">
            {pills.map((pill) => {
              const isHovered = hoveredWord === pill.label;
              return (
                <button
                  key={pill.label}
                  type="button"
                  className={`trend-pill ${isHovered ? "hovered" : ""}`}
                  style={{
                    fontSize: `${pill.fontSize}px`,
                    padding: `${pill.padY}px ${pill.padX}px`,
                    backgroundColor: isHovered ? pill.color.bg : "transparent",
                    borderColor: pill.color.border,
                    color: pill.color.text,
                    transform: `rotate(${isHovered ? 0 : pill.rotDeg}deg) scale(${isHovered ? 1.08 : 1})`,
                  }}
                  onClick={() => onSelect?.(pill.label)}
                  onMouseEnter={() => setHoveredWord(pill.label)}
                  onMouseLeave={() => setHoveredWord(null)}
                  title={`${pill.label}: ${pill.count.toLocaleString()} mentions (${pill.pct}%)`}
                >
                  <span className="pill-word">{pill.label}</span>
                  <span className="pill-count"
                    style={{
                      backgroundColor: `${pill.color.border}15`,
                      color: pill.color.border,
                    }}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Total Badge */}
          <div className="pills-total-badge">
            {totalMentions.toLocaleString()} total keyword mentions across {keywords.length} terms
          </div>
        </div>
      )}
    </ChartCard>
  );
}

// Larger, Prominent Lieflat Trend / Timeline Chart
export function SentimentTrend({ data, mode, onMode }) {
  const [activePoint, setActivePoint] = useState(null);
  const maxValue = Math.max(...data.flatMap((entry) => [entry.positive, entry.negative, entry.mixed]), 1);

  const width = 720;
  const height = 210;
  const paddingX = 28;
  const paddingY = 24;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const getCoordinates = (key) => {
    return data.map((entry, index) => {
      const x = data.length === 1 ? chartW / 2 + paddingX : paddingX + (index / (data.length - 1)) * chartW;
      const y = paddingY + chartH - (entry[key] / maxValue) * chartH;
      return { x, y, value: entry[key], date: entry.key };
    });
  };

  const posPoints = getCoordinates("positive");
  const negPoints = getCoordinates("negative");
  const mixPoints = getCoordinates("mixed");

  const posPath = smoothCurvedPath(posPoints);
  const negPath = smoothCurvedPath(negPoints);
  const mixPath = smoothCurvedPath(mixPoints);

  // Closed area under curves
  const posArea = posPoints.length > 1
    ? `${posPath} L ${posPoints[posPoints.length - 1].x} ${height} L ${posPoints[0].x} ${height} Z`
    : "";

  return (
    <ChartCard
      title="Sentiment Timeline"
      subtitle="Response volume and momentum tracked over time"
      className="trend-card prominent-trend-card"
      action={
        <div className="period-tabs modern-period-tabs" aria-label="Trend grouping">
          {["daily", "weekly", "monthly"].map((option) => (
            <button
              className={mode === option ? "active" : ""}
              type="button"
              key={option}
              onClick={() => onMode(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      }
    >
      {!data.length ? (
        <EmptyChart />
      ) : (
        <div className="prominent-trend-container">
          <svg viewBox={`0 0 ${width} ${height + 34}`} className="prominent-trend-svg" role="img">
            <defs>
              <linearGradient id="prominentPosGrad" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="prominentNegGrad" x1="0%" y1="0%" x2="0%" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Dotted Hairline Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((offset) => {
              const y = paddingY + chartH * offset;
              return (
                <line
                  key={offset}
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Fills */}
            {posArea && <path d={posArea} fill="url(#prominentPosGrad)" />}

            {/* Spline Lines */}
            <path d={posPath} fill="none" stroke="#16a34a" strokeWidth="2.5" />
            <path d={negPath} fill="none" stroke="#dc2626" strokeWidth="2.5" />
            <path d={mixPath} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />

            {/* Interactive Data Dots */}
            {posPoints.map((pt, idx) => (
              <circle
                key={`pos-pt-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={activePoint?.index === idx ? 5 : 3}
                fill="#16a34a"
                stroke="#ffffff"
                strokeWidth="2"
                className="chart-dot"
                onMouseEnter={() => setActivePoint({ index: idx, ...data[idx] })}
                onMouseLeave={() => setActivePoint(null)}
              />
            ))}

            {/* Date Labels */}
            {data.map((entry, index) => {
              const x = data.length === 1 ? chartW / 2 + paddingX : paddingX + (index / (data.length - 1)) * chartW;
              if (data.length > 8 && index % Math.ceil(data.length / 6) !== 0 && index !== data.length - 1) {
                return null;
              }
              return (
                <text x={x} y={height + 22} textAnchor="middle" className="axis-label" key={entry.key}>
                  {entry.key.slice(5)}
                </text>
              );
            })}
          </svg>

          {/* Interactive Hover Badge (no repetitive legends needed) */}
          {activePoint && (
            <div className="trend-footer-legend">
              <div className="trend-hover-badge">
                <strong>{activePoint.key}:</strong>
                <span className="text-pos">+{activePoint.positive}</span> /
                <span className="text-neg">-{activePoint.negative}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}

// Substantive Lieflat Basics Horizontal Bar Chart (eliminating the thin running lines)
export function HorizontalBarChart({ title, subtitle, data, onSelect, id, limit = 8 }) {
  const visible = data.slice(0, limit);
  const totalCount = visible.reduce((sum, item) => sum + item.count, 0);
  const maximum = Math.max(...visible.map((item) => item.count), 1);

  // Single-source glance presentation to avoid a lonely 800px running line
  if (visible.length === 1) {
    const singleItem = visible[0];
    return (
      <ChartCard title={title} subtitle={subtitle} id={id}>
        <div className="lieflat-glance-card" onClick={() => onSelect?.(singleItem.label)}>
          <div className="glance-metric-box">
            <div className="glance-tag">Primary Source</div>
            <div className="glance-title">{singleItem.label}</div>
            <div className="glance-stat-row">
              <span className="glance-number">{singleItem.count.toLocaleString()}</span>
              <span className="glance-unit">responses (100% of dataset)</span>
            </div>
            <div className="glance-track">
              <div className="glance-fill" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle} id={id}>
      {!visible.length ? (
        <EmptyChart />
      ) : (
        <div className="lieflat-bars-list">
          {visible.map((item, idx) => {
            const pctOfMax = Math.round((item.count / maximum) * 100);
            const pctOfTotal = totalCount ? ((item.count / totalCount) * 100).toFixed(1) : "0.0";
            return (
              <button
                type="button"
                key={item.label}
                className="lieflat-bar-row"
                onClick={() => onSelect?.(item.label)}
                title={`Filter by ${item.label} (${item.count} responses, ${pctOfTotal}% of total)`}
              >
                <div className="lieflat-bar-label-group">
                  <span className="lieflat-rank">#{idx + 1}</span>
                  <span className="lieflat-label-text" title={item.label}>
                    {item.label}
                  </span>
                </div>

                <div className="lieflat-bar-meter">
                  <div className="lieflat-track">
                    <div
                      className="lieflat-fill"
                      style={{ width: `${pctOfMax}%` }}
                    />
                  </div>
                </div>

                <div className="lieflat-value-badge">
                  <span className="val-count">{item.count.toLocaleString()}</span>
                  <span className="val-pct">{pctOfTotal}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}

// Fallback default categories if none provided
const DEFAULT_RADAR_CATEGORIES = [
  { label: "Network", total: 33, positive: 0, negative: 33, mixed: 0 },
  { label: "Washrooms", total: 29, positive: 0, negative: 29, mixed: 0 },
  { label: "Classroom Equipment", total: 22, positive: 0, negative: 22, mixed: 0 },
  { label: "Wifi Block", total: 20, positive: 0, negative: 20, mixed: 0 },
  { label: "Internet Painfully", total: 20, positive: 1, negative: 19, mixed: 0 },
  { label: "Wifi Keeps", total: 20, positive: 0, negative: 20, mixed: 0 },
  { label: "Projector", total: 19, positive: 0, negative: 19, mixed: 0 },
  { label: "Fans Make", total: 18, positive: 0, negative: 18, mixed: 0 },
];

// Topic & Aspect Sentiment Radar Chart Component (Multi-axis Spider Chart with Selected Linings Highlight & No Erasing)
export function TopicSentimentChart({
  data = [],
  baseData = [],
  aspectData = [],
  baseAspectData = [],
  topicData = [],
  baseTopicData = [],
  selectedItem = null,
  selectedSentiment = null,
  viewMode = "aspects",
  onViewModeChange = () => {},
  onSelect = () => {},
  id = "topic-sentiment",
}) {
  const [activeSeries, setActiveSeries] = useState({
    positive: true,
    negative: true,
    mixed: true,
  });
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Base items come from the full unfiltered dataset so filtering never erases spokes!
  const baseItems = useMemo(() => {
    if (viewMode === "aspects") {
      const src = (baseAspectData && baseAspectData.length) ? baseAspectData
        : (aspectData && aspectData.length) ? aspectData
        : (baseData && baseData.length) ? baseData
        : data;
      return src && src.length ? src.slice(0, 8) : DEFAULT_RADAR_CATEGORIES;
    }
    const src = (baseTopicData && baseTopicData.length) ? baseTopicData
      : (topicData && topicData.length) ? topicData
      : (baseData && baseData.length) ? baseData
      : data;
    return src && src.length ? src.slice(0, 8) : DEFAULT_RADAR_CATEGORIES;
  }, [viewMode, baseAspectData, aspectData, baseTopicData, topicData, baseData, data]);

  const currentItems = useMemo(() => {
    return viewMode === "aspects"
      ? (aspectData && aspectData.length ? aspectData : data)
      : (topicData && topicData.length ? topicData : data);
  }, [viewMode, aspectData, topicData, data]);

  // Radar geometry
  const cx = 250;
  const cy = 185;
  const R = 125;
  const N = Math.max(baseItems.length, 3);
  const angleStep = (2 * Math.PI) / N;
  const startAngle = -Math.PI / 2; // top vertex

  // Precompute spokes: always preserve baseline geometry, compute filtered counts for each spoke
  const spokes = useMemo(() => {
    return baseItems.map((baseItem, i) => {
      const name = baseItem.aspect || baseItem.label;
      const angle = startAngle + i * angleStep;

      // Find matching entry in current filtered items
      const match = currentItems.find(
        (c) => (c.aspect || c.label || "").toLowerCase() === name.toLowerCase()
      );

      const baseTotal = baseItem.mentions || baseItem.total || (baseItem.positive + baseItem.negative + baseItem.mixed) || 1;
      const currentTotal = match ? (match.mentions || match.total || (match.positive + match.negative + match.mixed) || 0) : 0;
      const currentPos = match ? (match.positive || 0) : 0;
      const currentNeg = match ? (match.negative || 0) : 0;
      const currentMix = match ? (match.mixed || 0) : 0;

      // If active filter has records for this category, use filtered ratios; otherwise 0, but spoke stays intact!
      const total = currentTotal > 0 ? currentTotal : 0;
      const isFilteredOut = currentTotal === 0 && (currentItems.length > 0 && currentItems.length < baseItems.length);

      // Default baseline ratio when no filters are active
      const effectivePos = total > 0 ? currentPos : (isFilteredOut ? 0 : baseItem.positive || 0);
      const effectiveNeg = total > 0 ? currentNeg : (isFilteredOut ? 0 : baseItem.negative || 0);
      const effectiveMix = total > 0 ? currentMix : (isFilteredOut ? 0 : baseItem.mixed || 0);
      const effectiveTotal = total > 0 ? total : (isFilteredOut ? baseTotal : baseTotal);

      const posPct = effectiveTotal > 0 ? effectivePos / effectiveTotal : 0;
      const negPct = effectiveTotal > 0 ? effectiveNeg / effectiveTotal : 0;
      const mixPct = effectiveTotal > 0 ? effectiveMix / effectiveTotal : 0;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const spokeEnd = { x: cx + R * cos, y: cy + R * sin };
      const labelDist = R + 24;
      const labelPos = { x: cx + labelDist * cos, y: cy + labelDist * sin };

      const posPt = { x: cx + posPct * R * cos, y: cy + posPct * R * sin };
      const negPt = { x: cx + negPct * R * cos, y: cy + negPct * R * sin };
      const mixPt = { x: cx + mixPct * R * cos, y: cy + mixPct * R * sin };

      const isSelected = Boolean(
        selectedItem &&
        (String(selectedItem).trim().toLowerCase() === String(name).trim().toLowerCase() ||
         String(selectedItem).trim().toLowerCase().includes(String(name).trim().toLowerCase()) ||
         String(name).trim().toLowerCase().includes(String(selectedItem).trim().toLowerCase()))
      );

      return {
        label: name,
        baseTotal,
        total: currentTotal,
        positive: currentPos,
        negative: currentNeg,
        mixed: currentMix,
        isFilteredOut,
        isSelected,
        angle,
        cos,
        sin,
        posPct,
        negPct,
        mixPct,
        spokeEnd,
        labelPos,
        posPt,
        negPt,
        mixPt,
        nss: effectiveTotal > 0 ? Math.round((posPct - negPct) * 100) : 0,
      };
    });
  }, [baseItems, currentItems, selectedItem, cx, cy, R, angleStep, startAngle]);

  // Build polygon path strings
  const buildPolyPath = (key) => {
    if (!activeSeries[key]) return "";
    return spokes
      .map((s, idx) => {
        const pt = key === "positive" ? s.posPt : key === "negative" ? s.negPt : s.mixPt;
        return `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      })
      .concat("Z")
      .join(" ");
  };

  const posPolyPath = buildPolyPath("positive");
  const negPolyPath = buildPolyPath("negative");
  const mixPolyPath = buildPolyPath("mixed");

  const toggleSeries = (key) => {
    setActiveSeries((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.positive && !next.negative && !next.mixed) {
        return prev;
      }
      return next;
    });
  };

  return (
    <ChartCard
      title={viewMode === "aspects" ? "Aspect Sentiment Breakdown" : "Topic Sentiment Breakdown"}
      subtitle={
        viewMode === "aspects"
          ? "Multi-axis radar view of sentiment ratios across primary feedback aspects"
          : "Multi-axis radar view of sentiment ratios across primary feedback topics"
      }
      className="topic-sentiment-card"
      id={id}
    >
      <div className="radar-card-container">
        {/* Top Interactive Legend / Series Toggles */}
        <div className="radar-legend-bar">
          <button
            type="button"
            className={`radar-legend-btn ${activeSeries.positive ? "active pos" : "inactive"}`}
            onClick={() => toggleSeries("positive")}
          >
            <span className="radar-dot pos" />
            <span>Positive Ratio</span>
          </button>
          <button
            type="button"
            className={`radar-legend-btn ${activeSeries.negative ? "active neg" : "inactive"}`}
            onClick={() => toggleSeries("negative")}
          >
            <span className="radar-dot neg" />
            <span>Negative Ratio</span>
          </button>
          <button
            type="button"
            className={`radar-legend-btn ${activeSeries.mixed ? "active mix" : "inactive"}`}
            onClick={() => toggleSeries("mixed")}
          >
            <span className="radar-dot mix" />
            <span>Mixed / Neutral</span>
          </button>
        </div>

        <div className="radar-body-layout">
          {/* Left: Interactive SVG Radar Chart */}
          <div className="radar-svg-area">
            <svg viewBox="0 0 500 370" className="radar-main-svg">
              <defs>
                <filter id="radarBlurGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="10" />
                </filter>
                <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background ambient circular glow with 10% blur */}
              <circle cx={cx} cy={cy} r={R} fill="url(#radarCenterGlow)" filter="url(#radarBlurGlow)" />

              {/* Concentric Web Grid Polygons */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => {
                const polyPoints = spokes
                  .map((s) => `${(cx + level * R * s.cos).toFixed(1)},${(cy + level * R * s.sin).toFixed(1)}`)
                  .join(" ");

                return (
                  <g key={`level-${level}`}>
                    <polygon
                      points={polyPoints}
                      fill="none"
                      stroke={level === 1.0 ? "#cbd5e1" : "#e2e8f0"}
                      strokeWidth={level === 1.0 ? "1.5" : "1"}
                      strokeDasharray={level === 1.0 ? "none" : "3 3"}
                    />
                    {/* Level Percentage Label on top vertical axis */}
                    <text
                      x={cx + 6}
                      y={cy - level * R + 4}
                      className="radar-grid-pct"
                    >
                      {Math.round(level * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* Spoke Lines from Center to Edges - Selected linings highlighted! */}
              {spokes.map((s) => {
                const isHovered = hoveredTopic === s.label;
                const isHighlighted = s.isSelected || isHovered;

                return (
                  <g key={`spoke-${s.label}`}>
                    {/* Ambient glow ray behind highlighted lining */}
                    {isHighlighted && (
                      <line
                        x1={cx}
                        y1={cy}
                        x2={s.spokeEnd.x}
                        y2={s.spokeEnd.y}
                        stroke="rgba(37, 99, 235, 0.25)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                    )}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={s.spokeEnd.x}
                      y2={s.spokeEnd.y}
                      stroke={isHighlighted ? "#2563eb" : "#e2e8f0"}
                      strokeWidth={isHighlighted ? "3.5" : "1"}
                      strokeLinecap="round"
                      className={`radar-axis-line ${isHighlighted ? "highlighted" : ""}`}
                    />
                    {isHighlighted && (
                      <circle
                        cx={s.spokeEnd.x}
                        cy={s.spokeEnd.y}
                        r="5.5"
                        fill="#2563eb"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}

              {/* Sentiment Filled Polygons - Linings highlighted according to selected sentiment */}
              {mixPolyPath && activeSeries.mixed && (
                <path
                  d={mixPolyPath}
                  fill="rgba(217, 119, 6, 0.15)"
                  stroke="#d97706"
                  strokeWidth={selectedSentiment === "mixed" ? 3.5 : 2}
                  strokeDasharray={selectedSentiment === "mixed" ? "none" : "4 4"}
                  strokeOpacity={selectedSentiment && selectedSentiment !== "mixed" ? 0.25 : 1}
                  fillOpacity={selectedSentiment && selectedSentiment !== "mixed" ? 0.04 : 0.15}
                  className="radar-poly"
                />
              )}
              {negPolyPath && activeSeries.negative && (
                <path
                  d={negPolyPath}
                  fill="rgba(220, 38, 38, 0.22)"
                  stroke="#dc2626"
                  strokeWidth={selectedSentiment === "negative" ? 3.5 : 2.5}
                  strokeOpacity={selectedSentiment && selectedSentiment !== "negative" ? 0.25 : 1}
                  fillOpacity={selectedSentiment && selectedSentiment !== "negative" ? 0.05 : 0.22}
                  className="radar-poly"
                />
              )}
              {posPolyPath && activeSeries.positive && (
                <path
                  d={posPolyPath}
                  fill="rgba(22, 163, 74, 0.22)"
                  stroke="#16a34a"
                  strokeWidth={selectedSentiment === "positive" ? 3.5 : 2.5}
                  strokeOpacity={selectedSentiment && selectedSentiment !== "positive" ? 0.25 : 1}
                  fillOpacity={selectedSentiment && selectedSentiment !== "positive" ? 0.05 : 0.22}
                  className="radar-poly"
                />
              )}

              {/* Data Point Dots & Hover Hotspots */}
              {spokes.map((s) => {
                return (
                  <g key={`pts-${s.label}`}>
                    {/* Mixed Dot */}
                    {activeSeries.mixed && (
                      <circle
                        cx={s.mixPt.x}
                        cy={s.mixPt.y}
                        r={hoveredPoint === `mix-${s.label}` ? 6 : 4}
                        fill="#ffffff"
                        stroke="#d97706"
                        strokeWidth="2"
                        className="radar-pt"
                        onMouseEnter={() => setHoveredPoint(`mix-${s.label}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )}
                    {/* Positive Dot */}
                    {activeSeries.positive && (
                      <circle
                        cx={s.posPt.x}
                        cy={s.posPt.y}
                        r={hoveredPoint === `pos-${s.label}` ? 6.5 : 4.5}
                        fill="#ffffff"
                        stroke="#16a34a"
                        strokeWidth="2.5"
                        className="radar-pt"
                        onMouseEnter={() => setHoveredPoint(`pos-${s.label}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )}
                    {/* Negative Dot */}
                    {activeSeries.negative && (
                      <circle
                        cx={s.negPt.x}
                        cy={s.negPt.y}
                        r={hoveredPoint === `neg-${s.label}` ? 6.5 : 4.5}
                        fill="#ffffff"
                        stroke="#dc2626"
                        strokeWidth="2.5"
                        className="radar-pt"
                        onMouseEnter={() => setHoveredPoint(`neg-${s.label}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )}
                  </g>
                );
              })}

              {/* Spoke End Topic / Aspect Labels - Selected linings highlighted! */}
              {spokes.map((s) => {
                const isHovered = hoveredTopic === s.label;
                const isHighlighted = s.isSelected || isHovered;
                const textAnchor = Math.abs(s.cos) < 0.2 ? "middle" : s.cos > 0.2 ? "start" : "end";
                const yOffset = s.sin < -0.8 ? -8 : s.sin > 0.8 ? 14 : 0;

                return (
                  <g
                    key={`label-${s.label}`}
                    className="radar-label-group"
                    cursor="pointer"
                    onClick={() => onSelect(s.label)}
                    onMouseEnter={() => setHoveredTopic(s.label)}
                    onMouseLeave={() => setHoveredTopic(null)}
                  >
                    <text
                      x={s.labelPos.x}
                      y={s.labelPos.y + yOffset}
                      textAnchor={textAnchor}
                      className={`radar-axis-title ${isHighlighted ? "selected" : ""}`}
                    >
                      {s.label}
                    </text>
                    <text
                      x={s.labelPos.x}
                      y={s.labelPos.y + yOffset + 13}
                      textAnchor={textAnchor}
                      className="radar-axis-sub"
                    >
                      {s.total > 0 ? `${s.total} active` : `${s.baseTotal} total`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Topic / Aspect Sentiment Audit List & Net Sentiment Leaderboard */}
          <div className="radar-sidebar">
            <div className="radar-sidebar-header">
              <span>{viewMode === "aspects" ? "Aspect" : "Topic"}</span>
              <span>Net Score & Share</span>
            </div>
            <div className="radar-topic-list">
              {spokes.map((item, idx) => {
                const isSelected = item.isSelected;
                const isHovered = hoveredTopic === item.label;
                const isHighlighted = isSelected || isHovered;
                const posPercent = Math.round(item.posPct * 100);
                const negPercent = Math.round(item.negPct * 100);
                const mixPercent = Math.round(item.mixPct * 100);

                return (
                  <div
                    key={item.label}
                    className={`radar-topic-row ${isHighlighted ? (isSelected ? "selected" : "hovered") : ""} ${item.isFilteredOut ? "filtered-out" : ""}`}
                    onClick={() => onSelect(item.label)}
                    onMouseEnter={() => setHoveredTopic(item.label)}
                    onMouseLeave={() => setHoveredTopic(null)}
                    title={`Filter by ${item.label}: ${item.positive} Pos, ${item.negative} Neg, ${item.mixed} Mix (${item.total} active / ${item.baseTotal} total)`}
                  >
                    <div className="radar-topic-row-top">
                      <div className="radar-topic-meta">
                        <span className="radar-topic-rank">#{idx + 1}</span>
                        <span className="radar-topic-name" title={item.label}>
                          {item.label}
                        </span>
                      </div>
                      <div className="radar-stat-badge-wrap">
                        {item.isFilteredOut ? (
                          <span className="nss-badge neutral">0 active</span>
                        ) : (
                          <span className={`nss-badge ${item.nss >= 0 ? "pos" : "neg"}`}>
                            {item.nss >= 0 ? `+${item.nss}%` : `${item.nss}%`} NSS
                          </span>
                        )}
                        <span className="radar-stat-count">
                          {item.total > 0 ? `${item.total} active` : `${item.baseTotal} total`}
                        </span>
                      </div>
                    </div>

                    <div className="radar-topic-row-bottom">
                      <div className="radar-bar-track">
                        {posPercent > 0 && (
                          <span
                            className="bar-pos"
                            style={{ width: `${posPercent}%` }}
                            title={`Positive: ${posPercent}%`}
                          />
                        )}
                        {mixPercent > 0 && (
                          <span
                            className="bar-mix"
                            style={{ width: `${mixPercent}%` }}
                            title={`Mixed: ${mixPercent}%`}
                          />
                        )}
                        {negPercent > 0 && (
                          <span
                            className="bar-neg"
                            style={{ width: `${negPercent}%` }}
                            title={`Negative: ${negPercent}%`}
                          />
                        )}
                      </div>
                      <span className="radar-ratio-label">
                        {posPercent}% Pos · {negPercent}% Neg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}



