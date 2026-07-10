"""Parse pasted / uploaded transcripts into normalized segments.

Supported inputs (auto-detected):
  * JSON    – a list of {speaker, text, start|start_time, end|end_time}, or an
              object wrapping such a list under "segments"/"transcript"/"results".
  * WebVTT  – standard cue blocks, optional ``<v Speaker>`` voice tags.
  * Plain   – lines like "Speaker [00:12]: text", "00:12 Speaker: text", or
              "Speaker: text" (timings are synthesized when absent so the media
              player still has a usable timeline).

Every parser returns a list of dicts:
    {speaker, text, start_time, end_time, order_index}
"""
from __future__ import annotations

import json
import re
from typing import Optional

WORDS_PER_SECOND = 2.5  # ~150 wpm; used to synthesize timings for plain text
MIN_SEGMENT_SECONDS = 2.0


def parse_transcript(raw: str) -> list[dict]:
    raw = (raw or "").strip()
    if not raw:
        return []
    if raw[0] in "[{":
        try:
            segments = _parse_json(raw)
            if segments:
                return segments
        except (ValueError, KeyError, TypeError):
            pass
    if "-->" in raw or raw.upper().startswith("WEBVTT"):
        segments = _parse_vtt(raw)
        if segments:
            return segments
    return _parse_plain(raw)


def participants_from_segments(segments: list[dict]) -> list[str]:
    """Distinct speaker names, in first-seen order."""
    seen: list[str] = []
    for seg in segments:
        name = seg.get("speaker")
        if name and name not in seen:
            seen.append(name)
    return seen


# --- helpers ----------------------------------------------------------------
def _estimate_duration(text: str) -> float:
    words = len(text.split())
    return max(MIN_SEGMENT_SECONDS, round(words / WORDS_PER_SECOND, 2))


def _segment(speaker: str, text: str, start: float, end: float, index: int) -> dict:
    start = round(float(start), 2)
    end = round(float(end), 2)
    if end <= start:
        end = round(start + MIN_SEGMENT_SECONDS, 2)
    return {
        "speaker": (speaker or "Speaker").strip()[:120] or "Speaker",
        "text": text.strip(),
        "start_time": start,
        "end_time": end,
        "order_index": index,
    }


def _to_seconds(ts: Optional[str]) -> Optional[float]:
    if not ts:
        return None
    ts = ts.strip().replace(",", ".")
    try:
        parts = [float(p) for p in ts.split(":")]
    except ValueError:
        return None
    if len(parts) == 3:
        h, m, s = parts
    elif len(parts) == 2:
        h, m, s = 0.0, parts[0], parts[1]
    elif len(parts) == 1:
        h, m, s = 0.0, 0.0, parts[0]
    else:
        return None
    return h * 3600 + m * 60 + s


# --- JSON -------------------------------------------------------------------
def _parse_json(raw: str) -> list[dict]:
    data = json.loads(raw)
    if isinstance(data, dict):
        for key in ("segments", "transcript", "results"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
        else:
            raise ValueError("no segment list found in JSON object")
    if not isinstance(data, list):
        raise ValueError("expected a JSON list of segments")

    segments: list[dict] = []
    prev_end = 0.0
    for item in data:
        if not isinstance(item, dict):
            continue
        speaker = str(
            item.get("speaker") or item.get("speaker_name") or item.get("name") or "Speaker"
        )
        text = str(item.get("text") or item.get("content") or "").strip()
        if not text:
            continue
        start = item.get("start_time", item.get("start"))
        end = item.get("end_time", item.get("end"))
        start = float(start) if start is not None else prev_end
        end = float(end) if end is not None else start + _estimate_duration(text)
        prev_end = end
        segments.append(_segment(speaker, text, start, end, len(segments)))
    return segments


# --- WebVTT -----------------------------------------------------------------
_VOICE_RE = re.compile(r"<v\s+([^>]+)>", re.IGNORECASE)
_TAG_RE = re.compile(r"<[^>]+>")


def _parse_vtt(raw: str) -> list[dict]:
    blocks = re.split(r"\n\s*\n", raw.replace("\r\n", "\n"))
    segments: list[dict] = []
    for block in blocks:
        lines = [ln for ln in block.split("\n") if ln.strip()]
        timing_idx = next((i for i, ln in enumerate(lines) if "-->" in ln), None)
        if timing_idx is None:
            continue
        start_raw, _, end_raw = lines[timing_idx].partition("-->")
        start = _to_seconds(start_raw) or 0.0
        end = _to_seconds(end_raw.split()[0]) if end_raw.strip() else None

        text_raw = " ".join(lines[timing_idx + 1:]).strip()
        voice = _VOICE_RE.search(text_raw)
        speaker = voice.group(1).strip() if voice else "Speaker"
        text = _TAG_RE.sub("", text_raw).strip()
        if not text:
            continue
        # "Speaker: words" inside the cue, when no <v> tag was present
        if not voice and ":" in text:
            maybe_speaker, _, rest = text.partition(":")
            if len(maybe_speaker.split()) <= 4 and rest.strip():
                speaker, text = maybe_speaker.strip(), rest.strip()
        if end is None:
            end = start + _estimate_duration(text)
        segments.append(_segment(speaker, text, start, end, len(segments)))
    return segments


# --- Plain text -------------------------------------------------------------
_PLAIN_PATTERNS = [
    # Speaker [00:12]:  /  Speaker (00:12):
    re.compile(
        r"^(?P<speaker>[^:\[\]()]+?)\s*[\[(](?P<ts>\d{1,2}:\d{2}(?::\d{2})?)[\])]\s*:\s*(?P<text>.*)$"
    ),
    # [00:12] Speaker:  /  00:12 Speaker:
    re.compile(
        r"^[\[(]?(?P<ts>\d{1,2}:\d{2}(?::\d{2})?)[\])]?\s+(?P<speaker>[A-Za-z][\w .'-]{0,40}?)\s*:\s*(?P<text>.*)$"
    ),
    # Speaker: text
    re.compile(r"^(?P<speaker>[A-Za-z][\w .'-]{0,40}?)\s*:\s*(?P<text>.*)$"),
]


def _parse_plain(raw: str) -> list[dict]:
    segments: list[dict] = []
    prev_end = 0.0
    last_speaker = "Speaker"
    for line in raw.split("\n"):
        line = line.strip()
        if not line:
            continue
        speaker = ts = text = None
        for pat in _PLAIN_PATTERNS:
            m = pat.match(line)
            if m:
                gd = m.groupdict()
                speaker = (gd.get("speaker") or "").strip() or last_speaker
                ts = gd.get("ts")
                text = (gd.get("text") or "").strip()
                break
        if text is None:
            # Continuation of the previous speaker's turn.
            if segments:
                merged = (segments[-1]["text"] + " " + line).strip()
                segments[-1]["text"] = merged
                segments[-1]["end_time"] = round(
                    segments[-1]["start_time"] + _estimate_duration(merged), 2
                )
                prev_end = segments[-1]["end_time"]
                continue
            speaker, text = last_speaker, line
        if not text:
            continue
        start = _to_seconds(ts)
        if start is None:
            start = prev_end
        end = start + _estimate_duration(text)
        prev_end = end
        last_speaker = speaker
        segments.append(_segment(speaker, text, start, end, len(segments)))
    return segments
