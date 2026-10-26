"""Gemini-powered conversational AI for dataset exploration and feedback intelligence."""

from __future__ import annotations

import logging
import re
from typing import Any
from pydantic import BaseModel, Field

from app.config import gemini_api_keys, gemini_model

logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    role: str = "user"  # "user" or "model" / "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)
    dataset_summary: dict[str, Any] | None = None
    records: list[dict[str, Any]] = Field(default_factory=list)
    dataset_name: str = "Active Dataset"


class ChatResponse(BaseModel):
    reply: str
    status: str  # "gemini" or "local_copilot"
    model: str | None = None


def _format_context(
    records: list[dict[str, Any]],
    summary: dict[str, Any] | None,
    dataset_name: str,
    query: str,
) -> str:
    total = len(records)
    if summary and summary.get("total"):
        total = summary["total"]

    # Sentiment counts
    pos = sum(1 for r in records if "pos" in str(r.get("sentiment", "")).lower())
    neg = sum(1 for r in records if "neg" in str(r.get("sentiment", "")).lower())
    mix = max(0, total - pos - neg)

    if summary:
        pos = summary.get("positive", pos)
        neg = summary.get("negative", neg)
        mix = summary.get("mixed", mix)
        total = summary.get("total", total)

    pos_rate = round((pos / total) * 100) if total else 0
    neg_rate = round((neg / total) * 100) if total else 0
    nss = pos_rate - neg_rate

    # Topics breakdown
    neg_topics: dict[str, int] = {}
    pos_topics: dict[str, int] = {}
    for r in records:
        s = str(r.get("sentiment", "")).lower()
        t_list = r.get("topics", [])
        if isinstance(t_list, str):
            t_list = [t.strip() for t in t_list.split(";") if t.strip()]
        for t in t_list:
            if "neg" in s:
                neg_topics[t] = neg_topics.get(t, 0) + 1
            elif "pos" in s:
                pos_topics[t] = pos_topics.get(t, 0) + 1

    top_neg = sorted(neg_topics.items(), key=lambda x: x[1], reverse=True)[:5]
    top_pos = sorted(pos_topics.items(), key=lambda x: x[1], reverse=True)[:5]

    # Quotes extraction: query-matched first, then general
    query_tokens = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
    matched_quotes: list[str] = []
    general_neg: list[str] = []
    general_pos: list[str] = []

    for r in records:
        txt = r.get("feedback") or r.get("cleaned_text") or r.get("text") or ""
        if not txt:
            continue
        txt_str = str(txt).strip()
        txt_lower = txt_str.lower()
        s = str(r.get("sentiment", "")).lower()

        if any(token in txt_lower for token in query_tokens):
            if len(matched_quotes) < 5:
                matched_quotes.append(f'- [{s.upper()}] "{txt_str[:220]}"')

        if "neg" in s and len(general_neg) < 3:
            general_neg.append(f'- [NEGATIVE] "{txt_str[:220]}"')
        elif "pos" in s and len(general_pos) < 3:
            general_pos.append(f'- [POSITIVE] "{txt_str[:220]}"')

    quotes = matched_quotes or (general_neg + general_pos)
    quotes_formatted = "\n".join(quotes) if quotes else "No direct feedback quotes extracted."

    top_neg_desc = ", ".join(f"{k} ({v} complaints)" for k, v in top_neg) or "None recorded"
    top_pos_desc = ", ".join(f"{k} ({v} positive mentions)" for k, v in top_pos) or "None recorded"

    return f"""DATASET GROUNDING EVIDENCE:
Dataset Name: {dataset_name}
Total Responses Analyzed: {total}
Sentiment Distribution: {pos} Positive ({pos_rate}%), {neg} Negative ({neg_rate}%), {mix} Neutral/Mixed
Net Sentiment Score (NSS): {nss}
Top Negative Drivers / Pain Points: {top_neg_desc}
Top Strengths / Positive Drivers: {top_pos_desc}

Representative Real User Feedback Quotes:
{quotes_formatted}
"""


