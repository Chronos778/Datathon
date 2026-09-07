from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any, Protocol

from app.config import gemini_api_keys, gemini_model

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RecommendationResult:
    recommendation: str
    reason: str
    suggested_next_step: str
    status: str


class RecommendationProvider(Protocol):
    def recommend(self, state: dict[str, Any]) -> RecommendationResult: ...


class GeminiRecommendationProvider:
    """Gemini recommendation adapter with deterministic failure handling."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        keys = gemini_api_keys()
        self.api_keys = keys
        self.api_key = (api_key.strip() if api_key is not None else (keys[0] if keys else None)) or None
        self.model = model or gemini_model()

    def recommend(self, state: dict[str, Any]) -> RecommendationResult:
        logger.info("[Gemini] Recommendation generation started")
        if not self.api_key:
            logger.info("[Gemini] API unavailable; using deterministic fallback")
            return self.fallback(state)
        try:
            from google import genai
        except ImportError:
            logger.info("[Gemini] SDK unavailable; using deterministic fallback")
            return self.fallback(state)
        try:
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model=self.model,
                contents=self._prompt(state),
                config={
                    "response_mime_type": "application/json",
                    "response_schema": {
                        "type": "OBJECT",
                        "properties": {
                            "recommendation": {"type": "STRING"},
                            "reason": {"type": "STRING"},
                            "suggested_next_step": {"type": "STRING"},
                        },
                        "required": ["recommendation", "reason", "suggested_next_step"],
                    },
                },
            )
            payload = json.loads(str(response.text or ""))
            values = {key: payload.get(key) for key in ("recommendation", "reason", "suggested_next_step")}
            if not all(isinstance(value, str) and value.strip() for value in values.values()):
                raise ValueError("Gemini response omitted a required string field")
            logger.info("[Gemini] Recommendation generated successfully")
            return RecommendationResult(*(value.strip() for value in values.values()), "GEMINI")
        except Exception as error:
            logger.warning("[Gemini] API failed: %s", type(error).__name__)
            logger.info("[Gemini] Using deterministic fallback")
            return self.fallback(state)

    @staticmethod
    def _prompt(state: dict[str, Any]) -> str:
        return f"""You are a decision-support assistant for an educational institution's feedback management system.

The feedback has already been analyzed by an AI/NLP pipeline. The operational decision has already been determined by a LangGraph decision engine. Do not reclassify or change any supplied analysis or decision. Generate only a concise, practical recommendation for the responsible department.

Return JSON with exactly these string fields: recommendation, reason, suggested_next_step.
Base the response strictly on the supplied evidence. Do not invent facts or exaggerate.

Feedback: {state.get("feedback", "")}
Cleaned text: {state.get("cleaned_text", "")}
Sentiment: {state.get("sentiment", "")}
Sentiment score: {state.get("sentiment_score", "")}
Sentiment confidence: {state.get("sentiment_confidence", "")}
Topics: {state.get("topics", [])}
Keywords: {state.get("keywords", [])}
Emotion: {state.get("emotion", "")}
Aspect sentiments: {state.get("aspect_sentiments", [])}
Severity: {state.get("severity", "")}
Severity reason: {state.get("severity_reason", "")}
Priority: {state.get("priority", "")}
Priority reason: {state.get("priority_reason", "")}
Department: {state.get("department", "")}
Department reason: {state.get("department_reason", "")}
Impact: {state.get("impact_level", "")}
Impact reason: {state.get("impact_reason", "")}
Action: {state.get("action", "")}
Action reason: {state.get("action_reason", "")}"""

    @staticmethod
    def fallback(state: dict[str, Any]) -> RecommendationResult:
        action = str(state.get("action", "review")).replace("_", " ").lower()
        department = state.get("department", "responsible")
        severity = state.get("severity", "unclassified")
        priority = state.get("priority", "unassigned")
        return RecommendationResult(
            f"{action.title()} this {severity.lower()}-severity issue with the {department} department.",
            f"The LangGraph decision classified this issue as {severity} severity with {priority} priority.",
            f"Ask {department} to review the feedback and complete the {action} action.",
            "FALLBACK",
        )
