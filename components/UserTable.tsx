"use client";

import { useState, useTransition } from "react";
import { KeyRound, Power, Check } from "lucide-react";
import { setUserActive, resetPassword } from "@/lib/actions/users";
import { Badge } from "@/components/ui/Badge";

export type UserRow = {
  userId: number;
  username: string;
  fullName: string;
  role: "admin" | "teacher" | "student";
  isActive: boolean;
  detail: string;
};

const roleLabel: Record<UserRow["role"], string> = {
  admin: "แอดมิน",
  teacher: "ครู",
  student: "นักเรียน",
};

export function UserTable({ rows }: { rows: UserRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-170 border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50 text-left text-ink-500">
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ชื่อ-นามสกุล
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              username
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              บทบาท
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              รายละเอียด
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              สถานะ
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <UserRowItem key={r.userId} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRowItem({ row }: { row: UserRow }) {
  const [isActive, setIsActive] = useState(row.isActive);
  const [isPending, startTransition] = useTransition();
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  function toggleActive() {
    const next = !isActive;
    setIsActive(next);
    startTransition(async () => {
      await setUserActive(row.userId, next);
    });
  }

  function handleReset() {
    if (newPassword.length < 6) {
      setMsg("รหัสผ่านอย่างน้อย 6 ตัวอักษร");
      return;
    }
    startTransition(async () => {
      await resetPassword(row.userId, newPassword);
      setMsg("รีเซ็ตรหัสผ่านแล้ว");
      setShowReset(false);
      setNewPassword("");
    });
  }

  return (
    <tr className="align-top hover:bg-ink-50/50">
      <td className="border-b border-ink-100 px-3 py-3 font-medium text-ink-900">
        {row.fullName}
      </td>
      <td className="border-b border-ink-100 px-3 py-3 text-ink-600">
        {row.username}
      </td>
      <td className="border-b border-ink-100 px-3 py-3 text-ink-600">
        {roleLabel[row.role]}
      </td>
      <td className="border-b border-ink-100 px-3 py-3 text-ink-400">
        {row.detail}
      </td>
      <td className="border-b border-ink-100 px-3 py-3">
        <button
          onClick={toggleActive}
          disabled={isPending}
          className="inline-flex items-center gap-1"
        >
          <Badge tone={isActive ? "success" : "neutral"}>
            <Power className="h-3 w-3" />
            {isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
          </Badge>
        </button>
      </td>
      <td className="border-b border-ink-100 px-3 py-3">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
          >
            <KeyRound className="h-3.5 w-3.5" />
            รีเซ็ตรหัสผ่าน
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              className="w-28 rounded-md border border-ink-100 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none"
            />
            <button
              onClick={handleReset}
              className="rounded-md bg-brand-500 p-1.5 text-white"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {msg && <p className="mt-1 text-xs text-ink-400">{msg}</p>}
      </td>
    </tr>
  );
}
