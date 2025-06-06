import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得單一教練
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const coach = await prisma.coach.findUnique({
    where: { id: params.id },
  });
  if (!coach) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(coach);
}

// 更新教練
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, notes } = await req.json();
  const coach = await prisma.coach.update({
    where: { id: params.id },
    data: { name, notes },
  });
  return NextResponse.json(coach);
}

// 刪除教練
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.coach.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
