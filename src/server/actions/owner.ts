"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ToggleUserSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  nextActive: z.coerce.boolean(),
});

const ToggleInstitutionSchema = z.object({
  institutionId: z.string().min(1, "Institution id is required"),
  nextActive: z.coerce.boolean(),
});

async function getOwnerContext() {
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: string; institutionId?: string }
    | undefined;

  if (!user?.id || !user.role) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Insufficient permissions");
  }

  return {
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId ?? null,
  };
}

export async function setOwnerUserActive(
  formData: FormData,
): Promise<void> {
  try {
    const ctx = await getOwnerContext();
    const parsed = ToggleUserSchema.safeParse({
      userId: formData.get("userId"),
      nextActive: formData.get("nextActive"),
    });

    if (!parsed.success) {
      return;
    }

    const { userId, nextActive } = parsed.data;
    if (userId === ctx.userId && !nextActive) {
      return;
    }

    const existing = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        role: true,
        name: true,
        email: true,
        institutionId: true,
      },
    });
    if (!existing) {
      return;
    }

    if (existing.role === "SUPER_ADMIN" && !nextActive) {
      const activeSuperAdmins = await db.user.count({
        where: {
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });
      if (activeSuperAdmins <= 1) {
        return;
      }
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: nextActive },
      });

      await tx.auditLog.create({
        data: {
          action: nextActive ? "ACTIVATE" : "DEACTIVATE",
          entity: "User",
          entityId: userId,
          oldValues: {
            isActive: existing.isActive,
            role: existing.role,
            name: existing.name,
            email: existing.email,
          },
          newValues: {
            isActive: nextActive,
            role: existing.role,
            name: existing.name,
            email: existing.email,
          },
          userId: ctx.userId,
        },
      });
    });

    revalidatePath("/dashboard/owner");
  } catch (error) {
    console.error("[OWNER_SET_USER_ACTIVE]", error);
  }
}

export async function setOwnerInstitutionActive(
  formData: FormData,
): Promise<void> {
  try {
    const ctx = await getOwnerContext();
    const parsed = ToggleInstitutionSchema.safeParse({
      institutionId: formData.get("institutionId"),
      nextActive: formData.get("nextActive"),
    });

    if (!parsed.success) {
      return;
    }

    const { institutionId, nextActive } = parsed.data;
    if (ctx.institutionId && institutionId === ctx.institutionId && !nextActive) {
      return;
    }

    const existing = await db.institution.findUnique({
      where: { id: institutionId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        plan: true,
      },
    });
    if (!existing) {
      return;
    }

    await db.$transaction(async (tx) => {
      await tx.institution.update({
        where: { id: institutionId },
        data: { isActive: nextActive },
      });

      await tx.auditLog.create({
        data: {
          action: nextActive ? "ACTIVATE" : "DEACTIVATE",
          entity: "Institution",
          entityId: institutionId,
          oldValues: {
            name: existing.name,
            slug: existing.slug,
            isActive: existing.isActive,
            plan: existing.plan,
          },
          newValues: {
            name: existing.name,
            slug: existing.slug,
            isActive: nextActive,
            plan: existing.plan,
          },
          userId: ctx.userId,
        },
      });
    });

    revalidatePath("/dashboard/owner");
  } catch (error) {
    console.error("[OWNER_SET_INSTITUTION_ACTIVE]", error);
  }
}
