"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hashPassword } from "@/lib/password";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");
}

const baseSchema = z.object({
  username: z.string().trim().min(3, "รหัสผู้ใช้อย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
  titleName: z.string().trim().min(1, "กรอกคำนำหน้า"),
  firstName: z.string().trim().min(1, "กรอกชื่อ"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "กรอกนามสกุล"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["admin", "teacher", "student"]),
  teacherCode: z.string().optional(),
  department: z.string().optional(),
  studentCode: z.string().optional(),
  classId: z.coerce.number().int().optional(),
  studentNo: z.coerce.number().int().optional(),
});

export async function createUser(formData: FormData) {
  await requireAdmin();

  const parsed = baseSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    titleName: formData.get("titleName"),
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName") ?? "",
    lastName: formData.get("lastName"),
    email: formData.get("email") ?? "",
    role: formData.get("role"),
    teacherCode: formData.get("teacherCode") ?? "",
    department: formData.get("department") ?? "",
    studentCode: formData.get("studentCode") ?? "",
    classId: formData.get("classId") || undefined,
    studentNo: formData.get("studentNo") || undefined,
  });
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");

  const data = parsed.data;

  if (data.role === "teacher" && !data.teacherCode)
    throw new Error("กรอกรหัสครู");
  if (
    data.role === "student" &&
    (!data.studentCode || !data.classId || data.studentNo === undefined)
  ) {
    throw new Error("กรอกรหัสนักเรียน เลือกห้อง และเลขที่");
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: data.username,
        passwordHash,
        fullName: `${data.titleName}${data.firstName} ${data.middleName} ${data.lastName}`,
        email: data.email || undefined,
        role: data.role,
      },
    });

    if (data.role === "teacher") {
      await tx.teacher.create({
        data: {
          userId: user.userId,
          teacherCode: data.teacherCode!,
          department: data.department || undefined,
          titleName: data.titleName,
          firstName: data.firstName,
          middleName: data.middleName || undefined,
          lastName: data.lastName,
        },
      });
    } else if (data.role === "student") {
      await tx.student.create({
        data: {
          userId: user.userId,
          studentCode: data.studentCode!,
          classId: data.classId!,
          studentNo: data.studentNo!,
          titleName: data.titleName,
          firstName: data.firstName,
          middleName: data.middleName || undefined,
          lastName: data.lastName,
        },
      });
    }
  });

  revalidatePath("/dashboard/admin/users");
}

export async function setUserActive(userId: number, isActive: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { userId }, data: { isActive } });
  revalidatePath("/dashboard/admin/users");
}

export async function resetPassword(userId: number, newPassword: string) {
  await requireAdmin();
  const parsed = z
    .string()
    .min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร")
    .safeParse(newPassword);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "รหัสผ่านไม่ถูกต้อง");

  const passwordHash = await hashPassword(parsed.data);
  await prisma.user.update({ where: { userId }, data: { passwordHash } });
  revalidatePath("/dashboard/admin/users");
}
