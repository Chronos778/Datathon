import { ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

export function ChartContainer({ config = {}, className = "", children, style = {}, height = 260, ...props }) {
  // Generate CSS variables from config
  const colorVars = Object.entries(config).reduce((acc, [key, item]) => {
    if (item.color) {
      acc[`--color-${key}`] = item.color;
    }
    return acc;
  }, {});

  return (
    <div
      className={`chart-container-root ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof height === "number" ? `${height}px` : height,
        position: "relative",
        ...colorVars,
        ...style,
      }}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function ChartTooltip({ content, ...props }) {
  return <RechartsTooltip content={content} {...props} />;
}

export function ChartTooltipContent({ active, payload, label, indicator = "dot", hideLabel = false }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="chart-tooltip-content">
      {!hideLabel && label && <div className="chart-tooltip-label">{label}</div>}
      <div className="chart-tooltip-items">
        {payload.map((item, index) => {
          const color = item.stroke || item.fill || item.color || "#3b82f6";
          return (
            <div key={`item-${index}`} className="chart-tooltip-row">
              <div className="chart-tooltip-entry">
                {indicator === "line" ? (
                  <span className="tooltip-indicator-line" style={{ backgroundColor: color }} />
                ) : (
                  <span className="tooltip-indicator-dot" style={{ backgroundColor: color }} />
                )}
                <span className="tooltip-name">{item.name || item.dataKey}:</span>
              </div>
              <span className="tooltip-val">{item.value?.toLocaleString?.() ?? item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
