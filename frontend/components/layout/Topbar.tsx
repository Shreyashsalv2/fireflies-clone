"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { CreateMeetingButton } from "@/components/meetings/CreateMeeting";
import GlobalSearch from "./GlobalSearch";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-card/80 px-4 backdrop-blur md:px-6">
      <Link href="/" className="flex items-center gap-2 md:hidden" aria-label="Home">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-indigo-500 text-white">
          <Sparkles size={16} />
        </span>
      </Link>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <CreateMeetingButton size="sm" />
      </div>
    </header>
  );
}
