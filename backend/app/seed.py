"""Seed the database with realistic sample meetings.

Run:  python -m app.seed   (from the backend/ directory)

This DROPS and recreates all tables, then inserts fully-populated meetings so
the app is immediately usable. Seeded summaries are marked ``generated_by=seeded``.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, select

from . import models
from .database import engine
from .models import GeneratedBy


def _dt(y, mo, d, h, mi) -> datetime:
    return datetime(y, mo, d, h, mi, tzinfo=timezone.utc)


# Each meeting: segments are (speaker, start_seconds, text); end = next start.
MEETINGS: list[dict] = [
    {
        "title": "Q3 Product Roadmap Planning",
        "date": _dt(2026, 7, 8, 10, 0),
        "description": "Aligning on Q3 priorities across product, engineering, and design.",
        "tags": ["Product", "Planning"],
        "participants": [
            ("Sarah Chen", "Product Manager"),
            ("Marcus Rodriguez", "Engineering Lead"),
            ("Priya Patel", "Design Lead"),
            ("David Kim", "Data Analyst"),
        ],
        "segments": [
            ("Sarah Chen", 0, "Alright everyone, thanks for joining. Today we need to lock the Q3 roadmap so engineering can start planning sprints next week."),
            ("Marcus Rodriguez", 12, "Sounds good. From the engineering side, the biggest item is the search infrastructure rebuild. It's overdue and it's blocking three other features."),
            ("Priya Patel", 27, "On design, we have the new onboarding flow ready for handoff. I'd love to see that prioritized because our activation numbers have been flat."),
            ("David Kim", 41, "The data backs that up. Activation dropped four percent last quarter, and most of the drop-off happens on the second screen of onboarding."),
            ("Sarah Chen", 56, "Okay, so onboarding and search are both strong candidates. Marcus, how many engineers would the search rebuild need?"),
            ("Marcus Rodriguez", 68, "Realistically three engineers for about six weeks. If we pull in the new hire, maybe five weeks."),
            ("Priya Patel", 80, "Onboarding is much lighter — one engineer and me for about two weeks."),
            ("Sarah Chen", 90, "Let's do onboarding first since it's cheaper and directly tied to activation, then start search in the back half of the quarter."),
            ("David Kim", 103, "I can have an activation dashboard ready so we can measure the onboarding impact in real time."),
            ("Marcus Rodriguez", 114, "Works for me. I'll write up the search rebuild spec and share it by Friday."),
            ("Sarah Chen", 125, "Perfect. Priya, can you send the onboarding handoff to Marcus's team today? Let's reconvene next week to check progress."),
        ],
        "summary": (
            "The team aligned on the Q3 roadmap, prioritizing the onboarding redesign ahead of the "
            "search infrastructure rebuild. Onboarding was chosen first because it is low-cost and "
            "directly tied to the recent four percent activation decline, which data showed concentrates "
            "on the second onboarding screen. The search rebuild, requiring three engineers for roughly "
            "six weeks, will begin in the second half of the quarter."
        ),
        "action_items": [
            ("Write up the search infrastructure rebuild spec and share by Friday", "Marcus Rodriguez", False),
            ("Send the onboarding handoff to the engineering team today", "Priya Patel", False),
            ("Build an activation dashboard to measure onboarding impact", "David Kim", False),
            ("Schedule a follow-up next week to review onboarding progress", "Sarah Chen", False),
        ],
        "topics": [
            ("Q3 roadmap priorities", 0),
            ("Search infrastructure rebuild", 12),
            ("Onboarding redesign & activation", 27),
            ("Resourcing and sequencing", 68),
            ("Next steps", 114),
        ],
    },
    {
        "title": "Weekly Engineering Sync",
        "date": _dt(2026, 7, 9, 9, 30),
        "description": "Standup progress, blockers, and Tuesday's database outage review.",
        "tags": ["Engineering"],
        "participants": [
            ("Marcus Rodriguez", "Engineering Lead"),
            ("Emma Thompson", "Backend Engineer"),
            ("Raj Verma", "Full-stack Engineer"),
            ("Lena Ortiz", "Platform Engineer"),
        ],
        "segments": [
            ("Marcus Rodriguez", 0, "Morning everyone. Quick standup — let's go around with progress and blockers, then the incident review at the end."),
            ("Emma Thompson", 10, "I finished the API rate-limiting work. It's in review now. Once it merges we can close out the abuse report from last month."),
            ("Raj Verma", 22, "I'm still debugging the flaky checkout test. It fails about one in ten runs on CI but never locally. I think it's a race condition in the payment mock."),
            ("Lena Ortiz", 36, "I can pair with you on that this afternoon — I ran into something similar in the notifications service."),
            ("Raj Verma", 44, "That'd help a lot, thanks."),
            ("Marcus Rodriguez", 48, "Good. Emma, anything blocking the rate-limit merge?"),
            ("Emma Thompson", 54, "Just need one more approval. Marcus, if you have ten minutes it'd unblock me."),
            ("Marcus Rodriguez", 62, "I'll review it right after this. Now the incident — the database outage on Tuesday. Lena, can you recap?"),
            ("Lena Ortiz", 72, "Sure. A migration locked the users table for about eight minutes during peak traffic. We didn't have a statement timeout set, so it cascaded."),
            ("Marcus Rodriguez", 86, "Right. So we add statement timeouts to all migrations and require them in the review checklist. Lena, can you own that?"),
            ("Lena Ortiz", 96, "Yes, I'll update the migration guidelines and the PR template."),
            ("Marcus Rodriguez", 104, "Great. Let's keep the incident doc updated and share the postmortem with the wider team by Thursday."),
        ],
        "summary": (
            "The engineering team reviewed in-progress work and Tuesday's database outage. API "
            "rate-limiting is complete and awaiting a final approval; a flaky checkout test remains under "
            "investigation as a suspected race condition in the payment mock, with Lena pairing with Raj. "
            "The outage — an eight-minute lock on the users table during a migration at peak traffic — was "
            "traced to a missing statement timeout, prompting a new requirement to add timeouts to all migrations."
        ),
        "action_items": [
            ("Review and approve the API rate-limiting PR", "Marcus Rodriguez", True),
            ("Pair on the flaky checkout test this afternoon", "Lena Ortiz", False),
            ("Add statement timeouts to migration guidelines and PR template", "Lena Ortiz", False),
            ("Share the outage postmortem with the wider team by Thursday", "Marcus Rodriguez", False),
        ],
        "topics": [
            ("Standup progress", 0),
            ("Flaky checkout test", 22),
            ("API rate-limiting review", 48),
            ("Database outage review", 62),
            ("Migration safeguards", 86),
        ],
    },
    {
        "title": "Acme Corp — Customer Discovery Call",
        "date": _dt(2026, 7, 7, 15, 0),
        "description": "Discovery call with Acme Corp to understand their meeting workflow pain points.",
        "tags": ["Sales", "Customer"],
        "participants": [
            ("Sarah Chen", "Product Manager"),
            ("John Miller", "VP Operations, Acme"),
            ("Rebecca Stone", "Ops Manager, Acme"),
        ],
        "segments": [
            ("Sarah Chen", 0, "Thanks for making time, John and Rebecca. I'd love to understand how your team runs meetings today before we talk about whether we're a fit."),
            ("John Miller", 11, "Happy to. We're a distributed team of about two hundred, and honestly meeting notes are a mess. Everyone takes their own and nothing is searchable."),
            ("Rebecca Stone", 24, "The biggest pain is action items. They get lost in someone's notebook and nobody follows up until it's too late."),
            ("Sarah Chen", 35, "That's a really common problem. How are you capturing recordings today, if at all?"),
            ("John Miller", 43, "We record most calls in Zoom, but the recordings just sit in a folder. Nobody goes back to watch two hours of video."),
            ("Rebecca Stone", 54, "If I could search across all our calls for a customer's name and jump right to that moment, that would change my week."),
            ("Sarah Chen", 65, "That's exactly what we do — search across every transcript, click a result, and it takes you to that timestamp in the recording."),
            ("John Miller", 76, "What about action items? Can they sync to our task tracker?"),
            ("Sarah Chen", 83, "Integrations are on our roadmap. Today we extract action items automatically and you can mark them complete, but two-way sync is coming next quarter."),
            ("Rebecca Stone", 95, "That's fine for now honestly. Even just having them extracted and in one place would be a huge step up."),
            ("John Miller", 104, "Let's set up a pilot with the operations team. Rebecca, can you pick ten of our heaviest meeting users?"),
            ("Sarah Chen", 114, "Wonderful. I'll send over pilot onboarding materials this week and we'll get you set up."),
        ],
        "summary": (
            "Acme Corp, a 200-person distributed team, described fragmented meeting notes and lost action "
            "items as their core pain points, with Zoom recordings going unused. Sarah highlighted searchable "
            "transcripts with click-to-timestamp playback and automatic action-item extraction as direct "
            "solutions, while noting that two-way task-tracker sync is a next-quarter roadmap item. The call "
            "concluded with agreement to launch a pilot with Acme's operations team."
        ),
        "action_items": [
            ("Select ten of Acme's heaviest meeting users for the pilot", "Rebecca Stone", False),
            ("Send pilot onboarding materials this week", "Sarah Chen", False),
            ("Follow up on task-tracker integration timeline for next quarter", "Sarah Chen", False),
        ],
        "topics": [
            ("Current meeting workflow", 11),
            ("Lost action items", 24),
            ("Search & playback needs", 54),
            ("Integrations question", 76),
            ("Pilot agreement", 104),
        ],
    },
    {
        "title": "Design Review: Mobile Onboarding",
        "date": _dt(2026, 7, 6, 13, 0),
        "description": "Reviewing the redesigned mobile onboarding flow before engineering handoff.",
        "tags": ["Design", "Product"],
        "participants": [
            ("Priya Patel", "Design Lead"),
            ("Sarah Chen", "Product Manager"),
            ("Alex Nguyen", "Product Designer"),
        ],
        "segments": [
            ("Alex Nguyen", 0, "I'll walk through the new mobile onboarding. The goal was to cut it from five screens to three and get users to their first value faster."),
            ("Priya Patel", 12, "The first screen looks clean. I like that you moved the value proposition above the sign-up form."),
            ("Sarah Chen", 22, "Quick question — where did the second screen go? The old permissions request?"),
            ("Alex Nguyen", 29, "I moved permissions to a contextual prompt. We only ask for microphone access when they start their first recording, not upfront."),
            ("Sarah Chen", 40, "That's smart. Upfront permission requests were a big drop-off point."),
            ("Priya Patel", 47, "One concern — the progress indicator at the top. On smaller devices it's getting cut off. Can we make it responsive?"),
            ("Alex Nguyen", 56, "Good catch. I'll switch it to a dot indicator that scales down on narrow screens."),
            ("Sarah Chen", 64, "What about accessibility? Are the tap targets big enough?"),
            ("Alex Nguyen", 70, "They meet the forty-four pixel minimum, but I'll double-check contrast on the secondary buttons."),
            ("Priya Patel", 80, "Let's also add a skip option on the third screen. Some power users just want to get in."),
            ("Alex Nguyen", 88, "Agreed. I'll add a subtle skip link, and I can have the revised prototype ready for testing by Wednesday."),
            ("Sarah Chen", 98, "Perfect. Let's run it past five users before we hand it to engineering."),
        ],
        "summary": (
            "The team reviewed a redesigned mobile onboarding flow that reduces five screens to three and "
            "defers the microphone permission to a contextual, in-context prompt to reduce drop-off. Feedback "
            "focused on making the progress indicator responsive on small devices, verifying accessibility "
            "contrast and tap targets, and adding a skip option for power users. Alex will deliver a revised "
            "prototype by Wednesday for a five-user usability test before engineering handoff."
        ),
        "action_items": [
            ("Replace the progress bar with a responsive dot indicator", "Alex Nguyen", False),
            ("Verify color contrast on secondary buttons", "Alex Nguyen", True),
            ("Add a skip link to the third onboarding screen", "Alex Nguyen", False),
            ("Deliver revised prototype for testing by Wednesday", "Alex Nguyen", False),
            ("Recruit five users for the onboarding usability test", "Sarah Chen", False),
        ],
        "topics": [
            ("Onboarding flow overview", 0),
            ("Contextual permissions", 29),
            ("Responsive progress indicator", 47),
            ("Accessibility check", 64),
            ("Skip option & next steps", 80),
        ],
    },
    {
        "title": "Marketing Campaign Kickoff — Fall Launch",
        "date": _dt(2026, 7, 5, 11, 0),
        "description": "Kicking off the six-week fall launch campaign across content, paid, and events.",
        "tags": ["Marketing"],
        "participants": [
            ("Olivia Brooks", "Marketing Lead"),
            ("Tom Harris", "Growth Marketer"),
            ("Nina Kapoor", "Content Strategist"),
        ],
        "segments": [
            ("Olivia Brooks", 0, "Let's kick off the fall launch campaign. We have six weeks until go-live and a lot to coordinate across content, paid, and events."),
            ("Tom Harris", 12, "On paid, I'm proposing we shift budget toward LinkedIn this time. Our B2B conversion there was double what we saw on other channels last quarter."),
            ("Nina Kapoor", 25, "For content, I want to build the campaign around customer stories. The Acme pilot could be a great case study if it lands well."),
            ("Olivia Brooks", 37, "I love the customer-story angle. Nina, can you draft an outline for three case studies?"),
            ("Nina Kapoor", 45, "Yes, I'll have outlines by end of week."),
            ("Tom Harris", 50, "We should also refresh the landing page. The current one hasn't been touched since spring and the messaging is stale."),
            ("Olivia Brooks", 60, "Agreed. Tom, can you work with design on a new landing page focused on the search and action-item features?"),
            ("Tom Harris", 69, "Will do. I'll get a brief to design by Monday."),
            ("Nina Kapoor", 75, "What's our budget for the launch event? Are we doing in-person or virtual this year?"),
            ("Olivia Brooks", 83, "Virtual, to reach the whole customer base. I'll confirm the budget with finance and share it Thursday."),
            ("Olivia Brooks", 93, "Let's meet again next week once we have the outlines and the landing page brief. Great start, everyone."),
        ],
        "summary": (
            "The team kicked off a six-week fall launch campaign spanning content, paid, and events. Paid "
            "strategy will shift budget toward LinkedIn based on strong B2B conversion, while content will "
            "center on customer success stories, potentially featuring the Acme pilot. The group agreed to "
            "refresh the stale landing page around the search and action-item features and to run a virtual "
            "launch event to reach the full customer base."
        ),
        "action_items": [
            ("Draft outlines for three customer case studies by end of week", "Nina Kapoor", False),
            ("Send a new landing-page brief to design by Monday", "Tom Harris", False),
            ("Confirm the launch event budget with finance and share Thursday", "Olivia Brooks", False),
            ("Reconvene next week to review outlines and landing-page brief", "Olivia Brooks", False),
        ],
        "topics": [
            ("Fall launch overview", 0),
            ("Paid channel strategy", 12),
            ("Customer-story content", 25),
            ("Landing page refresh", 50),
            ("Launch event planning", 75),
        ],
    },
]


def _build_segments(rows: list[tuple]) -> list[models.TranscriptSegment]:
    segments = []
    for i, (speaker, start, text) in enumerate(rows):
        if i + 1 < len(rows):
            end = float(rows[i + 1][1])
        else:
            end = float(start) + max(2.0, len(text.split()) / 2.5)
        segments.append(
            models.TranscriptSegment(
                speaker=speaker,
                start_time=float(start),
                end_time=round(end, 2),
                text=text,
                order_index=i,
            )
        )
    return segments


def seed() -> None:
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    tag_cache: dict[str, models.Tag] = {}

    with Session(engine) as session:
        for data in MEETINGS:
            segments = _build_segments(data["segments"])
            duration = int(max(s.end_time for s in segments)) if segments else 0

            tags = []
            for name in data["tags"]:
                tag = tag_cache.get(name)
                if tag is None:
                    tag = models.Tag(name=name)
                    tag_cache[name] = tag
                tags.append(tag)

            meeting = models.Meeting(
                title=data["title"],
                description=data["description"],
                meeting_date=data["date"],
                duration_seconds=duration,
                media_url=None,  # player simulates from duration; no external file
                participants=[
                    models.Participant(name=n, role=r) for n, r in data["participants"]
                ],
                segments=segments,
                summary=models.Summary(
                    overview=data["summary"], generated_by=GeneratedBy.seeded
                ),
                action_items=[
                    models.ActionItem(text=t, assignee=a, completed=c, order_index=i)
                    for i, (t, a, c) in enumerate(data["action_items"])
                ],
                topics=[
                    models.Topic(title=t, start_time=float(st), order_index=i)
                    for i, (t, st) in enumerate(data["topics"])
                ],
                tags=tags,
            )
            session.add(meeting)
        session.commit()

    print(f"Seeded {len(MEETINGS)} meetings.")


def seed_if_empty() -> None:
    """Insert seed data only when the database has no meetings yet.

    Safe to call on every startup — it never deletes existing data. This keeps the
    demo dashboard populated on hosts with an ephemeral filesystem (e.g. Render's
    free tier), where the SQLite file is wiped on each deploy / cold start.
    """
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        has_data = session.exec(select(models.Meeting)).first() is not None
    if not has_data:
        seed()


if __name__ == "__main__":
    seed()
