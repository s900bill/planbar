import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// 取得單一教練-學生關聯
export async function GET(
  req: NextRequest,
  { params }: { params: { coach_id: string; student_id: string } }
) {
  const relation = await prisma.coachStudentRelation.findUnique({
    where: {
      coach_id_student_id: {
        coach_id: params.coach_id,
        student_id: params.student_id,
      },
    },
  });
  if (!relation)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(relation);
}

// 刪除教練-學生關聯
export async function DELETE(
  req: NextRequest,
  { params }: { params: { coach_id: string; student_id: string } }
) {
  await prisma.coachStudentRelation.delete({
    where: {
      coach_id_student_id: {
        coach_id: params.coach_id,
        student_id: params.student_id,
      },
    },
  });
  return NextResponse.json({ success: true });
}
