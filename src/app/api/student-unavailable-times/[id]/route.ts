import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得單一學生不可上課時段
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unavailableTime = await prisma.studentUnavailableTime.findUnique({
    where: { id: params.id },
  });
  if (!unavailableTime)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(unavailableTime);
}

// 更新學生不可上課時段
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { date } = await req.json();
  const unavailableTime = await prisma.studentUnavailableTime.update({
    where: { id: params.id },
    data: { date: new Date(date) },
  });
  return NextResponse.json(unavailableTime);
}

// 刪除學生不可上課時段
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.studentUnavailableTime.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
