import { sentimentKey } from "./filters";

function parseArrayValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed.replaceAll("'", '"'));
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        return trimmed
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((item) => item.replace(/^["']|["']$/g, "").trim())
          .filter(Boolean);
      }
    }
    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function parseAspects(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item && item.aspect)
      .map((item) => ({ aspect: String(item.aspect), sentiment: String(item.sentiment || "Mixed") }));
  }
  if (typeof value === "string" && value.trim()) {
    try {
      return parseAspects(JSON.parse(value.replaceAll("'", '"')));
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeRecords(records = []) {
  return records
    .filter((record) => record && record.feedback)
    .map((record, index) => ({
      ...record,
      feedback_id: record.feedback_id ?? index + 1,
      date: record.date || new Date().toISOString().slice(0, 10),
      source: record.source || "Unknown",
      sentiment: record.sentiment || "Mixed",
      emotion: record.emotion || "Unspecified",
      topics: parseArrayValue(record.topics),
      keywords: parseArrayValue(record.keywords),
      aspect_sentiments: parseAspects(record.aspect_sentiments),
    }));
}

export function countBy(records, getter) {
  return records.reduce((counts, record) => {
    const values = getter(record);
    for (const value of Array.isArray(values) ? values : [values]) {
      if (!value) continue;
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }, {});
}

export function toSortedEntries(counts, limit) {
  return Object.entries(counts)
    .sort(([, first], [, second]) => second - first)
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function sentimentCounts(records) {
  const counts = { positive: 0, negative: 0, mixed: 0 };
  records.forEach((record) => {
    counts[sentimentKey(record.sentiment)] += 1;
  });
  return counts;
}

function periodStart(date, mode) {
  const value = new Date(date);
  if (mode === "monthly") return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  if (mode === "weekly") {
    const day = value.getDay() || 7;
    value.setDate(value.getDate() - day + 1);
  }
  return value.toISOString().slice(0, 10);
}

export function sentimentTimeline(records, mode) {
  const buckets = {};
  records.forEach((record) => {
    const key = periodStart(record.date, mode);
    buckets[key] ||= { key, positive: 0, negative: 0, mixed: 0 };
    buckets[key][sentimentKey(record.sentiment)] += 1;
  });
  return Object.values(buckets).sort((first, second) => first.key.localeCompare(second.key));
}

export function hasDateColumn(records = []) {
  if (!records || records.length < 2) return false;
  let validDates = 0;
  const uniqueDates = new Set();
  const sample = records.slice(0, 100);
  for (const r of sample) {
    if (r.date && typeof r.date === "string" && r.date.trim() && !isNaN(Date.parse(r.date))) {
      validDates++;
      uniqueDates.add(r.date.slice(0, 10));
    }
  }
  return validDates >= 2 && uniqueDates.size > 1;
}

export function emotionTimeline(records = [], limit = 5) {
  if (!records.length) return { timeline: [], emotions: [], mode: "daily" };
  const validRecords = records.filter(
    (r) => r.date && typeof r.date === "string" && !isNaN(Date.parse(r.date)),
  );
  if (validRecords.length < 2) return { timeline: [], emotions: [], mode: "daily" };

  const timestamps = validRecords.map((r) => new Date(r.date).getTime()).sort((a, b) => a - b);
  const spanDays = (timestamps[timestamps.length - 1] - timestamps[0]) / (1000 * 60 * 60 * 24);
  const mode = spanDays <= 14 ? "daily" : spanDays <= 90 ? "weekly" : "monthly";

  const emotionCounts = countBy(validRecords, (r) => r.emotion);
  const topEmotions = toSortedEntries(emotionCounts, limit).map((e) => e.label);

  const buckets = {};
  validRecords.forEach((record) => {
    const key = periodStart(record.date, mode);
    buckets[key] ||= { key, total: 0 };
    const emotion = record.emotion || "Unspecified";
    buckets[key][emotion] = (buckets[key][emotion] || 0) + 1;
    buckets[key].total += 1;
  });

  const sorted = Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key));
  return { timeline: sorted, emotions: topEmotions, mode };
}

export function topicSentiment(records) {
  const topics = {};
  records.forEach((record) => {
    record.topics.forEach((topic) => {
      topics[topic] ||= { label: topic, positive: 0, negative: 0, mixed: 0, total: 0 };
      const key = sentimentKey(record.sentiment);
      topics[topic][key] += 1;
      topics[topic].total += 1;
    });
  });
  return Object.values(topics)
    .sort((first, second) => second.total - first.total)
    .slice(0, 8);
}

export function aspectAnalysis(records) {
  const aspects = {};
  records.forEach((record) => {
    (record.aspect_sentiments || []).forEach(({ aspect, sentiment }) => {
      if (!aspect) return;
      aspects[aspect] ||= { aspect, mentions: 0, positive: 0, negative: 0, mixed: 0 };
      aspects[aspect].mentions += 1;
      aspects[aspect][sentimentKey(sentiment)] += 1;
    });
  });
  return Object.values(aspects)
    .map((item) => ({
      ...item,
      netScore: item.positive - item.negative,
      posPercent: item.mentions ? Math.round((item.positive / item.mentions) * 100) : 0,
      negPercent: item.mentions ? Math.round((item.negative / item.mentions) * 100) : 0,
    }))
    .sort((first, second) => second.mentions - first.mentions);
}

export function formatPercent(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

export function uniqueValues(records, getter) {
  return [...new Set(records.flatMap((record) => getter(record)).filter(Boolean))].sort();
}

