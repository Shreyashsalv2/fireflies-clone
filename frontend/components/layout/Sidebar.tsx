"use client";

import {
  Home,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ size?: number }>;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Search", href: "/search", icon: Search },
  { label: "Uploads", icon: Upload, soon: true },
  { label: "Integrations", icon: Puzzle, soon: true },
  { label: "Team", icon: Users, soon: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, collapsed, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-card transition-transform duration-300 ease-in-out",
          // mobile: controlled by the drawer state
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // desktop: controlled by the collapse state (overrides the mobile class)
          collapsed ? "md:-translate-x-full" : "md:translate-x-0",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 px-5 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-indigo-500 text-white shadow-sm">
            <Sparkles size={17} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Fireflies
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active =
              item.href &&
              (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
            const className = cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-brand-soft text-brand"
                : "text-muted hover:bg-panel hover:text-ink",
            );
            const inner = (
              <>
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.soon && (
                  <span className="ml-auto rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Soon
                  </span>
                )}
              </>
            );

            return item.href ? (
              <Link key={item.label} href={item.href} className={className}>
                {inner}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => toast(`${item.label} — coming soon`)}
                className={cn(className, "w-full text-left")}
              >
                {inner}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-semibold text-white">
              YO
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">You</p>
              <p className="truncate text-xs text-muted">Free workspace</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
