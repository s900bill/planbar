import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有學生或單一學生不可上課時段
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const student_id = searchParams.get("student_id");
  let unavailableTimes;
  if (student_id) {
    unavailableTimes = await prisma.studentUnavailableTime.findMany({
      where: { student_id },
    });
  } else {
    unavailableTimes = await prisma.studentUnavailableTime.findMany();
  }
  return NextResponse.json(unavailableTimes);
}

// 新增學生不可上課時段（支援多日）
export async function POST(req: NextRequest) {
  const { student_id, dates } = await req.json();
  if (!student_id || !Array.isArray(dates)) {
    return NextResponse.json(
      { error: "student_id 與 dates 必填" },
      { status: 400 }
    );
  }
  // 先刪除該學生所有不可上課日
  await prisma.studentUnavailableTime.deleteMany({ where: { student_id } });
  // 再批次新增
  const created = await prisma.studentUnavailableTime.createMany({
    data: dates.map((date: string) => ({ student_id, date: new Date(date) })),
  });
  return NextResponse.json({ success: true, count: created.count });
}