def _generate_local_reply(
    message: str,
    records: list[dict[str, Any]],
    summary: dict[str, Any] | None,
    dataset_name: str,
) -> str:
    """High-quality deterministic fallback response grounded in dataset statistics."""
    q = message.lower()
    total = len(records)
    if summary and summary.get("total"):
        total = summary["total"]

    pos = sum(1 for r in records if "pos" in str(r.get("sentiment", "")).lower())
    neg = sum(1 for r in records if "neg" in str(r.get("sentiment", "")).lower())
    mix = max(0, total - pos - neg)

    if summary:
        pos = summary.get("positive", pos)
        neg = summary.get("negative", neg)
        mix = summary.get("mixed", mix)
        total = summary.get("total", total)

    pos_rate = round((pos / total) * 100) if total else 0
    neg_rate = round((neg / total) * 100) if total else 0
    nss = pos_rate - neg_rate

    # Search for specific topic keywords in records
    query_tokens = [w for w in re.findall(r"\w+", q) if len(w) > 2 and w not in {"what", "which", "about", "tell", "show", "give", "have", "with"}]
    matching_records = [
        r for r in records
        if any(token in str(r.get("feedback", "") or r.get("cleaned_text", "")).lower() for token in query_tokens)
    ]

    if matching_records:
        m_pos = sum(1 for r in matching_records if "pos" in str(r.get("sentiment", "")).lower())
        m_neg = sum(1 for r in matching_records if "neg" in str(r.get("sentiment", "")).lower())
        sample_quotes = [
            f'> *"{str(r.get("feedback") or r.get("cleaned_text"))[:180]}..."*'
            for r in matching_records[:3]
        ]
        quotes_block = "\n\n".join(sample_quotes)
        return f"""### Query Results for "{message}"
Found **{len(matching_records)} matching feedback responses** in **{dataset_name}**:

- **Sentiment:** {m_pos} positive, {m_neg} negative, {len(matching_records) - m_pos - m_neg} neutral/mixed
- **Representative User Feedback:**
{quotes_block}

**Actionable Insight:** Review this cluster with the responsible department to prioritize resolution.

*(Local dataset engine. Add `GEMINI_API_KEY` in `.env` for generative reasoning).*"""

    if any(k in q for k in ["pain", "complaint", "negative", "issue", "problem", "unhappy", "frustrat"]):
        # Top complaints
        neg_topics: dict[str, int] = {}
        for r in records:
            if "neg" in str(r.get("sentiment", "")).lower():
                for t in r.get("topics", []):
                    neg_topics[t] = neg_topics.get(t, 0) + 1
        top_neg = sorted(neg_topics.items(), key=lambda x: x[1], reverse=True)[:4]
        items = "\n".join(f"- **{t}**: {cnt} complaints logged" for t, cnt in top_neg)
        return f"""### Top Customer Pain Points
Based on **{neg} negative feedback items ({neg_rate}% of all {total} responses)**:

{items}

**Net Sentiment Score (NSS):** {nss}
**Immediate Recommendation:** Initiate a sprint on the top complaint category to arrest negative sentiment churn.

*(Local dataset engine. Add `GEMINI_API_KEY` in `.env` for generative reasoning).*"""

    if any(k in q for k in ["positive", "love", "praise", "good", "best", "strength", "working"]):
        pos_topics: dict[str, int] = {}
        for r in records:
            if "pos" in str(r.get("sentiment", "")).lower():
                for t in r.get("topics", []):
                    pos_topics[t] = pos_topics.get(t, 0) + 1
        top_pos = sorted(pos_topics.items(), key=lambda x: x[1], reverse=True)[:4]
        items = "\n".join(f"- **{t}**: {cnt} positive endorsements" for t, cnt in top_pos)
        return f"""### Key Customer Strengths & Praises
Users are most satisfied with these areas (**{pos} positive items, {pos_rate}%**):

{items}

**Takeaway:** Recognize and reinforce these strengths in your product roadmap and communications.

*(Local dataset engine. Add `GEMINI_API_KEY` in `.env` for generative reasoning).*"""

    if any(k in q for k in ["plan", "action", "recommend", "step", "executive", "fix"]):
        return f"""### Executive 3-Step Action Plan
Based on analysis of **{total} feedback records** in **{dataset_name}**:

1. **P0 Priority — Resolve Primary Friction Point:**
   - Audit the top complaint cluster immediately and establish a 48-hour response protocol.
2. **P1 Priority — Process Re-engineering:**
   - Implement automated alerts for recurring negative keywords to catch issues before escalation.
3. **P2 Priority — Track Sentiment Velocity:**
   - Benchmark current NSS (**{nss}**) and set a target to increase positive sentiment above {min(100, pos_rate + 10)}% over the next cycle.

*(Local dataset engine. Add `GEMINI_API_KEY` in `.env` for generative reasoning).*"""

    # General overview
    return f"""### Feedback Intelligence Summary: {dataset_name}
- **Total Responses:** {total:,}
- **Positive:** {pos:,} ({pos_rate}%)
- **Negative:** {neg:,} ({neg_rate}%)
- **Neutral / Mixed:** {mix:,}
- **Net Sentiment Score (NSS):** {nss}

You can ask me specific questions like:
- *"What are the top 3 customer pain points?"*
- *"What are people saying about support or facilities?"*
- *"Give me an executive 3-step action plan"*

*(Local dataset engine. Add `GEMINI_API_KEY` in `.env` for generative reasoning).*"""


