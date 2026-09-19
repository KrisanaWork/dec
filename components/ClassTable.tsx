"use client";

import { Trash, Trash2 } from "lucide-react";
import { deleteClass } from "@/lib/actions/academic";

export type ClassRow = {
  classId: number;
  className: string;
  gradeLevel: number;
  yearName: string;
  homeroomTeacherName: string | null;
};

export function ClassTable({ classes }: { classes: ClassRow[] }) {
  async function handleDelete(classId: number, name: string) {
    if (!confirm(`ลบห้อง "${name}"?`)) return;
    try {
      await deleteClass(classId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  if (classes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 px-4 py-10 text-center text-sm text-ink-400">
        ไม่พบห้องเรียนที่ตรงกับเงื่อนไข
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-140 border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50 text-left text-ink-500">
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ห้อง
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ปีการศึกษา
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ครูประจำชั้น
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.classId} className="hover:bg-ink-50/50">
              <td className="border-b border-ink-100 px-3 py-2.5 font-medium text-ink-900">
                {c.className}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {c.yearName}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {c.homeroomTeacherName ?? "—"}
              </td>
              <td className="border-b border-ink-100 px-3 y-2.5">
                <button
                  onClick={() => handleDelete(c.classId, c.className)}
                  className="rounded-md p-1.5 text-ink-300 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
