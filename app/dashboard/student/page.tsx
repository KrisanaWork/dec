import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getExamGridData } from "@/lib/exam-query";
import { ExamScheduleGrid } from "@/components/ExamScheduleGrid";
import { ExamSchedulePoller } from "@/components/ExamSchedulePoller";
import { Card, CardHeader } from "@/components/ui/Card";

export default async function StudentDashboardPage() {
  const session = await auth();
  const student = await prisma.student.findUnique({
    where: { userId: Number(session!.user.id) },
    include: { class: true },
  });

  const gridData = student ? await getExamGridData([student.classId]) : [];

  return (
    <div className="space-y-8">
      <ExamSchedulePoller />

      <div>
        <p className="text-sm text-ink-400">
          ห้อง {student?.class.className ?? "-"}
        </p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          สวัสดี, {session?.user?.name}
        </h1>
      </div>

      <Card>
        <CardHeader
          title="ตารางสอบของฉัน"
          description="กดปุ่ม “เข้าสอบ” ได้เฉพาะช่วงเวลาที่กำหนดเท่านั้น"
        />
        <ExamScheduleGrid exams={gridData} mode="student" />
      </Card>
    </div>
  );
}
