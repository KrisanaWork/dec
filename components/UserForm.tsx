"use client";

import { useRef, useState, type FormEvent } from "react";
import { UserPlus, AlertCircle } from "lucide-react";
import { createUser } from "@/lib/actions/users";
import { Field, Input, Select } from "@/components/ui/Field";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";

type ClassOption = { classId: number; className: string };

export function UserForm({ classes }: { classes: ClassOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<"admin" | "teacher" | "student">("student");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createUser(new FormData(e.currentTarget));
      formRef.current?.reset();
      setRole("student");
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
        <Field label="บทบาท">
          <Select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
          >
            <option value="student">นักเรียน</option>
            <option value="teacher">ครู</option>
            <option value="admin">แอดมิน</option>
          </Select>
        </Field>

        <Field label="ชื่อ">
          <Input name="firstName" required />
        </Field>

        <Field label="ชื่อกลาง (ไม่บังคับ)">
          <Input name="middleName" />
        </Field>

        <Field label="นามสกุล">
          <Input name="lastName" required />
        </Field>

        <Field label="รหัสผู้ใช้ (username)">
          <Input name="username" required minLength={3} />
        </Field>

        <Field label="รหัสผ่านเริ่มต้น">
          <Input name="password" type="text" required minLength={6} />
        </Field>

        <Field label="อีเมล (ไม่บังคับ)">
          <Input name="email" type="email" />
        </Field>

        {role === "teacher" && (
          <>
            <Field label="รหัสครู">
              <Input name="teacherCode" required />
            </Field>
            <Field label="กลุ่มสาระ">
              <Input name="department" />
            </Field>
          </>
        )}

        {role === "student" && (
          <>
            <Field label="รหัสนักเรียน">
              <Input name="studentCode" required />
            </Field>
            <Field label="ห้องเรียน">
              <Combobox
                key={resetKey}
                name="classId"
                required
                placeholder="พิมพ์ชื่อห้อง เช่น ม.4/1"
                options={classes.map((c) => ({
                  value: String(c.classId),
                  label: c.className,
                }))}
              />
            </Field>
          </>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? "กำลังบันทึก..." : "สร้างผู้ใช้"}
      </Button>
    </form>
  );
}
