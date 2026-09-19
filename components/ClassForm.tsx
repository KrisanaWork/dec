"use client";

import { useRef, useState, type FormEvent } from "react";
import { School, AlertCircle } from "lucide-react";
import { createClass } from "@/lib/actions/academic";
import { Field, Input, Select } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";

export function ClassForm({
  years,
  teachers,
}: {
  years: { yearId: number; yearName: string; semester: number }[];
  teachers: { teacherId: number; fullName: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createClass(new FormData(e.currentTarget));
      formRef.current?.reset();
      setResetKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อห้อง">
          <Input name="className" required placeholder="เช่น ม.4/1" />
        </Field>
        <Field label="ระดับชั้น">
          <Select name="gradeLevel" defaultValue="7">
            {[7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>
                ม.{g - 6}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="ปีการศึกษา">
          <Combobox
            key={resetKey}
            name="yearId"
            required
            placeholder="พิมพ์เพื่อค้นหาปีการศึกษา"
            options={years.map((y) => ({
              value: String(y.yearId),
              label: `${y.yearName} / ${y.semester}`,
            }))}
          />
        </Field>
        <Field label="ครูประจำชั้น (ไม่บังคับ)">
          <Combobox
            key={resetKey}
            name="homeroomTeacherId"
            placeholder="พิมพ์ชื่อครู..."
            options={teachers.map((t) => ({
              value: String(t.teacherId),
              label: t.fullName,
            }))}
          />
        </Field>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <School className="h-4 w-4" />
        {isSubmitting ? "กำลังบันทึก..." : "เพิ่มห้องเรียน"}
      </Button>
    </form>
  );
}
