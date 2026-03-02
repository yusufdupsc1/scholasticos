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

    const student = await db.student.findFirst({
      where: {
        id,
        institutionId: user.institutionId,
      },
    });

    if (!student) {
      return apiError(404, "NOT_FOUND", "Student not found");
    }

    const fees = await db.fee.findMany({
      where: {
        studentId: id,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = fees.map((f) => ({
      id: f.id,
      title: f.title,
      amount: Number(f.amount),
      status: f.status,
      dueDate: f.dueDate?.toISOString(),
      createdAt: f.createdAt.toISOString(),
    }));

    return apiOk(data);
  } catch (error) {
    console.error("[STUDENT_FEES]", error);
    return apiError(500, "INTERNAL_ERROR", "Failed to fetch fees");
  }
}
