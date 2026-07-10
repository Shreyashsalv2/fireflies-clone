"use client";

import { ArrowUpDown, Search, X } from "lucide-react";

import type { SortOption } from "@/lib/types";

export function SearchFilterBar({
  search,
  onSearch,
  sort,
  onSort,
  date,
  onDate,
}: {
  search: string;
  onSearch: (v: string) => void;
  sort: SortOption;
  onSort: (v: SortOption) => void;
  date: string;
  onDate: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Filter by title or participant…"
          className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-9 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            aria-label="Clear"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => onDate(e.target.value)}
        className="h-10 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />

      <div className="relative">
        <ArrowUpDown
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as SortOption)}
          className="h-10 cursor-pointer appearance-none rounded-lg border border-line bg-card pl-9 pr-8 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </div>
    </div>
  );
}
