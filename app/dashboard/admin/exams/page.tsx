import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getExamGridData, fmtDate, fmtTime } from "@/lib/exam-query";
import { ExamForm } from "@/components/ExamForm";
import { ExamGroupTable, type ExamGroupRow } from "@/components/ExamGroupTable";
import { ExamScheduleGrid } from "@/components/ExamScheduleGrid";
import { Card, CardHeader } from "@/components/ui/Card";
import { TableFilterBar } from "@/components/ui/TableFilterBar";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 8;

export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    subjectId?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "";
  const subjectId = sp.subjectId ?? "";

  const where: Prisma.ExamWhereInput = {
    ...(q && {
      OR: [
        { examName: { contains: q } },
        { subject: { subjectName: { contains: q } } },
        { subject: { subjectCode: { contains: q } } },
      ],
    }),
    ...(subjectId && { subjectId: Number(subjectId) }),
    ...(status && {
      examClasses: {
        some: { status: status as Prisma.ExamClassWhereInput["status"] },
      },
    }),
  };

  const [subjects, classes, exams, examTotal, gridData] = await Promise.all([
    prisma.subject.findMany({ orderBy: { subjectCode: "asc" } }),
    prisma.class.findMany({
      orderBy: [{ gradeLevel: "asc" }, { className: "asc" }],
    }),
    prisma.exam.findMany({
      where,
      include: {
        subject: true,
        examClasses: { include: { class: true }, orderBy: { classId: "asc" } },
      },
      orderBy: { startTime: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.exam.count({ where }),
    getExamGridData(),
  ]);

  const totalPages = Math.max(1, Math.ceil(examTotal / PAGE_SIZE));

  const groups: ExamGroupRow[] = exams.map((e) => ({
    examId: e.examId,
    examName: e.examName,
    subjectLabel: `${e.subject.subjectCode} · ${e.subject.subjectName}`,
    dateLabel: fmtDate(e.startTime),
    timeLabel: `${fmtTime(e.startTime)}–${fmtTime(e.endTime)} น.`,
    classLinks: e.examClasses.map((ec) => ({
      examClassId: ec.id,
      className: ec.class.className,
      classId: ec.classId,
      examLink: ec.examLink,
      status: ec.status,
    })),
  }));

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (subjectId) params.set("subjectId", subjectId);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/dashboard/admin/exams${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">แอดมิน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          จัดตารางสอบ
        </h1>
      </div>

      <Card>
        <CardHeader
          title="เพิ่มตารางสอบ"
          description="เลือกได้หลายห้อง — ถ้าแต่ละห้องต้องใช้ข้อสอบคนละชุด ไปกำหนดลิงก์แยกทีละห้องได้ที่ตารางด้านล่างหลังบันทึก"
        />
        <ExamForm subjects={subjects} classes={classes} />
      </Card>

      <Card>
        <CardHeader
          title={`ชุดสอบทั้งหมด (${examTotal})`}
          description="1 ชุดสอบ อาจมีหลายห้อง แต่ละห้องกำหนดลิงก์แยกกันได้"
        />
        <Suspense>
          <TableFilterBar
            searchPlaceholder="ค้นหาชื่อการสอบหรือวิชา..."
            selects={[
              {
                key: "status",
                label: "สถานะ",
                options: [
                  { value: "published", label: "มีห้องที่เผยแพร่แล้ว" },
                  { value: "draft", label: "มีห้องที่ยังเป็นฉบับร่าง" },
                ],
              },
              {
                key: "subjectId",
                label: "วิชา",
                options: subjects.map((s) => ({
                  value: String(s.subjectId),
                  label: s.subjectCode,
                })),
              },
            ]}
          />
        </Suspense>
        <ExamGroupTable groups={groups} allClasses={classes} canManage />
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </Card>

      <Card>
        <CardHeader
          title="ตัวอย่างตารางสอบ"
          description="มุมมองเดียวกับที่นักเรียนจะเห็น"
        />
        <ExamScheduleGrid exams={gridData} mode="view" />
      </Card>
    </div>
  );
}
