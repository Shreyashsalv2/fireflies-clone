"use client";

import { PanelLeft } from "lucide-react";

import { CreateMeetingButton } from "@/components/meetings/CreateMeeting";
import GlobalSearch from "./GlobalSearch";
import { useSidebar } from "./SidebarContext";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function Topbar() {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-card px-4 md:px-6">
      <button
        onClick={toggle}
        aria-label="Toggle sidebar"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-panel hover:text-ink"
      >
        <PanelLeft size={18} />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        <CreateMeetingButton size="sm" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
