import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { fmtDate, fmtTime } from "@/lib/exam-query";
import { ExamGroupTable, type ExamGroupRow } from "@/components/ExamGroupTable";
import { Card, CardHeader } from "@/components/ui/Card";

export default async function TeacherExamsPage() {
  const session = await auth();
  const teacher = await prisma.teacher.findUnique({
    where: { userId: Number(session!.user.id) },
    include: { subjectAssignments: true },
  });

  // คู่ (subjectId, classId) ที่ครูคนนี้ได้รับมอบหมายให้สอนจริง — ใช้กรองว่าครูแก้ลิงก์ห้องไหนได้บ้าง
  const allowedPairs = new Set(
    (teacher?.subjectAssignments ?? []).map(
      (sa) => `${sa.subjectId}:${sa.classId}`,
    ),
  );

  const subjectIds = [
    ...new Set((teacher?.subjectAssignments ?? []).map((sa) => sa.subjectId)),
  ];

  const exams = subjectIds.length
    ? await prisma.exam.findMany({
        where: { subjectId: { in: subjectIds } },
        include: {
          subject: true,
          examClasses: {
            include: { class: true },
            orderBy: { classId: "asc" },
          },
        },
        orderBy: { startTime: "asc" },
      })
    : [];

  // กรองเหลือเฉพาะห้องที่ครูคนนี้ถูกมอบหมายจริง (วิชาเดียวกันแต่ครูอื่นสอนคนละห้องจะไม่โผล่มา)
  const groups: ExamGroupRow[] = exams
    .map((e) => ({
      examId: e.examId,
      examName: e.examName,
      subjectLabel: `${e.subject.subjectCode} · ${e.subject.subjectName}`,
      dateLabel: fmtDate(e.startTime),
      timeLabel: `${fmtTime(e.startTime)}–${fmtTime(e.endTime)} น.`,
      classLinks: e.examClasses
        .filter((ec) => allowedPairs.has(`${e.subjectId}:${ec.classId}`))
        .map((ec) => ({
          examClassId: ec.id,
          className: ec.class.className,
          classId: ec.classId,
          examLink: ec.examLink,
          status: ec.status,
        })),
    }))
    .filter((g) => g.classLinks.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">ครูผู้สอน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          เพิ่มลิงก์ข้อสอบ
        </h1>
      </div>

      <Card>
        <CardHeader
          title="วิชาและห้องที่คุณสอน"
          description="แสดงเฉพาะห้องที่คุณถูกมอบหมายให้สอน — ถ้าห้องเดียวกันมีครูหลายคนสอนคนละวิชา จะเห็นเฉพาะแถวของตัวเอง"
        />
        <ExamGroupTable groups={groups} />
      </Card>
    </div>
  );
}
