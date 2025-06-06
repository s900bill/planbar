import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得所有教練-學生關聯
export async function GET() {
  const relations = await prisma.coachStudentRelation.findMany();
  return NextResponse.json(relations);
}

// 新增教練-學生關聯
export async function POST(req: NextRequest) {
  const { coach_id, student_id } = await req.json();
  const relation = await prisma.coachStudentRelation.create({
    data: { coach_id, student_id },
  });
  return NextResponse.json(relation);
}
