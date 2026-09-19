import { prisma } from "@/lib/prisma";

const BKK = "Asia/Bangkok";

export function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BKK }).format(d); // YYYY-MM-DD
}

export function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: BKK,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function fmtDateLong(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00+07:00`).toLocaleDateString("th-TH", {
    timeZone: BKK,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** แปลง input วันที่ (YYYY-MM-DD) + เวลา (HH:mm) จากฟอร์ม ให้เป็น Date ที่ตรงกับเวลาไทยเสมอ ไม่ขึ้นกับ TZ ของเซิร์ฟเวอร์ */
export function toBangkokDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00+07:00`);
}

export function gradeLabel(gradeLevel: number): string {
  return gradeLevel > 6 ? `ม.${gradeLevel - 6}` : `ป.${gradeLevel}`;
}

export type GridExam = {
  examId: number;
  examClassId: number;
  subjectCode: string;
  subjectName: string;
  className: string;
  examDate: string;
  startTime: string;
  endTime: string;
  startAt: string; // ISO timestamp เต็ม ใช้คำนวณเวลาจริงฝั่ง client
  endAt: string; // ISO timestamp เต็ม
  gradeLevel: number;
  examLink: string;
  status: string;
  isOpen: boolean;
};

/**
 * ดึงตารางสอบระดับ "ห้อง" โดยตรง (1 แถว = ลิงก์ของ 1 ห้องใน 1 การสอบ)
 * เพราะแต่ละห้องอาจได้รับลิงก์ข้อสอบคนละชุดกัน แม้จะเป็นวิชา/เวลาเดียวกัน
 */
export async function getExamGridData(
  classIds?: number[],
): Promise<GridExam[]> {
  const examClasses = await prisma.examClass.findMany({
    where: classIds ? { classId: { in: classIds } } : undefined,
    include: { exam: { include: { subject: true } }, class: true },
    orderBy: [{ exam: { startTime: "asc" } }],
  });

  const now = new Date();

  return examClasses.map((ec) => ({
    examId: ec.exam.examId,
    examClassId: ec.id,
    subjectCode: ec.exam.subject.subjectCode,
    subjectName: ec.exam.subject.subjectName,
    className: ec.class.className,
    examDate: fmtDate(ec.exam.startTime),
    startTime: fmtTime(ec.exam.startTime),
    endTime: fmtTime(ec.exam.endTime),
    startAt: ec.exam.startTime.toISOString(),
    endAt: ec.exam.endTime.toISOString(),
    gradeLevel: ec.class.gradeLevel,
    examLink: ec.examLink,
    status: ec.status,
    isOpen:
      ec.status === "published" &&
      now >= ec.exam.startTime &&
      now <= ec.exam.endTime,
  }));
}
