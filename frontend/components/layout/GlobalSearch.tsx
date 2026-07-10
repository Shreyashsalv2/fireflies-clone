"use client";

import { FileText, MessageSquareText, Search, Tag, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useSearch } from "@/lib/hooks";
import type { SearchMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

const FIELD_ICON: Record<SearchMatch["field"], React.ComponentType<{ size?: number }>> = {
  title: FileText,
  participant: User,
  summary: MessageSquareText,
  transcript: Tag,
};

export default function GlobalSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 250);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data, isFetching } = useSearch(debounced);
  const results = data?.results.slice(0, 8) ?? [];

  function go(match: SearchMatch) {
    const q =
      match.field === "transcript" && match.start_time != null
        ? `?t=${Math.floor(match.start_time)}`
        : "";
    setOpen(false);
    setValue("");
    router.push(`/meetings/${match.meeting_id}${q}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form onSubmit={onSubmit}>
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search meetings, people, transcripts…"
          className="h-9 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </form>

      {open && debounced.trim() && (
        <div className="scroll-slim absolute z-40 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-xl">
          {isFetching && results.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted">Searching…</p>
          )}
          {!isFetching && results.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted">No matches found.</p>
          )}
          {results.map((m, i) => {
            const Icon = FIELD_ICON[m.field];
            return (
              <button
                key={`${m.meeting_id}-${m.field}-${i}`}
                onClick={() => go(m)}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-panel"
              >
                <Icon size={16} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {m.meeting_title}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    <span className="capitalize text-brand">{m.field}</span> · {m.snippet}
                  </span>
                </span>
              </button>
            );
          })}
          {data && data.count > results.length && (
            <button
              onClick={onSubmit}
              className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-brand hover:bg-panel"
            >
              View all {data.count} results →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
