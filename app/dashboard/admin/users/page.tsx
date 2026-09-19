import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { UserForm } from "@/components/UserForm";
import { UserTable, type UserRow } from "@/components/UserTable";
import { Card, CardHeader } from "@/components/ui/Card";
import { TableFilterBar } from "@/components/ui/TableFilterBar";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    role?: string;
    status?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() ?? "";
  const role = sp.role ?? "";
  const status = sp.status ?? "";

  const where: Prisma.UserWhereInput = {
    ...(q && {
      OR: [{ fullName: { contains: q } }, { username: { contains: q } }],
    }),
    ...(role && { role: role as Prisma.UserWhereInput["role"] }),
    ...(status && { isActive: status === "active" }),
  };

  const [users, total, classes] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { teacher: true, student: { include: { class: true } } },
      orderBy: { userId: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
    prisma.class.findMany({
      orderBy: [{ gradeLevel: "asc" }, { className: "asc" }],
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rows: UserRow[] = users.map((u) => ({
    userId: u.userId,
    username: u.username,
    fullName: u.fullName,
    role: u.role,
    isActive: u.isActive,
    detail:
      u.role === "teacher"
        ? `รหัสครู ${u.teacher?.teacherCode ?? "-"}${u.teacher?.department ? " · " + u.teacher.department : ""}`
        : u.role === "student"
          ? `รหัสนักเรียน ${u.student?.studentCode ?? "-"} · ${u.student?.class.className ?? "-"}`
          : "-",
  }));

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/dashboard/admin/users${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-400">แอดมิน</p>
        <h1 className="font-heading text-2xl font-semibold text-ink-900">
          จัดการผู้ใช้
        </h1>
      </div>

      <Card>
        <CardHeader
          title="เพิ่มผู้ใช้ใหม่"
          description="สร้างบัญชีผู้ดูแลระบบ ครู หรือนักเรียน"
        />
        <UserForm classes={classes} />
      </Card>

      <Card>
        <CardHeader title={`ผู้ใช้ทั้งหมด (${total})`} />
        <Suspense>
          <TableFilterBar
            searchPlaceholder="ค้นหาชื่อหรือ username..."
            selects={[
              {
                key: "role",
                label: "บทบาท",
                options: [
                  { value: "admin", label: "แอดมิน" },
                  { value: "teacher", label: "ครู" },
                  { value: "student", label: "นักเรียน" },
                ],
              },
              {
                key: "status",
                label: "สถานะ",
                options: [
                  { value: "active", label: "ใช้งานอยู่" },
                  { value: "inactive", label: "ปิดใช้งาน" },
                ],
              },
            ]}
          />
        </Suspense>
        <UserTable rows={rows} />
        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </Card>
    </div>
  );
}
