import { Bell, Plug, Shield, UserRound } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/feedback";

const SECTIONS = [
  {
    icon: Bell,
    title: "Notifications",
    desc: "Email and in-app alerts for new summaries and action items.",
  },
  {
    icon: Plug,
    title: "Integrations",
    desc: "Connect Zoom, Google Meet, Slack, and your CRM.",
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    desc: "Manage data retention, exports, and access controls.",
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Manage your workspace preferences.
      </p>

      <div className="mb-4 rounded-2xl border border-line bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
          <UserRound size={16} /> Profile
        </div>
        <div className="flex items-center gap-4">
          <Avatar name="You" size={48} />
          <div>
            <p className="font-medium text-ink">You</p>
            <p className="text-sm text-muted">Default workspace user (no auth in this demo)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-panel text-muted">
                <s.icon size={17} />
              </span>
              <div>
                <p className="font-medium text-ink">{s.title}</p>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            </div>
            <Badge className="bg-brand-soft text-brand">Coming soon</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
