"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { formatDuration } from "@/lib/format";

export function MediaPlayer({
  duration,
  currentTime,
  isPlaying,
  onSeek,
  onPlayPause,
}: {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
}) {
  const max = Math.max(duration, 1);
  const pct = Math.min(100, (currentTime / max) * 100);

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-brand-ink shadow-sm transition hover:bg-brand-strong"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="translate-x-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={max}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{
              background: `linear-gradient(to right, var(--brand) ${pct}%, var(--line) ${pct}%)`,
            }}
          />
          <div className="mt-1.5 flex justify-between font-mono text-xs tabular-nums text-muted">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onSeek(currentTime - 10)}
            aria-label="Back 10 seconds"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-panel hover:text-ink"
          >
            <SkipBack size={17} />
          </button>
          <button
            onClick={() => onSeek(currentTime + 10)}
            aria-label="Forward 10 seconds"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-panel hover:text-ink"
          >
            <SkipForward size={17} />
          </button>
        </div>
      </div>
      <p className="mt-2.5 text-center text-[11px] text-muted">
        Simulated playback · click any transcript line to jump to that moment
      </p>
    </div>
  );
}
