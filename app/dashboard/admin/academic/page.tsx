import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AcademicYearPanel } from "@/components/AcademicYearPanel";
import { ClassForm } from "@/components/ClassForm";
import { ClassTable } from "@/components/ClassTable";
import { Card, CardHeader } from "@/components/ui/Card";
import { TableFilterBar } from "@/components/ui/TableFilterBar";
import { Pagination } from "@/components/ui/Pagination";
import { fmtDate } from "@/lib/exam-query";

const PAGE_SIZE = 10;

export default async function AdminAcademicPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    gradeLevel?: string;
    yearId?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() ?? "";
  const gradeLevel = sp.gradeLevel ?? "";
  const yearId = sp.yearId ?? "";

  const classWhere: Prisma.ClassWhereInput = {
    ...(q && { className: { contains: q } }),
    ...(gradeLevel && { gradeLevel: Number(gradeLevel) }),
    ...(yearId && { yearId: Number(yearId) }),
  };

  const [years, classes, classTotal, teachers] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { yearId: "desc" } }),
    prisma.class.findMany({
      where: classWhere,
      include: { year: true, homeroomTeacher: { include: { user: true } } },
      orderBy: [{ gradeLevel: "asc" }, { className: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.class.count({ where: classWhere }),
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { teacherId: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(classTotal / PAGE_SIZE));

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (gradeLevel) params.set("gradeLevel", gradeLevel);
    if (yearId) params.set("yearId", yearId);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/dashboard/admin/academic${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">แอดมิน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          โครงสร้างการศึกษา
        </h1>
      </div>

      <Card>
        <CardHeader
          title="ปีการศึกษา"
          description="กำหนดปีการศึกษา/ภาคเรียน และตั้งปีปัจจุบัน"
        />
        <AcademicYearPanel
          years={years.map((y) => ({
            yearId: y.yearId,
            yearName: y.yearName,
            semester: y.semester,
            startDate: fmtDate(y.startDate),
            endDate: fmtDate(y.endDate),
            isCurrent: y.isCurrent,
          }))}
        />
      </Card>

      <Card>
        <CardHeader
          title={`ห้องเรียนทั้งหมด (${classTotal})`}
          description="สร้างห้องเรียนก่อน จึงจะเพิ่มนักเรียนหรือจัดตารางสอบได้"
        />
        <div className="mb-5">
          <ClassForm
            years={years.map((y) => ({
              yearId: y.yearId,
              yearName: y.yearName,
              semester: y.semester,
            }))}
            teachers={teachers.map((t) => ({
              teacherId: t.teacherId,
              fullName: t.user.fullName,
            }))}
          />
        </div>
        <Suspense>
          <TableFilterBar
            searchPlaceholder="ค้นหาชื่อห้อง..."
            selects={[
              {
                key: "gradeLevel",
                label: "ระดับชั้น",
                options: [7, 8, 9, 10, 11, 12].map((g) => ({
                  value: String(g),
                  label: `ม.${g - 6}`,
                })),
              },
              {
                key: "yearId",
                label: "ปีการศึกษา",
                options: years.map((y) => ({
                  value: String(y.yearId),
                  label: `${y.yearName} / ${y.semester}`,
                })),
              },
            ]}
          />
        </Suspense>
        <ClassTable
          classes={classes.map((c) => ({
            classId: c.classId,
            className: c.className,
            gradeLevel: c.gradeLevel,
            yearName: `${c.year.yearName} / ${c.year.semester}`,
            homeroomTeacherName: c.homeroomTeacher?.user.fullName ?? null,
          }))}
        />
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </Card>
    </div>
  );
}
