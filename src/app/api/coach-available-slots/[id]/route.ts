import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得單一教練可授課時段
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const slot = await prisma.coachAvailableSlot.findUnique({
    where: { id: params.id },
  });
  if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(slot);
}

// 更新教練可授課時段
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { date, start_time, end_time } = await req.json();
  const slot = await prisma.coachAvailableSlot.update({
    where: { id: params.id },
    data: {
      date: new Date(date),
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    },
  });
  return NextResponse.json(slot);
}

// 刪除教練可授課時段
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.coachAvailableSlot.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
