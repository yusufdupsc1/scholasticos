import { LayoutDashboard, GraduationCap, Users, Calendar, ClipboardCheck, School, Bell, ArchiveRestore } from "lucide-react";
import type { Session } from "next-auth";
import { isGovtPrimaryModeEnabled } from "@/lib/config";
import { getDict } from "@/lib/i18n/getDict";
import { cookies } from "next/headers";
import { ActiveLink } from "./active-link.client";

function getItems(role?: string) {
    const govtPrimaryMode = isGovtPrimaryModeEnabled();
    const isPrivileged = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"].includes(role ?? "");

    if (role === "STUDENT") {
        return [
            { href: "/dashboard/portal/student", labelKey: "student_portal", icon: LayoutDashboard },
            { href: "/dashboard/portal/student", labelKey: "fees", icon: GraduationCap },
            { href: "/dashboard/portal/student", labelKey: "result", icon: School },
            { href: "/dashboard/portal/student", labelKey: "notice", icon: Bell },
        ];
    }
    if (role === "PARENT") {
        return [
            { href: "/dashboard/portal/parent", labelKey: "parent_portal", icon: LayoutDashboard },
            { href: "/dashboard/portal/parent", labelKey: "guardian", icon: Users },
            { href: "/dashboard/portal/parent", labelKey: "fees", icon: GraduationCap },
            { href: "/dashboard/portal/parent", labelKey: "notice", icon: Bell },
        ];
    }
    if (role === "TEACHER") {
        return [
            {
                href: "/dashboard/portal/teacher",
                labelKey: govtPrimaryMode ? "assistant_teacher_portal" : "teacher_portal",
                icon: LayoutDashboard,
            },
            { href: "/dashboard/attendance", labelKey: "attendance", icon: ClipboardCheck },
            { href: "/dashboard/grades", labelKey: "result", icon: School },
            { href: "/dashboard/events", labelKey: "routine", icon: Calendar },
        ];
    }

    if (isPrivileged) {
        return [
            { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
            { href: "/dashboard/students", labelKey: "student", icon: GraduationCap },
            { href: "/dashboard/teachers", labelKey: "assistant_teacher", icon: Users },
            govtPrimaryMode
                ? { href: "/dashboard/classes", labelKey: "class", icon: School }
                : { href: "/dashboard/control/inactive", labelKey: "governance", icon: ArchiveRestore },
        ];
    }

    return [
        { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
        { href: "/dashboard/students", labelKey: "student", icon: GraduationCap },
        { href: "/dashboard/teachers", labelKey: "assistant_teacher", icon: Users },
        { href: "/dashboard/events", labelKey: "routine", icon: Calendar },
    ];
}

export async function MobileNavServer({ session }: { session: Session }) {
    const role = (session.user as { role?: string } | undefined)?.role;
    const items = getItems(role);

    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "bn";
    const dict = getDict(locale);
    const govtPrimaryMode = isGovtPrimaryModeEnabled();

    const t = (key: string) => {
        // In Govt Primary mode, prefer the govtPrimary dictionary for specific keys
        if (govtPrimaryMode && dict.govtPrimary[key]) {
            return dict.govtPrimary[key];
        }
        return dict.common[key] || key;
    };

    return (
        <nav
            aria-label="Mobile primary"
            className="safe-bottom fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-4 border-t border-border/80 bg-background/90 shadow-[0_-8px_30px_hsl(var(--foreground)/0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:hidden"
        >
            {items.map((item) => (
                <ActiveLink
                    key={item.href}
                    href={item.href}
                    className="mx-1 my-1 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium text-muted-foreground transition-colors"
                    activeClassName="bg-primary/10 text-primary"
                >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                </ActiveLink>
            ))}
        </nav>
    );
}
