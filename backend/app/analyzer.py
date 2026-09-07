import json
import math
import re
from collections import Counter
from datetime import date

from .models import AspectSentiment, FeedbackRecord


POSITIVE_WORDS = {
    "amazing",
    "awesome",
    "best",
    "clean",
    "comfortable",
    "decent",
    "easy",
    "excellent",
    "fast",
    "friendly",
    "good",
    "great",
    "helpful",
    "improved",
    "love",
    "nice",
    "quick",
    "satisfied",
    "smooth",
    "supportive",
}

NEGATIVE_WORDS = {
    "bad",
    "broken",
    "complaint",
    "confusing",
    "delay",
    "difficult",
    "dirty",
    "disappointed",
    "disconnects",
    "fails",
    "frustrating",
    "late",
    "missing",
    "poor",
    "problem",
    "slow",
    "terrible",
    "unavailable",
    "unhappy",
    "unsafe",
    "worse",
    "worst",
}

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "but",
    "by",
    "for",
    "from",
    "has",
    "have",
    "i",
    "in",
    "is",
    "it",
    "its",
    "my",
    "of",
    "on",
    "or",
    "our",
    "so",
    "that",
    "the",
    "their",
    "there",
    "this",
    "to",
    "very",
    "was",
    "we",
    "were",
    "with",
}

TOPIC_RULES = {
    # Education & Campus
    "Campus Wifi": ("wifi", "internet", "network", "connection", "bandwidth"),
    "Online Tests & LMS": ("online test", "online exam", "portal", "quiz", "lms", "moodle"),
    "Classrooms & Facilities": ("classroom", "projector", "equipment", "lecture hall", "auditorium", "lab"),
    "Faculty & Teaching": ("faculty", "professor", "teacher", "lecturer", "instructor", "teaching"),
    "Canteen & Food": ("canteen", "cafeteria", "food", "meal", "coffee", "snack", "dining"),
    "Washrooms & Hygiene": ("washroom", "restroom", "toilet", "cleaning", "hygiene", "sanitation"),
    "Placements & Career": ("placement", "career", "recruiter", "internship", "interview", "job"),
    "Library & Study": ("library", "book", "study room", "journal", "reading"),
    "Hostel": ("hostel", "dorm", "roommate", "mess", "warden"),
    "Campus Transport": ("transport", "bus", "parking", "shuttle", "commute"),
    "Fees & Billing": ("fee", "fees", "payment", "refund", "tuition", "charge", "invoice"),
    "Staff & Helpdesk": ("support", "staff", "helpdesk", "administration", "office"),
    "Accessibility": ("accessible", "accessibility", "wheelchair", "ramp", "lift", "elevator"),

    # Retail & E-Commerce
    "Delivery & Shipping": ("delivery", "shipping", "courier", "package", "tracking", "arrived", "transit"),
    "Product Quality": ("product", "quality", "material", "durability", "damaged", "broken", "fit"),
    "Customer Support": ("customer service", "agent", "call center", "rep", "chat support", "response time"),
    "Returns & Refunds": ("return", "returns", "refund", "refunds", "replacement", "exchange"),
    "Pricing & Value": ("price", "pricing", "cost", "expensive", "affordable", "discount", "offer"),
    "Checkout & App": ("app", "checkout", "cart", "payment gateway", "website", "bug", "crash"),

    # Healthcare & Hospital
    "Doctor & Medical Care": ("doctor", "physician", "surgeon", "consultation", "diagnosis", "treatment"),
    "Nursing Staff": ("nurse", "nursing", "caretaker", "attendant", "ward"),
    "Wait Times": ("wait time", "waiting", "delay", "queue", "delayed", "long wait"),
    "Cleanliness & Sanity": ("clean", "dirty", "sterile", "hospital room", "sanitized"),

    # SaaS & Tech
    "Performance & Speed": ("performance", "speed", "slow", "latency", "fast", "load time", "loading"),
    "UI & Experience": ("ui", "ux", "design", "navigation", "interface", "usability", "confusing"),
    "Features & Integrations": ("feature", "integration", "api", "export", "import", "tool", "sync"),
}


