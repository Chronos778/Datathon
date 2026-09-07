export const emptyFilters = {
  date: "all",
  source: "all",
  sentiment: "all",
  emotion: "all",
  topic: "all",
};

export function sentimentKey(sentiment) {
  const value = String(sentiment || "").toLowerCase();
  if (value === "positive") return "positive";
  if (value === "negative") return "negative";
  return "mixed";
}

export function applyFilters(records, filters) {
  const latestDate = records.reduce((latest, record) => {
    const date = new Date(record.date);
    return date > latest ? date : latest;
  }, new Date(0));

  return records.filter((record) => {
    if (filters.source !== "all" && record.source !== filters.source) return false;
    if (filters.sentiment !== "all" && sentimentKey(record.sentiment) !== filters.sentiment) {
      return false;
    }
    if (
      filters.topic !== "all" &&
      !record.topics.includes(filters.topic) &&
      !(record.aspect_sentiments || []).some((a) => a.aspect === filters.topic)
    ) {
      return false;
    }

    if (filters.date !== "all") {
      const days = Number(filters.date);
      const threshold = new Date(latestDate);
      threshold.setDate(threshold.getDate() - days + 1);
      if (new Date(record.date) < threshold) return false;
    }

    return true;
  });
}
