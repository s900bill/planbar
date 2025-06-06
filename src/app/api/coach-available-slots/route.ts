import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有教練可授課時段
export async function GET() {
  const slots = await prisma.coachAvailableSlot.findMany();
  return NextResponse.json(slots);
}

// 新增教練可授課時段
export async function POST(req: NextRequest) {
  const { coach_id, date, start_time, end_time } = await req.json();
  const slot = await prisma.coachAvailableSlot.create({
    data: {
      coach_id,
      date: new Date(date),
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    },
  });
  return NextResponse.json(slot);
}
