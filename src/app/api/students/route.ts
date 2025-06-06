import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有學生
export async function GET() {
  const students = await prisma.student.findMany();
  return NextResponse.json(students);
}

// 新增學生
export async function POST(req: NextRequest) {
  const { name, phone, member_id, notes } = await req.json();
  const student = await prisma.student.create({
    data: { name, phone, member_id, notes },
  });
  return NextResponse.json(student);
}
