import Link from "next/link";
import {
  UserPlus,
  CalendarCheck,
  Megaphone,
  Banknote,
  FileSignature,
  ShieldCheck,
  Globe,
  Building2,
  ClipboardList,
  GraduationCap,
  FileText,
  Send,
} from "lucide-react";
import { isGovtPrimaryModeEnabled } from "@/lib/config";

const actions = [
  {
    label: "Add Student",
    primaryLabel: "Add Pupil",
    href: "/dashboard/students",
    icon: UserPlus,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Take Attendance",
    href: "/dashboard/attendance",
    icon: CalendarCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    label: "Create Notice",
    href: "/dashboard/announcements",
    icon: Megaphone,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    label: "Collect Fee",
    href: "/dashboard/finance",
    icon: Banknote,
    color: "text-cyan-600",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    label: "Add Result",
    href: "/dashboard/grades",
    icon: FileText,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    label: "Send SMS",
    href: "/dashboard/announcements",
    icon: Send,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    label: "Principal Signature",
    href: "/dashboard/settings?tab=academic",
    icon: FileSignature,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    hideInGovtPrimary: true,
  },
  {
    label: "Access Requests",
    href: "/dashboard/settings?tab=access",
    icon: ShieldCheck,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    hideInGovtPrimary: true,
  },
  {
    label: "School Profile",
    href: "/dashboard/settings?tab=profile",
    icon: Building2,
    color: "text-slate-600",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
];

export function QuickActions() {
  const govtPrimaryMode = isGovtPrimaryModeEnabled();
  const visibleActions = actions.filter(
    (action) => !(govtPrimaryMode && action.hideInGovtPrimary),
  );

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-base font-semibold tracking-tight">
          Quick Actions
        </h2>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2 sm:grid-cols-3">
        {visibleActions.slice(0, 6).map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/30 bg-muted/30 p-3 hover:bg-muted/60 hover:border-border transition-all duration-200 group/action"
            >
              <div
                className={`p-2.5 rounded-lg ${action.bg} ${action.color} group-hover/action:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight line-clamp-1">
                {govtPrimaryMode
                  ? (action.primaryLabel ?? action.label)
                  : action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
