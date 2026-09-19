"use client";

import { useRef, useState, type FormEvent } from "react";
import { UserCog, AlertCircle } from "lucide-react";
import { assignTeacherSubject } from "@/lib/actions/subjects";
import { Field } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";

type Option = { value: string; label: string };

export function TeachingAssignmentForm({
  teacherOptions,
  subjectOptions,
  classOptions,
  yearOptions,
}: {
  teacherOptions: Option[];
  subjectOptions: Option[];
  classOptions: Option[];
  yearOptions: Option[];
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
      await assignTeacherSubject(new FormData(e.currentTarget));
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
        <Field label="ครูผู้สอน">
          <Combobox
            key={resetKey}
            name="teacherId"
            required
            placeholder="พิมพ์ชื่อครู..."
            options={teacherOptions}
          />
        </Field>
        <Field label="วิชา">
          <Combobox
            key={resetKey}
            name="subjectId"
            required
            placeholder="พิมพ์รหัสหรือชื่อวิชา"
            options={subjectOptions}
          />
        </Field>
        <Field label="ห้องเรียน">
          <Combobox
            key={resetKey}
            name="classId"
            required
            placeholder="พิมพ์ชื่อห้อง..."
            options={classOptions}
          />
        </Field>
        <Field label="ปีการศึกษา">
          <Combobox
            key={resetKey}
            name="yearId"
            required
            placeholder="พิมพ์ปีการศึกษา..."
            options={yearOptions}
          />
        </Field>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <UserCog className="h-4 w-4" />
        {isSubmitting ? "กำลังบันทึก..." : "มอบหมายการสอน"}
      </Button>
    </form>
  );
}
