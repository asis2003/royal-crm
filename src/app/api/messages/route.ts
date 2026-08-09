import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: body.recipientId,
      caseId: body.caseId || null,
      body: body.body,
    },
  });

  await prisma.notification.create({
    data: {
      userId: body.recipientId,
      title: `New message from ${session.user.name}`,
      body: body.body.slice(0, 80),
    },
  });

  return NextResponse.json(message);
}
