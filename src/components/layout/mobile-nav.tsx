"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Calendar,
  ClipboardCheck,
  School,
  Bell,
  ArchiveRestore,
  CreditCard,
  FileText,
  LogOut,
  Home,
  Settings,
  BarChart3,
} from "lucide-react";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { isGovtPrimaryModeEnabled } from "@/lib/config";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  session: Session;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

function getItems(role?: string): NavItem[] {
  const govtPrimaryMode = isGovtPrimaryModeEnabled();
  const isPrivileged = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "STAFF"].includes(
    role ?? "",
  );

  if (role === "STUDENT") {
    return [
      { href: "/dashboard/portal/student", icon: Home, label: "হোম" },
      { href: "/dashboard/portal/student", icon: FileText, label: "ফি" },
      { href: "/dashboard/portal/student", icon: School, label: "রেজাল্ট" },
      { href: "/dashboard/portal/student", icon: Bell, label: "নোটিশ" },
    ];
  }

  if (role === "PARENT") {
    return [
      { href: "/dashboard/portal/parent", icon: Home, label: "হোম" },
      { href: "/dashboard/portal/parent", icon: Users, label: "সন্তান" },
      { href: "/dashboard/portal/parent", icon: CreditCard, label: "ফি" },
      { href: "/dashboard/portal/parent", icon: Bell, label: "নোটিশ" },
    ];
  }

  if (role === "TEACHER") {
    return [
      { href: "/dashboard/portal/teacher", icon: Home, label: "হোম" },
      {
        href: "/dashboard/attendance",
        icon: ClipboardCheck,
        label: "উপস্থিতি",
      },
      { href: "/dashboard/grades", icon: School, label: "গ্রেড" },
      { href: "/dashboard/events", icon: Calendar, label: "রুটিন" },
    ];
  }

  if (isPrivileged) {
    return [
      { href: "/dashboard", icon: Home, label: "হোম" },
      { href: "/dashboard/students", icon: GraduationCap, label: "ছাত্র" },
      {
        href: "/dashboard/attendance",
        icon: ClipboardCheck,
        label: "উপস্থিতি",
      },
      { href: "/dashboard/finance", icon: CreditCard, label: "অর্থ" },
    ];
  }

  return [
    { href: "/dashboard", icon: Home, label: "হোম" },
    { href: "/dashboard/students", icon: GraduationCap, label: "ছাত্র" },
    { href: "/dashboard/teachers", icon: Users, label: "শিক্ষক" },
    { href: "/dashboard/events", icon: Calendar, label: "ইভেন্ট" },
  ];
}

export function MobileNav({ session }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = (session.user as { role?: string } | undefined)?.role;
  const items = getItems(role);

  const handleLogout = async () => {
    await signOut({ redirect: false, callbackUrl: "/auth/login" });
    router.push("/auth/login");
  };

  return (
    <>
      {/* Main bottom navigation - 4 items */}
      <nav
        aria-label="Mobile navigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden"
      >
        <div className="grid h-16 grid-cols-4 gap-1 px-2 py-1.5">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "h-5 w-5")} />
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Floating action buttons for mobile */}
      <div className="safe-bottom fixed bottom-20 right-4 z-50 flex flex-col gap-2 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full shadow-lg bg-background"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-red-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full shadow-lg bg-background"
          asChild
        >
          <Link href="/dashboard/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </>
  );
}
