import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得單一學生
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
  });
  if (!student)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(student);
}

// 更新學生
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, phone, member_id, notes } = await req.json();
  const student = await prisma.student.update({
    where: { id: params.id },
    data: { name, phone, member_id, notes },
  });
  return NextResponse.json(student);
}

// 刪除學生
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.student.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
