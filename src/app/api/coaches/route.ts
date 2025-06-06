import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有教練
export async function GET() {
  const coaches = await prisma.coach.findMany();
  return NextResponse.json(coaches);
}

// 新增教練
export async function POST(req: NextRequest) {
  const { name, notes } = await req.json();
  const coach = await prisma.coach.create({
    data: { name, notes },
  });
  return NextResponse.json(coach);
}
