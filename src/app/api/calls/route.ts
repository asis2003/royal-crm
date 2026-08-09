import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();

  const call = await prisma.callLog.create({
    data: {
      loggedById: session.user.id,
      caseId: body.caseId || null,
      contactName: body.contactName,
      direction: body.direction,
      durationMin: body.durationMin ? Number(body.durationMin) : null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(call);
}
