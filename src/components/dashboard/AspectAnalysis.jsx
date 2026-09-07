import { EmptyChart } from "./Charts";

export default function AspectAnalysis({ rows, onSelect }) {
  const maxMentions = Math.max(...rows.map((r) => r.mentions), 1);

  return (
    <article className="analytics-card aspect-card pbi-matrix-card">
      <div className="chart-heading pbi-heading">
        <div>
          <h2>Aspect Analysis Matrix</h2>
          <p>Aspect classifications with Power BI conditional formatting and Net Sentiment Scores</p>
        </div>
        <span className="pbi-tag">Matrix Visual</span>
      </div>

      {!rows.length ? (
        <EmptyChart />
      ) : (
        <div className="pbi-table-container">
          <table className="pbi-aspect-table">
            <thead>
              <tr>
                <th className="th-aspect">Aspect Dimension</th>
                <th className="th-mentions">Mentions (Data Bar)</th>
                <th className="th-metric">Pos</th>
                <th className="th-metric">Neg</th>
                <th className="th-metric">Mix</th>
                <th className="th-net">Net Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row) => {
                const barWidth = Math.round((row.mentions / maxMentions) * 100);
                const net = row.netScore ?? (row.positive - row.negative);
                const isPosNet = net >= 0;

                return (
                  <tr
                    key={row.aspect}
                    onClick={() => onSelect(row.aspect)}
                    title={`Filter by aspect: ${row.aspect}`}
                  >
                    {/* Dimension Name */}
                    <td className="td-aspect">
                      <button type="button" className="pbi-row-btn">
                        {row.aspect}
                      </button>
                    </td>

                    {/* Mentions with Power BI Data Bar */}
                    <td className="td-mentions">
                      <div className="pbi-data-bar-wrap">
                        <div
                          className="pbi-data-bar-fill"
                          style={{ width: `${barWidth}%` }}
                        />
                        <span className="pbi-data-bar-value">{row.mentions.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Positive Badge */}
                    <td className="td-metric">
                      <span className="pbi-chip pos">{row.positive}</span>
                    </td>

                    {/* Negative Badge */}
                    <td className="td-metric">
                      <span className="pbi-chip neg">{row.negative}</span>
                    </td>

                    {/* Mixed Badge */}
                    <td className="td-metric">
                      <span className="pbi-chip mix">{row.mixed}</span>
                    </td>

                    {/* Net Sentiment Score */}
                    <td className="td-net">
                      <span className={`pbi-nss-pill ${isPosNet ? "pos" : "neg"}`}>
                        {isPosNet ? `+${net}` : net}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
