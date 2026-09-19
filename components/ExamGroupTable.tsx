"use client";

import { useState } from "react";
import { Trash2, Save, ExternalLink, Plus, X } from "lucide-react";
import {
  updateExamClassLink,
  deleteExam,
  addClassToExam,
  removeClassFromExam,
} from "@/lib/actions/exams";
import { Badge } from "@/components/ui/Badge";
import { Combobox } from "@/components/ui/Combobox";

export type ExamGroupRow = {
  examId: number;
  examName: string;
  subjectLabel: string;
  dateLabel: string;
  timeLabel: string;
  classLinks: {
    examClassId: number;
    className: string;
    classId: number;
    examLink: string;
    status: string;
  }[];
};

type ClassOption = { classId: number; className: string };

export function ExamGroupTable({
  groups,
  allClasses = [],
  canManage = false,
}: {
  groups: ExamGroupRow[];
  allClasses?: ClassOption[];
  canManage?: boolean;
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 px-4 py-10 text-center text-sm text-ink-400">
        ยังไม่มีรายการสอบ
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <ExamGroupCard
          key={g.examId}
          group={g}
          allClasses={allClasses}
          canManage={canManage}
        />
      ))}
    </div>
  );
}

function ExamGroupCard({
  group,
  allClasses,
  canManage,
}: {
  group: ExamGroupRow;
  allClasses: ClassOption[];
  canManage: boolean;
}) {
  const [addingClass, setAddingClass] = useState(false);

  const availableClasses = allClasses.filter(
    (c) => !group.classLinks.some((cl) => cl.classId === c.classId),
  );

  async function handleDeleteExam() {
    if (!confirm(`ลบชุดสอบ "${group.examName}" ทั้งหมด (ทุกห้อง)?`)) return;
    await deleteExam(group.examId);
  }

  return (
    <div className="rounded-xl border border-ink-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-ink-50/60 px-4 py-3">
        <div>
          <p className="font-medium text-ink-900">{group.subjectLabel}</p>
          <p className="text-xs text-ink-400">
            {group.examName} · {group.dateLabel} · {group.timeLabel}
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleDeleteExam}
            className="flex items-center gap-1 text-xs text-ink-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ลบชุดสอบนี้
          </button>
        )}
      </div>

      <div className="divide-y divide-ink-100">
        {group.classLinks.map((cl) => (
          <ClassLinkRow
            key={cl.examClassId}
            classLink={cl}
            canManage={canManage}
          />
        ))}

        {canManage && (
          <div className="px-4 py-2.5">
            {addingClass ? (
              <div className="flex items-center gap-2">
                <div className="w-56">
                  <Combobox
                    options={availableClasses.map((c) => ({
                      value: String(c.classId),
                      label: c.className,
                    }))}
                    placeholder="พิมพ์ชื่อห้อง..."
                    onChange={async (v) => {
                      if (v) await addClassToExam(group.examId, Number(v));
                      setAddingClass(false);
                    }}
                    value=""
                  />
                </div>
                <button
                  onClick={() => setAddingClass(false)}
                  className="rounded-md p-1.5 text-ink-300 hover:text-ink-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingClass(true)}
                disabled={availableClasses.length === 0}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-ink-300 disabled:no-underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {availableClasses.length === 0
                  ? "เพิ่มครบทุกห้องแล้ว"
                  : "เพิ่มห้องเข้าชุดสอบนี้"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ClassLinkRow({
  classLink,
  canManage,
}: {
  classLink: ExamGroupRow["classLinks"][number];
  canManage: boolean;
}) {
  const [link, setLink] = useState(classLink.examLink);
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await updateExamClassLink(classLink.examClassId, link);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm(`ถอดห้อง "${classLink.className}" ออกจากชุดสอบนี้?`)) return;
    await removeClassFromExam(classLink.examClassId);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
      <span className="w-16 shrink-0 text-sm font-medium text-ink-900">
        {classLink.className}
      </span>

      <div className="flex min-w-60 flex-1 items-center gap-1.5">
        <input
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setSaved(false);
          }}
          placeholder="https://forms.gle/..."
          className="w-full rounded-md border border-ink-100 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          title="บันทึกลิงก์"
          className="shrink-0 rounded-md bg-brand-500 p-1.5 text-white disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
        </button>
        {classLink.examLink && (
          <a
            href={classLink.examLink}
            target="_blank"
            rel="noreferrer"
            title="เปิดลิงก์"
            className="shrink-0 rounded-md p-1.5 text-ink-400 hover:text-brand-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <Badge tone={classLink.status === "published" ? "success" : "neutral"}>
        {classLink.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
      </Badge>

      {canManage && (
        <button
          onClick={handleRemove}
          title="ถอดห้องนี้ออก"
          className="rounded-md p-1.5 text-ink-300 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {error && <p className="w-full text-xs text-brand-700">{error}</p>}
    </div>
  );
}
