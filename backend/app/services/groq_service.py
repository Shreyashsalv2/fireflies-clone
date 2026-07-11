"""Groq-backed generation of a meeting's summary, action items, and topics.

Design goal: creation must NEVER fail because of the LLM. If the API key is
absent or the call errors/returns junk, we fall back to a deterministic local
mock built from the transcript text.
"""
from __future__ import annotations

import json
import logging
import re
from collections import Counter

from ..config import settings
from ..models import GeneratedBy

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are an expert meeting assistant. Given a meeting transcript, produce a "
    "concise, well-structured summary. Respond ONLY with a JSON object of this form:\n"
    "{\n"
    '  "overview": "a detailed 5-8 sentence narrative summary of the meeting",\n'
    '  "action_items": [{"text": "clear task", "assignee": "name or null"}],\n'
    '  "topics": [{"title": "short topic/chapter title"}]\n'
    "}\n"
    "Include 3-6 action items and 3-6 topics. Output nothing outside the JSON object."
)

_STOPWORDS = {
    "about", "above", "after", "again", "against", "their", "there", "these",
    "would", "could", "should", "which", "while", "where", "being", "going",
    "really", "thing", "things", "gonna", "wanna", "yeah", "okay", "right",
    "think", "know", "just", "like", "want", "need", "make", "sure", "that",
    "this", "with", "have", "from", "they", "them", "then", "than", "your",
    "were", "what", "when", "will", "into", "some", "more", "much", "very",
    "also", "does", "done", "over", "here", "team", "meeting", "today",
}


def generate_meeting_insights(title: str, transcript: str) -> dict:
    """Return {overview, action_items, topics, generated_by}."""
    if settings.groq_api_key:
        try:
            return _generate_with_groq(title, transcript)
        except Exception as exc:  # noqa: BLE001 - AI must never break creation
            logger.warning("Groq generation failed (%s); using mock fallback.", exc)
    return _mock_insights(title, transcript)


_CHAT_SYSTEM_PROMPT = (
    "You are a helpful assistant answering questions about ONE meeting, using ONLY the meeting "
    "transcript provided below as your source of truth.\n"
    "- Answer strictly from the transcript; do not use outside knowledge or invent details.\n"
    "- If the transcript does not contain the answer, say you don't know based on this meeting.\n"
    "- Be concise and conversational; reference speakers when it helps."
)


def chat_with_meeting(
    transcript: str, question: str, history: list[dict] | None = None
) -> str:
    """Answer a question grounded strictly in a single meeting's transcript."""
    if not settings.groq_api_key:
        return "The chat assistant isn't available right now (no AI key is configured)."
    try:
        from groq import Groq

        transcript = transcript.strip()
        if len(transcript) > 14000:
            transcript = transcript[:14000] + "\n...[truncated]"

        messages = [
            {"role": "system", "content": f"{_CHAT_SYSTEM_PROMPT}\n\nTranscript:\n{transcript}"}
        ]
        for turn in (history or [])[-8:]:
            role = turn.get("role")
            content = str(turn.get("content", "")).strip()
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": question.strip()})

        client = Groq(api_key=settings.groq_api_key)
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=0.2,
            max_tokens=500,
        )
        answer = (response.choices[0].message.content or "").strip()
        return answer or "I'm not sure how to answer that from this meeting."
    except Exception as exc:  # noqa: BLE001 - never crash the endpoint
        logger.warning("Groq chat failed: %s", exc)
        return "Sorry, I couldn't reach the AI service just now. Please try again."


# --- Groq -------------------------------------------------------------------
def _build_user_prompt(title: str, transcript: str, max_chars: int = 12000) -> str:
    transcript = transcript.strip()
    if len(transcript) > max_chars:
        transcript = transcript[:max_chars] + "\n...[truncated]"
    return f"Meeting title: {title}\n\nTranscript:\n{transcript}"


def _generate_with_groq(title: str, transcript: str) -> dict:
    from groq import Groq

    client = Groq(api_key=settings.groq_api_key)
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(title, transcript)},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    data = json.loads(response.choices[0].message.content or "{}")
    overview = str(data.get("overview", "")).strip()
    if not overview:
        raise ValueError("empty overview from model")
    return {
        "overview": overview,
        "action_items": _clean_action_items(data.get("action_items")),
        "topics": _clean_topics(data.get("topics")),
        "generated_by": GeneratedBy.groq,
    }


def _clean_action_items(items) -> list[dict]:
    cleaned: list[dict] = []
    for it in items or []:
        if isinstance(it, str):
            text, assignee = it.strip(), None
        elif isinstance(it, dict):
            text = str(it.get("text") or it.get("task") or "").strip()
            raw_assignee = it.get("assignee")
            assignee = str(raw_assignee).strip() if raw_assignee else None
            if assignee and assignee.lower() in {"null", "none", "n/a", "unassigned"}:
                assignee = None
        else:
            continue
        if text:
            cleaned.append({"text": text, "assignee": assignee})
    return cleaned


def _clean_topics(topics) -> list[dict]:
    cleaned: list[dict] = []
    for t in topics or []:
        if isinstance(t, str):
            title = t.strip()
        elif isinstance(t, dict):
            title = str(t.get("title") or t.get("name") or "").strip()
        else:
            continue
        if title:
            cleaned.append({"title": title})
    return cleaned


# --- Deterministic mock -----------------------------------------------------
def _strip_speaker(line: str) -> str:
    return re.sub(r"^[^:]{1,40}:", "", line).strip()


def _sentences(transcript: str) -> list[str]:
    text = " ".join(_strip_speaker(ln) for ln in transcript.splitlines() if ln.strip())
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if len(p.split()) > 4]


def _mock_insights(title: str, transcript: str) -> dict:
    sentences = _sentences(transcript)
    overview = " ".join(sentences[:6]) or f"Summary of the meeting '{title}'."

    intent_kw = ("will ", "need to", "should ", "let's", "action", "follow up",
                 "follow-up", "to-do", "todo", "next step", "by tomorrow", "by next")
    actions = [s for s in sentences if any(k in s.lower() for k in intent_kw)][:5]
    if not actions:
        actions = sentences[:3]
    action_items = [{"text": s[:200], "assignee": None} for s in actions]

    words = re.findall(r"[A-Za-z][A-Za-z'-]{3,}", " ".join(sentences).lower())
    keywords = [w for w in words if w not in _STOPWORDS]
    topics = [{"title": w.capitalize()} for w, _ in Counter(keywords).most_common(5)]
    if not topics:
        topics = [{"title": "General Discussion"}]

    return {
        "overview": overview,
        "action_items": action_items,
        "topics": topics,
        "generated_by": GeneratedBy.mock,
    }
