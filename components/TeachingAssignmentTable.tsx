"use client";

import { Trash2 } from "lucide-react";
import { removeTeacherSubject } from "@/lib/actions/subjects";

export type AssignmentRow = {
  id: number;
  teacherName: string;
  subjectLabel: string;
  className: string;
  yearLabel: string;
};

export function TeachingAssignmentTable({
  assignments,
}: {
  assignments: AssignmentRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-140 border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50 text-left text-ink-500">
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ครูผู้สอน
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              วิชา
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ห้อง
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ปีการศึกษา
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-8 text-center text-sm text-ink-400"
              >
                ไม่พบการมอบหมายที่ตรงกับเงื่อนไข
              </td>
            </tr>
          )}
          {assignments.map((a) => (
            <tr key={a.id} className="hover:bg-ink-50/50">
              <td className="border-b border-ink-100 px-3 py-2.5 font-medium text-ink-900">
                {a.teacherName}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {a.subjectLabel}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {a.className}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                {a.yearLabel}
              </td>
              <td className="border-b border-ink-100 px-3 py-2.5">
                <button
                  onClick={() => removeTeacherSubject(a.id)}
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
