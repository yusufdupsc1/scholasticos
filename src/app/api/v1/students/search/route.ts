import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { apiOk, apiError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { institutionId?: string } | undefined;
  if (!user?.institutionId) {
    return apiError(401, "UNAUTHORIZED", "Not authenticated");
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    const students = await db.student.findMany({
      where: {
        institutionId: user.institutionId,
        status: "ACTIVE",
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { studentId: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        classId: true,
        status: true,
        fatherName: true,
        motherName: true,
        guardianPhone: true,
        address: true,
        class: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
    });

    const formatted = students.map((s) => ({
      id: s.id,
      studentId: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth?.toISOString(),
      classId: s.classId,
      className: s.class?.name,
      status: s.status,
      fatherName: s.fatherName,
      motherName: s.motherName,
      guardianPhone: s.guardianPhone,
      address: s.address,
    }));

    return apiOk(formatted);
  } catch (error) {
    console.error("[STUDENT_SEARCH]", error);
    return apiError(500, "INTERNAL_ERROR", "Search failed");
  }
}
