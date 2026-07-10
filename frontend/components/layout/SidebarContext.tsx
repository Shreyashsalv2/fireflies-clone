"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type SidebarContextValue = {
  collapsed: boolean; // desktop focus mode (hidden on md+)
  mobileOpen: boolean; // mobile slide-in drawer
  toggle: () => void; // breakpoint-aware: collapse on desktop, open drawer on mobile
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Restore the desktop collapse preference after mount (avoids hydration mismatch).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggle = useCallback(() => {
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) {
      setCollapsed((c) => {
        const next = !c;
        try {
          localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
        } catch {
          /* ignore */
        }
        return next;
      });
    } else {
      setMobileOpen((o) => !o);
    }
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggle, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
