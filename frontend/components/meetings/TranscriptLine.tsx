"use client";

import { Avatar } from "@/components/ui/Avatar";
import { formatTimestamp } from "@/lib/format";
import type { Segment } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Split text into nodes with <mark> around case-insensitive query matches. */
function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  let idx = lower.indexOf(ql, i);
  while (idx !== -1) {
    if (idx > i) parts.push(text.slice(i, idx));
    parts.push(
      <mark key={key++} className="hl">
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    i = idx + q.length;
    idx = lower.indexOf(ql, i);
  }
  parts.push(text.slice(i));
  return parts;
}

export function TranscriptLine({
  segment,
  active,
  query,
  onSeek,
  innerRef,
}: {
  segment: Segment;
  active: boolean;
  query: string;
  onSeek: (time: number, play?: boolean) => void;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={innerRef}
      onClick={() => onSeek(segment.start_time, true)}
      className={cn(
        "flex cursor-pointer gap-3 rounded-lg px-3 py-2.5 transition",
        active ? "bg-brand-soft ring-1 ring-brand/20" : "hover:bg-panel",
      )}
    >
      <Avatar name={segment.speaker} size={30} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{segment.speaker}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSeek(segment.start_time, true);
            }}
            className={cn(
              "font-mono text-xs tabular-nums transition",
              active ? "text-brand" : "text-muted hover:text-brand",
            )}
          >
            {formatTimestamp(segment.start_time)}
          </button>
        </div>
        <p className={cn("text-sm leading-relaxed", active ? "text-ink" : "text-ink/80")}>
          {highlight(segment.text, query)}
        </p>
      </div>
    </div>
  );
}
