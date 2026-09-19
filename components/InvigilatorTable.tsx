"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  assignInvigilator,
  removeInvigilator,
} from "@/lib/actions/invigilators";
import { Combobox } from "@/components/ui/Combobox";

type Teacher = { teacherId: number; fullName: string };
type ClassRow = {
  classId: number;
  className: string;
  slot1?: { teacherId: number; roomNumber: string | null };
  slot2?: { teacherId: number; roomNumber: string | null };
};

export function InvigilatorTable({
  classes,
  teachers,
}: {
  classes: ClassRow[];
  teachers: Teacher[];
}) {
  const teacherOptions = [
    { value: "", label: "— ไม่ระบุ —" },
    ...teachers.map((t) => ({ value: String(t.teacherId), label: t.fullName })),
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-180 border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50 text-left text-ink-500">
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ห้อง
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              ห้องสอบ
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              กรรมการคุมสอบ 1
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
              กรรมการคุมสอบ 2
            </th>
            <th className="border-b border-ink-100 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <ClassInvigilatorRow
              key={c.classId}
              classRow={c}
              teacherOptions={teacherOptions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClassInvigilatorRow({
  classRow,
  teacherOptions,
}: {
  classRow: ClassRow;
  teacherOptions: { value: string; label: string }[];
}) {
  const [roomNumber, setRoomNumber] = useState(
    classRow.slot1?.roomNumber ?? classRow.slot2?.roomNumber ?? "",
  );
  const [teacher1, setTeacher1] = useState(
    classRow.slot1?.teacherId ? String(classRow.slot1.teacherId) : "",
  );
  const [teacher2, setTeacher2] = useState(
    classRow.slot2?.teacherId ? String(classRow.slot2.teacherId) : "",
  );
  const [isPending, startTransition] = useTransition();

  function save(slot: 1 | 2, teacherId: string, room: string) {
    if (!teacherId) {
      startTransition(async () => {
        await removeInvigilator(classRow.classId, slot);
      });
      return;
    }
    const fd = new FormData();
    fd.set("classId", String(classRow.classId));
    fd.set("slot", String(slot));
    fd.set("teacherId", teacherId);
    fd.set("roomNumber", room);
    startTransition(async () => {
      await assignInvigilator(fd);
    });
  }

  return (
    <tr className="hover:bg-ink-50/50">
      <td className="border-b border-ink-100 px-3 py-2.5 font-medium text-ink-900">
        {classRow.className}
      </td>
      <td className="border-b border-ink-100 px-3 py-2.5">
        <input
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          onBlur={() => {
            if (teacher1) save(1, teacher1, roomNumber);
          }}
          placeholder="เช่น 323"
          className="w-20 rounded-md border border-ink-100 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
        />
      </td>
      {([1, 2] as const).map((slot) => {
        const value = slot === 1 ? teacher1 : teacher2;
        const setValue = slot === 1 ? setTeacher1 : setTeacher2;
        return (
          <td
            key={slot}
            className="min-w-45 border-b border-ink-100 px-3 py-2.5"
          >
            <Combobox
              value={value}
              onChange={(v) => {
                setValue(v);
                save(slot, v, roomNumber);
              }}
              disabled={isPending}
              placeholder="พิมพ์ชื่อครู..."
              options={teacherOptions}
            />
          </td>
        );
      })}
      <td className="border-b border-ink-100 px-3 py-2.5">
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
        )}
      </td>
    </tr>
  );
}
