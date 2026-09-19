import { CalendarX } from "lucide-react";
import { fmtDateLong, gradeLabel, type GridExam } from "@/lib/exam-query";
import { StudentExamCell } from "@/components/StudentExamCell";

export function ExamScheduleGrid({
  exams,
  mode,
}: {
  exams: GridExam[];
  mode: "view" | "student";
}) {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink-200 px-4 py-12 text-center">
        <CalendarX className="h-8 w-8 text-ink-300" />
        <p className="text-sm text-ink-400">ยังไม่มีตารางสอบ</p>
      </div>
    );
  }

  const dates = [...new Set(exams.map((e) => e.examDate))].sort();
  const grades = [...new Set(exams.map((e) => e.gradeLevel))].sort(
    (a, b) => a - b,
  );

  return (
    <div className="space-y-8">
      {dates.map((date) => {
        const dayExams = exams.filter((e) => e.examDate === date);
        const periods = [
          ...new Set(dayExams.map((e) => `${e.startTime}|${e.endTime}`)),
        ].sort();

        return (
          <div key={date}>
            <h3 className="mb-2 font-heading text-base font-semibold text-ink-900">
              {fmtDateLong(date)}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-ink-100">
              <table className="w-full min-w-120 border-collapse text-sm">
                <thead>
                  <tr className="bg-ink-50">
                    <th className="border-b border-ink-100 px-3 py-2 text-left font-medium text-ink-600">
                      เวลา
                    </th>
                    {grades.map((g) => (
                      <th
                        key={g}
                        className="border-b border-l border-ink-100 px-3 py-2 text-left font-medium text-ink-600"
                      >
                        {gradeLabel(g)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    const [start, end] = period.split("|");
                    return (
                      <tr key={period}>
                        <td className="whitespace-nowrap border-b border-ink-100 px-3 py-2.5 text-ink-400">
                          {start}–{end} น.
                        </td>
                        {grades.map((g) => {
                          const cell = dayExams.find(
                            (e) =>
                              e.gradeLevel === g &&
                              e.startTime === start &&
                              e.endTime === end,
                          );
                          return (
                            <td
                              key={g}
                              className="border-b border-l border-ink-100 px-3 py-2.5"
                            >
                              {cell ? (
                                <ExamCell exam={cell} mode={mode} />
                              ) : (
                                <span className="text-ink-100">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExamCell({
  exam,
  mode,
}: {
  exam: GridExam;
  mode: "view" | "student";
}) {
  return (
    <div className="space-y-1">
      <p className="font-medium text-ink-900">{exam.subjectCode}</p>
      <p className="text-xs text-ink-400">{exam.subjectName}</p>
      {mode === "student" && <StudentExamCell exam={exam} />}
    </div>
  );
}
