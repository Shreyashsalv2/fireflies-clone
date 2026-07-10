"use client";

import { ListTodo, RotateCw, Sparkles } from "lucide-react";

import { Spinner } from "@/components/ui/feedback";
import { formatTimestamp } from "@/lib/format";
import { useRegenerateSummary } from "@/lib/hooks";
import type { GeneratedBy, MeetingDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ActionItems } from "./ActionItems";

const GEN_BADGE: Record<GeneratedBy, { label: string; cls: string }> = {
  seeded: { label: "Seeded", cls: "bg-panel text-muted" },
  groq: { label: "AI · Groq", cls: "bg-brand-soft text-brand" },
  mock: {
    label: "Mock",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
};

export function SummaryPanel({
  meeting,
  onSeekTopic,
}: {
  meeting: MeetingDetail;
  onSeekTopic: (time: number) => void;
}) {
  const regen = useRegenerateSummary(meeting.id);
  const gb = meeting.summary?.generated_by;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand" />
            <h2 className="text-sm font-semibold text-ink">AI Summary</h2>
            {gb && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  GEN_BADGE[gb].cls,
                )}
              >
                {GEN_BADGE[gb].label}
              </span>
            )}
          </div>
          <button
            onClick={() => regen.mutate()}
            disabled={regen.isPending}
            className="flex items-center gap-1 text-xs font-medium text-brand transition hover:text-brand-strong disabled:opacity-50"
          >
            {regen.isPending ? <Spinner /> : <RotateCw size={13} />} Regenerate
          </button>
        </div>
        {meeting.summary?.overview ? (
          <p className="text-sm leading-relaxed text-ink/90">
            {meeting.summary.overview}
          </p>
        ) : (
          <p className="text-sm text-muted">
            No summary yet — click Regenerate to create one.
          </p>
        )}
      </section>

      {meeting.topics.length > 0 && (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">Key Topics</h2>
          <ul className="space-y-0.5">
            {meeting.topics.map((t, i) => (
              <li key={t.id}>
                <button
                  onClick={() => t.start_time != null && onSeekTopic(t.start_time)}
                  disabled={t.start_time == null}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-ink transition",
                    t.start_time != null ? "hover:bg-panel" : "cursor-default",
                  )}
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-[10px] font-semibold text-brand">
                    {i + 1}
                  </span>
                  <span className="flex-1">{t.title}</span>
                  {t.start_time != null && (
                    <span className="font-mono text-xs tabular-nums text-muted">
                      {formatTimestamp(t.start_time)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <ListTodo size={16} className="text-brand" />
          <h2 className="text-sm font-semibold text-ink">Action Items</h2>
          <span className="rounded-full bg-panel px-1.5 py-0.5 text-[11px] font-medium text-muted">
            {meeting.action_items.filter((a) => a.completed).length}/
            {meeting.action_items.length}
          </span>
        </div>
        <ActionItems meetingId={meeting.id} items={meeting.action_items} />
      </section>
    </div>
  );
}
