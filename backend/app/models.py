from pydantic import BaseModel, Field


class AspectSentiment(BaseModel):
    aspect: str
    sentiment: str


class FeedbackRecord(BaseModel):
    feedback_id: int | str
    date: str
    feedback: str
    source: str
    cleaned_text: str
    sentiment: str
    sentiment_score: float = Field(ge=0, le=1)
    sentiment_confidence: float = Field(ge=0, le=1)
    topics: list[str]
    keywords: list[str]
    emotion: str
    aspect_sentiments: list[AspectSentiment]


class AnalysisDataset(BaseModel):
    name: str
    rows: int


class AnalysisResponse(BaseModel):
    dataset: AnalysisDataset
    feedback: list[FeedbackRecord]


class HealthResponse(BaseModel):
    status: str
