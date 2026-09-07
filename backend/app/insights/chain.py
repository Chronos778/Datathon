from __future__ import annotations

import logging
from typing import Any

from app.config import gemini_api_keys, gemini_model
from app.insights.prompts import SYSTEM_PROMPT
from app.insights.schemas import DatasetInsights

logger = logging.getLogger(__name__)


class DatasetInsightChain:
    def generate(self, context: dict[str, Any]) -> DatasetInsights:
        keys = gemini_api_keys()
        if not keys:
            return self.fallback(context)
        try:
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_google_genai import ChatGoogleGenerativeAI

            prompt = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("human", "Analyze this evidence JSON and return the required structured insight object:\n{context}"),
            ])
            model = ChatGoogleGenerativeAI(
                model=gemini_model(),
                google_api_key=keys[0],
                temperature=0,
            ).with_structured_output(DatasetInsights)
            result = (prompt | model).invoke({"context": context})
            if isinstance(result, DatasetInsights):
                result.generation_status = "GEMINI"
                return result
            return DatasetInsights.model_validate(result)
        except Exception as error:
            logger.warning("[Gemini Insights] generation failed: %s", type(error).__name__)
            return self.fallback(context)

    @staticmethod
    def fallback(context: dict[str, Any]) -> DatasetInsights:
        dataset = context["dataset"]
        severity = context["severity"]["distribution"]
        actions = context["actions"]["distribution"]
        top_topics = context["top_topics"][:5]
        summary = f"Processed {dataset['row_count']} records with deterministic decision evidence."
        if severity:
            summary += f" Severity distribution: {severity}."
        insights = [
            {
                "title": "Decision workload",
                "description": f"Recorded actions are distributed as {actions or 'unavailable'}.",
                "importance": "MEDIUM",
                "evidence": [str(actions or "Action data unavailable")],
            }
        ]
        themes = [
            {
                "theme": item["value"],
                "description": f"Recurring analyzed topic with {item['count']} records.",
                "sentiment": "UNKNOWN",
                "importance": "MEDIUM",
            }
            for item in top_topics
        ]
        return DatasetInsights(
            executive_summary=summary,
            key_insights=insights,
            themes=themes,
            data_limitations=["Gemini was unavailable; this result contains deterministic summaries only."],
            generation_status="FALLBACK",
        )
