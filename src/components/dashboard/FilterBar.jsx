import { CalendarDays, RotateCcw } from "lucide-react";

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option value={option.value ?? option} key={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ filters, options, onFilter, onReset, resultCount }) {
  const changed = Object.values(filters).some((value) => value !== "all");

  return (
    <div className="filter-bar">
      <div className="filter-fields">
        <label>
          <span>Date</span>
          <span className="select-with-icon">
            <CalendarDays size={14} />
            <select value={filters.date} onChange={(event) => onFilter("date", event.target.value)}>
              <option value="all">All dates</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </span>
        </label>
        {options.sources && options.sources.length > 1 && (
          <FilterSelect
            label="Source"
            value={filters.source}
            options={options.sources}
            onChange={(value) => onFilter("source", value)}
          />
        )}
        <FilterSelect
          label="Sentiment"
          value={filters.sentiment}
          options={
            options.sentiments && options.sentiments.length > 0
              ? options.sentiments
              : [
                  { value: "positive", label: "Positive" },
                  { value: "negative", label: "Negative" },
                  { value: "mixed", label: "Mixed / neutral" },
                ]
          }
          onChange={(value) => onFilter("sentiment", value)}
        />
        {options.emotions && options.emotions.length > 0 && (
          <FilterSelect
            label="Emotion"
            value={filters.emotion}
            options={options.emotions}
            onChange={(value) => onFilter("emotion", value)}
          />
        )}
        {options.topics && options.topics.length > 0 && (
          <FilterSelect
            label="Topic"
            value={filters.topic}
            options={options.topics}
            onChange={(value) => onFilter("topic", value)}
          />
        )}
      </div>
      <div className="filter-meta">
        <span>{resultCount.toLocaleString()} matching responses</span>
        {changed && (
          <button type="button" onClick={onReset}>
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
