"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");
}

const assignSchema = z.object({
  classId: z.coerce.number().int().positive(),
  slot: z.coerce.number().int().min(1).max(2),
  teacherId: z.coerce.number().int().positive(),
  roomNumber: z.string().optional(),
});

export async function assignInvigilator(formData: FormData) {
  await requireAdmin();

  const parsed = assignSchema.safeParse({
    classId: formData.get("classId"),
    slot: formData.get("slot"),
    teacherId: formData.get("teacherId"),
    roomNumber: formData.get("roomNumber") ?? "",
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");

  const { classId, slot, teacherId, roomNumber } = parsed.data;

  await prisma.invigilatorAssignment.upsert({
    where: { uq_class_slot: { classId, slot } },
    update: { teacherId, roomNumber: roomNumber || null },
    create: { classId, slot, teacherId, roomNumber: roomNumber || null },
  });

  revalidatePath("/dashboard/admin/invigilators");
}

export async function removeInvigilator(classId: number, slot: number) {
  await requireAdmin();
  await prisma.invigilatorAssignment
    .delete({ where: { uq_class_slot: { classId, slot } } })
    .catch(() => undefined);
  revalidatePath("/dashboard/admin/invigilators");
}
