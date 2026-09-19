import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { InvigilatorTable } from "@/components/InvigilatorTable";
import { Card, CardHeader } from "@/components/ui/Card";
import { TableFilterBar } from "@/components/ui/TableFilterBar";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 12;

export default async function AdminInvigilatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; gradeLevel?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() ?? "";
  const gradeLevel = sp.gradeLevel ?? "";

  const where: Prisma.ClassWhereInput = {
    ...(q && { className: { contains: q } }),
    ...(gradeLevel && { gradeLevel: Number(gradeLevel) }),
  };

  const [classes, classTotal, teachers, assignments] = await Promise.all([
    prisma.class.findMany({
      where,
      orderBy: [{ gradeLevel: "asc" }, { className: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.class.count({ where }),
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { teacherId: "asc" },
    }),
    prisma.invigilatorAssignment.findMany(),
  ]);

  const totalPages = Math.max(1, Math.ceil(classTotal / PAGE_SIZE));

  const classRows = classes.map((c) => {
    const slot1 = assignments.find(
      (a) => a.classId === c.classId && a.slot === 1,
    );
    const slot2 = assignments.find(
      (a) => a.classId === c.classId && a.slot === 2,
    );
    return {
      classId: c.classId,
      className: c.className,
      slot1: slot1
        ? { teacherId: slot1.teacherId, roomNumber: slot1.roomNumber }
        : undefined,
      slot2: slot2
        ? { teacherId: slot2.teacherId, roomNumber: slot2.roomNumber }
        : undefined,
    };
  });

  const teacherOptions = teachers.map((t) => ({
    teacherId: t.teacherId,
    fullName: t.user.fullName,
  }));

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (gradeLevel) params.set("gradeLevel", gradeLevel);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/dashboard/admin/invigilators${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">แอดมิน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          จัดครูคุมสอบ
        </h1>
      </div>

      <Card>
        <CardHeader
          title={`ห้องสอบและกรรมการคุมสอบ (${classTotal})`}
          description="กำหนดครั้งเดียวใช้ได้ตลอดช่วงสอบ ไม่ต้องตั้งใหม่ทุกวิชา"
        />
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
            ]}
          />
        </Suspense>
        <InvigilatorTable classes={classRows} teachers={teacherOptions} />
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </Card>
    </div>
  );
}
