"use client";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Segment } from "@/lib/types";
import { TranscriptLine } from "./TranscriptLine";

export function TranscriptPanel({
  segments,
  activeIndex,
  isPlaying,
  onSeek,
}: {
  segments: Segment[];
  activeIndex: number;
  isPlaying: boolean;
  onSeek: (time: number, play?: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [matchPos, setMatchPos] = useState(0);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as number[];
    return segments.reduce<number[]>((acc, s, i) => {
      if (s.text.toLowerCase().includes(q)) acc.push(i);
      return acc;
    }, []);
  }, [query, segments]);

  useEffect(() => setMatchPos(0), [query]);

  // Scroll to the current search match.
  useEffect(() => {
    if (matches.length === 0) return;
    lineRefs.current
      .get(matches[matchPos])
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [matchPos, matches]);

  // Follow the active line while playing.
  useEffect(() => {
    if (!isPlaying || activeIndex < 0) return;
    lineRefs.current
      .get(activeIndex)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, isPlaying]);

  function gotoMatch(dir: number) {
    if (matches.length === 0) return;
    const next = (matchPos + dir + matches.length) % matches.length;
    setMatchPos(next);
    onSeek(segments[matches[next]].start_time, false);
  }

  return (
    <div className="rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Transcript</h2>
        <div className="relative flex items-center">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find in transcript…"
            className="h-8 w-44 rounded-lg border border-line bg-canvas pl-8 pr-14 text-sm text-ink outline-none transition placeholder:text-muted focus:w-56 focus:border-brand"
          />
          {query && (
            <div className="absolute right-1.5 flex items-center gap-0.5">
              <span className="mr-1 text-[11px] tabular-nums text-muted">
                {matches.length ? `${matchPos + 1}/${matches.length}` : "0"}
              </span>
              <button
                onClick={() => gotoMatch(-1)}
                disabled={!matches.length}
                aria-label="Previous match"
                className="text-muted hover:text-brand disabled:opacity-40"
              >
                <ChevronUp size={15} />
              </button>
              <button
                onClick={() => gotoMatch(1)}
                disabled={!matches.length}
                aria-label="Next match"
                className="text-muted hover:text-brand disabled:opacity-40"
              >
                <ChevronDown size={15} />
              </button>
              <button
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="text-muted hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="scroll-slim max-h-[68vh] space-y-0.5 overflow-y-auto p-2">
        {segments.map((s, i) => (
          <TranscriptLine
            key={s.id}
            segment={s}
            active={i === activeIndex}
            query={query}
            onSeek={onSeek}
            innerRef={(el) => {
              if (el) lineRefs.current.set(i, el);
              else lineRefs.current.delete(i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
