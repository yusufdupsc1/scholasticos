import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, School, Users, UserCog, Activity } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  setOwnerInstitutionActive,
  setOwnerUserActive,
} from "@/server/actions/owner";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Central Super Admin",
};

const GOVERNANCE_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRINCIPAL",
  "HEAD_TEACHER",
  "TEACHER",
  "STAFF",
  "OFFICE_STAFF",
  "STUDENT",
  "PARENT",
] as const;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Central Super Admin",
  ADMIN: "Admin",
  PRINCIPAL: "Headmaster",
  HEAD_TEACHER: "Head Teacher",
  TEACHER: "Teacher",
  STAFF: "Staff",
  OFFICE_STAFF: "Office Staff",
  STUDENT: "Student",
  PARENT: "Parent",
};

function bucketCount(value: unknown) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "_all" in value) {
    return Number((value as { _all?: number })._all ?? 0);
  }
  return 0;
}

function roleLabel(role: string) {
  return ROLE_LABELS[role] ?? role;
}

function statusBadge(active: boolean) {
  return active ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="destructive">Inactive</Badge>
  );
}

export default async function OwnerDashboardPage() {
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: string; name?: string | null }
    | undefined;

  if (!user?.id) {
    redirect("/auth/login/owner?institution=mope-owner-control");
  }

  if (user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const [
    totalSchools,
    activeSchools,
    totalUsers,
    activeUsers,
    pendingApprovals,
    recentUsers,
    schools,
    roleBuckets,
    classBuckets,
    subjectBuckets,
    teacherBuckets,
    studentBuckets,
  ] = await Promise.all([
    db.institution.count(),
    db.institution.count({ where: { isActive: true } }),
    db.user.count(),
    db.user.count({ where: { isActive: true } }),
    db.user.count({ where: { approvalStatus: "PENDING" } }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        approvalStatus: true,
        lastLoginAt: true,
        institution: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      take: 60,
    }),
    db.institution.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        isActive: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            classes: true,
            subjects: true,
            teachers: true,
            students: true,
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
      take: 40,
    }),
    db.user.groupBy({
      by: ["role", "isActive"],
      _count: { _all: true },
    }),
    db.class.groupBy({
      by: ["institutionId", "isActive"],
      _count: { _all: true },
    }),
    db.subject.groupBy({
      by: ["institutionId", "isActive"],
      _count: { _all: true },
    }),
    db.teacher.groupBy({
      by: ["institutionId", "status"],
      _count: { _all: true },
    }),
    db.student.groupBy({
      by: ["institutionId", "status"],
      _count: { _all: true },
    }),
  ]);

  const classMap = new Map<string, { active: number; inactive: number }>();
  for (const row of classBuckets as Array<{
    institutionId: string;
    isActive: boolean;
    _count: number | { _all?: number };
  }>) {
    const bucket = classMap.get(row.institutionId) ?? { active: 0, inactive: 0 };
    const count = bucketCount(row._count);
    if (row.isActive) bucket.active += count;
    else bucket.inactive += count;
    classMap.set(row.institutionId, bucket);
  }

  const subjectMap = new Map<string, { active: number; inactive: number }>();
  for (const row of subjectBuckets as Array<{
    institutionId: string;
    isActive: boolean;
    _count: number | { _all?: number };
  }>) {
    const bucket = subjectMap.get(row.institutionId) ?? {
      active: 0,
      inactive: 0,
    };
    const count = bucketCount(row._count);
    if (row.isActive) bucket.active += count;
    else bucket.inactive += count;
    subjectMap.set(row.institutionId, bucket);
  }

  const teacherMap = new Map<string, { active: number; inactive: number }>();
  for (const row of teacherBuckets as Array<{
    institutionId: string;
    status: string;
    _count: number | { _all?: number };
  }>) {
    const bucket = teacherMap.get(row.institutionId) ?? {
      active: 0,
      inactive: 0,
    };
    const count = bucketCount(row._count);
    if (row.status === "ACTIVE") bucket.active += count;
    else bucket.inactive += count;
    teacherMap.set(row.institutionId, bucket);
  }

  const studentMap = new Map<string, { active: number; inactive: number }>();
  for (const row of studentBuckets as Array<{
    institutionId: string;
    status: string;
    _count: number | { _all?: number };
  }>) {
    const bucket = studentMap.get(row.institutionId) ?? {
      active: 0,
      inactive: 0,
    };
    const count = bucketCount(row._count);
    if (row.status === "ACTIVE") bucket.active += count;
    else bucket.inactive += count;
    studentMap.set(row.institutionId, bucket);
  }

  const roleStats = new Map<string, { active: number; inactive: number }>();
  for (const role of GOVERNANCE_ROLES) {
    roleStats.set(role, { active: 0, inactive: 0 });
  }
  for (const row of roleBuckets as Array<{
    role: string;
    isActive: boolean;
    _count: number | { _all?: number };
  }>) {
    if (!roleStats.has(row.role)) {
      roleStats.set(row.role, { active: 0, inactive: 0 });
    }
    const bucket = roleStats.get(row.role)!;
    const count = bucketCount(row._count);
    if (row.isActive) bucket.active += count;
    else bucket.inactive += count;
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-3xl border border-[#006a4e]/20 bg-gradient-to-br from-[#f3faf7] via-white to-[#f8fbff] p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#006a4e]">
              Central Super Admin Console
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
              জাতীয় নিয়ন্ত্রণ ড্যাশবোর্ড
            </h1>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">
              Users, schools এবং authority controls একসাথে ব্যবস্থাপনার কেন্দ্র।
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006a4e]/20 bg-[#eff8f4] px-3 py-1.5 text-xs font-semibold text-[#006a4e]">
            <ShieldCheck className="h-4 w-4" />
            Signed in as {user.name ?? "Owner"}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-xl border border-[#006a4e]/15 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Schools</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{totalSchools}</p>
            <p className="mt-1 text-xs text-slate-600">Active {activeSchools}</p>
          </article>
          <article className="rounded-xl border border-[#006a4e]/15 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Total Users</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{totalUsers}</p>
            <p className="mt-1 text-xs text-slate-600">Active {activeUsers}</p>
          </article>
          <article className="rounded-xl border border-[#006a4e]/15 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Pending Approval</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {pendingApprovals}
            </p>
            <p className="mt-1 text-xs text-slate-600">Access queue</p>
          </article>
          <article className="rounded-xl border border-[#006a4e]/15 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Inactive Schools</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {Math.max(0, totalSchools - activeSchools)}
            </p>
            <p className="mt-1 text-xs text-slate-600">Authority paused</p>
          </article>
          <article className="rounded-xl border border-[#006a4e]/15 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">Inactive Users</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {Math.max(0, totalUsers - activeUsers)}
            </p>
            <p className="mt-1 text-xs text-slate-600">Login blocked</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-[#006a4e]/15 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#006a4e]" />
          <h2 className="text-lg font-black text-slate-900">Role Governance Widgets</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {GOVERNANCE_ROLES.map((role) => {
            const stat = roleStats.get(role) ?? { active: 0, inactive: 0 };
            return (
              <article
                key={role}
                className="rounded-xl border border-[#006a4e]/15 bg-[#f9fcfb] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[#006a4e]">
                  {roleLabel(role)}
                </p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {stat.active + stat.inactive}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Badge variant="success">Active {stat.active}</Badge>
                  <Badge variant="destructive">Inactive {stat.inactive}</Badge>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#006a4e]/15 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <UserCog className="h-4 w-4 text-[#006a4e]" />
          <h2 className="text-lg font-black text-slate-900">User Authority Control</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[#f4faf7] text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="rounded-l-md border-b border-[#006a4e]/15 px-3 py-2">User</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">Role</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">School</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">Status</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">Approval</th>
                <th className="rounded-r-md border-b border-[#006a4e]/15 px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((row: any) => {
                const canToggle = row.id !== user.id;
                const nextActive = !row.isActive;
                return (
                  <tr key={row.id} className="border-b border-[#eef5f2] align-top">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-900">
                        {row.name?.trim() || "Unnamed user"}
                      </p>
                      <p className="text-xs text-slate-600">{row.email}</p>
                      {row.lastLoginAt ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Last login: {new Date(row.lastLoginAt).toLocaleString("en-BD")}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Last login: never
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline">{roleLabel(row.role)}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-slate-800">
                        {row.institution?.name ?? "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.institution?.slug ?? "n/a"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">{statusBadge(Boolean(row.isActive))}</td>
                    <td className="px-3 py-2.5">
                      {row.approvalStatus === "APPROVED" ? (
                        <Badge variant="success">APPROVED</Badge>
                      ) : row.approvalStatus === "PENDING" ? (
                        <Badge variant="secondary">PENDING</Badge>
                      ) : (
                        <Badge variant="destructive">REJECTED</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {canToggle ? (
                        <form action={setOwnerUserActive}>
                          <input type="hidden" name="userId" value={row.id} />
                          <input
                            type="hidden"
                            name="nextActive"
                            value={String(nextActive)}
                          />
                          <button
                            type="submit"
                            className={
                              row.isActive
                                ? "rounded-md border border-[#da291c]/35 bg-[#fff4f4] px-3 py-1.5 text-xs font-semibold text-[#a1271c] hover:bg-[#ffe9e9]"
                                : "rounded-md border border-[#006a4e]/25 bg-[#ecf8f4] px-3 py-1.5 text-xs font-semibold text-[#006a4e] hover:bg-[#dff3ed]"
                            }
                          >
                            {row.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-500">Current session</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[#006a4e]/15 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <School className="h-4 w-4 text-[#006a4e]" />
          <h2 className="text-lg font-black text-slate-900">School Authority & Resource Control</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[#f4faf7] text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="rounded-l-md border-b border-[#006a4e]/15 px-3 py-2">School</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">Authority</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">Users</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">Resources</th>
                <th className="border-b border-[#006a4e]/15 px-3 py-2">People</th>
                <th className="rounded-r-md border-b border-[#006a4e]/15 px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school: any) => {
                const classStat = classMap.get(school.id) ?? { active: 0, inactive: 0 };
                const subjectStat = subjectMap.get(school.id) ?? {
                  active: 0,
                  inactive: 0,
                };
                const teacherStat = teacherMap.get(school.id) ?? {
                  active: 0,
                  inactive: 0,
                };
                const studentStat = studentMap.get(school.id) ?? {
                  active: 0,
                  inactive: 0,
                };
                const nextActive = !school.isActive;

                return (
                  <tr key={school.id} className="border-b border-[#eef5f2] align-top">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-900">{school.name}</p>
                      <p className="text-xs text-slate-500">{school.slug}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Plan: {school.plan}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">{statusBadge(Boolean(school.isActive))}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-xs text-slate-700">
                        Total accounts:{" "}
                        <span className="font-semibold">{school._count.users}</span>
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="space-y-1 text-xs text-slate-700">
                        <p>
                          Classes: <b>{classStat.active}</b> active /{" "}
                          <b>{classStat.inactive}</b> inactive
                        </p>
                        <p>
                          Subjects: <b>{subjectStat.active}</b> active /{" "}
                          <b>{subjectStat.inactive}</b> inactive
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="space-y-1 text-xs text-slate-700">
                        <p>
                          Teachers: <b>{teacherStat.active}</b> active /{" "}
                          <b>{teacherStat.inactive}</b> non-active
                        </p>
                        <p>
                          Students: <b>{studentStat.active}</b> active /{" "}
                          <b>{studentStat.inactive}</b> non-active
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <form action={setOwnerInstitutionActive}>
                        <input
                          type="hidden"
                          name="institutionId"
                          value={school.id}
                        />
                        <input
                          type="hidden"
                          name="nextActive"
                          value={String(nextActive)}
                        />
                        <button
                          type="submit"
                          className={
                            school.isActive
                              ? "rounded-md border border-[#da291c]/35 bg-[#fff4f4] px-3 py-1.5 text-xs font-semibold text-[#a1271c] hover:bg-[#ffe9e9]"
                              : "rounded-md border border-[#006a4e]/25 bg-[#ecf8f4] px-3 py-1.5 text-xs font-semibold text-[#006a4e] hover:bg-[#dff3ed]"
                          }
                        >
                          {school.isActive ? "Inactivate School" : "Activate School"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[#006a4e]/15 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#006a4e]" />
          <h2 className="text-lg font-black text-slate-900">Operational Notes</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Authority actions are server-validated and audit logged.</li>
          <li>School inactive mode blocks authority without deleting institutional data.</li>
          <li>User inactive mode immediately blocks future session creation.</li>
        </ul>
      </section>
    </div>
  );
}
