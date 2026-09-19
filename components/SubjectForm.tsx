"use client";

import { useRef, useState, type FormEvent } from "react";
import { BookMarked, AlertCircle } from "lucide-react";
import { createSubject } from "@/lib/actions/subjects";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function SubjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createSubject(new FormData(e.currentTarget));
      formRef.current?.reset();
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="รหัสวิชา">
          <Input name="subjectCode" required placeholder="เช่น ค31101" />
        </Field>
        <Field label="ชื่อวิชา">
          <Input
            name="subjectName"
            required
            placeholder="เช่น คณิตศาสตร์พื้นฐาน 1"
          />
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
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <BookMarked className="h-4 w-4" />
        {isSubmitting ? "กำลังบันทึก..." : "เพิ่มวิชา"}
      </Button>
    </form>
  );
}
