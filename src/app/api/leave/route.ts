import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: session.user.id,
      type: body.type,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      reason: body.reason || null,
    },
  });

  return NextResponse.json(leave);
}

export async function PATCH(req: NextRequest) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();

  const leave = await prisma.leaveRequest.update({
    where: { id: body.id },
    data: { status: body.status, approverId: session.user.id },
  });

  return NextResponse.json(leave);
}