def chat_with_copilot(request: ChatRequest) -> dict[str, Any]:
    """Process a chat message using Google Gemini or intelligent dataset fallback."""
    keys = gemini_api_keys()
    api_key = keys[0] if keys else None
    model_name = gemini_model()

    context = _format_context(
        records=request.records,
        summary=request.dataset_summary,
        dataset_name=request.dataset_name,
        query=request.message,
    )

    if not api_key:
        logger.info("[Chatbot] No GEMINI_API_KEY set; using grounded local engine")
        reply = _generate_local_reply(
            message=request.message,
            records=request.records,
            summary=request.dataset_summary,
            dataset_name=request.dataset_name,
        )
        return {
            "reply": reply,
            "status": "local_copilot",
            "model": "Local NLP Intelligence",
        }

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        system_instruction = f"""You are the FeedSense AI Feedback Copilot, an expert AI analyst and decision-support assistant embedded in FeedSense Feedback Intelligence.
Your job is to answer user queries about customer/student feedback accurately, concisely, and with high decision conviction.

Ground your answers strictly on the following dataset evidence:
{context}

Guidelines:
1. Provide concise, direct, and well-structured answers using Markdown (bold key numbers, bullet points, headers).
2. Quote real user phrases where appropriate to back up your points.
3. If asked for recommendations, provide concrete, prioritized, realistic steps (P0, P1, P2).
4. Do not invent numbers or facts not supported by the dataset evidence.
5. If the user asks general questions, assist them helpfully while highlighting relevant insights from the dataset."""

        # Format chat history for context
        history_prompts = []
        for msg in request.history[-6:]:
            role = "user" if msg.role == "user" else "model"
            history_prompts.append(f"{role.upper()}: {msg.content}")

        full_prompt = (
            "\n".join(history_prompts) + f"\nUSER: {request.message}\nASSISTANT:"
            if history_prompts
            else request.message
        )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,
            max_output_tokens=1000,
        )

        response = client.models.generate_content(
            model=model_name,
            contents=full_prompt,
            config=config,
        )

        reply_text = str(response.text or "").strip()
        if not reply_text:
            raise ValueError("Gemini returned an empty response")

        logger.info("[Chatbot] Gemini reply generated successfully using %s", model_name)
        return {
            "reply": reply_text,
            "status": "gemini",
            "model": model_name,
        }

    except Exception as error:
        logger.warning("[Chatbot] Gemini call failed (%s: %s); falling back to local engine", type(error).__name__, error)
        reply = _generate_local_reply(
            message=request.message,
            records=request.records,
            summary=request.dataset_summary,
            dataset_name=request.dataset_name,
        )
        return {
            "reply": reply,
            "status": "local_copilot",
            "model": f"Local Fallback ({type(error).__name__})",
        }
