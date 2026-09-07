export type Sentiment = "Positive" | "Negative" | "Mixed" | "Neutral" | string;

export interface AspectSentiment {
  aspect: string;
  sentiment: Sentiment;
}

export interface FeedbackRecord {
  feedback_id: number | string;
  date: string;
  feedback: string;
  source: string;
  cleaned_text?: string;
  sentiment: Sentiment;
  sentiment_score?: number;
  sentiment_confidence?: number;
  topics: string[];
  keywords: string[];
  emotion: string;
  aspect_sentiments: AspectSentiment[];
}

export interface AnalysisDataset {
  name: string;
  rows: number;
}

export interface AnalysisResponse {
  dataset: AnalysisDataset;
  feedback: FeedbackRecord[];
}

export interface DashboardFilters {
  date: string;
  source: string;
  sentiment: string;
  emotion: string;
  topic: string;
  keyword?: string;
}
