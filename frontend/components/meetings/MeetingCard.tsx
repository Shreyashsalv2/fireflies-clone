"use client";

import { Calendar, Clock, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AvatarStack } from "@/components/ui/Avatar";
import { TagPill } from "@/components/ui/feedback";
import { formatDate, formatDuration, formatRelative } from "@/lib/format";
import { useDeleteMeeting } from "@/lib/hooks";
import type { MeetingListItem } from "@/lib/types";

export function MeetingCard({ meeting }: { meeting: MeetingListItem }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const del = useDeleteMeeting();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onDelete() {
    setMenuOpen(false);
    if (confirm(`Delete "${meeting.title}"? This cannot be undone.`)) {
      del.mutate(meeting.id);
    }
  }

  return (
    <div className="group relative rounded-2xl border border-line bg-card transition hover:border-brand/40 hover:shadow-md">
      <Link href={`/meetings/${meeting.id}`} className="block p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 pr-6 text-[15px] font-semibold text-ink">
            {meeting.title}
          </h3>
          <span className="shrink-0 text-xs text-muted">
            {formatRelative(meeting.meeting_date)}
          </span>
        </div>

        {meeting.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted">{meeting.description}</p>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={13} /> {formatDate(meeting.meeting_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} /> {formatDuration(meeting.duration_seconds)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AvatarStack names={meeting.participants.map((p) => p.name)} />
            <span className="text-xs text-muted">
              {meeting.participants.length}{" "}
              {meeting.participants.length === 1 ? "person" : "people"}
            </span>
          </div>
          {meeting.tags.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {meeting.tags.slice(0, 2).map((t) => (
                <TagPill key={t.id}>{t.name}</TagPill>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Kebab menu (outside the Link so it doesn't navigate) */}
      <div ref={menuRef} className="absolute right-3 top-4">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Meeting options"
          className="grid h-7 w-7 place-items-center rounded-md text-muted opacity-0 transition hover:bg-panel hover:text-ink focus:opacity-100 group-hover:opacity-100"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 w-36 overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg">
            <button
              onClick={onDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-panel"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
