import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { sentimentKey } from "../../lib/filters";

const ITEMS_PER_PAGE = 10;

export default function FeedbackExplorer({
  records,
  search,
  onSearch,
  filters,
  options,
  onFilter,
  onOpen,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

  const totalRecords = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return records.slice(start, start + ITEMS_PER_PAGE);
  }, [records, currentPage]);

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, totalRecords);

  const goToPage = (page) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
  };

  // Generate visible page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <article className="analytics-card feedback-explorer-card" id="feedback">
      {/* Explorer Header */}
      <div className="explorer-card-header">
        <div className="explorer-title-group">
          <div className="explorer-badge">
            <SlidersHorizontal size={13} />
            <span>Response Registry</span>
          </div>
          <h2>Feedback Explorer</h2>
          <p>Click any response to inspect sentiment breakdown, keywords, and detected aspects.</p>
        </div>
        <div className="explorer-meta-badge">
          <span>{totalRecords.toLocaleString()} verified entries</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="explorer-filter-bar">
        <div className="explorer-search-box">
          <Search size={14} className="search-icon" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search responses, keywords, or topics..."
            className="explorer-search-input"
          />
          {search && (
            <button
              type="button"
              className="clear-btn"
              onClick={() => onSearch("")}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="explorer-selects-row">
          <div className="explorer-select-wrap">
            <select
              value={filters.sentiment}
              onChange={(event) => onFilter("sentiment", event.target.value)}
              className="explorer-select"
            >
              <option value="all">All sentiments</option>
              {options.sentiments && options.sentiments.length > 0 ? (
                options.sentiments.map((item) => {
                  const val = typeof item === "object" ? item.value : item;
                  const lab = typeof item === "object" ? item.label : item;
                  return (
                    <option key={val} value={val}>
                      {lab}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="mixed">Mixed / Neutral</option>
                </>
              )}
            </select>
          </div>

          <div className="explorer-select-wrap">
            <select
              value={filters.source}
              onChange={(event) => onFilter("source", event.target.value)}
              className="explorer-select"
            >
              <option value="all">All sources</option>
              {(options.sources || []).map((item) => {
                const val = typeof item === "object" ? item.value : item;
                const lab = typeof item === "object" ? item.label : item;
                return (
                  <option key={val} value={val}>
                    {lab}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="explorer-select-wrap">
            <select
              value={filters.topic}
              onChange={(event) => onFilter("topic", event.target.value)}
              className="explorer-select"
            >
              <option value="all">All topics</option>
              {(options.topics || []).map((item) => {
                const val = typeof item === "object" ? item.value : item;
                const lab = typeof item === "object" ? item.label : item;
                return (
                  <option key={val} value={val}>
                    {lab}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="explorer-select-wrap">
            <select
              value={filters.emotion}
              onChange={(event) => onFilter("emotion", event.target.value)}
              className="explorer-select"
            >
              <option value="all">All emotions</option>
              {(options.emotions || []).map((item) => {
                const val = typeof item === "object" ? item.value : item;
                const lab = typeof item === "object" ? item.label : item;
                return (
                  <option key={val} value={val}>
                    {lab}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Records Table / List */}
      {!records.length ? (
        <div className="no-feedback-state">
          <Filter size={24} />
          <strong>No feedback matches your current criteria</strong>
          <span>Try clearing search terms or resetting filter dropdowns above.</span>
        </div>
      ) : (
        <div className="compact-feedback-list">
          {paginatedRecords.map((record) => {
            const sensKey = sentimentKey(record.sentiment);
            return (
              <button
                className="compact-feedback-row"
                type="button"
                onClick={() => onOpen(record)}
                key={record.feedback_id}
              >
                <div className="compact-row-left">
                  <span className={`compact-sentiment-badge badge-${sensKey}`}>
                    <span className="dot" />
                    {record.sentiment}
                  </span>
                  <div className="compact-text-wrap">
                    <p className="compact-feedback-text">“{record.feedback}”</p>
                    <div className="compact-subline">
                      <span className="source-tag">{record.source}</span>
                      <span className="separator">•</span>
                      <span className="date-tag">
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        }).format(new Date(record.date))}
                      </span>
                      {record.emotion && record.emotion !== "Unspecified" && (
                        <>
                          <span className="separator">•</span>
                          <span className="emotion-tag">{record.emotion}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="compact-row-right">
                  <div className="compact-topics">
                    {record.topics.slice(0, 2).map((topic) => (
                      <span key={topic} className="topic-tag-pill">
                        {topic}
                      </span>
                    ))}
                  </div>
                  <ChevronRight size={15} className="row-chevron" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalRecords > 0 && (
        <div className="explorer-pagination-footer">
          <div className="pagination-info">
            Showing <strong>{startRecord}</strong>–<strong>{endRecord}</strong> of{" "}
            <strong>{totalRecords.toLocaleString()}</strong> entries
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="page-numbers-group">
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    type="button"
                    className={`pagination-number-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => goToPage(Number(p))}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              className="pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
