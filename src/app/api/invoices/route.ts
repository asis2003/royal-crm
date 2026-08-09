import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  const body = await req.json();

  const amount = Number(body.amount);
  const vatAmount = Math.round(amount * 0.05 * 100) / 100;
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-2026-${1000 + count + 1}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      caseId: body.caseId || null,
      amount,
      vatAmount,
      currency: "AED",
      recurring: body.recurring || "NONE",
      dueDate: new Date(body.dueDate),
      createdById: session.user.id,
      lineItems: {
        create: [{ description: body.description, quantity: 1, unitPrice: amount }],
      },
    },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(req: NextRequest) {
  const session = await requireSession();
  const { id } = await req.json();

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Ownership check: a USER may only delete invoices they created themselves.
  // ADMIN may delete any invoice.
  if (session.user.role !== "ADMIN" && invoice.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.invoice.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  await requireSession();
  const body = await req.json();

  const invoice = await prisma.invoice.update({
    where: { id: body.id },
    data: {
      status: body.status,
      paidDate: body.status === "PAID" ? new Date() : null,
    },
  });

  return NextResponse.json(invoice);
}
