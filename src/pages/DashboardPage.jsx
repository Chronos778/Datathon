import { useMemo, useState } from "react";
import { CircleAlert, Upload } from "lucide-react";
import AspectAnalysis from "../components/dashboard/AspectAnalysis";
import {
  EmotionDistribution,
  SentimentDistribution,
  TopicSentimentChart,
  Top5TopicsBarChart,
  TrendingWordsChart,
} from "../components/dashboard/Charts";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import FeedbackDetail from "../components/dashboard/FeedbackDetail";
import FeedbackExplorer from "../components/dashboard/FeedbackExplorer";
import KpiCards from "../components/dashboard/KpiCards";
import QuickDock from "../components/dashboard/QuickDock";
import AiDrawer from "../components/dashboard/AiDrawer";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import { MinimalCard, MinimalCardTitle, MinimalCardDescription } from "../components/ui/minimal-card";
import {
  aspectAnalysis,
  countBy,
  normalizeRecords,
  sentimentCounts,
  toSortedEntries,
  topicSentiment,
} from "../lib/data-processing";
import { applyFilters, emptyFilters } from "../lib/filters";

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportFeedback(records) {
  const headers = [
    "feedback_id",
    "date",
    "feedback",
    "source",
    "sentiment",
    "sentiment_confidence",
    "emotion",
    "topics",
    "keywords",
  ];
  const content = [
    headers.join(","),
    ...records.map((record) => headers.map((header) => csvCell(record[header])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "feedsense-filtered-feedback.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage({ analysis, onHome, onUploadNew }) {
  const records = useMemo(() => normalizeRecords(analysis.feedback), [analysis.feedback]);
  const [filters, setFilters] = useState(emptyFilters);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState("");
  const [radarViewMode, setRadarViewMode] = useState("aspects");

  const handleOpenAi = (query = "") => {
    setAiInitialQuery(query);
    setIsAiOpen(true);
  };

  const options = useMemo(() => {
    const sourceCounts = countBy(records, (record) => record.source);
    const emotionCounts = countBy(records, (record) => record.emotion);
    const topicCounts = countBy(records, (record) => record.topics);
    const sentCounts = sentimentCounts(records);

    return {
      sources: Object.entries(sourceCounts)
        .filter(([val, count]) => val && val.trim() !== "" && val !== "Unknown" && count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([val, count]) => ({ value: val, label: `${val} (${count.toLocaleString()})` })),
      emotions: Object.entries(emotionCounts)
        .filter(([val, count]) => val && val.trim() !== "" && val !== "Unspecified" && val !== "Neutral" && count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([val, count]) => ({ value: val, label: `${val} (${count.toLocaleString()})` })),
      topics: Object.entries(topicCounts)
        .filter(([val, count]) => val && val.trim() !== "" && count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([val, count]) => ({ value: val, label: `${val} (${count.toLocaleString()})` })),
      sentiments: [
        { value: "positive", label: `Positive (${sentCounts.positive.toLocaleString()})`, count: sentCounts.positive },
        { value: "negative", label: `Negative (${sentCounts.negative.toLocaleString()})`, count: sentCounts.negative },
        { value: "mixed", label: `Mixed / Neutral (${sentCounts.mixed.toLocaleString()})`, count: sentCounts.mixed },
      ].filter((s) => s.count > 0),
    };
  }, [records]);

  const filteredRecords = useMemo(() => applyFilters(records, filters), [records, filters]);
  const counts = useMemo(() => {
    const values = sentimentCounts(filteredRecords);
    return { ...values, total: filteredRecords.length };
  }, [filteredRecords]);
  const topicData = useMemo(
    () => toSortedEntries(countBy(filteredRecords, (record) => record.topics), 10),
    [filteredRecords],
  );
  const emotionData = useMemo(
    () => toSortedEntries(countBy(filteredRecords, (record) => record.emotion)),
    [filteredRecords],
  );
  const keywordData = useMemo(
    () => toSortedEntries(countBy(filteredRecords, (record) => record.keywords), 10),
    [filteredRecords],
  );
  const topicSentiments = useMemo(() => topicSentiment(filteredRecords), [filteredRecords]);
  const aspects = useMemo(() => aspectAnalysis(filteredRecords), [filteredRecords]);
  const allAspects = useMemo(() => aspectAnalysis(records), [records]);
  const allTopicSentiments = useMemo(() => topicSentiment(records), [records]);
  const explorerRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return filteredRecords;
    return filteredRecords.filter((record) =>
      [record.feedback, record.source, record.emotion, ...record.topics, ...record.keywords]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [filteredRecords, search]);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function selectAndExplore(key, value) {
    setFilter(key, value);
    window.setTimeout(() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function goToSection(section) {
    setActiveSection(section);
    const target = section === "overview" ? "dashboard-top" : section;
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }

  if (!records.length) {
    return (
      <div className="dashboard-page">
        <DashboardHeader
          activeSection="overview"
          onSection={() => {}}
          onHome={onHome}
          onUploadNew={onUploadNew}
          onExport={() => {}}
        />
        <main className="dashboard-empty">
          <CircleAlert size={28} />
          <h1>This dataset does not contain feedback records</h1>
          <p>Upload a non-empty CSV with a feedback column and run the analysis again.</p>
          <button className="primary-button" type="button" onClick={onUploadNew}>
            <Upload size={16} /> Upload new dataset
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader
        activeSection={activeSection}
        onSection={goToSection}
        onHome={onHome}
        onUploadNew={onUploadNew}
        onExport={() => exportFeedback(filteredRecords)}
      />
      <main className="dashboard-main" id="dashboard-top">
        <section className="dashboard-title-row">
          <div>
            <span className="section-label">Analysis workspace</span>
            <h1>Feedback intelligence</h1>
            <p>
              {analysis.dataset.name} <span /> {analysis.dataset.rows.toLocaleString()} responses analyzed
            </p>
          </div>
        </section>

        <KpiCards counts={counts} />


        <section className="analytics-grid">
          <EmotionDistribution
            data={emotionData}
            total={filteredRecords.length}
            onSelect={(value) => selectAndExplore("emotion", value)}
          />
          <SentimentDistribution counts={counts} onSelect={(value) => setFilter("sentiment", value)} />
          <TopicSentimentChart
            aspectData={aspects}
            baseAspectData={allAspects}
            topicData={topicSentiments}
            baseTopicData={allTopicSentiments}
            selectedItem={filters.topic !== "all" ? filters.topic : null}
            selectedSentiment={filters.sentiment !== "all" ? filters.sentiment : null}
            viewMode={radarViewMode}
            onViewModeChange={setRadarViewMode}
            onSelect={(value) => {
              if (filters.topic === value) {
                setFilter("topic", "all");
              } else {
                selectAndExplore("topic", value);
              }
            }}
          />
          <Top5TopicsBarChart
            data={topicData}
            id="topics"
            onSelect={(value) => selectAndExplore("topic", value)}
          />
          <TrendingWordsChart
            data={keywordData}
            id="trending-words"
            onSelect={(value) => {
              setSearch(value);
              window.setTimeout(() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }), 0);
            }}
          />
          <AspectAnalysis rows={aspects} onSelect={(value) => selectAndExplore("topic", value)} />
        </section>

        <ContainerScroll
          titleComponent={
            <div className="container-scroll-title-wrap">
              <span className="section-label">Verified Responses</span>
              <h2 className="container-scroll-heading">
                Feedback Explorer & Inspector
              </h2>
            </div>
          }
        >
          <FeedbackExplorer
            records={explorerRecords}
            search={search}
            onSearch={setSearch}
            filters={filters}
            options={options}
            onFilter={setFilter}
            onOpen={setSelectedRecord}
          />
        </ContainerScroll>
      </main>
      <FeedbackDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} />

      {/* Floating Bottom Quick Dock */}
      <QuickDock
        filters={filters}
        options={options}
        onFilter={setFilter}
        onReset={() => {
          setFilters(emptyFilters);
          setSearch("");
        }}
        resultCount={filteredRecords.length}
        onOpenAi={handleOpenAi}
      />

      {/* Slide-over Right Side AI Chatbot Drawer */}
      <AiDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        records={filteredRecords}
        datasetName={analysis.dataset.name}
        initialQuery={aiInitialQuery}
      />
    </div>
  );
}
