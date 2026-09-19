"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { GridExam } from "@/lib/exam-query";

type Phase = "not-published" | "waiting" | "open" | "closed";

function getPhase(exam: GridExam, now: number): Phase {
  if (exam.status !== "published") return "not-published";
  const start = new Date(exam.startAt).getTime();
  const end = new Date(exam.endAt).getTime();
  if (now < start) return "waiting";
  if (now > end) return "closed";
  return "open";
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function StudentExamCell({ exam }: { exam: GridExam }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const phase =
    now === null ? (exam.isOpen ? "open" : "waiting") : getPhase(exam, now);

  if (phase === "open") {
    return (
      <Link
        href={`/api/exam-class/${exam.examClassId}/enter`}
        target="_blank"
        className="mt-1 inline-flex items-center gap-1 rounded-md bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
      >
        เข้าสอบ
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    );
  }

  if (phase === "waiting" && now !== null) {
    const start = new Date(exam.startAt).getTime();
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Clock className="h-3 w-3" />
        เปิดในอีก {formatCountdown(start - now)}
      </span>
    );
  }

  return (
    <span className="mt-1 inline-block rounded-md bg-ink-50 px-2.5 py-1 text-xs text-ink-400">
      {phase === "closed" ? "ปิดรับเข้าสอบ" : "ยังไม่เปิด"}
    </span>
  );
}
