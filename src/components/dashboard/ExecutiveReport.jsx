import { useMemo } from "react";
import {
  AlertCircle,
  Award,
  CheckSquare,
  Compass,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { synthesizeDecisions } from "../../lib/clientAnalyzer";

export default function ExecutiveReport({ records = [], datasetName = "Feedback Report" }) {
  const decisions = useMemo(() => synthesizeDecisions(records), [records]);

  const reportData = useMemo(() => {
    let pos = 0, neg = 0, mix = 0;
    const topicStats = {};
    const quotes = { strengths: [], weaknesses: [] };

    records.forEach((r) => {
      const s = r.sentiment.toLowerCase();
      if (s.includes("pos")) {
        pos += 1;
        if (quotes.strengths.length < 3) quotes.strengths.push(r.feedback);
      } else if (s.includes("neg")) {
        neg += 1;
        if (quotes.weaknesses.length < 3) quotes.weaknesses.push(r.feedback);
      } else {
        mix += 1;
      }

      r.topics.forEach((t) => {
        topicStats[t] ||= { total: 0, pos: 0, neg: 0 };
        topicStats[t].total += 1;
        if (s.includes("pos")) topicStats[t].pos += 1;
        if (s.includes("neg")) topicStats[t].neg += 1;
      });
    });

    const total = records.length || 1;
    const posRate = Math.round((pos / total) * 100);
    const negRate = Math.round((neg / total) * 100);
    const nss = posRate - negRate;

    const topStrengths = Object.entries(topicStats)
      .filter(([, s]) => s.pos > s.neg)
      .sort((a, b) => b[1].pos - a[1].pos)
      .slice(0, 3)
      .map(([name, s]) => ({ name, posCount: s.pos, rate: Math.round((s.pos / s.total) * 100) }));

    const topWeaknesses = Object.entries(topicStats)
      .filter(([, s]) => s.neg > 0)
      .sort((a, b) => b[1].neg - a[1].neg)
      .slice(0, 3)
      .map(([name, s]) => ({ name, negCount: s.neg, rate: Math.round((s.neg / s.total) * 100) }));

    return {
      total: records.length,
      pos,
      neg,
      mix,
      posRate,
      negRate,
      nss,
      topStrengths,
      topWeaknesses,
      quotes,
    };
  }, [records]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ["feedback_id", "date", "source", "sentiment", "sentiment_score", "emotion", "topics", "feedback"];
    const rows = records.map((r) => [
      r.feedback_id,
      r.date,
      `"${(r.source || "").replace(/"/g, '""')}"`,
      r.sentiment,
      r.sentiment_score,
      r.emotion,
      `"${(r.topics || []).join("; ").replace(/"/g, '""')}"`,
      `"${(r.feedback || "").replace(/"/g, '""')}"`,
    ]);

    const content = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executive-feedback-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Generate tab-delimited XLS file that opens natively in Microsoft Excel
    const headers = ["ID", "Date", "Source", "Sentiment", "Confidence", "Emotion", "Topics", "Feedback Text"];
    const rows = records.map((r) => [
      r.feedback_id,
      r.date,
      r.source,
      r.sentiment,
      r.sentiment_confidence,
      r.emotion,
      (r.topics || []).join("; "),
      r.feedback,
    ]);

    const content = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executive-feedback-intelligence-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="executive-report-view printable-report">
      {/* Report Actions Header */}
      <div className="report-action-ribbon no-print">
        <div className="report-title-meta">
          <span className="badge-ai-flow">
            <FileText size={13} /> Executive Summary Briefing
          </span>
          <h2>Feedback Intelligence Executive Report</h2>
          <p>
            Generated for {datasetName} • {records.length} Total Verified Responses • Generated on {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
          </p>
        </div>

        <div className="report-btn-group">
          <button type="button" className="btn-secondary-dark" onClick={handleExportCsv}>
            <Download size={14} /> Export CSV
          </button>
          <button type="button" className="btn-secondary-dark" onClick={handleExportExcel}>
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button type="button" className="btn-primary-glow" onClick={handlePrint}>
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Briefing Card */}
      <div className="shadcn-card report-card">
        <div className="briefing-header">
          <Sparkles size={18} className="text-emerald" />
          <h3>Executive Briefing</h3>
        </div>
        <p className="briefing-lead">
          Analysis of <strong>{reportData.total} responses</strong> demonstrates an overall Net Sentiment Score (NSS) of{" "}
          <span className={reportData.nss >= 0 ? "text-emerald" : "text-rose"}>
            {reportData.nss > 0 ? `+${reportData.nss}` : reportData.nss}
          </span>
          . While <strong>{reportData.posRate}%</strong> of respondents express satisfaction,{" "}
          <strong>{reportData.negRate}%</strong> identified critical friction points requiring leadership intervention.
        </p>

        {/* Highlight Metrics */}
        <div className="report-metrics-grid">
          <div className="rep-stat-box">
            <span className="stat-label">Total Responses</span>
            <span className="stat-value">{reportData.total}</span>
            <span className="stat-sub">100% Processed</span>
          </div>
          <div className="rep-stat-box">
            <span className="stat-label">Positive Sentiment</span>
            <span className="stat-value text-emerald">{reportData.posRate}%</span>
            <span className="stat-sub">{reportData.pos} responses</span>
          </div>
          <div className="rep-stat-box">
            <span className="stat-label">Negative Sentiment</span>
            <span className="stat-value text-rose">{reportData.negRate}%</span>
            <span className="stat-sub">{reportData.neg} complaints</span>
          </div>
          <div className="rep-stat-box">
            <span className="stat-label">Net Sentiment Score</span>
            <span className="stat-value text-blue">{reportData.nss}</span>
            <span className="stat-sub">Range: -100 to +100</span>
          </div>
        </div>

        {/* SWOT Grid */}
        <div className="swot-grid">
          <div className="swot-cell swot-s">
            <div className="swot-header">
              <Award size={16} />
              <h4>Strengths</h4>
            </div>
            <ul>
              {reportData.topStrengths.map((s, idx) => (
                <li key={idx}>
                  <strong>{s.name}</strong>: {s.rate}% positive sentiment ({s.posCount} endorsements)
                </li>
              ))}
            </ul>
          </div>

          <div className="swot-cell swot-w">
            <div className="swot-header">
              <AlertCircle size={16} />
              <h4>Weaknesses</h4>
            </div>
            <ul>
              {reportData.topWeaknesses.map((w, idx) => (
                <li key={idx}>
                  <strong>{w.name}</strong>: {w.negCount} complaints recorded
                </li>
              ))}
            </ul>
          </div>

          <div className="swot-cell swot-o">
            <div className="swot-header">
              <Compass size={16} />
              <h4>Opportunities</h4>
            </div>
            <ul>
              <li>Modernize digital notification channels to proactively alert users before issues escalate.</li>
              <li>Empower frontline staff with instant self-resolution authority for recurring requests.</li>
            </ul>
          </div>

          <div className="swot-cell swot-t">
            <div className="swot-header">
              <ShieldAlert size={16} />
              <h4>Threats</h4>
            </div>
            <ul>
              {decisions.slice(0, 2).map((d, idx) => (
                <li key={idx}>
                  <strong>{d.topic} ({d.severity})</strong>: Risk of negative user churn if not resolved within 14 days.
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 30-Day Executive Action Checklist */}
        <div className="action-checklist-box">
          <div className="checklist-title">
            <CheckSquare size={16} className="text-emerald" />
            <h4>Recommended 30-Day Action Checklist</h4>
          </div>
          <div className="checklist-items">
            {decisions.slice(0, 3).map((d, idx) => (
              <div key={idx} className="check-row">
                <span className="check-num">{idx + 1}</span>
                <div className="check-content">
                  <strong>{d.topic} Remediation ({d.severity} Priority):</strong> {d.recommendation}
                  <div className="check-impact">{d.expectedImpact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
