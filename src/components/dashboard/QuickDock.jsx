import { useState, useRef, useEffect } from "react";
import {
  CalendarDays,
  Paintbrush,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";

export default function QuickDock({
  filters,
  options,
  onFilter,
  onReset,
  resultCount,
  onOpenAi,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const popoverRef = useRef(null);
  const brushBtnRef = useRef(null);

  const isFiltered = Object.values(filters).some((val) => val !== "all");

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showPicker &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        brushBtnRef.current &&
        !brushBtnRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (onOpenAi) {
      onOpenAi(aiQuery.trim());
      setAiQuery("");
    }
  };

  return (
    <aside className="quick-dock-container" aria-label="Quick actions dock">
      {/* Floating Picker & Sorter Popover */}
      {showPicker && (
        <div className="dock-picker-popover" ref={popoverRef}>
          <div className="dock-picker-header">
            <div className="dock-picker-title">
              <Paintbrush size={14} className="icon-blue" />
              <span>Filter & Sorter Pickers</span>
            </div>
            <button
              type="button"
              className="dock-popover-close"
              onClick={() => setShowPicker(false)}
              title="Close picker"
            >
              <X size={14} />
            </button>
          </div>

          <div className="dock-picker-grid">
            {/* DATE Picker */}
            <div className="dock-picker-item">
              <span className="dock-picker-label">DATE</span>
              <div className="dock-select-wrapper with-icon">
                <CalendarDays size={14} className="dock-select-icon" />
                <select
                  value={filters.date}
                  onChange={(e) => onFilter("date", e.target.value)}
                  className="dock-select"
                >
                  <option value="all">All dates</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* SENTIMENT Picker */}
            <div className="dock-picker-item">
              <span className="dock-picker-label">SENTIMENT</span>
              <div className="dock-select-wrapper">
                <select
                  value={filters.sentiment}
                  onChange={(e) => onFilter("sentiment", e.target.value)}
                  className="dock-select"
                >
                  <option value="all">All sentiment</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="mixed">Mixed / neutral</option>
                </select>
              </div>
            </div>

            {/* EMOTION Picker */}
            <div className="dock-picker-item">
              <span className="dock-picker-label">EMOTION</span>
              <div className="dock-select-wrapper">
                <select
                  value={filters.emotion}
                  onChange={(e) => onFilter("emotion", e.target.value)}
                  className="dock-select"
                >
                  <option value="all">All emotion</option>
                  {(options.emotions || []).map((opt) => {
                    const val = opt.value ?? opt;
                    const lbl = opt.label ?? opt;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* TOPIC Picker */}
            <div className="dock-picker-item">
              <span className="dock-picker-label">TOPIC</span>
              <div className="dock-select-wrapper">
                <select
                  value={filters.topic}
                  onChange={(e) => onFilter("topic", e.target.value)}
                  className="dock-select"
                >
                  <option value="all">All topic</option>
                  {(options.topics || []).map((opt) => {
                    const val = opt.value ?? opt;
                    const lbl = opt.label ?? opt;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          <div className="dock-picker-footer">
            <span className="dock-picker-count">
              {resultCount.toLocaleString()} matching responses
            </span>
            {isFiltered && (
              <button
                type="button"
                className="dock-picker-reset-link"
                onClick={() => {
                  onReset();
                  setShowPicker(false);
                }}
              >
                <RotateCcw size={12} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Glassmorphic Dock Bar */}
      <div className="quick-dock-bar">
        {/* Button 1: Brush Icon with Tooltip */}
        <div className="dock-item-tooltip-wrap">
          <button
            type="button"
            ref={brushBtnRef}
            className={`dock-icon-btn ${showPicker ? "active" : ""} ${isFiltered ? "has-filter" : ""}`}
            onClick={() => setShowPicker(!showPicker)}
            aria-label="Filter and sort pickers"
          >
            <Paintbrush size={18} />
            {isFiltered && <span className="dock-active-indicator" />}
          </button>
          <span className="dock-tooltip">Filter & Sort Pickers</span>
        </div>

        {/* Divider */}
        <div className="dock-divider" />

        {/* Button 2: Reset View Button */}
        <div className="dock-item-tooltip-wrap">
          <button
            type="button"
            className={`dock-action-btn ${isFiltered ? "active" : ""}`}
            onClick={onReset}
            title="Reset filters and restore full view"
          >
            <RotateCcw size={15} />
            <span>Reset view</span>
          </button>
          <span className="dock-tooltip">Restore All 1,200 Rows</span>
        </div>

        {/* Divider */}
        <div className="dock-divider" />

        {/* Button 3: Adhered AI Input Box */}
        <form className="dock-ai-form" onSubmit={handleAiSubmit}>
          <div className="dock-ai-sparkle">
            <Sparkles size={16} />
          </div>
          <input
            type="text"
            className="dock-ai-input"
            placeholder="Ask AI about this feedback data..."
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onFocus={() => {
              // Clicking/focusing allows instant typing
            }}
          />
          <button
            type="submit"
            className="dock-ai-submit"
            title="Open AI chat & ask question"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
}
