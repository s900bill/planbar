import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得單一課程
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
  });
  if (!lesson)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lesson);
}

// 更新課程
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { coach_id, student_id, start_time, end_time } = await req.json();
  const lesson = await prisma.lesson.update({
    where: { id: params.id },
    data: {
      coach_id,
      student_id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    },
  });
  return NextResponse.json(lesson);
}

// 刪除課程
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
