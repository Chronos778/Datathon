import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import AiDrawer from "../dashboard/AiDrawer";

export default function FloatingChatWidget({ analysis = null }) {
  const [isOpen, setIsOpen] = useState(false);


  const records = analysis?.feedback || analysis?.data || [];
  const datasetName = analysis?.dataset?.name || "FeedSense Feedback Intelligence";

  return (
    <>
      {/* Floating Action Button (FAB) at bottom-right */}
      <aside className="floating-chat-launcher-root" aria-label="AI Chatbot Launcher">
        <button
          type="button"
          className={`floating-chat-fab ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Copilot" : "Open AI Feedback Copilot"}
          title={isOpen ? "Close AI Copilot" : "Ask AI Copilot"}
        >
          <div className="fab-glow-ring" />
          <div className="fab-icon-wrap">
            {isOpen ? <X size={20} /> : <Sparkles size={20} className="fab-sparkle" />}
          </div>
          <span className="fab-label">AI Copilot</span>
          <span className="fab-pulse-dot" />
        </button>
      </aside>

      {/* Slide-over Right Side AI Chatbot Drawer */}
      <AiDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        records={records}
        datasetName={datasetName}
      />
    </>
  );
}
