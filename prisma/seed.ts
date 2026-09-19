import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const year = await prisma.academicYear.upsert({
    where: { yearId: 1 },
    update: {},
    create: {
      yearName: "2569",
      semester: 1,
      startDate: new Date("2026-05-18"),
      endDate: new Date("2026-10-25"),
      isCurrent: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { username: "23646" },
    update: {},
    create: {
      username: "23646",
      passwordHash: await bcrypt.hash("23646", 12),
      role: "admin",
      fullName: "ผู้ดูแลระบบ",
      email: "krisana.skwn@gmail.com",
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { username: "105" },
    update: {},
    create: {
      username: "105",
      passwordHash: await bcrypt.hash("105", 12),
      role: "teacher",
      fullName: "นางกุสะลิน  มูลกัน",
      email: null,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.userId },
    update: {},
    create: {
      userId: teacherUser.userId,
      teacherCode: "105",
      department: "ภาษาไทย",
      titleName: "นาง",
      firstName: "กุสะลิน",
      middleName: null,
      lastName: "มูลกัน",
    },
  });

  const klass = await prisma.class.upsert({
    where: { classId: 1 },
    update: {},
    create: {
      className: "ม. 1/1",
      gradeLevel: 7,
      yearId: year.yearId,
      homeroomTeacherId: teacher.teacherId,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { username: "6975" },
    update: {},
    create: {
      username: "6975",
      passwordHash: await bcrypt.hash("6975", 12),
      role: "student",
      fullName: "เด็กชายกตัญญู  ความหมั่น",
      email: null,
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.userId },
    update: {},
    create: {
      userId: studentUser.userId,
      studentCode: "6975",
      classId: klass.classId,
      studentNo: 1,
      titleName: "เด็กชาย",
      firstName: "กตัญญู",
      middleName: null,
      lastName: "ความหมั่น",
    },
  });

  console.log("เพิ่มข้อมูลตัวอย่างสำเร็จ");
  console.log([
    { username: adminUser.username, role: adminUser.role },
    { username: teacherUser.username, role: teacherUser.role },
    { username: studentUser.username, role: studentUser.role },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
