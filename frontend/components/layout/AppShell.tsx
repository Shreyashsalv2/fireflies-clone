"use client";

import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import Topbar from "./Topbar";

function Shell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <>
      <Sidebar />
      {/* Content is pushed right by the sidebar width on desktop; margin
          animates as the sidebar collapses/expands. */}
      <div
        className={cn(
          "flex h-full flex-col transition-[margin] duration-300 ease-in-out",
          collapsed ? "md:ml-0" : "md:ml-60",
        )}
      >
        <Topbar />
        <main className="scroll-slim flex-1 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Shell>{children}</Shell>
    </SidebarProvider>
  );
}
