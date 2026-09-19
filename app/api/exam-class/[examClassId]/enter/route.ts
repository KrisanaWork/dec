import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examClassId: string }> },
) {
  const { examClassId: examClassIdParam } = await params;
  const examClassId = Number(examClassIdParam);
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const student = await prisma.student.findUnique({
    where: { userId: Number(session.user.id) },
  });
  if (!student) {
    return NextResponse.redirect(new URL("/dashboard/student", request.url));
  }

  const examClass = await prisma.examClass.findUnique({
    where: { id: examClassId },
    include: { exam: true },
  });

  const now = new Date();
  const belongsToStudent = examClass?.classId === student.classId;
  const inWindow = examClass
    ? now >= examClass.exam.startTime && now <= examClass.exam.endTime
    : false;
  const isOpen =
    !!examClass &&
    examClass.status === "published" &&
    belongsToStudent &&
    inWindow;

  if (!isOpen || !examClass) {
    return NextResponse.redirect(
      new URL("/dashboard/student?error=not_allowed", request.url),
    );
  }

  await prisma.examAccessLog.create({
    data: {
      examClassId: examClass.id,
      studentId: student.studentId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      deviceInfo: request.headers.get("user-agent") ?? undefined,
    },
  });

  return NextResponse.redirect(examClass.examLink);
}
