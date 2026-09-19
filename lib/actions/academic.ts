"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");
}

const yearSchema = z.object({
  yearName: z.string().trim().min(1, "กรอกปีการศึกษา"),
  semester: z.coerce.number().int().min(1).max(2),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  isCurrent: z.coerce.boolean().optional(),
});

export async function createAcademicYear(formData: FormData) {
  await requireAdmin();

  const parsed = yearSchema.safeParse({
    yearName: formData.get("yearName"),
    semester: formData.get("semester"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "on",
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");

  const { yearName, semester, startDate, endDate, isCurrent } = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (isCurrent) {
      await tx.academicYear.updateMany({ data: { isCurrent: false } });
    }
    await tx.academicYear.create({
      data: {
        yearName,
        semester,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: !!isCurrent,
      },
    });
  });

  revalidatePath("/dashboard/admin/academic");
}

export async function setCurrentYear(yearId: number) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.academicYear.updateMany({ data: { isCurrent: false } }),
    prisma.academicYear.update({
      where: { yearId },
      data: { isCurrent: true },
    }),
  ]);
  revalidatePath("/dashboard/admin/academic");
}

const classSchema = z.object({
  className: z.string().trim().min(1, "กรอกชื่อห้อง"),
  gradeLevel: z.coerce.number().int().min(7).max(12),
  yearId: z.coerce.number().int().positive(),
  homeroomTeacherId: z.coerce.number().int().optional(),
});

export async function createClass(formData: FormData) {
  await requireAdmin();

  const homeroom = formData.get("homeroomTeacherId");
  const parsed = classSchema.safeParse({
    className: formData.get("className"),
    gradeLevel: formData.get("gradeLevel"),
    yearId: formData.get("yearId"),
    homeroomTeacherId: homeroom ? homeroom : undefined,
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");

  await prisma.class.create({
    data: {
      className: parsed.data.className,
      gradeLevel: parsed.data.gradeLevel,
      yearId: parsed.data.yearId,
      homeroomTeacherId: parsed.data.homeroomTeacherId ?? null,
    },
  });

  revalidatePath("/dashboard/admin/academic");
}

export async function deleteClass(classId: number) {
  await requireAdmin();
  try {
    await prisma.class.delete({ where: { classId } });
  } catch {
    throw new Error("ลบไม่ได้ เพราะมีนักเรียนหรือข้อมูลอื่นผูกกับห้องนี้อยู่");
  }
  revalidatePath("/dashboard/admin/academic");
}
