import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有課程
export async function GET() {
  const lessons = await prisma.lesson.findMany();
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
