import Link from "next/link";
import { BookOpen, FileWarning, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function TeacherDashboardPage() {
  const session = await auth();
  const teacher = await prisma.teacher.findUnique({
    where: { userId: Number(session!.user.id) },
    include: { subjectAssignments: { include: { subject: true } } },
  });

  const subjectIds = [
    ...new Set(teacher?.subjectAssignments.map((sa) => sa.subjectId) ?? []),
  ];
  const pendingLinks = subjectIds.length
    ? await prisma.examClass.count({
        where: {
          status: "draft",
          exam: {
            subjectId: {
              in: subjectIds,
            },
          },
        },
      })
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">ภาพรวมของฉัน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          สวัสดี, {session?.user?.name}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4!">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <p className="font-heading text-2xl font-semibold text-ink-900">
            {subjectIds.length}
          </p>
          <p className="text-xs text-ink-400">วิชาที่สอน</p>
        </Card>
        <Card className="p-4!">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <FileWarning className="h-4.5 w-4.5" />
          </div>
          <p className="font-heading text-2xl font-semibold text-ink-900">
            {pendingLinks}
          </p>
          <p className="text-xs text-ink-400">ยังไม่มีลิงก์ข้อสอบ</p>
        </Card>
      </div>

      <Link href="/dashboard/teacher/exams" className="group block">
        <Card className="transition-colors group-hover:border-brand-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1 font-heading text-base font-semibold text-ink-900">
                เพิ่มลิงก์ข้อสอบ
              </h2>
              <p className="text-sm text-ink-400">
                เติม/แก้ไขลิงก์ข้อสอบของวิชาที่คุณสอน
                ตารางและห้องสอบกำหนดโดยแอดมินแล้ว
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
