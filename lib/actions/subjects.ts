"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");
}

const subjectSchema = z.object({
  subjectCode: z.string().trim().min(1, "กรอกรหัสวิชา"),
  subjectName: z.string().trim().min(1, "กรอกชื่อวิชา"),
  gradeLevel: z.coerce.number().int().min(7).max(12),
});

export async function createSubject(formData: FormData) {
  await requireAdmin();
  const parsed = subjectSchema.safeParse({
    subjectCode: formData.get("subjectCode"),
    subjectName: formData.get("subjectName"),
    gradeLevel: formData.get("gradeLevel"),
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");

  await prisma.subject.create({ data: parsed.data }).catch(() => {
    throw new Error("รหัสวิชานี้มีอยู่แล้ว");
  });

  revalidatePath("/dashboard/admin/subjects");
}

export async function deleteSubject(subjectId: number) {
  await requireAdmin();
  try {
    await prisma.subject.delete({ where: { subjectId } });
  } catch {
    throw new Error("ลบไม่ได้ เพราะมีตารางสอบหรือครูผูกกับวิชานี้อยู่");
  }
  revalidatePath("/dashboard/admin/subjects");
}

const assignSchema = z.object({
  teacherId: z.coerce.number().int().positive(),
  subjectId: z.coerce.number().int().positive(),
  classId: z.coerce.number().int().positive(),
  yearId: z.coerce.number().int().positive(),
});

export async function assignTeacherSubject(formData: FormData) {
  await requireAdmin();
  const parsed = assignSchema.safeParse({
    teacherId: formData.get("teacherId"),
    subjectId: formData.get("subjectId"),
    classId: formData.get("classId"),
    yearId: formData.get("yearId"),
  });
  if (!parsed.success)
    throw new Error(
      parsed.error.issues[0]?.message ?? "กรุณาเลือกให้ครบทุกช่อง",
    );

  await prisma.subjectTeacher.upsert({
    where: { uq_assignment: parsed.data },
    update: {},
    create: parsed.data,
  });

  revalidatePath("/dashboard/admin/subjects");
}

export async function removeTeacherSubject(id: number) {
  await requireAdmin();
  await prisma.subjectTeacher.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/dashboard/admin/subjects");
}
