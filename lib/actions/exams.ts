"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { toBangkokDate } from "@/lib/exam-query";

const examSchema = z.object({
  examName: z.string().min(1, "กรอกชื่อการสอบ"),
  subjectId: z.coerce.number().int().positive(),
  examType: z.enum(["quiz", "midterm", "final", "assignment"]),
  classIds: z.array(z.coerce.number().int()).min(1, "เลือกอย่างน้อย 1 ห้อง"),
  examDate: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  platformName: z.string().optional(),
  sharedLink: z.string().url().optional().or(z.literal("")),
});

/** สร้างชุดสอบ (วิชา+เวลา) พร้อมห้องที่เลือก — ลิงก์เริ่มต้นว่างไว้ให้แก้ทีละห้องทีหลัง
 *  เว้นแต่กรอก "ลิงก์ใช้ร่วมกัน" มา จะเติมให้ทุกห้องที่เลือกเหมือนกันไปก่อน (แก้แยกทีหลังได้) */
export async function createExam(formData: FormData) {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");

  const parsed = examSchema.safeParse({
    examName: formData.get("examName"),
    subjectId: formData.get("subjectId"),
    examType: formData.get("examType"),
    classIds: formData.getAll("classIds"),
    examDate: formData.get("examDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    platformName: formData.get("platformName") ?? "",
    sharedLink: formData.get("sharedLink") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const {
    examName,
    subjectId,
    examType,
    classIds,
    examDate,
    startTime,
    endTime,
    platformName,
    sharedLink,
  } = parsed.data;

  await prisma.exam.create({
    data: {
      examName,
      subjectId,
      examType,
      startTime: toBangkokDate(examDate, startTime),
      endTime: toBangkokDate(examDate, endTime),
      platformName: platformName || undefined,
      createdBy: Number(session.user.id),
      examClasses: {
        create: classIds.map((classId) => ({
          classId,
          examLink: sharedLink || "",
          status: sharedLink ? "published" : "draft",
        })),
      },
    },
  });

  revalidatePath("/dashboard/admin/exams");
  revalidatePath("/dashboard/student");
}

/** ลบชุดสอบทั้งหมด (ทุกห้องที่ผูกอยู่จะถูกลบตามไปด้วย) */
export async function deleteExam(examId: number) {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");

  await prisma.exam.delete({ where: { examId } });

  revalidatePath("/dashboard/admin/exams");
  revalidatePath("/dashboard/student");
}

async function assertCanEditExamClass(examClassId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("กรุณาเข้าสู่ระบบ");

  const examClass = await prisma.examClass.findUnique({
    where: { id: examClassId },
    select: { classId: true, exam: { select: { subjectId: true } } },
  });
  if (!examClass) throw new Error("ไม่พบรายการ");

  if (session.user.role === "admin") return;

  if (session.user.role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: Number(session.user.id) },
    });
    const owns =
      teacher &&
      (await prisma.subjectTeacher.findFirst({
        where: {
          teacherId: teacher.teacherId,
          subjectId: examClass.exam.subjectId,
          classId: examClass.classId,
        },
      }));
    if (!owns) throw new Error("คุณไม่ได้รับมอบหมายให้สอนวิชานี้ในห้องนี้");
    return;
  }

  throw new Error("ไม่มีสิทธิ์แก้ไข");
}

/** แก้ไขลิงก์ของ "ห้องหนึ่ง" ในชุดสอบ — admin แก้ได้ทุกห้อง, teacher แก้ได้เฉพาะห้องที่ตัวเองถูกมอบหมายสอน */
export async function updateExamClassLink(
  examClassId: number,
  examLink: string,
) {
  await assertCanEditExamClass(examClassId);

  const parsedLink = z.string().url().or(z.literal("")).safeParse(examLink);
  if (!parsedLink.success) throw new Error("ลิงก์ไม่ถูกต้อง");

  await prisma.examClass.update({
    where: { id: examClassId },
    data: {
      examLink: parsedLink.data,
      status: parsedLink.data ? "published" : "draft",
    },
  });

  revalidatePath("/dashboard/admin/exams");
  revalidatePath("/dashboard/teacher/exams");
  revalidatePath("/dashboard/student");
}

/** เพิ่มอีกห้องเข้าไปในชุดสอบเดิม (คนละลิงก์กับห้องอื่นได้) */
export async function addClassToExam(examId: number, classId: number) {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");

  await prisma.examClass.upsert({
    where: { uq_exam_class: { examId, classId } },
    update: {},
    create: { examId, classId, examLink: "", status: "draft" },
  });

  revalidatePath("/dashboard/admin/exams");
  revalidatePath("/dashboard/student");
}

/** ถอดห้องออกจากชุดสอบ (ถ้าเป็นห้องสุดท้าย ชุดสอบทั้งชุดจะถูกลบไปด้วยเพื่อไม่ให้เหลือ exam ว่างเปล่า) */
export async function removeClassFromExam(examClassId: number) {
  const session = await auth();
  if (session?.user.role !== "admin") throw new Error("เฉพาะแอดมินเท่านั้น");

  const examClass = await prisma.examClass.findUnique({
    where: { id: examClassId },
    select: { examId: true },
  });
  if (!examClass) return;

  await prisma.examClass.delete({ where: { id: examClassId } });

  const remaining = await prisma.examClass.count({
    where: { examId: examClass.examId },
  });
  if (remaining === 0) {
    await prisma.exam.delete({ where: { examId: examClass.examId } });
  }

  revalidatePath("/dashboard/admin/exams");
  revalidatePath("/dashboard/student");
}
