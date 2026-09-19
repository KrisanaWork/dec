"use client";

import { useRef, useState, type FormEvent } from "react";
import { CalendarRange, AlertCircle, CheckCircle2 } from "lucide-react";
import { createAcademicYear, setCurrentYear } from "@/lib/actions/academic";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export type YearRow = {
  yearId: number;
  yearName: string;
  semester: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export function AcademicYearPanel({ years }: { years: YearRow[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createAcademicYear(new FormData(e.currentTarget));
      formRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ปีการศึกษา">
            <Input name="yearName" required placeholder="เช่น 2569" />
          </Field>
          <Field label="ภาคเรียน">
            <select
              name="semester"
              defaultValue="1"
              className="w-full rounded-lg border border-ink-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>
          </Field>
          <Field label="วันเริ่มภาคเรียน">
            <Input type="date" name="startDate" required />
          </Field>
          <Field label="วันสิ้นสุดภาคเรียน">
            <Input type="date" name="endDate" required />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            name="isCurrent"
            className="accent-brand-500"
          />
          ตั้งเป็นปีการศึกษาปัจจุบัน
        </label>
        <Button type="submit" disabled={isSubmitting}>
          <CalendarRange className="h-4 w-4" />
          {isSubmitting ? "กำลังบันทึก..." : "เพิ่มปีการศึกษา"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-ink-100">
        <table className="w-full min-w-120 border-collapse text-sm">
          <thead>
            <tr className="bg-ink-50 text-left text-ink-500">
              <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
                ปีการศึกษา
              </th>
              <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
                ช่วงเวลา
              </th>
              <th className="border-b border-ink-100 px-3 py-2.5 font-medium">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.yearId} className="hover:bg-ink-50/50">
                <td className="border-b border-ink-100 px-3 py-2.5 font-medium text-ink-900">
                  {y.yearName} / {y.semester}
                </td>
                <td className="border-b border-ink-100 px-3 py-2.5 text-ink-600">
                  {y.startDate} – {y.endDate}
                </td>
                <td className="border-b border-ink-100 px-3 py-2.5">
                  {y.isCurrent ? (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" />
                      ปีปัจจุบัน
                    </Badge>
                  ) : (
                    <button
                      onClick={() => setCurrentYear(y.yearId)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      ตั้งเป็นปัจจุบัน
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
