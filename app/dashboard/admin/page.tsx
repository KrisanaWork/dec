import Link from "next/link";
import {
  CalendarClock,
  ShieldCheck,
  Users,
  FileWarning,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function AdminDashboardPage() {
  const [examCount, draftCount, userCounts, invigilatorCount] =
    await Promise.all([
      prisma.exam.count(),
      prisma.examClass.count({ where: { status: "draft" } }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
      prisma.invigilatorAssignment.count(),
    ]);

  const countOf = (role: string) =>
    userCounts.find((u) => u.role === role)?._count.role ?? 0;

  const stats = [
    {
      label: "ตารางสอบทั้งหมด",
      value: examCount,
      icon: CalendarClock,
      tone: "text-brand-600 bg-brand-50",
    },
    {
      label: "ยังไม่มีลิงก์ข้อสอบ",
      value: draftCount,
      icon: FileWarning,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      label: "ห้องที่จัดครูคุมสอบแล้ว",
      value: invigilatorCount,
      icon: ShieldCheck,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "ผู้ใช้ทั้งหมด",
      value: countOf("admin") + countOf("teacher") + countOf("student"),
      icon: Users,
      tone: "text-ink-600 bg-ink-50",
    },
  ];

  const menu = [
    {
      href: "/dashboard/admin/academic",
      title: "โครงสร้างการศึกษา",
      desc: "ปีการศึกษาและห้องเรียน — ตั้งค่าก่อนใช้งานส่วนอื่น",
    },
    {
      href: "/dashboard/admin/subjects",
      title: "วิชา/ครูผู้สอน",
      desc: "สร้างวิชาและมอบหมายครูผู้สอน จำเป็นก่อนครูจะเพิ่มลิงก์ข้อสอบได้",
    },
    {
      href: "/dashboard/admin/exams",
      title: "จัดตารางสอบ",
      desc: "สร้างตารางสอบ กำหนดวิชา/ห้อง/เวลา และเพิ่มลิงก์",
    },
    {
      href: "/dashboard/admin/invigilators",
      title: "จัดครูคุมสอบ",
      desc: "กำหนดห้องสอบและกรรมการคุมสอบต่อห้อง",
    },
    {
      href: "/dashboard/admin/users",
      title: "จัดการผู้ใช้",
      desc: "เพิ่ม/ปิดใช้งาน/รีเซ็ตรหัสผ่านผู้ใช้ทุก role",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">ภาพรวมระบบ</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          แดชบอร์ดผู้ดูแลระบบ
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4!">
            <div
              className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.tone}`}
            >
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="font-heading text-2xl font-semibold text-ink-900">
              {s.value}
            </p>
            <p className="text-xs text-ink-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.map((m) => (
          <Link key={m.href} href={m.href} className="group">
            <Card className="h-full transition-colors group-hover:border-brand-300">
              <div className="flex items-start justify-between">
                <h2 className="mb-1 font-heading text-base font-semibold text-ink-900">
                  {m.title}
                </h2>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </div>
              <p className="text-xs leading-relaxed text-ink-400">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
