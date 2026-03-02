import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiOk, apiError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const user = session?.user as { institutionId?: string } | undefined;
  if (!user?.institutionId) {
    return apiError(401, "UNAUTHORIZED", "Not authenticated");
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30");

    const student = await db.student.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
    });

    if (!student) {
      return apiError(404, "NOT_FOUND", "Student not found");
    }

    const attendance = await db.attendance.findMany({
      where: {
        studentId: id,
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    const records = attendance.map((a) => ({
      date: a.date.toISOString(),
      status: a.status,
    }));

    return apiOk({ records, total: attendance.length });
  } catch (error) {
    console.error("[STUDENT_ATTENDANCE]", error);
    return apiError(500, "INTERNAL_ERROR", "Failed to fetch attendance");
  }
}
