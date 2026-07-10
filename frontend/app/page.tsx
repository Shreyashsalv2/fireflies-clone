"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

import { CreateMeetingButton } from "@/components/meetings/CreateMeeting";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { SearchFilterBar } from "@/components/meetings/SearchFilterBar";
import { CenteredSpinner, EmptyState } from "@/components/ui/feedback";
import { useMeetings } from "@/lib/hooks";
import type { SortOption } from "@/lib/types";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [date, setDate] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const { data: meetings, isLoading, isError } = useMeetings({
    search: debounced || undefined,
    sort,
    meeting_date: date || undefined,
  });

  const filtering = Boolean(debounced || date);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Meetings</h1>
          <p className="mt-1 text-sm text-muted">
            {meetings ? `${meetings.length} ` : ""}recorded meetings, transcripts &amp; AI
            notes.
          </p>
        </div>
        <div className="hidden sm:block">
          <CreateMeetingButton />
        </div>
      </div>

      <div className="mb-6">
        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          sort={sort}
          onSort={setSort}
          date={date}
          onDate={setDate}
        />
      </div>

      {isLoading ? (
        <CenteredSpinner label="Loading meetings…" />
      ) : isError ? (
        <EmptyState
          icon={<CalendarDays size={32} />}
          title="Couldn't load meetings"
          description="Make sure the backend API is running on http://localhost:8000."
        />
      ) : meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays size={32} />}
          title={filtering ? "No matching meetings" : "No meetings yet"}
          description={
            filtering
              ? "Try a different search term or clear your filters."
              : "Create your first meeting by pasting or uploading a transcript."
          }
          action={!filtering ? <CreateMeetingButton /> : undefined}
        />
      )}
    </div>
  );
}
