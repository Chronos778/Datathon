import { Download, Sparkles, Upload } from "lucide-react";
import AppBrand from "../AppBrand";

const sections = ["Overview", "Sentiment", "Topics", "Feedback"];

export default function DashboardHeader({
  activeSection,
  onSection,
  onHome,
  onUploadNew,
  onExport,
  onOpenAi,
}) {
  return (
    <header className="dashboard-header">
      <AppBrand onClick={onHome} />
      <nav aria-label="Dashboard sections">
        {sections.map((section) => (
          <button
            className={activeSection === section.toLowerCase() ? "active" : ""}
            type="button"
            key={section}
            onClick={() => onSection(section.toLowerCase())}
          >
            {section}
          </button>
        ))}
      </nav>
      <div className="dashboard-actions">
        {onOpenAi && (
          <button
            className="outline-button small ai-header-btn"
            type="button"
            onClick={onOpenAi}
            title="Open AI Feedback Copilot"
          >
            <Sparkles size={14} className="icon-purple" /> AI Copilot
          </button>
        )}
        <button className="outline-button small" type="button" onClick={onUploadNew}>
          <Upload size={15} /> Upload new
        </button>
        <button className="primary-button compact" type="button" onClick={onExport}>
          <Download size={15} /> Export
        </button>
      </div>
    </header>
  );
}

