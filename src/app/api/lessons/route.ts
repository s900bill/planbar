import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有課程（可依 year/month 過濾）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  let lessons;
  if (year && month) {
    // 取得該月的第一天與最後一天
    const y = parseInt(year, 10);
    const m = parseInt(month, 10) - 1; // JS 月份 0-based
    const start = new Date(y, m, 1, 0, 0, 0);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    lessons = await prisma.lesson.findMany({
      where: {
        start_time: { gte: start, lte: end },
      },
    });
  } else {
    lessons = await prisma.lesson.findMany();
  }
  return NextResponse.json(lessons);
}

// 新增課程
export async function POST(req: NextRequest) {
  const { coach_id, student_id, start_time, end_time } = await req.json();
  const lesson = await prisma.lesson.create({
    data: {
      coach_id,
      student_id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    },
  });
  return NextResponse.json(lesson);
}
