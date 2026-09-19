import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { SubjectForm } from "@/components/SubjectForm";
import { SubjectTable } from "@/components/SubjectTable";
import { TeachingAssignmentForm } from "@/components/TeachingAssignmentForm";
import { TeachingAssignmentTable } from "@/components/TeachingAssignmentTable";
import { Card, CardHeader } from "@/components/ui/Card";
import { TableFilterBar } from "@/components/ui/TableFilterBar";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    sp?: string;
    sq?: string;
    ap?: string;
    atid?: string;
    asid?: string;
    acid?: string;
  }>;
}) {
  const sp = await searchParams;

  // --- รายวิชา ---
  const subjectPage = Math.max(1, Number(sp.sp) || 1);
  const subjectQ = sp.sq?.trim() ?? "";
  const subjectWhere: Prisma.SubjectWhereInput = subjectQ
    ? {
        OR: [
          { subjectCode: { contains: subjectQ } },
          { subjectName: { contains: subjectQ } },
        ],
      }
    : {};

  // --- มอบหมายครูผู้สอน ---
  const assignPage = Math.max(1, Number(sp.ap) || 1);
  const assignTeacherId = sp.atid ?? "";
  const assignSubjectId = sp.asid ?? "";
  const assignClassId = sp.acid ?? "";
  const assignWhere: Prisma.SubjectTeacherWhereInput = {
    ...(assignTeacherId && { teacherId: Number(assignTeacherId) }),
    ...(assignSubjectId && { subjectId: Number(assignSubjectId) }),
    ...(assignClassId && { classId: Number(assignClassId) }),
  };

  const [
    allSubjects,
    subjects,
    subjectTotal,
    assignments,
    assignTotal,
    teachers,
    classes,
    years,
  ] = await Promise.all([
    prisma.subject.findMany({ orderBy: { subjectCode: "asc" } }), // เต็มลิสต์ ใช้แค่ทำ options ของฟอร์ม/ฟิลเตอร์
    prisma.subject.findMany({
      where: subjectWhere,
      orderBy: { subjectCode: "asc" },
      skip: (subjectPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.subject.count({ where: subjectWhere }),
    prisma.subjectTeacher.findMany({
      where: assignWhere,
      include: {
        teacher: { include: { user: true } },
        subject: true,
        class: true,
        year: true,
      },
      orderBy: { id: "desc" },
      skip: (assignPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.subjectTeacher.count({ where: assignWhere }),
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { teacherId: "asc" },
    }),
    prisma.class.findMany({
      orderBy: [{ gradeLevel: "asc" }, { className: "asc" }],
    }),
    prisma.academicYear.findMany({ orderBy: { yearId: "desc" } }),
  ]);

  const subjectTotalPages = Math.max(1, Math.ceil(subjectTotal / PAGE_SIZE));
  const assignTotalPages = Math.max(1, Math.ceil(assignTotal / PAGE_SIZE));

  const buildSubjectHref = (p: number) => {
    const params = new URLSearchParams();
    if (subjectQ) params.set("sq", subjectQ);
    if (p > 1) params.set("sp", String(p));
    const qs = params.toString();
    return `/dashboard/admin/subjects${qs ? `?${qs}` : ""}`;
  };

  const buildAssignHref = (p: number) => {
    const params = new URLSearchParams();
    if (assignTeacherId) params.set("atid", assignTeacherId);
    if (assignSubjectId) params.set("asid", assignSubjectId);
    if (assignClassId) params.set("acid", assignClassId);
    if (p > 1) params.set("ap", String(p));
    const qs = params.toString();
    return `/dashboard/admin/subjects${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">แอดมิน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          วิชาและครูผู้สอน
        </h1>
      </div>

      <Card>
        <CardHeader
          title="รายวิชาทั้งหมด"
          description="สร้างวิชาก่อน จึงจะนำไปจัดตารางสอบได้"
        />
        <div className="mb-5">
          <SubjectForm />
        </div>
        <Suspense>
          <TableFilterBar
            searchKey="sq"
            searchPlaceholder="ค้นหารหัสหรือชื่อวิชา..."
          />
        </Suspense>
        <SubjectTable subjects={subjects} />
        <Pagination
          page={subjectPage}
          totalPages={subjectTotalPages}
          buildHref={buildSubjectHref}
        />
      </Card>

      <Card>
        <CardHeader
          title="มอบหมายครูผู้สอน"
          description="ครูจะเห็นและเพิ่มลิงก์ข้อสอบได้เฉพาะวิชา+ห้องที่ถูกมอบหมายไว้ที่นี่เท่านั้น"
        />
        <div className="mb-5">
          <TeachingAssignmentForm
            teacherOptions={teachers.map((t) => ({
              value: String(t.teacherId),
              label: t.user.fullName,
            }))}
            subjectOptions={allSubjects.map((s) => ({
              value: String(s.subjectId),
              label: `${s.subjectCode} · ${s.subjectName}`,
            }))}
            classOptions={classes.map((c) => ({
              value: String(c.classId),
              label: c.className,
            }))}
            yearOptions={years.map((y) => ({
              value: String(y.yearId),
              label: `${y.yearName} / ${y.semester}`,
            }))}
          />
        </div>
        <Suspense>
          <TableFilterBar
            hideSearch
            selects={[
              {
                key: "atid",
                label: "ครูผู้สอน",
                options: teachers.map((t) => ({
                  value: String(t.teacherId),
                  label: t.user.fullName,
                })),
              },
              {
                key: "asid",
                label: "วิชา",
                options: allSubjects.map((s) => ({
                  value: String(s.subjectId),
                  label: s.subjectCode,
                })),
              },
              {
                key: "acid",
                label: "ห้อง",
                options: classes.map((c) => ({
                  value: String(c.classId),
                  label: c.className,
                })),
              },
            ]}
          />
        </Suspense>
        <TeachingAssignmentTable
          assignments={assignments.map((a) => ({
            id: a.id,
            teacherName: a.teacher.user.fullName,
            subjectLabel: `${a.subject.subjectCode} · ${a.subject.subjectName}`,
            className: a.class.className,
            yearLabel: `${a.year.yearName} / ${a.year.semester}`,
          }))}
        />
        <Pagination
          page={assignPage}
          totalPages={assignTotalPages}
          buildHref={buildAssignHref}
        />
      </Card>
    </div>
  );
}
