"use client";

import { useRef, useState, type FormEvent } from "react";
import { CalendarPlus, AlertCircle } from "lucide-react";
import { createExam } from "@/lib/actions/exams";
import { Field, Input, Select } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import { Button } from "@/components/ui/Button";

type Subject = { subjectId: number; subjectCode: string; subjectName: string };
type ClassOption = { classId: number; className: string; gradeLevel: number };

export function ExamForm({
  subjects,
  classes,
}: {
  subjects: Subject[];
  classes: ClassOption[];
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
      await createExam(new FormData(e.currentTarget));
      formRef.current?.reset();
      setResetKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ชื่อการสอบ">
          <Input
            name="examName"
            required
            placeholder="เช่น สอบปลายภาค 1/2569"
          />
        </Field>

        <Field label="ประเภทข้อสอบ">
          <Select name="examType" defaultValue="final">
            <option value="quiz">Quiz</option>
            <option value="midterm">กลางภาค</option>
            <option value="final">ปลายภาค</option>
            <option value="assignment">ชิ้นงาน</option>
          </Select>
        </Field>

        <Field label="วิชา">
          <Combobox
            key={resetKey}
            name="subjectId"
            required
            placeholder="พิมพ์รหัสหรือชื่อวิชา"
            options={subjects.map((s) => ({
              value: String(s.subjectId),
              label: `${s.subjectCode} · ${s.subjectName}`,
            }))}
          />
        </Field>

        <Field label="แพลตฟอร์ม (ไม่บังคับ)">
          <Input name="platformName" placeholder="เช่น Google Form" />
        </Field>

        <Field label="วันสอบ">
          <Input type="date" name="examDate" required />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="เวลาเริ่ม">
            <Input type="time" name="startTime" required />
          </Field>
          <Field label="เวลาสิ้นสุด">
            <Input type="time" name="endTime" required />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="ลิงก์ (ไม่บังคับ)"
            hint="ถ้าทุกห้องใช้ข้อสอบชุดเดียวกัน กรอกลิงก์นี้ไว้ก่อนได้เลย — ถ้าแต่ละห้องได้ข้อสอบคนละชุด เว้นว่างไว้แล้วไปกรอกทีละห้องในตารางด้านล่าง"
          >
            <Input
              name="sharedLink"
              type="url"
              placeholder="https://forms.gle/..."
            />
          </Field>
        </div>
      </div>

      <Field label="ห้องเรียนที่สอบ">
        <MultiCombobox
          key={resetKey}
          name="classIds"
          placeholder="พิมพ์ชื่อห้อง เช่น ม.4 แล้วเลือกได้หลายห้อง"
          options={classes.map((c) => ({
            value: String(c.classId),
            label: c.className,
          }))}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        <CalendarPlus className="h-4 w-4" />
        {isSubmitting ? "กำลังบันทึก..." : "บันทึกตารางสอบ"}
      </Button>
    </form>
  );
}
