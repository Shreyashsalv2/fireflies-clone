"use client";

import { LogOut, Settings as SettingsIcon, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/Avatar";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        className="block rounded-full ring-2 ring-transparent transition hover:ring-line focus:outline-none focus-visible:ring-brand"
      >
        <Avatar name="You" size={34} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-card py-1.5 shadow-xl">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name="You" size={38} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">You</p>
              <p className="truncate text-xs text-muted">Free workspace · not signed in</p>
            </div>
          </div>

          <div className="my-1 border-t border-line" />

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink transition hover:bg-panel"
          >
            <UserRound size={16} /> Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink transition hover:bg-panel"
          >
            <SettingsIcon size={16} /> Settings
          </Link>

          <div className="my-1 border-t border-line" />

          <button
            onClick={() => {
              setOpen(false);
              toast("Authentication isn't part of this demo — you're a default user.");
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink transition hover:bg-panel"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
