"use client";

import { Trash2 } from "lucide-react";
import { deleteSubject } from "@/lib/actions/subjects";

export type SubjectRow = {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  gradeLevel: number;
};

export function SubjectTable({ subjects }: { subjects: SubjectRow[] }) {
  async function handleDelete(subjectId: number, name: string) {
    if (!confirm(`ลบวิชา "${name}"?`)) return;
    try {
      await deleteSubject(subjectId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  }

  if (subjects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 px-4 py-10 text-center text-sm text-ink-400">
        ไม่พบวิชาที่ตรงกับเงื่อนไข
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-120 border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50 text-left text-ink-500">
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              รหัสวิชา
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ชื่อวิชา
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ระดับชั้น
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <tr key={s.subjectId} className="hover:bg-ink-50/50">
              <td className="border-b border-ink-100 px-3 py-2.5 font-medium text-ink-900">
                {s.subjectCode}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {s.subjectName}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {s.gradeLevel - 6}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5">
                <button
                  onClick={() => handleDelete(s.subjectId, s.subjectName)}
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
