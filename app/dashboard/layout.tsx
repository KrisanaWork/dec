import {
  LayoutGrid,
  CalendarClock,
  ShieldCheck,
  Users,
  Link2,
  School,
  BookMarked,
} from "lucide-react";
import { auth } from "@/auth";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";

const roleLabel: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  teacher: "ครูผู้สอน",
  student: "นักเรียน",
};

const navByRole: Record<string, NavItem[]> = {
  admin: [
    {
      href: "/dashboard/admin",
      label: "ภาพรวม",
      icon: <LayoutGrid className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/academic",
      label: "โครงสร้างการศึกษา",
      icon: <School className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/subjects",
      label: "วิชา/ครูผู้สอน",
      icon: <BookMarked className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/exams",
      label: "ตารางสอบ",
      icon: <CalendarClock className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/invigilators",
      label: "ครูคุมสอบ",
      icon: <ShieldCheck className="h-4 w-4" />,
    },
    {
      href: "/dashboard/admin/users",
      label: "ผู้ใช้งาน",
      icon: <Users className="h-4 w-4" />,
    },
  ],
  teacher: [
    {
      href: "/dashboard/teacher",
      label: "ภาพรวม",
      icon: <LayoutGrid className="h-4 w-4" />,
    },
    {
      href: "/dashboard/teacher/exams",
      label: "ลิงก์ข้อสอบ",
      icon: <Link2 className="h-4 w-4" />,
    },
  ],
  student: [
    {
      href: "/dashboard/student",
      label: "ตารางสอบ",
      icon: <CalendarClock className="h-4 w-4" />,
    },
  ],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user.role ?? "student";

  return (
    <DashboardShell
      navItems={navByRole[role] ?? []}
      userName={session?.user.name ?? ""}
      roleLabel={roleLabel[role] ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
