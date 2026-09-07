import { useEffect } from "react";
import { Bot, Sparkles, X } from "lucide-react";
import AiChatbot from "./AiChatbot";

export default function AiDrawer({
  isOpen,
  onClose,
  records = [],
  datasetName = "Active Dataset",
  initialQuery = "",
}) {
  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ai-drawer-root">
      {/* Backdrop overlay */}
      <div className="ai-drawer-overlay" onClick={onClose} />

      {/* Slide-over Right Panel */}
      <div className="ai-drawer-panel" role="dialog" aria-modal="true" aria-label="AI Copilot">
        {/* Drawer Header */}
        <div className="ai-drawer-header">
          <div className="ai-drawer-brand">
            <div className="ai-drawer-icon">
              <Bot size={20} />
            </div>
            <div>
              <div className="ai-drawer-title-row">
                <h3>AI Feedback Intelligence</h3>
                <span className="ai-live-badge">
                  <Sparkles size={11} /> Live Copilot
                </span>
              </div>
              <p className="ai-drawer-sub">
                {records.length.toLocaleString()} feedback items analyzed
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ai-drawer-close"
            onClick={onClose}
            aria-label="Close AI copilot"
            title="Close AI Copilot"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="ai-drawer-body">
          <AiChatbot
            records={records}
            datasetName={datasetName}
            initialQuery={initialQuery}
          />
        </div>
      </div>
    </div>
  );
}