def cleaned_text(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9']+", value.lower()))


def tokens(value: str) -> list[str]:
    return re.findall(r"[a-z][a-z0-9']{1,}", value.lower())


def parse_list(value: str) -> list[str]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except json.JSONDecodeError:
        pass
    return [item.strip() for item in re.split(r"[|;,]", value) if item.strip()]


def parse_aspects(value: str) -> list[AspectSentiment]:
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return []
    if not isinstance(parsed, list):
        return []
    aspects: list[AspectSentiment] = []
    for item in parsed:
        if not isinstance(item, dict):
            continue
        aspect = str(item.get("aspect", "")).strip()
        sentiment = str(item.get("sentiment", "Mixed")).strip()
        if aspect:
            aspects.append(AspectSentiment(aspect=aspect, sentiment=sentiment))
    return aspects


def safe_float(value: str, fallback: float) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return fallback
    if math.isnan(parsed) or math.isinf(parsed):
        return fallback
    return min(1.0, max(0.0, parsed))


def classify_sentiment(text: str) -> tuple[str, float, float]:
    words = tokens(text)
    positives = sum(word in POSITIVE_WORDS for word in words)
    negatives = sum(word in NEGATIVE_WORDS for word in words)
    evidence = positives + negatives

    if positives > negatives:
        sentiment = "Positive"
    elif negatives > positives:
        sentiment = "Negative"
    else:
        sentiment = "Mixed"

    margin = positives - negatives
    score = min(1.0, max(0.0, 0.5 + margin * 0.16))
    confidence = 0.58 if evidence == 0 else min(0.99, 0.68 + abs(margin) * 0.1 + evidence * 0.04)
    return sentiment, round(score, 4), round(confidence, 4)


def extract_topics(text: str) -> list[str]:
    normalized = cleaned_text(text)
    matches = [
        topic
        for topic, phrases in TOPIC_RULES.items()
        if any(phrase in normalized for phrase in phrases)
    ]
    return matches[:4] or ["General Feedback"]


def extract_keywords(text: str, topics: list[str]) -> list[str]:
    counts = Counter(
        word
        for word in tokens(text)
        if word not in STOP_WORDS and word not in POSITIVE_WORDS and word not in NEGATIVE_WORDS
    )
    keywords = [word for word, _count in counts.most_common(4)]
    if not keywords and topics:
        keywords = [topics[0].lower()]
    return keywords


def classify_emotion(text: str, sentiment: str) -> str:
    normalized = cleaned_text(text)
    if any(term in normalized for term in ("worried", "concern", "unsafe", "risk")):
        return "Concern"
    if sentiment == "Positive":
        return "Satisfaction"
    if sentiment == "Negative":
        return "Frustration"
    return "Neutral"


def analyze_row(row: dict[str, str], index: int) -> FeedbackRecord:
    original = row["feedback"]
    generated_sentiment, generated_score, generated_confidence = classify_sentiment(original)
    sentiment = row.get("sentiment") or generated_sentiment
    topics = parse_list(row.get("topics", "")) or extract_topics(original)
    keywords = parse_list(row.get("keywords", "")) or extract_keywords(original, topics)
    emotion = row.get("emotion") or classify_emotion(original, sentiment)
    aspects = parse_aspects(row.get("aspect_sentiments", ""))
    if not aspects:
        aspects = [AspectSentiment(aspect=topic, sentiment=sentiment) for topic in topics]

    return FeedbackRecord(
        feedback_id=row.get("feedback_id") or index,
        date=row.get("date") or date.today().isoformat(),
        feedback=original,
        source=row.get("source") or "Uploaded CSV",
        cleaned_text=row.get("cleaned_text") or cleaned_text(original),
        sentiment=sentiment,
        sentiment_score=safe_float(row.get("sentiment_score", ""), generated_score),
        sentiment_confidence=safe_float(
            row.get("sentiment_confidence", ""),
            generated_confidence,
        ),
        topics=topics,
        keywords=keywords,
        emotion=emotion,
        aspect_sentiments=aspects,
    )


def analyze_rows(rows: list[dict[str, str]]) -> list[FeedbackRecord]:
    return [analyze_row(row, index) for index, row in enumerate(rows, start=1)]
