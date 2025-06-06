import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有學生不可上課時段
export async function GET() {
  const unavailableTimes = await prisma.studentUnavailableTime.findMany();
  return NextResponse.json(unavailableTimes);
}

// 新增學生不可上課時段
export async function POST(req: NextRequest) {
  const { student_id, date } = await req.json();
  const unavailableTime = await prisma.studentUnavailableTime.create({
    data: { student_id, date: new Date(date) },
  });
  return NextResponse.json(unavailableTime);
}
