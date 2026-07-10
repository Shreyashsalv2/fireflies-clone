"""Export a meeting's transcript + summary as Markdown or plain text."""
from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session

from .. import models
from ..database import get_session

router = APIRouter(prefix="/api", tags=["export"])


def _fmt_ts(seconds: float) -> str:
    seconds = int(seconds or 0)
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    return f"{h:d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def _slug(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or "meeting"


def _render_markdown(m: models.Meeting) -> str:
    lines = [f"# {m.title}", ""]
    lines.append(f"**Date:** {m.meeting_date:%b %d, %Y}  ")
    lines.append(f"**Duration:** {_fmt_ts(m.duration_seconds)}  ")
    if m.participants:
        lines.append(f"**Participants:** {', '.join(p.name for p in m.participants)}")
    lines.append("")

    if m.summary and m.summary.overview:
        lines += ["## Summary", "", m.summary.overview, ""]
    if m.topics:
        lines += ["## Key Topics", ""]
        lines += [f"- {t.title}" for t in m.topics]
        lines.append("")
    if m.action_items:
        lines += ["## Action Items", ""]
        for a in m.action_items:
            box = "x" if a.completed else " "
            who = f" _(@{a.assignee})_" if a.assignee else ""
            lines.append(f"- [{box}] {a.text}{who}")
        lines.append("")

    lines += ["## Transcript", ""]
    for seg in m.segments:
        lines.append(f"**[{_fmt_ts(seg.start_time)}] {seg.speaker}:** {seg.text}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def _render_text(m: models.Meeting) -> str:
    lines = [m.title, "=" * len(m.title), ""]
    lines.append(f"Date: {m.meeting_date:%b %d, %Y}")
    lines.append(f"Duration: {_fmt_ts(m.duration_seconds)}")
    if m.participants:
        lines.append(f"Participants: {', '.join(p.name for p in m.participants)}")
    lines.append("")

    if m.summary and m.summary.overview:
        lines += ["SUMMARY", "-------", m.summary.overview, ""]
    if m.topics:
        lines += ["KEY TOPICS", "----------"]
        lines += [f"* {t.title}" for t in m.topics]
        lines.append("")
    if m.action_items:
        lines += ["ACTION ITEMS", "------------"]
        for a in m.action_items:
            mark = "[x]" if a.completed else "[ ]"
            who = f" (@{a.assignee})" if a.assignee else ""
            lines.append(f"{mark} {a.text}{who}")
        lines.append("")

    lines += ["TRANSCRIPT", "----------"]
    for seg in m.segments:
        lines.append(f"[{_fmt_ts(seg.start_time)}] {seg.speaker}: {seg.text}")
    return "\n".join(lines).rstrip() + "\n"


@router.get("/meetings/{meeting_id}/export")
def export_meeting(
    meeting_id: int,
    format: str = Query("md", pattern="^(md|txt)$"),
    session: Session = Depends(get_session),
):
    meeting = session.get(models.Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if format == "md":
        content, media_type = _render_markdown(meeting), "text/markdown"
    else:
        content, media_type = _render_text(meeting), "text/plain"

    filename = f"{_slug(meeting.title)}.{format}"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
